#!/usr/bin/env bun

/**
 * Performance Budget Checker for CI/CD Pipeline
 *
 * This script validates current performance metrics against defined budgets,
 * providing exit codes suitable for CI integration and detailed reporting
 * for performance regression detection.
 *
 * Usage:
 *   bun scripts/perf/check_budgets.ts
 *   bun scripts/perf/check_budgets.ts --ci
 *   bun scripts/perf/check_budgets.ts --report-only
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { parseArgs } from "util";

interface BudgetThreshold {
  warn: number;
  fail: number;
  description: string;
}

interface PerformanceBudgets {
  bundle: Record<string, BudgetThreshold>;
  metrics: Record<string, BudgetThreshold>;
  network_conditions: Record<string, any>;
  routes_to_test: string[];
  epic_targets: Record<string, any>;
  version: string;
  last_updated: string;
}

interface BudgetResult {
  metric: string;
  current: number;
  budget: BudgetThreshold;
  status: "pass" | "warn" | "fail";
  delta: number;
  percentage: number;
}

interface BudgetReport {
  timestamp: string;
  overall_status: "pass" | "warn" | "fail";
  total_checks: number;
  passed: number;
  warnings: number;
  failures: number;
  results: BudgetResult[];
  summary: string[];
  recommendations: string[];
}

class BudgetChecker {
  private budgets: PerformanceBudgets;
  private artifactsDir: string;
  private buildDir: string;

  constructor() {
    this.artifactsDir = join(process.cwd(), "scripts/perf/artifacts");
    this.buildDir = join(process.cwd(), ".next");
    this.budgets = this.loadBudgets();
  }

  private loadBudgets(): PerformanceBudgets {
    const budgetPath = join(process.cwd(), "perf.budgets.json");

    if (!existsSync(budgetPath)) {
      throw new Error(
        "Performance budgets not found. Create perf.budgets.json first.",
      );
    }

    try {
      return JSON.parse(readFileSync(budgetPath, "utf8"));
    } catch (error) {
      throw new Error(
        `Failed to parse performance budgets: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  async checkBudgets(): Promise<BudgetReport> {
    console.log("🎯 Checking performance budgets...");

    const report: BudgetReport = {
      timestamp: new Date().toISOString(),
      overall_status: "pass",
      total_checks: 0,
      passed: 0,
      warnings: 0,
      failures: 0,
      results: [],
      summary: [],
      recommendations: [],
    };

    // Check bundle budgets
    const bundleResults = await this.checkBundleBudgets();
    report.results.push(...bundleResults);

    // Check metrics budgets (if Lighthouse data available)
    const metricsResults = await this.checkMetricsBudgets();
    report.results.push(...metricsResults);

    // Calculate totals
    report.total_checks = report.results.length;
    report.passed = report.results.filter((r) => r.status === "pass").length;
    report.warnings = report.results.filter((r) => r.status === "warn").length;
    report.failures = report.results.filter((r) => r.status === "fail").length;

    // Determine overall status
    if (report.failures > 0) {
      report.overall_status = "fail";
    } else if (report.warnings > 0) {
      report.overall_status = "warn";
    }

    // Generate summary and recommendations
    report.summary = this.generateSummary(report);
    report.recommendations = this.generateRecommendations(report);

    return report;
  }

  private async checkBundleBudgets(): Promise<BudgetResult[]> {
    const results: BudgetResult[] = [];

    // Get current bundle sizes
    const bundleData = await this.getBundleData();

    for (const [metric, budget] of Object.entries(this.budgets.bundle)) {
      const currentValue = bundleData[metric];

      if (currentValue !== undefined) {
        const result = this.evaluateThreshold(metric, currentValue, budget);
        results.push(result);
      } else {
        console.warn(`⚠️  Metric ${metric} not available in current build`);
      }
    }

    return results;
  }

  private async checkMetricsBudgets(): Promise<BudgetResult[]> {
    const results: BudgetResult[] = [];

    // Try to load Lighthouse data
    const lighthouseData = await this.getLighthouseData();

    if (!lighthouseData) {
      console.log("ℹ️  No Lighthouse data available, skipping metrics budgets");
      return results;
    }

    for (const [metric, budget] of Object.entries(this.budgets.metrics)) {
      const currentValue = lighthouseData[metric];

      if (currentValue !== undefined) {
        const result = this.evaluateThreshold(metric, currentValue, budget);
        results.push(result);
      }
    }

    return results;
  }

  private evaluateThreshold(
    metric: string,
    current: number,
    budget: BudgetThreshold,
  ): BudgetResult {
    let status: BudgetResult["status"] = "pass";

    if (current >= budget.fail) {
      status = "fail";
    } else if (current >= budget.warn) {
      status = "warn";
    }

    const delta = current - budget.warn;
    const percentage = (current / budget.warn) * 100 - 100;

    return {
      metric,
      current,
      budget,
      status,
      delta,
      percentage,
    };
  }

  private async getBundleData(): Promise<Record<string, number>> {
    const data: Record<string, number> = {};

    // Try to get data from baseline file
    const baselinePath = join(this.artifactsDir, "route_bundle_baseline.json");
    if (existsSync(baselinePath)) {
      try {
        const baseline = JSON.parse(readFileSync(baselinePath, "utf8"));
        data.js_initial_kb = baseline.totalJsSize / 1024;
        data.css_total_kb = baseline.totalCssSize / 1024;
        data.total_assets_mb = baseline.totalBundleSize / (1024 * 1024);

        // Find max route size
        if (baseline.routes && baseline.routes.length > 0) {
          const maxRoute = baseline.routes.reduce((max: any, route: any) =>
            route.jsSize > max.jsSize ? route : max,
          );
          data.route_max_js_kb = maxRoute.jsSize / 1024;
        }
      } catch (error) {
        console.warn(
          "⚠️  Could not read baseline data:",
          error instanceof Error ? error.message : String(error),
        );
      }
    }

    // Fallback: analyze current build directly
    if (Object.keys(data).length === 0) {
      const buildData = await this.analyzeBuildDirect();
      Object.assign(data, buildData);
    }

    return data;
  }

  private async analyzeBuildDirect(): Promise<Record<string, number>> {
    const data: Record<string, number> = {};

    if (!existsSync(this.buildDir)) {
      console.warn("⚠️  Build directory not found. Run `bun run build` first.");
      return data;
    }

    // Quick analysis of static files
    const staticDir = join(this.buildDir, "static");
    if (existsSync(staticDir)) {
      let jsSize = 0;
      let cssSize = 0;
      let assetSize = 0;

      const analyzeDir = (dir: string, type: "js" | "css" | "asset") => {
        if (!existsSync(dir)) return;

        const fs = require("fs");
        const files = fs.readdirSync(dir, { recursive: true });

        for (const file of files) {
          const filePath = join(dir, file);
          if (fs.statSync(filePath).isFile()) {
            const size = fs.statSync(filePath).size;
            if (type === "js") jsSize += size;
            else if (type === "css") cssSize += size;
            else assetSize += size;
          }
        }
      };

      analyzeDir(join(staticDir, "chunks"), "js");
      analyzeDir(join(staticDir, "css"), "css");
      analyzeDir(join(staticDir, "media"), "asset");

      data.js_initial_kb = jsSize / 1024;
      data.css_total_kb = cssSize / 1024;
      data.total_assets_mb = (jsSize + cssSize + assetSize) / (1024 * 1024);
      data.route_max_js_kb = jsSize / 1024; // Approximation
    }

    return data;
  }

  private async getLighthouseData(): Promise<Record<string, number> | null> {
    const lighthousePath = join(this.artifactsDir, "lighthouse_report.json");

    if (!existsSync(lighthousePath)) {
      return null;
    }

    try {
      const lighthouse = JSON.parse(readFileSync(lighthousePath, "utf8"));

      return {
        lcp_mobile_ms:
          lighthouse.audits?.["largest-contentful-paint"]?.numericValue || 0,
        ttfi_ms: lighthouse.audits?.["interactive"]?.numericValue || 0,
        cls: lighthouse.audits?.["cumulative-layout-shift"]?.numericValue || 0,
        fcp_ms:
          lighthouse.audits?.["first-contentful-paint"]?.numericValue || 0,
        ttfb_ms: lighthouse.audits?.["server-response-time"]?.numericValue || 0,
        lighthouse_performance:
          lighthouse.categories?.performance?.score * 100 || 0,
      };
    } catch (error) {
      console.warn(
        "⚠️  Could not parse Lighthouse data:",
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  private generateSummary(report: BudgetReport): string[] {
    const summary: string[] = [];

    summary.push(`Overall Status: ${report.overall_status.toUpperCase()}`);
    summary.push(`Total Checks: ${report.total_checks}`);
    summary.push(`✅ Passed: ${report.passed}`);

    if (report.warnings > 0) {
      summary.push(`⚠️  Warnings: ${report.warnings}`);
    }

    if (report.failures > 0) {
      summary.push(`❌ Failures: ${report.failures}`);
    }

    // Highlight critical failures
    const criticalFailures = report.results.filter(
      (r) =>
        r.status === "fail" &&
        (r.metric.includes("js_initial") || r.metric.includes("lcp")),
    );

    if (criticalFailures.length > 0) {
      summary.push(
        `🚨 Critical performance issues detected in: ${criticalFailures.map((f) => f.metric).join(", ")}`,
      );
    }

    return summary;
  }

  private generateRecommendations(report: BudgetReport): string[] {
    const recommendations: string[] = [];

    const failedResults = report.results.filter((r) => r.status === "fail");
    const warnResults = report.results.filter((r) => r.status === "warn");

    // Bundle-specific recommendations
    const jsFails = failedResults.find((r) => r.metric === "js_initial_kb");
    if (jsFails) {
      recommendations.push(
        "🔧 Reduce initial JavaScript bundle: implement code splitting, dynamic imports, or remove unused dependencies",
      );
    }

    const cssFails = failedResults.find((r) => r.metric === "css_total_kb");
    if (cssFails) {
      recommendations.push(
        "🎨 Optimize CSS bundle: remove unused styles, implement critical CSS, or split non-critical styles",
      );
    }

    // Performance metrics recommendations
    const lcpFails = failedResults.find((r) => r.metric === "lcp_mobile_ms");
    if (lcpFails) {
      recommendations.push(
        "⚡ Improve Largest Contentful Paint: optimize hero images, implement preloading, or reduce render-blocking resources",
      );
    }

    const clsFails = failedResults.find((r) => r.metric === "cls");
    if (clsFails) {
      recommendations.push(
        "📐 Fix Cumulative Layout Shift: add size attributes to images, reserve space for dynamic content",
      );
    }

    // Warning-level recommendations
    if (warnResults.length > 0 && recommendations.length === 0) {
      recommendations.push(
        "📊 Consider performance optimizations to prevent future budget violations",
      );
    }

    // Epic-specific recommendations
    if (failedResults.length > 0) {
      recommendations.push(
        "🎭 Review Phase 4 epic targets and adjust implementation priority based on failed budgets",
      );
    }

    return recommendations;
  }

  generateReport(
    report: BudgetReport,
    format: "table" | "json" | "ci" = "table",
  ): void {
    if (format === "json") {
      console.log(JSON.stringify(report, null, 2));
      return;
    }

    if (format === "ci") {
      this.generateCIReport(report);
      return;
    }

    // Table format
    console.log("\n🎯 Performance Budget Report");
    console.log("============================");
    console.log(`📅 Generated: ${report.timestamp}`);

    console.log("\n📊 Summary:");
    for (const line of report.summary) {
      console.log(`  ${line}`);
    }

    console.log("\n📋 Detailed Results:");
    for (const result of report.results) {
      const icon =
        result.status === "pass"
          ? "✅"
          : result.status === "warn"
            ? "⚠️"
            : "❌";
      const current =
        result.metric.includes("_kb") || result.metric.includes("_mb")
          ? `${result.current.toFixed(2)} ${result.metric.includes("_mb") ? "MB" : "KB"}`
          : `${result.current.toFixed(0)}${result.metric.includes("_ms") ? "ms" : ""}`;

      console.log(
        `  ${icon} ${result.metric}: ${current} (${result.percentage.toFixed(1)}% of warn threshold)`,
      );

      if (result.status !== "pass") {
        console.log(
          `     Budget: warn=${result.budget.warn}, fail=${result.budget.fail}`,
        );
      }
    }

    if (report.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      for (const rec of report.recommendations) {
        console.log(`  ${rec}`);
      }
    }
  }

  private generateCIReport(report: BudgetReport): void {
    // Compact format for CI logs
    const status = report.overall_status.toUpperCase();
    console.log(
      `::${report.overall_status === "fail" ? "error" : "warning"} title=Performance Budget::${status}: ${report.failures} failures, ${report.warnings} warnings`,
    );

    // Output failing metrics for CI
    const failures = report.results.filter((r) => r.status === "fail");
    for (const failure of failures) {
      console.log(
        `::error file=perf.budgets.json,line=1,col=1::${failure.metric} exceeded fail threshold: ${failure.current} > ${failure.budget.fail}`,
      );
    }

    const warnings = report.results.filter((r) => r.status === "warn");
    for (const warning of warnings) {
      console.log(
        `::warning file=perf.budgets.json,line=1,col=1::${warning.metric} exceeded warn threshold: ${warning.current} > ${warning.budget.warn}`,
      );
    }
  }

  async saveReport(report: BudgetReport): Promise<void> {
    const reportPath = join(
      this.artifactsDir,
      `budget_report_${Date.now()}.json`,
    );
    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    console.log(`📄 Report saved to: ${reportPath}`);
  }
}

// CLI Implementation
async function main() {
  const { values: args } = parseArgs({
    args: process.argv.slice(2),
    options: {
      format: {
        type: "string",
        default: "table",
        short: "f",
      },
      ci: {
        type: "boolean",
        default: false,
      },
      "report-only": {
        type: "boolean",
        default: false,
      },
      save: {
        type: "boolean",
        default: false,
        short: "s",
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
🎯 Performance Budget Checker

Usage: bun scripts/perf/check_budgets.ts [options]

Options:
  -f, --format <type>     Output format: table, json, ci (default: table)
      --ci                CI-friendly output with GitHub Actions annotations
      --report-only       Generate report without failing on budget violations
  -s, --save              Save detailed report to artifacts directory
  -h, --help              Show this help message

Examples:
  bun scripts/perf/check_budgets.ts
  bun scripts/perf/check_budgets.ts --ci
  bun scripts/perf/check_budgets.ts --format json --save
    `);
    process.exit(0);
  }

  try {
    const checker = new BudgetChecker();
    const report = await checker.checkBudgets();

    const format = args.ci ? "ci" : (args.format as "table" | "json" | "ci");
    checker.generateReport(report, format);

    if (args.save) {
      await checker.saveReport(report);
    }

    // Exit codes for CI integration
    if (!args["report-only"]) {
      if (report.overall_status === "fail") {
        console.error("\n❌ Performance budget check failed");
        process.exit(1);
      } else if (report.overall_status === "warn") {
        console.warn("\n⚠️  Performance budget warnings detected");
        process.exit(0); // Don't fail CI on warnings
      }
    }

    console.log("\n✅ Performance budget check completed");
  } catch (error) {
    console.error(
      "❌ Budget check failed:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}
