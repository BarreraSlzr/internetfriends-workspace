#!/usr/bin/env bun

/**
 * Safe Unused Variables Cleanup Script
 *
 * This script safely fixes unused variables by focusing on specific patterns
 * that are guaranteed to be safe, avoiding complex code structures.
 *
 * Usage: bun scripts/fix-unused-variables-safe.ts [--dry-run] [--file=path]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

interface UnusedVariableIssue {
  file: string;
  line: number;
  column: number;
  variable: string;
  ruleId: string;
  message: string;
}

interface FixStats {
  filesProcessed: number;
  unusedImportsRemoved: number;
  unusedParametersFixed: number;
  simpleVariablesRemoved: number;
}

class SafeUnusedVariablesFixer {
  private dryRun: boolean = false;
  private targetFile?: string;
  private stats: FixStats = {
    filesProcessed: 0,
    unusedImportsRemoved: 0,
    unusedParametersFixed: 0,
    simpleVariablesRemoved: 0
  };

  constructor(options: { dryRun?: boolean; targetFile?: string } = {}) {
    this.dryRun = options.dryRun || false;
    this.targetFile = options.targetFile;
  }

  async run(): Promise<void> {
    console.log('🔍 Analyzing unused variables (safe mode)...');

    const issues = await this.getUnusedVariableIssues();
    console.log(`Found ${issues.length} unused variable issues`);

    if (issues.length === 0) {
      console.log('✅ No unused variables found!');
      return;
    }

    // Group issues by file
    const issuesByFile = this.groupIssuesByFile(issues);

    console.log(`📁 Processing ${Object.keys(issuesByFile).length} files...`);

    for (const [filePath, fileIssues] of Object.entries(issuesByFile)) {
      await this.processFile(filePath, fileIssues);
    }

    this.printStats();
  }

  private async getUnusedVariableIssues(): Promise<UnusedVariableIssue[]> {
    try {
      let eslintCmd = 'npx eslint . --format json';
      if (this.targetFile) {
        eslintCmd = `npx eslint "${this.targetFile}" --format json`;
      }

      const output = execSync(eslintCmd, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });

      return this.parseEslintOutput(output);
    } catch (error: Record<string, unknown>) {
      // ESLint returns non-zero exit code when issues are found
      if (error.stdout) {
        return this.parseEslintOutput(error.stdout);
      }
      return [];
    }
  }

  private parseEslintOutput(output: string): UnusedVariableIssue[] {
    try {
      const results = JSON.parse(output);
      const issues: UnusedVariableIssue[] = [];

      for (const result of results) {
        for (const message of result.messages) {
          if (message.ruleId === '@typescript-eslint/no-unused-vars') {
            const variableMatch = message.message.match(/'([^']+)' is (defined but never used|assigned a value but never used)/);
            if (variableMatch) {
              issues.push({
                file: result.filePath,
                line: message.line,
                column: message.column,
                variable: variableMatch[1],
                ruleId: message.ruleId,
                message: message.message
              });
            }
          }
        }
      }

      return issues;
    } catch {
      return [];
    }
  }

  private groupIssuesByFile(issues: UnusedVariableIssue[]): Record<string, UnusedVariableIssue[]> {
    return issues.reduce((acc, issue) => {
      if (!acc[issue.file]) {
        acc[issue.file] = [];
      }
      acc[issue.file].push(issue);
      return acc;
    }, {} as Record<string, UnusedVariableIssue[]>);
  }

  private async processFile(filePath: string, issues: UnusedVariableIssue[]): Promise<void> {
    if (!existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return;
    }

    const content = readFileSync(filePath, 'utf-8');

    const lines = content.split('\n');

    let hasChanges = false;

    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      if (lineIndex >= lines.length) continue;

      const line = lines[lineIndex];
      const variable = issue.variable;

      // Only fix safe patterns
      const fixedLine = this.safeFixUnusedVariable(line, variable, issue.message);

      if (fixedLine !== line) {
        lines[lineIndex] = fixedLine;
        hasChanges = true;
        this.updateStats(issue.message);

        if (!this.dryRun) {
          console.log(`✅ Fixed: ${variable} in ${filePath.replace(process.cwd(), '.')}`);
        } else {
          console.log(`🔍 Would fix: ${variable} in ${filePath.replace(process.cwd(), '.')}`);
        }
      }
    }

    if (hasChanges) {
      this.stats.filesProcessed++;
      const newContent = lines.join('\n');

      if (!this.dryRun) {
        writeFileSync(filePath, newContent, 'utf-8');
      }
    }
  }

  private safeFixUnusedVariable(line: string, variable: string, message: string): string {
    // Strategy 1: Remove simple unused imports
    if (this.isSafeImportToRemove(line, variable)) {
      return this.fixUnusedImport(line, variable);
    }

    // Strategy 2: Prefix unused parameters with underscore (safe)
    if (message.includes('defined but never used') && this.isParameterLine(line, variable)) {
      return this.prefixParameter(line, variable);
    }

    // Strategy 3: Remove simple variable declarations (very conservative)
    if (this.isSimpleVariableDeclaration(line, variable)) {
      return this.removeSimpleVariable(line, variable);
    }

    return line;
  }

  private isSafeImportToRemove(line: string, variable: string): boolean {
    const trimmed = line.trim();

    // Only remove if it's a clear, simple import
    return (
      trimmed.startsWith('import ') &&
      (
        // Single default import: import Variable from 'module'
        new RegExp(`^import\\s+${this.escapeRegex(variable)}\\s+from\\s+['""]`).test(trimmed) ||
        // Single named import: import { Variable } from 'module'
        new RegExp(`^import\\s*\\{\\s*${this.escapeRegex(variable)}\\s*\\}\\s+from`).test(trimmed)
      )
    );
  }

  private fixUnusedImport(line: string, variable: string): string {
    const trimmed = line.trim();

    // Single default import
    if (new RegExp(`^import\\s+${this.escapeRegex(variable)}\\s+from`).test(trimmed)) {
      return '';
    }

    // Single named import
    if (new RegExp(`^import\\s*\\{\\s*${this.escapeRegex(variable)}\\s*\\}\\s+from`).test(trimmed)) {
      return '';
    }

    // Multi-named import (remove only the specific import)
    if (trimmed.includes(`{ ${variable},`) || trimmed.includes(`, ${variable},`) || trimmed.includes(`, ${variable} }`)) {
      let fixed = line
        .replace(new RegExp(`,\\s*${this.escapeRegex(variable)}\\s*`, 'g'), '')
        .replace(new RegExp(`${this.escapeRegex(variable)}\\s*,\\s*`, 'g'), '');

      // Clean up spacing
      fixed = fixed.replace(/\{\s*,/, '{').replace(/,\s*\}/, '}');

      return fixed;
    }

    return line;
  }

  private isParameterLine(line: string, variable: string): boolean {
    // Check if this looks like a function parameter
    return (
      (line.includes('function ') || line.includes('=>') || line.includes(': (')) &&
      line.includes('(') &&
      line.includes(')') &&
      line.includes(variable)
    );
  }

  private prefixParameter(line: string, variable: string): string {
    // Only prefix if the variable is clearly a parameter and not used elsewhere in the line
    const variablePattern = new RegExp(`\\b${this.escapeRegex(variable)}\\b`, 'g');
    const matches = line.match(variablePattern);

    // If variable appears only once (as parameter), it's safe to prefix
    if (matches && matches.length === 1) {
      return line.replace(new RegExp(`\\b${this.escapeRegex(variable)}\\b`), `_${variable}`);
    }

    return line;
  }

  private isSimpleVariableDeclaration(line: string, variable: string): boolean {
    const trimmed = line.trim();

    // Only handle very simple cases
    return (
      // Single variable declaration: const variable = value;
      new RegExp(`^(const|let|var)\\s+${this.escapeRegex(variable)}\\s*=`).test(trimmed) &&
      !trimmed.includes(',') && // No multiple declarations
      !trimmed.includes('function') && // No function declarations
      !trimmed.includes('=>') && // No arrow functions
      !trimmed.includes('{') && // No complex objects
      !trimmed.includes('[') // No arrays
    );
  }

  private removeSimpleVariable(line: string, variable: string): string {
    const trimmed = line.trim();

    if (new RegExp(`^(const|let|var)\\s+${this.escapeRegex(variable)}\\s*=`).test(trimmed)) {
      // Only remove if it's a complete statement on its own line
      if (trimmed.endsWith(';') || trimmed.endsWith(',')) {
        return '';
      }
    }

    return line;
  }

  private updateStats(message: string): void {
    if (message.includes('import')) {
      this.stats.unusedImportsRemoved++;
    } else if (message.includes('assigned a value but never used')) {
      this.stats.simpleVariablesRemoved++;
    } else if (message.includes('defined but never used')) {
      this.stats.unusedParametersFixed++;
    }
  }

  private escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  private printStats(): void {
    console.log('\n📊 Safe Cleanup Stats:');
    console.log(`  Files processed: ${this.stats.filesProcessed}`);
    console.log(`  Unused imports removed: ${this.stats.unusedImportsRemoved}`);
    console.log(`  Simple variables removed: ${this.stats.simpleVariablesRemoved}`);
    console.log(`  Parameters prefixed: ${this.stats.unusedParametersFixed}`);

    const total = this.stats.unusedImportsRemoved + this.stats.simpleVariablesRemoved + this.stats.unusedParametersFixed;
    console.log(`  Total fixes applied: ${total}`);

    if (this.dryRun) {
      console.log('\n🔍 Dry run completed - no files were modified');
      console.log('Run without --dry-run to apply fixes');
    } else {
      console.log('\n✅ Safe cleanup completed!');
    }
  }
}

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetFileArg = args.find(arg => arg.startsWith('--file='));
  const targetFile = targetFileArg ? targetFileArg.split('=')[1] : undefined;

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
Usage: bun scripts/fix-unused-variables-safe.ts [OPTIONS]

Options:
  --dry-run          Show what would be fixed without making changes
  --file=PATH        Target specific file instead of entire project
  --help, -h         Show this help message

Examples:
  bun scripts/fix-unused-variables-safe.ts --dry-run
  bun scripts/fix-unused-variables-safe.ts --file=components/header.tsx
  bun scripts/fix-unused-variables-safe.ts

This script uses conservative patterns to avoid breaking code structure.
    `);
    process.exit(0);
  }

  const fixer = new SafeUnusedVariablesFixer({ dryRun, targetFile });

  try {
    await fixer.run();
  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
