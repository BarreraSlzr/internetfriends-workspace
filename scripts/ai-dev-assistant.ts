#!/usr/bin/env bun

/**
 * AI-Powered Development Assistant
 *
 * This script provides intelligent development assistance for the InternetFriends project:
 * - Automated code generation with context awareness
 * - Intelligent refactoring suggestions
 * - Component architecture optimization
 * - Code quality analysis with AI insights
 * - Development workflow automation
 *
 * Usage: bun scripts/ai-dev-assistant.ts [command] [options]
 */

import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, relative } from 'path';
import { execSync } from 'child_process';

interface AIAssistantConfig {
  projectRoot: string;
  componentTypes: ('atomic' | 'molecular' | 'organism' | 'template')[];
  styleApproach: 'tailwind' | 'scss' | 'both';
  includeTests: boolean;
  includeStorybook: boolean;
  aiProvider: 'openai' | 'anthropic' | 'local';
}

interface ComponentGenerationRequest {
  name: string;
  type: 'atomic' | 'molecular' | 'organism' | 'template';
  description: string;
  props?: Record<string, string>;
  features?: string[];
  dependencies?: string[];
}

interface CodeAnalysisResult {
  complexity: number;
  maintainability: number;
  issues: Array<{
    type: 'warning' | 'error' | 'suggestion';
    message: string;
    file: string;
    line?: number;
  }>;
  suggestions: string[];
}

class AIDevAssistant {
  private config: AIAssistantConfig;
  private projectStructure: Map<string, string[]> = new Map();

  constructor(config: Partial<AIAssistantConfig> = {}) {
    this.config = {
      projectRoot: process.cwd(),
      componentTypes: ['atomic', 'molecular', 'organism'],
      styleApproach: 'both',
      includeTests: true,
      includeStorybook: false,
      aiProvider: 'local',
      ...config
    };

    this.loadProjectStructure();
  }

  // 🔍 Project Analysis
  private loadProjectStructure(): void {
    const componentsDir = join(this.config.projectRoot, 'components');

    for (const type of this.config.componentTypes) {
      const typeDir = join(componentsDir, type);
      if (existsSync(typeDir)) {
        try {
          const components = execSync(`find ${typeDir} -name "*.tsx" -type f`, { encoding: 'utf-8' })
            .split('\n')
            .filter(Boolean)
            .map(path => relative(this.config.projectRoot, path));

          this.projectStructure.set(type, components);
        } catch (error) {
          this.projectStructure.set(type, []);
        }
      }
    }
  }

