#!/usr/bin/env bun

/**
 * InternetFriends Performance Optimization - Unused CSS Scanner
 *
 * Phase 3 Code & Style Pruning Tool
 * Detects unused CSS classes and selectors across SCSS modules and TSX components
 *
 * Usage:
 *   bun scripts/perf/unused-css-scanner.ts
 *   bun scripts/perf/unused-css-scanner.ts --report-only
 *   bun scripts/perf/unused-css-scanner.ts --dry-run
 */

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { join, relative } from 'path';
import { glob } from 'glob';

interface CSSClass {
  name: string;
  file: string;
  line: number;
  context: string;
}

interface UsageReference {
  file: string;
  line: number;
  context: string;
  pattern: string;
}

interface UnusedCSSReport {
  timestamp: string;
  summary: {
    totalScssFiles: number;
    totalTsxFiles: number;
    totalCSSClasses: number;
    totalUsageReferences: number;
    unusedClasses: number;
    possiblyDynamic: number;
    cleanupRecommendations: number;
  };
  unusedClasses: Array<{
    className: string;
    definedIn: string;
    line: number;
    context: string;
    safeToRemove: boolean;
    reason?: string;
  }>;
  usagePatterns: Array<{
    className: string;
    usageCount: number;
    files: string[];
  }>;
  recommendations: {
    safeRemovals: string[];
    reviewRequired: string[];
    potentialDynamic: string[];
  };
}

class UnusedCSSScanner {
  private projectRoot: string;
  private scssFiles: string[] = [];
  private tsxFiles: string[] = [];
  private cssClasses: Map<string, CSSClass> = new Map();
  private usageReferences: Map<string, UsageReference[]> = new Map();

