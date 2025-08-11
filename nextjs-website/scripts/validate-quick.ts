#!/usr/bin/env bun

/**
 * Quick Validation Script for InternetFriends Design System
 *
 * Runs essential validation checks for fast development iterations.
 * This is a lightweight version that skips build and server tests.
 */

import { execSync } from "child_process";
import { existsSync, readFileSync } from "fs";

interface QuickCheckResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

class QuickValidator {
  private verbose = process.argv.includes("--verbose");
  private results: QuickCheckResult[] = [];

  constructor() {
    console.log("⚡ Quick Validation - InternetFriends Design System\n");
  }

  private log(
    message: string,
    type: "info" | "success" | "error" | "warning" = "info",
  ) {
    const icons = {
      info: "ℹ️",
      success: "✅",
      error: "❌",
      warning: "⚠️",
    };

    const colors = {
      info: "\x1b[36m",
      success: "\x1b[32m",
      error: "\x1b[31m",
      warning: "\x1b[33m",
      reset: "\x1b[0m",
    };

    if (this.verbose || type !== "info") {
      console.log(`${icons[type]} ${colors[type]}${message}${colors.reset}`);
    }
  }

  private async runCheck(
    name: string,
    checkFn: () => Promise<boolean> | boolean,
  ): Promise<QuickCheckResult> {
    const startTime = Date.now();

    try {
      this.log(`Checking ${name}...`, "info");
      const passed = await checkFn();
      const duration = Date.now() - startTime;

      const result: QuickCheckResult = {
        name,
        passed,
        message: passed ? "OK" : "Failed",
        duration,
      };

      this.log(
        `${name}: ${result.message} (${duration}ms)`,
        passed ? "success" : "error",
      );
      this.results.push(result);
      return result;
    } catch (error: unknown) {
      const duration = Date.now() - startTime;
      const result: QuickCheckResult = {
        name,
        passed: false,
        message: error.message || "Error occurred",
        duration,
      };

      this.log(`${name}: ${result.message} (${duration}ms)`, "error");
      this.results.push(result);
      return result;
    }
  }

  private runCommand(
    command: string,
    timeout = 15000,
  ): { success: boolean; output: string } {
    try {
      const output = execSync(command, {
        encoding: "utf8",
        timeout,
        stdio: "pipe",
      });
      return { success: true, output };
    } catch (error: unknown) {
      return {
        success: false,
        output: error instanceof Error ? error.message : "Command failed",
      };
    }
  }

  async validateEssentialFiles(): Promise<void> {
    const essentialFiles = [
      "package.json",
      "tsconfig.json",
      "tailwind.config.ts",
      "app/(internetfriends)/globals.css",
      "components/atomic/index.ts",
      "lib/utils/index.ts",
    ];

    for (const file of essentialFiles) {
      await this.runCheck(`File: ${file}`, () => existsSync(file));
    }
  }

  async validateTypeScript(): Promise<void> {
    await this.runCheck("TypeScript compilation", () => {
      const { success, output } = this.runCommand("bunx tsc --noEmit");
      if (!success && this.verbose) {
        console.log(`TypeScript errors:\n${output}`);
      }
      return success;
    });
  }

  async validateLinting(): Promise<void> {
    await this.runCheck("ESLint validation", () => {
      const { success, output } = this.runCommand("bunx eslint .");
      if (!success && this.verbose) {
        console.log(`ESLint errors:\n${output}`);
      }
      return success;
    });
  }

  async validateDesignTokens(): Promise<void> {
    await this.runCheck("Design tokens", () => {
      try {
        const globalsPath = "app/(internetfriends)/globals.css";
        const designTokensPath = "styles/design-tokens.css";

        let combined = "";
        if (existsSync(globalsPath)) {
          combined += readFileSync(globalsPath, "utf8") + "\n";
        }
        if (existsSync(designTokensPath)) {
          combined += readFileSync(designTokensPath, "utf8") + "\n";
        }

        if (this.verbose) {
          console.log("Design token scan length:", combined.length);
        }

        if (!combined) return false;

        // Core tokens we expect across either globals or design tokens file
        const requiredTokens = [
          "--if-primary",
          "--glass-bg-header",
          "--radius-lg",
          "--color-text-primary",
          "--color-bg-glass",
        ];

        // Newly introduced canvas + surface architecture tokens
        const extendedTokens = [
          "--app-canvas-gradient",
          "--surface-glass",
          "--surface-solid",
        ];

        const coreOk = requiredTokens.every((token) =>
          combined.includes(token),
        );
        const extendedOk = extendedTokens.every((token) =>
          combined.includes(token),
        );

        // Pass if core present; warn (still pass) if extended missing (to avoid blocking older branches)
        if (this.verbose && !extendedOk) {
          console.log("⚠️ Extended surface/canvas tokens not all detected");
        }

        return coreOk;
      } catch (err) {
        if (this.verbose) {
          console.log("Design token validation error:", err);
        }
        return false;
      }
    });
  }

