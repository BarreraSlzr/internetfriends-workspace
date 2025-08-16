/**
 * Fossilization Storage System
 * Captures and persists component analysis events for historical tracking
 */

import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";
import { getIsoTimestamp, generateStamp } from "@/lib/utils/timestamp";

// Event types for fossilization
export interface FossilEvent {
  id: string;
  type:
    | "component.analysis"
    | "helper.scoring"
    | "validation.result"
    | "orchestration.run";
  timestamp: string;
  stamp: string;
  data: unknown;
  metadata: {
    source: string;
    version: string;
    environment: string;
    session?: string;
  };
}

export interface ComponentAnalysisFossil extends FossilEvent {
  type: "component.analysis";
  data: {
    component: string;
    level: string;
    score: number;
    patterns: Record<string, boolean | number>;
    suggestions: string[];
    path: string;
  };
}

export interface ScoringHistoryFossil extends FossilEvent {
  type: "helper.scoring";
  data: {
    runId: string;
    totalComponents: number;
    averageScore: number;
    scoreDistribution: Record<string, number>;
    gapAnalysis: Record<string, number>;
    recommendations: string[];
  };
}

// Storage configuration
const FOSSIL_DIR = join(process.cwd(), ".fossils");
const MAX_FOSSILS_PER_FILE = 1000;
const RETENTION_DAYS = 90;

export class FossilStorage {
  private static instance: FossilStorage;

  static getInstance(): FossilStorage {
    if (!this.instance) {
      this.instance = new FossilStorage();
    }
    return this.instance;
  }

  private constructor() {
    this.ensureDirectory();
  }

  private async ensureDirectory(): Promise<void> {
    if (!existsSync(FOSSIL_DIR)) {
      await mkdir(FOSSIL_DIR, { recursive: true });
    }
  }

  /**
   * Store a fossil event
   */
  async store(
    event: Omit<FossilEvent, "id" | "timestamp" | "stamp">,
  ): Promise<string> {
    const fossil: FossilEvent = {
      ...event,
      id: generateStamp() + "-" + Math.random().toString(36).slice(2, 8),
      timestamp: getIsoTimestamp(),
      stamp: generateStamp(),
    };

    const filename = this.getFilename(fossil.type, fossil.timestamp);
    const filepath = join(FOSSIL_DIR, filename);

    try {
      // Read existing fossils or start with empty array
      let fossils: FossilEvent[] = [];
      if (existsSync(filepath)) {
        const content = await readFile(filepath, "utf-8");
        fossils = JSON.parse(content);
      }

      // Add new fossil
      fossils.push(fossil);

      // Rotate file if it gets too large
      if (fossils.length > MAX_FOSSILS_PER_FILE) {
        const oldFilename = filename.replace(".json", "-archive.json");
        const oldFilepath = join(FOSSIL_DIR, oldFilename);
        await writeFile(
          oldFilepath,
          JSON.stringify(fossils.slice(0, -1), null, 2),
        );
        fossils = [fossil]; // Start new file with just the latest fossil
      }

      // Write fossils back to file
      await writeFile(filepath, JSON.stringify(fossils, null, 2));

      return fossil.id;
    } catch (error) {
      console.error("Failed to store fossil:", error);
      throw error;
    }
  }

  /**
   * Retrieve fossils by type and date range
   */
  async retrieve(
    type: FossilEvent["type"],
    dateRange?: { from: string; to: string },
  ): Promise<FossilEvent[]> {
    const files = await this.getFilesForType(type);
    const allFossils: FossilEvent[] = [];

    for (const file of files) {
      try {
        const filepath = join(FOSSIL_DIR, file);
        const content = await readFile(filepath, "utf-8");
        const fossils = JSON.parse(content) as FossilEvent[];

        // Filter by date range if provided
        const filteredFossils = dateRange
          ? fossils.filter(
              (f) =>
                f.timestamp >= dateRange.from && f.timestamp <= dateRange.to,
            )
          : fossils;

        allFossils.push(...filteredFossils);
      } catch (error) {
        console.error(`Failed to read fossil file ${file}:`, error);
      }
    }

    return allFossils.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }

