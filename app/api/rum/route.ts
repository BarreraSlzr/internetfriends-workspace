import { NextRequest, NextResponse } from "next/server";
import {
  writeFileSync,
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
} from "fs";
import { join } from "path";

interface RUMPayload {
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid_like?: number;
  inp?: number;
  navType?: string;
  url?: string;
  userAgent?: string;
  connectionType?: string;
  deviceMemory?: number;
  timestamp?: number;
  sessionId?: string;
  userId?: string;
}

interface RUMMetrics extends RUMPayload {
  timestamp: number;
  url: string;
  userAgent: string;
  ip?: string;
  country?: string;
  epic?: string;
}

// Rate limiting store (in production, use Redis)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // Max requests per minute per IP

function isValidMetric(value: any): boolean {
  return (
    typeof value === "number" &&
    !isNaN(value) &&
    isFinite(value) &&
    value >= 0 &&
    value < 60000
  ); // Max 60 seconds for timing metrics
}

function sanitizePayload(payload: any): RUMPayload | null {
  const sanitized: RUMPayload = {};

  // Validate and sanitize timing metrics
  if (payload.ttfb !== undefined && isValidMetric(payload.ttfb)) {
    sanitized.ttfb = Math.round(payload.ttfb);
  }
  if (payload.fcp !== undefined && isValidMetric(payload.fcp)) {
    sanitized.fcp = Math.round(payload.fcp);
  }
  if (payload.lcp !== undefined && isValidMetric(payload.lcp)) {
    sanitized.lcp = Math.round(payload.lcp);
  }
  if (payload.inp !== undefined && isValidMetric(payload.inp)) {
    sanitized.inp = Math.round(payload.inp);
  }
  if (payload.fid_like !== undefined && isValidMetric(payload.fid_like)) {
    sanitized.fid_like = Math.round(payload.fid_like);
  }

  // CLS is different - should be between 0 and 1
  if (
    payload.cls !== undefined &&
    typeof payload.cls === "number" &&
    !isNaN(payload.cls) &&
    payload.cls >= 0 &&
    payload.cls <= 5
  ) {
    // Allow up to 5 for extreme cases
    sanitized.cls = Math.round(payload.cls * 10000) / 10000; // 4 decimal precision
  }

  // Validate string fields
  if (
    payload.navType &&
    typeof payload.navType === "string" &&
    payload.navType.length < 50
  ) {
    sanitized.navType = payload.navType;
  }
  if (
    payload.url &&
    typeof payload.url === "string" &&
    payload.url.length < 500
  ) {
    sanitized.url = payload.url;
  }
  if (
    payload.sessionId &&
    typeof payload.sessionId === "string" &&
    payload.sessionId.length < 100
  ) {
    sanitized.sessionId = payload.sessionId;
  }
  if (
    payload.userId &&
    typeof payload.userId === "string" &&
    payload.userId.length < 100
  ) {
    sanitized.userId = payload.userId;
  }

  // Connection info
  if (
    payload.connectionType &&
    typeof payload.connectionType === "string" &&
    payload.connectionType.length < 20
  ) {
    sanitized.connectionType = payload.connectionType;
  }
  if (
    payload.deviceMemory &&
    isValidMetric(payload.deviceMemory) &&
    payload.deviceMemory <= 32
  ) {
    sanitized.deviceMemory = payload.deviceMemory;
  }

  return sanitized;
}

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const key = ip;

  const current = rateLimitMap.get(key);

  if (!current || now > current.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return false;
  }

  current.count++;
  return true;
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  return "unknown";
}

function getCurrentEpic(): string | undefined {
  // Try to determine current epic from git or environment
  try {
    const { execSync } = require("child_process");
    const branch = execSync("git rev-parse --abbrev-ref HEAD", {
      encoding: "utf8",
    }).trim();

    if (branch.startsWith("epic/")) {
      return branch.replace("epic/", "");
    }

    // Check for epic in branch description or environment
    if (process.env.CURRENT_EPIC) {
      return process.env.CURRENT_EPIC;
    }
  } catch (error) {
    // Silently ignore git errors
  }

  return undefined;
}

