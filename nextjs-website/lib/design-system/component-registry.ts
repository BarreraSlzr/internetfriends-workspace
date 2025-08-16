// Component Registry - Central catalog of all components and their usage
export interface ComponentRegistryEntry {
  id: string;
  name: string;
  category: 'atomic' | 'molecular' | 'organism' | 'template' | 'page';
  path: string;
  description: string;
  
  // Documentation
  markdownDocs?: string;
  propsInterface?: string;
  examples?: string[];
  
  // Usage tracking
  usedInPages: string[];
  usageCount: number;
  
  // Visual
  hasScreenshot: boolean;
  screenshotUrl?: string;
  
  // Dependencies
  dependencies: string[]; // Components this depends on
  dependents: string[];   // Components that depend on this
  
  // Metadata
  author?: string;
  lastModified: string;
  version?: string;
  tags: string[];
  status: 'active' | 'deprecated' | 'experimental';
}

export interface PageRegistryEntry {
  id: string;
  name: string;
  route: string;
  filePath: string;
  description: string;
  
  // Component usage
  componentsUsed: string[];
  componentCount: number;
  
  // Visual
  hasScreenshot: boolean;
  screenshotUrl?: string;
  
  // Sitemap
  parentPage?: string;
  childPages: string[];
  
  // Metadata
  lastModified: string;
  status: 'active' | 'draft' | 'archived';
  category: 'marketing' | 'app' | 'admin' | 'demo';
}

export interface DesignSystemRegistry {
  components: ComponentRegistryEntry[];
  pages: PageRegistryEntry[];
  relationships: {
    componentToPages: Record<string, string[]>;
    pageToComponents: Record<string, string[]>;
    componentDependencies: Record<string, string[]>;
  };
  statistics: {
    totalComponents: number;
    totalPages: number;
    averageComponentsPerPage: number;
    mostUsedComponents: Array<{ id: string; usage: number }>;
    reusabilityScore: number;
  };
}

// Registry implementation
class ComponentRegistry {
  private registry: DesignSystemRegistry | null = null;

  constructor() {
    this.loadRegistry();
  }

  private async loadRegistry(): Promise<void> {
    this.registry = await this.loadRegistryData();
  }

  private async loadRegistryData(): Promise<DesignSystemRegistry> {
    try {
      // For server-side, dynamically import scanner
      if (typeof window === 'undefined') {
        const { RegistryScanner } = await import('./registry-scanner');
        const scanner = new RegistryScanner();
        const scanResult = await scanner.scanProject();
        
        // Process scan results and build relationships
        const relationships = this.buildRelationships(scanResult.components, scanResult.pages);
        const statistics = this.calculateStatistics(scanResult.components, scanResult.pages, relationships);
        
        return {
          components: scanResult.components,
          pages: scanResult.pages,
          relationships,
          statistics
        };
      } else {
        // For client-side, use API to get registry data
        const response = await fetch('/api/design-system/registry?type=full');
        if (response.ok) {
          const data = await response.json();
          return data.registry || this.getFallbackRegistry();
        }
        throw new Error('Failed to fetch registry data from API');
      }
    } catch (error) {
      console.error('Failed to scan project, using fallback data:', error);
      return this.getFallbackRegistry();
    }
  }

  private buildRelationships(components: ComponentRegistryEntry[], pages: PageRegistryEntry[]) {
    const componentToPages: Record<string, string[]> = {};
    const pageToComponents: Record<string, string[]> = {};
    const componentDependencies: Record<string, string[]> = {};

    // Build component-to-pages mapping
    pages.forEach(page => {
      page.componentsUsed.forEach(componentName => {
        // Find component by name
        const component = components.find(c => 
          c.name === componentName || 
          c.id.includes(componentName.toLowerCase()) ||
          componentName.toLowerCase().includes(c.name.toLowerCase())
        );
        
        if (component) {
          if (!componentToPages[component.id]) {
            componentToPages[component.id] = [];
          }
          componentToPages[component.id].push(page.id);
        }
      });
      
      pageToComponents[page.id] = page.componentsUsed;
    });

    // Build component dependencies
    components.forEach(component => {
      componentDependencies[component.id] = component.dependencies;
    });

    return {
      componentToPages,
      pageToComponents,
      componentDependencies
    };
  }

