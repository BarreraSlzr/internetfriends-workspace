#!/usr/bin/env bun
/**
 * Comprehensive Component Analysis Script
 * Analyzes all 169+ components in the codebase for quality metrics
 */

import { promises as fs } from "fs";
import { glob } from "glob";

interface ComponentAnalysis {
  filePath: string;
  exportName: string;
  score: number;
  issues: string[];
  suggestions: string[];
  patterns: {
    hasDisabled: boolean;
    hasTestId: boolean;
    hasStamp: boolean;
    hasIsoTimestamp: boolean;
    hasRawDateUsage: boolean;
    propsCount: number;
  };
  category: "atomic" | "molecular" | "organism" | "utility" | "page";
}

interface QualityReport {
  totalComponents: number;
  averageScore: number;
  categoryBreakdown: Record<string, { count: number; avgScore: number }>;
  topIssues: Record<string, number>;
  lowestPerformers: ComponentAnalysis[];
  recommendations: string[];
}

const COMPONENT_PATHS = [
  "components/**/*.tsx",
  "app/**/*.tsx",
  "!**/*.test.tsx",
  "!**/*.spec.tsx",
  "!**/node_modules/**",
];

async function analyzeComponentFile(
  filePath: string,
): Promise<ComponentAnalysis[]> {
  try {
    const content = await fs.readFile(filePath, "utf-8");
    const analyses: ComponentAnalysis[] = [];

    // Extract exports and analyze each
    const exportMatches =
      content.match(
        /export\s+(?:default\s+)?(?:const|function|class)\s+(\w+)/g,
      ) || [];
    const defaultExport = content.match(/export\s+default\s+(\w+)/)?.[1];

    const allExports = exportMatches.map((match) => {
      const name = match.split(/\s+/).pop() || "Unknown";
      return name;
    });

    if (defaultExport && !allExports.includes(defaultExport)) {
      allExports.push(defaultExport);
    }

    for (const exportName of allExports) {
      const analysis = analyzeComponent(filePath, exportName, content);
      if (analysis) {
        analyses.push(analysis);
      }
    }

    return analyses;
  } catch (error) {
    console.warn(`⚠️  Failed to analyze ${filePath}:`, error);
    return [];
  }
}

function analyzeComponent(
  filePath: string,
  exportName: string,
  content: string,
): ComponentAnalysis | null {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let score = 100;

  // Pattern analysis
  const patterns = {
    hasDisabled: /disabled\s*[\?:]/.test(content),
    hasTestId: /data-testid|testId/.test(content),
    hasStamp: /generateStamp\(\)/.test(content),
    hasIsoTimestamp: /toISOString\(\)/.test(content),
    hasRawDateUsage: /new\s+Date\(\)/.test(content),
    propsCount: (content.match(/(\w+)\s*[\?:]?:/g) || []).length,
  };

  // Category determination
  let category: ComponentAnalysis["category"] = "utility";
  if (filePath.includes("/atomic/")) category = "atomic";
  else if (filePath.includes("/molecular/")) category = "molecular";
  else if (filePath.includes("/organisms/")) category = "organism";
  else if (filePath.includes("/app/") && !filePath.includes("/api/"))
    category = "page";

  // Quality checks
  if (!patterns.hasDisabled && category !== "page") {
    issues.push("Missing disabled prop");
    suggestions.push("Consider adding disabled prop");
    score -= 15;
  }

  if (!patterns.hasTestId && category !== "page") {
    issues.push("Missing test ID");
    suggestions.push("Add data-testid for testing");
    score -= 10;
  }

  if (patterns.hasRawDateUsage) {
    issues.push("Raw Date usage detected");
    suggestions.push("Use generateStamp() or toISOString()");
    score -= 20;
  }

  if (patterns.propsCount > 8 && category === "atomic") {
    issues.push(`Too many props (${patterns.propsCount}/8)`);
    suggestions.push("Consider refactoring to reduce props");
    score -= 25;
  }

  if (!patterns.hasStamp && category !== "page") {
    issues.push("No unique stamp generation");
    suggestions.push("Use generateStamp() for unique IDs");
    score -= 5;
  }

  // Check for proper TypeScript interfaces
  const hasPropsInterface = new RegExp(`${exportName}Props`).test(content);
  if (!hasPropsInterface && category !== "page" && patterns.propsCount > 0) {
    issues.push("No Props interface found");
    suggestions.push(`Add ${exportName}Props interface`);
    score -= 15;
  }

  // React best practices
  if (!/React\.memo|forwardRef/.test(content) && category === "atomic") {
    issues.push("Missing React optimization");
    suggestions.push("Consider React.memo or forwardRef");
    score -= 5;
  }

  return {
    filePath,
    exportName,
    score: Math.max(0, score),
    issues,
    suggestions,
    patterns,
    category,
  };
}

