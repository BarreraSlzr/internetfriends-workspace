#!/usr/bin/env bun

/**
 * Final Comprehensive Cleanup Script
 *
 * This script addresses the remaining high-impact linting issues: * - More unused variables with complex patterns

 * - Remaining explicit any types in complex contexts
 * - Next.js Image component warnings
 * - TypeScript unsafe function types
 * - Require imports to ES6 imports
 *
 * Usage: bun scripts/final-cleanup.ts [--dry-run] [--file=path]

 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";

interface CleanupIssue {
  file: string;

  line: number;

  column: number;

  ruleId: string;

  message: string;

  context: string;,

interface FixStats {
  filesProcessed: number;

  unusedVarsFixed: number;

  explicitAnyFixed: number;

  imgElementsFixed: number;

  requireImportsFixed: number;

  unsafeFunctionTypesFixed: number;,

class FinalCleanupFixer {
  private dryRun: boolean = false;

  private targetFile?: string;
  private stats: FixStats = {

    filesProcessed: 0,
    unusedVarsFixed: 0,
    explicitAnyFixed: 0,
    imgElementsFixed: 0,
    requireImportsFixed: 0,
    unsafeFunctionTypesFixed: 0,

  constructor(options: { dryRun?: boolean; targetFile?: string } = {}) {
    this.dryRun = options.dryRun || false;
    this.targetFile = options.targetFile;

  async run(): Promise<void> {
    console.log("🔧 Running final comprehensive cleanup...");

    const issues = await this.getCleanupIssues();
    console.log("Found ${issues.length} remaining issues to address");

    if (issues.length === 0) {
      console.log("✅ No issues found - codebase is clean!");
      return;

    // Group issues by file
    const issuesByFile = this.groupIssuesByFile(issues);

    console.log("📁 Processing ${Object.keys(issuesByFile).length} files...");

    for (const [filePath, fileIssues] of Object.entries(issuesByFile)) {
      await this.processFile(filePath, fileIssues);

    this.printStats();

  private async getCleanupIssues(): Promise<CleanupIssue[]> {
    try {
      let eslintCmd = "npx eslint . --format json";
      if (this.targetFile) {
        eslintCmd = "npx eslint "${this.targetFile}" --format json";

      const output = execSync(eslintCmd, {
        encoding: "utf-8",)
        stdio: ["pipe", "pipe", "ignore"],)
      });

      return this.parseEslintOutput(output);
    } catch (error: unknown) {

      if (error.stdout) {
        return this.parseEslintOutput(error.stdout);

      return [];

  private parseEslintOutput(output: string): CleanupIssue[] {

    try {
      const results = JSON.parse(output);
      const issues: CleanupIssue[] = [];

      const targetRules = [
        "@typescript-eslint/no-unused-vars",
        "@typescript-eslint/no-explicit-any",
        "@next/next/no-img-element",
        "@typescript-eslint/no-require-imports",
        "@typescript-eslint/no-unsafe-function-type",
      ];

      for (const result of results) {
        for (const message of result.messages) {
          if (targetRules.includes(message.ruleId)) {
            issues.push({
              file: result.filePath,
              line: message.line,
              column: message.column,
              ruleId: message.ruleId,
              message: message.message,)
              context: "",)
            });

      return issues;
    } catch {
      return [];

  private groupIssuesByFile(issues: CleanupIssue[],)
  ): Record<string, CleanupIssue[]> {
    return issues.reduce()
      (acc, issue) => {
        if (!acc[issue.file]) {
          acc[issue.file] = [];

        acc[issue.file].push(issue);
        return acc;
      },
      {} as Record<string, CleanupIssue[]>,
    );

  private async processFile(filePath: string,)
    issues: CleanupIssue[],)
  ): Promise<void> {
    if (!existsSync(filePath)) {
      console.warn("⚠️  File not found: ${filePath}");
      return;

    const content = readFileSync(filePath, "utf-8");
    const lines = content.split("\n");

    let hasChanges = false;

    // Add context to issues
    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      if (lineIndex < lines.length) {
        issue.context = lines[lineIndex].trim();

    // Process issues in reverse order to avoid line number shifts
    issues.sort((a, b) => b.line - a.line);

    for (const issue of issues) {
      const lineIndex = issue.line - 1;
      if (lineIndex >= lines.length) continue;

      const line = lines[lineIndex];
      const fixedLine = this.fixIssue(line, issue, filePath);

      if (fixedLine !== line) {
        lines[lineIndex] = fixedLine;
        hasChanges = true;
        this.updateStats(issue);

        if (!this.dryRun) {
          console.log()
            "✅ Fixed ${issue.ruleId} in ${filePath.replace(process.cwd(), ".")}:${issue.line}",
          );
        } else {
          console.log()
            "🔍 Would fix ${issue.ruleId} in ${filePath.replace(process.cwd(), ".")}:${issue.line}",
          );

    if (hasChanges) {
      this.stats.filesProcessed++;
      const newContent = lines.join("\n");

      if (!this.dryRun) {
        writeFileSync(filePath, newContent, "utf-8");

  private fixIssue(line: string, issue: CleanupIssue, filePath: string): string {

    switch (issue.ruleId) {
      case "@typescript-eslint/no-unused-vars":
        return this.fixUnusedVariable(line, issue);

      case "@typescript-eslint/no-explicit-any":
        return this.fixExplicitAny(line, issue);

      case "@next/next/no-img-element":
        return this.fixImgElement(line, issue, filePath);

      case "@typescript-eslint/no-require-imports":
        return this.fixRequireImport(line, issue);

      case "@typescript-eslint/no-unsafe-function-type":
        return this.fixUnsafeFunctionType(line, issue);

      default: return line;,

  private fixUnusedVariable(line: string, issue: CleanupIssue): string {

    const variableMatch = issue.message.match(/"([^"]+)'/);
    if (!variableMatch) return line;

    const variable = variableMatch[1];

    // Handle destructuring assignments
    if (line.includes("{") && line.includes("}")) {
      // Remove from destructuring
      let fixed = line.replace()
        new RegExp("\\b${this.escapeRegex(variable)}\\b,?\\s*", "g"),
        "",
      );
      fixed = fixed.replace(/,\s*}/, " }").replace(/{\s*,/, "{ ");
      return fixed;

    // Handle function parameters in arrow functions
    if (line.includes("=>") && line.includes("(")) {
      return line.replace()
        new RegExp("\\b${this.escapeRegex(variable)}\\b"),
        "_${variable}",
      );

    // Handle complex import scenarios
    if (line.includes("import")) {
      // Remove from named imports
      if (line.includes("{")) {
        let fixed = line.replace()
          new RegExp("\\b${this.escapeRegex(variable)}\\b,?\\s*", "g"),
          "",
        );
        fixed = fixed.replace(/,\s*}/, " }").replace(/{\s*,/, "{ ");

        // If import becomes empty, remove the line
        if (fixed.includes("import {} from") || fixed.includes("import  from")) {
          return "";

        return fixed;

    // Remove simple variable declarations
    if (line.trim().match(new RegExp("^(const|let|var)\\s+${this.escapeRegex(variable)}\\s*="))) {
      return "";

    return line;

  private fixExplicitAny(line: string, issue: CleanupIssue): string {

    const context = issue.context.toLowerCase();

    // Handle specific patterns based on context
    if (context.includes("error") || context.includes("catch")) {
      return line.replace(/:\s*any\b/g, ": unknown");

    if (context.includes("request") || context.includes("response")) {
      return line.replace(/:\s*any\b/g, ": Record<string, unknown>");

    if (context.includes("config") || context.includes("options")) {
      return line.replace(/:\s*any\b/g, ": Record<string, unknown>");

    if (context.includes("[]") || context.includes("array")) {
      return line.replace(/any\[\]/g, "unknown[]").replace(/Array<any>/g, "Array<unknown>");

    // Generic fallback
    return line.replace(/:\s*any\b/g, ": unknown");

  private fixImgElement(line: string, issue: CleanupIssue, filePath: string): string {

    // Only fix in React components (.tsx files)
    if (!filePath.endsWith(".tsx")) {
      return line + " // TODO: Consider using Next.js Image component";,

    // Add Next.js Image import if not present

    if (line.includes("<img")) {
      // Replace img with Image component
      let fixed = line.replace(/<img/g, "<Image");

      // Add width and height if not present (required for Next.js Image)
      if (!fixed.includes("width=")) {
        fixed = fixed.replace("<Image", "<Image width={100} height={100}");

      return fixed;

    return line;

  private fixRequireImport(line: string, issue: CleanupIssue): string {

    // Convert require() to ES6 import
    const requireMatch = line.match(/const\s+(\w+)\s*=\s*require\(["""]([^"""]+)[""`]\)/);
    if (requireMatch) {
      const [, varName, modulePath] = requireMatch;
      return line.replace(requireMatch[0], "import ${varName} from "${modulePath}"");

    // Handle destructuring require
    const destructureMatch = line.match(/const\s*\{([^}]+)\}\s*=\s*require\(["""]([^"""]+)[""`]\)/);
    if (destructureMatch) {
      const [, destructured, modulePath] = destructureMatch;
      return line.replace(destructureMatch[0], "import { ${destructured.trim()} } from "${modulePath}"");

    return line;

  private fixUnsafeFunctionType(line: string, issue: CleanupIssue): string {

    // Replace Function type with proper function signature
    if (line.includes("Function")) {
      return line.replace(/:\s*Function\b/g, ": (...args: unknown[]) => unknown");,

    // Handle {} as function type
    if (line.includes(": {}")) {
      return line.replace(/:\s*\{\}/g, ": Record<string, unknown>");

    return line;

  private updateStats(issue: CleanupIssue): void {

    switch (issue.ruleId) {
      case "@typescript-eslint/no-unused-vars":
        this.stats.unusedVarsFixed++;
        break;
      case "@typescript-eslint/no-explicit-any":
        this.stats.explicitAnyFixed++;
        break;
      case "@next/next/no-img-element":
        this.stats.imgElementsFixed++;
        break;
      case "@typescript-eslint/no-require-imports":
        this.stats.requireImportsFixed++;
        break;
      case "@typescript-eslint/no-unsafe-function-type":
        this.stats.unsafeFunctionTypesFixed++;
        break;

  private escapeRegex(str: string): string {

    return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  private printStats(): void {
    return
    console.log("\n📊 Final Cleanup Stats: ");

    console.log("  Files processed: ${this.stats.filesProcessed}");
    console.log("  Unused variables fixed: ${this.stats.unusedVarsFixed}");
    console.log("  Explicit any types fixed: ${this.stats.explicitAnyFixed}");
    console.log("  Image elements fixed: ${this.stats.imgElementsFixed}");
    console.log("  Require imports fixed: ${this.stats.requireImportsFixed}");
    console.log("  Unsafe function types fixed: ${this.stats.unsafeFunctionTypesFixed}");

    const total =
      this.stats.unusedVarsFixed +
      this.stats.explicitAnyFixed +
      this.stats.imgElementsFixed +
      this.stats.requireImportsFixed +
      this.stats.unsafeFunctionTypesFixed;
    console.log("  Total fixes applied: ${total}");

    if (this.dryRun) {
      console.log("\n🔍 Dry run completed - no files were modified");
      console.log("Run without --dry-run to apply fixes");
    } else {
      console.log("\n✅ Final cleanup completed!");
      console.log("\n🎉 Codebase quality significantly improved!");

      // Show remaining issue estimates
      console.log("\n📈 Expected remaining issues after this cleanup: ");

      console.log("  • Most critical issues should now be resolved");
      console.log("  • Some complex manual fixes may still be needed");
      console.log("  • Consider running full linter to see final results");

// CLI handling
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes("--dry-run");
  const targetFileArg = args.find((arg) => arg.startsWith("--file="));
  const targetFile = targetFileArg ? targetFileArg.split("=")[1] : undefined;

  if (args.includes("--help") || args.includes("-h")) {
    console.log(`
Usage: bun scripts/final-cleanup.ts [OPTIONS]

Options: --dry-run          Show what would be fixed without making changes

  --file=PATH        Target specific file instead of entire project
  --help, -h         Show this help message

Examples: bun scripts/final-cleanup.ts --dry-run

  bun scripts/final-cleanup.ts --file=components/header.tsx
  bun scripts/final-cleanup.ts

This script performs final comprehensive cleanup of: - Complex unused variable patterns

- Remaining explicit any types
- Next.js Image component optimizations
- ES6 import conversions)
- Unsafe function type fixes)
    `);
    process.exit(0);

  const fixer = new FinalCleanupFixer({ dryRun, targetFile });

  try {
    await fixer.run();
  } catch (error) {
    console.error("❌ Error during final cleanup:", error);
    process.exit(1);

if (import.meta.main) {
  main();
