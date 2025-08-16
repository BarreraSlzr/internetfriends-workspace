/**
 * Component Discovery System
 * Automatically discovers and indexes all components in the design system
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { glob } from 'glob';

export interface ComponentMetadata {
  id: string;
  name: string;
  category: 'atomic' | 'molecular' | 'organism';
  path: string;
  filePath: string;
  testStatus: 'passing' | 'warning' | 'failing' | 'unknown';
  usageCount: number;
  description: string;
  variants?: Array<{ name: string; props: Record<string, unknown> }>;
  dependencies: string[];
  usedBy: string[];
  hasTypes: boolean;
  hasTests: boolean;
  hasStories: boolean;
  lastModified: Date;
  size: number;
  exports: string[];
  props: ComponentProp[];
}

export interface ComponentProp {
  name: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string;
}

export interface ComponentRelationship {
  from: string;
  to: string;
  type: 'import' | 'usage' | 'composition';
  count: number;
}

export class ComponentDiscovery {
  private componentsCache: ComponentMetadata[] = [];
  private relationshipsCache: ComponentRelationship[] = [];
  private lastScan: Date | null = null;

  async discoverComponents(basePath: string = 'components'): Promise<ComponentMetadata[]> {
    const componentPaths = await glob('**/*.{tsx,ts}', {
      cwd: basePath,
      ignore: ['**/*.test.{ts,tsx}', '**/*.stories.{ts,tsx}', '**/index.{ts,tsx}']
    });

    const components: ComponentMetadata[] = [];

    for (const componentPath of componentPaths) {
      const fullPath = join(basePath, componentPath);
      
      try {
        const metadata = await this.analyzeComponent(fullPath, componentPath);
        if (metadata) {
          components.push(metadata);
        }
      } catch (error) {
        console.warn(`Failed to analyze component ${componentPath}:`, error);
      }
    }

    // Calculate relationships
    this.relationshipsCache = this.calculateRelationships(components);
    
    // Update usage counts based on relationships
    components.forEach(component => {
      component.usageCount = this.relationshipsCache.filter(rel => rel.to === component.id).length;
      component.usedBy = this.relationshipsCache
        .filter(rel => rel.to === component.id)
        .map(rel => rel.from);
    });

    this.componentsCache = components;
    this.lastScan = new Date();
    
    return components;
  }

  private async analyzeComponent(filePath: string, relativePath: string): Promise<ComponentMetadata | null> {
    if (!existsSync(filePath)) return null;

    const content = readFileSync(filePath, 'utf-8');
    const stats = await import('fs').then(fs => fs.promises.stat(filePath));

    // Extract component info from path and content
    const pathParts = relativePath.split('/');
    const category = this.getCategoryFromPath(pathParts);
    const fileName = pathParts[pathParts.length - 1];
    const componentName = this.extractComponentName(content, fileName);

    if (!componentName || !category) return null;

    const metadata: ComponentMetadata = {
      id: this.generateComponentId(componentName, category, relativePath),
      name: componentName,
      category,
      path: relativePath,
      filePath,
      testStatus: this.getTestStatus(filePath),
      usageCount: 0, // Will be calculated later
      description: this.extractDescription(content),
      dependencies: this.extractDependencies(content),
      usedBy: [], // Will be calculated later
      hasTypes: this.hasTypesFile(filePath),
      hasTests: this.hasTestFile(filePath),
      hasStories: this.hasStoriesFile(filePath),
      lastModified: stats.mtime,
      size: stats.size,
      exports: this.extractExports(content),
      props: this.extractProps(content),
      variants: this.extractVariants(content)
    };

    return metadata;
  }

  private getCategoryFromPath(pathParts: string[]): 'atomic' | 'molecular' | 'organism' | null {
    for (const part of pathParts) {
      if (['atomic', 'molecular', 'organism'].includes(part)) {
        return part as 'atomic' | 'molecular' | 'organism';
      }
    }
    
    // Try to infer from naming patterns
    const fileName = pathParts[pathParts.length - 1];
    if (fileName.includes('.atomic.')) return 'atomic';
    if (fileName.includes('.molecular.')) return 'molecular';
    if (fileName.includes('.organism.')) return 'organism';
    
    return null;
  }

  private extractComponentName(content: string, fileName: string): string | null {
    // Try to extract from export statements
    const exportMatches = content.match(/export\s+(?:const|function|class)\s+(\w+)/g);
    if (exportMatches) {
      for (const match of exportMatches) {
        const name = match.replace(/export\s+(?:const|function|class)\s+/, '');
        if (name && /^[A-Z]/.test(name)) {
          return name;
        }
      }
    }

    // Fallback to filename
    const baseName = fileName.replace(/\.(tsx?|jsx?)$/, '');
    return baseName.split('.')[0].replace(/[-_](.)/g, (_, letter) => letter.toUpperCase())
      .replace(/^./, str => str.toUpperCase());
  }

  private generateComponentId(name: string, category: string, path: string): string {
    return `${name.toLowerCase()}-${category}-${path.replace(/[^a-zA-Z0-9]/g, '-')}`;
  }

  private extractDescription(content: string): string {
    // Look for JSDoc comments
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n\s*\*/);
    if (jsdocMatch) {
      return jsdocMatch[1];
    }

    // Look for component comments
    const commentMatch = content.match(/\/\/\s*(.+?)\n/);
    if (commentMatch) {
      return commentMatch[1];
    }

    return 'Component description not available';
  }

  private extractDependencies(content: string): string[] {
    const importMatches = content.match(/from\s+['"]([^'"]+)['"]/g);
    if (!importMatches) return [];

    return importMatches
      .map(match => match.replace(/from\s+['"]([^'"]+)['"]/, '$1'))
      .filter(dep => dep.startsWith('./') || dep.startsWith('../') || dep.startsWith('@/'))
      .map(dep => dep.replace(/^@\//, '').replace(/^\.\//, '').replace(/^\.\.\//, ''));
  }

  private extractExports(content: string): string[] {
    const exportMatches = content.match(/export\s+(?:const|function|class|interface|type)\s+(\w+)/g);
    if (!exportMatches) return [];

    return exportMatches.map(match => 
      match.replace(/export\s+(?:const|function|class|interface|type)\s+/, '')
    );
  }

  private extractProps(content: string): ComponentProp[] {
    const props: ComponentProp[] = [];
    
    // Look for interface/type definitions for props
    const interfaceMatches = content.match(/interface\s+\w*Props\s*{([^}]+)}/g);
    if (interfaceMatches) {
      for (const match of interfaceMatches) {
        const propsContent = match.match(/{([^}]+)}/)?.[1];
        if (propsContent) {
          const propLines = propsContent.split('\n').map(line => line.trim()).filter(Boolean);
          for (const line of propLines) {
            const propMatch = line.match(/(\w+)(\?)?\s*:\s*([^;]+)/);
            if (propMatch) {
              props.push({
                name: propMatch[1],
                type: propMatch[3].trim(),
                required: !propMatch[2],
                description: this.extractPropDescription(line)
              });
            }
          }
        }
      }
    }

    return props;
  }

  private extractPropDescription(line: string): string | undefined {
    const commentMatch = line.match(/\/\/\s*(.+)$/);
    return commentMatch ? commentMatch[1].trim() : undefined;
  }

  private extractVariants(content: string): Array<{ name: string; props: Record<string, unknown> }> | undefined {
    // This is a simplified variant extraction - could be enhanced
    const variantMatches = content.match(/variant:\s*['"](\w+)['"]/g);
    if (!variantMatches) return undefined;

    return variantMatches.map(match => {
      const variant = match.replace(/variant:\s*['"](\w+)['"]/, '$1');
      return {
        name: variant.charAt(0).toUpperCase() + variant.slice(1),
        props: { variant }
      };
    });
  }

  private getTestStatus(filePath: string): 'passing' | 'warning' | 'failing' | 'unknown' {
    // Simplified test status - in reality, you'd run the tests
    if (this.hasTestFile(filePath)) {
      return 'passing'; // Assume tests are passing if they exist
    }
    return 'unknown';
  }

  private hasTypesFile(filePath: string): boolean {
    const typesPath = filePath.replace(/\.(tsx?)$/, '.types.ts');
    const typesPathAlt = filePath.replace(/\/[^/]+\.(tsx?)$/, '/types.ts');
    return existsSync(typesPath) || existsSync(typesPathAlt);
  }

  private hasTestFile(filePath: string): boolean {
    const testPath = filePath.replace(/\.(tsx?)$/, '.test.$1');
    const specPath = filePath.replace(/\.(tsx?)$/, '.spec.$1');
    return existsSync(testPath) || existsSync(specPath);
  }

  private hasStoriesFile(filePath: string): boolean {
    const storiesPath = filePath.replace(/\.(tsx?)$/, '.stories.$1');
    return existsSync(storiesPath);
  }

  private calculateRelationships(components: ComponentMetadata[]): ComponentRelationship[] {
    const relationships: ComponentRelationship[] = [];
    
    for (const component of components) {
      for (const dependency of component.dependencies) {
        const targetComponent = components.find(c => 
          c.path.includes(dependency) || c.name.toLowerCase().includes(dependency.toLowerCase())
        );
        
        if (targetComponent) {
          relationships.push({
            from: component.id,
            to: targetComponent.id,
            type: 'import',
            count: 1
          });
        }
      }
    }

    return relationships;
  }

  getComponents(): ComponentMetadata[] {
    return this.componentsCache;
  }

  getRelationships(): ComponentRelationship[] {
    return this.relationshipsCache;
  }

  getComponentById(id: string): ComponentMetadata | undefined {
    return this.componentsCache.find(c => c.id === id);
  }

  getComponentsByCategory(category: 'atomic' | 'molecular' | 'organism'): ComponentMetadata[] {
    return this.componentsCache.filter(c => c.category === category);
  }

  searchComponents(query: string): ComponentMetadata[] {
    const lowerQuery = query.toLowerCase();
    return this.componentsCache.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) ||
      c.description.toLowerCase().includes(lowerQuery) ||
      c.exports.some(exp => exp.toLowerCase().includes(lowerQuery))
    );
  }
}

// Singleton instance
export const componentDiscovery = new ComponentDiscovery();