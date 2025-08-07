"use client";

import { ComponentType } from 'react';
import { ComponentRegistryEntry, ComponentPreviewNodeData, ComponentProp } from './types';

// Component registry for auto-discovery and cataloging
class ComponentRegistry {
  private static instance: ComponentRegistry;
  private registry: Map<string, ComponentRegistryEntry> = new Map();
  private categories: Map<string, string[]> = new Map();
  private tags: Map<string, string[]> = new Map();

  private constructor() {
    this.initializeRegistry();
  }

  public static getInstance(): ComponentRegistry {
    if (!ComponentRegistry.instance) {
      ComponentRegistry.instance = new ComponentRegistry();
    }
    return ComponentRegistry.instance;
  }

  // Initialize with auto-discovered components
  private async initializeRegistry() {
    await this.discoverComponents();
    this.categorizeComponents();
    this.buildTagIndex();
  }

  // Auto-discover components from the project structure
  private async discoverComponents() {
    const componentPaths = [
      '/components/atomic',
      '/components/molecular',
      '/components/organisms',
      '/components/templates',
      '/components/ui'
    ];

    for (const basePath of componentPaths) {
      await this.scanDirectory(basePath);
    }
  }

  // Scan directory for components
  private async scanDirectory(path: string) {
    try {
      // In a real implementation, this would use Node.js fs or a bundler plugin
      // For now, we'll provide a manual registration method
      console.log(`Scanning ${path} for components...`);
    } catch (error) {
      console.warn(`Failed to scan directory ${path}:`, error);
    }
  }

  // Register a component manually
  public registerComponent(entry: ComponentRegistryEntry): void {
    this.registry.set(entry.id, entry);
    this.updateIndices(entry);
  }

  // Batch register components
  public registerComponents(entries: ComponentRegistryEntry[]): void {
    entries.forEach(entry => this.registerComponent(entry));
  }

  // Get component by ID
  public getComponent(id: string): ComponentRegistryEntry | undefined {
    return this.registry.get(id);
  }

  // Get all components
  public getAllComponents(): ComponentRegistryEntry[] {
    return Array.from(this.registry.values());
  }

  // Get components by category
  public getComponentsByCategory(category: string): ComponentRegistryEntry[] {
    return this.getAllComponents().filter(comp =>
      comp.metadata.category === category
    );
  }

  // Get components by type
  public getComponentsByType(type: ComponentPreviewNodeData['componentType']): ComponentRegistryEntry[] {
    return this.getAllComponents().filter(comp =>
      comp.metadata.componentType === type
    );
  }

  // Get components by tag
  public getComponentsByTag(tag: string): ComponentRegistryEntry[] {
    return this.getAllComponents().filter(comp =>
      comp.metadata.tags?.includes(tag)
    );
  }

  // Search components
  public searchComponents(query: string): ComponentRegistryEntry[] {
    const lowerQuery = query.toLowerCase();
    return this.getAllComponents().filter(comp => {
      const name = comp.metadata.componentName.toLowerCase();
      const description = comp.metadata.documentation?.description?.toLowerCase() || '';
      const tags = comp.metadata.tags?.join(' ').toLowerCase() || '';
      const category = comp.metadata.category?.toLowerCase() || '';

      return name.includes(lowerQuery) ||
             description.includes(lowerQuery) ||
             tags.includes(lowerQuery) ||
             category.includes(lowerQuery);
    });
  }

  // Get component metadata for preview node
  public getPreviewNodeData(id: string): ComponentPreviewNodeData | undefined {
    const entry = this.getComponent(id);
    return entry?.metadata;
  }

  // Create component preview node data from component
  public createPreviewNodeData(
    componentName: string,
    component: ComponentType<any>,
    overrides?: Partial<ComponentPreviewNodeData>
  ): ComponentPreviewNodeData {
    return {
      componentName,
      component,
      componentType: this.inferComponentType(componentName),
      defaultProps: this.extractDefaultProps(component),
      availableProps: this.extractComponentProps(component),
      initialWidth: 400,
      initialHeight: 300,
      theme: 'system',
      locale: 'en',
      ...overrides
    };
  }

