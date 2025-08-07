#!/usr/bin/env bun

/**
 * Focused Unused Variables Fix Script
 *
 * This script addresses unused imports and variables by either removing them
 * or prefixing them with underscore to indicate intentional non-use.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';
import { execSync } from 'child_process';

interface UnusedIssue {
  file: string;
  line: number;
  column: number;
  variable: string;
  type: 'import' | 'variable' | 'parameter';
}

class UnusedVariableFixer {
  private projectRoot: string;
  private excludeDirs = ['node_modules', '.next', 'dist', 'build', '.git'];
  private includeExtensions = ['.ts', '.tsx', '.js', '.jsx'];

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot;
  }

  /**
   * Get unused variable issues from ESLint
   */
  private getUnusedIssues(): UnusedIssue[] {
    try {
      const lintOutput = execSync('bunx eslint . --format=json', {
        cwd: this.projectRoot,
        encoding: 'utf8'
      });

      const results = JSON.parse(lintOutput);
      const issues: UnusedIssue[] = [];

      for (const result of results) {
        for (const message of result.messages) {
          if (message.ruleId === '@typescript-eslint/no-unused-vars') {
            const variable = this.extractVariableName(message.message);
            const type = this.determineVariableType(message.message, variable);

            issues.push({
              file: result.filePath,
              line: message.line,
              column: message.column,
              variable,
              type
            });
          }
        }
      }

      return issues;
    } catch () {
      console.warn('Could not get ESLint output, proceeding with manual detection...');
      return [];
    }
  }

  private extractVariableName(message: string): string {
    const match = message.match(/'([^']+)' is (defined|assigned)/);
    return match ? match[1] : '';
  }

  private determineVariableType(message: string, : string): 'import' | '' | 'parameter' {
    if (message.includes('is defined but never used') && message.includes('import')) {
      return 'import';
    }
    if (message.includes('is assigned a value but never used')) {
      return 'variable';
    }
    return 'parameter';
  }

  /**
   * Get all TypeScript/React files
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
   * Fix unused imports in a file
   */
  private fixUnusedImports(content: string, unusedImports: string[]): string {
    const fixed = content;
    const lines = fixed.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      if (line.trim().startsWith('import')) {
        for (const unusedImport of unusedImports) {
          // Handle named imports: import { a, b, c } from '...'
          if (line.includes(`{ ${unusedImport}`) || line.includes(`, ${unusedImport}`) || line.includes(`${unusedImport},`) || line.includes(`${unusedImport} }`)) {
            // Remove this specific import from the named imports
            let newLine = line;

            // Remove the unused import from the list
            newLine = newLine.replace(new RegExp(`\\s*,?\\s*${unusedImport}\\s*,?`, 'g'), '');
            newLine = newLine.replace(/{\s*,/, '{');
            newLine = newLine.replace(/,\s*}/, '}');
            newLine = newLine.replace(/{\s*}/, '{}');

            // If the import is now empty, remove the entire line
            if (newLine.includes('{}') || newLine.match(/import\s+{\s*}\s+from/)) {
              lines[i] = '';
            } else {
              lines[i] = newLine;
            }
          }

          // Handle default imports: import name from '...'
          else if (line.match(new RegExp(`import\\s+${unusedImport}\\s+from`))) {
            lines[i] = '';
          }

          // Handle namespace imports: import * as name from '...'
          else if (line.match(new RegExp(`import\\s+\\*\\s+as\\s+${unusedImport}\\s+from`))) {
            lines[i] = '';
          }
        }
      }
    }

    return lines.filter(line => line.trim() !== '').join('\n');
  }

  /**
   * Fix unused variables by prefixing with underscore
   */
  private fixUnusedVariables(content: string, unusedVars: string[]): string {
    let fixed = content;

    for (const unusedVar of unusedVars) {
      // Skip if already prefixed with underscore
      if (unusedVar.startsWith('_')) continue;

      // Fix variable declarations
      fixed = fixed.replace(
        new RegExp(`\\b(const|let|var)\\s+(${unusedVar})\\s*=`, 'g'),
        `$1 _${unusedVar} =`
      );

      // Fix destructuring assignments
      fixed = fixed.replace(
        new RegExp(`{([^}]*?)\\b${unusedVar}\\b([^}]*?)}`, 'g'),
        (match, before, after) => {
          return `{${before}_${unusedVar}${after}}`;
        }
      );

      // Fix function parameters
      fixed = fixed.replace(
        new RegExp(`\\((.*?)\\b${unusedVar}\\b(.*?)\\)\\s*=>`, 'g'),
        `($1_${unusedVar}$2) =>`
      );

      // Fix function declarations
      fixed = fixed.replace(
        new RegExp(`function\\s+\\w+\\s*\\(([^)]*)\\b${unusedVar}\\b([^)]*)\\)`, 'g'),
        `function ($1_${unusedVar}$2)`
      );
    }

    return fixed;
  }

  /**
   * Process a single file
   */
  private processFile(filePath: string, fileIssues: UnusedIssue[]): number {
    try {
      const content = readFileSync(filePath, 'utf8');

      if (fileIssues.length === 0) return 0;

      const unusedImports = fileIssues
        .filter(issue => issue.type === 'import')
        .map(issue => issue.variable);

      const unusedVars = fileIssues
        .filter(issue => issue.type === 'variable' || issue.type === 'parameter')
        .map(issue => issue.variable);

      let fixed = content;

      // Fix unused imports
      if (unusedImports.length > 0) {
        fixed = this.fixUnusedImports(fixed, unusedImports);
      }

      // Fix unused variables
      if (unusedVars.length > 0) {
        fixed = this.fixUnusedVariables(fixed, unusedVars);
      }

      if (fixed !== content) {
        writeFileSync(filePath, fixed, 'utf8');
        return fileIssues.length;
      }

      return 0;
    } catch (error) {
      console.error(`Error processing ${filePath}:`, error);
      return 0;
    }
  }

  /**
   * Main execution function
   */
  async run() {
    console.log('🔧 Fixing unused variables and imports...\n');

    const issues = this.getUnusedIssues();

    if (issues.length === 0) {
      console.log('✅ No unused variable issues found!');
      return;
    }

    console.log(`Found ${issues.length} unused variable issues\n`);

    // Group issues by file
    const fileGroups = issues.reduce((acc, issue) => {
      if (!acc[issue.file]) acc[issue.file] = [];
      acc[issue.file].push(issue);
      return acc;
    }, {} as Record<string, UnusedIssue[]>);

    let totalFixed = 0;
    let filesProcessed = 0;

    for (const [filePath, fileIssues] of Object.entries(fileGroups)) {
      const relativePath = filePath.replace(this.projectRoot, '.');
      process.stdout.write(`Processing: ${relativePath}...`);

      const fixedCount = this.processFile(filePath, fileIssues);

      if (fixedCount > 0) {
        console.log(` ✅ Fixed ${fixedCount} issues`);
        totalFixed += fixedCount;
      } else {
        console.log(` ⚪ No changes made`);
      }

      filesProcessed++;
    }

    console.log(`\n📊 Summary:`);
    console.log(`📁 Files processed: ${filesProcessed}`);
    console.log(`🔧 Issues fixed: ${totalFixed}`);

    // Run lint check again
    console.log('\n🔍 Checking remaining unused variable issues...');
    const remainingIssues = this.getUnusedIssues();

    if (remainingIssues.length === 0) {
      console.log('✅ All unused variable issues resolved!');
    } else {
      console.log(`⚠️  ${remainingIssues.length} issues remain (may need manual review)`);

      // Show top remaining files
      const remainingFiles = remainingIssues.reduce((acc, issue) => {
        const fileName = issue.file.replace(this.projectRoot, '.');
        if (!acc[fileName]) acc[fileName] = 0;
        acc[fileName]++;
        return acc;
      }, {} as Record<string, number>);

      console.log('\nTop files with remaining issues:');
      Object.entries(remainingFiles)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5)
        .forEach(([file, count]) => {
          console.log(`  ${file}: ${count} issues`);
        });
    }

    console.log('\n🎉 Unused variable fixing complete!');
  }
}

// Run the fixer if this script is executed directly
if (import.meta.main) {
  const fixer = new UnusedVariableFixer();
  await fixer.run();
}

export default UnusedVariableFixer;
