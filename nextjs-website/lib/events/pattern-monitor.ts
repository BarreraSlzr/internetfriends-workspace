/**
 * Pattern Monitor System - Real-time tracking of development patterns
 * Monitors: Quality metrics, component analysis, build patterns, git changes
 */

import { EventEmitter } from "events";
import { z } from "zod";

// Event schemas
const PatternEventSchema = z.object({
  id: z.string(),
  timestamp: z.date(),
  type: z.enum(["quality", "build", "git", "component", "performance"]),
  pattern: z.string(),
  status: z.enum(["healthy", "warning", "error", "improving"]),
  data: z.record(z.any()),
  metrics: z.object({
    score: z.number(),
    trend: z.enum(["up", "down", "stable"]),
    impact: z.enum(["low", "medium", "high"]),
  }),
});

const StreamMetricsSchema = z.object({
  totalComponents: z.number(),
  averageScore: z.number(),
  activePatterns: z.number(),
  racePosition: z.string(), // "leading", "close", "trailing"
  momentum: z.number(),
});

export type PatternEvent = z.infer<typeof PatternEventSchema>;
export type StreamMetrics = z.infer<typeof StreamMetricsSchema>;

class PatternMonitor extends EventEmitter {
  private patterns: Map<string, PatternEvent> = new Map();
  private streamMetrics: StreamMetrics;
  private raceTimer: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.setMaxListeners(100); // Increase listener limit for monitoring
    this.streamMetrics = {
      totalComponents: 147,
      averageScore: 63.67,
      activePatterns: 0,
      racePosition: "leading",
      momentum: 0.85,
    };
    this.startRaceMonitoring();
  }

  // Monitor current development patterns
  async trackPattern(patternName: string, data: any): Promise<void> {
    const event: PatternEvent = {
      id: `${patternName}-${Date.now()}`,
      timestamp: new Date(),
      type: this.categorizePattern(patternName),
      pattern: patternName,
      status: this.assessPatternHealth(data),
      data,
      metrics: {
        score: this.calculatePatternScore(data),
        trend: this.determineTrend(patternName, data),
        impact: this.assessImpact(data),
      },
    };

    this.patterns.set(patternName, event);
    this.emit("pattern-update", event);
    this.updateRaceMetrics(event);
  }

  // Horse race streaming pipeline
  private startRaceMonitoring(): void {
    this.raceTimer = setInterval(() => {
      const raceUpdate = this.generateRaceUpdate();
      this.emit("race-update", raceUpdate);
    }, 5000); // 5-second intervals
  }

  private generateRaceUpdate() {
    const activePatterns = Array.from(this.patterns.values());
    const recentEvents = activePatterns.filter(
      (p) => Date.now() - p.timestamp.getTime() < 30000, // Last 30 seconds
    );

    return {
      timestamp: new Date(),
      position: this.streamMetrics.racePosition,
      speed: this.calculateCurrentSpeed(recentEvents),
      patterns: recentEvents.length,
      momentum: this.streamMetrics.momentum,
      statusUpdate: this.generateStatusMessage(recentEvents),
    };
  }

  // Pattern categorization
  private categorizePattern(patternName: string): PatternEvent["type"] {
    if (patternName.includes("component") || patternName.includes("quality"))
      return "quality";
    if (patternName.includes("build") || patternName.includes("lint"))
      return "build";
    if (patternName.includes("git") || patternName.includes("commit"))
      return "git";
    if (patternName.includes("perf") || patternName.includes("speed"))
      return "performance";
    return "component";
  }

  private assessPatternHealth(data: any): PatternEvent["status"] {
    if (data.error || data.failed) return "error";
    if (data.warnings > 0) return "warning";
    if (data.improved || data.score > 70) return "improving";
    return "healthy";
  }

  private calculatePatternScore(data: any): number {
    return data.score || data.quality || 50;
  }

  private determineTrend(
    patternName: string,
    data: any,
  ): "up" | "down" | "stable" {
    const previous = this.patterns.get(patternName);
    if (!previous) return "stable";

    const currentScore = this.calculatePatternScore(data);
    const previousScore = previous.metrics.score;

    if (currentScore > previousScore + 2) return "up";
    if (currentScore < previousScore - 2) return "down";
    return "stable";
  }

  private assessImpact(data: any): "low" | "medium" | "high" {
    if (data.critical || data.blocking) return "high";
    if (data.important || data.score < 50) return "medium";
    return "low";
  }

  private calculateCurrentSpeed(recentEvents: PatternEvent[]): number {
    return recentEvents.length * 0.1; // Speed based on activity
  }

  private updateRaceMetrics(_event: PatternEvent): void {
    this.streamMetrics.activePatterns = this.patterns.size;

    // Update position based on overall health
    const healthyPatterns = Array.from(this.patterns.values()).filter(
      (p) => p.status === "healthy" || p.status === "improving",
    ).length;

    const healthRatio = healthyPatterns / this.patterns.size;

    if (healthRatio > 0.8) this.streamMetrics.racePosition = "leading";
    else if (healthRatio > 0.6) this.streamMetrics.racePosition = "close";
    else this.streamMetrics.racePosition = "trailing";

    this.streamMetrics.momentum = healthRatio;
  }

  private generateStatusMessage(recentEvents: PatternEvent[]): string {
    const improving = recentEvents.filter(
      (e) => e.status === "improving",
    ).length;
    const errors = recentEvents.filter((e) => e.status === "error").length;

    if (errors > 0) return `🚨 ${errors} issues detected`;
    if (improving > 0) return `📈 ${improving} patterns improving`;
    return `✅ All systems healthy`;
  }

  // Public API
  getCurrentMetrics(): StreamMetrics {
    return { ...this.streamMetrics };
  }

  getActivePatterns(): PatternEvent[] {
    return Array.from(this.patterns.values());
  }

  getPatternHistory(patternName: string): PatternEvent | undefined {
    return this.patterns.get(patternName);
  }

  destroy(): void {
    if (this.raceTimer) {
      clearInterval(this.raceTimer);
      this.raceTimer = null;
    }
    this.removeAllListeners();
    this.patterns.clear();
  }
}

// Singleton instance
export const patternMonitor = new PatternMonitor();

// Convenience functions for specific pattern tracking
export const trackQuality = (data: any) =>
  patternMonitor.trackPattern("quality-check", data);
export const trackBuild = (data: any) =>
  patternMonitor.trackPattern("build-status", data);
export const trackComponent = (name: string, data: any) =>
  patternMonitor.trackPattern(`component-${name}`, data);
export const trackGit = (data: any) =>
  patternMonitor.trackPattern("git-changes", data);
export const trackPerformance = (data: any) =>
  patternMonitor.trackPattern("performance", data);