  private calculateStatistics(
    components: ComponentRegistryEntry[], 
    pages: PageRegistryEntry[], 
    relationships: DesignSystemRegistry['relationships']
  ): DesignSystemRegistry['statistics'] {
    const totalComponents = components.length;
    const totalPages = pages.length;
    const averageComponentsPerPage = totalPages > 0 
      ? pages.reduce((sum, page) => sum + page.componentCount, 0) / totalPages 
      : 0;

    // Calculate component usage counts
    components.forEach(component => {
      const usage = relationships.componentToPages[component.id]?.length || 0;
      component.usageCount = usage;
      component.usedInPages = relationships.componentToPages[component.id] || [];
    });

    const mostUsedComponents = components
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 10)
      .map(c => ({ id: c.id, usage: c.usageCount }));

    // Calculate reusability score (percentage of components used in multiple places)
    const reusedComponents = components.filter(c => c.usageCount > 1).length;
    const reusabilityScore = totalComponents > 0 
      ? Math.round((reusedComponents / totalComponents) * 100) 
      : 0;

    return {
      totalComponents,
      totalPages,
      averageComponentsPerPage: Math.round(averageComponentsPerPage * 10) / 10,
      mostUsedComponents,
      reusabilityScore
    };
  }

  private getFallbackRegistry(): DesignSystemRegistry {
    // Fallback data for when scanning fails
    return {
      components: [
        {
          id: 'button-atomic',
          name: 'ButtonAtomic',
          category: 'atomic',
          path: '/components/atomic/button/button.atomic.tsx',
          description: 'Primary button component with variants and states',
          usedInPages: [],
          usageCount: 0,
          hasScreenshot: false,
          dependencies: [],
          dependents: [],
          lastModified: new Date().toISOString(),
          tags: ['interactive', 'primary', 'form'],
          status: 'active'
        }
      ],
      pages: [
        {
          id: 'design-system',
          name: 'Design System',
          route: '/design-system',
          filePath: '/app/(internetfriends)/design-system/page.tsx',
          description: 'Component documentation and visualization',
          componentsUsed: [],
          componentCount: 0,
          hasScreenshot: false,
          childPages: [],
          lastModified: new Date().toISOString(),
          status: 'active',
          category: 'app'
        }
      ],
      relationships: {
        componentToPages: {},
        pageToComponents: {},
        componentDependencies: {}
      },
      statistics: {
        totalComponents: 1,
        totalPages: 1,
        averageComponentsPerPage: 0,
        mostUsedComponents: [],
        reusabilityScore: 0
      }
    };
  }

  // Public API methods
  async getAllComponents(): Promise<ComponentRegistryEntry[]> {
    await this.ensureLoaded();
    return this.registry!.components;
  }

  async getAllPages(): Promise<PageRegistryEntry[]> {
    await this.ensureLoaded();
    return this.registry!.pages;
  }

  async getComponentById(id: string): Promise<ComponentRegistryEntry | undefined> {
    await this.ensureLoaded();
    return this.registry!.components.find(c => c.id === id);
  }

  async getPageById(id: string): Promise<PageRegistryEntry | undefined> {
    await this.ensureLoaded();
    return this.registry!.pages.find(p => p.id === id);
  }

  async getComponentUsage(componentId: string): Promise<string[]> {
    await this.ensureLoaded();
    return this.registry!.relationships.componentToPages[componentId] || [];
  }

  async getPageComponents(pageId: string): Promise<string[]> {
    await this.ensureLoaded();
    return this.registry!.relationships.pageToComponents[pageId] || [];
  }

  async getComponentDependencies(componentId: string): Promise<string[]> {
    await this.ensureLoaded();
    return this.registry!.relationships.componentDependencies[componentId] || [];
  }

  async getStatistics(): Promise<DesignSystemRegistry['statistics']> {
    await this.ensureLoaded();
    return this.registry!.statistics;
  }

  private async ensureLoaded(): Promise<void> {
    if (!this.registry) {
      await this.loadRegistry();
    }
  }

  // Registry management
  async updateComponent(id: string, updates: Partial<ComponentRegistryEntry>): Promise<void> {
    await this.ensureLoaded();
    const index = this.registry!.components.findIndex(c => c.id === id);
    if (index !== -1) {
      this.registry!.components[index] = { ...this.registry!.components[index], ...updates };
      await this.saveRegistry();
    }
  }

  async addComponent(component: ComponentRegistryEntry): Promise<void> {
    await this.ensureLoaded();
    this.registry!.components.push(component);
    await this.updateRelationships();
    await this.saveRegistry();
  }

  async addPage(page: PageRegistryEntry): Promise<void> {
    await this.ensureLoaded();
    this.registry!.pages.push(page);
    await this.updateRelationships();
    await this.saveRegistry();
  }

  private async updateRelationships(): Promise<void> {
    if (!this.registry) return;
    
    // Recalculate relationships based on current data
    const componentToPages: Record<string, string[]> = {};
    const pageToComponents: Record<string, string[]> = {};

    this.registry.pages.forEach(page => {
      page.componentsUsed.forEach(componentId => {
        if (!componentToPages[componentId]) {
          componentToPages[componentId] = [];
        }
        componentToPages[componentId].push(page.id);
      });
      pageToComponents[page.id] = page.componentsUsed;
    });

    this.registry.relationships.componentToPages = componentToPages;
    this.registry.relationships.pageToComponents = pageToComponents;

    // Update statistics
    this.registry.statistics.totalComponents = this.registry.components.length;
    this.registry.statistics.totalPages = this.registry.pages.length;
    this.registry.statistics.averageComponentsPerPage = 
      this.registry.pages.reduce((sum, page) => sum + page.componentCount, 0) / this.registry.pages.length;
  }

  private async saveRegistry(): Promise<void> {
    // In a real implementation, this would save to a JSON file or database
    console.log('Registry updated:', this.registry);
  }

  // Search and filter methods
  async searchComponents(query: string): Promise<ComponentRegistryEntry[]> {
    await this.ensureLoaded();
    const lowercaseQuery = query.toLowerCase();
    return this.registry!.components.filter(component =>
      component.name.toLowerCase().includes(lowercaseQuery) ||
      component.description.toLowerCase().includes(lowercaseQuery) ||
      component.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    );
  }

  async filterComponentsByCategory(category: ComponentRegistryEntry['category']): Promise<ComponentRegistryEntry[]> {
    await this.ensureLoaded();
    return this.registry!.components.filter(c => c.category === category);
  }

  async filterComponentsByStatus(status: ComponentRegistryEntry['status']): Promise<ComponentRegistryEntry[]> {
    await this.ensureLoaded();
    return this.registry!.components.filter(c => c.status === status);
  }

  async getUnusedComponents(): Promise<ComponentRegistryEntry[]> {
    await this.ensureLoaded();
    return this.registry!.components.filter(c => c.usageCount === 0);
  }

  async getMostUsedComponents(limit: number = 10): Promise<ComponentRegistryEntry[]> {
    await this.ensureLoaded();
    return this.registry!.components
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit);
  }

  // Method to refresh the registry data
  async refreshRegistry(): Promise<void> {
    this.registry = null;
    await this.loadRegistry();
  }
}

// Export singleton instance
export const componentRegistry = new ComponentRegistry();
export default componentRegistry;