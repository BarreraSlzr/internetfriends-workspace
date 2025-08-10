#!/usr/bin/env bun
/* InternetFriends Brand-Blue to Accent Migration Helper */
/* Automated migration script for transitioning from static brand-blue classes to dynamic accent system */

import { readdir, readFile, writeFile, stat } from 'fs/promises';
import { join, extname } from 'path';

// =================================================================
// MIGRATION MAPPINGS
// =================================================================

interface MigrationRule {
  pattern: RegExp;
  replacement: string;
  description: string;
  category: 'background' | 'text' | 'border' | 'gradient' | 'semantic';
  confidence: 'high' | 'medium' | 'low';
}

const MIGRATION_RULES: MigrationRule[] = [
  // Background Colors
  {
    pattern: /bg-brand-blue-(\d{3})/g,
    replacement: 'bg-theme-accent-$1',
    description: 'Background colors: brand-blue-* → theme-accent-*',
    category: 'background',
    confidence: 'high'
  },

  // Text Colors
  {
    pattern: /text-brand-blue-(\d{3})/g,
    replacement: 'text-theme-accent-$1',
    description: 'Text colors: brand-blue-* → theme-accent-*',
    category: 'text',
    confidence: 'high'
  },

  // Border Colors
  {
    pattern: /border-brand-blue-(\d{3})/g,
    replacement: 'border-theme-accent-$1',
    description: 'Border colors: brand-blue-* → theme-accent-*',
    category: 'border',
    confidence: 'high'
  },

  // Ring/Focus Colors
  {
    pattern: /ring-brand-blue-(\d{3})/g,
    replacement: 'ring-theme-accent-$1',
    description: 'Ring colors: brand-blue-* → theme-accent-*',
    category: 'border',
    confidence: 'high'
  },

  // Gradient From
  {
    pattern: /from-brand-blue-(\d{3})/g,
    replacement: 'from-theme-accent-$1',
    description: 'Gradient from: brand-blue-* → theme-accent-*',
    category: 'gradient',
    confidence: 'high'
  },

  // Gradient Via
  {
    pattern: /via-brand-blue-(\d{3})/g,
    replacement: 'via-theme-accent-$1',
    description: 'Gradient via: brand-blue-* → theme-accent-*',
    category: 'gradient',
    confidence: 'high'
  },

  // Gradient To
  {
    pattern: /to-brand-blue-(\d{3})/g,
    replacement: 'to-theme-accent-$1',
    description: 'Gradient to: brand-blue-* → theme-accent-*',
    category: 'gradient',
    confidence: 'high'
  },

  // Semantic Replacements (Higher Quality)
  {
    pattern: /border-brand-blue-800\b/g,
    replacement: 'border-border-strong',
    description: 'Semantic border: brand-blue-800 → border-strong',
    category: 'semantic',
    confidence: 'high'
  },

  {
    pattern: /text-brand-blue-900\b/g,
    replacement: 'text-primary',
    description: 'Semantic text: brand-blue-900 → text-primary',
    category: 'semantic',
    confidence: 'high'
  },

  {
    pattern: /bg-brand-blue-50\b/g,
    replacement: 'bg-surface-elevated',
    description: 'Semantic surface: brand-blue-50 → surface-elevated',
    category: 'semantic',
    confidence: 'medium'
  }
];

// =================================================================
// FILE PROCESSING
// =================================================================

interface MigrationResult {
  file: string;
  changes: {
    rule: MigrationRule;
    matches: number;
    preview: string[];
  }[];
  totalChanges: number;
  hasChanges: boolean;
}

interface MigrationSummary {
  filesProcessed: number;
  filesChanged: number;
  totalChanges: number;
  results: MigrationResult[];
  errors: string[];
}

/**
 * Check if file should be processed based on extension
 */
function shouldProcessFile(filePath: string): boolean {
  const validExtensions = ['.tsx', '.ts', '.jsx', '.js', '.css', '.scss'];
  return validExtensions.includes(extname(filePath));
}

