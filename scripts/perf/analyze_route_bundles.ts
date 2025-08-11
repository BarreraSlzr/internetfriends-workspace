#!/usr/bin/env bun

/**
 * Route Bundle Analyzer for Performance Optimization Epic
 *
 * This script analyzes Next.js build outputs to track bundle sizes per route,
 * identify the largest contributors, and generate baseline artifacts for
 * performance tracking.
 *
 * Usage:
 *   bun scripts/perf/analyze_route_bundles.ts
 *   bun scripts/perf/analyze_route_bundles.ts --output=json
 *   bun scripts/perf/analyze_route_bundles.ts --baseline
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  readdirSync,
  statSync,
} from "fs";
import { join, basename, extname } from "path";
import { parseArgs } from "util";

interface BundleEntry {
  name: string;
  size: number;
  gzipSize?: number;
  route?: string;
  type: "js" | "css" | "asset";
  category: "framework" | "ui" | "data" | "vendor" | "app" | "unknown";
}

interface RouteBundle {
  route: string;
  totalSize: number;
  jsSize: number;
  cssSize: number;
  assetSize: number;
  chunks: BundleEntry[];
  largestContributors: BundleEntry[];
}

interface BundleAnalysis {
  timestamp: string;
  version: string;
  totalBundleSize: number;
  totalJsSize: number;
  totalCssSize: number;
  totalAssetSize: number;
  routes: RouteBundle[];
  topContributors: BundleEntry[];
  recommendations: string[];
}

class RouteBundleAnalyzer {
  private buildDir: string;
  private staticDir: string;
  private outputDir: string;

  constructor() {
    this.buildDir = join(process.cwd(), ".next");
    this.staticDir = join(this.buildDir, "static");
    this.outputDir = join(process.cwd(), "scripts/perf/artifacts");
  }

  async analyze(): Promise<BundleAnalysis> {
    console.log("🔍 Analyzing Next.js bundle structure...");

    if (!existsSync(this.buildDir)) {
      throw new Error("Build directory not found. Run `bun run build` first.");
    }

    const analysis: BundleAnalysis = {
      timestamp: new Date().toISOString(),
      version: this.getProjectVersion(),
      totalBundleSize: 0,
      totalJsSize: 0,
      totalCssSize: 0,
      totalAssetSize: 0,
      routes: [],
      topContributors: [],
      recommendations: [],
    };

    // Analyze static chunks and assets
    const chunks = await this.analyzeStaticChunks();
    analysis.topContributors = chunks
      .sort((a, b) => b.size - a.size)
      .slice(0, 10);

    // Calculate totals
    for (const chunk of chunks) {
      analysis.totalBundleSize += chunk.size;
      if (chunk.type === "js") analysis.totalJsSize += chunk.size;
      else if (chunk.type === "css") analysis.totalCssSize += chunk.size;
      else analysis.totalAssetSize += chunk.size;
    }

    // Analyze routes (if build manifest exists)
    analysis.routes = await this.analyzeRoutes(chunks);

    // Generate recommendations
    analysis.recommendations = this.generateRecommendations(analysis);

    return analysis;
  }

  private async analyzeStaticChunks(): Promise<BundleEntry[]> {
    const chunks: BundleEntry[] = [];

    if (!existsSync(this.staticDir)) {
      console.warn("⚠️  Static directory not found, analyzing build output...");
      return this.analyzeAlternativeBuildOutput();
    }

    // Analyze chunks directory
    const chunksDir = join(this.staticDir, "chunks");
    if (existsSync(chunksDir)) {
      const chunkFiles = readdirSync(chunksDir, {
        recursive: true,
        withFileTypes: true,
      });

      for (const file of chunkFiles) {
        if (file.isFile()) {
          const filePath = join(chunksDir, file.name);
          const stats = statSync(filePath);
          const ext = extname(file.name);

          chunks.push({
            name: file.name,
            size: stats.size,
            type: ext === ".js" ? "js" : ext === ".css" ? "css" : "asset",
            category: this.categorizeChunk(file.name),
          });
        }
      }
    }

    // Analyze CSS files
    const cssDir = join(this.staticDir, "css");
    if (existsSync(cssDir)) {
      const cssFiles = readdirSync(cssDir);

      for (const file of cssFiles) {
        const filePath = join(cssDir, file);
        const stats = statSync(filePath);

        chunks.push({
          name: file,
          size: stats.size,
          type: "css",
          category: "ui",
        });
      }
    }

    // Analyze media files
    const mediaDir = join(this.staticDir, "media");
    if (existsSync(mediaDir)) {
      const mediaFiles = readdirSync(mediaDir);

      for (const file of mediaFiles) {
        const filePath = join(mediaDir, file);
        const stats = statSync(filePath);

        chunks.push({
          name: file,
          size: stats.size,
          type: "asset",
          category: "app",
        });
      }
    }

    return chunks;
  }

  private analyzeAlternativeBuildOutput(): BundleEntry[] {
    // Fallback analysis for different build configurations
    const chunks: BundleEntry[] = [];

    // Try to find build manifest or trace files
    const manifestPath = join(this.buildDir, "build-manifest.json");
    const tracePath = join(this.buildDir, "trace");

    if (existsSync(manifestPath)) {
      try {
        const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
        console.log("📋 Found build manifest, analyzing...");

        // Process manifest entries
        for (const [route, files] of Object.entries(manifest.pages || {})) {
          if (Array.isArray(files)) {
            for (const file of files) {
              const filePath = join(this.buildDir, file);
              if (existsSync(filePath)) {
                const stats = statSync(filePath);
                const ext = extname(file);

                chunks.push({
                  name: basename(file),
                  size: stats.size,
                  route,
                  type: ext === ".js" ? "js" : ext === ".css" ? "css" : "asset",
                  category: this.categorizeChunk(file),
                });
              }
            }
          }
        }
      } catch (error) {
        console.warn("⚠️  Could not parse build manifest:", error);
      }
    }

    return chunks;
  }

  private async analyzeRoutes(chunks: BundleEntry[]): Promise<RouteBundle[]> {
    const routeMap = new Map<string, BundleEntry[]>();

    // Group chunks by route
    for (const chunk of chunks) {
      if (chunk.route) {
        if (!routeMap.has(chunk.route)) {
          routeMap.set(chunk.route, []);
        }
        routeMap.get(chunk.route)!.push(chunk);
      }
    }

    const routes: RouteBundle[] = [];

    for (const [route, routeChunks] of routeMap.entries()) {
      const totalSize = routeChunks.reduce((sum, chunk) => sum + chunk.size, 0);
      const jsSize = routeChunks
        .filter((c) => c.type === "js")
        .reduce((sum, chunk) => sum + chunk.size, 0);
      const cssSize = routeChunks
        .filter((c) => c.type === "css")
        .reduce((sum, chunk) => sum + chunk.size, 0);
      const assetSize = routeChunks
        .filter((c) => c.type === "asset")
        .reduce((sum, chunk) => sum + chunk.size, 0);

      routes.push({
        route,
        totalSize,
        jsSize,
        cssSize,
        assetSize,
        chunks: routeChunks,
        largestContributors: routeChunks
          .sort((a, b) => b.size - a.size)
          .slice(0, 5),
      });
    }

    return routes.sort((a, b) => b.totalSize - a.totalSize);
  }

  private categorizeChunk(filename: string): BundleEntry["category"] {
    const name = filename.toLowerCase();

    if (
      name.includes("react") ||
      name.includes("next") ||
      name.includes("webpack")
    ) {
      return "framework";
    }
    if (
      name.includes("chart") ||
      name.includes("graph") ||
      name.includes("visual")
    ) {
      return "data";
    }
    if (name.includes("vendor") || name.includes("node_modules")) {
      return "vendor";
    }
    if (
      name.includes("component") ||
      name.includes("ui") ||
      name.includes("style")
    ) {
      return "ui";
    }
    if (
      name.includes("page") ||
      name.includes("route") ||
      name.includes("app")
    ) {
      return "app";
    }

    return "unknown";
  }

  private generateRecommendations(analysis: BundleAnalysis): string[] {
    const recommendations: string[] = [];
    const jsThreshold = 150 * 1024; // 150KB
    const cssThreshold = 50 * 1024; // 50KB

    // Bundle size recommendations
    if (analysis.totalJsSize > jsThreshold) {
      recommendations.push(
        `🚨 Large JS bundle detected (${this.formatBytes(analysis.totalJsSize)}). Consider code splitting and dynamic imports.`,
      );
    }

    if (analysis.totalCssSize > cssThreshold) {
      recommendations.push(
        `🎨 Large CSS bundle detected (${this.formatBytes(analysis.totalCssSize)}). Consider critical CSS extraction.`,
      );
    }

    // Top contributor analysis
    const largeChunks = analysis.topContributors.filter(
      (c) => c.size > 50 * 1024,
    );
    if (largeChunks.length > 0) {
      recommendations.push(
        `📦 ${largeChunks.length} chunks over 50KB detected. Top offender: ${largeChunks[0].name} (${this.formatBytes(largeChunks[0].size)})`,
      );
    }

    // Route-specific recommendations
    const heavyRoutes = analysis.routes.filter((r) => r.totalSize > 200 * 1024);
    if (heavyRoutes.length > 0) {
      recommendations.push(
        `🛣️  ${heavyRoutes.length} routes over 200KB detected. Consider lazy loading for ${heavyRoutes[0].route}`,
      );
    }

    return recommendations;
  }

  private getProjectVersion(): string {
    try {
      const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
      return packageJson.version || "0.0.0";
    } catch {
      return "0.0.0";
    }
  }

  private formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";

    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  }

  async saveBaseline(analysis: BundleAnalysis): Promise<void> {
    const baselinePath = join(this.outputDir, "route_bundle_baseline.json");
    writeFileSync(baselinePath, JSON.stringify(analysis, null, 2));
    console.log(`📊 Baseline saved to: ${baselinePath}`);
  }

  generateReport(
    analysis: BundleAnalysis,
    format: "table" | "json" = "table",
  ): void {
    if (format === "json") {
      console.log(JSON.stringify(analysis, null, 2));
      return;
    }

    console.log("\n🎯 Bundle Analysis Report");
    console.log("========================");
    console.log(`📅 Generated: ${analysis.timestamp}`);
    console.log(`📦 Version: ${analysis.version}`);
    console.log(
      `📊 Total Bundle: ${this.formatBytes(analysis.totalBundleSize)}`,
    );
    console.log(`🟨 JavaScript: ${this.formatBytes(analysis.totalJsSize)}`);
    console.log(`🎨 CSS: ${this.formatBytes(analysis.totalCssSize)}`);
    console.log(`📁 Assets: ${this.formatBytes(analysis.totalAssetSize)}`);

    console.log("\n🔝 Top Contributors:");
    for (const [index, chunk] of analysis.topContributors.entries()) {
      const percentage = (
        (chunk.size / analysis.totalBundleSize) *
        100
      ).toFixed(1);
      console.log(
        `  ${index + 1}. ${chunk.name} - ${this.formatBytes(chunk.size)} (${percentage}%) [${chunk.category}]`,
      );
    }

    if (analysis.routes.length > 0) {
      console.log("\n🛣️  Route Analysis:");
      for (const route of analysis.routes.slice(0, 5)) {
        console.log(`  ${route.route} - ${this.formatBytes(route.totalSize)}`);
        console.log(
          `    JS: ${this.formatBytes(route.jsSize)}, CSS: ${this.formatBytes(route.cssSize)}`,
        );
      }
    }

    if (analysis.recommendations.length > 0) {
      console.log("\n💡 Recommendations:");
      for (const rec of analysis.recommendations) {
        console.log(`  ${rec}`);
      }
    }
  }
}

// CLI Implementation
async function main() {
  const { values: args } = parseArgs({
    args: process.argv.slice(2),
    options: {
      output: {
        type: "string",
        default: "table",
        short: "o",
      },
      baseline: {
        type: "boolean",
        default: false,
        short: "b",
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
🎯 Route Bundle Analyzer

Usage: bun scripts/perf/analyze_route_bundles.ts [options]

Options:
  -o, --output <format>   Output format: table, json (default: table)
  -b, --baseline         Save analysis as baseline for comparison
  -h, --help             Show this help message

Examples:
  bun scripts/perf/analyze_route_bundles.ts
  bun scripts/perf/analyze_route_bundles.ts --output json
  bun scripts/perf/analyze_route_bundles.ts --baseline
    `);
    process.exit(0);
  }

  try {
    const analyzer = new RouteBundleAnalyzer();
    const analysis = await analyzer.analyze();

    analyzer.generateReport(analysis, args.output as "table" | "json");

    if (args.baseline) {
      await analyzer.saveBaseline(analysis);
    }

    // Exit with warning code if bundle is over thresholds
    const jsOverThreshold = analysis.totalJsSize > 460 * 1024; // 460KB fail threshold
    const cssOverThreshold = analysis.totalCssSize > 105 * 1024; // 105KB fail threshold

    if (jsOverThreshold || cssOverThreshold) {
      console.warn("\n⚠️  Bundle size exceeds performance budgets");
      process.exit(1);
    }
  } catch (error) {
    console.error(
      "❌ Analysis failed:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}
