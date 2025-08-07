// Integration Utilities - InternetFriends Streamlined Development
// Central utilities for MDX, microfrontends, i18n, and data pipeline integration

import { ComponentType } from "react";
import { ComponentRegistryEntry, ComponentPreviewNodeData } from "../component-flow/types";
import { patterns, utilities } from "../patterns/design-system.patterns";

// MDX Integration Utilities
export class MDXIntegrationUtility {
  // Extract component metadata from MDX frontmatter
  static extractComponentFromMDX(mdxContent: string): {
    frontmatter: Record<string, any>;
    component: ComponentType<any> | null;
    exports: string[];
  } {
    const frontmatterMatch = mdxContent.match(/^---\n([\s\S]*?)\n---/);
    const frontmatter = frontmatterMatch ? this.parseFrontmatter(frontmatterMatch[1]) : {};

    // Extract component exports
    const exportMatches = mdxContent.match(/export\s+(?:default\s+)?(?:function|const|class)\s+(\w+)/g) || [];
    const exports = exportMatches.map(match => {
      const nameMatch = match.match(/(\w+)$/);
      return nameMatch ? nameMatch[1] : '';
    }).filter(Boolean);

    // Try to extract default component
    const defaultExportMatch = mdxContent.match(/export\s+default\s+(\w+)/);
    const componentName = defaultExportMatch ? defaultExportMatch[1] : exports[0];

    return {
      frontmatter,
      component: null, // Would need actual module resolution in runtime
      exports,
    };
  }

  // Parse YAML-like frontmatter
  private static parseFrontmatter(yamlContent: string): Record<string, any> {
    const result: Record<string, any> = {};
    const lines = yamlContent.split('\n').filter(line => line.trim());

    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > -1) {
        const key = line.slice(0, colonIndex).trim();
        let value: unknown = line.slice(colonIndex + 1).trim();

        // Remove quotes
        if ((value.startsWith('"') && value.endsWith('"')) ||
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }

        // Parse arrays
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value.slice(1, -1).split(',').map((v: string) => v.trim().replace(/['"`]/g, ''));
        }

        // Parse booleans
        if (value === 'true') value = true;
        if (value === 'false') value = false;

        // Parse numbers
        if (!isNaN(Number(value)) && value !== '') {
          value = Number(value);
        }

        result[key] = value;
      }
    });

    return result;
  }

  // Generate MDX component template
  static generateMDXTemplate(componentEntry: ComponentRegistryEntry): string {
    const { metadata } = componentEntry;
    const propsDoc = metadata.availableProps?.map(prop =>
      `- **${prop.name}** (${prop.type}): ${prop.description || 'No description'} ${prop.required ? '*(required)*' : ''}`
    ).join('\n') || 'No props documented';

    const examplesDoc = metadata.documentation?.examples?.map(example => `
### ${example.title}

${example.description ? `${example.description}\n` : ''}

\`\`\`jsx
<${metadata.componentName} ${Object.entries(example.props).map(([key, value]) =>
  `${key}= "${value}"`
).join(' ')} />
\`\`\`
`).join('\n') || 'No examples available';

    return `---
title: ${metadata.componentName}
description: ${metadata.documentation?.description || 'Component documentation'}
category: ${metadata.category || 'general'}
type: ${metadata.componentType}
tags: [${(metadata.tags || []).join(', ')}]
version: ${metadata.version || '1.0.0'}
---

import { ${metadata.componentName} } from "../components/${metadata.componentType}";
# ${metadata.componentName}

${metadata.documentation?.description || 'Component description not available'}

## Props

${propsDoc}

## Examples

${examplesDoc}

## Usage

\`\`\`jsx
import { ${metadata.componentName} } from "@internetfriends/components";

  return (
    <${metadata.componentName}
      ${metadata.defaultProps ? Object.entries(metadata.defaultProps).map(([key, value]) =>
        `${key}= "${value}"`
      ).join('\n      ') : '// Add props here'}
    >
      {/* Content */}
    </${metadata.componentName}>
  );
}
\`\`\`

## Accessibility

${metadata.documentation?.accessibility ? Object.entries(metadata.documentation.accessibility).map(([key, value]) =>
  `- **${key}**: ${Array.isArray(value) ? value.join(', ') : value}`
).join('\n') : 'No specific accessibility requirements documented'}

## Performance

${metadata.documentation?.performance ? Object.entries(metadata.documentation.performance).map(([key, value]) =>
  `- **${key}**: ${Array.isArray(value) ? value.join(', ') : value}`
).join('\n') : 'No specific performance notes'}
`;
  }

  // Convert MDX to component preview data
  static mdxToPreviewData(mdxContent: string, component: ComponentType<any>): ComponentPreviewNodeData {
    const { frontmatter } = this.extractComponentFromMDX(mdxContent);

    return {
      componentName: frontmatter.title || 'MDXComponent',
      componentType: frontmatter.type || 'molecular',
      component,
      category: frontmatter.category || 'mdx',
      tags: frontmatter.tags || ['mdx'],
      version: frontmatter.version || '1.0.0',
      documentation: {
        description: frontmatter.description || 'MDX component',
      },
      defaultProps: frontmatter.defaultProps || {},
      theme: frontmatter.theme || 'system',
      locale: frontmatter.locale || 'en',
    };
  }
}

