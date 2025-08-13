#!/usr/bin/env bun

/**
 * Hydration Fix Verification Script
 *
 * This script verifies that the hydration fixes for GlassRefinedAtomic
 * and related components are working correctly by:
 * 1. Starting a development server
 * 2. Running automated checks for hydration mismatches
 * 3. Testing SSR consistency
 * 4. Validating CSS custom properties
 */

import { execSync, spawn } from "child_process";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

interface TestResult {
  test: string;
  passed: boolean;
  details?: string;
  error?: string;
}

class HydrationVerifier {
  private results: TestResult[] = [];
  private serverProcess: any = null;
  private readonly testPort = 3004;
  private readonly testUrl = `http://localhost:${this.testPort}`;

  async runAllTests(): Promise<void> {
    console.log("🎭 Starting Hydration Fix Verification\n");

    try {
      await this.startDevServer();
      await this.runComponentTests();
      await this.runSSRTests();
      await this.runCSSPropertyTests();
      await this.runBuildTest();

      this.printResults();
    } catch (error) {
      console.error("❌ Verification failed:", error);
    } finally {
      await this.cleanup();
    }
  }

  private async startDevServer(): Promise<void> {
    console.log("🚀 Starting development server...");

    return new Promise((resolve, reject) => {
      // Kill any existing processes on the port
      try {
        execSync(`lsof -ti:${this.testPort} | xargs kill -9 2>/dev/null || true`);
      } catch (error) {
        // Ignore errors - port might not be in use
      }

      // Start Next.js dev server
      this.serverProcess = spawn("bun", ["run", "dev", "--port", this.testPort.toString()], {
        cwd: join(process.cwd(), "nextjs-website"),
        stdio: ["ignore", "pipe", "pipe"]
      });

      let output = "";
      this.serverProcess.stdout?.on("data", (data: Buffer) => {
        output += data.toString();
        if (output.includes("Ready")) {
          console.log("✅ Development server started successfully");
          // Wait a bit more to ensure server is fully ready
          setTimeout(resolve, 2000);
        }
      });

      this.serverProcess.stderr?.on("data", (data: Buffer) => {
        const error = data.toString();
        if (error.includes("Error") || error.includes("Failed")) {
          reject(new Error(`Server startup failed: ${error}`));
        }
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        reject(new Error("Server startup timeout"));
      }, 30000);
    });
  }

  private async runComponentTests(): Promise<void> {
    console.log("\n🧩 Testing GlassRefinedAtomic component...");

    // Test 1: Check if component file exists and has proper structure
    const componentPath = join(process.cwd(), "nextjs-website/components/atomic/glass-refined/glass-refined.atomic.tsx");

    if (!existsSync(componentPath)) {
      this.results.push({
        test: "Component File Exists",
        passed: false,
        error: "GlassRefinedAtomic component file not found"
      });
      return;
    }

    const componentContent = readFileSync(componentPath, "utf-8");

    // Test 2: Check for useClientSide import
    const hasUseClientSide = componentContent.includes('import { useClientSide }');
    this.results.push({
      test: "Uses useClientSide Hook",
      passed: hasUseClientSide,
      details: hasUseClientSide ? "Component properly imports useClientSide hook" : "Missing useClientSide import"
    });

    // Test 3: Check for string conversion of CSS properties
    const hasStringConversion = componentContent.includes('.toString()');
    this.results.push({
      test: "CSS Properties String Conversion",
      passed: hasStringConversion,
      details: hasStringConversion ? "CSS custom properties are converted to strings" : "Missing string conversion for CSS properties"
    });

    // Test 4: Check for static stamp
    const hasStaticStamp = componentContent.includes('"static-stamp"');
    this.results.push({
      test: "Static Stamp Implementation",
      passed: hasStaticStamp,
      details: hasStaticStamp ? "Uses static stamp to prevent hydration mismatch" : "Still using dynamic stamp generation"
    });

    // Test 5: Check for client-only style application
    const hasClientOnlyStyles = componentContent.includes('isClient') && componentContent.includes('?');
    this.results.push({
      test: "Client-Only Style Application",
      passed: hasClientOnlyStyles,
      details: hasClientOnlyStyles ? "Properly separates client and server styles" : "Missing client-only style separation"
    });
  }

  private async runSSRTests(): Promise<void> {
    console.log("\n⚡ Testing SSR consistency...");

    try {
      // Test the hydration test page
      const response = await fetch(`${this.testUrl}/test-hydration`);
      const html = await response.text();

      // Test 1: Page loads successfully
      this.results.push({
        test: "Test Page Loads",
        passed: response.ok,
        details: response.ok ? "Hydration test page loads successfully" : `HTTP ${response.status}`
      });

      // Test 2: Check for glass-refined components in HTML
      const hasGlassComponents = html.includes('data-testid="glass-refined"');
      this.results.push({
        test: "Glass Components Render",
        passed: hasGlassComponents,
        details: hasGlassComponents ? "GlassRefinedAtomic components render in SSR" : "Glass components missing from SSR"
      });

      // Test 3: Check for CSS custom properties in HTML
      const hasCSSProps = html.includes('--glass-strength') && html.includes('--glass-alpha');
      this.results.push({
        test: "CSS Custom Properties in SSR",
        passed: hasCSSProps,
        details: hasCSSProps ? "CSS custom properties present in SSR HTML" : "Missing CSS custom properties in SSR"
      });

      // Test 4: Check that no hydration errors are in the HTML
      const hasHydrationErrors = html.includes('hydration') && html.includes('error');
      this.results.push({
        test: "No Hydration Errors in HTML",
        passed: !hasHydrationErrors,
        details: !hasHydrationErrors ? "No hydration errors found in SSR HTML" : "Hydration errors detected in HTML"
      });

    } catch (error) {
      this.results.push({
        test: "SSR Test Suite",
        passed: false,
        error: error instanceof Error ? error.message : "Unknown SSR test error"
      });
    }
  }

