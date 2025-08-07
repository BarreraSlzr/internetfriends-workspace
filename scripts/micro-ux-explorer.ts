#!/usr/bin/env bun

/**
 * 🔍 Micro UX Explorer - Event-Driven Project Structure Tool
 * Interactive project exploration with transportable UI events
 */

import { readdir, stat, readFile } from "fs/promises";
import { join, relative, extname, basename } from "path";

// Event-driven system types
interface ExplorerEvent {
  type: 'EXPLORE' | 'SCAN' | 'ANALYZE' | 'TRANSPORT' | 'UI_UPDATE';
  timestamp: string;
  data: unknown;
  metadata?: {
    source: string;
    transportable: boolean;
    ui_ready: boolean;
  };
}

interface ProjectNode {
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  extension?: string;
  children?: ProjectNode[];
  metadata: {
    lastModified?: Date;
    isConfig?: boolean;
    isComponent?: boolean;
    isScript?: boolean;
    isTest?: boolean;
    complexity?: 'simple' | 'moderate' | 'complex';
    importance?: 'low' | 'medium' | 'high' | 'critical';
  };
}

interface MicroUXState {
  currentPath: string;
  explorationDepth: number;
  filters: string[];
  viewMode: 'tree' | 'list' | 'grid' | 'graph';
  transportableEvents: ExplorerEvent[];
}

class MicroUXExplorer {
  private state: MicroUXState;
  private eventQueue: ExplorerEvent[] = [];

  constructor(private rootPath: string = './') {
    this.state = {
      currentPath: rootPath,
      explorationDepth: 3,
      filters: ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'],
      viewMode: 'tree',
      transportableEvents: []
    };
  }

  // 🎯 Event creation with transportable UI metadata
  private createEvent(type: ExplorerEvent['type'], data: unknown, transportable = true): ExplorerEvent {
    const event: ExplorerEvent = {
      type,
      timestamp: new Date().toISOString(),
      data,
      metadata: {
        source: 'micro-ux-explorer',
        transportable,
        ui_ready: this.isUIReady(data)
      }
    };

    this.eventQueue.push(event);
    if (transportable) {
      this.state.transportableEvents.push(event);
    }

    return event;
  }

  // 🎨 Check if data is ready for UI transport
  private isUIReady(data: Record<string, unknown>): boolean {
    return data &&
           typeof data === 'object' &&
           (Array.isArray(data) || data.hasOwnProperty('name') || data.hasOwnProperty('structure'));
  }

  // 📊 Analyze file complexity and importance
  private async analyzeFile(filePath: string): Promise<{
    complexity: 'simple' | 'moderate' | 'complex';
    importance: 'low' | 'medium' | 'high' | 'critical';
  }> {
    try {
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n').length;
      const hasImports = content.includes('import') || content.includes('require');
      const hasExports = content.includes('export') || content.includes('module.exports');
      const hasTypes = content.includes('interface') || content.includes('type ');
      const hasReact = content.includes('React') || content.includes('jsx') || content.includes('tsx');

      // Complexity analysis
      let complexity: 'simple' | 'moderate' | 'complex' = 'simple';
      if (lines > 100 && hasTypes && hasImports) complexity = 'moderate';
      if (lines > 300 || (hasReact && hasTypes && content.includes('useEffect'))) complexity = 'complex';

      // Importance analysis
      let importance: 'low' | 'medium' | 'high' | 'critical' = 'low';
      const fileName = basename(filePath).toLowerCase();

      if (fileName.includes('config') || fileName.includes('setup')) importance = 'high';
      if (fileName.includes('package.json') || fileName.includes('next.config')) importance = 'critical';
      if (fileName.includes('types') || fileName.includes('interface')) importance = 'medium';
      if (hasExports && hasTypes) importance = 'high';

      return { complexity, importance };

    } catch {
      return { complexity: 'simple', importance: 'low' };
    }
  }

