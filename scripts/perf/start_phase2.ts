#!/usr/bin/env bun

import { execSync } from 'child_process';
import { writeFile, readFile } from 'fs/promises';
import { join } from 'path';

interface Phase2InitResult {
  timestamp: string;
  commitHash: string;
  epic: 'performance-optimization';
  phase: 'fonts_above_fold';
  status: 'initiated';
  progress: 0;
  tasks: {
    fontInventory: { status: 'pending'; description: string };
    nextFontSetup: { status: 'pending'; description: string };
    semanticTokens: { status: 'pending'; description: string };
    criticalCSS: { status: 'pending'; description: string };
    telemetryIntegration: { status: 'pending'; description: string };
  };
  baselineReference: {
    jsKB: number;
    cssKB: number;
    scssModernization: number;
  };
  phase2Targets: {
    fontLoadingImprovement: string;
    criticalPathOptimization: string;
    fcpImprovement: string;
    bundleReduction: string;
  };
}

const getCommitHash = (): string => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

const loadBaselineMetrics = async (): Promise<any> => {
  try {
    const baselineData = await readFile(
      join('scripts/perf/snapshots/current-baseline.json'),
      'utf8'
    );
    return JSON.parse(baselineData);
  } catch (error) {
    console.warn('⚠️ Could not load baseline metrics:', error);
    return null;
  }
};

const createFontInventoryScript = async (): Promise<void> => {
  const fontInventoryScript = `#!/usr/bin/env bun

import { readdir, stat, readFile } from 'fs/promises';
import { join, relative } from 'path';

interface FontUsage {
  file: string;
  families: string[];
  weights: string[];
  styles: string[];
  sources: string[];
}

interface FontInventoryResult {
  timestamp: string;
  totalFontReferences: number;
  uniqueFamilies: string[];
  uniqueWeights: string[];
  usageByFile: FontUsage[];
  recommendations: string[];
}

const extractFontReferences = (content: string, filePath: string): FontUsage => {
  const usage: FontUsage = {
    file: filePath,
    families: [],
    weights: [],
    styles: [],
    sources: []
  };

  // Extract font-family declarations
  const familyMatches = content.match(/font-family:\\s*([^;]+);/gi) || [];
  familyMatches.forEach(match => {
    const family = match.replace(/font-family:\\s*/i, '').replace(/;/, '').trim();
    if (family && !usage.families.includes(family)) {
      usage.families.push(family);
    }
  });

  // Extract font-weight declarations
  const weightMatches = content.match(/font-weight:\\s*([^;]+);/gi) || [];
  weightMatches.forEach(match => {
    const weight = match.replace(/font-weight:\\s*/i, '').replace(/;/, '').trim();
    if (weight && !usage.weights.includes(weight)) {
      usage.weights.push(weight);
    }
  });

  // Extract @font-face sources
  const srcMatches = content.match(/src:\\s*([^;]+);/gi) || [];
  srcMatches.forEach(match => {
    const src = match.replace(/src:\\s*/i, '').replace(/;/, '').trim();
    if (src && !usage.sources.includes(src)) {
      usage.sources.push(src);
    }
  });

  // Extract font-style declarations
  const styleMatches = content.match(/font-style:\\s*([^;]+);/gi) || [];
  styleMatches.forEach(match => {
    const style = match.replace(/font-style:\\s*/i, '').replace(/;/, '').trim();
    if (style && !usage.styles.includes(style)) {
      usage.styles.push(style);
    }
  });

  return usage;
};

const scanForFontUsage = async (dirPath: string, basePath: string): Promise<FontUsage[]> => {
  const results: FontUsage[] = [];

  try {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        if (['node_modules', '.next', '.git'].includes(entry)) continue;
        const subResults = await scanForFontUsage(fullPath, basePath);
        results.push(...subResults);
      } else if (entry.match(/\\.(scss|css|tsx|ts|js|jsx)$/)) {
        const content = await readFile(fullPath, 'utf8');
        const usage = extractFontReferences(content, relative(basePath, fullPath));
        if (usage.families.length > 0 || usage.sources.length > 0) {
          results.push(usage);
        }
      }
    }
  } catch (error) {
    console.warn(\`Warning: Could not scan directory \${dirPath}:\`, error);
  }

  return results;
};

const generateFontInventory = async (): Promise<FontInventoryResult> => {
  console.log('🔍 Scanning for font usage across project...');

  const projectRoot = process.cwd();
  const fontUsage = await scanForFontUsage(projectRoot, projectRoot);

  // Aggregate unique values
  const allFamilies = new Set<string>();
  const allWeights = new Set<string>();
  const allStyles = new Set<string>();

  fontUsage.forEach(usage => {
    usage.families.forEach(f => allFamilies.add(f));
    usage.weights.forEach(w => allWeights.add(w));
    usage.styles.forEach(s => allStyles.add(s));
  });

  // Generate recommendations
  const recommendations: string[] = [];

  if (allFamilies.size > 3) {
    recommendations.push(\`Too many font families (\${allFamilies.size}) - consider consolidating\`);
  }

  if (allWeights.size > 6) {
    recommendations.push(\`Many font weights (\${allWeights.size}) - audit necessity\`);
  }

  const hasCustomFonts = fontUsage.some(u => u.sources.length > 0);
  if (hasCustomFonts) {
    recommendations.push('Custom fonts detected - implement preloading strategy');
  }

  return {
    timestamp: new Date().toISOString(),
    totalFontReferences: fontUsage.length,
    uniqueFamilies: Array.from(allFamilies),
    uniqueWeights: Array.from(allWeights),
    usageByFile: fontUsage,
    recommendations
  };
};

const main = async (): Promise<void> => {
  try {
    const inventory = await generateFontInventory();

    console.log('\\n📊 Font Usage Inventory');
    console.log('═══════════════════════');
    console.log(\`🕐 Timestamp: \${inventory.timestamp}\`);
    console.log(\`📁 Files with font usage: \${inventory.totalFontReferences}\`);
    console.log(\`🔤 Unique font families: \${inventory.uniqueFamilies.length}\`);
    console.log(\`⚖️  Unique font weights: \${inventory.uniqueWeights.length}\`);

    console.log('\\n🔤 Font Families:');
    inventory.uniqueFamilies.forEach((family, i) => {
      console.log(\`  \${i + 1}. \${family}\`);
    });

    console.log('\\n⚖️ Font Weights:');
    inventory.uniqueWeights.forEach((weight, i) => {
      console.log(\`  \${i + 1}. \${weight}\`);
    });

    console.log('\\n💡 Recommendations:');
    inventory.recommendations.forEach((rec, i) => {
      console.log(\`  \${i + 1}. \${rec}\`);
    });

    // Save results
    const filename = 'font-inventory-' + Date.now() + '.json';
    const filepath = join('scripts/perf/snapshots', filename);
    await Bun.write(filepath, JSON.stringify(inventory, null, 2));

    console.log(\`\\n💾 Font inventory saved: \${filepath}\`);
    console.log('\\n🎭 FONT INVENTORY COMPLETE');

  } catch (error) {
    console.error('❌ Font inventory failed:', error);
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}

export { generateFontInventory, FontInventoryResult };`;

  await writeFile('scripts/perf/font_inventory.ts', fontInventoryScript);
  console.log('✅ Created font inventory script');
};

