#!/usr/bin/env bun

/**
 * Performance Dashboard for Phase 4 Epic
 *
 * Quick overview of performance optimization progress, metrics,
 * and epic milestone tracking for the InternetFriends portfolio.
 *
 * Usage:
 *   bun scripts/perf/dashboard.ts
 *   bun scripts/perf/dashboard.ts --json
 *   bun scripts/perf/dashboard.ts --detailed
 */

import { readFileSync, existsSync } from "fs";
import { join } from "path";
import { parseArgs } from "util";

interface DashboardData {
  timestamp: string;
  epic: {
    name: string;
    phase: string;
    status: "setup" | "in-progress" | "validation" | "completed";
    completion_percentage: number;
  };
  bundle: {
    current: Record<string, number>;
    baseline: Record<string, number>;
    targets: Record<string, number>;
    improvements: Record<string, number>;
  };
  metrics: {
    current: Record<string, number>;
    baseline: Record<string, number>;
    targets: Record<string, number>;
    improvements: Record<string, number>;
  };
  budgets: {
    status: "pass" | "warn" | "fail";
    total_checks: number;
    passed: number;
    warnings: number;
    failures: number;
  };
  rum: {
    available: boolean;
    recent_sessions?: number;
    avg_lcp?: number;
    avg_cls?: number;
  };
  recommendations: string[];
  next_actions: string[];
}

class PerformanceDashboard {
  private artifactsDir: string;
  private rumDir: string;

  constructor() {
    this.artifactsDir = join(process.cwd(), "scripts/perf/artifacts");
    this.rumDir = join(this.artifactsDir, "rum");
  }

  async generateDashboard(): Promise<DashboardData> {
    const dashboard: DashboardData = {
      timestamp: new Date().toISOString(),
      epic: this.getEpicStatus(),
      bundle: await this.getBundleMetrics(),
      metrics: await this.getPerformanceMetrics(),
      budgets: await this.getBudgetStatus(),
      rum: await this.getRUMStatus(),
      recommendations: [],
      next_actions: [],
    };

    dashboard.recommendations = this.generateRecommendations(dashboard);
    dashboard.next_actions = this.generateNextActions(dashboard);

    return dashboard;
  }

  private getEpicStatus(): DashboardData["epic"] {
    // Try to determine current epic and phase from git
    try {
      const { execSync } = require("child_process");
      const branch = execSync("git rev-parse --abbrev-ref HEAD", {
        encoding: "utf8",
      }).trim();

      let epicName = "performance-optimization";
      if (branch.startsWith("epic/")) {
        epicName = branch.replace("epic/", "");
      }

      // Calculate completion based on checklist
      const completion = this.calculateEpicCompletion();

      return {
        name: epicName,
        phase: "Phase 4 - Advanced Bundle & Runtime Optimization",
        status:
          completion < 25
            ? "setup"
            : completion < 75
              ? "in-progress"
              : completion < 100
                ? "validation"
                : "completed",
        completion_percentage: completion,
      };
    } catch (error) {
      return {
        name: "performance-optimization",
        phase: "Phase 4 - Advanced Bundle & Runtime Optimization",
        status: "setup",
        completion_percentage: 0,
      };
    }
  }

  private calculateEpicCompletion(): number {
    // Simple heuristic based on file existence and basic metrics
    let completed = 0;
    const totalTasks = 10;

    // Infrastructure setup (20%)
    if (existsSync(join(process.cwd(), "perf.budgets.json"))) completed += 2;

    // Bundle analysis (20%)
    if (existsSync(join(this.artifactsDir, "route_bundle_baseline.json")))
      completed += 2;

    // RUM system (20%)
    if (existsSync(join(process.cwd(), "app/api/rum/route.ts"))) completed += 2;
    if (existsSync(join(process.cwd(), "src/lib/rum.init.ts"))) completed += 1;

    // Budget checking (15%)
    if (existsSync(join(process.cwd(), "scripts/perf/check_budgets.ts")))
      completed += 1.5;

    // Documentation (15%)
    if (
      existsSync(
        join(
          process.cwd(),
          "app/epics/performance-optimization/phase4_checklist.md",
        ),
      )
    )
      completed += 1.5;

    // Additional progress indicators (10%)
    if (this.rumDir && existsSync(this.rumDir)) completed += 1;

    return Math.min(100, (completed / totalTasks) * 100);
  }