  // Infer component type from name/path
  private inferComponentType(name: string): ComponentPreviewNodeData['componentType'] {
    const lower = name.toLowerCase();
    if (lower.includes('page') || lower.includes('template')) return 'template';
    if (lower.includes('organism')) return 'organism';
    if (lower.includes('molecular') || lower.includes('molecule')) return 'molecular';
    if (lower.includes('atomic') || lower.includes('atom')) return 'atomic';

    // Heuristic based on common patterns
    if (lower.includes('header') || lower.includes('footer') || lower.includes('layout')) return 'organism';
    if (lower.includes('form') || lower.includes('card') || lower.includes('modal')) return 'molecular';
    if (lower.includes('button') || lower.includes('input') || lower.includes('icon')) return 'atomic';

    return 'molecular'; // Default fallback
  }

  // Extract default props from component
  private extractDefaultProps(component: ComponentType<any>): Record<string, any> {
    // In a real implementation, this would use static analysis or runtime inspection
    const defaultProps = (component as any).defaultProps || {};
    return { ...defaultProps };
  }

  // Extract component props schema
  private extractComponentProps(component: ComponentType<any>): ComponentProp[] {
    // This would typically use TypeScript AST parsing or runtime prop-types
    // For now, return common props that most components accept
    const commonProps: ComponentProp[] = [
      {
        name: 'className',
        type: 'string',
        description: 'Additional CSS classes'
      },
      {
        name: 'children',
        type: 'object',
        description: 'Child elements or content'
      }
    ];

    // Try to get prop types if available
    const propTypes = (component as any).propTypes;
    if (propTypes) {
      // Convert prop types to our format
      const extractedProps = Object.keys(propTypes).map(key => ({
        name: key,
        type: this.inferPropType(propTypes[key]),
        required: this.isPropRequired(propTypes[key])
      }));

      return [...commonProps, ...extractedProps];
    }

    return commonProps;
  }

  // Infer prop type from PropTypes or other type info
  private inferPropType(propType: any): ComponentProp['type'] {
    if (!propType) return 'string';

    const typeName = propType.toString();
    if (typeName.includes('string')) return 'string';
    if (typeName.includes('number')) return 'number';
    if (typeName.includes('bool')) return 'boolean';
    if (typeName.includes('func')) return 'function';
    if (typeName.includes('array')) return 'array';
    if (typeName.includes('object')) return 'object';

    return 'string';
  }

  // Check if prop is required
  private isPropRequired(propType: any): boolean {
    return propType && propType.isRequired === true;
  }

  // Update search indices
  private updateIndices(entry: ComponentRegistryEntry): void {
    // Update category index
    const category = entry.metadata.category || 'uncategorized';
    if (!this.categories.has(category)) {
      this.categories.set(category, []);
    }
    this.categories.get(category)!.push(entry.id);

    // Update tag index
    entry.metadata.tags?.forEach(tag => {
      if (!this.tags.has(tag)) {
        this.tags.set(tag, []);
      }
      this.tags.get(tag)!.push(entry.id);
    });
  }

  // Categorize components automatically
  private categorizeComponents(): void {
    this.getAllComponents().forEach(comp => {
      if (!comp.metadata.category) {
        comp.metadata.category = this.inferCategory(comp);
      }
    });
  }

  // Infer component category
  private inferCategory(entry: ComponentRegistryEntry): string {
    const name = entry.metadata.componentName.toLowerCase();
    const type = entry.metadata.componentType;

    // UI patterns
    if (name.includes('button') || name.includes('input') || name.includes('select')) {
      return 'forms';
    }
    if (name.includes('modal') || name.includes('dialog') || name.includes('tooltip')) {
      return 'overlays';
    }
    if (name.includes('nav') || name.includes('menu') || name.includes('header') || name.includes('footer')) {
      return 'navigation';
    }
    if (name.includes('card') || name.includes('panel') || name.includes('section')) {
      return 'layout';
    }
    if (name.includes('chart') || name.includes('graph') || name.includes('dashboard')) {
      return 'data-visualization';
    }
    if (name.includes('icon') || name.includes('avatar') || name.includes('badge')) {
      return 'display';
    }

    // Fallback by component type
    switch (type) {
      case 'atomic': return 'primitives';
      case 'molecular': return 'components';
      case 'organism': return 'sections';
      case 'template': return 'templates';
      default: return 'general';
    }
  }

