#!/usr/bin/env bun
/**
 * AI Workspace Configuration Validator
 * Validates that all AI/OpenCode configurations are properly integrated
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  component: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
}

function validateFile(path: string, description: string): ValidationResult {
  if (existsSync(path)) {
    return {
      component: description,
      status: 'pass',
      message: `✅ ${description} exists`
    };
  } else {
    return {
      component: description,
      status: 'fail',
      message: `❌ ${description} missing`
    };
  }
}

function validateExecutable(path: string, description: string): ValidationResult {
  try {
    if (existsSync(path)) {
      execSync(`test -x ${path}`, { stdio: 'ignore' });
      return {
        component: description,
        status: 'pass',
        message: `✅ ${description} is executable`
      };
    } else {
      return {
        component: description,
        status: 'fail',
        message: `❌ ${description} not found`
      };
    }
  } catch (error) {
    return {
      component: description,
      status: 'warning',
      message: `⚠️ ${description} exists but not executable`
    };
  }
}

function validateAIIntegration(): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  // Core configuration files
  results.push(validateFile('./CLAUDE.md', 'Primary OpenCode configuration'));
  results.push(validateFile('./AGENTS.md', 'AI agents quick reference'));
  results.push(validateFile('./.github/copilot-instructions.md', 'Enhanced copilot instructions'));
  results.push(validateFile('./.zed/settings.json', 'Enhanced Zed configuration'));
  results.push(validateFile('./ai-workspace-config.json', 'AI workspace configuration'));
  
  // AI context provider
  results.push(validateExecutable('./scripts/ai-context/context-provider.ts', 'AI context provider'));
  
  // Git documentation system
  results.push(validateExecutable('./scripts/git-docs/orchestrator.sh', 'Git documentation orchestrator'));
  results.push(validateExecutable('./scripts/git-docs/breaking-change-detector.sh', 'Breaking change detector'));
  results.push(validateExecutable('./scripts/git-docs/source-attribution.sh', 'Source attribution'));
  
  // Epic management
  results.push(validateExecutable('./scripts/epic-tools/epic', 'Epic management CLI'));
  
  // OpenCode integration
  results.push(validateExecutable('./components/scripts/opencode-delegate.ts', 'OpenCode delegation'));
  
  return results;
}

function testIntegrations(): ValidationResult[] {
  const results: ValidationResult[] = [];
  
  try {
    // Test AI context provider
    execSync('bun ./scripts/ai-context/context-provider.ts --json', { stdio: 'ignore' });
    results.push({
      component: 'AI Context Provider',
      status: 'pass',
      message: '✅ AI context provider runs successfully'
    });
  } catch (error) {
    results.push({
      component: 'AI Context Provider',
      status: 'fail',
      message: '❌ AI context provider failed to run'
    });
  }
  
  try {
    // Test Git documentation
    if (existsSync('./scripts/git-docs/orchestrator.sh')) {
      execSync('./scripts/git-docs/orchestrator.sh --help', { stdio: 'ignore' });
      results.push({
        component: 'Git Documentation',
        status: 'pass',
        message: '✅ Git documentation system accessible'
      });
    }
  } catch (error) {
    results.push({
      component: 'Git Documentation',
      status: 'warning',
      message: '⚠️ Git documentation system may have issues'
    });
  }
  
  return results;
}

function generateReport(): void {
  const configResults = validateAIIntegration();
  const testResults = testIntegrations();
  const allResults = [...configResults, ...testResults];
  
  console.log('🤖 AI Workspace Configuration Validation Report');
  console.log('===============================================');
  console.log(`Timestamp: ${new Date().toISOString()}`);
  console.log();
  
  const passed = allResults.filter(r => r.status === 'pass').length;
  const failed = allResults.filter(r => r.status === 'fail').length;
  const warnings = allResults.filter(r => r.status === 'warning').length;
  
  console.log(`📊 Summary: ${passed} passed, ${failed} failed, ${warnings} warnings`);
  console.log();
  
  // Group by status
  const passedResults = allResults.filter(r => r.status === 'pass');
  const failedResults = allResults.filter(r => r.status === 'fail');
  const warningResults = allResults.filter(r => r.status === 'warning');
  
  if (passedResults.length > 0) {
    console.log('✅ Passed:');
    passedResults.forEach(r => console.log(`  ${r.message}`));
    console.log();
  }
  
  if (warningResults.length > 0) {
    console.log('⚠️  Warnings:');
    warningResults.forEach(r => console.log(`  ${r.message}`));
    console.log();
  }
  
  if (failedResults.length > 0) {
    console.log('❌ Failed:');
    failedResults.forEach(r => console.log(`  ${r.message}`));
    console.log();
  }
  
  if (failed === 0) {
    console.log('🎉 All critical AI configurations are properly integrated!');
    console.log('📖 Reference CLAUDE.md for complete OpenCode configuration patterns');
  } else {
    console.log('🔧 Some configurations need attention for optimal AI integration');
  }
}

if (import.meta.main) {
  generateReport();
}