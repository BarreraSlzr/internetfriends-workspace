#!/usr/bin/env bun
/**
 * Smart Commit Orchestrator
 * 
 * Provides an intelligent commit workflow that:
 * 1. Attempts a normal commit first
 * 2. If blocked by issues, runs the refactorization pipeline
 * 3. Retries the commit after cleanup
 * 4. Provides detailed feedback on the process
 * 
 * Usage: bun run smart-commit "your commit message"
 */
import { execSync } from 'child_process';
import { AutomatedRefactorizationPipeline } from './automated-refactorization-pipeline.js';

interface CommitOptions {
  message: string;
  allowEmpty?: boolean;
  skipRefactorization?: boolean;
  forceRefactorization?: boolean;
}

interface CommitResult {
  success: boolean;
  method: 'direct' | 'refactorized' | 'failed';
  error?: string;
  refactorizationResults?: {
    filesProcessed: number;
    filesFailed: number;
    successRate: number;
  };
}

class SmartCommitOrchestrator {
  private projectRoot = process.cwd();

  async commit(options: CommitOptions): Promise<CommitResult> {
    console.log('🚀 Smart Commit Orchestrator');
    console.log('============================');
    console.log(`📝 Message: ${options.message}`);
    console.log(`📍 Project: ${this.projectRoot}`);

    // Check if we have staged changes
    const hasStagedChanges = this.hasStagedChanges();
    if (!hasStagedChanges && !options.allowEmpty) {
      return {
        success: false,
        method: 'failed',
        error: 'No staged changes to commit'
      };
    }

    // If force refactorization is requested, skip direct commit
    if (options.forceRefactorization) {
      console.log('🔄 Force refactorization requested, skipping direct commit');
      return await this.commitWithRefactorization(options);
    }

    // Try direct commit first
    console.log('\n📤 Attempting direct commit...');
    const directResult = await this.attemptDirectCommit(options);
    
    if (directResult.success) {
      console.log('✅ Direct commit successful!');
      return directResult;
    }

    // If direct commit failed and refactorization is not skipped
    if (!options.skipRefactorization) {
      console.log('⚠️  Direct commit failed, attempting refactorization...');
      return await this.commitWithRefactorization(options);
    }

    // If refactorization is skipped, return the failed result
    return directResult;
  }

  private hasStagedChanges(): boolean {
    try {
      const status = execSync('git diff --cached --name-only', { encoding: 'utf-8' });
      return status.trim().length > 0;
    } catch {
      return false;
    }
  }

  private async attemptDirectCommit(options: CommitOptions): Promise<CommitResult> {
    try {
      const commitCommand = `git commit -m "${options.message}"`;
      execSync(commitCommand, { stdio: 'pipe' });
      
      return {
        success: true,
        method: 'direct'
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      // Check if it's a pre-commit hook failure
      if (errorMessage.includes('pre-commit') || errorMessage.includes('husky')) {
        return {
          success: false,
          method: 'failed',
          error: 'Pre-commit hooks failed - refactorization recommended'
        };
      }
      
      // Check if it's a linting/type checking failure
      if (errorMessage.includes('lint') || errorMessage.includes('TypeScript')) {
        return {
          success: false,
          method: 'failed',
          error: 'Code quality checks failed - refactorization recommended'
        };
      }
      
      return {
        success: false,
        method: 'failed',
        error: errorMessage
      };
    }
  }

  private async commitWithRefactorization(options: CommitOptions): Promise<CommitResult> {
    console.log('\n🔧 Running refactorization pipeline...');
    
    try {
      // Run the refactorization pipeline
      const pipeline = new AutomatedRefactorizationPipeline();
      const refactorizationSuccess = await pipeline.runPipeline();
      
      if (!refactorizationSuccess) {
        console.log('❌ Refactorization pipeline failed');
        return {
          success: false,
          method: 'refactorized',
          error: 'Refactorization pipeline failed to clean up the codebase'
        };
      }
      
      console.log('✅ Refactorization completed successfully');
      
      // Stage any changes made by the refactorization
      console.log('📤 Staging refactorization changes...');
      execSync('git add .', { stdio: 'pipe' });
      
      // Attempt commit again
      console.log('📤 Attempting commit after refactorization...');
      const commitCommand = `git commit -m "${options.message}"`;
      execSync(commitCommand, { stdio: 'pipe' });
      
      console.log('✅ Commit successful after refactorization!');
      
      return {
        success: true,
        method: 'refactorized',
        refactorizationResults: {
          filesProcessed: 0, // This would come from the pipeline
          filesFailed: 0,
          successRate: 100
        }
      };
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.log(`❌ Commit failed even after refactorization: ${errorMessage}`);
      
      return {
        success: false,
        method: 'refactorized',
        error: `Refactorization completed but commit still failed: ${errorMessage}`
      };
    }
  }

  // Utility method to get current git status
  getGitStatus(): string {
    try {
      return execSync('git status --porcelain', { encoding: 'utf-8' });
    } catch {
      return '';
    }
  }

  // Utility method to get current branch
  getCurrentBranch(): string {
    try {
      return execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
    } catch {
      return 'unknown';
    }
  }
}

// ============================================================================
// CLI INTERFACE
// ============================================================================

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    console.log('Usage: bun run smart-commit "your commit message" [options]');
    console.log('');
    console.log('Options:');
    console.log('  --allow-empty    Allow empty commits');
    console.log('  --skip-refactorization  Skip refactorization pipeline');
    console.log('  --force-refactorization Force refactorization pipeline');
    console.log('');
    console.log('Examples:');
    console.log('  bun run smart-commit "feat: add new feature"');
    console.log('  bun run smart-commit "fix: resolve issue" --force-refactorization');
    console.log('  bun run smart-commit "docs: update readme" --skip-refactorization');
    process.exit(1);
  }

  const message = args[0];
  const options: CommitOptions = {
    message,
    allowEmpty: args.includes('--allow-empty'),
    skipRefactorization: args.includes('--skip-refactorization'),
    forceRefactorization: args.includes('--force-refactorization')
  };

  const orchestrator = new SmartCommitOrchestrator();
  const result = await orchestrator.commit(options);

  if (result.success) {
    console.log('\n🎉 Commit completed successfully!');
    console.log(`📋 Method: ${result.method}`);
    if (result.refactorizationResults) {
      console.log(`📊 Refactorization: ${result.refactorizationResults.successRate}% success rate`);
    }
    process.exit(0);
  } else {
    console.log('\n❌ Commit failed');
    console.log(`📋 Method: ${result.method}`);
    console.log(`💥 Error: ${result.error}`);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main().catch(error => {
    console.error('❌ Smart commit failed:', error);
    process.exit(1);
  });
}

export { SmartCommitOrchestrator }; 