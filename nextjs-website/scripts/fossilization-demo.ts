#!/usr/bin/env bun
/**
 * Fossilization CLI - Demo integration with component analysis
 * Shows how helper events can be captured and stored for historical analysis
 */

import {
  fossil,
  fossilizeScoringRun,
  fossilizeComponentAnalysis,
} from "@/lib/fossilization/fossil-storage";
import { generateStamp, getIsoTimestamp } from "@/lib/utils/timestamp";

interface HelperOutput {
  runId: string;
  startedAt: string;
  completedAt: string;
  total: number;
  averageScore: number;
  minScore: number;
  maxScore: number;
  issues: Record<string, string[]>;
  components: Array<{
    name: string;
    propsCount: number;
    hasDisabled: boolean;
    hasTestId: boolean;
    hasStamp: boolean;
    hasIsoTimestamp: boolean;
    hasRawDateUsage: boolean;
    score: number;
    suggestions: string[];
  }>;
}

async function demonstrateFossilization() {
  console.log("🦴 Fossilization System Demo");
  console.log("============================\n");

  // Simulate helper output (in real usage, this would come from the helper)
  const mockHelperOutput: HelperOutput = {
    runId: generateStamp(),
    startedAt: getIsoTimestamp(),
    completedAt: getIsoTimestamp(),
    total: 8,
    averageScore: 15.5,
    minScore: 0,
    maxScore: 75,
    issues: {
      Unknown: ["No Props interface found"],
      GlassRefinedAtomicProps: [
        "Too many props (14/8)",
        "Consider adding disabled prop",
      ],
      ProjectExplorerProps: [
        "Consider adding disabled prop",
        "Add data-testid for testing",
      ],
    },
    components: [
      {
        name: "GlassCardAtomic",
        propsCount: 8,
        hasDisabled: true,
        hasTestId: true,
        hasStamp: false,
        hasIsoTimestamp: false,
        hasRawDateUsage: false,
        score: 85,
        suggestions: ["Use generateStamp() for unique IDs"],
      },
      {
        name: "ProjectExplorer",
        propsCount: 4,
        hasDisabled: false,
        hasTestId: false,
        hasStamp: true,
        hasIsoTimestamp: true,
        hasRawDateUsage: false,
        score: 75,
        suggestions: [
          "Consider adding disabled prop",
          "Add data-testid for testing",
        ],
      },
    ],
  };

  console.log("📊 Processing helper output...");

  // Fossilize individual component analyses
  const sessionId = generateStamp();
  const fossilIds: string[] = [];

  for (const component of mockHelperOutput.components) {
    const fossilId = await fossilizeComponentAnalysis(
      component.name,
      component.name.includes("Atomic") ? "atomic" : "molecular",
      component.score,
      {
        hasDisabled: component.hasDisabled,
        hasTestId: component.hasTestId,
        hasStamp: component.hasStamp,
        hasIsoTimestamp: component.hasIsoTimestamp,
        hasRawDateUsage: component.hasRawDateUsage,
        propsCount: component.propsCount,
      },
      component.suggestions,
      `/components/${component.name.toLowerCase()}/${component.name.toLowerCase()}.tsx`,
      sessionId,
    );

    fossilIds.push(fossilId);
    console.log(
      `  ✅ Fossilized ${component.name} (Score: ${component.score}) -> ${fossilId}`,
    );
  }

  // Fossilize the scoring run summary
  const scoreDistribution = mockHelperOutput.components.reduce(
    (acc, comp) => {
      const range =
        comp.score >= 80
          ? "excellent"
          : comp.score >= 60
            ? "good"
            : comp.score >= 40
              ? "fair"
              : "poor";
      acc[range] = (acc[range] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const gapAnalysis = Object.entries(mockHelperOutput.issues).reduce(
    (acc, [, issues]) => {
      issues.forEach((issue) => {
        acc[issue] = (acc[issue] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  const allRecommendations = mockHelperOutput.components.flatMap(
    (c) => c.suggestions,
  );

  const runFossilId = await fossilizeScoringRun(
    mockHelperOutput.runId,
    mockHelperOutput.total,
    mockHelperOutput.averageScore,
    scoreDistribution,
    gapAnalysis,
    allRecommendations,
    sessionId,
  );

  console.log(`\n📋 Fossilized scoring run -> ${runFossilId}`);

  // Demonstrate retrieval
  console.log("\n🔍 Retrieving recent component analyses...");
  const recentAnalyses = await fossil.retrieve("component.analysis");
  console.log(`  Found ${recentAnalyses.length} component analysis fossils`);

  if (recentAnalyses.length > 0) {
    const latest = recentAnalyses[0];
    const latestData = latest.data as any; // Type assertion for demo
    console.log(
      `  Latest: ${latestData.component} (${latestData.score}/100) at ${latest.timestamp}`,
    );
  }

  console.log("\n📈 Retrieving scoring history...");
  const scoringHistory = await fossil.retrieve("helper.scoring");
  console.log(`  Found ${scoringHistory.length} scoring run fossils`);

  // Demonstrate trends analysis
  console.log("\n📊 Analyzing trends...");
  try {
    const trends = await fossil.getAnalysisTrends(7); // Last 7 days
    console.log(`  Score history entries: ${trends.scoreHistory.length}`);
    console.log(`  Top improvement suggestions:`);
    trends.improvementSuggestions.slice(0, 3).forEach((suggestion, i) => {
      console.log(`    ${i + 1}. ${suggestion}`);
    });
  } catch (error) {
    console.log("  (Trends analysis requires more historical data)");
  }

  console.log("\n✨ Fossilization complete!");
  console.log(`Session ID: ${sessionId}`);
  console.log(`Fossils created: ${fossilIds.length + 1}`);
  console.log("\n💡 Integration points:");
  console.log("  - Helper can emit events to fossilization on each run");
  console.log("  - Pre-commit hooks can fossilize validation results");
  console.log("  - Dashboard can query trends for insights");
  console.log("  - CI/CD can track quality metrics over time");
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes("--help")) {
    console.log(`Fossilization CLI Demo

Usage:
  bun scripts/fossilization-demo.ts [options]

Options:
  --help        Show this help
  
This demo shows how component analysis results can be captured
and stored for historical tracking and trend analysis.
`);
    process.exit(0);
  }

  try {
    await demonstrateFossilization();
    process.exit(0);
  } catch (error) {
    console.error(
      "Demo failed:",
      error instanceof Error ? error.message : String(error),
    );
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
