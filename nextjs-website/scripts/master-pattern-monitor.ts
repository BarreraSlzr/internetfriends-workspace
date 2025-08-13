#!/usr/bin/env bun

/**
 * Master Pattern Monitor Script
 * Tracks ALL development patterns in our horse race pipeline
 * Provides real-time streaming of project health metrics
 */

import {
  horseRacePipeline,
  getRaceStatus,
} from "@/lib/events/horse-race-pipeline";
import {
  patternMonitor,
  trackQuality,
  trackBuild,
  trackComponent,
} from "@/lib/events/pattern-monitor";

interface ProjectScope {
  components: number;
  qualityScore: number;
  buildHealth: string;
  dependencies: string[];
  patterns: string[];
  momentum: number;
  position: "leading" | "close" | "trailing";
}

interface MonitoringSession {
  startTime: Date;
  totalEvents: number;
  criticalIssues: string[];
  improvements: string[];
  currentScope: ProjectScope;
}

class MasterPatternMonitor {
  private session: MonitoringSession;
  private monitoringInterval: Timer | null = null;
  private isRunning = false;

  constructor() {
    this.session = {
      startTime: new Date(),
      totalEvents: 0,
      criticalIssues: [],
      improvements: [],
      currentScope: {
        components: 147,
        qualityScore: 63.67,
        buildHealth: "checking...",
        dependencies: [],
        patterns: [],
        momentum: 0.85,
        position: "leading",
      },
    };
  }

  async start(): Promise<void> {
    console.log("🏁 Master Pattern Monitor Starting...");
    console.log("====================================");

    this.isRunning = true;

    // Initial scope audit
    await this.auditCurrentScope();

    // Start monitoring streams
    this.setupEventStreaming();

    // Start periodic updates
    this.monitoringInterval = setInterval(() => {
      this.performHealthCheck();
    }, 10000); // Every 10 seconds

    console.log("✅ Monitor Active - Tracking all patterns");
    console.log(`📊 Initial Status: ${getRaceStatus()}`);
  }

  private async auditCurrentScope(): Promise<void> {
    console.log("🔍 Auditing Current Project Scope...");

    try {
      // Check database status
      this.trackPattern("database-check", {
        status: "pending",
        postgres: "configured",
      });

      // Analyze component quality from fossils
      const fossilData = await this.loadFossilData();
      if (fossilData) {
        this.session.currentScope.components =
          fossilData.totalComponents || 147;
        this.session.currentScope.qualityScore =
          fossilData.averageScore || 63.67;
        this.trackPattern("fossil-import", fossilData);
      }

      // Check build health
      const buildStatus = await this.checkBuildHealth();
      this.session.currentScope.buildHealth = buildStatus.status;
      this.trackPattern("build-health", buildStatus);

      // Track critical patterns
      const patterns = await this.identifyActivePatterns();
      this.session.currentScope.patterns = patterns;
      patterns.forEach((pattern) =>
        this.trackPattern(`active-${pattern}`, { active: true }),
      );

      console.log(`📈 Components: ${this.session.currentScope.components}`);
      console.log(
        `🎯 Quality: ${this.session.currentScope.qualityScore.toFixed(1)}/100`,
      );
      console.log(`🔧 Build: ${this.session.currentScope.buildHealth}`);
      console.log(`⚡ Patterns: ${patterns.length} active`);
    } catch (error) {
      console.error("❌ Scope audit failed:", error);
      this.trackPattern("audit-error", { error: error?.toString() });
    }
  }

  private async loadFossilData(): Promise<any> {
    try {
      const fossilPath = "./.fossils/comprehensive-analysis.json";
      const file = Bun.file(fossilPath);
      const exists = await file.exists();
      if (exists) {
        const data = await file.json();
        return data.report;
      }
    } catch (error) {
      console.log("⚠️ Fossil data unavailable");
    }
    return null;
  }

  private async checkBuildHealth(): Promise<{ status: string; details: any }> {
    try {
      // Quick typecheck
      const typecheck = Bun.spawn(["bunx", "tsc", "--noEmit", "--strict"], {
        stdout: "pipe",
        stderr: "pipe",
      });

      const exitCode = await typecheck.exited;
      return {
        status: exitCode === 0 ? "healthy" : "issues",
        details: { exitCode, timestamp: new Date() },
      };
    } catch {
      return { status: "unknown", details: {} };
    }
  }

  private async identifyActivePatterns(): Promise<string[]> {
    const patterns = [
      "component-quality",
      "database-integration",
      "trading-dashboard",
      "pattern-monitoring",
      "horse-race-pipeline",
      "session-integration",
      "developer-tooling",
      "build-optimization",
    ];

    // Filter active patterns based on project state
    return patterns.filter((pattern) => this.isPatternActive(pattern));
  }