  /**
   * Get analysis trends over time
   */
  async getAnalysisTrends(days: number = 30): Promise<{
    scoreHistory: Array<{
      date: string;
      averageScore: number;
      componentCount: number;
    }>;
    patternTrends: Record<string, Array<{ date: string; count: number }>>;
    improvementSuggestions: string[];
  }> {
    const fromDate = new Date();
    fromDate.setDate(fromDate.getDate() - days);

    const fossils = await this.retrieve("helper.scoring", {
      from: fromDate.toISOString(),
      to: getIsoTimestamp(),
    });

    const scoreHistory = fossils
      .filter((f): f is ScoringHistoryFossil => f.type === "helper.scoring")
      .map((f) => ({
        date: f.timestamp.split("T")[0],
        averageScore: f.data.averageScore,
        componentCount: f.data.totalComponents,
      }));

    // Group by date and average scores
    const groupedHistory = scoreHistory.reduce(
      (acc, item) => {
        if (!acc[item.date]) {
          acc[item.date] = { totalScore: 0, count: 0, componentCount: 0 };
        }
        acc[item.date].totalScore += item.averageScore;
        acc[item.date].count += 1;
        acc[item.date].componentCount = Math.max(
          acc[item.date].componentCount,
          item.componentCount,
        );
        return acc;
      },
      {} as Record<
        string,
        { totalScore: number; count: number; componentCount: number }
      >,
    );

    const aggregatedHistory = Object.entries(groupedHistory).map(
      ([date, data]) => ({
        date,
        averageScore: data.totalScore / data.count,
        componentCount: data.componentCount,
      }),
    );

    // Extract common recommendations
    const allRecommendations = fossils
      .filter((f): f is ScoringHistoryFossil => f.type === "helper.scoring")
      .flatMap((f) => f.data.recommendations);

    const recommendationCounts = allRecommendations.reduce(
      (acc, rec) => {
        acc[rec] = (acc[rec] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const topRecommendations = Object.entries(recommendationCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([rec]) => rec);

    return {
      scoreHistory: aggregatedHistory.sort((a, b) =>
        a.date.localeCompare(b.date),
      ),
      patternTrends: {}, // Could be expanded with component analysis fossils
      improvementSuggestions: topRecommendations,
    };
  }

  /**
   * Clean up old fossils
   */
  async cleanup(retentionDays: number = RETENTION_DAYS): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);

    const deletedCount = 0;

    // This would iterate through all files and remove old entries
    // Implementation details depend on file structure
    // For now, return 0 as placeholder

    return deletedCount;
  }

  private getFilename(type: FossilEvent["type"], timestamp: string): string {
    const date = timestamp.split("T")[0].replace(/-/g, "");
    return `${type.replace(".", "-")}-${date}.json`;
  }

  private async getFilesForType(type: FossilEvent["type"]): Promise<string[]> {
    const { readdir } = await import("fs/promises");

    try {
      const files = await readdir(FOSSIL_DIR);
      const typePrefix = type.replace(".", "-");
      return files.filter(
        (file) => file.startsWith(typePrefix) && file.endsWith(".json"),
      );
    } catch (error) {
      return [];
    }
  }
}

// Convenience functions for common operations
export const fossil = FossilStorage.getInstance();

export async function fossilizeComponentAnalysis(
  component: string,
  level: string,
  score: number,
  patterns: Record<string, boolean | number>,
  suggestions: string[],
  path: string,
  sessionId?: string,
): Promise<string> {
  return fossil.store({
    type: "component.analysis",
    data: { component, level, score, patterns, suggestions, path },
    metadata: {
      source: "helper.ts",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      session: sessionId,
    },
  });
}

export async function fossilizeScoringRun(
  runId: string,
  totalComponents: number,
  averageScore: number,
  scoreDistribution: Record<string, number>,
  gapAnalysis: Record<string, number>,
  recommendations: string[],
  sessionId?: string,
): Promise<string> {
  return fossil.store({
    type: "helper.scoring",
    data: {
      runId,
      totalComponents,
      averageScore,
      scoreDistribution,
      gapAnalysis,
      recommendations,
    },
    metadata: {
      source: "helper.ts",
      version: "1.0.0",
      environment: process.env.NODE_ENV || "development",
      session: sessionId,
    },
  });
}