  private async getBundleMetrics(): Promise<DashboardData["bundle"]> {
    const metrics = {
      current: {} as Record<string, number>,
      baseline: {} as Record<string, number>,
      targets: {} as Record<string, number>,
      improvements: {} as Record<string, number>,
    };

    // Try to load baseline data
    const baselinePath = join(this.artifactsDir, "route_bundle_baseline.json");
    if (existsSync(baselinePath)) {
      try {
        const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
        metrics.baseline = {
          js_initial_kb: baseline.totalJsSize / 1024,
          css_total_kb: baseline.totalCssSize / 1024,
          total_assets_mb: baseline.totalBundleSize / (1024 * 1024),
        };
      } catch (error) {
        // Ignore parse errors
      }
    }

    // Load budgets for targets
    const budgetPath = join(process.cwd(), "perf.budgets.json");
    if (existsSync(budgetPath)) {
      try {
        const budgets = JSON.parse(readFileSync(budgetPath, "utf8"));
        metrics.targets = {
          js_initial_kb: budgets.bundle.js_initial_kb.warn,
          css_total_kb: budgets.bundle.css_total_kb.warn,
          total_assets_mb: budgets.bundle.total_assets_mb
            ? budgets.bundle.total_assets_mb.warn
            : 2.0,
        };
      } catch (error) {
        // Use defaults
        metrics.targets = {
          js_initial_kb: 420,
          css_total_kb: 95,
          total_assets_mb: 2.0,
        };
      }
    }

    // Current metrics would be from latest analysis
    metrics.current = metrics.baseline; // For now, until we have current data

    // Calculate improvements
    for (const [key, baselineValue] of Object.entries(metrics.baseline)) {
      const currentValue = metrics.current[key] || (baselineValue as number);
      const improvement =
        (((baselineValue as number) - currentValue) /
          (baselineValue as number)) *
        100;
      metrics.improvements[key] = Math.round(improvement * 100) / 100;
    }

    return metrics;
  }

  private async getPerformanceMetrics(): Promise<DashboardData["metrics"]> {
    const metrics = {
      current: {} as Record<string, number>,
      baseline: {} as Record<string, number>,
      targets: {} as Record<string, number>,
      improvements: {} as Record<string, number>,
    };

    // Try to load Lighthouse data
    const lighthousePath = join(this.artifactsDir, "lighthouse_report.json");
    if (existsSync(lighthousePath)) {
      try {
        const lighthouse = JSON.parse(readFileSync(lighthousePath, "utf8"));
        metrics.current = {
          lcp_mobile_ms:
            lighthouse.audits?.["largest-contentful-paint"]?.numericValue || 0,
          fcp_ms:
            lighthouse.audits?.["first-contentful-paint"]?.numericValue || 0,
          cls:
            lighthouse.audits?.["cumulative-layout-shift"]?.numericValue || 0,
          performance_score:
            lighthouse.categories?.performance?.score * 100 || 0,
        };
        metrics.baseline = { ...metrics.current }; // Use as baseline for now
      } catch (error) {
        // Ignore parse errors
      }
    }

    // Load targets from budgets
    const budgetPath = join(process.cwd(), "perf.budgets.json");
    if (existsSync(budgetPath)) {
      try {
        const budgets = JSON.parse(readFileSync(budgetPath, "utf8"));
        metrics.targets = {
          lcp_mobile_ms: budgets.metrics.lcp_mobile_ms.warn,
          fcp_ms: budgets.metrics.fcp_ms.warn,
          cls: budgets.metrics.cls.warn,
          performance_score: budgets.metrics.lighthouse_performance.warn,
        };
      } catch (error) {
        // Use defaults
        metrics.targets = {
          lcp_mobile_ms: 2500,
          fcp_ms: 1800,
          cls: 0.1,
          performance_score: 85,
        };
      }
    }

    // Calculate improvements
    for (const [key, baselineValue] of Object.entries(metrics.baseline)) {
      const currentValue = metrics.current[key] || (baselineValue as number);
      const improvement =
        (((baselineValue as number) - currentValue) /
          (baselineValue as number)) *
        100;
      metrics.improvements[key] = Math.round(improvement * 100) / 100;
    }

    return metrics;
  }