  // Build tag index for faster searches
  private buildTagIndex(): void {
    this.getAllComponents().forEach(comp => {
      const autoTags = this.generateAutoTags(comp);
      comp.metadata.tags = [...(comp.metadata.tags || []), ...autoTags];
    });
  }

  // Generate automatic tags based on component characteristics
  private generateAutoTags(entry: ComponentRegistryEntry): string[] {
    const tags: string[] = [];
    const name = entry.metadata.componentName.toLowerCase();
    const type = entry.metadata.componentType;

    // Add type tag
    tags.push(type);

    // Add feature tags
    if (name.includes('responsive')) tags.push('responsive');
    if (name.includes('interactive')) tags.push('interactive');
    if (name.includes('animated')) tags.push('animated');
    if (entry.metadata.experimental) tags.push('experimental');
    if (entry.metadata.deprecated) tags.push('deprecated');

    // Add accessibility tags
    if (entry.metadata.documentation?.accessibility?.keyboardNavigation?.length) {
      tags.push('keyboard-accessible');
    }
    if (entry.metadata.documentation?.accessibility?.screenReaderNotes?.length) {
      tags.push('screen-reader-friendly');
    }

    // Add theme tags
    if (entry.metadata.theme) {
      tags.push(`theme-${entry.metadata.theme}`);
    }

    return tags;
  }

  // Get registry statistics
  public getStats() {
    const components = this.getAllComponents();
    const categories = Array.from(this.categories.keys());
    const tags = Array.from(this.tags.keys());

    return {
      totalComponents: components.length,
      categoriesCount: categories.length,
      tagsCount: tags.length,
      typeBreakdown: {
        atomic: components.filter(c => c.metadata.componentType === 'atomic').length,
        molecular: components.filter(c => c.metadata.componentType === 'molecular').length,
        organism: components.filter(c => c.metadata.componentType === 'organism').length,
        template: components.filter(c => c.metadata.componentType === 'template').length,
        page: components.filter(c => c.metadata.componentType === 'page').length
      },
      categories,
      tags
    };
  }

  // Clear registry (useful for testing)
  public clear(): void {
    this.registry.clear();
    this.categories.clear();
    this.tags.clear();
  }

  // Export registry data
  public export(): { components: ComponentRegistryEntry[], metadata: any } {
    return {
      components: this.getAllComponents(),
      metadata: {
        stats: this.getStats(),
        categories: Object.fromEntries(this.categories),
        tags: Object.fromEntries(this.tags),
        exportedAt: new Date().toISOString()
      }
    };
  }

  // Import registry data
  public import(data: { components: ComponentRegistryEntry[] }): void {
    this.clear();
    data.components.forEach(comp => this.registerComponent(comp));
  }
}

// Utility functions for working with the registry
export const componentRegistry = ComponentRegistry.getInstance();

// Auto-register common InternetFriends components
export function registerInternetFriendsComponents() {
  // This would be populated by scanning the actual component files
  // For now, we'll create a template for manual registration

  console.log('🔍 Registering InternetFriends components...');

  // Example registration pattern:
  // componentRegistry.registerComponent({
  //   id: 'header-atomic',
  //   path: 'components/atomic/header/header.atomic.tsx',
  //   component: HeaderAtomic,
  //   metadata: componentRegistry.createPreviewNodeData(
  //     'HeaderAtomic',
  //     HeaderAtomic,
  //     {
  //       componentType: 'atomic',
  //       category: 'navigation',
  //       tags: ['header', 'navigation', 'responsive']
  //     }
  //   )
  // });

  console.log('✅ Component registration complete');
}

// Helper to create a component entry quickly
export function createComponentEntry(
  id: string,
  path: string,
  component: ComponentType<any>,
  overrides?: Partial<ComponentPreviewNodeData>
): ComponentRegistryEntry {
  return {
    id,
    path,
    component,
    metadata: componentRegistry.createPreviewNodeData(
      id.split('-')[0] || 'Component',
      component,
      overrides
    ),
    lastModified: new Date()
  };
}

// Export the registry instance as default
export default componentRegistry;
