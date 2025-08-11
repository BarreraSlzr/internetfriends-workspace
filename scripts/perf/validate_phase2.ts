#!/usr/bin/env bun

import { readFile, readdir, stat } from 'fs/promises';
import { join, relative } from 'path';
import { execSync } from 'child_process';

interface ValidationResult {
  timestamp: string;
  commitHash: string;
  phase: 'fonts_above_fold_validation';
  overallStatus: 'passed' | 'failed' | 'warning';
  score: number;
  maxScore: number;
  tests: {
    fontTokens: TestResult;
    criticalCSS: TestResult;
    telemetryIntegration: TestResult;
    nextjsFonts: TestResult;
    performanceBaseline: TestResult;
    cssModernization: TestResult;
  };
  recommendations: string[];
  summary: {
    passed: number;
    failed: number;
    warnings: number;
    criticalIssues: string[];
  };
}

interface TestResult {
  name: string;
  status: 'passed' | 'failed' | 'warning';
  score: number;
  maxScore: number;
  details: string[];
  errors: string[];
  metrics?: any;
}

const getCommitHash = (): string => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

const runTest = (name: string, testFn: () => Promise<TestResult>): Promise<TestResult> => {
  return testFn().catch(error => ({
    name,
    status: 'failed' as const,
    score: 0,
    maxScore: 10,
    details: [],
    errors: [`Test execution failed: ${error.message}`]
  }));
};

const validateFontTokens = async (): Promise<TestResult> => {
  const test: TestResult = {
    name: 'Font Tokens Validation',
    status: 'passed',
    score: 0,
    maxScore: 20,
    details: [],
    errors: []
  };

  try {
    // Check if font tokens file exists
    const fontTokensPath = 'nextjs-website/styles/tokens/fonts.scss';
    const fontTokensContent = await readFile(fontTokensPath, 'utf8');
    test.details.push(`✅ Font tokens file exists: ${fontTokensPath}`);
    test.score += 3;

    // Check for semantic font families
    const semanticFamilies = [
      '--font-sans-display',
      '--font-sans-body',
      '--font-sans-ui',
      '--font-mono-code'
    ];

    for (const family of semanticFamilies) {
      if (fontTokensContent.includes(family)) {
        test.details.push(`✅ Semantic family token: ${family}`);
        test.score += 2;
      } else {
        test.errors.push(`❌ Missing semantic family: ${family}`);
      }
    }

    // Check for font weight system
    if (fontTokensContent.includes('$font-weights:')) {
      test.details.push('✅ Font weight scale defined');
      test.score += 2;
    } else {
      test.errors.push('❌ Font weight scale missing');
    }

    // Check for font size scale
    if (fontTokensContent.includes('$font-sizes:')) {
      test.details.push('✅ Font size scale defined');
      test.score += 2;
    } else {
      test.errors.push('❌ Font size scale missing');
    }

    // Check for utility functions
    const utilityFunctions = ['@function font-size', '@function font-weight'];
    for (const func of utilityFunctions) {
      if (fontTokensContent.includes(func)) {
        test.details.push(`✅ Utility function: ${func}`);
        test.score += 1;
      } else {
        test.errors.push(`❌ Missing utility function: ${func}`);
      }
    }

    // Check integration with main styles
    const mainStylesPath = 'nextjs-website/styles/index.scss';
    const mainStylesContent = await readFile(mainStylesPath, 'utf8');
    if (mainStylesContent.includes('@use "./tokens/fonts.scss"')) {
      test.details.push('✅ Font tokens integrated into main styles');
      test.score += 3;
    } else {
      test.errors.push('❌ Font tokens not integrated into main styles');
    }

    // File size check
    const stats = await stat(fontTokensPath);
    const sizeKB = Math.round((stats.size / 1024) * 100) / 100;
    test.metrics = { fileSizeKB: sizeKB };

    if (sizeKB > 5 && sizeKB < 15) {
      test.details.push(`✅ Appropriate file size: ${sizeKB}KB`);
      test.score += 2;
    } else if (sizeKB <= 5) {
      test.details.push(`⚠️ File might be incomplete: ${sizeKB}KB`);
      test.status = 'warning';
    } else {
      test.details.push(`⚠️ Large file size: ${sizeKB}KB`);
      test.status = 'warning';
    }

  } catch (error) {
    test.errors.push(`Font tokens validation failed: ${error.message}`);
    test.status = 'failed';
  }

  if (test.errors.length > 0 && test.status !== 'warning') {
    test.status = 'failed';
  }

  return test;
};

