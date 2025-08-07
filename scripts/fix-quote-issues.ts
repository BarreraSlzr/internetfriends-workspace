#!/usr/bin/env bun

/**
 * Fix Quote Issues Script
 *
 * This script fixes the overly aggressive quote replacement that broke import statements
 * and other code syntax. It restores proper quotes where needed.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

class QuoteFixer {
  private projectRoot: string;
  private excludeDirs = ['node_modules', '.next', 'dist', 'build', '.git'];
  private includeExtensions = ['.ts', '.tsx', '.js', '.jsx'];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Get all TypeScript/React files in the project
   */
  private getAllFiles(dir: string = this.projectRoot): string[] {
    const files: string[] = [];

    const entries = readdirSync(dir);

    for (const entry of entries) {
      const fullPath = join(dir, entry);
      const stat = statSync(fullPath);

      if (stat.isDirectory()) {
        if (!this.excludeDirs.includes(entry)) {
          files.push(...this.getAllFiles(fullPath));
        }
      } else if (this.includeExtensions.includes(extname(entry))) {
        files.push(fullPath);
      }
    }

    return files;
  }

  /**
   * Fix quote issues in code
   */
  private fixQuotes(content: string): string {
    let fixed = content;

    // Fix import statements - restore double quotes in import paths
    fixed = fixed.replace(/import\s+([^;]*?)\s+from\s+"([^&]+)"/g, 'import $1 from "$2"');
    fixed = fixed.replace(/import\s+"([^&]+)"/g, 'import "$1"');

    // Fix export statements
    fixed = fixed.replace(/export\s+([^;]*?)\s+from\s+"([^&]+)"/g, 'export $1 from "$2"');

    // Fix require statements
    fixed = fixed.replace(/require\("([^&]+)"\)/g, 'require("$1")');

    // Fix dynamic imports
    fixed = fixed.replace(/import\("([^&]+)"\)/g, 'import("$1")');

    // Fix CSS imports and other file references
    fixed = fixed.replace(/"([^&]*?\.(css|scss|module\.css|module\.scss))"/g, '"$1"');

    // Fix single quotes in imports
    fixed = fixed.replace(/import\s+([^;]*?)\s+from\s+'([^&]+)'/g, 'import $1 from "$2"');
    fixed = fixed.replace(/import\s+'([^&]+)'/g, 'import "$1"');

    // Fix JSX attribute quotes - only fix HTML entity quotes in JSX attributes
    // Keep proper quotes for string literals in JSX
    fixed = fixed.replace(/(\w+)=\{"([^&]*?)"\}/g, '$1={"$2"}');
    fixed = fixed.replace(/(\w+)="([^&]*?)"/g, '$1="$2"');

    // Fix object property quotes
    fixed = fixed.replace(/"([^&]*?)":\s*([^,}\n]+)/g, '"$1": $2');

    // Fix JSON-like structures
    fixed = fixed.replace(/{\s*"([^&]*?)":\s*"([^&]*?)"\s*}/g, '{"$1": "$2"}');

    // Fix string literals in TypeScript/JavaScript (but not in JSX text content)
    // Only fix quotes that are clearly string literals
    fixed = fixed.replace(/=\s*"([^&]*?)"/g, '= "$1"');
    fixed = fixed.replace(/:\s*"([^&]*?)"/g, ': "$1"');
    fixed = fixed.replace(/\(\s*"([^&]*?)"\s*\)/g, '("$1")');
    fixed = fixed.replace(/\[\s*"([^&]*?)"\s*\]/g, '["$1"]');

    // Fix template literals
    fixed = fixed.replace(/`([^`]*?)"([^`]*?)`/g, '`$1"$2`');
    fixed = fixed.replace(/`([^`]*?)'([^`]*?)`/g, "`$1'$2`");

    // Fix comments with quotes
    fixed = fixed.replace(/\/\/\s*([^&]*?)"([^&]*?)"/g, '// $1"$2"');
    fixed = fixed.replace(/\/\*\s*([^&]*?)"([^&]*?)"([^*]*?)\*\//g, '/* $1"$2"$3 */');

    // Fix single quotes that should remain single quotes in some contexts
    // Convert back single quotes in contractions and common cases
    fixed = fixed.replace(/don't/gi, "don't");
    fixed = fixed.replace(/can't/gi, "can't");
    fixed = fixed.replace(/won't/gi, "won't");
    fixed = fixed.replace(/it's/gi, "it's");
    fixed = fixed.replace(/that's/gi, "that's");
    fixed = fixed.replace(/here's/gi, "here's");
    fixed = fixed.replace(/there's/gi, "there's");
    fixed = fixed.replace(/what's/gi, "what's");
    fixed = fixed.replace(/where's/gi, "where's");
    fixed = fixed.replace(/we're/gi, "we're");
    fixed = fixed.replace(/you're/gi, "you're");
    fixed = fixed.replace(/they're/gi, "they're");

    return fixed;
  }

  /**
   * Process a single file
   */
  private processFile(filePath: string): boolean {
    try {
      const content = readFileSync(filePath, 'utf8');

      // Skip files that don't have quote entities
      if (!content.includes('"') && !content.includes(''')) {
        return false;
      }

      const fixed = this.fixQuotes(content);

      if (fixed !== content) {
        writeFileSync(filePath, fixed, 'utf8');
        return true;
      }

      return false;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
      return false;
    }
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🔧 Fixing quote issues caused by overly aggressive replacement...\n');

    const files = this.getAllFiles();
    let totalFiles = 0;
    let fixedFiles = 0;

    for (const file of files) {
      if (file.includes('node_modules') || file.includes('.next')) continue;

      const wasFixed = this.processFile(file);

      totalFiles++;

      if (wasFixed) {
        fixedFiles++;
        console.log(`✅ Fixed: ${file.replace(this.projectRoot, '.')}`);
      }
    }

    console.log(`\n📊 Summary:`);
    console.log(`📁 Files processed: ${totalFiles}`);
    console.log(`🔧 Files fixed: ${fixedFiles}`);
    console.log(`⚪ Files unchanged: ${totalFiles - fixedFiles}`);

    if (fixedFiles > 0) {
      console.log('\n🎉 Quote issues have been fixed!');
      console.log('💡 You should now run "bun run lint" to verify the fixes.');
    } else {
      console.log('\n✅ No quote issues found or already fixed!');
    }
  }
}

// Run the fixer if this script is executed directly
if (import.meta.main) {
  const fixer = new QuoteFixer();
  await fixer.run();
}

export default QuoteFixer;