const createCriticalCSSScript = async (): Promise<void> => {
  const criticalCSSScript = `#!/usr/bin/env bun

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
  const lines = cssContent.split('\\n');
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
      currentBlock += '\\n' + line;

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
    critical: criticalLines.join('\\n\\n'),
    deferred: deferredLines.join('\\n\\n')
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

    allCritical += critical + '\\n';
    allDeferred += deferred + '\\n';
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

    console.log('\\n🎨 Critical CSS Extraction Results');
    console.log('═══════════════════════════════════');
    console.log(\`🕐 Timestamp: \${result.timestamp}\`);
    console.log(\`📊 Critical CSS: \${result.sizeReduction.criticalKB}KB\`);
    console.log(\`📊 Deferred CSS: \${result.sizeReduction.deferredKB}KB\`);
    console.log(\`📊 Total CSS: \${result.sizeReduction.totalKB}KB\`);
    console.log(\`📈 Critical ratio: \${result.sizeReduction.reductionPercent}%\`);

    // Save critical CSS file
    const criticalPath = 'styles/critical.css';
    await writeFile(criticalPath, result.criticalCSS);
    console.log(\`\\n💾 Critical CSS saved: \${criticalPath}\`);

    // Save results
    const resultPath = 'scripts/perf/snapshots/critical-css-' + Date.now() + '.json';
    await writeFile(resultPath, JSON.stringify(result, null, 2));
    console.log(\`💾 Results saved: \${resultPath}\`);

    console.log('\\n🎭 CRITICAL CSS EXTRACTION COMPLETE');

  } catch (error) {
    console.error('❌ Critical CSS extraction failed:', error);
    process.exit(1);
  }
};

if (import.meta.main) {
  main();
}

export { generateCriticalCSS, CriticalCSSResult };`;

  await writeFile('scripts/perf/critical_css.ts', criticalCSSScript);
  console.log('✅ Created critical CSS extraction script');
};