async function generateQualityReport(
  analyses: ComponentAnalysis[],
): Promise<QualityReport> {
  const totalComponents = analyses.length;
  const averageScore =
    analyses.reduce((sum, a) => sum + a.score, 0) / totalComponents;

  // Category breakdown
  const categoryBreakdown: Record<string, { count: number; avgScore: number }> =
    {};
  for (const analysis of analyses) {
    if (!categoryBreakdown[analysis.category]) {
      categoryBreakdown[analysis.category] = { count: 0, avgScore: 0 };
    }
    categoryBreakdown[analysis.category].count++;
    categoryBreakdown[analysis.category].avgScore += analysis.score;
  }

  for (const category in categoryBreakdown) {
    categoryBreakdown[category].avgScore /= categoryBreakdown[category].count;
  }

  // Top issues
  const topIssues: Record<string, number> = {};
  for (const analysis of analyses) {
    for (const issue of analysis.issues) {
      topIssues[issue] = (topIssues[issue] || 0) + 1;
    }
  }

  // Lowest performers
  const lowestPerformers = analyses
    .sort((a, b) => a.score - b.score)
    .slice(0, 10);

  // Recommendations
  const recommendationCounts: Record<string, number> = {};
  for (const analysis of analyses) {
    for (const suggestion of analysis.suggestions) {
      recommendationCounts[suggestion] =
        (recommendationCounts[suggestion] || 0) + 1;
    }
  }

  const recommendations = Object.entries(recommendationCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([rec]) => rec);

  return {
    totalComponents,
    averageScore,
    categoryBreakdown,
    topIssues,
    lowestPerformers,
    recommendations,
  };
}

async function main() {
  console.log("🔍 Comprehensive Component Analysis");
  console.log("====================================\n");

  try {
    // Find all component files
    console.log("📂 Scanning for component files...");
    const files = await glob(COMPONENT_PATHS, {
      cwd: process.cwd(),
      ignore: ["node_modules/**", "**/*.test.tsx", "**/*.spec.tsx"],
    });

    console.log(`   Found ${files.length} files to analyze\n`);

    // Analyze all components
    console.log("⚡ Analyzing components...");
    const allAnalyses: ComponentAnalysis[] = [];

    for (const file of files) {
      const analyses = await analyzeComponentFile(file);
      allAnalyses.push(...analyses);

      if (analyses.length > 0) {
        const avgScore =
          analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length;
        const scoreColor = avgScore >= 80 ? "🟢" : avgScore >= 60 ? "🟡" : "🔴";
        console.log(
          `   ${scoreColor} ${file}: ${analyses.length} exports (avg: ${avgScore.toFixed(1)})`,
        );
      }
    }

    console.log(`\n✅ Analyzed ${allAnalyses.length} components\n`);

    // Generate quality report
    console.log("📊 Generating quality report...");
    const report = await generateQualityReport(allAnalyses);

    // Display results
    console.log("\n🎯 QUALITY REPORT");
    console.log("================");
    console.log(`Total Components: ${report.totalComponents}`);
    console.log(`Average Score: ${report.averageScore.toFixed(1)}/100`);

    console.log("\n📈 Category Breakdown:");
    for (const [category, data] of Object.entries(report.categoryBreakdown)) {
      console.log(
        `   ${category}: ${data.count} components (avg: ${data.avgScore.toFixed(1)})`,
      );
    }

    console.log("\n🚨 Top Issues:");
    const sortedIssues = Object.entries(report.topIssues)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10);

    for (const [issue, count] of sortedIssues) {
      console.log(`   ${count}x: ${issue}`);
    }

    console.log("\n🔴 Lowest Performers:");
    for (const component of report.lowestPerformers) {
      console.log(
        `   ${component.score}/100: ${component.exportName} (${component.filePath})`,
      );
      if (component.issues.length > 0) {
        console.log(`      Issues: ${component.issues.join(", ")}`);
      }
    }

    console.log("\n💡 Top Recommendations:");
    for (const [i, rec] of report.recommendations.entries()) {
      console.log(`   ${i + 1}. ${rec}`);
    }

    // Save detailed results
    const resultsPath = ".fossils/comprehensive-analysis.json";
    await fs.writeFile(
      resultsPath,
      JSON.stringify(
        {
          timestamp: new Date().toISOString(),
          report,
          components: allAnalyses,
        },
        null,
        2,
      ),
    );

    console.log(`\n💾 Detailed results saved to ${resultsPath}`);
  } catch (error) {
    console.error("❌ Analysis failed:", error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