const validateCriticalCSS = async (): Promise<TestResult> => {
  const test: TestResult = {
    name: 'Critical CSS Validation',
    status: 'passed',
    score: 0,
    maxScore: 25,
    details: [],
    errors: []
  };

  try {
    // Check if critical CSS file exists
    const criticalCSSPath = 'styles/critical.css';
    const criticalContent = await readFile(criticalCSSPath, 'utf8');
    test.details.push(`✅ Critical CSS file exists: ${criticalCSSPath}`);
    test.score += 5;

    // Check file size and content
    const stats = await stat(criticalCSSPath);
    const sizeKB = Math.round((stats.size / 1024) * 100) / 100;

    if (sizeKB > 10 && sizeKB < 50) {
      test.details.push(`✅ Appropriate critical CSS size: ${sizeKB}KB`);
      test.score += 5;
    } else if (sizeKB <= 10) {
      test.details.push(`⚠️ Critical CSS might be incomplete: ${sizeKB}KB`);
      test.status = 'warning';
      test.score += 2;
    } else {
      test.details.push(`⚠️ Critical CSS is large: ${sizeKB}KB`);
      test.status = 'warning';
      test.score += 3;
    }

    // Check for critical selectors
    const criticalSelectors = [':root', 'body', 'html'];
    for (const selector of criticalSelectors) {
      if (criticalContent.includes(selector)) {
        test.details.push(`✅ Critical selector present: ${selector}`);
        test.score += 2;
      } else {
        test.errors.push(`❌ Missing critical selector: ${selector}`);
      }
    }

    // Check extraction results
    const extractionFiles = await readdir('scripts/perf/snapshots').then(files =>
      files.filter(f => f.startsWith('critical-css-')).sort()
    );

    if (extractionFiles.length > 0) {
      const latestFile = extractionFiles[extractionFiles.length - 1];
      const extractionData = JSON.parse(
        await readFile(`scripts/perf/snapshots/${latestFile}`, 'utf8')
      );

      const ratio = extractionData.sizeReduction?.reductionPercent || 0;
      test.metrics = {
        criticalKB: extractionData.sizeReduction?.criticalKB,
        deferredKB: extractionData.sizeReduction?.deferredKB,
        totalKB: extractionData.sizeReduction?.totalKB,
        ratio: ratio
      };

      if (ratio >= 70) {
        test.details.push(`✅ Excellent critical CSS ratio: ${Math.round(ratio)}%`);
        test.score += 8;
      } else if (ratio >= 50) {
        test.details.push(`✅ Good critical CSS ratio: ${Math.round(ratio)}%`);
        test.score += 5;
      } else {
        test.details.push(`⚠️ Low critical CSS ratio: ${Math.round(ratio)}%`);
        test.status = 'warning';
        test.score += 2;
      }
    } else {
      test.errors.push('❌ No extraction results found');
    }

  } catch (error) {
    test.errors.push(`Critical CSS validation failed: ${error.message}`);
    test.status = 'failed';
  }

  if (test.errors.length > 0 && test.status !== 'warning') {
    test.status = 'failed';
  }

  return test;
};

