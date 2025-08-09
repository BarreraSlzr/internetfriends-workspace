#!/usr/bin/env bun

/**
 * Epic Manager v2 - InternetFriends Portfolio
 *
 * Enhanced epic management system with improved argument parsing
 * and robust git remote handling.
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";

interface EpicConfig {
  name: string;
  status: "planned" | "in-progress" | "review" | "completed";
  completion: number;
  features: string[];
  owner: string;
  timeline: string;
  blockers: string[];
  goals: string[];
  impact?: {
    performance?: string;
    velocity?: string;
    quality?: string;
  };
}

interface EpicStats {
  commits: number;
  filesChanged: number;
  linesAdded: number;
  linesDeleted: number;
  contributors: number;
  lastActivity: string;
}

interface ParsedArgs {
  [key: string]: string | string[];
}

class EpicManagerV2 {
  private configPath = "epic-config.json";

  constructor() {
    this.ensureConfigExists();
  }

  private ensureConfigExists(): void {
    if (!existsSync(this.configPath)) {
      const initialConfig: Record<string, EpicConfig> = {};
      writeFileSync(this.configPath, JSON.stringify(initialConfig, null, 2));
    }
  }

  private loadConfig(): Record<string, EpicConfig> {
    try {
      const content = readFileSync(this.configPath, "utf8");
      return JSON.parse(content);
    } catch {
      return {};
    }
  }

  private saveConfig(config: Record<string, EpicConfig>): void {
    writeFileSync(this.configPath, JSON.stringify(config, null, 2));
  }

  private execGit(command: string): string {
    try {
      return execSync(command, { encoding: "utf8" }).trim();
    } catch (error) {
      // Return empty string for non-critical failures
      return "";
    }
  }

  private getAvailableRemotes(): string[] {
    try {
      const remotes = this.execGit("git remote");
      return remotes.split("\n").filter(Boolean);
    } catch {
      return [];
    }
  }

  private getDefaultRemote(): string {
    const remotes = this.getAvailableRemotes();
    const preferredOrder = ["private", "origin", "public"];

    for (const preferred of preferredOrder) {
      if (remotes.includes(preferred)) {
        return preferred;
      }
    }

    return remotes.length > 0 ? remotes[0] : "origin";
  }

  private getCurrentUser(): string {
    return this.execGit("git config user.name") || "Unknown";
  }

  private parseArguments(args: string[]): ParsedArgs {
    const parsed: ParsedArgs = {};

    for (let i = 0; i < args.length; i++) {
      const arg = args[i];

      // Handle --key=value format
      if (arg.includes("=")) {
        const [key, ...valueParts] = arg.split("=");
        const value = valueParts.join("=").replace(/^["'](.+)["']$/, "$1");
        const cleanKey = key.replace(/^--/, "");
        parsed[cleanKey] = value;
      }
      // Handle --key value format
      else if (arg.startsWith("--")) {
        const key = arg.replace(/^--/, "");
        const nextArg = args[i + 1];

        if (nextArg && !nextArg.startsWith("--")) {
          parsed[key] = nextArg.replace(/^["'](.+)["']$/, "$1");
          i++; // Skip next argument as we've consumed it
        } else {
          parsed[key] = true;
        }
      }
    }

    return parsed;
  }

  private safeGitOperation(operation: () => void, errorMessage: string): boolean {
    try {
      operation();
      return true;
    } catch (error) {
      console.log(`⚠️ ${errorMessage}: ${error}`);
      return false;
    }
  }

  /**
   * Start a new epic with enhanced argument parsing
   */
  async startEpic(name: string, parsedArgs: ParsedArgs): Promise<void> {
    const config = this.loadConfig();
    const epicName = name.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase();
    const branchName = `epic/${epicName}`;

    // Check if epic already exists
    if (config[epicName]) {
      console.log(`❌ Epic '${epicName}' already exists`);
      return;
    }

    console.log(`🎭 Starting epic: ${epicName}`);

    try {
      // Checkout main branch
      this.execGit("git checkout main");

      // Try to pull from remote
      const remote = this.getDefaultRemote();
      this.safeGitOperation(
        () => this.execGit(`git pull ${remote} main`),
        "Could not pull from remote - continuing with local branch"
      );

      // Create epic branch
      this.execGit(`git checkout -b ${branchName}`);

      // Create epic configuration
      const epicConfig: EpicConfig = {
        name: epicName,
        status: "in-progress",
        completion: 0,
        features: [],
        owner: (parsedArgs.owner as string) || this.getCurrentUser(),
        timeline: (parsedArgs.timeline as string) || "2-3 weeks",
        blockers: [],
        goals: parsedArgs.goal ? [parsedArgs.goal as string] : ["Define epic goals"],
      };

      // Create initialization commit
      const commitMessage = this.generateEpicInitMessage(epicConfig);
      this.execGit(`git commit --allow-empty -m "${commitMessage}"`);

      // Try to push to remote
      if (this.safeGitOperation(
        () => this.execGit(`git push ${remote} ${branchName}`),
        "Could not push to remote - epic created locally"
      )) {
        console.log(`📡 Pushed to ${remote}/${branchName}`);
      }

      // Save configuration
      config[epicName] = epicConfig;
      this.saveConfig(config);

      console.log(`✅ Epic '${epicName}' started successfully!`);
      console.log(`🌿 Branch: ${branchName}`);
      console.log(`👤 Owner: ${epicConfig.owner}`);
      console.log(`📅 Timeline: ${epicConfig.timeline}`);
      console.log(`🎯 Goals: ${epicConfig.goals.join(", ")}`);

    } catch (error) {
      console.error(`❌ Failed to start epic: ${error}`);
    }
  }

  /**
   * Add a feature to an epic
   */
  async addFeature(epicName: string, featureName: string): Promise<void> {
    const config = this.loadConfig();
    const epic = config[epicName];

    if (!epic) {
      console.log(`❌ Epic '${epicName}' not found`);
      return;
    }

    const featureBranch = `feat/${featureName.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase()}`;
    const epicBranch = `epic/${epicName}`;

    try {
      console.log(`🚀 Adding feature '${featureName}' to epic '${epicName}'`);

      this.execGit(`git checkout ${epicBranch}`);
      this.execGit(`git checkout -b ${featureBranch}`);

      epic.features.push(featureName);
      this.saveConfig(config);

      console.log(`✅ Feature branch created: ${featureBranch}`);
      console.log(`📝 Work on your feature, then use: epic feature done ${epicName} ${featureName}`);

    } catch (error) {
      console.error(`❌ Failed to add feature: ${error}`);
    }
  }

  /**
   * Complete a feature and merge it back to epic
   */
  async completeFeature(epicName: string, featureName: string, description?: string): Promise<void> {
    const config = this.loadConfig();
    const epic = config[epicName];

    if (!epic) {
      console.log(`❌ Epic '${epicName}' not found`);
      return;
    }

    const featureBranch = `feat/${featureName.replace(/[^a-zA-Z0-9-]/g, "-").toLowerCase()}`;
    const epicBranch = `epic/${epicName}`;

    try {
      console.log(`✅ Completing feature '${featureName}' in epic '${epicName}'`);

      // Switch to epic branch and merge feature
      this.execGit(`git checkout ${epicBranch}`);

      const mergeMessage = `feat: Add ${featureName}

${description || `Implement ${featureName} functionality`}

Epic: ${epicName}
Status: Feature complete
Tests: Coverage maintained`;

      this.execGit(`git merge --no-ff ${featureBranch} -m "${mergeMessage}"`);
      this.execGit(`git branch -d ${featureBranch}`);

      // Try to push to remote
      const remote = this.getDefaultRemote();
      this.safeGitOperation(
        () => this.execGit(`git push ${remote} ${epicBranch}`),
        "Could not push to remote - changes saved locally"
      );

      // Update epic completion
      const completedFeatures = epic.features.filter(f => f === featureName).length;
      epic.completion = Math.min(100, Math.round((completedFeatures / epic.features.length) * 100));

      this.saveConfig(config);

      console.log(`✅ Feature '${featureName}' merged to epic`);
      console.log(`📊 Epic completion: ${epic.completion}%`);

    } catch (error) {
      console.error(`❌ Failed to complete feature: ${error}`);
    }
  }

  /**
   * Complete an entire epic
   */
  async completeEpic(epicName: string, parsedArgs: ParsedArgs): Promise<void> {
    const config = this.loadConfig();
    const epic = config[epicName];

    if (!epic) {
      console.log(`❌ Epic '${epicName}' not found`);
      return;
    }

    const epicBranch = `epic/${epicName}`;

    try {
      console.log(`🎯 Completing epic: ${epicName}`);

      // Get epic statistics
      const stats = this.getEpicStats(epicBranch);

      // Switch to main and merge epic
      this.execGit("git checkout main");

      // Try to pull from remote
      const remote = this.getDefaultRemote();
      this.safeGitOperation(
        () => this.execGit(`git pull ${remote} main`),
        "Could not pull from remote - continuing with local main"
      );

      // Parse impact metrics
      const impact: any = {};
      Object.keys(parsedArgs).forEach(key => {
        if (key.startsWith("impact-")) {
          const metricKey = key.replace("impact-", "");
          impact[metricKey] = parsedArgs[key];
        }
      });

      const mergeMessage = this.generateEpicCompleteMessage(epic, stats, impact);
      this.execGit(`git merge --no-ff ${epicBranch} -m "${mergeMessage}"`);

      // Tag the epic if version provided
      if (parsedArgs.version) {
        const tagName = `${parsedArgs.version}-epic-${epicName}`;
        this.execGit(`git tag -a ${tagName} -m "Epic ${epicName} complete"`);
        console.log(`🏷️ Tagged as: ${tagName}`);
      }

      // Clean up branches
      this.execGit(`git branch -d ${epicBranch}`);

      // Try to push everything to remote
      if (this.safeGitOperation(
        () => {
          this.execGit(`git push ${remote} --delete ${epicBranch}`);
          this.execGit(`git push ${remote} main`);
          if (parsedArgs.version) {
            this.execGit(`git push ${remote} --tags`);
          }
        },
        "Could not push to remote - epic completed locally"
      )) {
        console.log(`📡 Epic completed and pushed to ${remote}`);
      }

      // Update configuration
      epic.status = "completed";
      epic.completion = 100;
      epic.impact = impact;
      this.saveConfig(config);

      console.log(`✅ Epic '${epicName}' completed successfully!`);
      console.log(`📈 Impact: ${this.formatImpact(impact)}`);

    } catch (error) {
      console.error(`❌ Failed to complete epic: ${error}`);
    }
  }

  /**
   * Show epic dashboard
   */
  showDashboard(): void {
    const config = this.loadConfig();
    const epics = Object.values(config);

    console.log("📊 EPIC STATUS DASHBOARD\n");

    if (epics.length === 0) {
      console.log('No epics found. Use "epic start <name>" to create your first epic.');
      return;
    }

    epics.forEach(epic => {
      const statusEmoji = this.getStatusEmoji(epic.status);
      const progressBar = this.generateProgressBar(epic.completion);

      console.log(`${statusEmoji} ${epic.name}`);
      console.log(`   Progress: ${progressBar} ${epic.completion}%`);
      console.log(`   Owner: ${epic.owner}`);
      console.log(`   Timeline: ${epic.timeline}`);
      console.log(`   Features: ${epic.features.length} planned`);

      if (epic.blockers.length > 0) {
        console.log(`   🚫 Blocked by: ${epic.blockers.join(", ")}`);
      }

      if (epic.impact) {
        console.log(`   📈 Impact: ${this.formatImpact(epic.impact)}`);
      }

      console.log("");
    });

    // Show git remotes info
    const remotes = this.getAvailableRemotes();
    if (remotes.length > 0) {
      console.log(`📡 Git remotes: ${remotes.join(", ")} (using: ${this.getDefaultRemote()})`);
    } else {
      console.log("⚠️ No git remotes configured - operations will be local only");
    }
  }

  /**
   * Show git graph for epics
   */
  showGraph(limit = 20): void {
    console.log("🎭 EPIC GIT GRAPH\n");

    try {
      const graphCommand = `git log --graph --pretty=format:'%C(yellow)%h%C(reset) %C(blue)%an%C(reset) %C(green)%ar%C(reset) %s %C(red)%d%C(reset)' --all -${limit}`;
      const output = this.execGit(graphCommand);
      console.log(output);
    } catch (error) {
      console.error("❌ Failed to show git graph");
    }
  }

  /**
   * Get statistics for an epic branch
   */
  private getEpicStats(branchName: string): EpicStats {
    const commits = parseInt(this.execGit(`git rev-list --count ${branchName}`) || "0");
    const filesChanged = parseInt(this.execGit(`git diff --name-only main..${branchName} | wc -l`) || "0");

    const diffStats = this.execGit(`git diff --stat main..${branchName}`);
    const linesMatch = diffStats.match(/(\d+) insertions.*?(\d+) deletions/);
    const linesAdded = linesMatch ? parseInt(linesMatch[1]) : 0;
    const linesDeleted = linesMatch ? parseInt(linesMatch[2]) : 0;

    const contributors = parseInt(this.execGit(`git shortlog -sn main..${branchName} | wc -l`) || "0");
    const lastActivity = this.execGit(`git log -1 --format='%ar by %an' ${branchName}`);

    return {
      commits,
      filesChanged,
      linesAdded,
      linesDeleted,
      contributors,
      lastActivity,
    };
  }

  /**
   * Generate epic initialization commit message
   */
  private generateEpicInitMessage(epic: EpicConfig): string {
    const goalsText = epic.goals.map(goal => `- ${goal}`).join("\n");

    return `epic: Initialize ${epic.name} 🎭

Epic Goals:
${goalsText}

Estimated Duration: ${epic.timeline}
Epic Owner: ${epic.owner}`;
  }

  /**
   * Generate epic completion commit message
   */
  private generateEpicCompleteMessage(epic: EpicConfig, stats: EpicStats, impact?: any): string {
    const goalsText = epic.goals.map(goal => `✅ ${goal}`).join("\n");
    const impactText = impact ? this.formatImpact(impact) : "Impact metrics to be measured";

    return `epic: Complete ${epic.name} 🎯

Epic Summary:
${goalsText}

Development Stats:
- Commits: ${stats.commits}
- Files changed: ${stats.filesChanged}
- Lines added: ${stats.linesAdded}
- Lines deleted: ${stats.linesDeleted}
- Contributors: ${stats.contributors}

Impact:
${impactText}

Epic Owner: ${epic.owner}
Duration: ${epic.timeline}`;
  }

  /**
   * Helper methods for formatting
   */
  private getStatusEmoji(status: string): string {
    const emojis: Record<string, string> = {
      planned: "📋",
      "in-progress": "🚧",
      review: "👀",
      completed: "✅",
    };
    return emojis[status] || "❓";
  }

  private generateProgressBar(completion: number): string {
    const width = 20;
    const filled = Math.round((completion / 100) * width);
    const empty = width - filled;
    return "█".repeat(filled) + "░".repeat(empty);
  }

  private formatImpact(impact?: any): string {
    if (!impact || Object.keys(impact).length === 0) return "No impact metrics specified";

    const metrics = [];
    Object.entries(impact).forEach(([key, value]) => {
      if (value) {
        metrics.push(`${key}: ${value}`);
      }
    });

    return metrics.join(", ") || "Impact metrics to be measured";
  }
}

