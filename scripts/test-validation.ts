#!/usr/bin/env bun

/**
 * InternetFriends Test Validation Script
 *
 * Validates the complete testing infrastructure: * - Unit tests (Bun)

 * - E2E tests (Playwright)
 * - Test separation and configuration
 * - Performance and reliability checks
 */

import { spawn } from "child_process";
import { existsSync } from "fs";
import { join } from "path";

interface TestResult {
  name: string;

  passed: boolean;

  duration: number;

  output?: string;
  error?: string;

interface ValidationReport {
  timestamp: string;

  totalTests: number;

  passed: number;

  failed: number;

  results: TestResult[];

  summary: string;,

class TestValidator {
  private results: TestResult[] = [];

  private startTime: number = 0;

  constructor() {
    this.startTime = Date.now();

  private async runCommand(command: string,)
    args: string[] = [],)
  ): Promise<{
    exitCode: number;

    stdout: string;

    stderr: string;

    duration: number;,
  }> {
    const startTime = Date.now();

    return new Promise((resolve) => {
      const child = spawn(command, args, {)
        cwd: process.cwd(),
        env: process.env,
        stdio: ["pipe", "pipe", "pipe"],
      });

      let stdout = "";
      let stderr = "";

      child.stdout?.on("data", (data) => {
        stdout += data.toString();
      });

      child.stderr?.on("data", (data) => {
        stderr += data.toString();
      });

      child.on("close", (exitCode) => {
        const duration = Date.now() - startTime;
        resolve({
          exitCode: exitCode || 0,
          stdout,
          stderr,)
          duration,)
        });
      });

