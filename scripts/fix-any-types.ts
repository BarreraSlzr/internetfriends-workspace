#!/usr/bin/env bun

/**
 * Fix Explicit Any Types Script
 *
 * This script identifies and replaces explicit 'any' types with proper
 * TypeScript types based on context analysis and common patterns.
 *
 * Usage: bun scripts/fix-any-types.ts [--dry-run] [--file=path]
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';

interface AnyTypeIssue {
  file: string;
  line: number;
  column: number;
  context: string;
  ruleId: string;
  message: string;
}

interface FixStats {
  filesProcessed: number;
  eventTypesFixed: number;
  propsTypesFixed: number;
  functionTypesFixed: number;
  objectTypesFixed: number;
  arrayTypesFixed: number;
}

class AnyTypesFixer {
  private dryRun: boolean = false;
  private targetFile?: string;
  private stats: FixStats = {
    filesProcessed: 0,
    eventTypesFixed: 0,
    propsTypesFixed: 0,
    functionTypesFixed: 0,
    objectTypesFixed: 0,
    arrayTypesFixed: 0
  };

  constructor(options: { dryRun?: boolean; targetFile?: string } = {}) {
    this.dryRun = options.dryRun || false;
    this.targetFile = options.targetFile;
  }

  async run(): Promise<void> {
    console.log('🔍 Analyzing explicit any types...');

    const issues = await this.getAnyTypeIssues();
    console.log(`Found ${issues.length} explicit any type issues`);

    if (issues.length === 0) {
      console.log('✅ No explicit any types found!');
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

  private async getAnyTypeIssues(): Promise<AnyTypeIssue[]> {
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
      if (error.stdout) {
        return this.parseEslintOutput(error.stdout);
      }
      return [];
    }
  }

  private parseEslintOutput(output: string): AnyTypeIssue[] {
    try {
      const results = JSON.parse(output);
      const issues: AnyTypeIssue[] = [];

      for (const result of results) {
        for (const message of result.messages) {
          if (message.ruleId === '@typescript-eslint/no-explicit-any') {
            issues.push({
              file: result.filePath,
              line: message.line,
              column: message.column,
              context: '',
              ruleId: message.ruleId,
              message: message.message
            });
          }
        }
      }

      return issues;
    } catch {
      return [];
    }
  }

  private groupIssuesByFile(issues: AnyTypeIssue[]): Record<string, AnyTypeIssue[]> {
    return issues.reduce((acc, issue) => {
      if (!acc[issue.file]) {
        acc[issue.file] = [];
      }
      acc[issue.file].push(issue);
      return acc;
    }, {} as Record<string, AnyTypeIssue[]>);
  }

  private async processFile(filePath: string, issues: AnyTypeIssue[]): Promise<void> {
    if (!existsSync(filePath)) {
      console.warn(`⚠️  File not found: ${filePath}`);
      return;
    }

    let content = readFileSync(filePath, 'utf-8');
    const originalContent = content;
    const lines = content.split('\n');

    let hasChanges = false;

    // Add context to issues
    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      if (lineIndex < lines.length) {
        issue.context = lines[lineIndex].trim();
      }
    }

    // Process issues in reverse order to avoid line number shifts
    issues.sort((a, b) => b.line - a.line);

    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      if (lineIndex >= lines.length) continue;

      const line = lines[lineIndex];
      const fixedLine = this.fixAnyType(line, issue, filePath);

      if (fixedLine !== line) {
        lines[lineIndex] = fixedLine;
        hasChanges = true;
        this.updateStats(issue, fixedLine);

        if (!this.dryRun) {
          console.log(`✅ Fixed any type in ${filePath.replace(process.cwd(), '.')}:${issue.line}`);
        } else {
          console.log(`🔍 Would fix any type in ${filePath.replace(process.cwd(), '.')}:${issue.line}`);
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

  private fixAnyType(line: string, issue: AnyTypeIssue, filePath: string): string {
    const context = issue.context;

    // Event handlers and callbacks
    if (this.isEventHandler(context)) {
      return this.fixEventType(line, context, filePath);
    }

    // React props
    if (this.isReactProps(context, filePath)) {
      return this.fixPropsType(line, context);
    }

    // Function parameters and return types
    if (this.isFunctionSignature(context)) {
      return this.fixFunctionType(line, context);
    }

    // Object types
    if (this.isObjectType(context)) {
      return this.fixObjectType(line, context);
    }

    // Array types
    if (this.isArrayType(context)) {
      return this.fixArrayType(line, context);
    }

    // Generic fallbacks
    return this.fixGenericAny(line, context);
  }

  private isEventHandler(context: string): boolean {
    return (
      context.includes('Event') ||
      context.includes('onClick') ||
      context.includes('onChange') ||
      context.includes('onSubmit') ||
      context.includes('Handler') ||
      context.includes('callback') ||
      context.includes('event')
    );
  }

  private isReactProps(context: string, filePath: string): boolean {
    return (
      filePath.includes('.tsx') &&
      (context.includes('props') || context.includes('Props') || context.includes('children'))
    );
  }

  private isFunctionSignature(context: string): boolean {
    return (
      context.includes('=>') ||
      context.includes('function') ||
      context.includes('(): any') ||
      context.includes('): any')
    );
  }

  private isObjectType(context: string): boolean {
    return (
      context.includes('Record<') ||
      context.includes('object') ||
      context.includes('{') ||
      context.includes('data') ||
      context.includes('config') ||
      context.includes('options')
    );
  }

  private isArrayType(context: string): boolean {
    return (
      context.includes('[]') ||
      context.includes('Array<') ||
      context.includes('items') ||
      context.includes('list')
    );
  }

  private fixEventType(line: string, context: string, filePath: string): string {
    // React events
    if (filePath.includes('.tsx') || filePath.includes('.jsx')) {
      if (context.includes('onClick') || context.includes('onMouseDown') || context.includes('onMouseUp')) {
        return line.replace(/:\s*any\b/g, ': React.MouseEvent<HTMLElement>');
      }
      if (context.includes('onChange') || context.includes('onInput')) {
        return line.replace(/:\s*any\b/g, ': React.ChangeEvent<HTMLInputElement>');
      }
      if (context.includes('onSubmit')) {
        return line.replace(/:\s*any\b/g, ': React.FormEvent<HTMLFormElement>');
      }
      if (context.includes('onKeyDown') || context.includes('onKeyUp')) {
        return line.replace(/:\s*any\b/g, ': React.KeyboardEvent<HTMLElement>');
      }
      if (context.includes('Event') || context.includes('event')) {
        return line.replace(/:\s*any\b/g, ': React.SyntheticEvent');
      }
    }

    // Generic event types
    if (context.includes('CustomEvent') || context.includes('MessageEvent')) {
      return line.replace(/:\s*any\b/g, ': Event');
    }

    return line.replace(/:\s*any\b/g, ': unknown');
  }

  private fixPropsType(line: string, context: string): string {
    if (context.includes('children')) {
      return line.replace(/:\s*any\b/g, ': React.ReactNode');
    }
    if (context.includes('className')) {
      return line.replace(/:\s*any\b/g, ': string');
    }
    if (context.includes('style')) {
      return line.replace(/:\s*any\b/g, ': React.CSSProperties');
    }
    if (context.includes('ref')) {
      return line.replace(/:\s*any\b/g, ': React.RefObject<HTMLElement>');
    }

    return line.replace(/:\s*any\b/g, ': Record<string, unknown>');
  }

  private fixFunctionType(line: string, context: string): string {
    // Function parameters
    if (context.includes('(') && context.includes('):')) {
      return line.replace(/:\s*any\b/g, ': unknown');
    }

    // Function return types
    if (context.includes('): any')) {
      if (context.includes('Promise') || context.includes('async')) {
        return line.replace(/:\s*any\b/g, ': Promise<unknown>');
      }
      return line.replace(/:\s*any\b/g, ': unknown');
    }

    // Callback functions
    if (context.includes('callback') || context.includes('handler')) {
      return line.replace(/:\s*any\b/g, ': (...args: unknown[]) => unknown');
    }

    return line.replace(/:\s*any\b/g, ': unknown');
  }

  private fixObjectType(line: string, context: string): string {
    // Specific object patterns
    if (context.includes('config') || context.includes('options')) {
      return line.replace(/:\s*any\b/g, ': Record<string, unknown>');
    }

    if (context.includes('data') || context.includes('payload')) {
      return line.replace(/:\s*any\b/g, ': Record<string, unknown>');
    }

    if (context.includes('Record<')) {
      return line.replace(/any\b/g, 'unknown');
    }

    return line.replace(/:\s*any\b/g, ': Record<string, unknown>');
  }

  private fixArrayType(line: string, context: string): string {
    if (context.includes('Array<any>')) {
      return line.replace(/Array<any>/g, 'Array<unknown>');
    }

    if (context.includes('any[]')) {
      return line.replace(/any\[\]/g, 'unknown[]');
    }

    return line.replace(/:\s*any\b/g, ': unknown[]');
  }

  private fixGenericAny(line: string, context: string): string {
    // Last resort: replace with unknown
    return line.replace(/:\s*any\b/g, ': unknown');
  }

  private updateStats(issue: AnyTypeIssue, fixedLine: string): void {
    const context = issue.context.toLowerCase();

    if (this.isEventHandler(context)) {
      this.stats.eventTypesFixed++;
    } else if (context.includes('props')) {
      this.stats.propsTypesFixed++;
    } else if (this.isFunctionSignature(context)) {
      this.stats.functionTypesFixed++;
    } else if (this.isArrayType(context)) {
      this.stats.arrayTypesFixed++;
    } else {
      this.stats.objectTypesFixed++;
    }
  }

  private printStats(): void {
    console.log('\n📊 Any Types Fix Stats:');
    console.log(`  Files processed: ${this.stats.filesProcessed}`);
    console.log(`  Event types fixed: ${this.stats.eventTypesFixed}`);
    console.log(`  Props types fixed: ${this.stats.propsTypesFixed}`);
    console.log(`  Function types fixed: ${this.stats.functionTypesFixed}`);
    console.log(`  Object types fixed: ${this.stats.objectTypesFixed}`);
    console.log(`  Array types fixed: ${this.stats.arrayTypesFixed}`);

    const total = this.stats.eventTypesFixed + this.stats.propsTypesFixed +
                 this.stats.functionTypesFixed + this.stats.objectTypesFixed +
                 this.stats.arrayTypesFixed;
    console.log(`  Total fixes applied: ${total}`);

    if (this.dryRun) {
      console.log('\n🔍 Dry run completed - no files were modified');
      console.log('Run without --dry-run to apply fixes');
    } else {
      console.log('\n✅ Any types fix completed!');
      console.log('\n💡 Consider adding specific interface definitions for better type safety.');
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
Usage: bun scripts/fix-any-types.ts [OPTIONS]

Options:
  --dry-run          Show what would be fixed without making changes
  --file=PATH        Target specific file instead of entire project
  --help, -h         Show this help message

Examples:
  bun scripts/fix-any-types.ts --dry-run
  bun scripts/fix-any-types.ts --file=components/header.tsx
  bun scripts/fix-any-types.ts

This script replaces explicit 'any' types with proper TypeScript types.
Common replacements:
- Event handlers: React.MouseEvent, React.ChangeEvent, etc.
- Props: Record<string, unknown>, React.ReactNode
- Functions: unknown, Promise<unknown>
- Objects: Record<string, unknown>
- Arrays: unknown[]
    `);
    process.exit(0);
  }

  const fixer = new AnyTypesFixer({ dryRun, targetFile });

  try {
    await fixer.run();
  } catch (error) {
    console.error('❌ Error during any types fix:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