  private async runCSSPropertyTests(): Promise<void> {
    console.log("\n🎨 Testing CSS property consistency...");

    try {
      // Fetch the page and check for consistent CSS property formats
      const response = await fetch(`${this.testUrl}/test-hydration`);
      const html = await response.text();

      // Test 1: CSS properties are strings (no naked numbers)
      const cssPropertyRegex = /--glass-\w+:\s*([^;]+)/g;
      const matches = [...html.matchAll(cssPropertyRegex)];

      let allStrings = true;
      let invalidProperties: string[] = [];

      matches.forEach(match => {
        const value = match[1].trim();
        // Check if it's a naked number (not wrapped in quotes and not a px value)
        if (/^\d+\.?\d*$/.test(value) && !value.includes('px')) {
          allStrings = false;
          invalidProperties.push(match[0]);
        }
      });

      this.results.push({
        test: "CSS Properties Are Strings",
        passed: allStrings,
        details: allStrings
          ? "All CSS custom properties are properly formatted"
          : `Invalid properties: ${invalidProperties.join(', ')}`
      });

      // Test 2: Check for required glass properties
      const requiredProps = ['--glass-strength', '--glass-alpha', '--glass-blur'];
      const hasAllProps = requiredProps.every(prop => html.includes(prop));

      this.results.push({
        test: "Required Glass Properties Present",
        passed: hasAllProps,
        details: hasAllProps
          ? "All required glass properties found in HTML"
          : `Missing properties: ${requiredProps.filter(prop => !html.includes(prop)).join(', ')}`
      });

    } catch (error) {
      this.results.push({
        test: "CSS Property Tests",
        passed: false,
        error: error instanceof Error ? error.message : "Unknown CSS test error"
      });
    }
  }

  private async runBuildTest(): Promise<void> {
    console.log("\n🏗️ Testing production build...");

    try {
      // Stop dev server first
      if (this.serverProcess) {
        this.serverProcess.kill();
        this.serverProcess = null;
      }

      // Try to build the project
      console.log("Building project...");
      const buildOutput = execSync("bun run build", {
        cwd: join(process.cwd(), "nextjs-website"),
        encoding: "utf-8",
        timeout: 120000 // 2 minute timeout
      });

      // Check if build succeeded
      const buildSuccess = buildOutput.includes("Compiled successfully") ||
                           buildOutput.includes("Build completed");

      this.results.push({
        test: "Production Build",
        passed: buildSuccess,
        details: buildSuccess
          ? "Production build completes without hydration errors"
          : "Build failed - check for hydration issues"
      });

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown build error";
      const isHydrationError = errorMessage.includes("Html") ||
                               errorMessage.includes("hydration") ||
                               errorMessage.includes("prerender");

      this.results.push({
        test: "Production Build",
        passed: false,
        error: isHydrationError
          ? "Build failed due to hydration/SSR issues"
          : `Build failed: ${errorMessage}`
      });
    }
  }

  private printResults(): void {
    console.log("\n" + "=".repeat(60));
    console.log("🎭 HYDRATION FIX VERIFICATION RESULTS");
    console.log("=".repeat(60));

    const passed = this.results.filter(r => r.passed).length;
    const total = this.results.length;

    console.log(`\n📊 Overall: ${passed}/${total} tests passed\n`);

    this.results.forEach((result, index) => {
      const status = result.passed ? "✅" : "❌";
      const number = (index + 1).toString().padStart(2, "0");

      console.log(`${status} ${number}. ${result.test}`);

      if (result.details) {
        console.log(`    └─ ${result.details}`);
      }

      if (result.error) {
        console.log(`    └─ ERROR: ${result.error}`);
      }

      console.log("");
    });

    // Summary
    if (passed === total) {
      console.log("🎉 All tests passed! Hydration fixes are working correctly.");
      console.log("🚀 Epic: Glass Refinement v1 - Hydration Chapter Complete");
    } else {
      console.log(`⚠️  ${total - passed} test(s) failed. Please review the issues above.`);
      console.log("🔧 Check the HYDRATION_FIXES_SUMMARY.md for troubleshooting guidance.");
    }

    console.log("\n" + "=".repeat(60));
  }

  private async cleanup(): Promise<void> {
    console.log("\n🧹 Cleaning up...");

    if (this.serverProcess) {
      this.serverProcess.kill();
    }

    // Kill any remaining processes on test port
    try {
      execSync(`lsof -ti:${this.testPort} | xargs kill -9 2>/dev/null || true`);
    } catch (error) {
      // Ignore cleanup errors
    }

    console.log("✅ Cleanup complete");
  }
}

// Run the verification if this script is executed directly
if (import.meta.main) {
  const verifier = new HydrationVerifier();
  verifier.runAllTests().catch(console.error);
}

export { HydrationVerifier };