  // 🤖 AI-Powered Component Generation
  async generateComponent(request: ComponentGenerationRequest): Promise<void> {
    console.log(`🤖 Generating ${request.type} component: ${request.name}`);

    const componentDir = join(
      this.config.projectRoot,
      'components',
      request.type,
      request.name
    );

    // Create directory structure
    if (!existsSync(componentDir)) {
      mkdirSync(componentDir, { recursive: true });
    }

    // Generate component files
    const files = await this.generateComponentFiles(request);

    for (const [filename, content] of Object.entries(files)) {
      const filePath = join(componentDir, filename);
      writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ Created: ${relative(this.config.projectRoot, filePath)}`);
    }

    console.log(`🎉 Component ${request.name} generated successfully!`);
  }

  private async generateComponentFiles(request: ComponentGenerationRequest): Promise<Record<string, string>> {
    const files: Record<string, string> = {};

    // Main component file
    files[`${request.name.toLowerCase()}.${request.type}.tsx`] = this.generateComponentTSX(request);

    // Type definitions
    files['types.ts'] = this.generateTypes(request);

    // Styles
    if (this.config.styleApproach === 'scss' || this.config.styleApproach === 'both') {
      files[`${request.name.toLowerCase()}.styles.module.scss`] = this.generateStyles(request);
    }

    // Export index
    files['index.ts'] = this.generateIndex(request);

    // Tests
    if (this.config.includeTests) {
      files[`${request.name.toLowerCase()}.test.tsx`] = this.generateTest(request);
    }

    // Storybook
    if (this.config.includeStorybook) {
      files[`${request.name.toLowerCase()}.stories.tsx`] = this.generateStorybook(request);
    }

    return files;
  }

  private generateComponentTSX(request: ComponentGenerationRequest): string {
    const componentName = `${request.name}${this.capitalize(request.type)}`;
    const hasStyles = this.config.styleApproach === 'scss' || this.config.styleApproach === 'both';

    return `import React from 'react';
import { cn } from '@/lib/utils';
${hasStyles ? `import styles from './${request.name.toLowerCase()}.styles.module.scss';` : ''}
import { ${componentName}Props } from './types';

/**
 * ${componentName} - ${request.description}
 *
 * A ${request.type} component following InternetFriends design system patterns.
 * ${request.features ? request.features.map(f => `- ${f}`).join('\n * ') : ''}
 */
export const ${componentName}: React.FC<${componentName}Props> = ({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  'data-testid': testId,
  ...props
}) => {
  return (
    <div
      className={cn(
        // Base styles
        '${this.generateTailwindClasses(request)}',
        // Variant styles
        {
          'bg-blue-500 text-white': variant === 'primary',
          'bg-gray-100 text-gray-900': variant === 'secondary',
          'bg-transparent border border-current': variant === 'outline',
        },
        // Size styles
        {
          'px-2 py-1 text-sm': size === 'sm',
          'px-4 py-2 text-base': size === 'md',
          'px-6 py-3 text-lg': size === 'lg',
        },
        // State styles
        {
          'opacity-50 cursor-not-allowed': disabled,
        },${hasStyles ? `\n        styles.${request.name.toLowerCase()},` : ''}
        className
      )}
      data-testid={testId || '${request.name.toLowerCase()}-${request.type}'}
      aria-disabled={disabled}
      {...props}
    >
      {children}
    </div>
  );
};

${componentName}.displayName = '${componentName}';
`;
  }

  private generateTypes(request: ComponentGenerationRequest): string {
    const componentName = `${request.name}${this.capitalize(request.type)}`;

    const propTypes = request.props ?
      Object.entries(request.props)
        .map(([prop, type]) => `  ${prop}: ${type};`)
        .join('\n') : '';

    return `import React from 'react';

export interface ${componentName}Props {
  /** Content to display inside the component */
  children?: React.ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Visual variant of the component */
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Disabled state */
  disabled?: boolean;

  /** Test ID for testing */
  'data-testid'?: string;
${propTypes ? `\n${propTypes}\n` : ''}
}

export type ${componentName}Variant = ${componentName}Props['variant'];
export type ${componentName}Size = ${componentName}Props['size'];
`;
  }

  private generateStyles(request: ComponentGenerationRequest): string {
    return `.${request.name.toLowerCase()} {
  /* Base component styles */
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  font-weight: 500;
  transition: all 0.2s ease-in-out;

  /* InternetFriends design system integration */
  --component-bg: var(--glass-bg-header);
  --component-border: var(--glass-border);
  --component-shadow: 0 2px 8px rgba(59, 130, 246, 0.1);

  /* Focus styles inspired by Mermaid viewer */
  &:focus-visible {
    outline: 2px dashed var(--if-primary);
    outline-offset: 2px;
  }

  /* Hover effects */
  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: var(--component-shadow);
  }

  /* Active state */
  &:active:not(:disabled) {
    transform: translateY(0);
  }

  /* Disabled state */
  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* Glass morphism effect */
  @supports (backdrop-filter: blur(8px)) {
    &.glass {
      background: var(--component-bg);
      backdrop-filter: blur(8px);
      border: 1px solid var(--component-border);
    }
  }
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .${request.name.toLowerCase()} {
    /* Mobile-first responsive adjustments */
    min-height: 44px; /* Touch target size */
  }
}
`;
  }

  private generateIndex(request: ComponentGenerationRequest): string {
    const componentName = `${request.name}${this.capitalize(request.type)}`;

    return `export { ${componentName} } from './${request.name.toLowerCase()}.${request.type}';
export type {
  ${componentName}Props,
  ${componentName}Variant,
  ${componentName}Size
} from './types';
`;
  }

  private generateTest(request: ComponentGenerationRequest): string {
    const componentName = `${request.name}${this.capitalize(request.type)}`;

    return `import { render, screen } from '@testing-library/react';
import { ${componentName} } from './${request.name.toLowerCase()}.${request.type}';

describe('${componentName}', () => {
  it('renders children correctly', () => {
    render(<${componentName}>Test Content</${componentName}>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<${componentName} className="custom-class">Content</${componentName}>);
    expect(screen.getByTestId('${request.name.toLowerCase()}-${request.type}')).toHaveClass('custom-class');
  });

  it('handles disabled state', () => {
    render(<${componentName} disabled>Content</${componentName}>);
    expect(screen.getByTestId('${request.name.toLowerCase()}-${request.type}')).toHaveAttribute('aria-disabled', 'true');
  });

  it('applies variant styles correctly', () => {
    render(<${componentName} variant="secondary">Content</${componentName}>);
    const element = screen.getByTestId('${request.name.toLowerCase()}-${request.type}');
    expect(element).toHaveClass('bg-gray-100');
  });

  it('applies size styles correctly', () => {
    render(<${componentName} size="lg">Content</${componentName}>);
    const element = screen.getByTestId('${request.name.toLowerCase()}-${request.type}');
    expect(element).toHaveClass('px-6', 'py-3', 'text-lg');
  });

  it('forwards data-testid correctly', () => {
    render(<${componentName} data-testid="custom-test-id">Content</${componentName}>);
    expect(screen.getByTestId('custom-test-id')).toBeInTheDocument();
  });
});
`;
  }

  private generateStorybook(request: ComponentGenerationRequest): string {
    const componentName = `${request.name}${this.capitalize(request.type)}`;

    return `import type { Meta, StoryObj } from '@storybook/react';
import { ${componentName} } from './${request.name.toLowerCase()}.${request.type}';

const meta = {
  title: 'Components/${this.capitalize(request.type)}/${componentName}',
  component: ${componentName},
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: '${request.description}'
      }
    }
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'outline', 'ghost']
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg']
    },
    disabled: {
      control: 'boolean'
    }
  }
} satisfies Meta<typeof ${componentName}>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    children: '${componentName}',
    variant: 'primary',
    size: 'md'
  }
};