const main = async (): Promise<void> => {
  console.log('🚀 PERFORMANCE OPTIMIZATION EPIC');
  console.log('🎯 Phase 2: Fonts & Above-the-Fold');
  console.log('════════════════════════════════════\n');

  const startTime = Date.now();
  const commitHash = getCommitHash();
  const baseline = await loadBaselineMetrics();

  console.log(`🔗 Commit: ${commitHash}`);
  console.log(`🕐 Started: ${new Date().toISOString()}`);

  if (baseline) {
    console.log(`📊 Baseline reference: ${baseline.metrics.baseline.bundle.jsKB}KB JS, ${baseline.metrics.baseline.bundle.cssKB}KB CSS`);
    console.log(`🎨 SCSS modernization: ${baseline.metrics.baseline.scss.modernizationPercent}%\n`);
  }

  const result: Phase2InitResult = {
    timestamp: new Date().toISOString(),
    commitHash,
    epic: 'performance-optimization',
    phase: 'fonts_above_fold',
    status: 'initiated',
    progress: 0,
    tasks: {
      fontInventory: {
        status: 'pending',
        description: 'Catalog font families, weights, and usage patterns across project'
      },
      nextFontSetup: {
        status: 'pending',
        description: 'Migrate to Next.js font optimization with preloading'
      },
      semanticTokens: {
        status: 'pending',
        description: 'Create fonts.tokens.scss with semantic aliases'
      },
      criticalCSS: {
        status: 'pending',
        description: 'Extract and inline critical above-the-fold CSS'
      },
      telemetryIntegration: {
        status: 'pending',
        description: 'Integrate PerformanceMetricsInitializer into app layout'
      }
    },
    baselineReference: {
      jsKB: baseline?.metrics?.baseline?.bundle?.jsKB || 0,
      cssKB: baseline?.metrics?.baseline?.bundle?.cssKB || 0,
      scssModernization: baseline?.metrics?.baseline?.scss?.modernizationPercent || 0
    },
    phase2Targets: {
      fontLoadingImprovement: 'Reduce font blocking time by 150ms',
      criticalPathOptimization: 'Extract 60% of CSS as critical path',
      fcpImprovement: 'Improve First Contentful Paint by 100ms',
      bundleReduction: 'Reduce initial bundle size by 10%'
    }
  };

  console.log('🔧 Setting up Phase 2 tooling...');

  // Create Phase 2 scripts
  await createFontInventoryScript();
  await createCriticalCSSScript();

  console.log('✅ Phase 2 scripts created');

  const duration = Math.round((Date.now() - startTime) / 1000);

  console.log('\n🎯 PHASE 2 TARGETS:');
  Object.entries(result.phase2Targets).forEach(([key, target]) => {
    console.log(`  📈 ${key}: ${target}`);
  });

  console.log('\n📋 PHASE 2 TASKS:');
  Object.entries(result.tasks).forEach(([key, task]) => {
    console.log(`  🔲 ${key}: ${task.description}`);
  });

  console.log(`\n⏱️  Phase 2 initialization completed in ${duration}s`);

  // Save Phase 2 initialization
  const phase2Path = 'scripts/perf/snapshots/phase2-init.json';
  await writeFile(phase2Path, JSON.stringify(result, null, 2));
  console.log(`💾 Phase 2 config saved: ${phase2Path}`);

  console.log('\n🎭 EPIC PROGRESS UPDATE:');
  console.log(JSON.stringify({
    epic: result.epic,
    phase: result.phase,
    status: result.status,
    progress: result.progress,
    timestamp: result.timestamp,
    nextSteps: [
      'Run font inventory analysis',
      'Extract critical CSS patterns',
      'Implement Next.js font optimization',
      'Integrate performance telemetry'
    ]
  }, null, 2));

  console.log('\n✅ Phase 2 initialization complete!');
  console.log('\n🎯 IMMEDIATE NEXT STEPS:');
  console.log('1. Run font inventory: bun scripts/perf/font_inventory.ts');
  console.log('2. Extract critical CSS: bun scripts/perf/critical_css.ts');
  console.log('3. Integrate telemetry: Add PerformanceMetricsInitializer to layout');
  console.log('4. Monitor progress: bun scripts/perf/phase2_progress.ts');
};

// Run if called directly
if (import.meta.main) {
  main().catch((error) => {
    console.error('❌ Phase 2 initialization failed:', error);
    process.exit(1);
  });
}

export { main as startPhase2, Phase2InitResult };
