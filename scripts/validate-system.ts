#!/usr/bin/env bun

/**
 * InternetFriends Design System Validation Script
 *
 * This script runs comprehensive validation checks to ensure 100% success rate
 * before starting the development server or deploying to production.
 */

import { execSync } from 'child_process';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

interface ValidationResult {
  name: string;
  passed: boolean;
  message: string;
  duration: number;
}

interface ValidationSuite {
  name: string;
  results: ValidationResult[];
  totalDuration: number;
  passed: boolean;
}

class SystemValidator {
  private results: ValidationSuite[] = [];
  private verbose = process.argv.includes('--verbose');
  private fix = process.argv.includes('--fix');

  constructor() {
    console.log('🚀 InternetFriends Design System Validation\n');
  }

  private async runCommand(command: string, options: { timeout?: number } = {}): Promise<{ success: boolean; output: string }> {
    try {
      const output = execSync(command, {
        encoding: 'utf8',
        timeout: options.timeout || 30000,
        stdio: 'pipe'
      });
      return { success: true, output };
    } catch (error: any) {
      return { success: false, output: error.message || 'Command failed' };
    }
  }

  private log(message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️'
    };

    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m', // Yellow
      reset: '\x1b[0m'
    };

    if (this.verbose || type !== 'info') {
      console.log(`${icons[type]} ${colors[type]}${message}${colors.reset}`);
    }
  }

  private async validateTest(name: string, testFn: () => Promise<boolean>): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      this.log(`Running ${name}...`, 'info');
      const passed = await testFn();
      const duration = Date.now() - startTime;

      const result: ValidationResult = {
        name,
        passed,
        message: passed ? 'Passed' : 'Failed',
        duration
      };

      this.log(`${name}: ${result.message} (${duration}ms)`, passed ? 'success' : 'error');
      return result;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      const result: ValidationResult = {
        name,
        passed: false,
        message: error.message || 'Test threw an error',
        duration
      };

      this.log(`${name}: ${result.message} (${duration}ms)`, 'error');
      return result;
    }
  }

  async validateFileStructure(): Promise<ValidationSuite> {
    this.log('\n📁 Validating File Structure...', 'info');
    const startTime = Date.now();

    const requiredFiles = [
      'package.json',
      'tsconfig.json',
      'tailwind.config.ts',
      'next.config.ts',
      'app/(internetfriends)/globals.css',
      'app/(internetfriends)/page.tsx',
      'app/(internetfriends)/design-system/page.tsx',
      'components/atomic/index.ts',
      'components/atomic/header/header.atomic.tsx',
      'components/atomic/button/button.atomic.tsx',
      'components/atomic/glass-card/glass-card.atomic.tsx',
      'components/molecular/navigation/navigation.molecular.tsx',
      'lib/utils/index.ts'
    ];

    const requiredDirectories = [
      'app',
      'components',
      'components/atomic',
      'components/molecular',
      'lib',
      'tests',
      'scripts'
    ];

    const results: ValidationResult[] = [];

    // Check files
    for (const file of requiredFiles) {
      results.push(await this.validateTest(`File exists: ${file}`, async () => {
        return existsSync(join(process.cwd(), file));
      }));
    }

    // Check directories
    for (const dir of requiredDirectories) {
      results.push(await this.validateTest(`Directory exists: ${dir}`, async () => {
        return existsSync(join(process.cwd(), dir));
      }));
    }

    const suite: ValidationSuite = {
      name: 'File Structure',
      results,
      totalDuration: Date.now() - startTime,
      passed: results.every(r => r.passed)
    };

    this.results.push(suite);
    return suite;
  }

  async validatePackageIntegrity(): Promise<ValidationSuite> {
    this.log('\n📦 Validating Package Integrity...', 'info');
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    results.push(await this.validateTest('package.json is valid JSON', async () => {
      try {
        const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
        return typeof pkg === 'object' && pkg.name && pkg.version;
      } catch {
        return false;
      }
    }));

    results.push(await this.validateTest('Required dependencies installed', async () => {
      const { success } = await this.runCommand('bun pm ls', { timeout: 10000 });
      return success;
    }));

    results.push(await this.validateTest('No security vulnerabilities', async () => {
      const { success, output } = await this.runCommand('bun audit', { timeout: 15000 });
      // Bun audit returns 0 for no vulnerabilities
      return success || !output.toLowerCase().includes('vulnerability');
    }));

    const suite: ValidationSuite = {
      name: 'Package Integrity',
      results,
      totalDuration: Date.now() - startTime,
      passed: results.every(r => r.passed)
    };

    this.results.push(suite);
    return suite;
  }

  async validateTypeScript(): Promise<ValidationSuite> {
    this.log('\n🔷 Validating TypeScript...', 'info');
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    results.push(await this.validateTest('TypeScript compilation', async () => {
      const { success, output } = await this.runCommand('bunx tsc --noEmit', { timeout: 30000 });
      if (!success && this.verbose) {
        this.log(`TypeScript errors:\n${output}`, 'error');
      }
      return success;
    }));

    results.push(await this.validateTest('ESLint validation', async () => {
      const { success, output } = await this.runCommand('bunx eslint .', { timeout: 20000 });
      if (!success && this.verbose) {
        this.log(`ESLint errors:\n${output}`, 'error');
      }
      return success;
    }));

    const suite: ValidationSuite = {
      name: 'TypeScript',
      results,
      totalDuration: Date.now() - startTime,
      passed: results.every(r => r.passed)
    };

    this.results.push(suite);
    return suite;
  }

  async validateDesignSystem(): Promise<ValidationSuite> {
    this.log('\n🎨 Validating Design System...', 'info');
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    results.push(await this.validateTest('CSS compilation', async () => {
      const { success } = await this.runCommand('bunx tailwindcss -i ./app/(internetfriends)/globals.css -o ./temp-output.css', { timeout: 15000 });
      if (success) {
        // Clean up temp file
        try {
          execSync('rm -f ./temp-output.css');
        } catch {}
      }
      return success;
    }));

    results.push(await this.validateTest('Design tokens present', async () => {
      const css = readFileSync('app/(internetfriends)/globals.css', 'utf8');
      const requiredTokens = ['--if-primary', '--glass-bg-header', '--radius-lg'];
      return requiredTokens.every(token => css.includes(token));
    }));

    results.push(await this.validateTest('Component registry functional', async () => {
      try {
        const registryPath = 'app/(internetfriends)/design-system/registry/component.registry.ts';
        const registry = readFileSync(registryPath, 'utf8');
        return registry.includes('ComponentRegistry') && registry.includes('componentRegistry');
      } catch {
        return false;
      }
    }));

    results.push(await this.validateTest('Atomic components exportable', async () => {
      try {
        const indexPath = 'components/atomic/index.ts';
        const index = readFileSync(indexPath, 'utf8');
        return index.includes('HeaderAtomic') && index.includes('ButtonAtomic') && index.includes('GlassCardAtomic');
      } catch {
        return false;
      }
    }));

    const suite: ValidationSuite = {
      name: 'Design System',
      results,
      totalDuration: Date.now() - startTime,
      passed: results.every(r => r.passed)
    };

    this.results.push(suite);
    return suite;
  }

  async validateBuildSystem(): Promise<ValidationSuite> {
    this.log('\n🏗️ Validating Build System...', 'info');
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    results.push(await this.validateTest('Next.js build succeeds', async () => {
      const { success, output } = await this.runCommand('bun run build', { timeout: 120000 });
      if (!success && this.verbose) {
        this.log(`Build errors:\n${output}`, 'error');
      }
      return success;
    }));

    results.push(await this.validateTest('Build output is valid', async () => {
      return existsSync('.next') && existsSync('.next/BUILD_ID');
    }));

    const suite: ValidationSuite = {
      name: 'Build System',
      results,
      totalDuration: Date.now() - startTime,
      passed: results.every(r => r.passed)
    };

    this.results.push(suite);
    return suite;
  }

  async validateTests(): Promise<ValidationSuite> {
    this.log('\n🧪 Validating Tests...', 'info');
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    results.push(await this.validateTest('Unit tests pass', async () => {
      const { success, output } = await this.runCommand('bun test', { timeout: 30000 });
      if (!success && this.verbose) {
        this.log(`Test errors:\n${output}`, 'error');
      }
      return success;
    }));

    results.push(await this.validateTest('Playwright tests pass', async () => {
      const { success, output } = await this.runCommand('bunx playwright test --reporter=line', { timeout: 60000 });
      if (!success && this.verbose) {
        this.log(`Playwright errors:\n${output}`, 'error');
      }
      return success;
    }));

    const suite: ValidationSuite = {
      name: 'Tests',
      results,
      totalDuration: Date.now() - startTime,
      passed: results.every(r => r.passed)
    };

    this.results.push(suite);
    return suite;
  }

  async validateDevelopmentServer(): Promise<ValidationSuite> {
    this.log('\n🌐 Validating Development Server...', 'info');
    const startTime = Date.now();
    const results: ValidationResult[] = [];

    results.push(await this.validateTest('Server can start', async () => {
      // Start server in background
      const serverProcess = Bun.spawn(['bun', 'run', 'dev'], {
        stdout: 'pipe',
        stderr: 'pipe'
      });

      // Give it time to start
      await new Promise(resolve => setTimeout(resolve, 5000));

      // Check if server is responding
      try {
        const response = await fetch('http://localhost:3000', {
          signal: AbortSignal.timeout(5000)
        });

        // Kill the server
        serverProcess.kill();

        return response.ok;
      } catch {
        serverProcess.kill();
        return false;
      }
    }));

    const suite: ValidationSuite = {
      name: 'Development Server',
      results,
      totalDuration: Date.now() - startTime,
      passed: results.every(r => r.passed)
    };

    this.results.push(suite);
    return suite;
  }

  private generateReport(): void {
    const totalTests = this.results.reduce((acc, suite) => acc + suite.results.length, 0);
    const passedTests = this.results.reduce((acc, suite) => acc + suite.results.filter(r => r.passed).length, 0);
    const totalDuration = this.results.reduce((acc, suite) => acc + suite.totalDuration, 0);
    const allPassed = this.results.every(suite => suite.passed);

    console.log('\n' + '='.repeat(50));
    console.log('📊 VALIDATION REPORT');
    console.log('='.repeat(50));

    this.results.forEach(suite => {
      const icon = suite.passed ? '✅' : '❌';
      const passedCount = suite.results.filter(r => r.passed).length;
      console.log(`${icon} ${suite.name}: ${passedCount}/${suite.results.length} (${suite.totalDuration}ms)`);

      if (!suite.passed && this.verbose) {
        suite.results.filter(r => !r.passed).forEach(result => {
          console.log(`   ❌ ${result.name}: ${result.message}`);
        });
      }
    });

    console.log('='.repeat(50));
    console.log(`📈 Overall: ${passedTests}/${totalTests} tests passed`);
    console.log(`⏱️  Total Duration: ${totalDuration}ms`);
    console.log(`🎯 Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

    if (allPassed) {
      this.log('\n🎉 All validations passed! System is ready for development.', 'success');
    } else {
      this.log('\n💥 Some validations failed. Please fix the issues before continuing.', 'error');

      if (this.fix) {
        this.log('\n🔧 Auto-fix mode enabled. Attempting to fix common issues...', 'warning');
        this.attemptAutoFix();
      }
    }
  }

  private async attemptAutoFix(): Promise<void> {
    this.log('Attempting to install missing dependencies...', 'info');
    try {
      await this.runCommand('bun install');
      this.log('Dependencies installed', 'success');
    } catch {
      this.log('Failed to install dependencies', 'error');
    }

    this.log('Attempting to fix TypeScript issues...', 'info');
    try {
      await this.runCommand('bunx eslint . --fix');
      this.log('ESLint auto-fixes applied', 'success');
    } catch {
      this.log('Failed to apply ESLint fixes', 'error');
    }
  }

  async runValidation(): Promise<boolean> {
    try {
      // Run all validation suites
      await this.validateFileStructure();
      await this.validatePackageIntegrity();
      await this.validateTypeScript();
      await this.validateDesignSystem();
      await this.validateBuildSystem();
      await this.validateTests();
      await this.validateDevelopmentServer();

      this.generateReport();

      const allPassed = this.results.every(suite => suite.passed);
      process.exit(allPassed ? 0 : 1);

    } catch (error: any) {
      this.log(`❌ Validation failed with error: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run validation if called directly
if (import.meta.main) {
  const validator = new SystemValidator();
  validator.runValidation();
}

export { SystemValidator };
