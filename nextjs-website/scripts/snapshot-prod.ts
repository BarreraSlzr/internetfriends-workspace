#!/usr/bin/env bun
/**
 * snapshot-prod.ts
 * InternetFriends Production Snapshot Script
 *
 * Captures a point-in-time snapshot of the production deployment
 * (HTML + optional JSON endpoints) and stores it under:
 *
 *   snapshots/prod/<timestamp>/
 *
 * Artifacts:
 *   - index.html
 *   - <path>.html (for additional HTML routes)
 *   - api-<sanitized-path>.json (for JSON endpoints)
 *   - summary.json (metadata + hashes + basic heuristics)
 *
 * Usage:
 *   bun run scripts/snapshot-prod.ts
 *   bun run scripts/snapshot-prod.ts --origin=https://internetfriends.xyz
 *   bun run scripts/snapshot-prod.ts --routes=/,/about,/contact
 *   bun run scripts/snapshot-prod.ts --api=/api/health,/api/stats
 *   bun run scripts/snapshot-prod.ts --no-api
 *   bun run scripts/snapshot-prod.ts --json-only
 *
 * Flags:
 *   --origin=<url>          Override production origin (default: https://internetfriends.xyz)
 *   --routes=<csv>          Comma-separated HTML route paths (default: "/")
 *   --api=<csv>             Comma-separated API endpoints to snapshot (default: "/api/health")
 *   --no-api                Skip API endpoints entirely
 *   --timeout=<ms>          Fetch timeout per request (default: 10000)
 *   --json-only             Print summary JSON only (silence human formatting)
 *   --tag=<label>           Optional tag label stored in summary
 *
 * Exit Codes:
 *   0 success (even if some endpoints failed; failures recorded in summary)
 *   1 unexpected internal error (script-level failure)
 *
 * Future Extensions:
 *   - Lighthouse integration (generate performance JSON)
 *   - Visual snapshot diffing (Playwright screenshots)
 *   - HTML normalization (strip dynamic timestamps)
 *   - Heuristic diff against previous snapshot
 */

import * as fs from "fs";
import * as path from "path";
import crypto from "crypto";

interface RouteSnapshot {
  type: "html" | "api";
  path: string;
  status: number;
  ok: boolean;
  file: string | null;
  hash: string | null;
  bytes: number | null;
  error?: string;
  contentType?: string | null;
  meta?: {
    title?: string | null;
    metaTagCount?: number;
  };
}

interface Summary {
  origin: string;
  timestamp: string;
  tag?: string;
  outDir: string;
  routes: RouteSnapshot[];
  stats: {
    total: number;
    success: number;
    failed: number;
    htmlCount: number;
    apiCount: number;
    totalBytes: number;
  };
  heuristics: {
    htmlLengthDeltaPct?: number; // (only meaningful when diffing in a future script)
  };
  notes: string[];
  tool: {
    script: string;
    version: string;
    runtime: {
      bun?: string;
      node: string;
    };
  };
}

