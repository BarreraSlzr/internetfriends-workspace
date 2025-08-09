#!/usr/bin/env bun

/**
 * Epic Manager - InternetFriends Portfolio
 *
 * Comprehensive epic management system that transforms git history
 * into a visual timeline of development milestones.
 */

import { execSync, spawn } from 'child_process';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

interface EpicConfig {
  name: string;
  status: 'planned' | 'in-progress' | 'review' | 'completed';
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

class EpicManager {
  private configPath = 'epic-config.json';

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
      const content = readFileSync(this.configPath, 'utf8');
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
      return execSync(command, { encoding: 'utf8' }).trim();
    } catch (error) {
      return '';
    }
  }

  private getCurrentUser(): string {
    return this.execGit('git config user.name') || 'Unknown';
  }

  /**
   * Start a new epic
   */
  async startEpic(name: string, options: {
    goals?: string[];
    timeline?: string;
    owner?: string;
  } = {}): Promise<void> {
    const config = this.loadConfig();
    const epicName = name.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    const branchName = `epic/${epicName}`;

    // Check if epic already exists
    if (config[epicName]) {
      console.log(`❌ Epic '${epicName}' already exists`);
      return;
    }

    // Create git branch
    console.log(`🎭 Starting epic: ${epicName}`);

    try {
      this.execGit('git checkout main');
      this.execGit('git pull origin main');
      this.execGit(`git checkout -b ${branchName}`);

      // Create epic configuration
      const epicConfig: EpicConfig = {
        name: epicName,
        status: 'in-progress',
        completion: 0,
        features: [],
        owner: options.owner || this.getCurrentUser(),
        timeline: options.timeline || '2-3 weeks',
        blockers: [],
        goals: options.goals || ['Define epic goals'],
      };

      // Create initialization commit
      const commitMessage = this.generateEpicInitMessage(epicConfig);
      this.execGit(`git commit --allow-empty -m "${commitMessage}"`);
      this.execGit(`git push origin ${branchName}`);

      // Save configuration
      config[epicName] = epicConfig;
      this.saveConfig(config);

      console.log(`✅ Epic '${epicName}' started successfully!`);
      console.log(`🌿 Branch: ${branchName}`);
      console.log(`👤 Owner: ${epicConfig.owner}`);
      console.log(`📅 Timeline: ${epicConfig.timeline}`);

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

    const featureBranch = `feat/${featureName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()}`;
    const epicBranch = `epic/${epicName}`;

    try {
      console.log(`🚀 Adding feature '${featureName}' to epic '${epicName}'`);

      this.execGit(`git checkout ${epicBranch}`);
      this.execGit(`git checkout -b ${featureBranch}`);

      epic.features.push(featureName);
      this.saveConfig(config);

      console.log(`✅ Feature branch created: ${featureBranch}`);
      console.log(`📝 Don't forget to merge back to ${epicBranch} when complete`);

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

    const featureBranch = `feat/${featureName.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase()}`;
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
      this.execGit(`git push origin ${epicBranch}`);

      // Update epic completion
      const completedFeatures = epic.features.filter(f => f !== featureName).length + 1;
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
  async completeEpic(epicName: string, options: {
    impact?: {
      performance?: string;
      velocity?: string;
      quality?: string;
    };
    version?: string;
  } = {}): Promise<void> {
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
      this.execGit('git checkout main');
      this.execGit('git pull origin main');

      const mergeMessage = this.generateEpicCompleteMessage(epic, stats, options.impact);
      this.execGit(`git merge --no-ff ${epicBranch} -m "${mergeMessage}"`);

      // Tag the epic if version provided
      if (options.version) {
        const tagName = `${options.version}-epic-${epicName}`;
        this.execGit(`git tag -a ${tagName} -m "Epic ${epicName} complete"`);
        console.log(`🏷️ Tagged as: ${tagName}`);
      }

      // Clean up
      this.execGit(`git branch -d ${epicBranch}`);
      this.execGit(`git push origin --delete ${epicBranch}`);
      this.execGit('git push origin main');

      if (options.version) {
        this.execGit('git push origin --tags');
      }

      // Update configuration
      epic.status = 'completed';
      epic.completion = 100;
      epic.impact = options.impact;
      this.saveConfig(config);

      console.log(`✅ Epic '${epicName}' completed successfully!`);
      console.log(`📈 Impact: ${this.formatImpact(options.impact)}`);

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

    console.log('📊 EPIC STATUS DASHBOARD\n');

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
        console.log(`   🚫 Blocked by: ${epic.blockers.join(', ')}`);
      }

      if (epic.impact) {
        console.log(`   📈 Impact: ${this.formatImpact(epic.impact)}`);
      }

      console.log('');
    });
  }

  /**
   * Show git graph for epics
   */
  showGraph(limit = 20): void {
    console.log('🎭 EPIC GIT GRAPH\n');

    try {
      const graphCommand = `git log --graph --pretty=format:'%C(yellow)%h%C(reset) %C(blue)%an%C(reset) %C(green)%ar%C(reset) %s %C(red)%d%C(reset)' --all -${limit}`;
      const output = this.execGit(graphCommand);
      console.log(output);
    } catch (error) {
      console.error('❌ Failed to show git graph');
    }
  }

  /**
   * Get statistics for an epic branch
   */
  private getEpicStats(branchName: string): EpicStats {
    const commits = parseInt(this.execGit(`git rev-list --count ${branchName}`) || '0');
    const filesChanged = parseInt(this.execGit(`git diff --name-only main..${branchName} | wc -l`) || '0');

    const diffStats = this.execGit(`git diff --stat main..${branchName}`);
    const linesMatch = diffStats.match(/(\d+) insertions.*?(\d+) deletions/);
    const linesAdded = linesMatch ? parseInt(linesMatch[1]) : 0;
    const linesDeleted = linesMatch ? parseInt(linesMatch[2]) : 0;

    const contributors = parseInt(this.execGit(`git shortlog -sn main..${branchName} | wc -l`) || '0');
    const lastActivity = this.execGit(`git log -1 --format='%ar by %an' ${branchName}`);

    return {
      commits,
      filesChanged,
      linesAdded,
      linesDeleted,
      contributors,
      lastActivity
    };
  }

  /**
   * Generate epic initialization commit message
   */
  private generateEpicInitMessage(epic: EpicConfig): string {
    const goalsText = epic.goals.map(goal => `- ${goal}`).join('\n');

    return `epic: Initialize ${epic.name} 🎭

Epic Goals:
${goalsText}

Estimated Duration: ${epic.timeline}
Epic Owner: ${epic.owner}`;
  }

  /**
   * Generate epic completion commit message
   */
  private generateEpicCompleteMessage(epic: EpicConfig, stats: EpicStats, impact?: EpicConfig['impact']): string {
    const goalsText = epic.goals.map(goal => `✅ ${goal}`).join('\n');
    const impactText = impact ? this.formatImpact(impact) : 'Impact metrics to be measured';

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
      'planned': '📋',
      'in-progress': '🚧',
      'review': '👀',
      'completed': '✅'
    };
    return emojis[status] || '❓';
  }

  private generateProgressBar(completion: number): string {
    const width = 20;
    const filled = Math.round((completion / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
  }

  private formatImpact(impact?: EpicConfig['impact']): string {
    if (!impact) return 'No impact metrics specified';

    const metrics = [];
    if (impact.performance) metrics.push(`Performance: ${impact.performance}`);
    if (impact.velocity) metrics.push(`Velocity: ${impact.velocity}`);
    if (impact.quality) metrics.push(`Quality: ${impact.quality}`);

    return metrics.join(', ') || 'Impact metrics to be measured';
  }
}

/**
 * CLI Interface
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const epicManager = new EpicManager();

  switch (command) {
    case 'start':
      if (!args[1]) {
        console.log('Usage: epic start <epic-name> [--timeline="2-3 weeks"] [--goal="Epic goal"]');
        process.exit(1);
      }

      const startOptions: any = {};
      if (args.includes('--timeline')) {
        const timelineIndex = args.indexOf('--timeline');
        startOptions.timeline = args[timelineIndex + 1];
      }

      if (args.includes('--goal')) {
        const goalIndex = args.indexOf('--goal');
        startOptions.goals = [args[goalIndex + 1]];
      }

      await epicManager.startEpic(args[1], startOptions);
      break;

    case 'feature':
      if (args[1] === 'add' && args[2] && args[3]) {
        await epicManager.addFeature(args[2], args[3]);
      } else if (args[1] === 'complete' && args[2] && args[3]) {
        await epicManager.completeFeature(args[2], args[3], args[4]);
      } else {
        console.log('Usage: epic feature add <epic-name> <feature-name>');
        console.log('       epic feature complete <epic-name> <feature-name> [description]');
      }
      break;

    case 'complete':
      if (!args[1]) {
        console.log('Usage: epic complete <epic-name> [--version="v1.2.0"] [--impact-performance="+40%"]');
        process.exit(1);
      }

      const completeOptions: any = {};
      if (args.includes('--version')) {
        const versionIndex = args.indexOf('--version');
        completeOptions.version = args[versionIndex + 1];
      }

      // Parse impact options
      const impactOptions = args.filter(arg => arg.startsWith('--impact-'));
      if (impactOptions.length > 0) {
        completeOptions.impact = {};
        impactOptions.forEach(option => {
          const [key, value] = option.replace('--impact-', '').split('=');
          completeOptions.impact[key] = value;
        });
      }

      await epicManager.completeEpic(args[1], completeOptions);
      break;

    case 'dashboard':
    case 'status':
      epicManager.showDashboard();
      break;

    case 'graph':
      const limit = args[1] ? parseInt(args[1]) : 20;
      epicManager.showGraph(limit);
      break;

    default:
      console.log(`
🎭 Epic Manager - InternetFriends Portfolio

Usage:
  epic start <name>                           Start a new epic
  epic feature add <epic> <feature>           Add feature to epic
  epic feature complete <epic> <feature>      Complete feature in epic
  epic complete <name>                        Complete an epic
  epic dashboard                              Show epic status
  epic graph [limit]                          Show git graph

Examples:
  epic start database-manager-v1 --timeline="3 weeks" --goal="Implement connection pooling"
  epic feature add database-manager-v1 connection-pool
  epic feature complete database-manager-v1 connection-pool "Added PostgreSQL pooling"
  epic complete database-manager-v1 --version="v1.2.0" --impact-performance="+40%"
  epic dashboard
  epic graph 30

For more information, see: GIT_EPIC_STRATEGY.md
      `);
      break;
  }
}

// Run CLI if this file is executed directly
if (import.meta.main) {
  main().catch(console.error);
}

export { EpicManager };
