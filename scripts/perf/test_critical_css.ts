#!/usr/bin/env bun

import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface CriticalCSSTest {
  timestamp: string;
  status: 'passed' | 'failed' | 'warning';
  tests: {
    fileExists: boolean;
    hasContent: boolean;
    sizeAppropriate: boolean;
    containsBasicSelectors: boolean;
    containsCustomProperties: boolean;
    containsFontDeclarations: boolean;
    containsLayoutStyles: boolean;
  };
  metrics: {
    fileSizeKB: number;
    lineCount: number;
    selectorCount: number;
    customPropertyCount: number;
  };
  details: string[];
  issues: string[];
  recommendations: string[];
}

const analyzeCriticalCSS = async (): Promise<CriticalCSSTest> => {
  const test: CriticalCSSTest = {
    timestamp: new Date().toISOString(),
    status: 'passed',
    tests: {
      fileExists: false,
      hasContent: false,
      sizeAppropriate: false,
      containsBasicSelectors: false,
      containsCustomProperties: false,
      containsFontDeclarations: false,
      containsLayoutStyles: false
    },
    metrics: {
      fileSizeKB: 0,
      lineCount: 0,
      selectorCount: 0,
      customPropertyCount: 0
    },
    details: [],
    issues: [],
    recommendations: []
  };

  try {
    // Check if critical CSS file exists
    const criticalPath = 'styles/critical.css';
    const criticalContent = await readFile(criticalPath, 'utf8');

    test.tests.fileExists = true;
    test.details.push('✅ Critical CSS file exists');

    // Analyze file metrics
    const lines = criticalContent.split('\n');
    test.metrics.lineCount = lines.length;
    test.metrics.fileSizeKB = Math.round((criticalContent.length / 1024) * 100) / 100;

    if (criticalContent.trim().length > 0) {
      test.tests.hasContent = true;
      test.details.push('✅ File contains content');
    } else {
      test.issues.push('❌ File is empty');
      test.status = 'failed';
    }

    // Check file size
    if (test.metrics.fileSizeKB > 5 && test.metrics.fileSizeKB < 100) {
      test.tests.sizeAppropriate = true;
      test.details.push(`✅ Appropriate file size: ${test.metrics.fileSizeKB}KB`);
    } else if (test.metrics.fileSizeKB <= 5) {
      test.issues.push(`⚠️ File size seems small: ${test.metrics.fileSizeKB}KB`);
      if (test.status === 'passed') test.status = 'warning';
    } else {
      test.issues.push(`⚠️ File size is large: ${test.metrics.fileSizeKB}KB`);
      if (test.status === 'passed') test.status = 'warning';
    }

    // Count CSS selectors (rough approximation)
    const selectorMatches = criticalContent.match(/\.[a-zA-Z0-9_-]+\s*{/g) || [];
    const idMatches = criticalContent.match(/#[a-zA-Z0-9_-]+\s*{/g) || [];
    const elementMatches = criticalContent.match(/^[a-z]+\s*{/gm) || [];

    test.metrics.selectorCount = selectorMatches.length + idMatches.length + elementMatches.length;

    // Check for basic selectors (in compiled CSS, these might be different)
    const basicSelectors = ['html', 'body', ':root', '*'];
    let foundBasicSelectors = 0;

    basicSelectors.forEach(selector => {
      if (criticalContent.includes(selector)) {
        foundBasicSelectors++;
      }
    });

    if (foundBasicSelectors >= 1) {
      test.tests.containsBasicSelectors = true;
      test.details.push(`✅ Contains basic selectors (${foundBasicSelectors} found)`);
    } else {
      // Check for compiled equivalents or CSS module classes
      const hasCompiledClasses = criticalContent.includes('module__') ||
                                 criticalContent.includes('__') ||
                                 criticalContent.includes('styles-');

      if (hasCompiledClasses) {
        test.tests.containsBasicSelectors = true;
        test.details.push('✅ Contains compiled CSS module classes (valid for Next.js)');
      } else {
        test.issues.push('❌ No basic selectors or compiled classes found');
        test.status = 'failed';
      }
    }

    // Check for CSS custom properties
    const customPropertyMatches = criticalContent.match(/--[a-zA-Z0-9-]+/g) || [];
    test.metrics.customPropertyCount = new Set(customPropertyMatches).size;

    if (test.metrics.customPropertyCount > 0) {
      test.tests.containsCustomProperties = true;
      test.details.push(`✅ Contains custom properties: ${test.metrics.customPropertyCount} unique`);
    } else {
      test.issues.push('⚠️ No CSS custom properties found');
      if (test.status === 'passed') test.status = 'warning';
    }

    // Check for font declarations
    const fontPatterns = [
      'font-family',
      'font-weight',
      'font-size',
      '@font-face',
      'geist'
    ];

    let foundFontDeclarations = 0;
    fontPatterns.forEach(pattern => {
      if (criticalContent.toLowerCase().includes(pattern.toLowerCase())) {
        foundFontDeclarations++;
      }
    });

    if (foundFontDeclarations >= 2) {
      test.tests.containsFontDeclarations = true;
      test.details.push(`✅ Contains font declarations (${foundFontDeclarations} patterns found)`);
    } else {
      test.issues.push('⚠️ Limited font declarations found');
      if (test.status === 'passed') test.status = 'warning';
    }

    // Check for layout-critical styles
    const layoutPatterns = [
      'position:',
      'display:',
      'flex',
      'grid',
      'width:',
      'height:',
      'margin:',
      'padding:'
    ];

    let foundLayoutStyles = 0;
    layoutPatterns.forEach(pattern => {
      if (criticalContent.includes(pattern)) {
        foundLayoutStyles++;
      }
    });

    if (foundLayoutStyles >= 4) {
      test.tests.containsLayoutStyles = true;
      test.details.push(`✅ Contains layout styles (${foundLayoutStyles} patterns found)`);
    } else {
      test.issues.push('⚠️ Limited layout styles found');
      if (test.status === 'passed') test.status = 'warning';
    }

    // Generate recommendations
    if (test.metrics.fileSizeKB < 10) {
      test.recommendations.push('Consider including more critical styles for above-the-fold content');
    }

    if (test.metrics.customPropertyCount === 0) {
      test.recommendations.push('Ensure design system tokens (custom properties) are included in critical CSS');
    }

    if (foundFontDeclarations < 2) {
      test.recommendations.push('Include font loading styles in critical CSS for better FOUT prevention');
    }

    if (!test.tests.containsBasicSelectors && !criticalContent.includes('module__')) {
      test.recommendations.push('Critical CSS extraction may need adjustment - ensure proper selector detection');
    }

  } catch (error) {
    test.issues.push(`Critical CSS analysis failed: ${error.message}`);
    test.status = 'failed';
  }

  return test;
};

const printTestResults = (test: CriticalCSSTest): void => {
  console.log('🧪 CRITICAL CSS DETAILED ANALYSIS');
  console.log('═══════════════════════════════════\n');

  console.log(`🕐 Timestamp: ${test.timestamp}`);
  console.log(`📊 Status: ${test.status.toUpperCase()}\n`);

  console.log('📋 TEST RESULTS:');
  Object.entries(test.tests).forEach(([testName, passed]) => {
    const icon = passed ? '✅' : '❌';
    console.log(`  ${icon} ${testName}: ${passed}`);
  });

  console.log('\n📊 METRICS:');
  console.log(`  📁 File size: ${test.metrics.fileSizeKB}KB`);
  console.log(`  📏 Line count: ${test.metrics.lineCount}`);
  console.log(`  🎯 CSS selectors: ${test.metrics.selectorCount}`);
  console.log(`  🎨 Custom properties: ${test.metrics.customPropertyCount}`);

  if (test.details.length > 0) {
    console.log('\n✅ DETAILS:');
    test.details.forEach(detail => {
      console.log(`  ${detail}`);
    });
  }

  if (test.issues.length > 0) {
    console.log('\n⚠️ ISSUES:');
    test.issues.forEach(issue => {
      console.log(`  ${issue}`);
    });
  }

  if (test.recommendations.length > 0) {
    console.log('\n💡 RECOMMENDATIONS:');
    test.recommendations.forEach((rec, i) => {
      console.log(`  ${i + 1}. ${rec}`);
    });
  }

  console.log('\n🎯 ASSESSMENT:');
  const passedTests = Object.values(test.tests).filter(Boolean).length;
  const totalTests = Object.keys(test.tests).length;
  const passRate = Math.round((passedTests / totalTests) * 100);

  console.log(`  Pass rate: ${passedTests}/${totalTests} (${passRate}%)`);

  if (test.status === 'passed') {
    console.log('  🎉 Critical CSS analysis PASSED');
  } else if (test.status === 'warning') {
    console.log('  ⚠️ Critical CSS analysis completed with warnings');
  } else {
    console.log('  ❌ Critical CSS analysis FAILED');
  }
};

const main = async (): Promise<void> => {
  console.log('🧪 Starting detailed critical CSS analysis...\n');

  try {
    const test = await analyzeCriticalCSS();
    printTestResults(test);

    // Save results
    const resultsPath = `scripts/perf/snapshots/critical-css-test-${Date.now()}.json`;
    await writeFile(resultsPath, JSON.stringify(test, null, 2));
    console.log(`\n💾 Test results saved: ${resultsPath}`);

    // Additional analysis
    console.log('\n🔍 ADDITIONAL ANALYSIS:');

    try {
      const criticalContent = await readFile('styles/critical.css', 'utf8');

      // Show first few lines of actual content
      const contentLines = criticalContent.split('\n')
        .filter(line => line.trim() && !line.startsWith('/*'))
        .slice(0, 10);

      if (contentLines.length > 0) {
        console.log('  📝 Sample CSS content (first 10 non-comment lines):');
        contentLines.forEach((line, i) => {
          const truncated = line.length > 80 ? line.substring(0, 80) + '...' : line;
          console.log(`    ${i + 1}. ${truncated.trim()}`);
        });
      }

      // Check for Next.js specific patterns
      const nextjsPatterns = [
        '__next__',
        'module__',
        'styles-',
        '_app',
        'layout'
      ];

      const foundNextjsPatterns = nextjsPatterns.filter(pattern =>
        criticalContent.includes(pattern)
      );

      if (foundNextjsPatterns.length > 0) {
        console.log(`\n  🎯 Next.js patterns detected: ${foundNextjsPatterns.join(', ')}`);
        console.log('     This indicates proper CSS Modules extraction');
      }

    } catch (error) {
      console.log('  ⚠️ Could not read critical CSS for additional analysis');
    }

    console.log('\n✅ Critical CSS detailed analysis complete!');

    // Exit with appropriate status
    process.exit(test.status === 'failed' ? 1 : 0);

  } catch (error) {
    console.error('❌ Critical CSS analysis failed:', error);
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}

export { analyzeCriticalCSS, CriticalCSSTest };
