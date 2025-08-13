#!/usr/bin/env bun

/**
 * Multi-Process Development Orchestrator
 * Handles parallel development tasks with git management
 * Each process tracks its own git branch and changes
 */

import { spawn } from "bun";
import { patternMonitor } from "@/lib/events/pattern-monitor";

interface TaskProcess {
  id: string;
  name: string;
  branch: string;
  status: "pending" | "running" | "completed" | "failed";
  process?: any;
  startTime?: Date;
  output: string[];
  gitChanges: string[];
}

class DevelopmentOrchestrator {
  private tasks: Map<string, TaskProcess> = new Map();
  private baseCommit: string = "";

  constructor() {
    this.setupTasks();
  }

  private setupTasks(): void {
    const taskConfigs = [
      {
        id: "typescript-fixes",
        name: "Fix TypeScript Errors",
        branch: "fix/typescript-errors",
        priority: "critical",
      },
      {
        id: "database-setup",
        name: "Setup PostgreSQL Backend",
        branch: "feature/database-integration",
        priority: "high",
      },
      {
        id: "trading-dashboard",
        name: "Launch Trading Dashboard",
        branch: "feature/trading-visualization",
        priority: "high",
      },
      {
        id: "tooling-integration",
        name: "Developer Tools Integration",
        branch: "feature/dev-tooling",
        priority: "medium",
      },
    ];

    taskConfigs.forEach((config) => {
      this.tasks.set(config.id, {
        ...config,
        status: "pending",
        output: [],
        gitChanges: [],
      });
    });
  }

  async start(): Promise<void> {
    console.log("🚀 Development Orchestrator Starting...");
    console.log("=======================================");

    // Get current commit as base
    this.baseCommit = await this.getCurrentCommit();
    console.log(`📍 Base commit: ${this.baseCommit.substring(0, 8)}`);

    // Start each task in parallel
    const promises = Array.from(this.tasks.values()).map((task) =>
      this.startTask(task),
    );

    // Monitor progress
    this.startProgressMonitoring();

    // Wait for all tasks or handle as needed
    console.log("🔄 All processes started - monitoring in background");
  }

  private async getCurrentCommit(): Promise<string> {
    try {
      const proc = spawn(["git", "rev-parse", "HEAD"], { stdout: "pipe" });
      const output = await new Response(proc.stdout).text();
      return output.trim();
    } catch {
      return "unknown";
    }
  }

  private async startTask(task: TaskProcess): Promise<void> {
    console.log(`🌟 Starting: ${task.name}`);

    task.status = "running";
    task.startTime = new Date();

    try {
      // Create and checkout branch
      await this.createTaskBranch(task);

      // Start the appropriate process based on task
      await this.executeTask(task);

      task.status = "completed";
      console.log(`✅ Completed: ${task.name}`);
    } catch (error) {
      task.status = "failed";
      task.output.push(`Error: ${error}`);
      console.log(`❌ Failed: ${task.name} - ${error}`);
    }
  }

  private async createTaskBranch(task: TaskProcess): Promise<void> {
    // Create new branch from main
    await this.runGitCommand(["checkout", "main"]);
    await this.runGitCommand(["checkout", "-b", task.branch]);

    // Apply our checkpoint stash to this branch
    try {
      await this.runGitCommand(["stash", "pop"]);
    } catch {
      // Stash might be empty, that's ok
    }

    task.output.push(`Created branch: ${task.branch}`);
  }

  private async executeTask(task: TaskProcess): Promise<void> {
    switch (task.id) {
      case "typescript-fixes":
        await this.handleTypescriptFixes(task);
        break;
      case "database-setup":
        await this.handleDatabaseSetup(task);
        break;
      case "trading-dashboard":
        await this.handleTradingDashboard(task);
        break;
      case "tooling-integration":
        await this.handleToolingIntegration(task);
        break;
      default:
        throw new Error(`Unknown task: ${task.id}`);
    }
  }

  private async handleTypescriptFixes(task: TaskProcess): Promise<void> {
    task.output.push("🔧 Running TypeScript fixes...");

    // Run typecheck to get specific errors
    const proc = spawn(["bunx", "tsc", "--noEmit", "--strict"], {
      stdout: "pipe",
      stderr: "pipe",
    });

    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();

    if (stderr) {
      const errors = stderr
        .split("\n")
        .filter((line) => line.includes("error TS"));
      task.output.push(`Found ${errors.length} TypeScript errors`);

      // Create OpenCode prompt for fixing these errors
      const prompt = this.createTypescriptFixPrompt(errors);
      await this.writeOpenCodePrompt(task, prompt);
    }

    await this.commitTaskChanges(task, "Fix TypeScript errors");
  }

  private async handleDatabaseSetup(task: TaskProcess): Promise<void> {
    task.output.push("🗄️ Setting up PostgreSQL backend...");

    // Run database setup
    try {
      const proc = spawn(
        ["bun", "run", "scripts/setup-database-production.ts"],
        {
          stdout: "pipe",
          stderr: "pipe",
        },
      );

      const output = await new Response(proc.stdout).text();
      task.output.push(output);

      // Import fossil data
      const importProc = spawn(
        ["bun", "run", "scripts/migrate-fossilization.ts"],
        {
          stdout: "pipe",
        },
      );

      const importOutput = await new Response(importProc.stdout).text();
      task.output.push(importOutput);
    } catch (error) {
      task.output.push(`Database setup error: ${error}`);
    }

    await this.commitTaskChanges(
      task,
      "Setup PostgreSQL backend and import data",
    );
  }

