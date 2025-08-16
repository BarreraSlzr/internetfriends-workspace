/**
 * Component Documentation Snapshot Generator
 * Pre-generates component documentation and state analysis for fast loading
 */

import { ComponentDiscovery, ComponentMetadata } from './component-discovery';
import { ComponentStateAnalyzer, ComponentStateMachine } from './component-state-analyzer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

export interface ComponentSnapshot {
  id: string;
  metadata: ComponentMetadata;
  stateMachine: ComponentStateMachine;
  renderedMarkdown: string;
  generatedAt: Date;
  version: string;
  screenshot?: string;
  performance: {
    analysisTime: number;
    renderTime: number;
    fileSize: number;
  };
}

export interface SnapshotDatabase {
  components: ComponentSnapshot[];
  lastGenerated: Date;
  totalComponents: number;
  metadata: {
    version: string;
    environment: string;
    buildHash?: string;
  };
}

export class ComponentSnapshotGenerator {
  private outputDir: string;
  private database: SnapshotDatabase;

  constructor(outputDir = '.cache') {
    this.outputDir = outputDir;
    this.database = {
      components: [],
      lastGenerated: new Date(),
      totalComponents: 0,
      metadata: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development'
      }
    };
  }

  /**
   * Generate snapshots for all components
   */
  async generateSnapshots(): Promise<SnapshotDatabase> {
    console.log('🔄 Generating component documentation snapshots...');
    
    const startTime = Date.now();
    const discovery = new ComponentDiscovery();
    
    // Discover all components
    const components = await discovery.discoverComponents('components');
    console.log(`📋 Found ${components.length} components to analyze`);

    // Ensure output directory exists
    if (!existsSync(this.outputDir)) {
      mkdirSync(this.outputDir, { recursive: true });
    }

    const snapshots: ComponentSnapshot[] = [];

    for (const component of components) {
      try {
        console.log(`🔍 Analyzing ${component.name}...`);
        const snapshot = await this.generateComponentSnapshot(component);
        snapshots.push(snapshot);
        
        // Save individual snapshot
        await this.saveComponentSnapshot(snapshot);
        
      } catch (error) {
        console.warn(`⚠️  Failed to generate snapshot for ${component.name}:`, error);
      }
    }

    // Update database
    this.database = {
      components: snapshots,
      lastGenerated: new Date(),
      totalComponents: snapshots.length,
      metadata: {
        ...this.database.metadata,
        buildHash: await this.generateBuildHash()
      }
    };

    // Save main database
    await this.saveDatabaseSnapshot();

    const duration = Date.now() - startTime;
    console.log(`✅ Generated ${snapshots.length} component snapshots in ${duration}ms`);
    
    return this.database;
  }

  /**
   * Generate snapshot for a single component
   */
  private async generateComponentSnapshot(metadata: ComponentMetadata): Promise<ComponentSnapshot> {
    const startTime = Date.now();

    // Generate state machine analysis
    const stateMachine = await ComponentStateAnalyzer.analyzeComponent(metadata);
    
    const analysisTime = Date.now() - startTime;
    const renderStartTime = Date.now();

    // Pre-render markdown content
    const renderedMarkdown = await this.preRenderMarkdown(stateMachine.documentation);
    
    const renderTime = Date.now() - renderStartTime;

    return {
      id: metadata.id,
      metadata,
      stateMachine,
      renderedMarkdown,
      generatedAt: new Date(),
      version: this.database.metadata.version,
      performance: {
        analysisTime,
        renderTime,
        fileSize: metadata.size
      }
    };
  }

  /**
   * Pre-render markdown to HTML with Mermaid diagrams processed
   */
  private async preRenderMarkdown(markdown: string): Promise<string> {
    try {
      // Import markdown processor (using dynamic import for server-side)
      const { remark } = await import('remark');
      const remarkGfm = await import('remark-gfm');
      const remarkHtml = await import('remark-html');
      
      const processor = remark()
        .use(remarkGfm.default)
        .use(remarkHtml.default);

      const result = await processor.process(markdown);
      return String(result);
      
    } catch (error) {
      console.warn('Failed to pre-render markdown:', error);
      return markdown; // Fallback to raw markdown
    }
  }

  /**
   * Save individual component snapshot
   */
  private async saveComponentSnapshot(snapshot: ComponentSnapshot): Promise<void> {
    const filePath = join(this.outputDir, `${snapshot.id}.json`);
    writeFileSync(filePath, JSON.stringify(snapshot, null, 2));
  }

  /**
   * Save main database snapshot
   */
  private async saveDatabaseSnapshot(): Promise<void> {
    const filePath = join(this.outputDir, 'component-database.json');
    writeFileSync(filePath, JSON.stringify(this.database, null, 2));
    
    // Also save a lightweight index for fast loading
    const index = {
      components: this.database.components.map(c => ({
        id: c.id,
        name: c.metadata.name,
        category: c.metadata.category,
        description: c.metadata.description,
        testStatus: c.metadata.testStatus,
        usageCount: c.metadata.usageCount,
        lastModified: c.metadata.lastModified,
        generatedAt: c.generatedAt
      })),
      lastGenerated: this.database.lastGenerated,
      totalComponents: this.database.totalComponents
    };
    
    const indexPath = join(this.outputDir, 'component-index.json');
    writeFileSync(indexPath, JSON.stringify(index, null, 2));
  }

  /**
   * Generate build hash for cache invalidation
   */
  private async generateBuildHash(): Promise<string> {
    const content = JSON.stringify({
      timestamp: Date.now(),
      nodeEnv: process.env.NODE_ENV,
      // Add package.json version if available
      version: this.database.metadata.version
    });
    
    // Simple hash generation
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return Math.abs(hash).toString(16);
  }

  /**
   * Load existing database
   */
  async loadDatabase(): Promise<SnapshotDatabase | null> {
    try {
      const filePath = join(this.outputDir, 'component-database.json');
      if (!existsSync(filePath)) return null;
      
      const fs = await import('fs');
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as SnapshotDatabase;
      
    } catch (error) {
      console.warn('Failed to load existing database:', error);
      return null;
    }
  }

  /**
   * Load component snapshot by ID
   */
  async loadComponentSnapshot(id: string): Promise<ComponentSnapshot | null> {
    try {
      const filePath = join(this.outputDir, `${id}.json`);
      if (!existsSync(filePath)) return null;
      
      const fs = await import('fs');
      const content = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(content) as ComponentSnapshot;
      
    } catch (error) {
      console.warn(`Failed to load snapshot for ${id}:`, error);
      return null;
    }
  }

  /**
   * Check if snapshots need regeneration
   */
  async needsRegeneration(): Promise<boolean> {
    const existing = await this.loadDatabase();
    if (!existing) return true;

    // Check if files have changed since last generation
    const lastGenerated = new Date(existing.lastGenerated);
    const now = new Date();
    const hoursSinceGeneration = (now.getTime() - lastGenerated.getTime()) / (1000 * 60 * 60);

    // Regenerate if older than 1 hour in development
    if (process.env.NODE_ENV === 'development' && hoursSinceGeneration > 1) {
      return true;
    }

    // In production, regenerate if older than 24 hours
    if (process.env.NODE_ENV === 'production' && hoursSinceGeneration > 24) {
      return true;
    }

    return false;
  }
}

/**
 * CLI function for generating snapshots
 */
export async function generateComponentSnapshots() {
  const generator = new ComponentSnapshotGenerator();
  
  if (await generator.needsRegeneration()) {
    await generator.generateSnapshots();
  } else {
    console.log('📋 Component snapshots are up to date');
  }
}

// CLI execution
if (import.meta.main) {
  generateComponentSnapshots().catch(console.error);
}