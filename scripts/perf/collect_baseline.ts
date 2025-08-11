#!/usr/bin/env bun

import { execSync } from "child_process";
import { writeFile } from "fs/promises";

interface BaselineResults {
  timestamp: string;
  commitHash: string;
  epic: "performance-optimization";
  phase: "baseline";
  results: {
    bundle?: any;
    scss?: any;
    webVitals?: any;
  };
  summary: {
    bundleAnalyzed: boolean;
    scssAnalyzed: boolean;
    totalFiles: number;
    totalSizeKB: number;
    modernizationPercent: number;
    readyForPhase2: boolean;
  };
}

const getCommitHash = (): string => {
  try {
    return execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();
  } catch {
    return "unknown";
  }
};

const runCommand = async (
  command: string,
  description: string,
): Promise<any> => {
  console.log(`\n🚀 ${description}...`);
  console.log(`   Command: ${command}`);

  try {
    const output = execSync(command, {
      encoding: "utf8",
      stdio: "pipe",
      cwd: process.cwd(),
    });

    // Try to extract JSON from output (look for epic metrics)
    const lines = output.split("\n");
    const metricsIndex = lines.findIndex((line) =>
      line.includes("🎭 EPIC METRICS UPDATE:"),
    );

    if (metricsIndex !== -1 && metricsIndex + 1 < lines.length) {
      // Find the JSON block after the epic metrics header
      let jsonStart = metricsIndex + 1;
      let jsonEnd = jsonStart;

      // Find the end of the JSON block
      for (let i = jsonStart; i < lines.length; i++) {
        if (lines[i].trim() === "}") {
          jsonEnd = i;
          break;
        }
        if (
          lines[i].trim() &&
          !lines[i].includes("{") &&
          !lines[i].includes("}") &&
          !lines[i].includes('"')
        ) {
          break;
        }
      }

      const jsonLines = lines.slice(jsonStart, jsonEnd + 1);
      const jsonStr = jsonLines.join("\n").trim();

      try {
        const parsed = JSON.parse(jsonStr);
        console.log("   ✅ Successfully parsed epic metrics");
        return parsed;
      } catch (parseError) {
        // Try to parse the rawOutput if it's JSON
        try {
          const parsed = JSON.parse(jsonStr);
          console.log("   ✅ Successfully parsed raw JSON");
          return parsed;
        } catch {
          console.log("   JSON parse failed, capturing raw output");
          return { rawOutput: jsonStr };
        }
      }
    }

    console.log("   ✅ Command completed successfully");
    return { success: true, output: output.slice(-200) };
  } catch (error) {
    console.warn(`   ⚠️  ${description} failed:`, error.message);
    return { error: error.message, success: false };
  }
};