const validateTelemetryIntegration = async (): Promise<TestResult> => {
  const test: TestResult = {
    name: 'Performance Telemetry Integration',
    status: 'passed',
    score: 0,
    maxScore: 20,
    details: [],
    errors: []
  };

  try {
    // Check if telemetry hook exists
    const hookPath = 'hooks/perf/use_web_vitals_telemetry.ts';
    const hookContent = await readFile(hookPath, 'utf8');
    test.details.push(`✅ Telemetry hook exists: ${hookPath}`);
    test.score += 3;

    // Check hook functionality
    const requiredHookFeatures = [
      'useWebVitalsTelemetry',
      'PerformanceObserver',
      'LCP',
      'FCP',
      'CLS',
      'TTFB'
    ];

    for (const feature of requiredHookFeatures) {
      if (hookContent.includes(feature)) {
        test.details.push(`✅ Hook feature: ${feature}`);
        test.score += 1;
      } else {
        test.errors.push(`❌ Missing hook feature: ${feature}`);
      }
    }

    // Check component exists
    const componentPath = 'components/perf/performance_metrics_initializer.tsx';
    const componentContent = await readFile(componentPath, 'utf8');
    test.details.push(`✅ Telemetry component exists: ${componentPath}`);
    test.score += 3;

    // Check component features
    if (componentContent.includes('useWebVitalsTelemetry')) {
      test.details.push('✅ Component uses telemetry hook');
      test.score += 2;
    } else {
      test.errors.push('❌ Component missing hook integration');
    }

    if (componentContent.includes('process.env.NODE_ENV')) {
      test.details.push('✅ Environment-aware configuration');
      test.score += 1;
    }

    // Check integration in layout
    const layoutPath = 'nextjs-website/app/layout.tsx';
    const layoutContent = await readFile(layoutPath, 'utf8');

    if (layoutContent.includes('PerformanceMetricsInitializer')) {
      test.details.push('✅ Telemetry integrated in app layout');
      test.score += 4;

      // Check import
      if (layoutContent.includes('import { PerformanceMetricsInitializer }')) {
        test.details.push('✅ Proper import statement');
        test.score += 2;
      } else {
        test.errors.push('❌ Missing import statement');
      }
    } else {
      test.errors.push('❌ Telemetry not integrated in layout');
    }

    // Check for environment variable support
    if (componentContent.includes('NEXT_PUBLIC_PERF_BEACON_URL')) {
      test.details.push('✅ Beacon URL environment variable support');
      test.score += 1;
    }

  } catch (error) {
    test.errors.push(`Telemetry validation failed: ${error.message}`);
    test.status = 'failed';
  }

  if (test.errors.length > 0 && test.status !== 'warning') {
    test.status = 'failed';
  }

  return test;
};

const validateNextjsFonts = async (): Promise<TestResult> => {
  const test: TestResult = {
    name: 'Next.js Font Optimization',
    status: 'passed',
    score: 0,
    maxScore: 15,
    details: [],
    errors: []
  };

  try {
    // Check Next.js font imports in layout
    const layoutPath = 'nextjs-website/app/layout.tsx';
    const layoutContent = await readFile(layoutPath, 'utf8');

    if (layoutContent.includes('from "next/font/google"')) {
      test.details.push('✅ Next.js Google Fonts import');
      test.score += 3;
    } else {
      test.errors.push('❌ Missing Next.js font import');
    }

    // Check for Geist fonts
    if (layoutContent.includes('Geist') && layoutContent.includes('Geist_Mono')) {
      test.details.push('✅ Geist fonts configured (sans + mono)');
      test.score += 4;
    } else {
      test.errors.push('❌ Geist fonts not properly configured');
    }

    // Check font variable configuration
    if (layoutContent.includes('variable: "--font-geist-sans"') &&
        layoutContent.includes('variable: "--font-geist-mono"')) {
      test.details.push('✅ Font CSS variables configured');
      test.score += 3;
    } else {
      test.errors.push('❌ Font variables not configured');
    }

    // Check subsets
    if (layoutContent.includes('subsets: ["latin"]')) {
      test.details.push('✅ Font subsets optimized');
      test.score += 2;
    } else {
      test.details.push('⚠️ Font subsets not explicitly configured');
      test.status = 'warning';
      test.score += 1;
    }

    // Check body class integration
    if (layoutContent.includes('${geistSans.variable}') &&
        layoutContent.includes('${geistMono.variable}')) {
      test.details.push('✅ Font variables applied to body');
      test.score += 3;
    } else {
      test.errors.push('❌ Font variables not applied');
    }

    // Check CSS usage
    const stylesPath = 'nextjs-website/styles/index.scss';
    try {
      const stylesContent = await readFile(stylesPath, 'utf8');
      if (stylesContent.includes('var(--font-geist-sans)')) {
        test.details.push('✅ Font variables used in CSS');
        test.score += 0; // No additional score, just confirmation
      }
    } catch {
      // Styles file might not exist, not critical
    }

  } catch (error) {
    test.errors.push(`Next.js fonts validation failed: ${error.message}`);
    test.status = 'failed';
  }

  if (test.errors.length > 0 && test.status !== 'warning') {
    test.status = 'failed';
  }

  return test;
};

