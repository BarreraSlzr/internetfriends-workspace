/**
 * Horse Race Streaming Pipeline
 * Real-time monitoring of development patterns with live updates
 */

import {
  patternMonitor,
  type PatternEvent,
  type StreamMetrics,
} from "./pattern-monitor";
import { z } from "zod";

// Race Event Schema
const RaceEventSchema = z.object({
  timestamp: z.date(),
  type: z.enum([
    "position_change",
    "speed_update",
    "pattern_boost",
    "obstacle_hit",
  ]),
  position: z.enum(["leading", "close", "trailing"]),
  speed: z.number(),
  patterns: z.number(),
  momentum: z.number(),
  message: z.string(),
  data: z.record(z.any()).optional(),
});

export type RaceEvent = z.infer<typeof RaceEventSchema>;

class HorseRaceStreamPipeline {
  private subscribers: Map<string, (event: RaceEvent) => void> = new Map();
  private raceHistory: RaceEvent[] = [];
  private currentPosition = "close";
  private isRunning = false;

  constructor() {
    this.setupPatternMonitorListeners();
  }

  private setupPatternMonitorListeners(): void {
    patternMonitor.on("pattern-update", (event: PatternEvent) => {
      this.processPatternEvent(event);
    });

    patternMonitor.on("race-update", (update: any) => {
      this.processRaceUpdate(update);
    });
  }

  private processPatternEvent(event: PatternEvent): void {
    const raceEvent: RaceEvent = {
      timestamp: new Date(),
      type: this.determineRaceEventType(event),
      position: this.currentPosition as any,
      speed: this.calculateSpeedFromPattern(event),
      patterns: patternMonitor.getActivePatterns().length,
      momentum: patternMonitor.getCurrentMetrics().momentum,
      message: this.generateRaceMessage(event),
      data: { pattern: event.pattern, score: event.metrics.score },
    };

    this.broadcastRaceEvent(raceEvent);
    this.updateRaceHistory(raceEvent);
  }

  private processRaceUpdate(update: any): void {
    const raceEvent: RaceEvent = {
      timestamp: new Date(),
      type: "speed_update",
      position: update.position,
      speed: update.speed,
      patterns: update.patterns,
      momentum: update.momentum,
      message: update.statusUpdate,
    };

    this.currentPosition = update.position;
    this.broadcastRaceEvent(raceEvent);
  }

  private determineRaceEventType(event: PatternEvent): RaceEvent["type"] {
    if (event.status === "improving") return "pattern_boost";
    if (event.status === "error") return "obstacle_hit";
    if (event.metrics.trend === "up") return "position_change";
    return "speed_update";
  }

  private calculateSpeedFromPattern(event: PatternEvent): number {
    const baseSpeed = 0.5;
    const scoreBonus = (event.metrics.score - 50) / 100;
    const trendBonus =
      event.metrics.trend === "up"
        ? 0.3
        : event.metrics.trend === "down"
          ? -0.2
          : 0;
    return Math.max(0.1, baseSpeed + scoreBonus + trendBonus);
  }

  private generateRaceMessage(event: PatternEvent): string {
    const messages = {
      improving: `🚀 ${event.pattern} pattern boosting performance!`,
      error: `🔥 Obstacle: ${event.pattern} needs attention`,
      warning: `⚠️ ${event.pattern} showing resistance`,
      healthy: `✅ ${event.pattern} running smooth`,
    };
    return messages[event.status];
  }

  private broadcastRaceEvent(event: RaceEvent): void {
    this.subscribers.forEach((callback) => {
      try {
        callback(event);
      } catch (error) {
        console.error("Race event broadcast error:", error);
      }
    });
  }

  private updateRaceHistory(event: RaceEvent): void {
    this.raceHistory.push(event);
    // Keep last 100 events
    if (this.raceHistory.length > 100) {
      this.raceHistory = this.raceHistory.slice(-100);
    }
  }

  // Public API
  subscribe(id: string, callback: (event: RaceEvent) => void): void {
    this.subscribers.set(id, callback);
  }

  unsubscribe(id: string): void {
    this.subscribers.delete(id);
  }

  getCurrentStats(): {
    position: string;
    speed: number;
    activePatterns: number;
    momentum: number;
    recentEvents: RaceEvent[];
  } {
    const metrics = patternMonitor.getCurrentMetrics();
    return {
      position: this.currentPosition,
      speed: this.raceHistory[this.raceHistory.length - 1]?.speed || 0,
      activePatterns: metrics.activePatterns,
      momentum: metrics.momentum,
      recentEvents: this.raceHistory.slice(-10),
    };
  }

  getRaceHistory(): RaceEvent[] {
    return [...this.raceHistory];
  }

  start(): void {
    this.isRunning = true;
    console.log("🏁 Horse Race Pipeline Started");
  }

  stop(): void {
    this.isRunning = false;
    this.subscribers.clear();
    console.log("🛑 Horse Race Pipeline Stopped");
  }

  // Stream utilities
  createEventStream(): ReadableStream<RaceEvent> {
    const pipeline = this;
    let streamId: string;

    return new ReadableStream({
      start(controller) {
        streamId = `stream-${Date.now()}`;
        pipeline.subscribe(streamId, (event) => {
          controller.enqueue(event);
        });
      },
      cancel() {
        pipeline.unsubscribe(streamId);
      },
    });
  }

  // Pattern injection for manual testing/monitoring
  injectPattern(patternName: string, data: any): void {
    patternMonitor.trackPattern(patternName, data);
  }

  // Get streamlined status for CLI/logs
  getStreamlinedStatus(): string {
    const stats = this.getCurrentStats();
    const positionEmoji =
      {
        leading: "🥇",
        close: "🥈",
        trailing: "🥉",
      }[stats.position] || "🏃";

    return `${positionEmoji} Position: ${stats.position} | Speed: ${stats.speed.toFixed(2)} | Patterns: ${stats.activePatterns} | Momentum: ${(stats.momentum * 100).toFixed(0)}%`;
  }
}

// Singleton pipeline
export const horseRacePipeline = new HorseRaceStreamPipeline();

// Auto-start the pipeline
horseRacePipeline.start();

// Convenience functions for different development stages
export const trackQualityRace = (data: any) =>
  horseRacePipeline.injectPattern("quality-sprint", data);

export const trackBuildRace = (data: any) =>
  horseRacePipeline.injectPattern("build-sprint", data);

export const trackComponentRace = (name: string, data: any) =>
  horseRacePipeline.injectPattern(`component-${name}`, data);

export const getRaceStatus = () => horseRacePipeline.getStreamlinedStatus();