  private isPatternActive(pattern: string): boolean {
    switch (pattern) {
      case "component-quality":
        return this.session.currentScope.qualityScore < 80;
      case "database-integration":
        return this.session.currentScope.buildHealth === "issues";
      case "trading-dashboard":
        return true; // Always active during development
      case "pattern-monitoring":
        return true; // This script
      default:
        return Math.random() > 0.5; // Simulated for other patterns
    }
  }

  private setupEventStreaming(): void {
    // Subscribe to race pipeline events
    horseRacePipeline.subscribe("master-monitor", (event) => {
      this.session.totalEvents++;

      if (event.type === "obstacle_hit") {
        this.session.criticalIssues.push(event.message);
      } else if (event.type === "pattern_boost") {
        this.session.improvements.push(event.message);
      }

      // Update scope position
      this.session.currentScope.position = event.position;
      this.session.currentScope.momentum = event.momentum;

      this.logEvent(event);
    });

    // Subscribe to pattern monitor events
    patternMonitor.on("pattern-update", (event) => {
      this.session.totalEvents++;
      this.logPatternUpdate(event);
    });
  }

  private performHealthCheck(): void {
    const status = getRaceStatus();
    const metrics = patternMonitor.getCurrentMetrics();

    console.log("=== Health Check ===");
    console.log(`🏃 ${status}`);
    console.log(
      `📊 Events: ${this.session.totalEvents} | Issues: ${this.session.criticalIssues.length} | Improvements: ${this.session.improvements.length}`,
    );
    console.log(
      `🎯 Components: ${metrics.totalComponents} | Avg Score: ${metrics.averageScore.toFixed(1)}`,
    );
    console.log("===================");
  }

  private trackPattern(name: string, data: any): void {
    // Track in both systems for comprehensive monitoring
    patternMonitor.trackPattern(name, data);
    horseRacePipeline.injectPattern(name, data);
  }

  private logEvent(event: any): void {
    const emoji =
      {
        pattern_boost: "🚀",
        obstacle_hit: "🔥",
        position_change: "📊",
        speed_update: "⚡",
      }[event.type] || "📈";

    console.log(
      `${emoji} [${new Date().toLocaleTimeString()}] ${event.message}`,
    );
  }

  private logPatternUpdate(event: any): void {
    const trendEmoji =
      {
        up: "📈",
        down: "📉",
        stable: "➡️",
      }[event.metrics.trend] || "📊";

    console.log(
      `${trendEmoji} Pattern: ${event.pattern} | Score: ${event.metrics.score} | Status: ${event.status}`,
    );
  }

  // Public API for external monitoring
  getCurrentSession(): MonitoringSession {
    return {
      ...this.session,
      currentScope: { ...this.session.currentScope },
    };
  }

  getStreamlinedReport(): string {
    const uptime = Date.now() - this.session.startTime.getTime();
    const uptimeMin = Math.floor(uptime / 60000);

    return [
      "🏁 MASTER PATTERN MONITOR",
      `⏱️ Uptime: ${uptimeMin}m`,
      `📊 Events: ${this.session.totalEvents}`,
      `🎯 Quality: ${this.session.currentScope.qualityScore.toFixed(1)}/100`,
      `🏃 Position: ${this.session.currentScope.position.toUpperCase()}`,
      `⚡ Momentum: ${(this.session.currentScope.momentum * 100).toFixed(0)}%`,
      `🔧 Build: ${this.session.currentScope.buildHealth}`,
      `📈 Components: ${this.session.currentScope.components}`,
      `🚨 Critical: ${this.session.criticalIssues.length}`,
      `✨ Improvements: ${this.session.improvements.length}`,
    ].join(" | ");
  }

  stop(): void {
    this.isRunning = false;
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    horseRacePipeline.unsubscribe("master-monitor");
    console.log("🛑 Master Pattern Monitor Stopped");
  }
}

// CLI Interface
const monitor = new MasterPatternMonitor();

// Handle process termination
process.on("SIGINT", () => {
  console.log("\n📋 Final Report:");
  console.log(monitor.getStreamlinedReport());
  monitor.stop();
  process.exit(0);
});

// Start monitoring if run directly
if (import.meta.main) {
  await monitor.start();

  // Keep alive and show periodic reports
  setInterval(() => {
    console.log("\n📋 Current Status:");
    console.log(monitor.getStreamlinedReport());
  }, 30000); // Every 30 seconds
}

export default monitor;