function saveMetrics(metrics: RUMMetrics): void {
  const rumDir = join(process.cwd(), "scripts/perf/artifacts/rum");

  if (!existsSync(rumDir)) {
    mkdirSync(rumDir, { recursive: true });
  }

  // Daily log files
  const today = new Date().toISOString().split("T")[0];
  const logFile = join(rumDir, `rum_${today}.jsonl`);

  // Append as JSONL (JSON Lines) format for easy processing
  const logLine = JSON.stringify(metrics) + "\n";
  appendFileSync(logFile, logLine);

  // Also maintain a recent metrics file for quick access
  const recentFile = join(rumDir, "recent_metrics.json");
  const recentMetrics = [];

  if (existsSync(recentFile)) {
    try {
      const existing = JSON.parse(readFileSync(recentFile, "utf8"));
      recentMetrics.push(...existing);
    } catch (error) {
      // Ignore parse errors for recent file
    }
  }

  recentMetrics.push(metrics);

  // Keep only last 100 entries
  if (recentMetrics.length > 100) {
    recentMetrics.splice(0, recentMetrics.length - 100);
  }

  writeFileSync(recentFile, JSON.stringify(recentMetrics, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIP = getClientIP(request);
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 },
      );
    }

    // Parse and validate payload
    const payload = await request.json();
    const sanitized = sanitizePayload(payload);

    if (!sanitized || Object.keys(sanitized).length === 0) {
      return NextResponse.json(
        { error: "Invalid or empty metrics payload" },
        { status: 400 },
      );
    }

    // Build complete metrics object
    const metrics: RUMMetrics = {
      ...sanitized,
      timestamp: Date.now(),
      url:
        sanitized.url || request.nextUrl.searchParams.get("url") || "unknown",
      userAgent: request.headers.get("user-agent") || "unknown",
      ip: process.env.NODE_ENV === "development" ? clientIP : undefined, // Only in dev
      epic: getCurrentEpic(),
    };

    // Add country from CF headers if available
    const country = request.headers.get("cf-ipcountry");
    if (country && country !== "XX") {
      metrics.country = country;
    }

    // Save metrics
    saveMetrics(metrics);

    // Log significant performance issues
    if (metrics.lcp && metrics.lcp > 4000) {
      console.warn(`🐌 Slow LCP detected: ${metrics.lcp}ms on ${metrics.url}`);
    }
    if (metrics.cls && metrics.cls > 0.25) {
      console.warn(`📐 High CLS detected: ${metrics.cls} on ${metrics.url}`);
    }
    if (metrics.fcp && metrics.fcp > 3000) {
      console.warn(`🎨 Slow FCP detected: ${metrics.fcp}ms on ${metrics.url}`);
    }

    return NextResponse.json({
      status: "ok",
      timestamp: metrics.timestamp,
      epic: metrics.epic,
    });
  } catch (error) {
    console.error("RUM endpoint error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function GET(request: NextRequest) {
  // Simple health check and recent metrics endpoint
  try {
    const rumDir = join(process.cwd(), "scripts/perf/artifacts/rum");
    const recentFile = join(rumDir, "recent_metrics.json");

    if (existsSync(recentFile)) {
      const recentMetrics = JSON.parse(readFileSync(recentFile, "utf8"));

      // Calculate some basic stats
      const count = recentMetrics.length;
      const avgLCP =
        recentMetrics
          .filter((m: any) => m.lcp)
          .reduce((sum: number, m: any) => sum + m.lcp, 0) /
        Math.max(1, recentMetrics.filter((m: any) => m.lcp).length);

      const avgCLS =
        recentMetrics
          .filter((m: any) => m.cls)
          .reduce((sum: number, m: any) => sum + m.cls, 0) /
        Math.max(1, recentMetrics.filter((m: any) => m.cls).length);

      return NextResponse.json({
        status: "healthy",
        epic: getCurrentEpic(),
        stats: {
          recent_count: count,
          avg_lcp: Math.round(avgLCP),
          avg_cls: Math.round(avgCLS * 10000) / 10000,
          timestamp: new Date().toISOString(),
        },
      });
    }

    return NextResponse.json({
      status: "healthy",
      epic: getCurrentEpic(),
      stats: { recent_count: 0 },
    });
  } catch (error) {
    console.error("RUM health check error:", error);
    return NextResponse.json({ error: "Health check failed" }, { status: 500 });
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
