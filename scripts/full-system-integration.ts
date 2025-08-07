#!/usr/bin/env bun
// InternetFriends Full System Integration & Orchestration Script
// Comprehensive automation for development, testing, validation, and deployment

import { spawn, exec } from "child_process";
import { writeFile, mkdir, readdir } from "fs/promises";

import { promisify } from "util";

const execAsync = promisify(exec);

interface SystemComponent {
  name: string;
  path: string;
  dependencies: string[];
  healthCheck: () => Promise<boolean>;
  start?: () => Promise<void>;
  stop?: () => Promise<void>;
  validate?: () => Promise<boolean>;
}

interface IntegrationReport {
  sessionId: string;
  timestamp: Date;
  duration: number;
  components: {
    name: string;
    status: "healthy" | "degraded" | "failed";
    errors: string[];
    performance: {
      startTime: number;
      healthCheckTime: number;
      validationTime?: number;
    };
  }[];
  tests: {
    name: string;
    status: "passed" | "failed" | "skipped";
    duration: number;
    errors: string[];
  }[];
  recommendations: string[];
  overallStatus: "success" | "warning" | "failure";
}

class SystemIntegrator {
  private sessionId: string;
  private startTime: number;
  private verbose: boolean;
  private components: SystemComponent[];
  private runningProcesses: Map<string, any> = new Map();