const checkBuildExists = (): boolean => {
  try {
    execSync("ls .next/static", { stdio: "ignore" });
    return true;
  } catch {
    try {
      execSync("ls .vercel/output/static", { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
};

const main = async (): Promise<void> => {
  console.log("🎯 PERFORMANCE OPTIMIZATION EPIC");
  console.log("📊 Phase 1: Baseline Collection");
  console.log("════════════════════════════════\n");

  const startTime = Date.now();
  const results: BaselineResults = {
    timestamp: new Date().toISOString(),
    commitHash: getCommitHash(),
    epic: "performance-optimization",
    phase: "baseline",
    results: {},
    summary: {
      bundleAnalyzed: false,
      scssAnalyzed: false,
      totalFiles: 0,
      totalSizeKB: 0,
      modernizationPercent: 0,
      readyForPhase2: false,
    },
  };

  console.log(`🔗 Commit: ${results.commitHash}`);
  console.log(`🕐 Started: ${results.timestamp}\n`);

  // Check if build exists, run build if needed
  if (!checkBuildExists()) {
    console.log("📦 No build found, running production build...");
    try {
      execSync("bun run build", { stdio: "inherit" });
      console.log("✅ Build completed\n");
    } catch (error) {
      console.warn("⚠️  Build failed, bundle analysis will be limited\n");
    }
  }

  // Step 1: Bundle Analysis
  console.log("═══ BUNDLE ANALYSIS ═══");
  const bundleResult = await runCommand(
    "bun scripts/perf/snapshot_bundle.ts",
    "Analyzing bundle sizes",
  );
  results.results.bundle = bundleResult;
  results.summary.bundleAnalyzed = bundleResult.success !== false;

  // Step 2: SCSS Analysis
  console.log("\n═══ SCSS ANALYSIS ═══");
  const scssResult = await runCommand(
    "bun scripts/perf/scan_scss_modules.ts",
    "Analyzing SCSS modules",
  );
  results.results.scss = scssResult;
  results.summary.scssAnalyzed = scssResult.success !== false;

  // Extract summary metrics from results
  let bundleMetrics = null;
  let scssMetrics = null;

  // Parse bundle metrics
  if (results.results.bundle?.metrics) {
    bundleMetrics = results.results.bundle.metrics.bundle;
  } else if (results.results.bundle?.rawOutput) {
    try {
      const parsed = JSON.parse(results.results.bundle.rawOutput);
      bundleMetrics = parsed.metrics?.bundle;
    } catch {}
  }

  // Parse SCSS metrics
  if (results.results.scss?.metrics) {
    scssMetrics = results.results.scss.metrics.scss;
  } else if (results.results.scss?.rawOutput) {
    try {
      const parsed = JSON.parse(results.results.scss.rawOutput);
      scssMetrics = parsed.metrics?.scss;
    } catch {}
  }

  // Apply metrics to summary
  if (bundleMetrics) {
    results.summary.totalSizeKB += bundleMetrics.jsKB + bundleMetrics.cssKB;
    results.summary.totalFiles += bundleMetrics.totalFiles;
  }

  if (scssMetrics) {
    results.summary.totalFiles += scssMetrics.totalFiles;
    results.summary.totalSizeKB += scssMetrics.totalKB;
    results.summary.modernizationPercent = scssMetrics.modernizationPercent;
  }

  // Determine readiness for Phase 2
  results.summary.readyForPhase2 =
    results.summary.bundleAnalyzed &&
    results.summary.scssAnalyzed &&
    results.summary.totalFiles > 0;

  const duration = Math.round((Date.now() - startTime) / 1000);

  console.log("\n🏁 BASELINE COLLECTION COMPLETE");
  console.log("════════════════════════════════");
  console.log(`⏱️  Duration: ${duration}s`);
  console.log(`📁 Total files analyzed: ${results.summary.totalFiles}`);
  console.log(
    `📊 Total size: ${Math.round(results.summary.totalSizeKB * 100) / 100}KB`,
  );
  console.log(
    `🔄 SCSS modernization: ${results.summary.modernizationPercent}%`,
  );
  console.log(
    `✅ Ready for Phase 2: ${results.summary.readyForPhase2 ? "YES" : "NO"}\n`,
  );

  // Save comprehensive results
  const resultsPath = "scripts/perf/snapshots/baseline-results.json";
  await writeFile(resultsPath, JSON.stringify(results, null, 2));
  console.log(`💾 Baseline results saved: ${resultsPath}\n`);

  // Epic progress update
  console.log("🎭 EPIC PROGRESS UPDATE:");
  const epicUpdate = {
    epic: "performance-optimization",
    phase: "baseline",
    status: results.summary.readyForPhase2 ? "completed" : "partial",
    progress: results.summary.readyForPhase2 ? 100 : 75,
    metrics: {
      baseline: {
        bundle: bundleMetrics,
        scss: scssMetrics,
        webVitals: null, // Will be populated after app integration
      },
      summary: results.summary,
    },
    timestamp: results.timestamp,
    nextPhase: results.summary.readyForPhase2
      ? "fonts_above_fold"
      : "complete_baseline",
  };

  console.log(JSON.stringify(epicUpdate, null, 2));

  if (results.summary.readyForPhase2) {
    console.log("\n🎯 NEXT STEPS:");
    console.log("1. Integrate PerformanceMetricsInitializer into app layout");
    console.log("2. Collect initial web vitals baseline");
    console.log("3. Start Phase 2: Fonts & Above-the-Fold optimization");
    console.log("\n💡 Run: bun scripts/perf/start_phase2.ts");
  } else {
    console.log("\n⚠️  BASELINE INCOMPLETE:");
    console.log(
      "Some analysis tools failed. Check the output above and retry.",
    );
  }
};

// Run if called directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("❌ Baseline collection failed:", error);
    process.exit(1);
  });
}

export { main as collectBaseline, BaselineResults };