  private async handleTradingDashboard(task: TaskProcess): Promise<void> {
    task.output.push("📊 Launching trading dashboard...");

    // Create route for trading dashboard
    const dashboardRoute = `
import TradingDashboard from '@/components/organisms/trading-dashboard.organism';

export default function TradingDashboardPage() {
  return (
    <div className="min-h-screen bg-slate-900">
      <TradingDashboard />
    </div>
  );
}`;

    await Bun.write("app/trading/page.tsx", dashboardRoute);
    task.output.push("Created trading dashboard route");

    await this.commitTaskChanges(task, "Add trading dashboard page");
  }

  private async handleToolingIntegration(task: TaskProcess): Promise<void> {
    task.output.push("🛠️ Integrating developer tools...");

    // Create developer tools integration
    const toolsConfig = {
      zed: { enabled: true, config: "zed-config.json" },
      vscode: { enabled: true, extensions: ["opencode", "gemini"] },
      opencode: { enabled: true, patterns: "all" },
      gemini: { enabled: true, model: "gemini-pro" },
      percy: { enabled: true, visual_testing: true },
    };

    await Bun.write(
      "config/developer-tools.json",
      JSON.stringify(toolsConfig, null, 2),
    );
    task.output.push("Created developer tools configuration");

    await this.commitTaskChanges(task, "Add developer tools integration");
  }

  private createTypescriptFixPrompt(errors: string[]): string {
    return `
# TypeScript Error Fixes

Please fix the following TypeScript errors:

${errors
  .slice(0, 10)
  .map((error) => `- ${error}`)
  .join("\n")}

Focus on:
1. Type safety improvements
2. Proper null checks
3. Interface definitions
4. Generic type constraints

Use the existing codebase patterns and maintain compatibility.
`;
  }

  private async writeOpenCodePrompt(
    task: TaskProcess,
    prompt: string,
  ): Promise<void> {
    const promptFile = `.opencode-prompts/${task.id}.md`;
    await Bun.write(promptFile, prompt);
    task.output.push(`Created OpenCode prompt: ${promptFile}`);
  }

  private async runGitCommand(args: string[]): Promise<string> {
    const proc = spawn(["git", ...args], { stdout: "pipe", stderr: "pipe" });
    const stdout = await new Response(proc.stdout).text();
    const stderr = await new Response(proc.stderr).text();

    if (proc.exitCode !== 0 && stderr) {
      throw new Error(stderr);
    }

    return stdout.trim();
  }

  private async commitTaskChanges(
    task: TaskProcess,
    message: string,
  ): Promise<void> {
    try {
      await this.runGitCommand(["add", "."]);
      await this.runGitCommand(["commit", "-m", `${task.name}: ${message}`]);
      task.gitChanges.push(message);
      task.output.push(`Committed: ${message}`);
    } catch (error) {
      task.output.push(`Commit failed: ${error}`);
    }
  }

  private startProgressMonitoring(): void {
    setInterval(() => {
      this.showProgress();
    }, 15000); // Every 15 seconds
  }

  private showProgress(): void {
    console.log("\n📊 TASK PROGRESS REPORT");
    console.log("=====================");

    this.tasks.forEach((task) => {
      const runtime = task.startTime
        ? Math.round((Date.now() - task.startTime.getTime()) / 1000)
        : 0;

      const statusEmoji = {
        pending: "⏳",
        running: "🔄",
        completed: "✅",
        failed: "❌",
      }[task.status];

      console.log(`${statusEmoji} ${task.name} (${task.branch})`);
      console.log(`   Status: ${task.status} | Runtime: ${runtime}s`);
      console.log(
        `   Changes: ${task.gitChanges.length} | Output lines: ${task.output.length}`,
      );

      if (task.output.length > 0) {
        console.log(`   Latest: ${task.output[task.output.length - 1]}`);
      }
    });

    // Pattern monitoring integration
    const raceStatus = patternMonitor.getCurrentMetrics();
    console.log(`\n🏁 Overall: ${raceStatus.activePatterns} patterns active`);
  }

  // Public API for monitoring
  getTaskStatus(): Map<string, TaskProcess> {
    return new Map(this.tasks);
  }

  async stop(): Promise<void> {
    console.log("🛑 Stopping all development processes...");

    // Return to main branch
    await this.runGitCommand(["checkout", "main"]);

    // Show final summary
    this.showProgress();

    console.log("\n💾 All branches preserved for review");
    console.log("Use: git branch -a to see all task branches");
  }
}

// CLI execution
if (import.meta.main) {
  const orchestrator = new DevelopmentOrchestrator();

  // Handle cleanup
  process.on("SIGINT", async () => {
    console.log("\n🔄 Graceful shutdown...");
    await orchestrator.stop();
    process.exit(0);
  });

  // Start orchestration
  await orchestrator.start();

  // Keep alive for monitoring
  setInterval(() => {
    // Keep process alive
  }, 10000);
}

export default DevelopmentOrchestrator;
