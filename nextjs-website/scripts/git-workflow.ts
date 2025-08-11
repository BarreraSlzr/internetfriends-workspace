#!/usr/bin/env bun

/**
 * 🔄 Git Workflow Automation Script
 * Automates common git operations following InternetFriends workflow strategy
 */

import { execSync } from "child_process";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

// Workflow configuration
interface WorkflowConfig {
  defaultBranch: string;
  developBranch: string;
  showcaseBranch: string;
  protectedBranches: string[];
  branchPrefixes: {
    feature: string;
    hotfix: string;
    release: string;
    ai: string;
  };
}

const config: WorkflowConfig = {
  defaultBranch: "main",
  developBranch: "develop",
  showcaseBranch: "showcase",
  protectedBranches: ["main", "develop"],
  branchPrefixes: {
    feature: "feature/",
    hotfix: "hotfix/",
    release: "release/",
    ai: "ai/",
  },
};

// Git utilities
class GitWorkflow {
  private execGit(command: string): string {
    try {
      return execSync(`git ${command}`, { encoding: "utf8" }).trim();
    } catch (error) {
      throw new Error(`Git command failed: git ${command}\n${error}`);
    }
  }

  private getCurrentBranch(): string {
    return this.execGit("branch --show-current");
  }

  private branchExists(branch: string): boolean {
    try {
      this.execGit(`show-ref --verify --quiet refs/heads/${branch}`);
      return true;
    } catch {
      return false;
    }
  }

  private isCleanWorkingTree(): boolean {
    try {
      this.execGit("diff-index --quiet HEAD --");
      return true;
    } catch {
      return false;
    }
  }

  private ensureCleanWorkingTree(): void {
    if (!this.isCleanWorkingTree()) {
      throw new Error(
        "Working tree is not clean. Please commit or stash your changes.",
      );
    }
  }

  private validateBranchName(
    name: string,
    type: keyof typeof config.branchPrefixes,
  ): void {
    const prefix = config.branchPrefixes[type];
    if (!name.startsWith(prefix)) {
      throw new Error(`Branch name must start with '${prefix}'. Got: ${name}`);
    }

    // Validate naming convention
    const branchName = name.substring(prefix.length);
    if (!/^[a-z0-9-]+$/.test(branchName)) {
      throw new Error(
        "Branch name must use lowercase letters, numbers, and hyphens only",
      );
    }
  }

  // Feature workflow
  async startFeature(featureName: string): Promise<void> {
    const branchName = `${config.branchPrefixes.feature}${featureName}`;
    this.validateBranchName(branchName, "feature");

    console.log(`🚀 Starting feature: ${featureName}`);

    // Ensure we're on develop and it's clean
    this.ensureCleanWorkingTree();
    this.execGit(`checkout ${config.developBranch}`);
    this.execGit(`pull origin ${config.developBranch}`);

    // Create feature branch
    if (this.branchExists(branchName)) {
      throw new Error(`Branch ${branchName} already exists`);
    }

    this.execGit(`checkout -b ${branchName}`);
    console.log(`✅ Feature branch created: ${branchName}`);
    console.log(
      `💡 Run 'bun scripts/git-workflow.ts finish-feature ${featureName}' when done`,
    );
  }

  async finishFeature(featureName: string): Promise<void> {
    const branchName = `${config.branchPrefixes.feature}${featureName}`;
    const currentBranch = this.getCurrentBranch();

    if (currentBranch !== branchName) {
      throw new Error(
        `Not on feature branch. Expected: ${branchName}, Got: ${currentBranch}`,
      );
    }

    console.log(`🏁 Finishing feature: ${featureName}`);

    this.ensureCleanWorkingTree();

    // Switch to develop and merge
    this.execGit(`checkout ${config.developBranch}`);
    this.execGit(`pull origin ${config.developBranch}`);
    this.execGit(`merge --no-ff ${branchName}`);
    this.execGit(`push origin ${config.developBranch}`);

    // Clean up
    this.execGit(`branch -d ${branchName}`);

    console.log(`✅ Feature merged and cleaned up`);
    console.log(`📝 Don't forget to create a pull request if needed`);
  }

  // Release workflow
  async startRelease(version: string): Promise<void> {
    if (!/^\d+\.\d+\.\d+(-[\w\.]+)?$/.test(version)) {
      throw new Error(
        "Version must follow semantic versioning (e.g., 1.2.0 or 2.0.0-beta.1)",
      );
    }

    const branchName = `${config.branchPrefixes.release}v${version}`;

    console.log(`🎯 Starting release: v${version}`);

    this.ensureCleanWorkingTree();
    this.execGit(`checkout ${config.developBranch}`);
    this.execGit(`pull origin ${config.developBranch}`);

    if (this.branchExists(branchName)) {
      throw new Error(`Release branch ${branchName} already exists`);
    }

    this.execGit(`checkout -b ${branchName}`);

    // Update version in package.json
    await this.updatePackageVersion(version);

    console.log(`✅ Release branch created: ${branchName}`);
    console.log(`🔧 Version updated to: ${version}`);
    console.log(
      `💡 Run 'bun scripts/git-workflow.ts finish-release ${version}' when ready`,
    );
  }

