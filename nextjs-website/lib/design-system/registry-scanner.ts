import fs from 'fs/promises';
import path from 'path';
import { ComponentRegistryEntry, PageRegistryEntry } from './component-registry';

interface FileSystemScanResult {
  components: ComponentRegistryEntry[];
  pages: PageRegistryEntry[];
}

export class RegistryScanner {
  private projectRoot: string;
  
  constructor(projectRoot: string = '/Users/emmanuelbarrera/Projects/InternetFriends/zed_workspace/nextjs-website') {
    this.projectRoot = projectRoot;
  }

  async scanProject(): Promise<FileSystemScanResult> {
    const [components, pages] = await Promise.all([
      this.scanComponents(),
      this.scanPages()
    ]);

    return { components, pages };
  }

  private async scanComponents(): Promise<ComponentRegistryEntry[]> {
    const componentsDir = path.join(this.projectRoot, 'components');
    const components: ComponentRegistryEntry[] = [];

    try {
      const categories = ['atomic', 'molecular', 'organisms'] as const;
      
      for (const category of categories) {
        const categoryDir = path.join(componentsDir, category);
        
        try {
          const entries = await fs.readdir(categoryDir, { withFileTypes: true });
          
          for (const entry of entries) {
            if (entry.isDirectory()) {
              const componentPath = path.join(categoryDir, entry.name);
              const mappedCategory = category === 'organisms' ? 'organism' : category;
              const component = await this.analyzeComponent(componentPath, mappedCategory, entry.name);
              
              if (component) {
                components.push(component);
              }
            }
          }
        } catch (error) {
          console.warn(`Category directory not found: ${category}`);
        }
      }
    } catch (error) {
      console.error('Error scanning components:', error);
    }

    return components;
  }

  private async scanPages(): Promise<PageRegistryEntry[]> {
    const pagesDir = path.join(this.projectRoot, 'app');
    const pages: PageRegistryEntry[] = [];

    try {
      await this.scanPagesRecursive(pagesDir, '', pages);
    } catch (error) {
      console.error('Error scanning pages:', error);
    }

    return pages;
  }