const validatePerformanceBaseline = async (): Promise<TestResult> => {
  const test: TestResult = {
    name: 'Performance Baseline Integrity',
    status: 'passed',
    score: 0,
    maxScore: 15,
    details: [],
    errors: []
  };

  try {
    // Check baseline report exists
    const baselinePath = 'scripts/perf/snapshots/current-baseline.json';
    const baselineData = JSON.parse(await readFile(baselinePath, 'utf8'));
    test.details.push('✅ Baseline report accessible');
    test.score += 3;

    // Validate baseline structure
    if (baselineData.metrics?.baseline?.bundle && baselineData.metrics?.baseline?.scss) {
      test.details.push('✅ Complete baseline metrics structure');
      test.score += 3;
    } else {
      test.errors.push('❌ Incomplete baseline metrics');
    }

    // Check bundle metrics
    const bundle = baselineData.metrics.baseline.bundle;
    if (bundle.jsKB > 1000 && bundle.cssKB > 10 && bundle.totalFiles > 10) {
      test.details.push(`✅ Realistic bundle metrics: ${bundle.jsKB}KB JS, ${bundle.cssKB}KB CSS, ${bundle.totalFiles} files`);
      test.score += 4;
      test.metrics = { bundleJS: bundle.jsKB, bundleCSS: bundle.cssKB, bundleFiles: bundle.totalFiles };
    } else {
      test.errors.push('❌ Unrealistic or missing bundle metrics');
    }

    // Check SCSS metrics
    const scss = baselineData.metrics.baseline.scss;
    if (scss.totalFiles > 5 && scss.totalKB > 20 && scss.modernizationPercent >= 80) {
      test.details.push(`✅ Good SCSS metrics: ${scss.totalFiles} files, ${scss.modernizationPercent}% modernized`);
      test.score += 3;
    } else {
      test.details.push(`⚠️ SCSS metrics need attention: ${scss.modernizationPercent}% modernized`);
      test.status = 'warning';
      test.score += 1;
    }

    // Check Phase 2 progress
    const phase2Path = 'scripts/perf/snapshots/current-phase2.json';
    const phase2Data = JSON.parse(await readFile(phase2Path, 'utf8'));
    if (phase2Data.progress === 100 && phase2Data.status === 'completed') {
      test.details.push('✅ Phase 2 completion confirmed');
      test.score += 2;
    } else {
      test.errors.push('❌ Phase 2 not properly completed');
    }

  } catch (error) {
    test.errors.push(`Baseline validation failed: ${error.message}`);
    test.status = 'failed';
  }

  if (test.errors.length > 0 && test.status !== 'warning') {
    test.status = 'failed';
  }

  return test;
};

