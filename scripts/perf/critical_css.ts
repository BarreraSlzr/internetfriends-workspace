#!/usr/bin/env bun

import { readdir, stat, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

interface CriticalCSSConfig {
  aboveFoldSelectors: string[];
  criticalCustomProperties: string[];
  criticalTokens: string[];
  deferredSelectors: string[];
}

interface CriticalCSSResult {
  timestamp: string;
  criticalCSS: string;
  deferredCSS: string;
  sizeReduction: {
    criticalKB: number;
    deferredKB: number;
    totalKB: number;
    reductionPercent: number;
  };
}

const defaultConfig: CriticalCSSConfig = {
  aboveFoldSelectors: [
    ':root',
    'html',
    'body',
    '.header',
    '.navigation',
    '.hero',
    '.above-fold',
    '.loading',
    '.critical',
    // Add more as needed
  ],
  criticalCustomProperties: [
    '--color-text-primary',
    '--color-bg-primary',
    '--color-primary',
    '--font-sans',
    '--font-mono',
    '--radius-md',
    '--glass-bg-header',
    // Core InternetFriends design tokens
  ],
  criticalTokens: [
    'colors',
    'fonts',
    'spacing',
    // Don't include complex animations or states initially
  ],
  deferredSelectors: [
    '.modal',
    '.tooltip',
    '.dropdown',
    '.animation',
    '.transition',
    '.hover',
    '.focus-visible',
    // Interaction states can be deferred
  ]
};

const extractCriticalCSS = async (cssContent: string, config: CriticalCSSConfig): Promise<{ critical: string; deferred: string }> => {
  const lines = cssContent.split('\n');
  const criticalLines: string[] = [];
  const deferredLines: string[] = [];

  let currentBlock = '';
  let isCritical = false;
  let isInBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check if starting a new CSS rule
    if (line.includes('{') && !isInBlock) {
      isInBlock = true;
      currentBlock = line;

      // Determine if this block is critical
      isCritical = config.aboveFoldSelectors.some(selector =>
        line.includes(selector)
      ) || config.criticalCustomProperties.some(prop =>
        line.includes(prop)
      );

      // Override: defer certain selectors even if they match critical patterns
      if (config.deferredSelectors.some(selector => line.includes(selector))) {
        isCritical = false;
      }
    }

    // Add line to appropriate collection
    if (isInBlock) {
      currentBlock += '\n' + line;

      // Check if block is complete
      if (line.includes('}')) {
        if (isCritical) {
          criticalLines.push(currentBlock);
        } else {
          deferredLines.push(currentBlock);
        }

        isInBlock = false;
        currentBlock = '';
      }
    } else {
      // Handle standalone lines (imports, comments, etc.)
      if (line.startsWith('@import') || line.startsWith('/*') || line.startsWith('//')) {
        criticalLines.push(line); // Keep imports and comments in critical
      }
    }
  }

  return {
    critical: criticalLines.join('\n\n'),
    deferred: deferredLines.join('\n\n')
  };
};

const generateCriticalCSS = async (): Promise<CriticalCSSResult> => {
  console.log('🎨 Generating critical CSS extraction...');

  // Find CSS files in build output
  const cssFiles: string[] = [];
  const buildDir = '.next/static/chunks';

  try {
    const entries = await readdir(buildDir);
    for (const entry of entries) {
      if (entry.endsWith('.css')) {
        cssFiles.push(join(buildDir, entry));
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not find CSS files in build output');
    return {
      timestamp: new Date().toISOString(),
      criticalCSS: '',
      deferredCSS: '',
      sizeReduction: { criticalKB: 0, deferredKB: 0, totalKB: 0, reductionPercent: 0 }
    };
  }

  let allCritical = '';
  let allDeferred = '';
  let totalSize = 0;

  for (const cssFile of cssFiles) {
    const content = await readFile(cssFile, 'utf8');
    const { critical, deferred } = await extractCriticalCSS(content, defaultConfig);

    allCritical += critical + '\n';
    allDeferred += deferred + '\n';
    totalSize += content.length;
  }

  // Calculate sizes
  const criticalKB = Math.round((allCritical.length / 1024) * 100) / 100;
  const deferredKB = Math.round((allDeferred.length / 1024) * 100) / 100;
  const totalKB = Math.round((totalSize / 1024) * 100) / 100;
  const reductionPercent = Math.round(((criticalKB / totalKB) * 100) * 100) / 100;

  return {
    timestamp: new Date().toISOString(),
    criticalCSS: allCritical,
    deferredCSS: allDeferred,
    sizeReduction: {
      criticalKB,
      deferredKB,
      totalKB,
      reductionPercent
    }
  };
};

const main = async (): Promise<void> => {
  try {
    const result = await generateCriticalCSS();

    console.log('\n🎨 Critical CSS Extraction Results');
    console.log('═══════════════════════════════════');
    console.log(`🕐 Timestamp: ${result.timestamp}`);
    console.log(`📊 Critical CSS: ${result.sizeReduction.criticalKB}KB`);
    console.log(`📊 Deferred CSS: ${result.sizeReduction.deferredKB}KB`);
    console.log(`📊 Total CSS: ${result.sizeReduction.totalKB}KB`);
    console.log(`📈 Critical ratio: ${result.sizeReduction.reductionPercent}%`);

    // Save critical CSS file
    const criticalPath = 'styles/critical.css';
    await writeFile(criticalPath, result.criticalCSS);
    console.log(`\n💾 Critical CSS saved: ${criticalPath}`);

    // Save results
    const resultPath = 'scripts/perf/snapshots/critical-css-' + Date.now() + '.json';
    await writeFile(resultPath, JSON.stringify(result, null, 2));
    console.log(`💾 Results saved: ${resultPath}`);

    console.log('\n🎭 CRITICAL CSS EXTRACTION COMPLETE');

  } catch (error) {
    console.error('❌ Critical CSS extraction failed:', error);
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}

export { generateCriticalCSS, CriticalCSSResult };