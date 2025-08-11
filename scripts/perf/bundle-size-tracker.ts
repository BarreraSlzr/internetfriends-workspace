#!/usr/bin/env bun

/**
 * InternetFriends Performance Optimization - Bundle Size Tracker
 *
 * Phase 3 Code & Style Pruning Tool
 * Simple bundle size tracking and comparison for performance monitoring
 *
 * Usage:
 *   bun scripts/perf/bundle-size-tracker.ts
 *   bun scripts/perf/bundle-size-tracker.ts --compare
 */

import {
  readFileSync,
  writeFileSync,
  existsSync,
  statSync,
  readdirSync,
} from "fs";
import { join, relative, extname } from "path";
import { glob } from "glob";

interface BundleAsset {
  name: string;
  size: number;
  type: "js" | "css" | "scss" | "other";
  category: "initial" | "route" | "static";
}

interface BundleReport {
  timestamp: string;
  summary: {
    totalSize: number;
    jsSize: number;
    cssSize: number;
    scssSourceSize: number;
    assetCount: number;
    removedLegacyBytes: number;
  };
  assets: BundleAsset[];
  comparison?: {
    previousSize: number;
    sizeChange: number;
    percentChange: number;
  };
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

async function main() {
  const args = process.argv.slice(2);
  const shouldCompare = args.includes("--compare");

  console.log("📦 Starting bundle size analysis...\n");

  try {
    const projectRoot = process.cwd();
    const nextjsRoot = join(projectRoot, "nextjs-website");

    // Analyze SCSS source files
    const scssFiles = await glob("**/*.scss", {
      cwd: nextjsRoot,
      absolute: true,
      ignore: ["**/node_modules/**", "**/.next/**", "**/legacy/**"],
    });

    const scssAssets: BundleAsset[] = [];
    let scssSourceSize = 0;

    for (const file of scssFiles) {
      const stat = statSync(file);
      scssSourceSize += stat.size;
      scssAssets.push({
        name: relative(nextjsRoot, file),
        size: stat.size,
        type: "scss",
        category: "static",
      });
    }

    // Calculate legacy removal savings
    const legacyPath = join(nextjsRoot, "styles", "legacy");
    let removedLegacyBytes = 0;
    if (existsSync(legacyPath)) {
      const legacyFiles = await glob("**/*.scss", {
        cwd: legacyPath,
        absolute: true,
      });

      for (const file of legacyFiles) {
        removedLegacyBytes += statSync(file).size;
      }
    }

    // Look for built CSS files
    const buildPath = join(nextjsRoot, ".next");
    const cssAssets: BundleAsset[] = [];
    const jsAssets: BundleAsset[] = [];

    if (existsSync(buildPath)) {
      const staticFiles = await glob("static/**/*", {
        cwd: buildPath,
        absolute: true,
        nodir: true,
      });

      for (const file of staticFiles) {
        const stat = statSync(file);
        const relativePath = relative(join(buildPath, "static"), file);
        const ext = extname(file);

        let type: BundleAsset["type"] = "other";
        if (ext === ".js") type = "js";
        else if (ext === ".css") type = "css";

        const asset: BundleAsset = {
          name: relativePath,
          size: stat.size,
          type,
          category:
            relativePath.includes("_app") || relativePath.includes("main")
              ? "initial"
              : "route",
        };

        if (type === "css") cssAssets.push(asset);
        else if (type === "js") jsAssets.push(asset);
      }
    }

    // Build report
    const allAssets = [...scssAssets, ...cssAssets, ...jsAssets];
    const totalSize = allAssets.reduce((sum, asset) => sum + asset.size, 0);
    const jsSize = jsAssets.reduce((sum, asset) => sum + asset.size, 0);
    const cssSize = cssAssets.reduce((sum, asset) => sum + asset.size, 0);

    const report: BundleReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalSize,
        jsSize,
        cssSize,
        scssSourceSize,
        assetCount: allAssets.length,
        removedLegacyBytes,
      },
      assets: allAssets.sort((a, b) => b.size - a.size),
    };

    // Add comparison if requested
    if (shouldCompare) {
      const latestPath = join(
        projectRoot,
        "scripts",
        "perf",
        "snapshots",
        "bundle-size-latest.json",
      );
      if (existsSync(latestPath)) {
        try {
          const previousReport: BundleReport = JSON.parse(
            readFileSync(latestPath, "utf-8"),
          );
          const sizeChange =
            report.summary.totalSize - previousReport.summary.totalSize;
          const percentChange =
            (sizeChange / previousReport.summary.totalSize) * 100;

          report.comparison = {
            previousSize: previousReport.summary.totalSize,
            sizeChange,
            percentChange,
          };
        } catch (error) {
          console.warn("⚠️  Could not compare with previous report");
        }
      }
    }

    // Write report
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .split(".")[0];
    const reportPath = join(
      projectRoot,
      "scripts",
      "perf",
      "snapshots",
      `bundle-size-${timestamp}.json`,
    );
    const latestPath = join(
      projectRoot,
      "scripts",
      "perf",
      "snapshots",
      "bundle-size-latest.json",
    );

    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    writeFileSync(latestPath, JSON.stringify(report, null, 2));

    // Display results
    console.log(`📊 Bundle size analysis complete:`);
    console.log(`   • Total size: ${formatBytes(report.summary.totalSize)}`);
    console.log(
      `   • SCSS source: ${formatBytes(report.summary.scssSourceSize)}`,
    );
    console.log(`   • Built CSS: ${formatBytes(report.summary.cssSize)}`);
    console.log(`   • Built JS: ${formatBytes(report.summary.jsSize)}`);
    console.log(`   • Assets: ${report.summary.assetCount} files`);

    if (report.summary.removedLegacyBytes > 0) {
      console.log(
        `   • Legacy removed: ${formatBytes(report.summary.removedLegacyBytes)} 🎉`,
      );
    }

    if (report.comparison) {
      const change = report.comparison.sizeChange;
      const changeStr =
        change > 0 ? `+${formatBytes(change)}` : formatBytes(change);
      const percentStr =
        change > 0
          ? `+${report.comparison.percentChange.toFixed(2)}%`
          : `${report.comparison.percentChange.toFixed(2)}%`;

      console.log(`\n📈 Comparison with previous:`);
      console.log(
        `   • Previous: ${formatBytes(report.comparison.previousSize)}`,
      );
      console.log(`   • Change: ${changeStr} (${percentStr})`);
    }

    // Display largest assets
    if (report.assets.length > 0) {
      console.log("\n🏆 Largest assets:");
      report.assets.slice(0, 8).forEach((asset, index) => {
        console.log(
          `   ${index + 1}. ${asset.name}: ${formatBytes(asset.size)} [${asset.type}]`,
        );
      });
    }

    console.log(`\n📋 Report saved: ${relative(projectRoot, reportPath)}`);
  } catch (error) {
    console.error("❌ Error during analysis:", error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}