const validateCSSModernization = async (): Promise<TestResult> => {
  const test: TestResult = {
    name: 'CSS Modernization Status',
    status: 'passed',
    score: 0,
    maxScore: 10,
    details: [],
    errors: []
  };

  try {
    // Check SCSS analysis results
    const scssFiles = await readdir('scripts/perf/snapshots').then(files =>
      files.filter(f => f.startsWith('scss-analysis-')).sort()
    );

    if (scssFiles.length > 0) {
      const latestFile = scssFiles[scssFiles.length - 1];
      const scssData = JSON.parse(
        await readFile(`scripts/perf/snapshots/${latestFile}`, 'utf8')
      );

      const modernPercent = Math.round(
        (scssData.totals.modernSyntaxFiles / scssData.totals.files) * 100
      );

      test.metrics = {
        totalFiles: scssData.totals.files,
        modernFiles: scssData.totals.modernSyntaxFiles,
        legacyFiles: scssData.totals.legacyImportFiles,
        modernizationPercent: modernPercent
      };

      if (modernPercent >= 90) {
        test.details.push(`✅ Excellent modernization: ${modernPercent}%`);
        test.score += 5;
      } else if (modernPercent >= 75) {
        test.details.push(`✅ Good modernization: ${modernPercent}%`);
        test.score += 4;
      } else {
        test.details.push(`⚠️ Modernization needs work: ${modernPercent}%`);
        test.status = 'warning';
        test.score += 2;
      }

      // Check complexity distribution
      const complexity = scssData.complexity;
      if (complexity.high <= 5) {
        test.details.push(`✅ Manageable complexity: ${complexity.high} high complexity files`);
        test.score += 3;
      } else {
        test.details.push(`⚠️ High complexity files: ${complexity.high} files need refactoring`);
        test.status = 'warning';
        test.score += 1;
      }

      // Check custom properties usage
      if (scssData.totals.totalCustomProperties > 50) {
        test.details.push(`✅ Good custom properties usage: ${scssData.totals.totalCustomProperties} properties`);
        test.score += 2;
      } else {
        test.details.push(`⚠️ Limited custom properties: ${scssData.totals.totalCustomProperties} properties`);
        test.status = 'warning';
        test.score += 1;
      }
    } else {
      test.errors.push('❌ No SCSS analysis results found');
    }

  } catch (error) {
    test.errors.push(`CSS modernization validation failed: ${error.message}`);
    test.status = 'failed';
  }

  if (test.errors.length > 0 && test.status !== 'warning') {
    test.status = 'failed';
  }

  return test;
};

const generateRecommendations = (results: ValidationResult): string[] => {
  const recommendations: string[] = [];

  // Font tokens recommendations
  if (results.tests.fontTokens.status === 'failed') {
    recommendations.push('🔤 Fix font tokens implementation - ensure all semantic families are defined');
  }

  // Critical CSS recommendations
  if (results.tests.criticalCSS.status === 'failed') {
    recommendations.push('🎯 Re-run critical CSS extraction - ensure proper above-the-fold optimization');
  } else if (results.tests.criticalCSS.metrics?.ratio < 70) {
    recommendations.push('🎯 Optimize critical CSS ratio - currently below 70%');
  }

  // Telemetry recommendations
  if (results.tests.telemetryIntegration.status === 'failed') {
    recommendations.push('📊 Fix telemetry integration - ensure proper monitoring setup');
  }

  // Next.js fonts recommendations
  if (results.tests.nextjsFonts.status === 'failed') {
    recommendations.push('🔠 Fix Next.js font configuration - ensure optimal loading');
  }

  // Performance recommendations
  if (results.tests.performanceBaseline.metrics?.bundleJS > 5000) {
    recommendations.push('📦 Bundle size is large - consider Phase 3 code splitting');
  }

  // CSS modernization recommendations
  if (results.tests.cssModernization.metrics?.modernizationPercent < 90) {
    recommendations.push('🔧 Complete SCSS modernization - migrate remaining @import statements');
  }

  if (results.tests.cssModernization.metrics?.high > 5) {
    recommendations.push('🧩 Refactor high-complexity SCSS files for maintainability');
  }

  // General recommendations based on score
  if (results.score < results.maxScore * 0.8) {
    recommendations.push('🎯 Address failing tests before proceeding to Phase 3');
  }

  return recommendations;
};

