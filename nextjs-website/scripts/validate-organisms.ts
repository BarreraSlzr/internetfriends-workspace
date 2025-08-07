#!/usr/bin/env bun
// InternetFriends Organism Components Validation Script
// Comprehensive validation for all organism-level components

import { readdir, stat } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

// Validation schemas
const OrganismStructureSchema = z.object({
  componentFile: z.string().regex(/\.organism\.tsx$/),
  stylesFile: z.string().regex(/\.styles\.module\.scss$/),
  typesFile: z.string().regex(/types\.ts$/),
  indexFile: z.string().optional()
});

const ComponentExportSchema = z.object({
  defaultExport: z.boolean(),
  namedExports: z.array(z.string()),
  propsInterface: z.string().optional(),
  componentName: z.string()
});

interface ValidationResult {
  component: string;
  path: string;
  valid: boolean;
  issues: string[];
  score: number;
  details: {
    structure: boolean;
    typescript: boolean;
    styles: boolean;
    exports: boolean;
    documentation: boolean;
    accessibility: boolean;
  };
}

class OrganismValidator {
  private basePath: string;
  private results: ValidationResult[] = [];
  private verbose: boolean;

  constructor(basePath: string = './app/(internetfriends)/components/organism', verbose: boolean = false) {
    this.basePath = basePath;
    this.verbose = verbose;
  }

  // Main validation function
  async validate(): Promise<ValidationResult[]> {
    console.log('🧬 Validating Organism Components...');
    console.log('=' .repeat(50));

    try {
      const organisms = await this.findOrganisms();

      for (const organism of organisms) {
        const result = await this.validateOrganism(organism);
        this.results.push(result);

        if (this.verbose) {
          this.logResult(result);
        }
      }

      this.generateSummaryReport();
      return this.results;

    } catch (error) {
      console.error('❌ Validation failed:', error);
      process.exit(1);
    }
  }

  // Find all organism directories
  private async findOrganisms(): Promise<string[]> {
    try {
      const entries = await readdir(this.basePath);
      const organisms: string[] = [];

      for (const entry of entries) {
        const fullPath = join(this.basePath, entry);
        const stats = await stat(fullPath);

        if (stats.isDirectory()) {
          organisms.push(entry);
        }
      }

      return organisms;
    } catch (error) {
      if (this.verbose) {
        console.log('⚠️  Organism directory not found, creating validation for expected structure...');
      }

      // Return expected organisms if directory doesn't exist
      return ['dashboard', 'data-table', 'analytics', 'project-showcase'];
    }
  }

  // Validate individual organism
  private async validateOrganism(organismName: string): Promise<ValidationResult> {
    const organismPath = join(this.basePath, organismName);
    const result: ValidationResult = {
      component: organismName,
      path: organismPath,
      valid: false,
      issues: [],
      score: 0,
      details: {
        structure: false,
        typescript: false,
        styles: false,
        exports: false,
        documentation: false,
        accessibility: false
      }
    };

    try {
      // Check if organism directory exists
      await stat(organismPath);
    } catch {
      result.issues.push('Organism directory does not exist');
      return result;
    }

    // Validate file structure
    await this.validateStructure(organismPath, result);

    // Validate TypeScript files
    await this.validateTypeScript(organismPath, result);

    // Validate styles
    await this.validateStyles(organismPath, result);

    // Validate exports
    await this.validateExports(organismPath, result);

    // Validate documentation
    await this.validateDocumentation(organismPath, result);

    // Validate accessibility
    await this.validateAccessibility(organismPath, result);

    // Calculate overall score
    const detailScores = Object.values(result.details);
    result.score = Math.round((detailScores.filter(Boolean).length / detailScores.length) * 100);
    result.valid = result.score >= 80;

    return result;
  }

  // Validate file structure
  private async validateStructure(organismPath: string, result: ValidationResult): Promise<void> {
    try {
      const files = await readdir(organismPath);
      const requiredFiles = {
        component: `${result.component}.organism.tsx`,
        styles: `${result.component}.styles.module.scss`,
        types: 'types.ts'
      };

      const hasRequiredFiles = Object.values(requiredFiles).every(file =>
        files.includes(file)
      );

      if (hasRequiredFiles) {
        result.details.structure = true;
      } else {
        const missing = Object.entries(requiredFiles)
          .filter(([_, filename]) => !files.includes(filename))
          .map(([type, filename]) => `${type}: ${filename}`);

        result.issues.push(`Missing required files: ${missing.join(', ')}`);
      }

      // Check for optional index.ts
      if (files.includes('index.ts')) {
        // Bonus points for proper exports
      }

    } catch (error) {
      result.issues.push('Cannot read organism directory structure');
    }
  }