  private async getBudgetStatus(): Promise<DashboardData["budgets"]> {
    // Try to load latest budget report
    const reportsDir = this.artifactsDir;

    if (!existsSync(reportsDir)) {
      return {
        status: "warn",
        total_checks: 0,
        passed: 0,
        warnings: 0,
        failures: 0,
      };
    }

    try {
      const files = require("fs").readdirSync(reportsDir);
      const reportFiles = files
        .filter((f: string) => f.startsWith("budget_report_"))
        .sort()
        .reverse();

      if (reportFiles.length > 0) {
        const latestReport = JSON.parse(
          readFileSync(join(reportsDir, reportFiles[0]), "utf8"),
        );
        return {
          status: latestReport.overall_status,
          total_checks: latestReport.total_checks,
          passed: latestReport.passed,
          warnings: latestReport.warnings,
          failures: latestReport.failures,
        };
      }
    } catch (error) {
      // Ignore errors loading reports
    }

    return {
      status: "warn",
      total_checks: 0,
      passed: 0,
      warnings: 0,
      failures: 0,
    };
  }

  private async getRUMStatus(): Promise<DashboardData["rum"]> {
    const recentFile = join(this.rumDir, "recent_metrics.json");

    if (!existsSync(recentFile)) {
      return { available: false };
    }

    try {
      const recentMetrics = JSON.parse(readFileSync(recentFile, "utf8"));

      if (!Array.isArray(recentMetrics) || recentMetrics.length === 0) {
        return { available: true, recent_sessions: 0 };
      }

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

      return {
        available: true,
        recent_sessions: recentMetrics.length,
        avg_lcp: Math.round(avgLCP),
        avg_cls: Math.round(avgCLS * 10000) / 10000,
      };
    } catch (error) {
      return { available: false };
    }
  }

  private generateRecommendations(dashboard: DashboardData): string[] {
    const recommendations: string[] = [];

    // Epic progress recommendations
    if (dashboard.epic.completion_percentage < 25) {
      recommendations.push(
        "🏗️ Focus on infrastructure setup: Run baseline measurements and validate RUM system",
      );
    } else if (dashboard.epic.completion_percentage < 50) {
      recommendations.push(
        "🎯 Begin bundle optimization: Identify and implement dynamic imports",
      );
    } else if (dashboard.epic.completion_percentage < 75) {
      recommendations.push(
        "⚡ Optimize performance: Focus on hydration reduction and critical path optimization",
      );
    }

    // Budget recommendations
    if (dashboard.budgets.failures > 0) {
      recommendations.push(
        "🚨 Critical: Fix performance budget failures before proceeding with new features",
      );
    } else if (dashboard.budgets.warnings > 0) {
      recommendations.push(
        "⚠️ Address performance budget warnings to prevent future violations",
      );
    }

    // Bundle recommendations
    const bundleImprovement =
      Object.values(dashboard.bundle.improvements).reduce(
        (sum, val) => sum + val,
        0,
      ) / Object.keys(dashboard.bundle.improvements).length;
    if (bundleImprovement < 5) {
      recommendations.push(
        "📦 Bundle optimization needed: Target dynamic imports and dependency reduction",
      );
    }

    // RUM recommendations
    if (!dashboard.rum.available) {
      recommendations.push(
        "📊 Deploy RUM system to start collecting real user performance data",
      );
    } else if (dashboard.rum.recent_sessions === 0) {
      recommendations.push(
        "🔍 Activate RUM data collection: Ensure client-side initialization is working",
      );
    }

    // Performance metric recommendations
    if (dashboard.rum.avg_lcp && dashboard.rum.avg_lcp > 3000) {
      recommendations.push(
        "🐌 High LCP detected in RUM data: Optimize hero images and critical rendering path",
      );
    }
    if (dashboard.rum.avg_cls && dashboard.rum.avg_cls > 0.15) {
      recommendations.push(
        "📐 High CLS detected: Add size attributes and reserve space for dynamic content",
      );
    }

    return recommendations.slice(0, 5); // Top 5 recommendations
  }