function getFlag(name: string): string | undefined {
  const prefix = `--${name}=`;
  const arg = process.argv.find(a => a.startsWith(prefix));
  return arg ? arg.slice(prefix.length) : undefined;
}

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`) || process.argv.includes(`--${name}=true`);
}

const PROD_ORIGIN = getFlag("origin") || "https://internetfriends.xyz";
const ROUTES = (getFlag("routes") || "/")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

const NO_API = hasFlag("no-api");
const API_ENDPOINTS = NO_API
  ? []
  : (getFlag("api") || "/api/health")
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

const TIMEOUT_MS = parseInt(getFlag("timeout") || "10000", 10);
const JSON_ONLY = hasFlag("json-only");
const TAG = getFlag("tag");

const TIMESTAMP = new Date().toISOString().replace(/[:.]/g, "-");
const OUT_DIR = path.join("snapshots", "prod", TIMESTAMP);

function ensureDir(p: string) {
  fs.mkdirSync(p, { recursive: true });
}

function sha256(content: string | Buffer) {
  return crypto.createHash("sha256").update(content).digest("hex");
}

async function fetchWithTimeout(url: string, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const to = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { signal: controller.signal });
  } finally {
    clearTimeout(to);
  }
}

function sanitizePath(p: string): string {
  if (p === "/") return "index";
  return p.replace(/^\//, "").replace(/[^a-zA-Z0-9_.-]/g, "_") || "root";
}

function extractBasicHtmlMeta(html: string) {
  let title: string | null = null;
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  if (titleMatch) title = titleMatch[1].trim();
  const metaTagCount = (html.match(/<meta\s/gi) || []).length;
  return { title, metaTagCount };
}

async function snapshotHtml(route: string): Promise<RouteSnapshot> {
  const url = PROD_ORIGIN.replace(/\/$/, "") + route;
  try {
    const res = await fetchWithTimeout(url, TIMEOUT_MS);
    const status = res.status;
    const ok = res.ok;
    const text = await res.text();
    const hash = sha256(text);
    const fileBase = sanitizePath(route) + ".html";
    const filePath = path.join(OUT_DIR, fileBase);
    fs.writeFileSync(filePath, text, "utf-8");
    const meta = extractBasicHtmlMeta(text);
    return {
      type: "html",
      path: route,
      status,
      ok,
      file: filePath,
      hash,
      bytes: Buffer.byteLength(text),
      contentType: res.headers.get("content-type"),
      meta
    };
  } catch (e: any) {
    return {
      type: "html",
      path: route,
      status: 0,
      ok: false,
      file: null,
      hash: null,
      bytes: null,
      error: e?.message || "Unknown error"
    };
  }
}

async function snapshotApi(endpoint: string): Promise<RouteSnapshot> {
  const url = PROD_ORIGIN.replace(/\/$/, "") + endpoint;
  try {
    const res = await fetchWithTimeout(url, TIMEOUT_MS);
    const status = res.status;
    const ok = res.ok;
    let text: string;
    let jsonParsed: any = null;
    const contentType = res.headers.get("content-type") || "";
    if (/application\/json/i.test(contentType)) {
      try {
        jsonParsed = await res.json();
        text = JSON.stringify(jsonParsed, null, 2);
      } catch {
        text = await res.text();
      }
    } else {
      text = await res.text();
    }
    const hash = sha256(text);
    const fileBase = "api-" + sanitizePath(endpoint) + ".json";
    const filePath = path.join(OUT_DIR, fileBase);
    fs.writeFileSync(filePath, text, "utf-8");
    return {
      type: "api",
      path: endpoint,
      status,
      ok,
      file: filePath,
      hash,
      bytes: Buffer.byteLength(text),
      contentType,
    };
  } catch (e: any) {
    return {
      type: "api",
      path: endpoint,
      status: 0,
      ok: false,
      file: null,
      hash: null,
      bytes: null,
      error: e?.message || "Unknown error"
    };
  }
}

async function main() {
  ensureDir(OUT_DIR);

  const notes: string[] = [];
  if (NO_API) {
    notes.push("API snapshot disabled via --no-api");
  }

  const htmlSnapshots = await Promise.all(ROUTES.map(r => snapshotHtml(r)));
  const apiSnapshots = await Promise.all(API_ENDPOINTS.map(e => snapshotApi(e)));

  const all = [...htmlSnapshots, ...apiSnapshots];
  let totalBytes = 0;
  let success = 0;
  let failed = 0;
  for (const r of all) {
    if (r.ok) success++;
    else failed++;
    if (r.bytes) totalBytes += r.bytes;
  }

  const summary: Summary = {
    origin: PROD_ORIGIN,
    timestamp: new Date().toISOString(),
    tag: TAG,
    outDir: OUT_DIR,
    routes: all,
    stats: {
      total: all.length,
      success,
      failed,
      htmlCount: htmlSnapshots.length,
      apiCount: apiSnapshots.length,
      totalBytes
    },
    heuristics: {},
    notes,
    tool: {
      script: "snapshot-prod.ts",
      version: "0.1.0",
      runtime: {
        bun: (globalThis as any).Bun?.version,
        node: process.version
      }
    }
  };

  const summaryPath = path.join(OUT_DIR, "summary.json");
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2), "utf-8");

  if (JSON_ONLY) {
    console.log(JSON.stringify(summary, null, 2));
    return;
  }

  // Human-friendly output
  console.log("Production Snapshot Complete");
  console.log("------------------------------------------------");
  console.log(`Origin:           ${summary.origin}`);
  console.log(`Timestamp:        ${summary.timestamp}`);
  if (TAG) console.log(`Tag:              ${TAG}`);
  console.log(`Output Directory: ${OUT_DIR}`);
  console.log("");
  console.log("Routes:");
  for (const r of summary.routes) {
    const statusStr = r.ok ? "OK" : "FAIL";
    const metaExtra =
      r.type === "html" && r.meta
        ? ` title="${r.meta.title || "-"}" metaTags=${r.meta.metaTagCount}`
        : "";
    console.log(
      `  [${r.type}] ${r.path} -> ${statusStr} status=${r.status} hash=${r.hash?.slice(
        0,
        12
      )} bytes=${r.bytes}${metaExtra}${r.error ? " error=" + r.error : ""}`
    );
  }
  console.log("");
  console.log("Stats:");
  console.log(`  Total:    ${summary.stats.total}`);
  console.log(`  Success:  ${summary.stats.success}`);
  console.log(`  Failed:   ${summary.stats.failed}`);
  console.log(`  HTML:     ${summary.stats.htmlCount}`);
  console.log(`  API:      ${summary.stats.apiCount}`);
  console.log(`  Bytes:    ${summary.stats.totalBytes}`);
  console.log("");
  if (notes.length) {
    console.log("Notes:");
    for (const n of notes) console.log("  - " + n);
    console.log("");
  }
  console.log("Summary JSON:", summaryPath);
  console.log("Done.");
}

main().catch(err => {
  console.error("Snapshot failed:", err);
  process.exit(1);
});
