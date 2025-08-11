#!/usr/bin/env bun

import { readFile } from 'fs/promises';
import { join } from 'path';

interface BaselineReport {
  timestamp: string;
  commitHash: string;
  epic: 'performance-optimization';
  phase: 'baseline';
  status: 'completed';
  progress: 100;
  metrics: {
    baseline: {
      bundle: {
        jsKB: number;
        cssKB: number;
        totalFiles: number;
      };
      scss: {
        totalFiles: number;
        totalKB: number;
        modernizationPercent: number;
        totalClasses: number;
        totalCustomProperties: number;
        complexityDistribution: {
          low: number;
          medium: number;
          high: number;
        };
      };
      webVitals: null;
    };
    summary: {
      bundleAnalyzed: boolean;
      scssAnalyzed: boolean;
      totalFiles: number;
      totalSizeKB: number;
      modernizationPercent: number;
      readyForPhase2: boolean;
    };
  };
  recommendations: string[];
  nextPhase: string;
}

const getCommitHash = (): string => {
  try {
    const { execSync } = require('child_process');
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

const loadSnapshotData = async (): Promise<{ bundle: any; scss: any }> => {
  try {
    const bundleData = await readFile(
      join('scripts/perf/snapshots/latest.json'),
      'utf8'
    );
    const scssData = await readFile(
      join('scripts/perf/snapshots/scss-latest.json'),
      'utf8'
    );

    return {
      bundle: JSON.parse(bundleData),
      scss: JSON.parse(scssData),
    };
  } catch (error) {
    console.error('❌ Error loading snapshot data:', error);
    throw error;
  }
};

const generateRecommendations = (bundleData: any, scssData: any): string[] => {
  const recommendations: string[] = [];

  // Bundle analysis recommendations
  const jsKB = bundleData.build.js.totalKB;
  const cssKB = bundleData.build.css.totalKB;

  if (jsKB > 3000) {
    recommendations.push(`Large JS bundle (${jsKB}KB) - consider code splitting and dynamic imports`);
  }

  if (cssKB > 50) {
    recommendations.push(`CSS bundle size (${cssKB}KB) is reasonable but can be optimized`);
  }

  // SCSS analysis recommendations
  const modernizationPercent = Math.round(
    (scssData.totals.modernSyntaxFiles / scssData.totals.files) * 100
  );

  if (modernizationPercent < 100) {
    recommendations.push(
      `SCSS modernization at ${modernizationPercent}% - complete migration to @use syntax`
    );
  }

  if (scssData.complexity.high > 3) {
    recommendations.push(
      `${scssData.complexity.high} high-complexity SCSS files detected - consider refactoring`
    );
  }

  // Font optimization (based on bundle analysis)
  const fontFiles = bundleData.build.other.files.filter((f: any) =>
    f.path.includes('font') || f.path.includes('woff') || f.path.includes('ttf')
  );

  if (fontFiles.length > 0) {
    recommendations.push('Font files detected - implement preloading and subsetting strategy');
  }

  // Performance recommendations
  if (jsKB > 2000) {
    recommendations.push('Implement critical path optimization for above-the-fold content');
  }

  return recommendations;
};

const generateBaselineReport = async (): Promise<BaselineReport> => {
  console.log('📊 Generating baseline report from snapshots...\n');

  const { bundle, scss } = await loadSnapshotData();
  const commitHash = getCommitHash();

  // Extract key metrics
  const bundleMetrics = {
    jsKB: bundle.build.js.totalKB,
    cssKB: bundle.build.css.totalKB,
    totalFiles: bundle.meta.totalFiles,
  };

  const scssMetrics = {
    totalFiles: scss.totals.files,
    totalKB: scss.totals.totalKB,
    modernizationPercent: Math.round(
      (scss.totals.modernSyntaxFiles / scss.totals.files) * 100
    ),
    totalClasses: scss.totals.totalClasses,
    totalCustomProperties: scss.totals.totalCustomProperties,
    complexityDistribution: scss.complexity,
  };

  const totalFiles = bundleMetrics.totalFiles + scssMetrics.totalFiles;
  const totalSizeKB = bundleMetrics.jsKB + bundleMetrics.cssKB + scssMetrics.totalKB;

  const recommendations = generateRecommendations(bundle, scss);

  const report: BaselineReport = {
    timestamp: new Date().toISOString(),
    commitHash,
    epic: 'performance-optimization',
    phase: 'baseline',
    status: 'completed',
    progress: 100,
    metrics: {
      baseline: {
        bundle: bundleMetrics,
        scss: scssMetrics,
        webVitals: null,
      },
      summary: {
        bundleAnalyzed: true,
        scssAnalyzed: true,
        totalFiles,
        totalSizeKB: Math.round(totalSizeKB * 100) / 100,
        modernizationPercent: scssMetrics.modernizationPercent,
        readyForPhase2: true,
      },
    },
    recommendations,
    nextPhase: 'fonts_above_fold',
  };

  return report;
};

const printReport = (report: BaselineReport): void => {
  console.log('🎯 PERFORMANCE OPTIMIZATION BASELINE REPORT');
  console.log('═══════════════════════════════════════════\n');

  console.log(`🕐 Timestamp: ${report.timestamp}`);
  console.log(`🔗 Commit: ${report.commitHash}`);
  console.log(`📊 Phase: ${report.phase} (${report.progress}% complete)`);
  console.log(`✅ Status: ${report.status}\n`);

  console.log('📈 BUNDLE ANALYSIS:');
  console.log(`  JavaScript: ${report.metrics.baseline.bundle.jsKB}KB`);
  console.log(`  CSS: ${report.metrics.baseline.bundle.cssKB}KB`);
  console.log(`  Total files: ${report.metrics.baseline.bundle.totalFiles}\n`);

  console.log('🎨 SCSS ANALYSIS:');
  console.log(`  Files: ${report.metrics.baseline.scss.totalFiles}`);
  console.log(`  Size: ${report.metrics.baseline.scss.totalKB}KB`);
  console.log(`  Classes: ${report.metrics.baseline.scss.totalClasses}`);
  console.log(`  Custom properties: ${report.metrics.baseline.scss.totalCustomProperties}`);
  console.log(`  Modernization: ${report.metrics.baseline.scss.modernizationPercent}%`);
  console.log(`  Complexity: ${report.metrics.baseline.scss.complexityDistribution.low}L, ${report.metrics.baseline.scss.complexityDistribution.medium}M, ${report.metrics.baseline.scss.complexityDistribution.high}H\n`);

  console.log('💡 RECOMMENDATIONS:');
  report.recommendations.forEach((rec, index) => {
    console.log(`  ${index + 1}. ${rec}`);
  });

  console.log(`\n🚀 NEXT PHASE: ${report.nextPhase}`);
  console.log(`📁 Total project files analyzed: ${report.metrics.summary.totalFiles}`);
  console.log(`📊 Combined size: ${report.metrics.summary.totalSizeKB}KB`);
  console.log(`✅ Ready for Phase 2: ${report.metrics.summary.readyForPhase2 ? 'YES' : 'NO'}\n`);
};

const saveReport = async (report: BaselineReport): Promise<void> => {
  const filename = `baseline-report-${report.commitHash}-${Date.now()}.json`;
  const filepath = join('scripts/perf/snapshots', filename);

  await Bun.write(filepath, JSON.stringify(report, null, 2));
  console.log(`💾 Report saved: ${filepath}`);

  // Also save as current baseline
  const currentPath = join('scripts/perf/snapshots', 'current-baseline.json');
  await Bun.write(currentPath, JSON.stringify(report, null, 2));
  console.log(`💾 Current baseline: ${currentPath}\n`);
};

const main = async (): Promise<void> => {
  try {
    const report = await generateBaselineReport();
    printReport(report);
    await saveReport(report);

    console.log('🎭 EPIC PROGRESS UPDATE:');
    console.log(JSON.stringify({
      epic: report.epic,
      phase: report.phase,
      status: report.status,
      progress: report.progress,
      metrics: report.metrics,
      nextPhase: report.nextPhase,
      timestamp: report.timestamp,
    }, null, 2));

    console.log('\n✅ Baseline report generation complete!');
    console.log('\n🎯 READY FOR PHASE 2: Fonts & Above-the-Fold Optimization');
    console.log('💡 Next steps:');
    console.log('  1. Integrate PerformanceMetricsInitializer into app layout');
    console.log('  2. Start font optimization and preloading strategy');
    console.log('  3. Implement critical CSS extraction');

  } catch (error) {
    console.error('❌ Report generation failed:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.main) {
  main();
}

export { generateBaselineReport, BaselineReport };
