import { NextRequest, NextResponse } from "next/server";
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

class ServerMicroUXExplorer {
  private rootPath: string;
  private explorationDepth: number;
  private filters: string[];
  private eventQueue: ExplorerEvent[] = [];

  constructor(rootPath: string = process.cwd()) {
    this.rootPath = rootPath;
    this.explorationDepth = 3;
    this.filters = ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'];
  }

  // 🎯 Event creation with transportable UI metadata
  private createEvent(type: ExplorerEvent['type'], data: unknown, transportable = true): ExplorerEvent {
    const event: ExplorerEvent = {
      type,
      timestamp: new Date().toISOString(),
      data,
      metadata: {
        source: 'server-micro-ux-explorer',
        transportable,
        ui_ready: this.isUIReady(data)
      }
    };

    this.eventQueue.push(event);
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
    if (depth > this.explorationDepth) return [];

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
        if (!isDirectory && this.filters.length > 0 && ext) {
          if (!this.filters.includes(ext)) continue;
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
        if (isDirectory && depth < this.explorationDepth) {
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

  // 📈 Generate project structure analysis
  async analyzeProject(): Promise<any> {
    const _analysisEvent = this.createEvent('ANALYZE', { status: 'started' });

    const structure = await this.scanDirectory(this.rootPath);

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
}

// API Route Handlers
export async function GET(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const path = searchParams.get('path') || process.cwd();
    const depth = parseInt(searchParams.get('depth') || '3');
    const filters = searchParams.get('filters')?.split(',') || ['.ts', '.tsx', '.js', '.jsx', '.json', '.md'];

    // Create explorer instance
    const explorer = new ServerMicroUXExplorer(path);
    explorer['explorationDepth'] = depth;
    explorer['filters'] = filters;

    // Generate analysis
    const analysis = await explorer.analyzeProject();

    // Add performance metrics
    const duration = Date.now() - startTime;
    const response = {
      ...analysis,
      metadata: {
        timestamp: new Date().toISOString(),
        duration_ms: duration,
        api_version: '1.0.0',
        source: 'project-explorer-api',
        cache_key: `explorer-${Date.now()}`,
        ui_ready: true
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Explorer-Duration': duration.toString(),
        'X-Files-Scanned': analysis.statistics.totalFiles.toString(),
      }
    });

  } catch (error) {
    console.error('Project Explorer API Error:', error);

    return NextResponse.json({
      error: 'Failed to explore project structure',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime
    }, {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}

// POST endpoint for targeted exploration
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body = await request.json();
    const { path, depth = 3, filters, targetFiles } = body;

    const explorer = new ServerMicroUXExplorer(path || process.cwd());
    explorer['explorationDepth'] = depth;
    if (filters) explorer['filters'] = filters;

    const analysis = await explorer.analyzeProject();

    // Filter results if targetFiles specified
    if (targetFiles && Array.isArray(targetFiles)) {
      analysis.transportable_ui_data.tree_view = analysis.transportable_ui_data.tree_view.filter(
        (event: Event) => targetFiles.some(target => node.label.includes(target))
      );
      analysis.transportable_ui_data.grid_view = analysis.transportable_ui_data.grid_view.filter(
        (event: Event) => targetFiles.some(target => node.name.includes(target))
      );
    }

    const response = {
      ...analysis,
      metadata: {
        timestamp: new Date().toISOString(),
        duration_ms: Date.now() - startTime,
        api_version: '1.0.0',
        source: 'project-explorer-api-post',
        targeted: !!targetFiles,
        ui_ready: true
      }
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Explorer-Duration': (Date.now() - startTime).toString(),
        'X-Files-Scanned': analysis.statistics.totalFiles.toString(),
      }
    });

  } catch (error) {
    console.error('Project Explorer POST API Error:', error);

    return NextResponse.json({
      error: 'Failed to process exploration request',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString(),
      duration_ms: Date.now() - startTime
    }, {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}