// Microfrontend Integration Utilities
export class MicrofrontendIntegrationUtility {
  // Generate Module Federation configuration
  static generateModuleFederationConfig(appName: string, components: ComponentRegistryEntry[]): any {
    const exposes = components.reduce((acc, comp) => {
      acc[`./${comp.metadata.componentName}`] = comp.path;
      return acc;
    }, {} as Record<string, string>);

    return {
      name: appName,
      filename: 'remoteEntry.js',
      exposes,
      shared: {
        'react': {
          singleton: true,
          requiredVersion: '^18.0.0 || ^19.0.0',
          eager: true
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.0.0 || ^19.0.0',
          eager: true
        },
        'reactflow': {
          singleton: true,
          requiredVersion: '^11.0.0'
        }
      },
    };
  }

  // Generate component manifest for remote consumption
  static generateComponentManifest(components: ComponentRegistryEntry[]): any {
    return {
      name: '@internetfriends/component-library',
      version: '1.0.0',
      description: 'InternetFriends Component Library - Microfrontend Ready',
      components: components.map(comp => ({
        name: comp.metadata.componentName,
        id: comp.id,
        type: comp.metadata.componentType,
        category: comp.metadata.category,
        props: comp.metadata.availableProps?.map(prop => ({
          name: prop.name,
          type: prop.type,
          required: prop.required,
          default: prop.defaultValue,
        })) || [],
        tags: comp.metadata.tags || [],
        version: comp.metadata.version || '1.0.0',
      })),
      registry: {
        totalComponents: components.length,
        byType: this.groupComponentsByType(components),
        byCategory: this.groupComponentsByCategory(components),
      },
      federation: {
        remoteEntry: './remoteEntry.js',
        scope: 'internetfriends_components',
      },
    };
  }