/**
 * Apply migration rules to file content
 */
function applyMigrationRules(content: string, filePath: string): MigrationResult {
  const result: MigrationResult = {
    file: filePath,
    changes: [],
    totalChanges: 0,
    hasChanges: false
  };

  let modifiedContent = content;

  for (const rule of MIGRATION_RULES) {
    const matches = Array.from(content.matchAll(rule.pattern));

    if (matches.length > 0) {
      const previews = matches.slice(0, 3).map(match =>
        `Line ${getLineNumber(content, match.index!)}: "${match[0]}" → "${match[0].replace(rule.pattern, rule.replacement)}"`
      );

      result.changes.push({
        rule,
        matches: matches.length,
        preview: previews
      });

      result.totalChanges += matches.length;
      modifiedContent = modifiedContent.replace(rule.pattern, rule.replacement);
    }
  }

  result.hasChanges = result.totalChanges > 0;
  return result;
}

/**
 * Get line number for a character index
 */
function getLineNumber(content: string, index: number): number {
  return content.substring(0, index).split('\n').length;
}

/**
 * Recursively find all files to process
 */
async function findFiles(dir: string, exclude: string[] = []): Promise<string[]> {
  const files: string[] = [];

  try {
    const entries = await readdir(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);

      // Skip excluded directories
      if (exclude.some(excluded => fullPath.includes(excluded))) {
        continue;
      }

      const stats = await stat(fullPath);

      if (stats.isDirectory()) {
        const subFiles = await findFiles(fullPath, exclude);
        files.push(...subFiles);
      } else if (shouldProcessFile(fullPath)) {
        files.push(fullPath);
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read directory ${dir}:`, error);
  }

  return files;
}

// =================================================================
// MIGRATION EXECUTION
// =================================================================

/**
 * Run migration analysis (dry run)
 */
async function analyzeMigration(rootDir: string = './app'): Promise<MigrationSummary> {
  console.log('🔍 Analyzing files for brand-blue usage...');

  const excludeDirs = ['node_modules', '.next', '.git', 'dist', 'build'];
  const files = await findFiles(rootDir, excludeDirs);

  const summary: MigrationSummary = {
    filesProcessed: 0,
    filesChanged: 0,
    totalChanges: 0,
    results: [],
    errors: []
  };

  for (const filePath of files) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const result = applyMigrationRules(content, filePath);

      summary.filesProcessed++;
      summary.results.push(result);

      if (result.hasChanges) {
        summary.filesChanged++;
        summary.totalChanges += result.totalChanges;
      }
    } catch (error) {
      summary.errors.push(`Error processing ${filePath}: ${error}`);
    }
  }

  return summary;
}

/**
 * Execute migration (write changes)
 */
async function executeMigration(rootDir: string = './app', dryRun: boolean = true): Promise<MigrationSummary> {
  const summary = await analyzeMigration(rootDir);

  if (dryRun) {
    console.log('📝 DRY RUN - No files will be modified');
    return summary;
  }

  console.log('✏️  Applying migrations...');

  for (const result of summary.results) {
    if (result.hasChanges) {
      try {
        let content = await readFile(result.file, 'utf-8');

        // Apply all rules
        for (const rule of MIGRATION_RULES) {
          content = content.replace(rule.pattern, rule.replacement);
        }

        await writeFile(result.file, content, 'utf-8');
        console.log(`✅ Updated: ${result.file}`);
      } catch (error) {
        summary.errors.push(`Error updating ${result.file}: ${error}`);
      }
    }
  }

  return summary;
}

// =================================================================
// REPORTING
// =================================================================

/**
 * Generate migration report
 */
function generateReport(summary: MigrationSummary): void {
  console.log('\n🎨 InternetFriends Brand-Blue Migration Report');
  console.log('='.repeat(50));

  // Summary
  console.log(`📁 Files processed: ${summary.filesProcessed}`);
  console.log(`📝 Files with changes: ${summary.filesChanged}`);
  console.log(`🔄 Total changes: ${summary.totalChanges}`);

  if (summary.errors.length > 0) {
    console.log(`❌ Errors: ${summary.errors.length}`);
  }

  // Changes by category
  const categoryCounts = new Map<string, number>();
  for (const result of summary.results) {
    for (const change of result.changes) {
      const category = change.rule.category;
      categoryCounts.set(category, (categoryCounts.get(category) || 0) + change.matches);
    }
  }

  if (categoryCounts.size > 0) {
    console.log('\n📊 Changes by Category:');
    for (const [category, count] of categoryCounts.entries()) {
      console.log(`  ${category.padEnd(12)}: ${count} changes`);
    }
  }

  // Top changed files
  const changedFiles = summary.results
    .filter(r => r.hasChanges)
    .sort((a, b) => b.totalChanges - a.totalChanges)
    .slice(0, 5);

  if (changedFiles.length > 0) {
    console.log('\n📄 Files with Most Changes:');
    for (const result of changedFiles) {
      console.log(`  ${result.file}: ${result.totalChanges} changes`);
    }
  }

  // Detailed changes preview
  const detailedResults = summary.results
    .filter(r => r.hasChanges)
    .slice(0, 3);

  if (detailedResults.length > 0) {
    console.log('\n🔍 Sample Changes Preview:');
    for (const result of detailedResults) {
      console.log(`\n📁 ${result.file}:`);
      for (const change of result.changes.slice(0, 2)) {
        console.log(`  🔄 ${change.rule.description} (${change.matches} matches)`);
        for (const preview of change.preview.slice(0, 2)) {
          console.log(`    ${preview}`);
        }
      }
    }
  }

  // Errors
  if (summary.errors.length > 0) {
    console.log('\n❌ Errors encountered:');
    for (const error of summary.errors.slice(0, 5)) {
      console.log(`  ${error}`);
    }
  }

  console.log('\n' + '='.repeat(50));
}

// =================================================================
// CLI INTERFACE
// =================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'analyze';
  const rootDir = args[1] || './app';

  console.log('🎨 InternetFriends Brand-Blue Migration Tool');
  console.log(`📂 Target directory: ${rootDir}`);

  try {
    switch (command) {
      case 'analyze':
      case 'dry-run':
        const analyzeResult = await analyzeMigration(rootDir);
        generateReport(analyzeResult);

        if (analyzeResult.filesChanged > 0) {
          console.log('\n💡 Next steps:');
          console.log('  • Review the changes above');
          console.log('  • Run "bun migration/brand-blue-migration.ts execute" to apply changes');
          console.log('  • Test thoroughly after migration');
        }
        break;

      case 'execute':
      case 'apply':
        console.log('⚠️  This will modify your files! Make sure you have backups.');

        // In a real implementation, you might want to ask for confirmation
        const executeResult = await executeMigration(rootDir, false);
        generateReport(executeResult);

        console.log('\n✅ Migration completed!');
        console.log('🧪 Please test your application thoroughly');
        console.log('🎨 Consider running the accent system demo at /theme-demo');
        break;

      case 'help':
      default:
        console.log('\n📖 Usage:');
        console.log('  bun migration/brand-blue-migration.ts [command] [directory]');
        console.log('\nCommands:');
        console.log('  analyze   - Analyze files for brand-blue usage (default)');
        console.log('  execute   - Apply migrations to files');
        console.log('  help      - Show this help message');
        console.log('\nExamples:');
        console.log('  bun migration/brand-blue-migration.ts analyze ./components');
        console.log('  bun migration/brand-blue-migration.ts execute ./app');
        break;
    }
  } catch (error) {
    console.error('💥 Migration failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}

export { analyzeMigration, executeMigration, MIGRATION_RULES };