  async finishRelease(version: string): Promise<void> {
    const branchName = `${config.branchPrefixes.release}v${version}`;
    const tagName = `v${version}`;

    console.log(`🚀 Finishing release: v${version}`);

    this.ensureCleanWorkingTree();

    // Merge to main
    this.execGit(`checkout ${config.defaultBranch}`);
    this.execGit(`pull origin ${config.defaultBranch}`);
    this.execGit(`merge --no-ff ${branchName}`);
    this.execGit(`tag -a ${tagName} -m "release: ${tagName}"`);
    this.execGit(`push origin ${config.defaultBranch} --tags`);

    // Merge back to develop
    this.execGit(`checkout ${config.developBranch}`);
    this.execGit(`merge --no-ff ${branchName}`);
    this.execGit(`push origin ${config.developBranch}`);

    // Clean up
    this.execGit(`branch -d ${branchName}`);

    console.log(`✅ Release v${version} completed and tagged`);
    console.log(`🎉 Ready for deployment!`);
  }

  // Hotfix workflow
  async startHotfix(hotfixName: string, version: string): Promise<void> {
    const branchName = `${config.branchPrefixes.hotfix}${hotfixName}`;
    this.validateBranchName(branchName, "hotfix");

    console.log(`🚨 Starting hotfix: ${hotfixName}`);

    this.ensureCleanWorkingTree();
    this.execGit(`checkout ${config.defaultBranch}`);
    this.execGit(`pull origin ${config.defaultBranch}`);

    if (this.branchExists(branchName)) {
      throw new Error(`Hotfix branch ${branchName} already exists`);
    }

    this.execGit(`checkout -b ${branchName}`);

    // Update version for patch
    await this.updatePackageVersion(version);

    console.log(`✅ Hotfix branch created: ${branchName}`);
    console.log(
      `💡 Run 'bun scripts/git-workflow.ts finish-hotfix ${hotfixName} ${version}' when fixed`,
    );
  }

  async finishHotfix(hotfixName: string, version: string): Promise<void> {
    const branchName = `${config.branchPrefixes.hotfix}${hotfixName}`;
    const tagName = `v${version}`;

    console.log(`🔥 Finishing hotfix: ${hotfixName}`);

    this.ensureCleanWorkingTree();

    // Merge to main
    this.execGit(`checkout ${config.defaultBranch}`);
    this.execGit(`merge --no-ff ${branchName}`);
    this.execGit(`tag -a ${tagName} -m "hotfix: ${tagName} - ${hotfixName}"`);
    this.execGit(`push origin ${config.defaultBranch} --tags`);

    // Merge to develop
    this.execGit(`checkout ${config.developBranch}`);
    this.execGit(`merge --no-ff ${branchName}`);
    this.execGit(`push origin ${config.developBranch}`);

    // Clean up
    this.execGit(`branch -d ${branchName}`);

    console.log(`✅ Hotfix v${version} completed and deployed`);
  }

  // AI workflow helpers
  async startAIFeature(aiFeatureName: string): Promise<void> {
    const branchName = `${config.branchPrefixes.ai}${aiFeatureName}`;

    console.log(`🤖 Starting AI feature: ${aiFeatureName}`);

    this.ensureCleanWorkingTree();
    this.execGit(`checkout ${config.developBranch}`);
    this.execGit(`pull origin ${config.developBranch}`);

    if (this.branchExists(branchName)) {
      throw new Error(`AI branch ${branchName} already exists`);
    }

    this.execGit(`checkout -b ${branchName}`);

    // Create AI context file
    await this.createAIContext(aiFeatureName);

    console.log(`✅ AI feature branch created: ${branchName}`);
    console.log(`🧠 AI context file generated`);
  }

  // Utility methods
  private async updatePackageVersion(version: string): Promise<void> {
    const packagePath = join(process.cwd(), "package.json");
    if (!existsSync(packagePath)) {
      console.log("⚠️  No package.json found, skipping version update");
      return;
    }

    const packageContent = JSON.parse(readFileSync(packagePath, "utf8"));
    packageContent.version = version;

    writeFileSync(packagePath, JSON.stringify(packageContent, null, 2) + "\n");
    this.execGit(`add package.json`);
    this.execGit(`commit -m "chore: bump version to ${version}"`);
  }

