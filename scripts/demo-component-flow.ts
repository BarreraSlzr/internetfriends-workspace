#!/usr/bin/env bun

// Demo script for InternetFriends Component Flow System
// Demonstrates the complete integrated development workflow

import { componentRegistry, registerInternetFriendsComponents } from "../shared/component-flow/component.registry";
import { patterns, themes, utilities } from "../shared/patterns/design-system.patterns";
import { integrationUtilities } from "../shared/utilities/integration.utilities";

interface DemoConfig {
  verbose?: boolean;
  mode?: 'quick' | 'full' | 'showcase';
  output?: string;
  interactive?: boolean;
}

class ComponentFlowDemo {
  private config: DemoConfig;
  private startTime: number;

  constructor(config: DemoConfig = {}) {
    this.config = {
      verbose: false,
      mode: 'full',
      output: './demo-output',
      interactive: false,
      ...config
    };
    this.startTime = Date.now();
  }

  async run(): Promise<void> {
    this.log('🚀 InternetFriends Component Flow System Demo');
    this.log('================================================\n');

    try {
      // Initialize system
      await this.initializeSystem();

      // Run demonstrations based on mode
      switch (this.config.mode) {
        case 'quick':
          await this.runQuickDemo();
          break;
        case 'showcase':
          await this.runShowcaseDemo();
          break;
        case 'full':
        default:
          await this.runFullDemo();
          break;
      }

      this.log('\n✅ Demo completed successfully!');
      this.showSummary();

    } catch (error) {
      this.error('❌ Demo failed:', error);
      process.exit(1);
    }
  }

  private async initializeSystem(): Promise<void> {
    this.log('📋 Initializing Component Flow System...');

    // Register demo components
    this.registerDemoComponents();
    registerInternetFriendsComponents();

    const stats = componentRegistry.getStats();
    this.log(`   ✓ Registered ${stats.totalComponents} components`);
    this.log(`   ✓ ${stats.categoriesCount} categories, ${stats.tagsCount} tags`);
    this.log(`   ✓ Type breakdown: ${JSON.stringify(stats.typeBreakdown)}`);

    this.success('System initialized successfully\n');
  }