  private async scanPagesRecursive(dir: string, route: string, pages: PageRegistryEntry[]): Promise<void> {
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        
        if (entry.isDirectory()) {
          // Handle Next.js route groups and dynamic routes
          let childRoute = route;
          
          if (entry.name.startsWith('(') && entry.name.endsWith(')')) {
            // Route group - doesn't affect URL
            childRoute = route;
          } else if (entry.name.startsWith('[') && entry.name.endsWith(']')) {
            // Dynamic route
            childRoute = `${route}/${entry.name}`;
          } else {
            // Regular directory
            childRoute = route === '' ? `/${entry.name}` : `${route}/${entry.name}`;
          }
          
          await this.scanPagesRecursive(fullPath, childRoute, pages);
        } else if (entry.name === 'page.tsx' || entry.name === 'page.ts') {
          // Found a page file
          const page = await this.analyzePage(fullPath, route || '/');
          
          if (page) {
            pages.push(page);
          }
        }
      }
    } catch (error) {
      // Directory doesn't exist or can't be read
    }
  }

  private async analyzeComponent(componentPath: string, category: ComponentRegistryEntry['category'], name: string): Promise<ComponentRegistryEntry | null> {
    try {
      const files = await fs.readdir(componentPath);
      const mainFile = files.find(f => f.endsWith('.tsx') || f.endsWith('.ts'));
      
      if (!mainFile) return null;
      
      const filePath = path.join(componentPath, mainFile);
      const content = await fs.readFile(filePath, 'utf-8');
      const stats = await fs.stat(filePath);
      
      // Extract component info from file content
      const componentName = this.extractComponentName(content, mainFile);
      const description = this.extractDescription(content);
      const dependencies = this.extractDependencies(content);
      const propsInterface = this.extractPropsInterface(content);
      
      // Generate component ID
      const id = `${name}-${category}`;
      
      return {
        id,
        name: componentName || this.formatName(name),
        category,
        path: `${componentPath}/${mainFile}`,
        description: description || `${category} component`,
        usedInPages: [], // Will be populated by page analysis
        usageCount: 0,
        hasScreenshot: false,
        dependencies,
        dependents: [],
        lastModified: stats.mtime.toISOString(),
        tags: this.generateTags(content, category),
        status: 'active',
        markdownDocs: await this.findMarkdownDocs(componentPath),
        propsInterface
      };
    } catch (error) {
      console.error(`Error analyzing component ${name}:`, error);
      return null;
    }
  }

  private async analyzePage(pagePath: string, route: string): Promise<PageRegistryEntry | null> {
    try {
      const content = await fs.readFile(pagePath, 'utf-8');
      const stats = await fs.stat(pagePath);
      
      // Extract page info
      const componentsUsed = this.extractComponentsUsed(content);
      const description = this.extractPageDescription(content, route);
      const pageName = this.extractPageName(content, route);
      
      // Generate page ID
      const id = route === '/' ? 'home' : route.replace(/\//g, '-').substring(1) || 'root';
      
      return {
        id,
        name: pageName,
        route,
        filePath: pagePath,
        description,
        componentsUsed,
        componentCount: componentsUsed.length,
        hasScreenshot: false,
        childPages: [],
        lastModified: stats.mtime.toISOString(),
        status: 'active',
        category: this.categorizePageByRoute(route)
      };
    } catch (error) {
      console.error(`Error analyzing page ${route}:`, error);
      return null;
    }
  }

  // Utility methods for code analysis
  private extractComponentName(content: string, fileName: string): string {
    // Look for export default function or export const
    const exportMatch = content.match(/export\s+(?:default\s+)?(?:function\s+|const\s+)(\w+)/);
    if (exportMatch) return exportMatch[1];
    
    // Fallback to filename
    return this.formatName(fileName.replace(/\.(tsx?|jsx?)$/, ''));
  }

  private extractDescription(content: string): string {
    // Look for JSDoc comments
    const jsdocMatch = content.match(/\/\*\*\s*\n\s*\*\s*(.+?)\s*\n/);
    if (jsdocMatch) return jsdocMatch[1];
    
    // Look for component description comment
    const commentMatch = content.match(/\/\/\s*(.+component.+)/i);
    if (commentMatch) return commentMatch[1];
    
    return '';
  }

  private extractDependencies(content: string): string[] {
    const imports = content.match(/from\s+['"`]@\/components\/(.+?)['"`]/g) || [];
    return imports.map(imp => {
      const match = imp.match(/from\s+['"`]@\/components\/(.+?)['"`]/);
      return match ? match[1] : '';
    }).filter(Boolean);
  }

  private extractPropsInterface(content: string): string | undefined {
    const interfaceMatch = content.match(/interface\s+\w*Props\s*\{[\s\S]*?\}/);
    return interfaceMatch ? interfaceMatch[0] : undefined;
  }

  private extractComponentsUsed(content: string): string[] {
    const components = new Set<string>();
    
    // Look for component imports and usage
    const importMatches = content.match(/import\s+\{[^}]+\}\s+from\s+['"`]@\/components\/.+?['"`]/g) || [];
    importMatches.forEach(importLine => {
      const componentNames = importLine.match(/\{([^}]+)\}/)?.[1];
      if (componentNames) {
        componentNames.split(',').forEach(name => {
          const cleanName = name.trim();
          if (cleanName) components.add(cleanName);
        });
      }
    });
    
    // Look for JSX usage
    const jsxMatches = content.match(/<(\w+(?:Atomic|Molecular|Organism))/g) || [];
    jsxMatches.forEach(match => {
      const componentName = match.substring(1);
      components.add(componentName);
    });
    
    return Array.from(components);
  }

  private extractPageDescription(content: string, route: string): string {
    // Look for page title or description
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/);
    if (titleMatch) return titleMatch[1];
    
    const h1Match = content.match(/<h1[^>]*>([^<]+)<\/h1>/);
    if (h1Match) return h1Match[1];
    
    return `Page at ${route}`;
  }

  private extractPageName(content: string, route: string): string {
    // Look for page title
    const titleMatch = content.match(/<title[^>]*>([^<]+)<\/title>/);
    if (titleMatch) return titleMatch[1];
    
    // Format from route
    if (route === '/') return 'Home';
    return route.split('/').pop()?.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Page';
  }

  private generateTags(content: string, category: string): string[] {
    const tags = [category];
    
    if (content.includes('form') || content.includes('Form')) tags.push('form');
    if (content.includes('button') || content.includes('Button')) tags.push('interactive');
    if (content.includes('modal') || content.includes('Modal')) tags.push('overlay');
    if (content.includes('input') || content.includes('Input')) tags.push('input');
    if (content.includes('glass') || content.includes('Glass')) tags.push('glass');
    if (content.includes('navigation') || content.includes('nav')) tags.push('navigation');
    
    return tags;
  }

  private categorizePageByRoute(route: string): PageRegistryEntry['category'] {
    if (route.includes('admin')) return 'admin';
    if (route.includes('demo') || route.includes('test')) return 'demo';
    if (route.includes('design-system') || route.includes('components')) return 'app';
    return 'marketing';
  }

  private formatName(name: string): string {
    return name
      .replace(/[-_.]/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .trim();
  }

  private async findMarkdownDocs(componentPath: string): Promise<string | undefined> {
    try {
      const files = await fs.readdir(componentPath);
      const mdFile = files.find(f => f.endsWith('.md') || f.endsWith('.mdx'));
      
      if (mdFile) {
        const content = await fs.readFile(path.join(componentPath, mdFile), 'utf-8');
        return content;
      }
    } catch (error) {
      // No markdown docs found
    }
    
    return undefined;
  }
}

// Export convenience function
export async function scanProjectAndUpdateRegistry(projectRoot?: string): Promise<FileSystemScanResult> {
  const scanner = new RegistryScanner(projectRoot);
  return await scanner.scanProject();
}