  private async createAIContext(featureName: string): Promise<void> {
    const contextContent = `# AI Feature Context: ${featureName}

## Feature Overview
- **Branch**: ai/${featureName}
- **Created**: ${new Date().toISOString()}
- **Purpose**: [Describe the AI feature purpose]

## AI Development Notes
- [ ] Define AI capabilities
- [ ] Implement core functionality
- [ ] Add tests and validation
- [ ] Update documentation
- [ ] Review performance impact

## Integration Points
- Event system: [ ]
- Microtooling: [ ]
- UI components: [ ]
- API endpoints: [ ]

## Success Criteria
- [ ] Feature works as expected
- [ ] Tests pass
- [ ] Performance acceptable
- [ ] Documentation updated
`;

    const contextPath = join(
      process.cwd(),
      `AI_CONTEXT_${featureName.toUpperCase()}.md`,
    );
    writeFileSync(contextPath, contextContent);
    this.execGit(`add AI_CONTEXT_${featureName.toUpperCase()}.md`);
    this.execGit(`commit -m "docs: add AI context for ${featureName}"`);
  }

  // Status and information
  async status(): Promise<void> {
    console.log("📊 Git Workflow Status\n");

    const currentBranch = this.getCurrentBranch();
    const isClean = this.isCleanWorkingTree();

    console.log(`Current branch: ${currentBranch}`);
    console.log(`Working tree: ${isClean ? "✅ Clean" : "⚠️  Dirty"}`);

    // List feature branches
    try {
      const branches = this.execGit(
        'branch --list "feature/*" --list "ai/*" --list "release/*" --list "hotfix/*"',
      );
      if (branches) {
        console.log("\n🌟 Active development branches:");
        branches.split("\n").forEach((branch) => {
          const cleanBranch = branch.replace(/^\*?\s+/, "");
          if (cleanBranch) console.log(`  ${cleanBranch}`);
        });
      }
    } catch {
      console.log("No development branches found");
    }

    // Show recent commits
    try {
      const recentCommits = this.execGit("log --oneline -5");
      console.log("\n📝 Recent commits:");
      recentCommits.split("\n").forEach((commit) => {
        console.log(`  ${commit}`);
      });
    } catch {
      console.log("No commits found");
    }
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const workflow = new GitWorkflow();

  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0];

  try {
    switch (command) {
      case "start-feature":
        if (!args[1]) throw new Error("Feature name required");
        await workflow.startFeature(args[1]);
        break;

      case "finish-feature":
        if (!args[1]) throw new Error("Feature name required");
        await workflow.finishFeature(args[1]);
        break;

      case "start-release":
        if (!args[1]) throw new Error("Version required");
        await workflow.startRelease(args[1]);
        break;

      case "finish-release":
        if (!args[1]) throw new Error("Version required");
        await workflow.finishRelease(args[1]);
        break;

      case "start-hotfix":
        if (!args[1] || !args[2])
          throw new Error("Hotfix name and version required");
        await workflow.startHotfix(args[1], args[2]);
        break;

      case "finish-hotfix":
        if (!args[1] || !args[2])
          throw new Error("Hotfix name and version required");
        await workflow.finishHotfix(args[1], args[2]);
        break;

      case "start-ai":
        if (!args[1]) throw new Error("AI feature name required");
        await workflow.startAIFeature(args[1]);
        break;

      case "status":
        await workflow.status();
        break;

      case "help":
      case "--help":
      case "-h":
        showHelp();
        break;

      default:
        console.error(`❌ Unknown command: ${command}`);
        showHelp();
        process.exit(1);
    }
  } catch (error) {
    console.error(
      `❌ Error: ${error instanceof Error ? error.message : String(error)}`,
    );
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🔄 Git Workflow Automation - InternetFriends

Usage: bun scripts/git-workflow.ts <command> [options]

FEATURE COMMANDS:
start-feature <name>     Start a new feature branch
finish-feature <name>    Finish and merge feature branch

RELEASE COMMANDS:
start-release <version>  Start a release branch (e.g., 1.2.0)
finish-release <version> Finish release and create tag

HOTFIX COMMANDS:
start-hotfix <name> <version>   Start an emergency hotfix
finish-hotfix <name> <version>  Finish hotfix and deploy

AI COMMANDS:
start-ai <name>         Start AI feature development branch

UTILITY COMMANDS:
status                  Show workflow status
help                    Show this help message

EXAMPLES:
bun scripts/git-workflow.ts start-feature micro-ux-explorer
bun scripts/git-workflow.ts finish-feature micro-ux-explorer
bun scripts/git-workflow.ts start-release 1.2.0
bun scripts/git-workflow.ts start-hotfix security-patch 1.1.1
bun scripts/git-workflow.ts start-ai agent-integration
bun scripts/git-workflow.ts status

BRANCH NAMING CONVENTIONS:
feature/    Feature development (feature/micro-ux-explorer)
release/    Release preparation (release/v1.2.0)
hotfix/     Emergency fixes (hotfix/security-patch)
ai/         AI development (ai/agent-integration)

For more information, see .github/GIT_WORKFLOW_STRATEGY.md
`);
}

// Run if called directly
if (import.meta.main) {
  main();
}