export const Secondary: Story = {
  args: {
    children: '${componentName}',
    variant: 'secondary',
    size: 'md'
  }
};

export const Outline: Story = {
  args: {
    children: '${componentName}',
    variant: 'outline',
    size: 'md'
  }
};

export const AllSizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <${componentName} size="sm">Small</${componentName}>
      <${componentName} size="md">Medium</${componentName}>
      <${componentName} size="lg">Large</${componentName}>
    </div>
  )
};

export const Disabled: Story = {
  args: {
    children: 'Disabled ${componentName}',
    disabled: true
  }
};
`;
  }

  // 📊 Code Analysis
  async analyzeCodeQuality(): Promise<CodeAnalysisResult> {
    console.log('🔍 Analyzing code quality...');

    const result: CodeAnalysisResult = {
      complexity: 0,
      maintainability: 0,
      issues: [],
      suggestions: []
    };

    try {
      // Run linting analysis
      const lintOutput = execSync('bunx eslint . --format json', {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'ignore']
      });

      const lintResults = JSON.parse(lintOutput);

      for (const file of lintResults) {
        for (const message of file.messages) {
          result.issues.push({
            type: message.severity === 2 ? 'error' : 'warning',
            message: message.message,
            file: relative(this.config.projectRoot, file.filePath),
            line: message.line
          });
        }
      }
    } catch (error) {
      // Handle case where linting fails
      console.warn('⚠️ Linting analysis failed, continuing with other checks...');
    }

    // Calculate metrics
    result.complexity = this.calculateComplexity();
    result.maintainability = this.calculateMaintainability(result.issues.length);
    result.suggestions = this.generateSuggestions(result);

    return result;
  }

  private calculateComplexity(): number {
    // Simplified complexity calculation based on project structure
    const totalComponents = Array.from(this.projectStructure.values())
      .reduce((total, components) => total + components.length, 0);

    // Higher component count = higher complexity, but cap at reasonable level
    return Math.min(Math.floor(totalComponents * 0.5), 100);
  }

  private calculateMaintainability(issuesCount: number): number {
    // Simple maintainability score based on issues
    const baseScore = 100;
    const penalty = Math.min(issuesCount * 0.5, 50);
    return Math.max(baseScore - penalty, 0);
  }

  private generateSuggestions(analysis: CodeAnalysisResult): string[] {
    const suggestions: string[] = [];

    if (analysis.issues.length > 50) {
      suggestions.push('Consider running automated cleanup scripts to reduce technical debt');
    }

    if (analysis.complexity > 70) {
      suggestions.push('Project complexity is high - consider refactoring into smaller, more focused components');
    }

    if (analysis.maintainability < 80) {
      suggestions.push('Maintainability could be improved by addressing linting issues and improving code organization');
    }

    const errorCount = analysis.issues.filter(i => i.type === 'error').length;
    if (errorCount > 0) {
      suggestions.push(`Fix ${errorCount} critical errors to improve code stability`);
    }

    return suggestions;
  }

  // 🔧 Intelligent Refactoring
  async suggestRefactoring(filePath: string): Promise<string[]> {
    console.log(`🔧 Analyzing ${filePath} for refactoring opportunities...`);

    if (!existsSync(filePath)) {
      return ['File does not exist'];
    }

    const content = readFileSync(filePath, 'utf-8');
    const suggestions: string[] = [];

    // Check for long files
    const lineCount = content.split('\n').length;
    if (lineCount > 200) {
      suggestions.push(`File is ${lineCount} lines long - consider splitting into smaller modules`);
    }

    // Check for duplicate code patterns
    if (content.includes('useState') && content.split('useState').length > 5) {
      suggestions.push('Multiple useState calls detected - consider using useReducer for complex state');
    }

    // Check for inline styles
    if (content.includes('style={{')) {
      suggestions.push('Inline styles detected - consider moving to CSS modules or styled-components');
    }

    // Check for large components
    const componentMatches = content.match(/export const \w+.*?=/g);
    if (componentMatches && componentMatches.length > 3) {
      suggestions.push('Multiple components in one file - consider splitting into separate files');
    }

    // Check for TODO/FIXME comments
    const todoCount = (content.match(/(TODO|FIXME|XXX)/gi) || []).length;
    if (todoCount > 0) {
      suggestions.push(`Found ${todoCount} TODO/FIXME comments - consider addressing these technical debt items`);
    }

    return suggestions.length > 0 ? suggestions : ['No major refactoring suggestions found'];
  }

  // 🚀 Development Workflow Automation
  async runDevelopmentWorkflow(workflow: string): Promise<void> {
    console.log(`🚀 Running ${workflow} workflow...`);

    switch (workflow) {
      case 'quality-check':
        await this.runQualityCheck();
        break;
      case 'component-audit':
        await this.runComponentAudit();
        break;
      case 'dependency-check':
        await this.runDependencyCheck();
        break;
      case 'performance-audit':
        await this.runPerformanceAudit();
        break;
      default:
        console.log('❌ Unknown workflow:', workflow);
    }
  }

  private async runQualityCheck(): Promise<void> {
    console.log('🧹 Running quality checks...');

    const analysis = await this.analyzeCodeQuality();

    console.log('\n📊 Quality Report:');
    console.log(`  Complexity: ${analysis.complexity}/100`);
    console.log(`  Maintainability: ${analysis.maintainability}/100`);
    console.log(`  Issues: ${analysis.issues.length}`);

    if (analysis.suggestions.length > 0) {
      console.log('\n💡 Suggestions:');
      analysis.suggestions.forEach(suggestion => {
        console.log(`  • ${suggestion}`);
      });
    }
  }

  private async runComponentAudit(): Promise<void> {
    console.log('🔍 Auditing component architecture...');

    for (const [type, components] of this.projectStructure) {
      console.log(`\n${this.capitalize(type)} Components (${components.length}):`);
      components.forEach(component => {
        console.log(`  • ${component}`);
      });
    }

    console.log('\n📋 Architecture Recommendations:');
    const atomicCount = this.projectStructure.get('atomic')?.length || 0;
    const molecularCount = this.projectStructure.get('molecular')?.length || 0;

    if (atomicCount < 5) {
      console.log('  • Consider creating more atomic components for better reusability');
    }

    if (molecularCount === 0 && atomicCount > 3) {
      console.log('  • Create molecular components to compose your atomic components');
    }
  }

  private async runDependencyCheck(): Promise<void> {
    console.log('📦 Checking dependencies...');

    try {
      const packageJson = JSON.parse(readFileSync('package.json', 'utf-8'));
      const depCount = Object.keys(packageJson.dependencies || {}).length;
      const devDepCount = Object.keys(packageJson.devDependencies || {}).length;

      console.log(`  Dependencies: ${depCount}`);
      console.log(`  Dev Dependencies: ${devDepCount}`);

      // Check for common issues
      if (depCount > 50) {
        console.log('  ⚠️ High dependency count - consider auditing for unused packages');
      }

      console.log('  ✅ Dependency check completed');
    } catch (error) {
      console.log('  ❌ Failed to analyze dependencies');
    }
  }

  private async runPerformanceAudit(): Promise<void> {
    console.log('⚡ Running performance audit...');

    // Check bundle size
    try {
      const buildDir = join(this.config.projectRoot, '.next');
      if (existsSync(buildDir)) {
        const buildSize = execSync(`du -sh ${buildDir}`, { encoding: 'utf-8' });
        console.log(`  Build size: ${buildSize.trim()}`);
      } else {
        console.log('  ℹ️ No build found - run "bun run build" first');
      }

      console.log('  ✅ Performance audit completed');
    } catch (error) {
      console.log('  ❌ Failed to analyze build size');
    }
  }

  // 🛠️ Utility Methods
  private generateTailwindClasses(request: ComponentGenerationRequest): string {
    const baseClasses = [
      'inline-flex',
      'items-center',
      'justify-center',
      'rounded-md',
      'font-medium',
      'transition-all',
      'duration-200',
      'ease-in-out'
    ];

    return baseClasses.join(' ');
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }
}

// 🎯 CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  const assistant = new AIDevAssistant();

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
🤖 AI Development Assistant - InternetFriends Portfolio

Usage: bun scripts/ai-dev-assistant.ts [command] [options]

Commands:
  generate <type> <name>     Generate a new component
  analyze                    Analyze code quality
  refactor <file>           Suggest refactoring for a file
  workflow <name>           Run development workflow

Component Types:
  atomic, molecular, organism, template

Workflows:
  quality-check, component-audit, dependency-check, performance-audit

Examples:
  bun scripts/ai-dev-assistant.ts generate atomic Button
  bun scripts/ai-dev-assistant.ts analyze
  bun scripts/ai-dev-assistant.ts refactor components/atomic/button/button.atomic.tsx
  bun scripts/ai-dev-assistant.ts workflow quality-check

Options:
  --help, -h               Show this help message
    `);
    return;
  }

  try {
    switch (command) {
      case 'generate':
        const type = args[1] as ComponentGenerationRequest['type'];
        const name = args[2];

        if (!type || !name) {
          console.log('❌ Usage: generate <type> <name>');
          return;
        }

        if (!['atomic', 'molecular', 'organism', 'template'].includes(type)) {
          console.log('❌ Invalid type. Use: atomic, molecular, organism, or template');
          return;
        }

        await assistant.generateComponent({
          name,
          type,
          description: `A ${type} component for the InternetFriends project`,
          features: [
            'Follows atomic design principles',
            'Includes TypeScript definitions',
            'Supports theming and variants',
            'Accessible by default'
          ]
        });
        break;

      case 'analyze':
        const analysis = await assistant.analyzeCodeQuality();
        console.log('\n📊 Code Quality Analysis Complete');
        break;

      case 'refactor':
        const filePath = args[1];
        if (!filePath) {
          console.log('❌ Usage: refactor <file-path>');
          return;
        }

        const suggestions = await assistant.suggestRefactoring(filePath);
        console.log('\n💡 Refactoring Suggestions:');
        suggestions.forEach(suggestion => {
          console.log(`  • ${suggestion}`);
        });
        break;

      case 'workflow':
        const workflowName = args[1];
        if (!workflowName) {
          console.log('❌ Usage: workflow <workflow-name>');
          return;
        }

        await assistant.runDevelopmentWorkflow(workflowName);
        break;

      default:
        console.log('❌ Unknown command. Use --help for usage information.');
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

if (import.meta.main) {
  main();
}