  private generateNextActions(dashboard: DashboardData): string[] {
    const actions: string[] = [];

    // Based on epic completion
    if (dashboard.epic.completion_percentage < 25) {
      actions.push("Run: bun perf:baseline");
      actions.push("Test RUM system: Visit site and check /api/rum endpoint");
      actions.push("Validate budgets: bun perf:budgets");
    } else if (dashboard.epic.completion_percentage < 50) {
      actions.push("Analyze bundles: bun perf:analyze");
      actions.push("Identify dynamic import candidates in components/");
      actions.push("Convert 2-3 heavy components to next/dynamic");
    } else if (dashboard.epic.completion_percentage < 75) {
      actions.push("Audit component hydration boundaries");
      actions.push("Implement server component conversion");
      actions.push("Remove identified unused CSS classes");
    } else {
      actions.push("Run comprehensive performance validation");
      actions.push("Document epic achievements and metrics");
      actions.push("Plan Phase 5 or next optimization cycle");
    }

    // Budget-based actions
    if (dashboard.budgets.failures > 0) {
      actions.unshift(
        "URGENT: Fix budget failures - check latest budget report",
      );
    }

    return actions.slice(0, 4); // Top 4 actions
  }

  renderTable(dashboard: DashboardData): void {
    console.log("\n🎭 Performance Optimization Epic Dashboard");
    console.log("=========================================");
    console.log(
      `📅 Generated: ${new Date(dashboard.timestamp).toLocaleString()}`,
    );
    console.log(`🏷️  Epic: ${dashboard.epic.name}`);
    console.log(`📊 Phase: ${dashboard.epic.phase}`);
    console.log(
      `✅ Progress: ${dashboard.epic.completion_percentage.toFixed(1)}% (${dashboard.epic.status})`,
    );

    // Bundle Status
    console.log("\n📦 Bundle Metrics:");
    console.log("==================");
    if (Object.keys(dashboard.bundle.baseline).length > 0) {
      for (const [metric, baseline] of Object.entries(
        dashboard.bundle.baseline,
      )) {
        const current = dashboard.bundle.current[metric] || baseline;
        const target = dashboard.bundle.targets[metric] || 0;
        const improvement = dashboard.bundle.improvements[metric] || 0;
        const status = current <= target ? "✅" : "⚠️";

        console.log(
          `  ${status} ${metric}: ${current.toFixed(1)} (${improvement >= 0 ? "+" : ""}${improvement.toFixed(1)}% vs baseline, target: ${target})`,
        );
      }
    } else {
      console.log(
        "  🔍 No bundle baseline data available. Run: bun perf:baseline",
      );
    }

    // Performance Metrics
    console.log("\n⚡ Performance Metrics:");
    console.log("======================");
    if (Object.keys(dashboard.metrics.baseline).length > 0) {
      for (const [metric, baseline] of Object.entries(
        dashboard.metrics.baseline,
      )) {
        const current = dashboard.metrics.current[metric] || baseline;
        const target = dashboard.metrics.targets[metric] || 0;
        const improvement = dashboard.metrics.improvements[metric] || 0;
        const status = current <= target ? "✅" : "⚠️";

        const unit = metric.includes("_ms")
          ? "ms"
          : metric === "cls"
            ? ""
            : metric.includes("score")
              ? "/100"
              : "";
        console.log(
          `  ${status} ${metric}: ${current.toFixed(metric === "cls" ? 3 : 0)}${unit} (${improvement >= 0 ? "+" : ""}${improvement.toFixed(1)}% vs baseline)`,
        );
      }
    } else {
      console.log(
        "  📊 No performance metrics available. Run Lighthouse or check RUM data.",
      );
    }

    // Budget Status
    console.log("\n🎯 Budget Status:");
    console.log("================");
    const budgetIcon =
      dashboard.budgets.status === "pass"
        ? "✅"
        : dashboard.budgets.status === "warn"
          ? "⚠️"
          : "❌";
    console.log(
      `  ${budgetIcon} Overall: ${dashboard.budgets.status.toUpperCase()}`,
    );
    console.log(
      `  📊 Checks: ${dashboard.budgets.passed}/${dashboard.budgets.total_checks} passing`,
    );
    if (dashboard.budgets.warnings > 0)
      console.log(`  ⚠️  Warnings: ${dashboard.budgets.warnings}`);
    if (dashboard.budgets.failures > 0)
      console.log(`  ❌ Failures: ${dashboard.budgets.failures}`);

    // RUM Status
    console.log("\n📊 Real User Monitoring:");
    console.log("========================");
    if (dashboard.rum.available) {
      console.log(`  ✅ RUM System: Active`);
      console.log(
        `  📈 Recent Sessions: ${dashboard.rum.recent_sessions || 0}`,
      );
      if (dashboard.rum.avg_lcp) {
        console.log(`  ⚡ Avg LCP: ${dashboard.rum.avg_lcp}ms`);
      }
      if (dashboard.rum.avg_cls) {
        console.log(`  📐 Avg CLS: ${dashboard.rum.avg_cls}`);
      }
    } else {
      console.log("  ❌ RUM System: Not available");
    }

    // Recommendations
    if (dashboard.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      console.log("==================");
      for (const rec of dashboard.recommendations) {
        console.log(`  ${rec}`);
      }
    }

    // Next Actions
    if (dashboard.next_actions.length > 0) {
      console.log("\n🚀 Next Actions:");
      console.log("================");
      for (const action of dashboard.next_actions) {
        console.log(`  • ${action}`);
      }
    }

    console.log("\n" + "=".repeat(50));
  }