  // Patterns for detecting CSS class usage
  private readonly usagePatterns = [
    // className prop (string literal)
    /className\s*=\s*["']([^"']+)["']/g,
    // className prop (template literal)
    /className\s*=\s*`([^`]+)`/g,
    // className prop (object/conditional)
    /className\s*=\s*\{[^}]*["']([^"']+)["'][^}]*\}/g,
    // CSS module usage (styles.className)
    /styles\.([a-zA-Z][a-zA-Z0-9_-]*)/g,
    // CSS module usage (styles['className'])
    /styles\[["']([^"']+)["']\]/g,
    // clsx/classnames usage
    /(?:clsx|classNames|cn)\([^)]*["']([^"']+)["'][^)]*/g,
  ];

  // Patterns for detecting CSS class definitions
  private readonly classPatterns = [
    // Standard CSS class (.className)
    /^\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{/gm,
    // SCSS nested class (&.className)
    /&\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{/gm,
    // SCSS parent selector with class (.parent .className)
    /^\s*\.([a-zA-Z][a-zA-Z0-9_-]*)\s*\{/gm,
  ];

  // Classes that are likely dynamic or externally referenced
  private readonly dynamicIndicators = [
    /^data-/,           // data attributes
    /^aria-/,           // aria attributes
    /active$/,          // active states
    /hover$/,           // hover states
    /focus$/,           // focus states
    /disabled$/,        // disabled states
    /^is-/,            // state prefixes
    /^has-/,           // state prefixes
    /loading$/,        // loading states
    /error$/,          // error states
    /success$/,        // success states
    /warning$/,        // warning states
  ];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  async scan(): Promise<UnusedCSSReport> {
    console.log('🔍 Starting unused CSS scan...\n');

    // Step 1: Find all SCSS and TSX files
    await this.findFiles();
    console.log(`📁 Found ${this.scssFiles.length} SCSS files and ${this.tsxFiles.length} TSX files`);

    // Step 2: Parse CSS classes from SCSS files
    await this.parseCSSClasses();
    console.log(`🎨 Extracted ${this.cssClasses.size} CSS classes`);

    // Step 3: Find usage references in TSX files
    await this.findUsageReferences();
    const totalReferences = Array.from(this.usageReferences.values()).reduce((sum, refs) => sum + refs.length, 0);
    console.log(`🔗 Found ${totalReferences} usage references`);

    // Step 4: Analyze and generate report
    const report = await this.generateReport();
    console.log(`\n📊 Analysis complete:`);
    console.log(`   • ${report.summary.unusedClasses} unused classes found`);
    console.log(`   • ${report.recommendations.safeRemovals.length} safe to remove`);
    console.log(`   • ${report.recommendations.reviewRequired.length} require review`);

    return report;
  }

  private async findFiles(): Promise<void> {
    const nextjsWebsiteRoot = join(this.projectRoot, 'nextjs-website');

    if (!existsSync(nextjsWebsiteRoot)) {
      throw new Error(`NextJS website directory not found: ${nextjsWebsiteRoot}`);
    }

    // Find SCSS module files (exclude legacy directory)
    this.scssFiles = await glob('**/*.scss', {
      cwd: nextjsWebsiteRoot,
      absolute: true,
      ignore: ['**/legacy/**', '**/node_modules/**', '**/.next/**']
    });

    // Find TSX component files
    this.tsxFiles = await glob('**/*.tsx', {
      cwd: nextjsWebsiteRoot,
      absolute: true,
      ignore: ['**/node_modules/**', '**/.next/**', '**/build/**']
    });
  }

  private async parseCSSClasses(): Promise<void> {
    for (const file of this.scssFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          for (const pattern of this.classPatterns) {
            let match;
            const globalPattern = new RegExp(pattern.source, pattern.flags);

            while ((match = globalPattern.exec(line)) !== null) {
              const className = match[1];
              if (className && !this.cssClasses.has(className)) {
                this.cssClasses.set(className, {
                  name: className,
                  file: relative(this.projectRoot, file),
                  line: index + 1,
                  context: line.trim()
                });
              }
            }
          }
        });
      } catch (error) {
        console.warn(`⚠️  Failed to parse ${file}: ${error}`);
      }
    }
  }

  private async findUsageReferences(): Promise<void> {
    for (const file of this.tsxFiles) {
      try {
        const content = readFileSync(file, 'utf-8');
        const lines = content.split('\n');

        lines.forEach((line, index) => {
          for (const pattern of this.usagePatterns) {
            let match;
            const globalPattern = new RegExp(pattern.source, pattern.flags);

            while ((match = globalPattern.exec(line)) !== null) {
              const classNames = match[1];
              if (classNames) {
                // Split multiple classes (space-separated)
                const individualClasses = classNames.split(/\s+/).filter(Boolean);

                individualClasses.forEach(className => {
                  if (!this.usageReferences.has(className)) {
                    this.usageReferences.set(className, []);
                  }

                  this.usageReferences.get(className)!.push({
                    file: relative(this.projectRoot, file),
                    line: index + 1,
                    context: line.trim(),
                    pattern: pattern.source
                  });
                });
              }
            }
          }
        });
      } catch (error) {
        console.warn(`⚠️  Failed to parse ${file}: ${error}`);
      }
    }
  }

  private async generateReport(): Promise<UnusedCSSReport> {
    const unusedClasses: UnusedCSSReport['unusedClasses'] = [];
    const usagePatterns: UnusedCSSReport['usagePatterns'] = [];
    const safeRemovals: string[] = [];
    const reviewRequired: string[] = [];
    const potentialDynamic: string[] = [];

    // Analyze each CSS class
    for (const [className, classInfo] of this.cssClasses) {
      const usage = this.usageReferences.get(className) || [];

      if (usage.length === 0) {
        // Check if it's likely dynamic
        const isDynamic = this.dynamicIndicators.some(pattern => pattern.test(className));

        unusedClasses.push({
          className,
          definedIn: classInfo.file,
          line: classInfo.line,
          context: classInfo.context,
          safeToRemove: !isDynamic,
          reason: isDynamic ? 'Possibly dynamic class (state, data, or aria)' : undefined
        });

        if (isDynamic) {
          potentialDynamic.push(className);
        } else {
          safeRemovals.push(className);
        }
      } else {
        usagePatterns.push({
          className,
          usageCount: usage.length,
          files: [...new Set(usage.map(ref => ref.file))]
        });
      }
    }

    // Classes that need manual review (complex patterns or edge cases)
    for (const className of potentialDynamic) {
      if (className.includes('-') && !className.startsWith('data-') && !className.startsWith('aria-')) {
        reviewRequired.push(className);
      }
    }

    const totalReferences = Array.from(this.usageReferences.values()).reduce((sum, refs) => sum + refs.length, 0);

    return {
      timestamp: new Date().toISOString(),
      summary: {
        totalScssFiles: this.scssFiles.length,
        totalTsxFiles: this.tsxFiles.length,
        totalCSSClasses: this.cssClasses.size,
        totalUsageReferences: totalReferences,
        unusedClasses: unusedClasses.length,
        possiblyDynamic: potentialDynamic.length,
        cleanupRecommendations: safeRemovals.length
      },
      unusedClasses,
      usagePatterns: usagePatterns.sort((a, b) => b.usageCount - a.usageCount),
      recommendations: {
        safeRemovals,
        reviewRequired,
        potentialDynamic
      }
    };
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const isReportOnly = args.includes('--report-only');
  const isDryRun = args.includes('--dry-run');

  try {
    const scanner = new UnusedCSSScanner();
    const report = await scanner.scan();

    // Write report to file
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('.')[0];
    const reportPath = join(process.cwd(), 'scripts', 'perf', 'snapshots', `unused-css-${timestamp}.json`);
    const latestPath = join(process.cwd(), 'scripts', 'perf', 'snapshots', 'unused-css-latest.json');

    writeFileSync(reportPath, JSON.stringify(report, null, 2));
    writeFileSync(latestPath, JSON.stringify(report, null, 2));

    console.log(`\n📋 Report saved to: ${relative(process.cwd(), reportPath)}`);
    console.log(`📋 Latest report: ${relative(process.cwd(), latestPath)}`);

    // Display recommendations
    if (report.recommendations.safeRemovals.length > 0) {
      console.log('\n✅ Safe to remove:');
      report.recommendations.safeRemovals.slice(0, 10).forEach(className => {
        const classInfo = Array.from(report.unusedClasses).find(c => c.className === className);
        console.log(`   • .${className} (${classInfo?.definedIn}:${classInfo?.line})`);
      });
      if (report.recommendations.safeRemovals.length > 10) {
        console.log(`   ... and ${report.recommendations.safeRemovals.length - 10} more`);
      }
    }

    if (report.recommendations.reviewRequired.length > 0) {
      console.log('\n🔍 Require manual review:');
      report.recommendations.reviewRequired.slice(0, 5).forEach(className => {
        const classInfo = Array.from(report.unusedClasses).find(c => c.className === className);
        console.log(`   • .${className} (${classInfo?.definedIn}:${classInfo?.line}) - ${classInfo?.reason}`);
      });
    }

    // Most used classes (for context)
    if (report.usagePatterns.length > 0) {
      console.log('\n🏆 Most used classes:');
      report.usagePatterns.slice(0, 5).forEach(pattern => {
        console.log(`   • .${pattern.className} (${pattern.usageCount} uses across ${pattern.files.length} files)`);
      });
    }

    if (!isReportOnly && !isDryRun) {
      console.log('\n💡 Next steps:');
      console.log('   1. Review the generated report');
      console.log('   2. Test safe removals in a development environment');
      console.log('   3. Run with --dry-run to preview changes');
      console.log('   4. Use the report to guide manual cleanup');
    }

  } catch (error) {
    console.error('❌ Error during scan:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { UnusedCSSScanner };