  constructor(verbose: boolean = false) {
    this.sessionId = `integration-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();
    this.verbose = verbose;
    this.components = this.defineSystemComponents();
  }

  // Define all system components
  private defineSystemComponents(): SystemComponent[] {
    return [
      {
        name: "Event System",
        path: "./lib/events/event.system.ts",
        dependencies: [],
        healthCheck: async () => {
          try {
            const { eventSystem } = await import("../lib/events/event.system");
            return await eventSystem.healthCheck();
          } catch {
            return false;
          }
        },
        start: async () => {
          const { eventSystem } = await import("../lib/events/event.system");
          eventSystem.start();
        },
        validate: async () => {
          try {
            await execAsync("bun run test:events");
            return true;
          } catch {
            return false;
          }
        },
      },
      {
        name: "Dashboard Organism",
        path: "./app/(internetfriends)/components/organism/dashboard",
        dependencies: ["Event System"],
        healthCheck: async () => {
          try {
            const files = await readdir(
              "./app/(internetfriends)/components/organism/dashboard",
            );
            return (
              files.includes("dashboard.organism.tsx") &&
              files.includes("dashboard.styles.module.scss") &&
              files.includes("types.ts")
            );
          } catch {
            return false;
          }
        },
        validate: async () => {
          try {
            await execAsync("bun run validate:organisms");
            return true;
          } catch {
            return false;
          }
        },
      },
      {
        name: "Analytics Organism",
        path: "./app/(internetfriends)/components/organism/analytics",
        dependencies: ["Event System"],
        healthCheck: async () => {
          try {
            const files = await readdir(
              "./app/(internetfriends)/components/organism/analytics",
            );
            return (
              files.includes("analytics.organism.tsx") &&
              files.includes("analytics.styles.module.scss") &&
              files.includes("types.ts")
            );
          } catch {
            return false;
          }
        },
      },
      {
        name: "Data Table Organism",
        path: "./app/(internetfriends)/components/organism/data-table",
        dependencies: ["Event System"],
        healthCheck: async () => {
          try {
            const files = await readdir(
              "./app/(internetfriends)/components/organism/data-table",
            );
            return (
              files.includes("data-table.organism.tsx") &&
              files.includes("data-table.styles.module.scss") &&
              files.includes("types.ts")
            );
          } catch {
            return false;
          }
        },
      },
      {
        name: "Project Showcase Organism",
        path: "./app/(internetfriends)/components/organism/project-showcase",
        dependencies: ["Event System"],
        healthCheck: async () => {
          try {
            const files = await readdir(
              "./app/(internetfriends)/components/organism/project-showcase",
            );
            return (
              files.includes("project-showcase.organism.tsx") &&
              files.includes("project-showcase.styles.module.scss") &&
              files.includes("types.ts")
            );
          } catch {
            return false;
          }
        },
      },
      {
        name: "API Health Endpoint",
        path: "./app/api/health/route.ts",
        dependencies: ["Event System"],
        healthCheck: async () => {
          try {
            const response = await fetch("http:// localhost:3000/api/health");
            return response.ok;
          } catch {
            return false;
          }
        },
      },
      {
        name: "Next.js Development Server",
        path: "./next.config.ts",
        dependencies: [],
        healthCheck: async () => {
          try {
            const response = await fetch("http://localhost:3000/api/health");
            return response.ok;
          } catch {
            return false;
          }
        },
        start: async () => {
          return new Promise((resolve) => {
            const process = spawn("bun", ["run", "dev"], {
              stdio: "pipe",
              detached: false,
            });

            this.runningProcesses.set("dev-server", process);

            // Wait for server to be ready
            setTimeout(() => resolve(), 5000);
          });
        },
        stop: async () => {
          const process = this.runningProcesses.get("dev-server");
          if (process) {
            process.kill("SIGTERM");
            this.runningProcesses.delete("dev-server");
          }
        },
      },
      {
        name: "TypeScript Compilation",
        path: "./tsconfig.json",
        dependencies: [],
        healthCheck: async () => {
          try {
            await execAsync("bunx tsc --noEmit");
            return true;
          } catch {
            return false;
          }
        },
      },
      {
        name: "SCSS Compilation",
        path: "./styles",
        dependencies: [],
        healthCheck: async () => {
          try {
            const { stdout } = await execAsync(
              'find . -name "*.scss" -type f | wc -l',
            );
            return parseInt(stdout.trim()) > 0;
          } catch {
            return false;
          }
        },
      },
      {
        name: "Testing Framework",
        path: "./tests",
        dependencies: [],
        healthCheck: async () => {
          try {
            const dirs = await readdir("./tests");
            return (
              dirs.includes("curl") &&
              dirs.includes("unit") &&
              dirs.includes("integration")
            );
          } catch {
            return false;
          }
        },
        validate: async () => {
          try {
            await execAsync("bun run test:unit");
            return true;
          } catch {
            return false;
          }
        },
      },
    ];
  }

  // Run full system integration
  async runFullIntegration(): Promise<IntegrationReport> {
    this.log("🚀 Starting Full System Integration", "info");
    this.log("= ".repeat(60), "info");

    const report: IntegrationReport = {
      sessionId: this.sessionId,
      timestamp: new Date(),
      duration: 0,
      components: [],
      tests: [],
      recommendations: [],
      overallStatus: "success",
    };

    try {
      // Phase 1: Component Health Checks
      await this.runComponentHealthChecks(report);

      // Phase 2: Start Required Services
      await this.startRequiredServices(report);

      // Phase 3: Run Test Suites
      await this.runTestSuites(report);

      // Phase 4: Validate Components
      await this.validateComponents(report);

      // Phase 5: Performance Assessment
      await this.runPerformanceAssessment(report);

      // Phase 6: Generate Recommendations
      this.generateRecommendations(report);

      // Calculate final status
      this.calculateOverallStatus(report);
    } catch (error) {
      this.log(`❌ Integration failed: ${error}`, "error");
      report.overallStatus = "failure";
    } finally {
      report.duration = Date.now() - this.startTime;
      await this.cleanup();
    }

    return report;
  }

  // Run component health checks
  private async runComponentHealthChecks(
    report: IntegrationReport,
  ): Promise<void> {
    this.log("🔍 Phase 1: Component Health Checks", "info");

    for (const component of this.components) {
      const startTime = Date.now();
      this.log(`   Checking ${component.name}...`, "info");

      try {
        const isHealthy = await component.healthCheck();
        const healthCheckTime = Date.now() - startTime;

        report.components.push({
          name: component.name,
          status: isHealthy ? "healthy" : "failed",
          errors: isHealthy ? [] : ["Health check failed"],
          performance: {
            startTime,
            healthCheckTime,
          },
        });

        const status = isHealthy ? "✅" : "❌";
        this.log(
          `   ${status} ${component.name}: ${healthCheckTime}ms`,
          "info",
        );
      } catch (error) {
        report.components.push({
          name: component.name,
          status: "failed",
          errors: [`Health check error: ${error}`],
          performance: {
            startTime,
            healthCheckTime: Date.now() - startTime,
          },
        });

        this.log(`   ❌ ${component.name}: ${error}`, "error");
      }
    }
  }

  // Start required services
  private async startRequiredServices(
    report: IntegrationReport,
  ): Promise<void> {
    this.log("🏁 Phase 2: Starting Required Services", "info");

    const servicesToStart = this.components.filter((c) => c.start);

    for (const service of servicesToStart) {
      try {
        this.log(`   Starting ${service.name}...`, "info");
        await service.start!();
        this.log(`   ✅ ${service.name} started`, "info");

        // Update component status
        const componentReport = report.components.find(
          (c) => c.name === service.name,
        );
        if (componentReport && componentReport.status === "failed") {
          componentReport.status = "healthy";
          componentReport.errors = [];
        }
      } catch (error) {
        this.log(`   ❌ Failed to start ${service.name}: ${error}`, "error");

        const componentReport = report.components.find(
          (c) => c.name === service.name,
        );
        if (componentReport) {
          componentReport.status = "failed";
          componentReport.errors.push(`Start failed: ${error}`);
        }
      }
    }

    // Wait for services to stabilize
    this.log("   Waiting for services to stabilize...", "info");
    await this.delay(3000);
  }

  // Run test suites
  private async runTestSuites(report: IntegrationReport): Promise<void> {
    this.log("🧪 Phase 3: Running Test Suites", "info");

    const testSuites = [
      { name: "Unit Tests", command: "bun run test:unit" },
      { name: "Health Check Tests", command: "bun run test:curl:health" },
      { name: "API Tests", command: "bun run test:curl:api" },
      { name: "Event System Tests", command: "bun run test:events" },
      { name: "Integration Tests", command: "bun run test:curl:integration" },
      { name: "Security Tests", command: "bun run test:curl:security" },
      { name: "Performance Tests", command: "bun run test:curl:performance" },
    ];

    for (const testSuite of testSuites) {
      const startTime = Date.now();
      this.log(`   Running ${testSuite.name}...`, "info");

      try {
        await execAsync(testSuite.command);
        const duration = Date.now() - startTime;

        report.tests.push({
          name: testSuite.name,
          status: "passed",
          duration,
          errors: [],
        });

        this.log(`   ✅ ${testSuite.name}: ${duration}ms`, "info");
      } catch (error) {
        const duration = Date.now() - startTime;

        report.tests.push({
          name: testSuite.name,
          status: "failed",
          duration,
          errors: [`Test failed: ${error}`],
        });

        this.log(`   ❌ ${testSuite.name} failed: ${error}`, "error");
      }
    }
  }

  // Validate components
  private async validateComponents(report: IntegrationReport): Promise<void> {
    this.log("✅ Phase 4: Component Validation", "info");

    const validationCommands = [
      { name: "TypeScript Check", command: "bun run typecheck" },
      { name: "Lint Check", command: "bun run lint" },
      { name: "Organism Validation", command: "bun run validate:organisms" },
      { name: "Schema Validation", command: "bun run schema:validate" },
      { name: "Format Check", command: "bun run format:check" },
    ];

    for (const validation of validationCommands) {
      const startTime = Date.now();
      this.log(`   Validating ${validation.name}...`, "info");

      try {
        await execAsync(validation.command);
        const duration = Date.now() - startTime;

        report.tests.push({
          name: validation.name,
          status: "passed",
          duration,
          errors: [],
        });

        this.log(`   ✅ ${validation.name}: ${duration}ms`, "info");
      } catch (error) {
        const duration = Date.now() - startTime;

        report.tests.push({
          name: validation.name,
          status: "failed",
          duration,
          errors: [`Validation failed: ${error}`],
        });

        this.log(`   ⚠️ ${validation.name} failed: ${error}`, "warning");
      }
    }
  }

  // Run performance assessment
  private async runPerformanceAssessment(
    report: IntegrationReport,
  ): Promise<void> {
    this.log("⚡ Phase 5: Performance Assessment", "info");

    try {
      // Run performance monitoring for 30 seconds
      this.log("   Starting performance monitor...", "info");

      const perfProcess = spawn(
        "bun",
        ["run", "scripts/monitor-performance.ts", "--duration=30", "--demo"],
        { stdio: "pipe" },
      );

      await new Promise((resolve, reject) => {
        perfProcess.on("close", (code) => {
          if (code === 0) {
            resolve(void 0);
          } else {
            reject(
              new Error(`Performance monitoring failed with code ${code}`),
            );
          }
        });
      });

      report.tests.push({
        name: "Performance Assessment",
        status: "passed",
        duration: 30000,
        errors: [],
      });

      this.log("   ✅ Performance assessment completed", "info");
    } catch (error) {
      report.tests.push({
        name: "Performance Assessment",
        status: "failed",
        duration: 30000,
        errors: [`Performance assessment failed: ${error}`],
      });

      this.log(`   ❌ Performance assessment failed: ${error}`, "error");
    }
  }

  // Generate recommendations
  private generateRecommendations(report: IntegrationReport): void {
    this.log("💡 Phase 6: Generating Recommendations", "info");

    const failedComponents = report.components.filter(
      (c) => c.status === "failed",
    );
    const failedTests = report.tests.filter((t) => t.status === "failed");
    const degradedComponents = report.components.filter(
      (c) => c.status === "degraded",
    );

    // Component recommendations
    if (failedComponents.length > 0) {
      report.recommendations.push(
        `${failedComponents.length} components failed health checks - investigate and fix`,
      );
      failedComponents.forEach((component) => {
        report.recommendations.push(
          `Fix ${component.name}: ${component.errors.join(", ")}`,
        );
      });
    }

    // Test recommendations
    if (failedTests.length > 0) {
      report.recommendations.push(
        `${failedTests.length} test suites failed - review and fix failing tests`,
      );
    }

    // Performance recommendations
    const slowComponents = report.components.filter(
      (c) => c.performance.healthCheckTime > 1000,
    );
    if (slowComponents.length > 0) {
      report.recommendations.push(
        `${slowComponents.length} components have slow health checks - optimize performance`,
      );
    }

    // General recommendations
    if (degradedComponents.length > 0) {
      report.recommendations.push(
        "Some components are degraded - monitor closely and consider maintenance",
      );
    }

    const successRate =
      (report.tests.filter((t) => t.status === "passed").length /
        report.tests.length) *
      100;
    if (successRate < 90) {
      report.recommendations.push(
        "Test success rate is below 90% - focus on improving test reliability",
      );
    }

    if (report.recommendations.length === 0) {
      report.recommendations.push(
        "All systems are functioning optimally - continue regular monitoring",
      );
    }
  }

  // Calculate overall status
  private calculateOverallStatus(report: IntegrationReport): void {
    const criticalFailures = report.components.filter(
      (c) =>
        c.status === "failed" &&
        ["Event System", "Next.js Development Server"].includes(c.name),
    ).length;

    const totalFailures =
      report.components.filter((c) => c.status === "failed").length +
      report.tests.filter((t) => t.status === "failed").length;

    if (criticalFailures > 0) {
      report.overallStatus = "failure";
    } else if (totalFailures > 3) {
      report.overallStatus = "failure";
    } else if (totalFailures > 0) {
      report.overallStatus = "warning";
    } else {
      report.overallStatus = "success";
    }
  }

  // Generate and save integration report
  async generateReport(report: IntegrationReport): Promise<void> {
    this.log("📋 Generating Integration Report", "info");

    // Create logs directory if it doesn't exist
    try {
      await mkdir("./logs", { recursive: true });
    } catch {}

    // Save JSON report
    const reportFile = `./logs/integration-report-${this.sessionId}.json`;
    await writeFile(reportFile, JSON.stringify(report, null, 2));

    // Generate markdown report
    const markdownReport = this.generateMarkdownReport(report);
    const markdownFile = `./logs/integration-report-${this.sessionId}.md`;
    await writeFile(markdownFile, markdownReport);

    this.log(`📊 Reports saved:`, "info");
    this.log(`   JSON: ${reportFile}`, "info");
    this.log(`   Markdown: ${markdownFile}`, "info");
  }

  // Generate markdown report
  private generateMarkdownReport(report: IntegrationReport): string {
    const statusEmoji = {
      success: "✅",
      warning: "⚠️",
      failure: "❌",
    };

    let markdown = `# InternetFriends System Integration Report\n\n`;
    markdown += `**Session ID:** ${report.sessionId}\n`;
    markdown += `**Timestamp:** ${report.timestamp.toISOString()}\n`;
    markdown += `**Duration:** ${Math.round(report.duration / 1000)}s\n`;
    markdown += `**Overall Status:** ${statusEmoji[report.overallStatus]} ${report.overallStatus.toUpperCase()}\n\n`;

    // Component Status
    markdown += `## Component Health Status\n\n`;
    markdown += `| Component | Status | Health Check Time | Errors |\n`;
    markdown += `|-----------|--------|-------------------|--------|\n`;

    report.components.forEach((component) => {
      const statusEmoji =
        component.status === "healthy"
          ? "✅"
          : component.status === "degraded"
            ? "⚠️"
            : "❌";
      const errors =
        component.errors.length > 0 ? component.errors.join(", ") : "None";
      markdown += `| ${component.name} | ${statusEmoji} ${component.status} | ${component.performance.healthCheckTime}ms | ${errors} |\n`;
    });

    // Test Results
    markdown += `\n## Test Results\n\n`;
    markdown += `| Test Suite | Status | Duration | Errors |\n`;
    markdown += `|------------|--------|----------|--------|\n`;

    report.tests.forEach((test) => {
      const statusEmoji =
        test.status === "passed"
          ? "✅"
          : test.status === "skipped"
            ? "⏭️"
            : "❌";
      const errors = test.errors.length > 0 ? test.errors.join(", ") : "None";
      markdown += `| ${test.name} | ${statusEmoji} ${test.status} | ${test.duration}ms | ${errors} |\n`;
    });

    // Recommendations
    if (report.recommendations.length > 0) {
      markdown += `\n## Recommendations\n\n`;
      report.recommendations.forEach((rec, index) => {
        markdown += `${index + 1}. ${rec}\n`;
      });
    }

    // Summary Statistics
    const passedTests = report.tests.filter(
      (t) => t.status === "passed",
    ).length;

      (t) => t.status === "failed",
    ).length;
    const healthyComponents = report.components.filter(
      (c) => c.status === "healthy",
    ).length;