  // 🔍 Deep scan with event-driven approach
  async scanDirectory(dirPath: string, depth = 0): Promise<ProjectNode[]> {
    if (depth > this.state.explorationDepth) return [];

    const _scanEvent = this.createEvent('SCAN', {
      path: dirPath,
      depth,
      status: 'started'
    });

    try {
      const items = await readdir(dirPath);
      const nodes: ProjectNode[] = [];

      for (const item of items) {
        // Skip hidden files and node_modules in shallow scan
        if (item.startsWith('.') && depth === 0) continue;
        if (item === 'node_modules' && depth < 2) continue;

        const fullPath = join(dirPath, item);
        const stats = await stat(fullPath);
        const isDirectory = stats.isDirectory();
        const ext = isDirectory ? undefined : extname(item);

        // Apply filters for files
        if (!isDirectory && this.state.filters.length > 0 && ext) {
          if (!this.state.filters.includes(ext)) continue;
        }

        const analysis = isDirectory ?
          { complexity: 'simple' as const, importance: 'low' as const } :
          await this.analyzeFile(fullPath);

        const node: ProjectNode = {
          name: item,
          path: relative(this.rootPath, fullPath),
          type: isDirectory ? 'directory' : 'file',
          size: isDirectory ? undefined : stats.size,
          extension: ext,
          metadata: {
            lastModified: stats.mtime,
            isConfig: item.includes('config') || item.includes('.json'),
            isComponent: ext === '.tsx' || ext === '.jsx',
            isScript: ext === '.ts' || ext === '.js',
            isTest: item.includes('test') || item.includes('spec'),
            ...analysis
          }
        };

        // Recursively scan directories
        if (isDirectory && depth < this.state.explorationDepth) {
          node.children = await this.scanDirectory(fullPath, depth + 1);
        }

        nodes.push(node);
      }

      // Sort by importance and type
      nodes.sort((a, b) => {
        const importanceOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        const aImportance = importanceOrder[a.metadata.importance || 'low'];
        const bImportance = importanceOrder[b.metadata.importance || 'low'];

        if (aImportance !== bImportance) return bImportance - aImportance;
        if (a.type !== b.type) return a.type === 'directory' ? -1 : 1;
        return a.name.localeCompare(b.name);
      });

      this.createEvent('SCAN', {
        path: dirPath,
        depth,
        status: 'completed',
        count: nodes.length,
        nodes: nodes.map(n => ({ name: n.name, type: n.type, importance: n.metadata.importance }))
      });

      return nodes;

    } catch (error) {
      this.createEvent('SCAN', {
        path: dirPath,
        depth,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
      return [];
    }
  }

  // 📈 Generate project structure analysis
  async analyzeProject(): Promise<any> {
    const _analysisEvent = this.createEvent('ANALYZE', { status: 'started' });

    const structure = await this.scanDirectory(this.state.currentPath);

    // Count statistics
    const stats = {
      totalFiles: 0,
      totalDirectories: 0,
      byType: {} as Record<string, number>,
      byImportance: { critical: 0, high: 0, medium: 0, low: 0 },
      byComplexity: { complex: 0, moderate: 0, simple: 0 }
    };

    const countNode = (node: ProjectNode) => {
      if (node.type === 'file') {
        stats.totalFiles++;
        const ext = node.extension || 'unknown';
        stats.byType[ext] = (stats.byType[ext] || 0) + 1;
        stats.byImportance[node.metadata.importance || 'low']++;
        stats.byComplexity[node.metadata.complexity || 'simple']++;
      } else {
        stats.totalDirectories++;
      }

      if (node.children) {
        node.children.forEach(countNode);
      }
    };

    structure.forEach(countNode);

    const analysis = {
      structure,
      statistics: stats,
      insights: this.generateInsights(stats, structure),
      transportable_ui_data: {
        tree_view: this.generateTreeView(structure),
        grid_view: this.generateGridView(structure),
        graph_data: this.generateGraphData(structure)
      }
    };

    this.createEvent('ANALYZE', {
      status: 'completed',
      analysis,
      ui_ready: true
    });

    return analysis;
  }

  // 🧠 Generate actionable insights
  private generateInsights(stats: unknown, structure: ProjectNode[]): string[] {
    const insights: string[] = [];

    const totalFiles = stats.totalFiles;
    const criticalFiles = stats.byImportance.critical;
    const complexFiles = stats.byComplexity.complex;

    if (criticalFiles > 0) {
      insights.push(`🎯 ${criticalFiles} critical files identified - prioritize for review`);
    }

    if (complexFiles > totalFiles * 0.2) {
      insights.push(`⚠️  High complexity ratio (${Math.round(complexFiles/totalFiles*100)}%) - consider refactoring`);
    }

    if (stats.byType['.tsx'] && stats.byType['.ts']) {
      insights.push(`⚛️  React TypeScript project detected - ${stats.byType['.tsx']} components, ${stats.byType['.ts']} utilities`);
    }

    if (stats.byType['.json'] > 5) {
      insights.push(`📄 Multiple config files (${stats.byType['.json']}) - consolidation opportunity`);
    }

    return insights;
  }

  // 🌳 Generate tree view data for UI transport
  private generateTreeView(nodes: ProjectNode[], indent = 0): unknown[] {
    return nodes.map(node => ({
      id: node.path,
      label: node.name,
      type: node.type,
      indent,
      icon: this.getNodeIcon(node),
      metadata: node.metadata,
      children: node.children ? this.generateTreeView(node.children, indent + 1) : undefined,
      expandable: !!node.children?.length,
      ui_props: {
        className: `tree-node tree-node--${node.type} importance--${node.metadata.importance}`,
        style: { paddingLeft: `${indent * 16}px` }
      }
    }));
  }

  // 📊 Generate grid view data
  private generateGridView(nodes: ProjectNode[]): unknown[] {
    const flattenNodes = (nodeList: ProjectNode[]): ProjectNode[] => {
      let result: ProjectNode[] = [];
      for (const node of nodeList) {
        result.push(node);
        if (node.children) {
          result = result.concat(flattenNodes(node.children));
        }
      }
      return result;
    };

    return flattenNodes(nodes)
      .filter(node => node.type === 'file')
      .map(node => ({
        id: node.path,
        name: node.name,
        type: node.extension || 'file',
        importance: node.metadata.importance,
        complexity: node.metadata.complexity,
        size: node.size,
        lastModified: node.metadata.lastModified,
        ui_props: {
          className: `grid-item complexity--${node.metadata.complexity} importance--${node.metadata.importance}`,
          badge: node.metadata.importance === 'critical' ? '!' :
                 node.metadata.complexity === 'complex' ? '⚡' : '',
        }
      }));
  }

  // 🕸️ Generate graph data for network visualization
  private generateGraphData(nodes: ProjectNode[]): any {
    const graphNodes: unknown[] = [];
    const graphEdges: unknown[] = [];

    const processNode = (node: ProjectNode, parentId?: string) => {
      const nodeId = node.path;

      graphNodes.push({
        id: nodeId,
        label: node.name,
        type: node.type,
        group: node.type,
        importance: node.metadata.importance,
        size: node.metadata.importance === 'critical' ? 20 :
              node.metadata.importance === 'high' ? 15 : 10,
        color: this.getImportanceColor(node.metadata.importance || 'low')
      });

      if (parentId) {
        graphEdges.push({
          from: parentId,
          to: nodeId,
          arrows: 'to'
        });
      }

      if (node.children) {
        node.children.forEach(child => processNode(child, nodeId));
      }
    };

    nodes.forEach(node => processNode(node));

    return { nodes: graphNodes, edges: graphEdges };
  }

  // 🎨 UI Helper functions
  private getNodeIcon(node: ProjectNode): string {
    if (node.type === 'directory') return '📁';

    switch (node.extension) {
      case '.tsx': case '.jsx': return '⚛️';
      case '.ts': case '.js': return '📄';
      case '.json': return '⚙️';
      case '.md': return '📝';
      case '.scss': case '.css': return '🎨';
      default: return '📄';
    }
  }

  private getImportanceColor(importance: string): string {
    switch (importance) {
      case 'critical': return '#ef4444'; // red
      case 'high': return '#f59e0b';     // amber
      case 'medium': return '#3b82f6';   // blue
      default: return '#6b7280';         // gray
    }
  }

  // 🚀 Main exploration command
  async explore(options: {
    path?: string;
    depth?: number;
    filters?: string[];
    output?: 'json' | 'table' | 'tree' | 'ui';
  } = {}): Promise<void> {
    // Update state with options
    if (options.path) this.state.currentPath = options.path;
    if (options.depth) this.state.explorationDepth = options.depth;
    if (options.filters) this.state.filters = options.filters;

    const _exploreEvent = this.createEvent('EXPLORE', {
      options,
      state: this.state
    });

    console.log('🔍 Starting Micro UX Project Explorer...\n');

    const analysis = await this.analyzeProject();

    // Output based on format
    switch (options.output || 'json') {
      case 'json':
        console.log(JSON.stringify(analysis, null, 2));
        break;

      case 'ui':
        console.log('🎨 UI-Ready Transportable Data:');
        console.log(JSON.stringify(analysis.transportable_ui_data, null, 2));
        break;

      case 'tree':
        this.printTreeView(analysis.structure);
        break;

      case 'table':
        this.printTableView(analysis.statistics);
        break;
    }

    // Create transport event for UI
    this.createEvent('TRANSPORT', {
      ui_data: analysis.transportable_ui_data,
      events: this.state.transportableEvents,
      ready_for_client: true
    });

    console.log(`\n✨ Exploration completed. ${this.eventQueue.length} events generated.`);
    console.log(`📊 Scanned ${analysis.statistics.totalFiles} files and ${analysis.statistics.totalDirectories} directories`);

    if (analysis.insights.length > 0) {
      console.log('\n🧠 Insights:');
      analysis.insights.forEach(insight => console.log(`   ${insight}`));
    }
  }

  // 🖨️ Print utilities
  private printTreeView(nodes: ProjectNode[], indent = 0): void {
    nodes.forEach(node => {
      const prefix = '  '.repeat(indent);
      const icon = this.getNodeIcon(node);
      const importance = node.metadata.importance === 'critical' ? ' 🔥' :
                        node.metadata.importance === 'high' ? ' ⭐' : '';

      console.log(`${prefix}${icon} ${node.name}${importance}`);

      if (node.children) {
        this.printTreeView(node.children, indent + 1);
      }
    });
  }

  private printTableView(stats: unknown): void {
    console.log('📊 Project Statistics:');
    console.log(`   Files: ${stats.totalFiles}`);
    console.log(`   Directories: ${stats.totalDirectories}`);
    console.log('\n📁 By File Type:');
    Object.entries(stats.byType).forEach(([ext, count]) => {
      console.log(`   ${ext}: ${count}`);
    });
    console.log('\n⭐ By Importance:');
    Object.entries(stats.byImportance).forEach(([level, count]) => {
      console.log(`   ${level}: ${count}`);
    });
  }
}

// 🎯 CLI Interface
async function main() {
  const args = process.argv.slice(2);
  const explorer = new MicroUXExplorer('./');

  const options: unknown = {};

  // Parse command line arguments
  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--path':
        options.path = args[++i];
        break;
      case '--depth':
        options.depth = parseInt(args[++i]);
        break;
      case '--filters':
        options.filters = args[++i].split(',');
        break;
      case '--output':
        options.output = args[++i];
        break;
      case '--help':
        console.log(`
🔍 Micro UX Explorer - Event-Driven Project Structure Tool

Usage: bun micro-ux-explorer.ts [options]

Options:
  --path <path>          Target directory to explore (default: ./)
  --depth <number>       Maximum exploration depth (default: 3)
  --filters <ext,ext>    File extensions to include (default: .ts,.tsx,.js,.jsx,.json,.md)
  --output <format>      Output format: json|table|tree|ui (default: json)
  --help                 Show this help message

Examples:
  bun micro-ux-explorer.ts --output tree
  bun micro-ux-explorer.ts --path ./app --depth 2 --output ui
  bun micro-ux-explorer.ts --filters .tsx,.ts --output table
        `);
        process.exit(0);
    }
  }

  try {
    await explorer.explore(options);
  } catch (error) {
    console.error('❌ Explorer failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (import.meta.main) {
  main();
}

export { MicroUXExplorer, type ExplorerEvent, type ProjectNode, type MicroUXState };