  async validateComponentStructure(): Promise<void> {
    const componentChecks = [
      {
        name: "Atomic components index",
        check: () => {
          const index = readFileSync("components/atomic/index.ts", "utf8");
          return (
            index.includes("HeaderAtomic") &&
            index.includes("ButtonAtomic") &&
            index.includes("GlassCardAtomic")
          );
        },
      },
      {
        name: "Component registry",
        check: () => {
          const registryPath =
            "app/(internetfriends)/design-system/registry/component.registry.ts";
          if (!existsSync(registryPath)) return false;
          const registry = readFileSync(registryPath, "utf8");
          return (
            registry.includes("ComponentRegistry") &&
            registry.includes("componentRegistry")
          );
        },
      },
      {
        name: "Utils function",
        check: () => {
          const utils = readFileSync("lib/utils/index.ts", "utf8");
          return (
            utils.includes("cn") &&
            utils.includes("clsx") &&
            utils.includes("twMerge")
          );
        },
      },
    ];

    for (const { name, check } of componentChecks) {
      await this.runCheck(name, check);
    }
  }

  async validatePackageStructure(): Promise<void> {
    await this.runCheck("Package.json structure", () => {
      try {
        const pkg = JSON.parse(readFileSync("package.json", "utf8"));
        const requiredScripts = ["dev", "build", "lint", "typecheck"];
        const requiredDeps = ["react", "next", "reactflow", "tailwindcss"];

        return (
          requiredScripts.every(
            (script) => pkg.scripts && pkg.scripts[script],
          ) &&
          requiredDeps.every(
            (dep) =>
              (pkg.dependencies && pkg.dependencies[dep]) ||
              (pkg.devDependencies && pkg.devDependencies[dep]),
          )
        );
      } catch {
        return false;
      }
    });
  }

  async validateTailwindConfig(): Promise<void> {
    await this.runCheck("Tailwind CSS compilation", () => {
      // Quote/escape the input path because parentheses can confuse the shell
      const { success } = this.runCommand(
        'bunx tailwindcss -i "./app/(internetfriends)/globals.css" -o ./temp-check.css',
        10000,
      );

      if (success) {
        try {
          execSync("rm -f ./temp-check.css");
        } catch {}
      }

      return success;
    });
  }

  generateSummary(): boolean {
    const passed = this.results.filter((r) => r.passed).length;
    const total = this.results.length;
    const allPassed = passed === total;
    const duration = this.results.reduce((sum, r) => sum + r.duration, 0);

    console.log("\n" + "=".repeat(40));
    console.log("⚡ QUICK VALIDATION SUMMARY");
    console.log("=".repeat(40));

    if (allPassed) {
      this.log(`🎉 All ${total} checks passed! (${duration}ms)`, "success");
      this.log("✨ Ready for development!", "success");
    } else {
      this.log(
        `💥 ${total - passed} of ${total} checks failed (${duration}ms)`,
        "error",
      );

      // Show failed checks
      const failed = this.results.filter((r) => !r.passed);
      console.log("\nFailed checks:");
      failed.forEach((result) => {
        console.log(`❌ ${result.name}: ${result.message}`);
      });

      console.log("\n💡 Run with --verbose for more details");
      console.log('🔧 Run "bun run validate:fix" to attempt auto-fixes');
    }

    console.log("=".repeat(40));
    return allPassed;
  }

  async run(): Promise<boolean> {
    const startTime = Date.now();

    try {
      // Run quick validation checks
      await this.validateEssentialFiles();
      await this.validatePackageStructure();
      await this.validateTypeScript();
      await this.validateLinting();
      await this.validateDesignTokens();
      await this.validateComponentStructure();
      await this.validateTailwindConfig();

      const success = this.generateSummary();
      const totalTime = Date.now() - startTime;

      if (success) {
        this.log(
          `\n🚀 Quick validation completed successfully in ${totalTime}ms`,
          "success",
        );
      } else {
        this.log(`\n⛔ Quick validation failed in ${totalTime}ms`, "error");
      }

      return success;
    } catch (error: unknown) {
      this.log(
        `❌ Quick validation crashed: ${error instanceof Error ? error.message : String(error)}`,
        "error",
      );
      return false;
    }
  }
}

// Run if called directly
if (import.meta.main) {
  const validator = new QuickValidator();
  const success = await validator.run();
  process.exit(success ? 0 : 1);
}

export { QuickValidator };