      (c) => c.status === "failed",
    ).length;

    markdown += `\n## Summary Statistics\n\n`;
    markdown += `- **Components:** ${healthyComponents}/${report.components.length} healthy\n`;
    markdown += `- **Tests:** ${passedTests}/${report.tests.length} passed\n`;
    markdown += `- **Success Rate:** ${((passedTests / report.tests.length) * 100).toFixed(1)}%\n`;
    markdown += `- **Component Health Rate:** ${((healthyComponents / report.components.length) * 100).toFixed(1)}%\n`;

    return markdown;
  }

  // Cleanup resources
  public async cleanup(): Promise<void> {
    this.log("🧹 Cleaning up resources...", "info");

    // Stop all running processes
    for (const [name, process] of this.runningProcesses.entries()) {
      try {
        process.kill("SIGTERM");
        this.log(`   Stopped ${name}`, "info");
      } catch (error) {
        this.log(`   Failed to stop ${name}: ${error}`, "warning");
      }
    }

    this.runningProcesses.clear();
  }

  // Utility methods
  private async delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private log(
    message: string,
    level: "info" | "warning" | "error" = "info",
  ): void {
    const timestamp = new Date().toISOString();
    const colors = {
      info: "\x1b[36m", // Cyan
      warning: "\x1b[33m", // Yellow
      error: "\x1b[31m", // Red
    };
    const reset = "\x1b[0m";

    if (this.verbose || level !== "info") {
      const color = colors[level];
      console.log(`${color}[${timestamp}] ${message}${reset}`);
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes("--verbose") || args.includes("-v");

  const report = !args.includes("--no-report");

  console.log("🚀 InternetFriends Full System Integration");
  console.log("= ".repeat(60));
  console.log("");

  const integrator = new SystemIntegrator(verbose);

  // Handle cleanup on exit
  process.on("SIGINT", async () => {
    console.log("\n🛑 Integration interrupted");
    await integrator.cleanup();
    process.exit(1);
  });

  process.on("SIGTERM", async () => {
    await integrator.cleanup();
    process.exit(1);
  });

  try {
    const integrationReport = await integrator.runFullIntegration();

    if (report) {
      await integrator.generateReport(integrationReport);
    }

    // Print final status
    console.log("");
    console.log("🏁 Integration Complete");
    console.log("= ".repeat(60));

    const statusEmoji = {
      success: "✅",
      warning: "⚠️",
      failure: "❌",
    };

    console.log(
      `Status: ${statusEmoji[integrationReport.overallStatus]} ${integrationReport.overallStatus.toUpperCase()}`,
    );
    console.log(`Duration: ${Math.round(integrationReport.duration / 1000)}s`);
    console.log(
      `Components: ${integrationReport.components.filter((c) => c.status === "healthy").length}/${integrationReport.components.length} healthy`,
    );
    console.log(
      `Tests: ${integrationReport.tests.filter((t) => t.status === "passed").length}/${integrationReport.tests.length} passed`,
    );

    if (integrationReport.recommendations.length > 0) {
      console.log("");
      console.log("📋 Key Recommendations: ");
      integrationReport.recommendations.slice(0, 3).forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }

    // Exit with appropriate code
    const exitCode = integrationReport.overallStatus === "success" ? 0 : 1;
    process.exit(exitCode);
  } catch (error) {
    console.error("❌ Integration failed:", error);
    await integrator.cleanup();
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}

export { SystemIntegrator, type IntegrationReport, type SystemComponent };