  private static groupComponentsByType(components: ComponentRegistryEntry[]): Record<string, number> {
    return components.reduce((acc, comp) => {
      const type = comp.metadata.componentType;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private static groupComponentsByCategory(components: ComponentRegistryEntry[]): Record<string, number> {
    return components.reduce((acc, comp) => {
      const category = comp.metadata.category || 'general';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  // Generate TypeScript definitions for remote components
  static generateTypeDefinitions(components: ComponentRegistryEntry[]): string {
    const imports = components.map(comp =>
      `import { ${comp.metadata.componentName} } from "./${comp.metadata.componentName}";`
    ).join('\n');

    const exports = components.map(comp => {
      const propsInterface = comp.metadata.availableProps?.length
        ? `interface ${comp.metadata.componentName}Props {
${comp.metadata.availableProps.map(prop =>
  `  ${prop.name}${prop.required ? '' : '?'}: ${this.mapPropTypeToTS(prop.type)};`
).join('\n')}
}`
        : `interface ${comp.metadata.componentName}Props extends React.ComponentProps<'div'> {}`;

      return `${propsInterface}

export declare const ${comp.metadata.componentName}: React.FC<${comp.metadata.componentName}Props>;`;
    }).join('\n\n');

    return `// Generated TypeScript definitions for InternetFriends Component Library
// This file is auto-generated. Do not edit manually.

import React from "react";

${imports}

${exports}

// Component registry types
export interface ComponentManifest {
  name: string;
  id: string;
  type: 'atomic' | 'molecular' | 'organism' | 'template' | 'page';
  category: string;
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    default?: unknown;
  }>;
  tags: string[];
  version: string;
}

export interface LibraryManifest {
  name: string;
  version: string;
  description: string;
  components: ComponentManifest[];
  registry: {
    totalComponents: number;
    byType: Record<string, number>;
    byCategory: Record<string, number>;
  };
  federation: {
    remoteEntry: string;
    scope: string;
  };
}

// Re-export all components
export {
  ${components.map(comp => comp.metadata.componentName).join(',\n  ')}
};
`;
  }

  private static mapPropTypeToTS(propType: string): string {
    switch (propType) {
      case 'string': return 'string';
      case 'number': return 'number';
      case 'boolean': return 'boolean';
      case 'array': return 'any[]';
      case 'object': return 'Record<string, any>';
      case 'function': return '(...args: unknown[]) => any';
      case 'select': return 'string';
      default: return 'any';
    }
  }
}

// Internationalization Integration Utilities
export class I18nIntegrationUtility {
  // Extract translatable strings from component metadata
  static extractTranslatableStrings(components: ComponentRegistryEntry[]): Record<string, Record<string, string>> {
    const translations: Record<string, Record<string, string>> = {};

    components.forEach(comp => {
      const componentKey = comp.metadata.componentName.toLowerCase();
      translations[componentKey] = {};

      // Extract from default props
      if (comp.metadata.defaultProps) {
        Object.entries(comp.metadata.defaultProps).forEach(([key, value]) => {
          if (typeof value === 'string' && this.isTranslatable(value)) {
            translations[componentKey][`${componentKey}.${key}`] = value;
          }
        });
      }

      // Extract from documentation
      if (comp.metadata.documentation?.description) {
        translations[componentKey][`${componentKey}.description`] = comp.metadata.documentation.description;
      }

      // Extract from examples
      comp.metadata.documentation?.examples?.forEach((example, index) => {
        if (example.title) {
          translations[componentKey][`${componentKey}.example.${index}.title`] = example.title;
        }
        if (example.description) {
          translations[componentKey][`${componentKey}.example.${index}.description`] = example.description;
        }
      });

      // Extract from prop descriptions
      comp.metadata.availableProps?.forEach(prop => {
        if (prop.description) {
          translations[componentKey][`${componentKey}.props.${prop.name}.description`] = prop.description;
        }
      });
    });

    return translations;
  }

  // Check if a string should be translated
  private static isTranslatable(value: string): boolean {
    // Skip if it's a CSS value, URL, or code
    if (value.match(/^(#|rgb|hsl|url\(|var\(|\d+px|\d+rem|\d+em|[a-z-]+:)/)) {
      return false;
    }

    // Skip single words that are likely property names or technical terms
    if (value.length < 3 || !value.includes(' ')) {
      return false;
    }

    return true;
  }

  // Generate i18n configuration for Next.js
  static generateNextI18nConfig(supportedLocales: string[] = ['en', 'es', 'fr', 'de']): any {
    return {
      i18n: {
        defaultLocale: 'en',
        locales: supportedLocales,
        localeDetection: true,
      },
      // Custom configuration for component library
      componentLibrary: {
        namespaces: ['components', 'common', 'patterns'],
        fallbackLng: 'en',
        supportInterpolation: true,
        loadPath: '/locales/{{lng}}/{{ns}}.json',
      },
    };
  }

  // Generate locale files
  static generateLocaleFile(locale: string, translations: Record<string, Record<string, string>>): string {
    const flatTranslations: Record<string, string> = {};

    Object.entries(translations).forEach(([_componentKey, componentTranslations]) => {
      Object.entries(componentTranslations).forEach(([key, value]) => {
        flatTranslations[key] = value;
      });
    });

    return JSON.stringify({
      components: flatTranslations,
      common: {
        loading: locale === 'en' ? 'Loading...' : 'Cargando...', // Example Spanish
        error: locale === 'en' ? 'Error' : 'Error',
        retry: locale === 'en' ? 'Retry' : 'Reintentar',
        close: locale === 'en' ? 'Close' : 'Cerrar',
      },
      patterns: {
        button: locale === 'en' ? 'Button' : 'Botón',
        input: locale === 'en' ? 'Input' : 'Entrada',
        card: locale === 'en' ? 'Card' : 'Tarjeta',
        modal: locale === 'en' ? 'Modal' : 'Modal',
      },
    }, null, 2);
  }
}

// Data Pipeline Integration Utilities
export class DataPipelineIntegrationUtility {
  // Create data transformation pipeline for component props
  static createPropsPipeline(component: ComponentRegistryEntry): any {
    return {
      source: {
        type: 'component_registry',
        component: component.id,
      },
      transforms: [
        {
          type: 'validate',
          config: {
            schema: this.generateValidationSchema(component.metadata.availableProps || []),
          },
        },
        {
          type: 'sanitize',
          config: {
            stripHtml: true,
            maxLength: 1000,
          },
        },
        {
          type: 'theme_aware',
          config: {
            applyTheme: true,
            respectUserPreference: true,
          },
        },
        {
          type: 'i18n',
          config: {
            extractTranslatable: true,
            defaultLocale: 'en',
          },
        },
      ],
      sink: {
        type: 'component_renderer',
        format: 'react_element',
      },
    };
  }

  private static generateValidationSchema(props: Record<string, unknown>[]): any {
    return props.reduce((schema, prop) => {
      schema[prop.name] = {
        type: prop.type,
        required: prop.required || false,
        default: prop.defaultValue,
        validation: prop.validation || [],
      };
      return schema;
    }, {});
  }

  // Generate stream processing configuration
  static generateStreamConfig(components: ComponentRegistryEntry[]): any {
    return {
      streams: {
        component_updates: {
          topic: 'component.updates',
          partitions: 3,
          replication: 2,
          config: {
            'cleanup.policy': 'compact',
            'retention.ms': '604800000', // 7 days
          },
        },
        user_interactions: {
          topic: 'user.interactions',
          partitions: 6,
          replication: 2,
          config: {
            'cleanup.policy': 'delete',
            'retention.ms': '86400000', // 1 day
          },
        },
        performance_metrics: {
          topic: 'performance.metrics',
          partitions: 3,
          replication: 2,
          config: {
            'cleanup.policy': 'delete',
            'retention.ms': '259200000', // 3 days
          },
        },
      },
      processors: {
        component_analytics: {
          input: ['user.interactions', 'performance.metrics'],
          output: 'component.analytics',
          processing: 'aggregate_by_component',
        },
        real_time_updates: {
          input: ['component.updates'],
          output: 'websocket.broadcast',
          processing: 'pass_through',
        },
      },
    };
  }

  // Generate GraphQL schema for component data
  static generateGraphQLSchema(components: ComponentRegistryEntry[]): string {
    const componentTypes = components.map(comp => {
      const propsType = comp.metadata.availableProps?.length
        ? `type ${comp.metadata.componentName}Props {
${comp.metadata.availableProps.map(prop =>
  `  ${prop.name}: ${this.mapPropTypeToGraphQL(prop.type)}`
).join('\n')}
}`
        : '';

      return `${propsType}

type ${comp.metadata.componentName}Component {
  id: ID!
  name: String!
  type: ComponentType!
  category: String
  tags: [String!]!
  version: String
  props: ${comp.metadata.availableProps?.length ? `${comp.metadata.componentName}Props` : 'JSON'}
  documentation: ComponentDocumentation
  metadata: ComponentMetadata
}`;
    }).join('\n\n');

    return `# GraphQL Schema for InternetFriends Component Library
scalar JSON
scalar DateTime

enum ComponentType {
  ATOMIC
  MOLECULAR
  ORGANISM
  TEMPLATE
  PAGE
}

type ComponentDocumentation {
  description: String
  examples: [ComponentExample!]!
  accessibility: AccessibilityInfo
  performance: PerformanceInfo
}

type ComponentExample {
  title: String!
  description: String
  props: JSON!
  code: String
}

type AccessibilityInfo {
  ariaLabel: String
  keyboardNavigation: [String!]!
  screenReaderNotes: [String!]!
  colorContrastCompliant: Boolean
}

type PerformanceInfo {
  bundleSize: String
  renderTime: String
  reRenderTriggers: [String!]!
  optimizations: [String!]!
}

type ComponentMetadata {
  created: DateTime
  modified: DateTime
  checksum: String
  usage: ComponentUsage
}

type ComponentUsage {
  totalRenders: Int!
  avgRenderTime: Float!
  errorRate: Float!
  popularProps: JSON!
}

${componentTypes}

type Query {
  components: [ComponentUnion!]!
  component(id: ID!): ComponentUnion
  componentsByType(type: ComponentType!): [ComponentUnion!]!
  componentsByCategory(category: String!): [ComponentUnion!]!
  searchComponents(query: String!): [ComponentUnion!]!
}

type Mutation {
  updateComponentProps(id: ID!, props: JSON!): ComponentUnion
  recordComponentUsage(id: ID!, metrics: JSON!): Boolean
}

type Subscription {
  componentUpdated(id: ID): ComponentUnion
  componentUsageUpdated: ComponentUsage
}

union ComponentUnion = ${components.map(comp => `${comp.metadata.componentName}Component`).join(' | ')}
`;
  }

  private static mapPropTypeToGraphQL(propType: string): string {
    switch (propType) {
      case 'string': return 'String';
      case 'number': return 'Float';
      case 'boolean': return 'Boolean';
      case 'array': return '[JSON]';
      case 'object': return 'JSON';
      case 'function': return 'String'; // Serialized function
      case 'select': return 'String';
      default: return 'JSON';
    }
  }
}

// Streamlined Development Orchestrator
export class StreamlinedDevelopmentOrchestrator {
  // Generate complete integration setup
  static generateIntegrationSetup(components: ComponentRegistryEntry[]): any {
    return {
      mdx: {
        templates: components.map(comp => ({
          component: comp.metadata.componentName,
          template: MDXIntegrationUtility.generateMDXTemplate(comp),
        })),
        config: {
          remarkPlugins: ['remark-gfm', 'remark-frontmatter'],
          rehypePlugins: ['rehype-highlight', 'rehype-slug'],
        },
      },
      microfrontends: {
        federation: MicrofrontendIntegrationUtility.generateModuleFederationConfig(
          '@internetfriends/components',
          components
        ),
        manifest: MicrofrontendIntegrationUtility.generateComponentManifest(components),
        types: MicrofrontendIntegrationUtility.generateTypeDefinitions(components),
      },
      i18n: {
        config: I18nIntegrationUtility.generateNextI18nConfig(),
        translations: I18nIntegrationUtility.extractTranslatableStrings(components),
        locales: ['en', 'es', 'fr', 'de'].map(locale => ({
          locale,
          content: I18nIntegrationUtility.generateLocaleFile(
            locale,
            I18nIntegrationUtility.extractTranslatableStrings(components)
          ),
        })),
      },
      dataPipeline: {
        streams: DataPipelineIntegrationUtility.generateStreamConfig(components),
        graphql: DataPipelineIntegrationUtility.generateGraphQLSchema(components),
        pipelines: components.map(comp =>
          DataPipelineIntegrationUtility.createPropsPipeline(comp)
        ),
      },
      automation: {
        scripts: this.generateAutomationScripts(),
        workflows: this.generateWorkflowConfigurations(),
      },
    };
  }

  private static generateAutomationScripts(): Record<string, string> {
    return {
      'generate-mdx': `#!/bin/bash
# Auto-generate MDX documentation for all components
bun run shared/utilities/integration.utilities.ts --mode mdx --output docs/components
`,
      'sync-translations': `#!/bin/bash
# Extract and sync translations
bun run shared/utilities/integration.utilities.ts --mode i18n --extract --sync
`,
      'build-microfrontends': `#!/bin/bash
# Build microfrontend bundles
bun run shared/utilities/integration.utilities.ts --mode mf --build --manifest
`,
      'update-types': `#!/bin/bash
# Update TypeScript definitions
bun run shared/utilities/integration.utilities.ts --mode types --generate --validate
`,
    };
  }

  private static generateWorkflowConfigurations(): Record<string, any> {
    return {
      'component-pipeline': {
        trigger: 'component_updated',
        steps: [
          { name: 'validate', action: 'validate_component' },
          { name: 'test', action: 'run_component_tests' },
          { name: 'document', action: 'generate_mdx_docs' },
          { name: 'translate', action: 'extract_i18n_strings' },
          { name: 'bundle', action: 'build_microfrontend' },
          { name: 'deploy', action: 'update_registry' },
        ],
      },
      'integration-sync': {
        trigger: 'daily',
        steps: [
          { name: 'sync-translations', action: 'sync_all_translations' },
          { name: 'update-manifests', action: 'regenerate_manifests' },
          { name: 'validate-federation', action: 'test_microfrontend_integration' },
          { name: 'update-docs', action: 'rebuild_documentation' },
        ],
      },
    };
  }
}

// Export all utilities
export const integrationUtilities = {
  MDXIntegrationUtility,
  MicrofrontendIntegrationUtility,
  I18nIntegrationUtility,
  DataPipelineIntegrationUtility,
  StreamlinedDevelopmentOrchestrator,
};

export default integrationUtilities;
