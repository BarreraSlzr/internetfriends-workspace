#!/usr/bin/env bun
/**
 * AI Context Provider for InternetFriends Workspace
 * Integrates Git documentation, epic tracking, and workspace utilities
 * for enhanced AI/OpenCode interactions
 */

import { generateStamp, getIsoTimestamp } from '../../components/utils/stamp';
import { execSync } from 'child_process';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

interface EpicContext {
  current_epic?: string;
  epic_phase?: 'development' | 'review' | 'complete';
  completion_percentage?: number;
  next_milestones?: string[];
}

interface GitContext {
  current_branch: string;
  recent_commits: string[];
  uncommitted_changes: boolean;
  breaking_changes?: any[];
}

interface PerformanceContext {
  build_time?: number;
  bundle_size?: number;
  test_coverage?: number;
  lighthouse_score?: number;
}

interface WorkspaceContext {
  timestamp: string;
  stamp: string;
  workspace_root: string;
  active_utilities: string[];
  epic_context: EpicContext;
  git_context: GitContext;
  performance_context: PerformanceContext;
  ai_suggestions: string[];
}

async function getEpicContext(): Promise<EpicContext> {
  try {
    const epicConfigPath = join(process.cwd(), 'epic-config.json');
    if (existsSync(epicConfigPath)) {
      const epicConfig = JSON.parse(readFileSync(epicConfigPath, 'utf8'));
      return {
        current_epic: epicConfig.current_epic?.name,
        epic_phase: epicConfig.current_epic?.phase,
        completion_percentage: epicConfig.current_epic?.completion_percentage,
        next_milestones: epicConfig.current_epic?.next_milestones
      };
    }
  } catch (error) {
    console.warn('Epic context unavailable:', error);
  }
  return {};
}

async function getGitContext(): Promise<GitContext> {
  try {
    const currentBranch = execSync('git branch --show-current', { encoding: 'utf8' }).trim();
    const recentCommits = execSync('git log --oneline -5', { encoding: 'utf8' })
      .trim()
      .split('\n');
    const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' }).trim();
    
    return {
      current_branch: currentBranch,
      recent_commits: recentCommits,
      uncommitted_changes: gitStatus.length > 0
    };
  } catch (error) {
    console.warn('Git context unavailable:', error);
    return {
      current_branch: 'unknown',
      recent_commits: [],
      uncommitted_changes: false
    };
  }
}

async function getPerformanceContext(): Promise<PerformanceContext> {
  const context: PerformanceContext = {};
  
  try {
    // Check if performance budget file exists
    const perfBudgetPath = join(process.cwd(), 'perf.budgets.json');
    if (existsSync(perfBudgetPath)) {
      const budgets = JSON.parse(readFileSync(perfBudgetPath, 'utf8'));
      context.bundle_size = budgets.bundle_size_kb;
    }
    
    // Check for test coverage if available
    const coveragePath = join(process.cwd(), 'coverage/coverage-summary.json');
    if (existsSync(coveragePath)) {
      const coverage = JSON.parse(readFileSync(coveragePath, 'utf8'));
      context.test_coverage = coverage.total?.lines?.pct;
    }
  } catch (error) {
    console.warn('Performance context partial:', error);
  }
  
  return context;
}

function getActiveUtilities(): string[] {
  const utilities = [];
  
  // Check for Git documentation system
  if (existsSync('./scripts/git-docs/orchestrator.sh')) {
    utilities.push('git-documentation-system');
  }
  
  // Check for Epic tools
  if (existsSync('./scripts/epic-tools/epic')) {
    utilities.push('epic-management-cli');
  }
  
  // Check for Visual testing
  if (existsSync('./scripts/visual-comparison.test.ts')) {
    utilities.push('visual-regression-testing');
  }
  
  // Check for OpenCode integration
  if (existsSync('./scripts/opencode-session-manager.ts')) {
    utilities.push('opencode-integration');
  }
  
  // Check for Performance monitoring
  if (existsSync('./scripts/perf/')) {
    utilities.push('performance-monitoring');
  }
  
  return utilities;
}

function generateAISuggestions(context: Partial<WorkspaceContext>): string[] {
  const suggestions = [];
  
  if (context.git_context?.uncommitted_changes) {
    suggestions.push('Consider running breaking change analysis before committing');
  }
  
  if (context.epic_context?.current_epic) {
    suggestions.push(`Focus development on epic: ${context.epic_context.current_epic}`);
  }
  
  if (context.active_utilities?.includes('git-documentation-system')) {
    suggestions.push('Use ./scripts/git-docs/orchestrator.sh for comprehensive documentation');
  }
  
  if (context.active_utilities?.includes('visual-regression-testing')) {
    suggestions.push('Run visual tests for UI changes: bun run test:visual');
  }
  
  suggestions.push('Reference CLAUDE.md for OpenCode configuration patterns');
  
  return suggestions;
}

export async function getCurrentContext(): Promise<WorkspaceContext> {
  const epicContext = await getEpicContext();
  const gitContext = await getGitContext();
  const performanceContext = await getPerformanceContext();
  const activeUtilities = getActiveUtilities();
  
  const context: WorkspaceContext = {
    timestamp: getIsoTimestamp(),
    stamp: generateStamp(),
    workspace_root: process.cwd(),
    active_utilities: activeUtilities,
    epic_context: epicContext,
    git_context: gitContext,
    performance_context: performanceContext,
    ai_suggestions: []
  };
  
  context.ai_suggestions = generateAISuggestions(context);
  
  return context;
}

export async function getComponentContext(componentPath: string) {
  const baseContext = await getCurrentContext();
  
  try {
    // Get Git attribution for specific component
    const gitBlame = execSync(`git log --oneline -3 -- ${componentPath}`, { encoding: 'utf8' }).trim();
    
    // Check if component follows naming conventions
    const followsConvention = componentPath.includes('.atomic.') || 
                             componentPath.includes('.molecular.') || 
                             componentPath.includes('.organism.');
    
    return {
      ...baseContext,
      component_path: componentPath,
      component_history: gitBlame.split('\n'),
      follows_convention: followsConvention,
      suggestions: [
        ...baseContext.ai_suggestions,
        followsConvention ? 'Component follows atomic design pattern' : 'Consider atomic design naming convention',
        'Use SCSS modules for styling',
        'Ensure TypeScript types are explicit'
      ]
    };
  } catch (error) {
    return {
      ...baseContext,
      component_path: componentPath,
      error: 'Component context unavailable'
    };
  }
}

// CLI interface
if (import.meta.main) {
  const args = process.argv.slice(2);
  const component = args.find(arg => arg.startsWith('--component='))?.split('=')[1];
  const json = args.includes('--json');
  
  let context;
  if (component) {
    context = await getComponentContext(component);
  } else {
    context = await getCurrentContext();
  }
  
  if (json) {
    console.log(JSON.stringify(context, null, 2));
  } else {
    console.log('🤖 AI Context Provider - InternetFriends Workspace');
    console.log('================================================');
    console.log(`Timestamp: ${context.timestamp}`);
    console.log(`Active Utilities: ${context.active_utilities.join(', ')}`);
    if (context.epic_context.current_epic) {
      console.log(`Current Epic: ${context.epic_context.current_epic}`);
    }
    console.log(`Git Branch: ${context.git_context.current_branch}`);
    console.log(`Uncommitted Changes: ${context.git_context.uncommitted_changes ? 'Yes' : 'No'}`);
    console.log('\n🎯 AI Suggestions:');
    context.ai_suggestions.forEach(suggestion => console.log(`  • ${suggestion}`));
  }
}