  renderJSON(dashboard: DashboardData): void {
    console.log(JSON.stringify(dashboard, null, 2));
  }
}

// CLI Implementation
async function main() {
  const { values: args } = parseArgs({
    args: process.argv.slice(2),
    options: {
      json: {
        type: "boolean",
        default: false,
        short: "j",
      },
      detailed: {
        type: "boolean",
        default: false,
        short: "d",
      },
      help: {
        type: "boolean",
        default: false,
        short: "h",
      },
    },
  });

  if (args.help) {
    console.log(`
🎭 Performance Dashboard

Usage: bun scripts/perf/dashboard.ts [options]

Options:
  -j, --json        Output as JSON
  -d, --detailed    Include detailed metrics
  -h, --help        Show this help message

Examples:
  bun scripts/perf/dashboard.ts
  bun scripts/perf/dashboard.ts --json
  bun scripts/perf/dashboard.ts --detailed
    `);
    process.exit(0);
  }

  try {
    const dashboard = new PerformanceDashboard();
    const data = await dashboard.generateDashboard();

    if (args.json) {
      dashboard.renderJSON(data);
    } else {
      dashboard.renderTable(data);
    }

    // Exit with warning if epic is behind schedule
    if (data.epic.completion_percentage < 25 && data.budgets.failures > 0) {
      process.exit(1); // Critical issues
    }
  } catch (error) {
    console.error(
      "❌ Dashboard generation failed:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}