  // Validate TypeScript implementation
  private async validateTypeScript(organismPath: string, result: ValidationResult): Promise<void> {
    const componentFile = join(organismPath, `${result.component}.organism.tsx`);
    const typesFile = join(organismPath, 'types.ts');

    try {
      // Check component file
      const componentContent = await Bun.file(componentFile).text();

      const hasProperImports = componentContent.includes("import React") &&
                              componentContent.includes("'use client'");
      const hasProperExport = componentContent.includes(`export const`) ||
                             componentContent.includes(`export default`);
      const hasTypeAnnotations = componentContent.includes(': React.FC<') ||
                                componentContent.includes(': FC<');
      const hasEventIntegration = componentContent.includes('UIEvents') ||
                                 componentContent.includes('eventSystem');

      // Check types file
      const typesContent = await Bun.file(typesFile).text();
      const hasPropsInterface = /interface.*Props/.test(typesContent);
      const hasExportedTypes = typesContent.includes('export interface') ||
                              typesContent.includes('export type');

      if (hasProperImports && hasProperExport && hasTypeAnnotations &&
          hasPropsInterface && hasExportedTypes && hasEventIntegration) {
        result.details.typescript = true;
      } else {
        const issues = [];
        if (!hasProperImports) issues.push('missing proper React imports');
        if (!hasProperExport) issues.push('missing proper component export');
        if (!hasTypeAnnotations) issues.push('missing TypeScript annotations');
        if (!hasPropsInterface) issues.push('missing props interface');
        if (!hasExportedTypes) issues.push('missing exported types');
        if (!hasEventIntegration) issues.push('missing event system integration');

        result.issues.push(`TypeScript issues: ${issues.join(', ')}`);
      }

    } catch (error) {
      result.issues.push('Cannot validate TypeScript files');
    }
  }