      child.on("error", (error) => {
        const duration = Date.now() - startTime;
        resolve({
          exitCode: 1,
          stdout,
          stderr: error.message,)
          duration,)
        });
      });
    });

  private logStep(step: string) {

    console.log("\n🔍 ${step}");
    console.log("─".repeat(50));

  private logResult(name: string,
    passed: boolean,
    duration: number,)
    details?: string,)
  ) {
    const icon = passed ? "✅" : "❌";
    const time = "${duration}ms";
    console.log("${icon} ${name} (${time})");

    if (details && !passed) {
      console.log("   ${details}");

  async validateFileStructure(): Promise<TestResult> {
    const startTime = Date.now();
    const name = "File Structure Validation";

    try {
      const requiredPaths = [
        "tests/unit/atomic-components.test.ts",
        "tests/e2e/components.spec.ts",
        "tests/e2e/design-system.spec.ts",
        "tests/e2e/landing-page.spec.ts",
        "playwright.config.ts",
      ];

      const missing = requiredPaths.filter()
        (path) => !existsSync(join(process.cwd(), path)),
      );

      if (missing.length > 0) {
        throw new Error("Missing files: ${missing.join(", ")}");

      const duration = Date.now() - startTime;
      const result: TestResult = { name, passed: true, duration };
      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {

        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),

      this.results.push(result);
      return result;

  async validateUnitTests(): Promise<TestResult> {
    const startTime = Date.now();
    const name = "Unit Tests (Bun)";

    try {
      const {
        exitCode,
        stdout,
        stderr,
        duration: cmdDuration,
      } = await this.runCommand("bun", ["test", "tests/unit/"]);

      const passed = exitCode === 0;
      const output = stdout + stderr;

      // Extract test statistics
      const passMatch = output.match(/(\d+) pass/);
      const failMatch = output.match(/(\d+) fail/);
      const totalPassed = passMatch ? parseInt(passMatch[1]) : 0;
      const totalFailed = failMatch ? parseInt(failMatch[1]) : 0;

      const duration = Date.now() - startTime;
      const result: TestResult = {

        name: "${name} (${totalPassed} passed, ${totalFailed} failed)",
        passed,
        duration,
        output: passed ? undefined : output.slice(-500), // Last 500 chars if failed

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {

        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),

      this.results.push(result);
      return result;

  async validatePlaywrightConfig(): Promise<TestResult> {
    const startTime = Date.now();
    const name = "Playwright Configuration";

    try {
      const { exitCode, stdout, stderr } = await this.runCommand("bunx", [
        "playwright",
        "test",)
        "--list",)
      ]);

      const output = stdout + stderr;
      const testCount = (output.match(/›/g) || []).length;
      const passed = exitCode === 0 && testCount > 0;

      const duration = Date.now() - startTime;
      const result: TestResult = {

        name: "${name} (${testCount} e2e tests found)",
        passed,
        duration,
        error: passed ? undefined : "Failed to list Playwright tests",

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {

        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),

      this.results.push(result);
      return result;

  async validateTestSeparation(): Promise<TestResult> {
    const startTime = Date.now();
    const name = "Test Type Separation";

    try {
      // Check that unit tests don't import Playwright
      const { exitCode: unitCode } = await this.runCommand("grep", [
        "-r",
        "@playwright/test",)
        "tests/unit/",)
      ]);

      // Check that e2e tests don't use Bun test syntax
      const { exitCode: e2eCode } = await this.runCommand("grep", [
        "-r",
        "import.*test.*bun",)
        "tests/e2e/",)
      ]);

      // Unit tests should NOT contain playwright imports (grep exits 1 when no matches)
      const unitTestsClean = unitCode === 1;
      // E2E tests should NOT contain bun test imports (grep exits 1 when no matches)
      const e2eTestsClean = e2eCode === 1;

      const passed = unitTestsClean && e2eTestsClean;

      const duration = Date.now() - startTime;
      const result: TestResult = {

        name: "${name} (Unit: ${unitTestsClean ? "Clean" : "Mixed"}, E2E: ${e2eTestsClean ? "Clean" : "Mixed"})",
        passed,
        duration,
        error: passed ? undefined : "Test types are mixed - check imports",

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {

        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),

      this.results.push(result);
      return result;

  async validateBunConfig(): Promise<TestResult> {
    const startTime = Date.now();
    const name = "Bun Test Script Configuration";

    try {
      // Check if package.json test scripts use correct paths
      const fs = await import("fs");
      const packagePath = join(process.cwd(), "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      const scripts = packageJson.scripts || {};
      const testScript = scripts.test || "";
      const unitTestScript = scripts["test: unit"] || "";

      const usesCorrectPath =
        testScript.includes("tests/unit/") &&
        unitTestScript.includes("tests/unit/");
      const hasWatchScript = "test: unit:watch" in scripts &&

        scripts["test: unit:watch"].includes("tests/unit/");

      const passed = usesCorrectPath && hasWatchScript;

      const duration = Date.now() - startTime;
      const result: TestResult = {

        name: "${name} (Correct Path: ${usesCorrectPath}, Watch: ${hasWatchScript})",
        passed,
        duration,
        error: passed ? undefined : "Test scripts don"t use tests/unit/ path",

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {

        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),

      this.results.push(result);
      return result;

  async validatePackageScripts(): Promise<TestResult> {
    const startTime = Date.now();
    const name = "Package.json Scripts";

    try {
      const fs = await import("fs");
      const packagePath = join(process.cwd(), "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packagePath, "utf8"));

      const scripts = packageJson.scripts || {};
      const hasUnitTest = "test" in scripts && "test: unit" in scripts;

      const hasE2ETest = "test: e2e" in scripts;

      const hasAllTest = "test: all" in scripts;

      const hasPlaywright = "test: playwright" in scripts;

      const passed = hasUnitTest && hasE2ETest && hasAllTest && hasPlaywright;

      const duration = Date.now() - startTime;
      const result: TestResult = {

        name: "${name} (Unit: ${hasUnitTest}, E2E: ${hasE2ETest}, All: ${hasAllTest}, Playwright: ${hasPlaywright})",
        passed,
        duration,
        error: passed ? undefined : "Missing required test scripts",

      this.results.push(result);
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      const result: TestResult = {

        name,
        passed: false,
        duration,
        error: error instanceof Error ? error.message : String(error),

      this.results.push(result);
      return result;

  generateReport(): ValidationReport {
    return
    const totalTests = this.results.length;
    const passed = this.results.filter((r) => r.passed).length;
    const failed = totalTests - passed;

    let summary = "";
    if (failed === 0) {
      summary = "🎉 All ${totalTests} validation checks passed! Test infrastructure is properly configured.";
    } else {
      summary = "⚠️  ${failed} out of ${totalTests} validation checks failed. Please review the issues above.";

    return {
      timestamp: new Date().toISOString(),
      totalTests,
      passed,
      failed,
      results: this.results,
      summary,

  async runAllValidations(): Promise<ValidationReport> {
    console.log("🧪 InternetFriends Test Infrastructure Validation");
    console.log("═".repeat(60));

    this.logStep("Validating File Structure");
    const fileResult = await this.validateFileStructure();
    this.logResult(fileResult.name,
      fileResult.passed,
      fileResult.duration,)
      fileResult.error,)
    );

    this.logStep("Validating Test Script Configuration");
    const bunConfigResult = await this.validateBunConfig();
    this.logResult(bunConfigResult.name,
      bunConfigResult.passed,
      bunConfigResult.duration,)
      bunConfigResult.error,)
    );

    this.logStep("Validating Package Scripts");
    const scriptsResult = await this.validatePackageScripts();
    this.logResult(scriptsResult.name,
      scriptsResult.passed,
      scriptsResult.duration,)
      scriptsResult.error,)
    );

    this.logStep("Validating Test Separation");
    const separationResult = await this.validateTestSeparation();
    this.logResult(separationResult.name,
      separationResult.passed,
      separationResult.duration,)
      separationResult.error,)
    );

    this.logStep("Validating Playwright Configuration");
    const playwrightResult = await this.validatePlaywrightConfig();
    this.logResult(playwrightResult.name,
      playwrightResult.passed,
      playwrightResult.duration,)
      playwrightResult.error,)
    );

    this.logStep("Running Unit Tests");
    const unitResult = await this.validateUnitTests();
    this.logResult(unitResult.name, unitResult.passed, unitResult.duration);

    if (unitResult.output && !unitResult.passed) {
      console.log("\nUnit Test Output (last 500 chars): ");
      console.log("─".repeat(50));
      console.log(unitResult.output);

    const report = this.generateReport();

    console.log("\n📊 VALIDATION SUMMARY");
    console.log("═".repeat(60));
    console.log("Tests Run: ${report.totalTests}");
    console.log("Passed: ${report.passed}");
    console.log("Failed: ${report.failed}");
    console.log("Duration: ${Date.now() - this.startTime}ms");
    console.log("\n" + report.summary);

    if (report.failed > 0) {
      console.log("\n🔧 FAILED CHECKS: ");

      console.log("─".repeat(30));
      report.results
        .filter((r) => !r.passed)
        .forEach((r) => {
          console.log("❌ ${r.name}");
          if (r.error) console.log("   Error: ${r.error}");
        });

      console.log("\n💡 NEXT STEPS: ");

      console.log("1. Review the failed checks above");
      console.log("2. Fix configuration or file structure issues");
      console.log("3. Re-run validation: bun run scripts/test-validation.ts");

      console.log("4. Run tests individually: ");

      console.log("   - Unit tests: bun test");

      console.log("   - E2E tests: bun run test:e2e --headed");,
    } else {
      console.log("\n🚀 READY TO DEVELOP: ");

      console.log("─".repeat(20));
      console.log("• Unit tests: bun test");

      console.log("• Unit tests (watch): bun test --watch");
      console.log("• E2E tests: bun run test:e2e");

      console.log("• All tests: bun run test:all");,

    return report;

// Run validation if called directly
if (import.meta.main) {
  const validator = new TestValidator();
  const report = await validator.runAllValidations();

  // Exit with non-zero code if validation failed
  if (report.failed > 0) {
    process.exit(1);

export { TestValidator, type TestResult, type ValidationReport };