/**
 * Enhanced CLI Interface with better argument parsing
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const epicManager = new EpicManagerV2();

  switch (command) {
    case "start":
      if (!args[1]) {
        console.log('Usage: epic start <epic-name> [--timeline="2-3 weeks"] [--goal="Epic goal"] [--owner="Name"]');
        process.exit(1);
      }

      const startParsedArgs = epicManager["parseArguments"](args.slice(2));
      await epicManager.startEpic(args[1], startParsedArgs);
      break;

    case "feature":
      if (args[1] === "add" && args[2] && args[3]) {
        await epicManager.addFeature(args[2], args[3]);
      } else if ((args[1] === "done" || args[1] === "complete") && args[2] && args[3]) {
        await epicManager.completeFeature(args[2], args[3], args[4]);
      } else {
        console.log("Usage: epic feature add <epic-name> <feature-name>");
        console.log("       epic feature done <epic-name> <feature-name> [description]");
      }
      break;

    case "complete":
      if (!args[1]) {
        console.log('Usage: epic complete <epic-name> [--version="v1.2.0"] [--impact-performance="+40%"]');
        process.exit(1);
      }

      const completeParsedArgs = epicManager["parseArguments"](args.slice(2));
      await epicManager.completeEpic(args[1], completeParsedArgs);
      break;

    case "dashboard":
    case "status":
    case "ls":
      epicManager.showDashboard();
      break;

    case "graph":
    case "log":
    case "history":
      const limit = args[1] ? parseInt(args[1]) : 20;
      epicManager.showGraph(limit);
      break;

    default:
      console.log(`
🎭 Epic Manager v2 - InternetFriends Portfolio

Usage:
  epic start <name> [options]                Start a new epic
  epic feature add <epic> <feature>          Add feature to epic
  epic feature done <epic> <feature> [desc]  Complete feature in epic
  epic complete <name> [options]             Complete an epic
  epic dashboard                             Show epic status
  epic graph [limit]                         Show git graph

Enhanced Options:
  --timeline="2-3 weeks"    Set epic timeline
  --goal="Epic objective"   Set epic goal
  --owner="Your Name"       Set epic owner
  --version="v1.2.0"        Tag epic completion
  --impact-performance="..."  Add performance impact metric
  --impact-velocity="..."     Add velocity impact metric
  --impact-quality="..."      Add quality impact metric

Examples:
  epic start database-manager --timeline="3 weeks" --goal="Connection pooling" --owner="John Doe"
  epic feature add database-manager connection-pool
  epic feature done database-manager connection-pool "Added PostgreSQL pooling with health checks"
  epic complete database-manager --version="v1.2.0" --impact-performance="+40%" --impact-velocity="+25%"
  epic dashboard
  epic graph 30

Git Remotes: Automatically detects and uses available remotes (private, origin, public)
For more information, see: GIT_EPIC_STRATEGY.md
      `);
      break;
  }
}

// Run CLI if this file is executed directly
if (import.meta.main) {
  main().catch(console.error);
}

export { EpicManagerV2 };