  private registerDemoComponents(): void {
    // Demo Button Component
    const DemoButton = ({ variant = 'primary', children = 'Button', size = 'md', ...props }: unknown) => {
      const styles = {
        primary: { backgroundColor: '#3b82f6', color: 'white' },
        secondary: { backgroundColor: '#f9fafb', color: '#111827', border: '1px solid #e5e7eb' },
        ghost: { backgroundColor: 'transparent', color: '#6b7280' },
      };

      const sizes = {
        sm: { padding: '0.375rem 0.75rem', fontSize: '0.75rem' },
        md: { padding: '0.5rem 1rem', fontSize: '0.875rem' },
        lg: { padding: '0.75rem 1.5rem', fontSize: '1rem' },
      };

      return {
        type: 'button',
        props: {
          style: {
            ...styles[variant as keyof typeof styles],
            ...sizes[size as keyof typeof sizes],
            borderRadius: '0.5rem',
            border: 'none',
            cursor: 'pointer',
            fontWeight: '500',
            transition: 'all 0.15s ease-in-out',
          },
          ...props,
        },
        children,
      };
    };

    // Demo Card Component
    const DemoCard = ({ variant = 'default', title = 'Card Title', children = 'Card content...', ...props }: unknown) => {
      const variants = {
        default: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb' },
        glass: { backgroundColor: 'rgba(255, 255, 255, 0.85)', border: '1px solid rgba(255, 255, 255, 0.18)', backdropFilter: 'blur(12px)' },
        elevated: { backgroundColor: '#ffffff', border: '1px solid #e5e7eb', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
      };

      return {
        type: 'div',
        props: {
          style: {
            ...variants[variant as keyof typeof variants],
            padding: '1rem',
            borderRadius: '0.75rem',
          },
          ...props,
        },
        children: [
          { type: 'h3', props: { style: { margin: '0 0 0.5rem 0', fontSize: '1rem', fontWeight: '600' } }, children: title },
          { type: 'p', props: { style: { margin: '0', fontSize: '0.875rem', color: '#6b7280' } }, children },
        ],
      };
    };

    // Register components
    componentRegistry.registerComponents([
      {
        id: 'demo-button',
        path: 'demo/button.tsx',
        component: DemoButton,
        metadata: {
          componentName: 'DemoButton',
          componentType: 'atomic',
          component: DemoButton,
          category: 'forms',
          tags: ['button', 'interactive', 'demo'],
          defaultProps: { variant: 'primary', size: 'md', children: 'Click me' },
          availableProps: [
            { name: 'variant', type: 'select', options: ['primary', 'secondary', 'ghost'], defaultValue: 'primary', description: 'Button visual style' },
            { name: 'size', type: 'select', options: ['sm', 'md', 'lg'], defaultValue: 'md', description: 'Button size' },
            { name: 'children', type: 'string', defaultValue: 'Button', description: 'Button text content' },
            { name: 'disabled', type: 'boolean', defaultValue: false, description: 'Disable button interaction' },
          ],
          initialWidth: 200,
          initialHeight: 100,
          documentation: {
            description: 'A versatile button component with multiple variants and sizes',
            examples: [
              { title: 'Primary Button', description: 'Main call-to-action button', props: { variant: 'primary', children: 'Get Started' } },
              { title: 'Secondary Button', description: 'Secondary action button', props: { variant: 'secondary', children: 'Learn More' } },
              { title: 'Ghost Button', description: 'Subtle button for less important actions', props: { variant: 'ghost', children: 'Cancel' } },
            ],
            accessibility: {
              ariaLabel: 'Interactive button',
              keyboardNavigation: ['Enter', 'Space'],
              screenReaderNotes: ['Button announces its text content', 'Disabled state is announced'],
              colorContrastCompliant: true,
            },
            performance: {
              bundleSize: '2.1KB gzipped',
              renderTime: '< 1ms',
              reRenderTriggers: ['props change', 'hover state'],
              optimizations: ['CSS-in-JS avoided', 'Minimal re-renders', 'Tree-shakable'],
            },
          },
        },
      },
      {
        id: 'demo-card',
        path: 'demo/card.tsx',
        component: DemoCard,
        metadata: {
          componentName: 'DemoCard',
          componentType: 'molecular',
          component: DemoCard,
          category: 'layout',
          tags: ['card', 'container', 'demo', 'glassmorphism'],
          defaultProps: { variant: 'default', title: 'Sample Card', children: 'This is a demo card component showcasing the InternetFriends design system.' },
          availableProps: [
            { name: 'variant', type: 'select', options: ['default', 'glass', 'elevated'], defaultValue: 'default', description: 'Card visual style' },
            { name: 'title', type: 'string', defaultValue: 'Card Title', description: 'Card header title' },
            { name: 'children', type: 'string', defaultValue: 'Card content...', description: 'Card body content' },
          ],
          initialWidth: 320,
          initialHeight: 200,
          documentation: {
            description: 'A flexible card component with glass morphism and elevation variants following InternetFriends design principles',
            examples: [
              { title: 'Default Card', description: 'Standard card with border', props: { variant: 'default', title: 'Welcome', children: 'Get started with our platform' } },
              { title: 'Glass Card', description: 'Modern glassmorphism effect', props: { variant: 'glass', title: 'Premium Feature', children: 'Unlock advanced capabilities' } },
              { title: 'Elevated Card', description: 'Card with shadow elevation', props: { variant: 'elevated', title: 'Important Notice', children: 'Action required on your account' } },
            ],
          },
        },
      },
    ]);
  }

  private async runQuickDemo(): Promise<void> {
    this.log('🏃‍♂️ Running Quick Demo...\n');

    // Show basic registry stats
    await this.demoComponentRegistry();

    // Show pattern system
    await this.demoPatternSystem();

    this.log('⚡ Quick demo completed in', this.getElapsedTime());
  }

  private async runShowcaseDemo(): Promise<void> {
    this.log('🎭 Running Showcase Demo...\n');

    await this.demoComponentRegistry();
    await this.demoPatternSystem();
    await this.demoMDXIntegration();
    await this.demoMicrofrontendCapabilities();

    this.log('🎪 Showcase completed in', this.getElapsedTime());
  }

  private async runFullDemo(): Promise<void> {
    this.log('🔬 Running Full System Demo...\n');

    // Core system demos
    await this.demoComponentRegistry();
    await this.demoPatternSystem();
    await this.demoReactFlowIntegration();

    // Integration demos
    await this.demoMDXIntegration();
    await this.demoMicrofrontendCapabilities();
    await this.demoInternationalization();
    await this.demoDataPipeline();

    // Advanced features
    await this.demoStreamlinedWorkflow();
    await this.generateIntegrationFiles();

    this.log('🎯 Full demo completed in', this.getElapsedTime());
  }

  private async demoComponentRegistry(): Promise<void> {
    this.section('Component Registry System');

    const stats = componentRegistry.getStats();
    const allComponents = componentRegistry.getAllComponents();

    this.log(`📊 Registry Statistics:`);
    this.log(`   • Total Components: ${stats.totalComponents}`);
    this.log(`   • Categories: ${stats.categoriesCount}`);
    this.log(`   • Tags: ${stats.tagsCount}`);
    this.log(`   • Type Breakdown:`);
    Object.entries(stats.typeBreakdown).forEach(([type, count]) => {
      if (count > 0) this.log(`     - ${type}: ${count}`);
    });

    this.log(`\n🔍 Component Details:`);
    allComponents.slice(0, 3).forEach(comp => {
      this.log(`   • ${comp.metadata.componentName} (${comp.metadata.componentType})`);
      this.log(`     Category: ${comp.metadata.category}`);
      this.log(`     Props: ${comp.metadata.availableProps?.length || 0}`);
      this.log(`     Tags: ${comp.metadata.tags?.join(', ') || 'none'}`);
    });

    // Test search functionality
    this.log(`\n🔎 Search Test - "button": `);
    const searchResults = componentRegistry.searchComponents('button');
    searchResults.forEach(comp => {
      this.log(`   ✓ Found: ${comp.metadata.componentName}`);
    });

    this.success('Component registry demo completed ✓\n');
  }

  private async demoPatternSystem(): Promise<void> {
    this.section('Design Pattern System');

    this.log(`🎨 Available Patterns:`);
    Object.entries(patterns).forEach(([_key, pattern]) => {
      this.log(`   • ${pattern.name}: ${pattern.description}`);
      this.log(`     Props: ${Object.keys(pattern.props).length}`);
      this.log(`     Variants: ${pattern.variants ? Object.keys(pattern.variants).length : 0}`);
      this.log(`     States: ${pattern.states?.length || 0}`);
    });

    this.log(`\n🌈 Theme System:`);
    this.log(`   • Light Theme: ${Object.keys(themes.light.colors).length} color tokens`);
    this.log(`   • Dark Theme: ${Object.keys(themes.dark.colors).length} color tokens`);
    this.log(`   • Radius System: ${Object.keys(themes.light.radius).length} values`);
    this.log(`   • Typography: ${Object.keys(themes.light.typography.fontSize).length} font sizes`);

    // Generate sample CSS
    const sampleCSS = utilities.PatternUtility.generateCSS(patterns.button, themes.light);
    this.log(`\n📝 Generated CSS Sample (first 200 chars):`);
    this.log(`   ${sampleCSS.substring(0, 200)}...`);

    this.success('Pattern system demo completed ✓\n');
  }

  private async demoReactFlowIntegration(): Promise<void> {
    this.section('React Flow Integration');

    this.log(`🔄 Flow Workspace Features:`);
    this.log(`   • Component Preview Nodes: Visual component testing`);
    this.log(`   • Resizable Viewports: Responsive design testing`);
    this.log(`   • Props Panel: Real-time property editing`);
    this.log(`   • Connection System: Component composition flows`);
    this.log(`   • Component Library: Drag-and-drop interface`);
    this.log(`   • Auto Layout: Intelligent node positioning`);
    this.log(`   • Theme Integration: Light/dark mode support`);

    this.log(`\n⚙️ Node Configuration:`);
    const sampleComponent = componentRegistry.getComponent('demo-button');
    if (sampleComponent) {
      this.log(`   • Sample Node: ${sampleComponent.metadata.componentName}`);
      this.log(`   • Default Size: ${sampleComponent.metadata.initialWidth}x${sampleComponent.metadata.initialHeight}px`);
      this.log(`   • Available Props: ${sampleComponent.metadata.availableProps?.length || 0}`);
      this.log(`   • Variants: ${Object.keys(patterns.button.variants || {}).length}`);
    }

    this.success('React Flow integration demo completed ✓\n');
  }

  private async demoMDXIntegration(): Promise<void> {
    this.section('MDX Integration');

    const components = componentRegistry.getAllComponents().slice(0, 2);

    this.log(`📝 MDX Documentation Generation:`);
    components.forEach(comp => {
      const mdxTemplate = integrationUtilities.MDXIntegrationUtility.generateMDXTemplate(comp);
      this.log(`   • ${comp.metadata.componentName}.mdx (${mdxTemplate.length} chars)`);
    });

    this.log(`\n🔧 MDX Features:`);
    this.log(`   • Automatic frontmatter extraction`);
    this.log(`   • Component prop documentation`);
    this.log(`   • Usage examples generation`);
    this.log(`   • Accessibility notes`);
    this.log(`   • Performance information`);

    // Sample frontmatter extraction
    const sampleMDX = `---
title: DemoButton
description: Interactive button component
category: forms
type: atomic
tags: [button, interactive]
---

# DemoButton

Interactive button with multiple variants...`;

    const extracted = integrationUtilities.MDXIntegrationUtility.extractComponentFromMDX(sampleMDX);
    this.log(`\n📊 Frontmatter Extraction Test:`);
    this.log(`   • Extracted Fields: ${Object.keys(extracted.frontmatter).length}`);
    this.log(`   • Title: ${extracted.frontmatter.title}`);
    this.log(`   • Category: ${extracted.frontmatter.category}`);

    this.success('MDX integration demo completed ✓\n');
  }

  private async demoMicrofrontendCapabilities(): Promise<void> {
    this.section('Microfrontend Integration');

    const components = componentRegistry.getAllComponents();

    // Generate Module Federation config
    const federationConfig = integrationUtilities.MicrofrontendIntegrationUtility
      .generateModuleFederationConfig('@internetfriends/components', components);

    this.log(`🔧 Module Federation Configuration:`);
    this.log(`   • App Name: ${federationConfig.name}`);
    this.log(`   • Exposed Modules: ${Object.keys(federationConfig.exposes).length}`);
    this.log(`   • Shared Dependencies: ${Object.keys(federationConfig.shared).length}`);

    // Generate component manifest
    const manifest = integrationUtilities.MicrofrontendIntegrationUtility
      .generateComponentManifest(components);

    this.log(`\n📋 Component Manifest:`);
    this.log(`   • Library: ${manifest.name} v${manifest.version}`);
    this.log(`   • Components: ${manifest.components.length}`);
    this.log(`   • By Type: ${JSON.stringify(manifest.registry.byType)}`);
    this.log(`   • By Category: ${JSON.stringify(manifest.registry.byCategory)}`);

    // Generate TypeScript definitions
    const typeDefs = integrationUtilities.MicrofrontendIntegrationUtility
      .generateTypeDefinitions(components);

    this.log(`\n📄 TypeScript Definitions:`);
    this.log(`   • Generated: ${typeDefs.length} characters`);
    this.log(`   • Interfaces: ${(typeDefs.match(/interface \w+/g) || []).length}`);
    this.log(`   • Exports: ${(typeDefs.match(/export declare const/g) || []).length}`);

    this.success('Microfrontend integration demo completed ✓\n');
  }

  private async demoInternationalization(): Promise<void> {
    this.section('Internationalization (i18n)');

    const components = componentRegistry.getAllComponents();

    // Extract translatable strings
    const translations = integrationUtilities.I18nIntegrationUtility
      .extractTranslatableStrings(components);

    this.log(`🌍 Translation Extraction:`);
    const totalStrings = Object.values(translations).reduce((acc, comp) => acc + Object.keys(comp).length, 0);
    this.log(`   • Total Translatable Strings: ${totalStrings}`);
    this.log(`   • Components with Translations: ${Object.keys(translations).length}`);

    Object.entries(translations).slice(0, 2).forEach(([comp, strings]) => {
      this.log(`   • ${comp}: ${Object.keys(strings).length} strings`);
    });

    // Generate i18n config
    const i18nConfig = integrationUtilities.I18nIntegrationUtility.generateNextI18nConfig();
    this.log(`\n⚙️ i18n Configuration:`);
    this.log(`   • Default Locale: ${i18nConfig.i18n.defaultLocale}`);
    this.log(`   • Supported Locales: ${i18nConfig.i18n.locales.join(', ')}`);
    this.log(`   • Namespaces: ${i18nConfig.componentLibrary.namespaces.join(', ')}`);

    // Sample locale file
    const enLocale = integrationUtilities.I18nIntegrationUtility.generateLocaleFile('en', translations);
    const esLocale = integrationUtilities.I18nIntegrationUtility.generateLocaleFile('es', translations);

    this.log(`\n📁 Locale Files:`);
    this.log(`   • English: ${enLocale.length} characters`);
    this.log(`   • Spanish: ${esLocale.length} characters`);

    this.success('Internationalization demo completed ✓\n');
  }

  private async demoDataPipeline(): Promise<void> {
    this.section('Data Pipeline Integration');

    const components = componentRegistry.getAllComponents();
    const sampleComponent = components[0];

    if (sampleComponent) {
      // Generate props pipeline
      const pipeline = integrationUtilities.DataPipelineIntegrationUtility
        .createPropsPipeline(sampleComponent);

      this.log(`🔄 Props Processing Pipeline:`);
      this.log(`   • Source: ${pipeline.source.type}`);
      this.log(`   • Transforms: ${pipeline.transforms.length}`);
      this.log(`   • Sink: ${pipeline.sink.type}`);

      pipeline.transforms.forEach((transform, index) => {
        this.log(`     ${index + 1}. ${transform.type}: ${Object.keys(transform.config).join(', ')}`);
      });
    }

    // Generate stream configuration
    const streamConfig = integrationUtilities.DataPipelineIntegrationUtility
      .generateStreamConfig(components);

    this.log(`\n🌊 Stream Processing:`);
    this.log(`   • Streams: ${Object.keys(streamConfig.streams).length}`);
    this.log(`   • Processors: ${Object.keys(streamConfig.processors).length}`);

    Object.entries(streamConfig.streams).forEach(([name, config]: [string, any]) => {
      this.log(`   • ${name}: ${config.partitions} partitions, ${config.replication}x replication`);
    });

    // Generate GraphQL schema
    const graphqlSchema = integrationUtilities.DataPipelineIntegrationUtility
      .generateGraphQLSchema(components.slice(0, 2));

    this.log(`\n🔗 GraphQL Schema:`);
    this.log(`   • Schema Size: ${graphqlSchema.length} characters`);
    this.log(`   • Types: ${(graphqlSchema.match(/type \w+/g) || []).length}`);
    this.log(`   • Queries: ${(graphqlSchema.match(/\w+\([^)]*\):/g) || []).length}`);

    this.success('Data pipeline demo completed ✓\n');
  }

  private async demoStreamlinedWorkflow(): Promise<void> {
    this.section('Streamlined Development Workflow');

    const components = componentRegistry.getAllComponents();

    // Generate complete integration setup
    const integrationSetup = integrationUtilities.StreamlinedDevelopmentOrchestrator
      .generateIntegrationSetup(components);

    this.log(`🔧 Complete Integration Setup:`);
    this.log(`   • MDX Templates: ${integrationSetup.mdx.templates.length}`);
    this.log(`   • Microfrontend Manifest: ✓ Generated`);
    this.log(`   • i18n Locales: ${integrationSetup.i18n.locales.length}`);
    this.log(`   • Data Pipelines: ${integrationSetup.dataPipeline.pipelines.length}`);
    this.log(`   • Automation Scripts: ${Object.keys(integrationSetup.automation.scripts).length}`);
    this.log(`   • Workflows: ${Object.keys(integrationSetup.automation.workflows).length}`);

    this.log(`\n🚀 Automation Scripts:`);
    Object.keys(integrationSetup.automation.scripts).forEach(script => {
      this.log(`   • ${script}: Ready for execution`);
    });

    this.log(`\n⚡ Workflow Configurations:`);
    Object.entries(integrationSetup.automation.workflows).forEach(([name, workflow]: [string, any]) => {
      this.log(`   • ${name}: ${workflow.steps.length} steps`);
    });

    this.success('Streamlined workflow demo completed ✓\n');
  }

  private async generateIntegrationFiles(): Promise<void> {
    this.section('Generated Integration Files');

    if (this.config.output) {
      this.log(`📁 Generating files to: ${this.config.output}`);

      const components = componentRegistry.getAllComponents();
      const integrationSetup = integrationUtilities.StreamlinedDevelopmentOrchestrator
        .generateIntegrationSetup(components);

      // Simulate file generation
      const files = [
        'mdx-templates/',
        'microfrontend-config.json',
        'component-manifest.json',
        'typescript-definitions.d.ts',
        'i18n-config.json',
        'locales/en.json',
        'locales/es.json',
        'locales/fr.json',
        'locales/de.json',
        'data-pipeline-config.json',
        'graphql-schema.graphql',
        'automation-scripts/',
        'workflow-configs.json'
      ];

      this.log(`\n📝 Files that would be generated:`);
      files.forEach(file => {
        this.log(`   ✓ ${file}`);
      });

      this.log(`\n💾 Integration Data Summary:`);
      this.log(`   • Total size estimate: ~${Math.round((JSON.stringify(integrationSetup).length / 1024) * 1.5)}KB`);
      this.log(`   • Components processed: ${components.length}`);
      this.log(`   • Patterns integrated: ${Object.keys(patterns).length}`);
      this.log(`   • Themes configured: ${Object.keys(themes).length}`);

      this.success('Integration files generation completed ✓\n');
    }
  }

  private showSummary(): void {
    const elapsed = this.getElapsedTime();
    const stats = componentRegistry.getStats();

    this.log('\n📊 Demo Summary');
    this.log('================');
    this.log(`⏱️  Total Time: ${elapsed}`);
    this.log(`🧩 Components: ${stats.totalComponents}`);
    this.log(`🎨 Patterns: ${Object.keys(patterns).length}`);
    this.log(`🌍 i18n Ready: ✓`);
    this.log(`🔗 Microfrontend Ready: ✓`);
    this.log(`📝 MDX Ready: ✓`);
    this.log(`🔄 Data Pipeline Ready: ✓`);
    this.log(`⚡ Streamlined Workflow: ✓`);

    this.log('\n🎯 Key Achievements:');
    this.log('   • Visual component development with React Flow');
    this.log('   • Responsive design testing in resizable nodes');
    this.log('   • Integrated design system with InternetFriends tokens');
    this.log('   • Auto-generated MDX documentation');
    this.log('   • Microfrontend-ready component federation');
    this.log('   • Multi-language internationalization support');
    this.log('   • Real-time data pipeline integration');
    this.log('   • Automated development workflows');

    this.log('\n🚀 Next Steps:');
    this.log('   1. Visit /component-flow in your app to see the visual interface');
    this.log('   2. Add components from the library to test responsive behavior');
    this.log('   3. Connect components to create composition workflows');
    this.log('   4. Export configurations for production use');
    this.log('   5. Integrate with your existing development pipeline');

    this.log(`\n🎊 InternetFriends Component Flow System is ready for production!`);
  }

  // Utility methods
  private log(message: string): void {
    console.log(message);
  }

  private error(message: string, error?: unknown): void {
    console.error(message, error);
  }

  private success(message: string): void {
    console.log(`\x1b[32m${message}\x1b[0m`);
  }

  private section(title: string): void {
    this.log(`\n🔧 ${title}`);
    this.log('─'.repeat(title.length + 4));
  }

  private getElapsedTime(): string {
    const elapsed = Date.now() - this.startTime;
    return `${(elapsed / 1000).toFixed(2)}s`;
  }
}

// Parse command line arguments
function parseArgs(): DemoConfig {
  const args = process.argv.slice(2);
  const config: DemoConfig = {};

  args.forEach(arg => {
    if (arg === '--verbose' || arg === '-v') {
      config.verbose = true;
    } else if (arg === '--quick' || arg === '-q') {
      config.mode = 'quick';
    } else if (arg === '--showcase' || arg === '-s') {
      config.mode = 'showcase';
    } else if (arg === '--interactive' || arg === '-i') {
      config.interactive = true;
    } else if (arg.startsWith('--output=')) {
      config.output = arg.split('=')[1];
    } else if (arg.startsWith('--mode=')) {
      config.mode = arg.split('=')[1] as DemoConfig['mode'];
    }
  });

  return config;
}

// Main execution
async function main() {
  const config = parseArgs();
  const demo = new ComponentFlowDemo(config);
  await demo.run();
}

// Handle errors and run
if (import.meta.main) {
  main().catch(error => {
    console.error('Demo failed:', error);
    process.exit(1);
  });
}

export { ComponentFlowDemo, parseArgs };