const printValidationResults = (results: ValidationResult): void => {
  console.log('🧪 PHASE 2 VALIDATION RESULTS');
  console.log('════════════════════════════════════════\n');

  console.log(`🕐 Timestamp: ${results.timestamp}`);
  console.log(`🔗 Commit: ${results.commitHash}`);
  console.log(`📊 Overall Status: ${results.overallStatus.toUpperCase()}`);
  console.log(`🏆 Score: ${results.score}/${results.maxScore} (${Math.round((results.score/results.maxScore)*100)}%)\n`);

  console.log('📋 TEST RESULTS:');
  Object.entries(results.tests).forEach(([testName, result]) => {
    const statusIcon = result.status === 'passed' ? '✅' :
                      result.status === 'warning' ? '⚠️' : '❌';
    console.log(`  ${statusIcon} ${result.name}: ${result.score}/${result.maxScore} (${result.status})`);

    if (result.details.length > 0) {
      result.details.forEach(detail => {
        console.log(`      ${detail}`);
      });
    }

    if (result.errors.length > 0) {
      result.errors.forEach(error => {
        console.log(`      ${error}`);
      });
    }

    if (result.metrics) {
      console.log(`      📊 Metrics: ${JSON.stringify(result.metrics)}`);
    }

    console.log('');
  });

  if (results.recommendations.length > 0) {
    console.log('💡 RECOMMENDATIONS:');
    results.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
    console.log('');
  }

  if (results.summary.criticalIssues.length > 0) {
    console.log('🚨 CRITICAL ISSUES:');
    results.summary.criticalIssues.forEach((issue, i) => {
      console.log(`  ${i + 1}. ${issue}`);
    });
    console.log('');
  }

  console.log('📊 SUMMARY:');
  console.log(`  ✅ Passed: ${results.summary.passed}`);
  console.log(`  ⚠️ Warnings: ${results.summary.warnings}`);
  console.log(`  ❌ Failed: ${results.summary.failed}`);

  if (results.overallStatus === 'passed') {
    console.log('\n🎉 Phase 2 validation PASSED! Ready for Phase 3.');
  } else if (results.overallStatus === 'warning') {
    console.log('\n⚠️ Phase 2 validation completed with warnings. Review recommended.');
  } else {
    console.log('\n❌ Phase 2 validation FAILED. Issues must be resolved.');
  }
};

const main = async (): Promise<void> => {
  console.log('🧪 Starting Phase 2 validation and testing...\n');

  const startTime = Date.now();
  const commitHash = getCommitHash();

  // Run all validation tests
  const tests = {
    fontTokens: await runTest('Font Tokens', validateFontTokens),
    criticalCSS: await runTest('Critical CSS', validateCriticalCSS),
    telemetryIntegration: await runTest('Telemetry Integration', validateTelemetryIntegration),
    nextjsFonts: await runTest('Next.js Fonts', validateNextjsFonts),
    performanceBaseline: await runTest('Performance Baseline', validatePerformanceBaseline),
    cssModernization: await runTest('CSS Modernization', validateCSSModernization)
  };

  // Calculate results
  const totalScore = Object.values(tests).reduce((sum, test) => sum + test.score, 0);
  const maxScore = Object.values(tests).reduce((sum, test) => sum + test.maxScore, 0);

  const passed = Object.values(tests).filter(t => t.status === 'passed').length;
  const warnings = Object.values(tests).filter(t => t.status === 'warning').length;
  const failed = Object.values(tests).filter(t => t.status === 'failed').length;

  const overallStatus = failed > 0 ? 'failed' : warnings > 0 ? 'warning' : 'passed';

  const criticalIssues: string[] = [];
  Object.values(tests).forEach(test => {
    if (test.status === 'failed') {
      criticalIssues.push(...test.errors.map(error => `${test.name}: ${error}`));
    }
  });

  const results: ValidationResult = {
    timestamp: new Date().toISOString(),
    commitHash,
    phase: 'fonts_above_fold_validation',
    overallStatus,
    score: totalScore,
    maxScore,
    tests,
    recommendations: [],
    summary: {
      passed,
      failed,
      warnings,
      criticalIssues
    }
  };

  results.recommendations = generateRecommendations(results);

  printValidationResults(results);

  // Save results
  const resultsPath = `scripts/perf/snapshots/phase2-validation-${commitHash}-${Date.now()}.json`;
  await Bun.write(resultsPath, JSON.stringify(results, null, 2));
  console.log(`\n💾 Validation results saved: ${resultsPath}`);

  const duration = Math.round((Date.now() - startTime) / 1000);
  console.log(`\n⏱️ Validation completed in ${duration}s`);

  // Exit with appropriate code
  process.exit(overallStatus === 'failed' ? 1 : 0);
};

if (import.meta.main) {
  main().catch((error) => {
    console.error('❌ Validation failed:', error);
    process.exit(1);
  });
}

export { main as validatePhase2, ValidationResult };
