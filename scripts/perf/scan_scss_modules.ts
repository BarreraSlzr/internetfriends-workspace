#!/usr/bin/env bun

import { readdir, stat, readFile } from 'fs/promises';
import { join, relative } from 'path';
import { execSync } from 'child_process';

interface SCSSModuleInfo {
  path: string;
  lines: number;
  bytes: number;
  classes: string[];
  classCount: number;
  customProperties: string[];
  customPropertyCount: number;
  imports: string[];
  importCount: number;
  mixinUsage: string[];
  mixinCount: number;
  hasModernSyntax: boolean; // Uses @use instead of @import
  complexity: 'low' | 'medium' | 'high';
}

interface SCSSAnalysisResult {
  timestamp: string;
  commitHash: string;
  modules: SCSSModuleInfo[];
  totals: {
    files: number;
    totalBytes: number;
    totalKB: number;
    totalLines: number;
    totalClasses: number;
    totalCustomProperties: number;
    modernSyntaxFiles: number;
    legacyImportFiles: number;
  };
  complexity: {
    low: number;
    medium: number;
    high: number;
  };
  largestModule?: SCSSModuleInfo;
  mostComplexModule?: SCSSModuleInfo;
}

const getCommitHash = (): string => {
  try {
    return execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
  } catch {
    return 'unknown';
  }
};

const analyzeComplexity = (info: SCSSModuleInfo): 'low' | 'medium' | 'high' => {
  const complexityScore =
    info.classCount * 1 +
    info.customPropertyCount * 2 +
    info.importCount * 1.5 +
    info.mixinCount * 3 +
    (info.lines > 100 ? 10 : 0);

  if (complexityScore < 10) return 'low';
  if (complexityScore < 30) return 'medium';
  return 'high';
};

const extractClasses = (content: string): string[] => {
  // Extract CSS class selectors (.classname)
  const classRegex = /\.([a-zA-Z0-9_-]+)(?=[\s\{,:])/g;
  const classes = new Set<string>();
  let match;

  while ((match = classRegex.exec(content)) !== null) {
    // Filter out common false positives
    const className = match[1];
    if (!className.startsWith('__') && className.length > 1) {
      classes.add(className);
    }
  }

  return Array.from(classes);
};

const extractCustomProperties = (content: string): string[] => {
  // Extract CSS custom properties (--property-name)
  const propRegex = /--([\w-]+)/g;
  const properties = new Set<string>();
  let match;

  while ((match = propRegex.exec(content)) !== null) {
    properties.add(`--${match[1]}`);
  }

  return Array.from(properties);
};

const extractImports = (content: string): string[] => {
  // Extract @import and @use statements
  const importRegex = /@(?:import|use)\s+['"]([^'"]+)['"]/g;
  const imports: string[] = [];
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    imports.push(match[1]);
  }

  return imports;
};

const extractMixinUsage = (content: string): string[] => {
  // Extract @include statements (mixin usage)
  const mixinRegex = /@include\s+([a-zA-Z0-9_-]+)/g;
  const mixins = new Set<string>();
  let match;

  while ((match = mixinRegex.exec(content)) !== null) {
    mixins.add(match[1]);
  }

  return Array.from(mixins);
};

const hasModernSyntax = (content: string): boolean => {
  // Check if file uses modern @use syntax instead of @import
  return content.includes('@use ') && !content.includes('@import ');
};

const analyzeSCSSFile = async (filePath: string, basePath: string): Promise<SCSSModuleInfo> => {
  const content = await readFile(filePath, 'utf8');
  const stats = await stat(filePath);
  const lines = content.split('\n').length;
  const bytes = stats.size;

  const classes = extractClasses(content);
  const customProperties = extractCustomProperties(content);
  const imports = extractImports(content);
  const mixinUsage = extractMixinUsage(content);
  const modernSyntax = hasModernSyntax(content);

  const info: SCSSModuleInfo = {
    path: relative(basePath, filePath),
    lines,
    bytes,
    classes,
    classCount: classes.length,
    customProperties,
    customPropertyCount: customProperties.length,
    imports,
    importCount: imports.length,
    mixinUsage,
    mixinCount: mixinUsage.length,
    hasModernSyntax: modernSyntax,
    complexity: 'low', // Will be calculated after
  };

  info.complexity = analyzeComplexity(info);
  return info;
};

