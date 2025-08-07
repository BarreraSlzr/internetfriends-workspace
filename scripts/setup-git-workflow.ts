#!/usr/bin/env bun

/**
 * 🚀 Git Workflow Setup Script
 * Initializes the InternetFriends git workflow strategy
 */

import { execSync } from "child_process";
import { writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

interface SetupConfig {
  remote: string;
  defaultBranch: string;
  developBranch: string;
  showcaseBranch: string;
  enableHooks: boolean;
  setupProtection: boolean;
}

class GitWorkflowSetup {
  private config: SetupConfig;

  constructor(config: Partial<SetupConfig> = {}) {
    this.config = {
      remote: 'origin',
      defaultBranch: 'main',
      developBranch: 'develop',
      showcaseBranch: 'showcase',
      enableHooks: true,
      setupProtection: false,
      ...config
    };
  }

  private execGit(command: string): string {
    try {
      return execSync(`git ${command}`, { encoding: 'utf8' }).trim();
    } catch () {
      console.warn(`⚠️  Git command failed: git ${command}`);
      return '';
    }
  }

  private execCommand(command: string): string {
    try {
      return execSync(command, { encoding: 'utf8' }).trim();
    } catch () {
      console.warn(`⚠️  Command failed: ${command}`);
      return '';
    }
  }

  // Main setup process
  async setupWorkflow(): Promise<void> {
    console.log('🚀 Setting up InternetFriends Git Workflow...\n');

    await this.validateEnvironment();
    await this.setupBranches();
    await this.configureGit();

    if (this.config.enableHooks) {
      await this.setupGitHooks();
    }

    await this.createWorkflowFiles();
    await this.setupAliases();

    console.log('\n✅ Git workflow setup completed!');
    this.showNextSteps();
  }

  private async validateEnvironment(): Promise<void> {
    console.log('🔍 Validating environment...');

    // Check if we're in a git repository
    try {
      this.execGit('rev-parse --git-dir');
    } catch {
      throw new Error('Not in a git repository. Run "git init" first.');
    }

    // Check if bun is available
    try {
      this.execCommand('bun --version');
    } catch {
      throw new Error('Bun is required but not found. Please install Bun first.');
    }

    // Check if we have a remote
    const remotes = this.execGit('remote');
    if (!remotes.includes(this.config.remote)) {
      console.log(`⚠️  No remote '${this.config.remote}' found. You may need to add it manually.`);
    }

    console.log('✅ Environment validated');
  }

  private async setupBranches(): Promise<void> {
    console.log('🌿 Setting up branch structure...');

    const currentBranch = this.execGit('branch --show-current');

    // Ensure we have main branch
    if (currentBranch !== this.config.defaultBranch) {
      const branches = this.execGit('branch -a');
      if (!branches.includes(this.config.defaultBranch)) {
        // Create main branch if it doesn't exist
        this.execGit(`checkout -b ${this.config.defaultBranch}`);
        console.log(`✅ Created ${this.config.defaultBranch} branch`);
      } else {
        this.execGit(`checkout ${this.config.defaultBranch}`);
      }
    }

    // Create develop branch
    if (!this.execGit('branch -a').includes(this.config.developBranch)) {
      this.execGit(`checkout -b ${this.config.developBranch}`);
      this.execGit(`checkout ${this.config.defaultBranch}`);
      console.log(`✅ Created ${this.config.developBranch} branch`);
    }

    // Create showcase branch
    if (!this.execGit('branch -a').includes(this.config.showcaseBranch)) {
      this.execGit(`checkout ${this.config.developBranch}`);
      this.execGit(`checkout -b ${this.config.showcaseBranch}`);
      this.execGit(`checkout ${this.config.defaultBranch}`);
      console.log(`✅ Created ${this.config.showcaseBranch} branch`);
    }

    console.log('✅ Branch structure ready');
  }

  private async configureGit(): Promise<void> {
    console.log('⚙️  Configuring git settings...');

    // Set up pull strategy
    this.execGit('config pull.rebase true');

    // Set up automatic branch setup
    this.execGit('config branch.autosetupmerge always');

    // Configure push strategy
    this.execGit('config push.default simple');

    // Set up merge strategy
    this.execGit('config merge.ff false');

    // Enable rerere (reuse recorded resolution)
    this.execGit('config rerere.enabled true');

    console.log('✅ Git configuration applied');
  }

  private async setupGitHooks(): Promise<void> {
    console.log('🪝 Setting up git hooks...');

    const hooksDir = '.githooks';
    if (!existsSync(hooksDir)) {
      mkdirSync(hooksDir, { recursive: true });
    }

    // Pre-commit hook
    const preCommitHook = `#!/bin/bash
# InternetFriends pre-commit hook

echo "🔍 Running pre-commit checks..."

# Check if we're on a protected branch
branch=$(git branch --show-current)
if [[ "$branch" == "main" || "$branch" == "develop" ]]; then
  echo "❌ Direct commits to $branch are not allowed!"
  echo "💡 Use feature branches and pull requests."
  exit 1
fi

# Run linting if available
if command -v bun &> /dev/null && [ -f "package.json" ]; then
  echo "🧹 Running linter..."
  bun run lint --fix 2>/dev/null || true
fi

# Check for secrets
echo "🔐 Checking for secrets..."
if git diff --cached --name-only | xargs grep -l "sk-\\|pk_\\|AKIA\\|AIza" 2>/dev/null; then
  echo "❌ Potential secrets detected in staged files!"
  echo "💡 Please remove API keys and secrets before committing."
  exit 1
fi

echo "✅ Pre-commit checks passed"
`;

    writeFileSync(join(hooksDir, 'pre-commit'), preCommitHook);
    this.execCommand(`chmod +x ${join(hooksDir, 'pre-commit')}`);

    // Commit message hook
    const commitMsgHook = `#!/bin/bash
# InternetFriends commit message hook

commit_regex='^(feat|fix|docs|style|refactor|test|chore|ai)(\(.+\))?: .{1,50}'

if ! grep -qE "$commit_regex" "$1"; then
  echo "❌ Invalid commit message format!"
  echo "💡 Use: type(scope): description"
  echo "   Types: feat, fix, docs, style, refactor, test, chore, ai"
  echo "   Example: feat(orchestrator): add real-time monitoring"
  exit 1
fi
`;

    writeFileSync(join(hooksDir, 'commit-msg'), commitMsgHook);
    this.execCommand(`chmod +x ${join(hooksDir, 'commit-msg')}`);

    // Configure git to use our hooks directory
    this.execGit(`config core.hooksPath ${hooksDir}`);

    console.log('✅ Git hooks configured');
  }

  private async createWorkflowFiles(): Promise<void> {
    console.log('📝 Creating workflow files...');

    // Create .gitignore additions for workflow
    const workflowGitignore = `
# Git workflow artifacts
AI_CONTEXT_*.md
.workflow-temp/
*.workflow.tmp
`;

    const gitignorePath = '.gitignore';
    if (existsSync(gitignorePath)) {
      import currentGitignore from 'fs'.readFileSync(gitignorePath, 'utf8');
      if (!currentGitignore.includes('# Git workflow artifacts')) {
        require('fs').appendFileSync(gitignorePath, workflowGitignore);
        console.log('✅ Updated .gitignore');
      }
    }

    // Create pull request template
    const githubDir = '.github';
    if (!existsSync(githubDir)) {
      mkdirSync(githubDir, { recursive: true });
    }

    const prTemplate = `## 🎯 Description
Brief description of changes

## 📋 Type of Change
- [ ] 🆕 New feature
- [ ] 🐛 Bug fix
- [ ] 📚 Documentation
- [ ] 🔧 Refactor
- [ ] 🤖 AI enhancement
- [ ] ⚡ Performance improvement

## 🧪 Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] No breaking changes

## 📸 Screenshots (if applicable)
<!-- Add screenshots for UI changes -->

## 🔗 Related Issues
Closes #issue_number

## 📝 Additional Notes
<!-- Any additional context or notes -->

## 🚀 Deployment Notes
<!-- Special deployment considerations -->
`;

    writeFileSync(join(githubDir, 'pull_request_template.md'), prTemplate);

    // Create issue templates directory
    const issueTemplatesDir = join(githubDir, 'ISSUE_TEMPLATE');
    if (!existsSync(issueTemplatesDir)) {
      mkdirSync(issueTemplatesDir, { recursive: true });
    }

    // Feature request template
    const featureTemplate = `---
name: 🚀 Feature Request
about: Suggest a new feature or enhancement
title: 'feat: [Brief description]'
labels: ['enhancement', 'needs-triage']
assignees: ''
---

## 🎯 Feature Description
A clear description of the feature you'd like to see.

## 💡 Motivation
Why would this feature be useful?

## 🔧 Proposed Solution
Describe your ideal solution.

## 📋 Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

## 🤖 AI Integration
How might this feature work with AI agents?

## 📱 Additional Context
Screenshots, mockups, or additional context.
`;

    writeFileSync(join(issueTemplatesDir, 'feature_request.md'), featureTemplate);

    console.log('✅ Workflow files created');
  }

  private async setupAliases(): Promise<void> {
    console.log('⚡ Setting up git aliases...');

    const aliases = {
      'wf': 'scripts/git-workflow.ts',
      'start': '!f() { bun scripts/git-workflow.ts start-feature "$1"; }; f',
      'finish': '!f() { bun scripts/git-workflow.ts finish-feature "$1"; }; f',
      'release': '!f() { bun scripts/git-workflow.ts start-release "$1"; }; f',
      'hotfix': '!f() { bun scripts/git-workflow.ts start-hotfix "$1" "$2"; }; f',
      'ai': '!f() { bun scripts/git-workflow.ts start-ai "$1"; }; f',
      'st': 'status -sb',
      'co': 'checkout',
      'br': 'branch',
      'cm': 'commit -m',
      'lg': 'log --oneline --graph --decorate --all -10',
      'uncommit': 'reset --soft HEAD~1',
      'unstage': 'reset HEAD',
      'last': 'log -1 HEAD',
      'visual': '!gitk'
    };

    for (const [alias, command] of Object.entries(aliases)) {
      this.execGit(`config alias.${alias} "${command}"`);
    }

    console.log('✅ Git aliases configured');
  }

  private showNextSteps(): void {
    console.log(`
🎉 InternetFriends Git Workflow Setup Complete!

📋 what's BEEN CONFIGURED:
✅ Branch structure (main, develop, showcase)
✅ Git settings optimized for workflow
✅ Pre-commit and commit message hooks
✅ Pull request and issue templates
✅ Useful git aliases

🚀 QUICK START COMMANDS:
git start feature-name          # Start new feature
git finish feature-name         # Finish feature
git release 1.2.0              # Start release
git ai agent-integration       # Start AI feature
git wf status                  # Show workflow status

🔧 USEFUL ALIASES:
git st        # Short status
git lg        # Pretty log
git cm "msg"  # Quick commit
git uncommit  # Undo last commit (keep changes)

📚 DOCUMENTATION:
- .github/GIT_WORKFLOW_STRATEGY.md
- .github/pull_request_template.md

💡 NEXT STEPS:
1. Review and customize .github/GIT_WORKFLOW_STRATEGY.md
2. Set up branch protection rules on GitHub/GitLab
3. Configure CI/CD pipelines
4. Start your first feature: git start my-feature

🤖 AI INTEGRATION:
This workflow is optimized for AI agent collaboration.
Use 'git ai <feature-name>' for AI-specific branches.

Happy coding! 🚀
`);
  }
}

// CLI Interface
async function main() {
  const args = process.argv.slice(2);

  const options: Partial<SetupConfig> = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--no-hooks':
        options.enableHooks = false;
        break;
      case '--remote':
        options.remote = args[++i];
        break;
      case '--main-branch':
        options.defaultBranch = args[++i];
        break;
      case '--develop-branch':
        options.developBranch = args[++i];
        break;
      case '--help':
        showHelp();
        return;
    }
  }

  try {
    const setup = new GitWorkflowSetup(options);
    await setup.setupWorkflow();
  } catch (error) {
    console.error(`❌ Setup failed: ${error.message}`);
    process.exit(1);
  }
}

function showHelp() {
  console.log(`
🚀 Git Workflow Setup - InternetFriends

Usage: bun scripts/setup-git-workflow.ts [options]

OPTIONS:
  --no-hooks              Skip git hooks setup
  --remote <name>         Remote name (default: origin)
  --main-branch <name>    Main branch name (default: main)
  --develop-branch <name> Develop branch name (default: develop)
  --help                  Show this help message

EXAMPLES:
  bun scripts/setup-git-workflow.ts
  bun scripts/setup-git-workflow.ts --no-hooks
  bun scripts/setup-git-workflow.ts --remote upstream

This script will set up the complete InternetFriends git workflow
including branches, hooks, templates, and aliases.
`);
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { GitWorkflowSetup };