  // Validate SCSS styles
  private async validateStyles(organismPath: string, result: ValidationResult): Promise<void> {
    const stylesFile = join(organismPath, `${result.component}.styles.module.scss`);

    try {
      const stylesContent = await Bun.file(stylesFile).text();

      const hasModularClasses = /\.[a-zA-Z][a-zA-Z0-9_-]*\s*\{/.test(stylesContent);
      const hasInternetFriendsVars = stylesContent.includes('--if-primary') ||
                                    stylesContent.includes('--glass-bg') ||
                                    stylesContent.includes('--radius-');
      const hasResponsiveDesign = stylesContent.includes('@media');
      const hasAnimations = stylesContent.includes('transition') ||
                           stylesContent.includes('@keyframes') ||
                           stylesContent.includes('animation');
      const hasAccessibilityStyles = stylesContent.includes('focus-visible') ||
                                    stylesContent.includes('prefers-reduced-motion');

      if (hasModularClasses && hasInternetFriendsVars && hasResponsiveDesign &&
          hasAnimations && hasAccessibilityStyles) {
        result.details.styles = true;
      } else {
        const issues = [];
        if (!hasModularClasses) issues.push('missing CSS module classes');
        if (!hasInternetFriendsVars) issues.push('not using InternetFriends design tokens');
        if (!hasResponsiveDesign) issues.push('missing responsive design');
        if (!hasAnimations) issues.push('missing animations/transitions');
        if (!hasAccessibilityStyles) issues.push('missing accessibility styles');

        result.issues.push(`Style issues: ${issues.join(', ')}`);
      }

    } catch (error) {
      result.issues.push('Cannot validate styles file');
    }
  }

  // Validate component exports
  private async validateExports(organismPath: string, result: ValidationResult): Promise<void> {
    const componentFile = join(organismPath, `${result.component}.organism.tsx`);

    try {
      const componentContent = await Bun.file(componentFile).text();

      // Check for proper naming convention
      const expectedComponentName = this.toPascalCase(result.component) + 'Organism';
      const hasProperNaming = componentContent.includes(expectedComponentName);

      // Check for default export
      const hasDefaultExport = componentContent.includes(`export default ${expectedComponentName}`) ||
                              componentContent.includes('export default');

      // Check for named export
      const hasNamedExport = componentContent.includes(`export const ${expectedComponentName}`);

      if (hasProperNaming && (hasDefaultExport || hasNamedExport)) {
        result.details.exports = true;
      } else {
        const issues = [];
        if (!hasProperNaming) issues.push(`component should be named ${expectedComponentName}`);
        if (!hasDefaultExport && !hasNamedExport) issues.push('missing proper exports');

        result.issues.push(`Export issues: ${issues.join(', ')}`);
      }

    } catch (error) {
      result.issues.push('Cannot validate exports');
    }
  }

  // Validate documentation
  private async validateDocumentation(organismPath: string, result: ValidationResult): Promise<void> {
    const componentFile = join(organismPath, `${result.component}.organism.tsx`);

    try {
      const componentContent = await Bun.file(componentFile).text();

      // Check for JSDoc comments
      const hasJSDocComments = componentContent.includes('/**') &&
                              componentContent.includes('*/');

      // Check for prop documentation
      const hasPropDocumentation = componentContent.includes('@param') ||
                                  componentContent.includes('// Props:');

      // Check for usage examples in comments
      const hasUsageExamples = componentContent.includes('@example') ||
                              componentContent.includes('Example:');

      if (hasJSDocComments || hasPropDocumentation || hasUsageExamples) {
        result.details.documentation = true;
      } else {
        result.issues.push('Missing documentation (JSDoc comments, prop descriptions, or usage examples)');
      }

    } catch (error) {
      result.issues.push('Cannot validate documentation');
    }
  }

  // Validate accessibility features
  private async validateAccessibility(organismPath: string, result: ValidationResult): Promise<void> {
    const componentFile = join(organismPath, `${result.component}.organism.tsx`);

    try {
      const componentContent = await Bun.file(componentFile).text();

      // Check for ARIA attributes
      const hasAriaAttributes = /aria-[a-z]+/.test(componentContent);

      // Check for semantic HTML
      const hasSemanticHTML = componentContent.includes('<main>') ||
                             componentContent.includes('<section>') ||
                             componentContent.includes('<article>') ||
                             componentContent.includes('<header>') ||
                             componentContent.includes('<nav>');

      // Check for keyboard navigation
      const hasKeyboardSupport = componentContent.includes('onKeyDown') ||
                                componentContent.includes('onKeyPress') ||
                                componentContent.includes('tabIndex');

      // Check for focus management
      const hasFocusManagement = componentContent.includes('focus-visible') ||
                               componentContent.includes('autoFocus') ||
                               componentContent.includes('ref');

      if (hasAriaAttributes || hasSemanticHTML || hasKeyboardSupport || hasFocusManagement) {
        result.details.accessibility = true;
      } else {
        result.issues.push('Missing accessibility features (ARIA attributes, semantic HTML, keyboard support, or focus management)');
      }

    } catch (error) {
      result.issues.push('Cannot validate accessibility');
    }
  }

  // Helper function to convert kebab-case to PascalCase
  private toPascalCase(str: string): string {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('');
  }

  // Log individual result
  private logResult(result: ValidationResult): void {
    const status = result.valid ? '✅' : '❌';
    console.log(`${status} ${result.component} (${result.score}%)`);

    if (result.issues.length > 0) {
      result.issues.forEach(issue => {
        console.log(`  ⚠️  ${issue}`);
      });
    }

    if (this.verbose) {
      console.log(`  📊 Details:`, result.details);
    }

    console.log('');
  }

  // Generate summary report
  private generateSummaryReport(): void {
    const totalComponents = this.results.length;
    const validComponents = this.results.filter(r => r.valid).length;
    const averageScore = this.results.reduce((sum, r) => sum + r.score, 0) / totalComponents;

    console.log('📋 Organism Validation Summary');
    console.log('=' .repeat(50));
    console.log(`Total Components: ${totalComponents}`);
    console.log(`Valid Components: ${validComponents}`);
    console.log(`Success Rate: ${((validComponents / totalComponents) * 100).toFixed(1)}%`);
    console.log(`Average Score: ${averageScore.toFixed(1)}%`);
    console.log('');

    // Category breakdown
    const categories = Object.keys(this.results[0]?.details || {});
    console.log('📊 Category Breakdown:');
    categories.forEach(category => {
      const passed = this.results.filter(r => r.details[category as keyof typeof r.details]).length;
      const percentage = ((passed / totalComponents) * 100).toFixed(1);
      console.log(`  ${category}: ${passed}/${totalComponents} (${percentage}%)`);
    });
    console.log('');

    // Recommendations
    console.log('💡 Recommendations:');
    if (averageScore < 80) {
      console.log('  - Focus on improving component structure and TypeScript implementation');
    }
    if (this.results.some(r => !r.details.accessibility)) {
      console.log('  - Add more accessibility features (ARIA attributes, keyboard support)');
    }
    if (this.results.some(r => !r.details.documentation)) {
      console.log('  - Improve component documentation with JSDoc comments');
    }
    if (this.results.some(r => !r.details.styles)) {
      console.log('  - Enhance styling with InternetFriends design tokens');
    }
    console.log('');

    // Output detailed results for failing components
    const failingComponents = this.results.filter(r => !r.valid);
    if (failingComponents.length > 0) {
      console.log('🔧 Components Needing Attention:');
      failingComponents.forEach(result => {
        console.log(`\n❌ ${result.component} (${result.score}%)`);
        result.issues.forEach(issue => {
          console.log(`  - ${issue}`);
        });
      });
    }

    // Exit with appropriate code
    if (validComponents === totalComponents && averageScore >= 90) {
      console.log('🎉 All organism components are excellent!');
      process.exit(0);
    } else if (validComponents === totalComponents) {
      console.log('✅ All organism components are valid but could be improved');
      process.exit(0);
    } else {
      console.log(`❌ ${totalComponents - validComponents} component(s) need fixes`);
      process.exit(1);
    }
  }
}

// CLI interface
async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const basePath = args.find(arg => arg.startsWith('--path='))?.split('=')[1];

  const validator = new OrganismValidator(basePath, verbose);
  await validator.validate();
}

// Run if called directly
if (import.meta.main) {
  main().catch(console.error);
}

export { OrganismValidator, type ValidationResult };
