#!/usr/bin/env bun

/**
 * InternetFriends Performance Optimization - Phase 3 Dashboard
 *
 * Epic-Based Code & Style Pruning Progress Tracker
 * Consolidates all Phase 3 metrics and progress indicators
 *
 * Usage:
 *   bun scripts/perf/phase3-dashboard.ts
 *   bun scripts/perf/phase3-dashboard.ts --detailed
 *   bun scripts/perf/phase3-dashboard.ts --compare
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, relative } from "path";
import { execSync } from "child_process";

interface Phase3Metrics {
  timestamp: string;
  epic: {
    name: string;
    phase: string;
    startDate: string;
    targetCompletion: string;
    progressPercent: number;
  };
  legacy: {
    removedFiles: number;
    removedBytes: number;
    quarantinedFiles: string[];
    modernizationPercent: number;
  };
  pruning: {
    unusedCSSClasses: number;
    safeRemovals: number;
    potentialSavings: number;
    cleanupCompleted: number;
  };
  bundleSize: {
    totalSize: number;
    jsSize: number;
    cssSize: number;
    scssSourceSize: number;
    reductionFromBaseline: number;
    reductionPercent: number;
  };
  performance: {
    telemetryActive: boolean;
    criticalCSSExtracted: boolean;
    fontOptimizations: boolean;
    modernSCSSPercent: number;
  };
  nextSteps: string[];
  warnings: string[];
  achievements: string[];
}

interface PhaseComparison {
  previousPhase: string;
  currentPhase: string;
  improvements: {
    bundleSizeReduction: number;
    cssClassesRemoved: number;
    legacyFilesRemoved: number;
    modernizationIncrease: number;
  };
  regressions: string[];
}

class Phase3Dashboard {
  private projectRoot: string;
  private snapshotDir: string;

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
    this.snapshotDir = join(projectRoot, "scripts", "perf", "snapshots");
  }

  async generateDashboard(): Promise<Phase3Metrics> {
    console.log("🎭 PHASE 3 EPIC DASHBOARD - Code & Style Pruning\n");

    const metrics: Phase3Metrics = {
      timestamp: new Date().toISOString(),
      epic: await this.getEpicMetrics(),
      legacy: await this.getLegacyMetrics(),
      pruning: await this.getPruningMetrics(),
      bundleSize: await this.getBundleSizeMetrics(),
      performance: await this.getPerformanceMetrics(),
      nextSteps: [],
      warnings: [],
      achievements: [],
    };

    // Calculate progress and recommendations
    this.calculateProgress(metrics);
    this.generateRecommendations(metrics);
    this.identifyAchievements(metrics);

    return metrics;
  }

  private async getEpicMetrics() {
    return {
      name: "performance-optimization-phase3",
      phase: "Code & Style Pruning",
      startDate: "2025-01-10",
      targetCompletion: "2025-01-13",
      progressPercent: 35, // Based on completed tasks
    };
  }

  private async getLegacyMetrics() {
    let removedBytes = 0;
    const quarantinedFiles: string[] = [];

    // Check legacy directory
    const legacyPath = join(
      this.projectRoot,
      "nextjs-website",
      "styles",
      "legacy",
    );
    if (existsSync(legacyPath)) {
      const legacyReadme = join(legacyPath, "README.md");
      if (existsSync(legacyReadme)) {
        const readmeContent = readFileSync(legacyReadme, "utf-8");
        const bytesMatch = readmeContent.match(/~(\d+\.?\d*)\s*KB/);
        if (bytesMatch) {
          removedBytes = parseFloat(bytesMatch[1]) * 1024;
        }
      }
      quarantinedFiles.push(
        "styles/legacy/variables.scss",
        "styles/legacy/mixins.scss",
      );
    }

    // Get modernization percent from SCSS analysis
    let modernizationPercent = 0;
    const scssLatest = join(this.snapshotDir, "scss-latest.json");
    if (existsSync(scssLatest)) {
      try {
        const scssData = JSON.parse(readFileSync(scssLatest, "utf-8"));
        modernizationPercent = scssData.summary?.modernizationPercent || 0;
      } catch (error) {
        console.warn("⚠️  Could not read SCSS analysis");
      }
    }

    return {
      removedFiles: quarantinedFiles.length,
      removedBytes,
      quarantinedFiles,
      modernizationPercent,
    };
  }

  private async getPruningMetrics() {
    let unusedCSSClasses = 0;
    let safeRemovals = 0;
    let potentialSavings = 0;

    const unusedCssLatest = join(this.snapshotDir, "unused-css-latest.json");
    if (existsSync(unusedCssLatest)) {
      try {
        const unusedData = JSON.parse(readFileSync(unusedCssLatest, "utf-8"));
        unusedCSSClasses = unusedData.summary?.unusedClasses || 0;
        safeRemovals = unusedData.recommendations?.safeRemovals?.length || 0;

        // Estimate potential savings (conservative: 50 bytes per unused class)
        potentialSavings = safeRemovals * 50;
      } catch (error) {
        console.warn("⚠️  Could not read unused CSS analysis");
      }
    }

    return {
      unusedCSSClasses,
      safeRemovals,
      potentialSavings,
      cleanupCompleted: 0, // To be updated as cleanup progresses
    };
  }

  private async getBundleSizeMetrics() {
    let totalSize = 0;
    let jsSize = 0;
    let cssSize = 0;
    let scssSourceSize = 0;
    let reductionFromBaseline = 0;
    let reductionPercent = 0;

    const bundleLatest = join(this.snapshotDir, "bundle-size-latest.json");
    if (existsSync(bundleLatest)) {
      try {
        const bundleData = JSON.parse(readFileSync(bundleLatest, "utf-8"));
        totalSize = bundleData.summary?.totalSize || 0;
        jsSize = bundleData.summary?.jsSize || 0;
        cssSize = bundleData.summary?.cssSize || 0;
        scssSourceSize = bundleData.summary?.scssSourceSize || 0;

        // Check for comparison data
        if (bundleData.comparison) {
          reductionFromBaseline = Math.abs(bundleData.comparison.sizeChange);
          reductionPercent = Math.abs(bundleData.comparison.percentChange);
        }
      } catch (error) {
        console.warn("⚠️  Could not read bundle size analysis");
      }
    }

    return {
      totalSize,
      jsSize,
      cssSize,
      scssSourceSize,
      reductionFromBaseline,
      reductionPercent,
    };
  }

  private async getPerformanceMetrics() {
    // Check for telemetry system
    const telemetryExists = existsSync(
      join(
        this.projectRoot,
        "nextjs-website",
        "components",
        "atoms",
        "telemetry",
      ),
    );

    // Check for critical CSS
    const criticalCSSExists = existsSync(
      join(this.projectRoot, "nextjs-website", "styles", "critical.css"),
    );

    // Check font optimizations (semantic tokens)
    const fontTokensExist = existsSync(
      join(
        this.projectRoot,
        "nextjs-website",
        "styles",
        "tokens",
        "fonts.scss",
      ),
    );

    let modernSCSSPercent = 0;
    const scssLatest = join(this.snapshotDir, "scss-latest.json");
    if (existsSync(scssLatest)) {
      try {
        const scssData = JSON.parse(readFileSync(scssLatest, "utf-8"));
        modernSCSSPercent = scssData.summary?.modernizationPercent || 0;
      } catch (error) {
        // Ignore error, use default value
      }
    }

    return {
      telemetryActive: telemetryExists,
      criticalCSSExtracted: criticalCSSExists,
      fontOptimizations: fontTokensExist,
      modernSCSSPercent,
    };
  }

  private calculateProgress(metrics: Phase3Metrics) {
    const completedTasks = [
      metrics.legacy.removedFiles > 0, // Legacy quarantine
      metrics.pruning.unusedCSSClasses > 0, // CSS analysis
      metrics.bundleSize.totalSize > 0, // Bundle analysis
      metrics.performance.telemetryActive, // Telemetry from Phase 2
      metrics.performance.criticalCSSExtracted, // Critical CSS from Phase 2
    ].filter(Boolean).length;

    const totalTasks = 8; // Estimated total Phase 3 tasks
    metrics.epic.progressPercent = Math.round(
      (completedTasks / totalTasks) * 100,
    );
  }

  private generateRecommendations(metrics: Phase3Metrics) {
    // Next steps based on current state
    if (metrics.pruning.safeRemovals > 0) {
      metrics.nextSteps.push(
        `Remove ${metrics.pruning.safeRemovals} safe unused CSS classes`,
      );
    }

    if (metrics.legacy.modernizationPercent < 95) {
      metrics.nextSteps.push("Complete SCSS modernization (target: 95%+)");
    }

    if (metrics.bundleSize.reductionPercent < 10) {
      metrics.nextSteps.push("Implement code splitting for larger components");
    }

    if (metrics.pruning.cleanupCompleted === 0) {
      metrics.nextSteps.push("Begin systematic unused CSS cleanup");
    }

    // Warnings
    if (metrics.legacy.quarantinedFiles.length > 0) {
      metrics.warnings.push(
        `${metrics.legacy.quarantinedFiles.length} legacy files in quarantine - schedule for deletion`,
      );
    }

    if (metrics.bundleSize.reductionPercent === 0) {
      metrics.warnings.push(
        "No bundle size reduction detected - verify pruning effectiveness",
      );
    }
  }

  private identifyAchievements(metrics: Phase3Metrics) {
    if (metrics.legacy.removedBytes > 0) {
      metrics.achievements.push(
        `Removed ${this.formatBytes(metrics.legacy.removedBytes)} of legacy SCSS`,
      );
    }

    if (metrics.pruning.unusedCSSClasses > 0) {
      metrics.achievements.push(
        `Identified ${metrics.pruning.unusedCSSClasses} unused CSS classes`,
      );
    }

    if (metrics.performance.modernSCSSPercent >= 87) {
      metrics.achievements.push(
        `Achieved ${metrics.performance.modernSCSSPercent}% SCSS modernization`,
      );
    }

    if (metrics.bundleSize.reductionPercent > 0) {
      metrics.achievements.push(
        `Bundle size reduction: ${metrics.bundleSize.reductionPercent.toFixed(1)}%`,
      );
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  }

  async displayDashboard(metrics: Phase3Metrics, detailed: boolean = false) {
    console.log("═".repeat(80));
    console.log("🎭 INTERNETFRIENDS PERFORMANCE EPIC - PHASE 3 DASHBOARD");
    console.log("═".repeat(80));

    // Epic Overview
    console.log(`\n📊 EPIC STATUS: ${metrics.epic.name}`);
    console.log(`   Phase: ${metrics.epic.phase}`);
    console.log(`   Progress: ${metrics.epic.progressPercent}%`);
    console.log(`   Target: ${metrics.epic.targetCompletion}`);

    // Legacy Cleanup Results
    console.log(`\n🗑️  LEGACY CLEANUP:`);
    console.log(`   Files removed: ${metrics.legacy.removedFiles}`);
    console.log(
      `   Bytes saved: ${this.formatBytes(metrics.legacy.removedBytes)}`,
    );
    console.log(
      `   SCSS modernization: ${metrics.legacy.modernizationPercent}%`,
    );
    if (metrics.legacy.quarantinedFiles.length > 0) {
      console.log(
        `   Quarantined: ${metrics.legacy.quarantinedFiles.join(", ")}`,
      );
    }

    // CSS Pruning Progress
    console.log(`\n✂️  CSS PRUNING:`);
    console.log(`   Unused classes found: ${metrics.pruning.unusedCSSClasses}`);
    console.log(`   Safe to remove: ${metrics.pruning.safeRemovals}`);
    console.log(
      `   Potential savings: ${this.formatBytes(metrics.pruning.potentialSavings)}`,
    );
    console.log(
      `   Cleanup completed: ${metrics.pruning.cleanupCompleted}/${metrics.pruning.safeRemovals}`,
    );

    // Bundle Size Metrics
    console.log(`\n📦 BUNDLE SIZE:`);
    console.log(`   Total: ${this.formatBytes(metrics.bundleSize.totalSize)}`);
    console.log(
      `   JavaScript: ${this.formatBytes(metrics.bundleSize.jsSize)}`,
    );
    console.log(`   CSS: ${this.formatBytes(metrics.bundleSize.cssSize)}`);
    console.log(
      `   SCSS source: ${this.formatBytes(metrics.bundleSize.scssSourceSize)}`,
    );
    if (metrics.bundleSize.reductionPercent > 0) {
      console.log(
        `   Reduction: ${this.formatBytes(metrics.bundleSize.reductionFromBaseline)} (${metrics.bundleSize.reductionPercent.toFixed(1)}%)`,
      );
    }

    // Performance Features
    console.log(`\n⚡ PERFORMANCE FEATURES:`);
    console.log(
      `   Real-time telemetry: ${metrics.performance.telemetryActive ? "✅" : "❌"}`,
    );
    console.log(
      `   Critical CSS: ${metrics.performance.criticalCSSExtracted ? "✅" : "❌"}`,
    );
    console.log(
      `   Font optimizations: ${metrics.performance.fontOptimizations ? "✅" : "❌"}`,
    );
    console.log(`   Modern SCSS: ${metrics.performance.modernSCSSPercent}%`);

    // Achievements
    if (metrics.achievements.length > 0) {
      console.log(`\n🏆 ACHIEVEMENTS:`);
      metrics.achievements.forEach((achievement) => {
        console.log(`   • ${achievement}`);
      });
    }

    // Next Steps
    if (metrics.nextSteps.length > 0) {
      console.log(`\n📋 NEXT STEPS:`);
      metrics.nextSteps.forEach((step, index) => {
        console.log(`   ${index + 1}. ${step}`);
      });
    }

    // Warnings
    if (metrics.warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS:`);
      metrics.warnings.forEach((warning) => {
        console.log(`   • ${warning}`);
      });
    }

    console.log(
      `\n🕐 Generated: ${new Date(metrics.timestamp).toLocaleString()}`,
    );
    console.log("═".repeat(80));

    if (detailed) {
      console.log("\n📋 DETAILED ANALYSIS:");
      console.log(JSON.stringify(metrics, null, 2));
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const detailed = args.includes("--detailed");
  const compare = args.includes("--compare");

  try {
    const dashboard = new Phase3Dashboard();
    const metrics = await dashboard.generateDashboard();

    // Save metrics
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split(".")[0];
    const reportPath = join(
      process.cwd(),
      "scripts",
      "perf",
      "snapshots",
      `phase3-${timestamp}.json`,
    );
    const latestPath = join(
      process.cwd(),
      "scripts",
      "perf",
      "snapshots",
      "phase3-latest.json",
    );

    writeFileSync(reportPath, JSON.stringify(metrics, null, 2));
    writeFileSync(latestPath, JSON.stringify(metrics, null, 2));

    // Display dashboard
    await dashboard.displayDashboard(metrics, detailed);

    console.log(`\n📋 Dashboard saved: ${relative(process.cwd(), reportPath)}`);
  } catch (error) {
    console.error("❌ Error generating dashboard:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { Phase3Dashboard };