const scanForSCSSFiles = async (dirPath: string, basePath: string): Promise<SCSSModuleInfo[]> => {
  const modules: SCSSModuleInfo[] = [];

  try {
    const entries = await readdir(dirPath);

    for (const entry of entries) {
      const fullPath = join(dirPath, entry);
      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        // Skip node_modules and .next directories
        if (entry === 'node_modules' || entry === '.next' || entry === '.git') {
          continue;
        }

        const subModules = await scanForSCSSFiles(fullPath, basePath);
        modules.push(...subModules);
      } else if (entry.endsWith('.scss') || entry.endsWith('.sass')) {
        const moduleInfo = await analyzeSCSSFile(fullPath, basePath);
        modules.push(moduleInfo);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not scan directory ${dirPath}:`, error);
  }

  return modules;
};

const createAnalysis = async (): Promise<SCSSAnalysisResult> => {
  const projectRoot = process.cwd();
  console.log(`📁 Scanning for SCSS files in: ${projectRoot}`);

  const modules = await scanForSCSSFiles(projectRoot, projectRoot);

  // Calculate totals
  const totalBytes = modules.reduce((sum, m) => sum + m.bytes, 0);
  const totalLines = modules.reduce((sum, m) => sum + m.lines, 0);
  const totalClasses = modules.reduce((sum, m) => sum + m.classCount, 0);
  const totalCustomProperties = modules.reduce((sum, m) => sum + m.customPropertyCount, 0);
  const modernSyntaxFiles = modules.filter(m => m.hasModernSyntax).length;
  const legacyImportFiles = modules.filter(m => !m.hasModernSyntax).length;

  // Complexity breakdown
  const complexity = {
    low: modules.filter(m => m.complexity === 'low').length,
    medium: modules.filter(m => m.complexity === 'medium').length,
    high: modules.filter(m => m.complexity === 'high').length,
  };

  // Find notable modules
  const largestModule = modules.reduce((largest, current) =>
    !largest || current.bytes > largest.bytes ? current : largest,
    null as SCSSModuleInfo | null
  );

  const mostComplexModule = modules.reduce((complex, current) => {
    if (!complex) return current;
    const complexityOrder = { low: 1, medium: 2, high: 3 };
    return complexityOrder[current.complexity] > complexityOrder[complex.complexity]
      ? current : complex;
  }, null as SCSSModuleInfo | null);

  const analysis: SCSSAnalysisResult = {
    timestamp: new Date().toISOString(),
    commitHash: getCommitHash(),
    modules: modules.sort((a, b) => b.bytes - a.bytes),
    totals: {
      files: modules.length,
      totalBytes,
      totalKB: Math.round((totalBytes / 1024) * 100) / 100,
      totalLines,
      totalClasses,
      totalCustomProperties,
      modernSyntaxFiles,
      legacyImportFiles,
    },
    complexity,
    largestModule: largestModule || undefined,
    mostComplexModule: mostComplexModule || undefined,
  };

  return analysis;
};

const formatSize = (kb: number): string => {
  if (kb < 1) return `${Math.round(kb * 1000)}B`;
  if (kb < 1024) return `${kb}KB`;
  return `${Math.round((kb / 1024) * 10) / 10}MB`;
};

const printSummary = (analysis: SCSSAnalysisResult): void => {
  console.log('\n🎨 SCSS Analysis Summary');
  console.log('═══════════════════════════');
  console.log(`🕐 Timestamp: ${analysis.timestamp}`);
  console.log(`🔗 Commit: ${analysis.commitHash}`);
  console.log(`📁 Total SCSS files: ${analysis.totals.files}`);

  console.log('\n📊 Size Breakdown:');
  console.log(`  Total size: ${formatSize(analysis.totals.totalKB)}`);
  console.log(`  Total lines: ${analysis.totals.totalLines.toLocaleString()}`);
  console.log(`  Average file size: ${formatSize(analysis.totals.totalKB / analysis.totals.files)}`);

  console.log('\n🎯 Style Elements:');
  console.log(`  CSS classes: ${analysis.totals.totalClasses}`);
  console.log(`  Custom properties: ${analysis.totals.totalCustomProperties}`);
  console.log(`  Avg classes per file: ${Math.round(analysis.totals.totalClasses / analysis.totals.files)}`);

  console.log('\n🔄 Modernization Status:');
  console.log(`  Modern syntax (@use): ${analysis.totals.modernSyntaxFiles} files`);
  console.log(`  Legacy syntax (@import): ${analysis.totals.legacyImportFiles} files`);
  const modernPercent = Math.round((analysis.totals.modernSyntaxFiles / analysis.totals.files) * 100);
  console.log(`  Modernization: ${modernPercent}%`);

  console.log('\n🧩 Complexity Distribution:');
  console.log(`  Low complexity: ${analysis.complexity.low} files`);
  console.log(`  Medium complexity: ${analysis.complexity.medium} files`);
  console.log(`  High complexity: ${analysis.complexity.high} files`);

  if (analysis.largestModule) {
    console.log(`\n🏆 Largest file: ${analysis.largestModule.path}`);
    console.log(`  Size: ${formatSize(analysis.largestModule.bytes / 1024)}`);
    console.log(`  Lines: ${analysis.largestModule.lines}`);
    console.log(`  Classes: ${analysis.largestModule.classCount}`);
  }

  if (analysis.mostComplexModule) {
    console.log(`\n🧠 Most complex: ${analysis.mostComplexModule.path}`);
    console.log(`  Complexity: ${analysis.mostComplexModule.complexity}`);
    console.log(`  Classes: ${analysis.mostComplexModule.classCount}`);
    console.log(`  Custom props: ${analysis.mostComplexModule.customPropertyCount}`);
    console.log(`  Mixins used: ${analysis.mostComplexModule.mixinCount}`);
  }

  // Show top 10 largest files
  console.log('\n📋 Top 10 Largest SCSS Files:');
  analysis.modules.slice(0, 10).forEach((module, index) => {
    console.log(`  ${index + 1}. ${module.path} - ${formatSize(module.bytes / 1024)} (${module.classCount} classes)`);
  });
};

const saveAnalysis = async (analysis: SCSSAnalysisResult): Promise<void> => {
  const filename = `scss-analysis-${analysis.commitHash}-${Date.now()}.json`;
  const filepath = join('scripts/perf/snapshots', filename);

  // Ensure snapshots directory exists
  try {
    execSync('mkdir -p scripts/perf/snapshots', { encoding: 'utf8' });
  } catch {
    console.warn('Could not create snapshots directory');
  }

  await Bun.write(filepath, JSON.stringify(analysis, null, 2));
  console.log(`\n💾 Analysis saved: ${filepath}`);

  // Also save as latest analysis
  const latestPath = join('scripts/perf/snapshots', 'scss-latest.json');
  await Bun.write(latestPath, JSON.stringify(analysis, null, 2));
  console.log(`💾 Latest analysis: ${latestPath}`);
};

const main = async (): Promise<void> => {
  console.log('🎨 Starting SCSS module analysis...\n');

  try {
    const analysis = await createAnalysis();
    printSummary(analysis);
    await saveAnalysis(analysis);

    console.log('\n✅ SCSS analysis complete!');

    // Epic integration: log SCSS metrics
    console.log('\n🎭 EPIC METRICS UPDATE:');
    console.log(JSON.stringify({
      epic: 'performance-optimization',
      phase: 'baseline',
      metrics: {
        scss: {
          totalFiles: analysis.totals.files,
          totalKB: analysis.totals.totalKB,
          modernizationPercent: Math.round((analysis.totals.modernSyntaxFiles / analysis.totals.files) * 100),
          totalClasses: analysis.totals.totalClasses,
          totalCustomProperties: analysis.totals.totalCustomProperties,
          complexityDistribution: analysis.complexity,
        },
        timestamp: analysis.timestamp,
      }
    }, null, 2));

  } catch (error) {
    console.error('❌ Error analyzing SCSS modules:', error);
    process.exit(1);
  }
};

// Run if called directly
if (import.meta.main) {
  main();
}

export { createAnalysis, SCSSAnalysisResult, SCSSModuleInfo };
