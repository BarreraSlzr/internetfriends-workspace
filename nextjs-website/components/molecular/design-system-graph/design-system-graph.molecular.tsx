"use client";

import * as React from "react";
const { useState, useEffect, useCallback, useMemo } = React;
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
  useReactFlow,
  ReactFlowProvider,
  Position,
  MarkerType,
  BackgroundVariant,
} from 'reactflow';
import { Background as FlowBackground } from '@reactflow/background';
import { Controls as FlowControls } from '@reactflow/controls';
import dagre from 'dagre';
import 'reactflow/dist/style.css';
import {
  Layers,
  LayoutDashboard,
  GitBranch,
  Package,
  Zap,
  Database,
  ExternalLink,
  ArrowRight,
} from "lucide-react";

import { ComponentSnapshot } from "@/lib/design-system/component-snapshot-generator";
import { ButtonAtomic } from "@/components/atomic/button/button.atomic";
import styles from "./design-system-graph.module.scss";

// Define the actual component structure from API
interface ApiComponent {
  id: string;
  name: string;
  category: string;
  description: string;
  testStatus: string;
  usageCount: number;
  lastModified: string;
  generatedAt: string;
  dependencies?: string[];
  usedInPages?: string[];
}

interface DesignSystemGraphProps {
  components: ApiComponent[];
  onComponentSelect: (component: ApiComponent) => void;
  searchQuery?: string;
  selectedCategory?: string;
}

// Octopus.do-style component node
const OctopusNodeType = ({ data }: { data: any }) => {
  const { component, onSelect, isSelected, isHighlighted } = data;
  
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'atomic': return <Package className="w-4 h-4" />;
      case 'molecular': return <Zap className="w-4 h-4" />;
      case 'organism': return <Database className="w-4 h-4" />;
      default: return <Package className="w-4 h-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'atomic': return {
        bg: '#f0f9ff',
        border: '#3b82f6',
        text: '#1e40af',
        dot: '#3b82f6'
      };
      case 'molecular': return {
        bg: '#f0fdf4',
        border: '#10b981',
        text: '#047857',
        dot: '#10b981'
      };
      case 'organism': return {
        bg: '#fff7ed',
        border: '#f59e0b',
        text: '#92400e',
        dot: '#f59e0b'
      };
      default: return {
        bg: '#f8fafc',
        border: '#64748b',
        text: '#475569',
        dot: '#64748b'
      };
    }
  };

  const colors = getCategoryColor(component.category);
  
  return (
    <div 
      className={`${styles.octopusNode} ${isSelected ? styles.selected : ''} ${isHighlighted ? styles.highlighted : ''}`}
      style={{
        backgroundColor: colors.bg,
        borderColor: colors.border,
        boxShadow: isSelected 
          ? `0 0 0 2px ${colors.border}` 
          : isHighlighted 
            ? `0 0 0 1px ${colors.border}` 
            : '0 1px 3px rgba(0, 0, 0, 0.1)'
      }}
      onClick={() => onSelect?.(component)}
    >
      {/* Header */}
      <div className={styles.nodeHeader}>
        <div className={styles.nodeIcon} style={{ color: colors.text }}>
          {getCategoryIcon(component.category)}
        </div>
        <div 
          className={styles.categoryDot} 
          style={{ backgroundColor: colors.dot }}
        />
      </div>

      {/* Main content */}
      <div className={styles.nodeContent}>
        <h3 className={styles.nodeTitle} style={{ color: colors.text }}>
          {component.name}
        </h3>
        
        <div className={styles.nodeCategory} style={{ color: colors.text }}>
          {component.category}
        </div>

        {component.description && (
          <p className={styles.nodeDescription}>
            {component.description.length > 60 
              ? `${component.description.slice(0, 60)}...` 
              : component.description}
          </p>
        )}
      </div>

      {/* Footer metrics */}
      <div className={styles.nodeFooter}>
        <div className={styles.nodeMetric}>
          <span className={styles.metricValue}>{component.usageCount || 0}</span>
          <span className={styles.metricLabel}>uses</span>
        </div>
        
        {component.dependencies && (
          <div className={styles.nodeMetric}>
            <span className={styles.metricValue}>{component.dependencies.length}</span>
            <span className={styles.metricLabel}>deps</span>
          </div>
        )}

        <div className={styles.nodeActions}>
          <ExternalLink className="w-3 h-3" />
        </div>
      </div>

      {/* Connection points */}
      <div className={styles.nodeHandles}>
        <div className={`${styles.handle} ${styles.handleTop}`} />
        <div className={`${styles.handle} ${styles.handleRight}`} />
        <div className={`${styles.handle} ${styles.handleBottom}`} />
        <div className={`${styles.handle} ${styles.handleLeft}`} />
      </div>
    </div>
  );
};

// Page/Route node for site map visualization
const PageNodeType = ({ data }: { data: any }) => {
  const { page, onSelect, isSelected } = data;
  
  return (
    <div 
      className={`${styles.pageNode} ${isSelected ? styles.selected : ''}`}
      onClick={() => onSelect?.(page)}
    >
      <div className={styles.pageIcon}>
        <LayoutDashboard className="w-4 h-4" />
      </div>
      
      <div className={styles.pageContent}>
        <h3 className={styles.pageTitle}>{page.name}</h3>
        <div className={styles.pagePath}>{page.path}</div>
      </div>
      
      {page.components && (
        <div className={styles.pageComponents}>
          {page.components.slice(0, 3).map((comp: string, i: number) => (
            <div key={i} className={styles.componentChip}>{comp}</div>
          ))}
          {page.components.length > 3 && (
            <div className={styles.componentMore}>+{page.components.length - 3}</div>
          )}
        </div>
      )}
    </div>
  );
};

const nodeTypes = {
  component: OctopusNodeType,
  page: PageNodeType,
};

// Dagre layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ 
    rankdir: direction, 
    nodesep: 120, 
    ranksep: 150,
    marginx: 40,
    marginy: 40
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 240, height: 180 });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;
    node.position = {
      x: nodeWithPosition.x - 120,
      y: nodeWithPosition.y - 90,
    };

    return node;
  });

  return { nodes, edges };
};

// Enhanced dependency extraction with better relationship mapping
const extractDependencies = (components: ApiComponent[]): Edge[] => {
  const edges: Edge[] = [];
  
  if (!Array.isArray(components)) {
    console.warn('extractDependencies: components is not an array:', components);
    return [];
  }
  
  const componentMap = new Map(components.map(c => [c.name || c.id, c]));

  components.forEach(component => {
    if (!component || !component.dependencies) return;
    
    // Process real dependencies from the API
    component.dependencies.forEach(depPath => {
      // Extract component name from dependency path
      const depName = depPath.split('/').pop()?.split('.')[0];
      if (!depName) return;
      
      // Find the dependency component
      const dependency = components.find(c => 
        c.name.toLowerCase().includes(depName.toLowerCase()) ||
        c.id.includes(depName)
      );
      
      if (dependency && dependency.id !== component.id) {
        const edgeStyle = getEdgeStyle(dependency.category, component.category);
        
        edges.push({
          id: `${dependency.id}-${component.id}`,
          source: dependency.id,
          target: component.id,
          type: 'smoothstep',
          animated: edgeStyle.animated,
          style: { 
            stroke: edgeStyle.color,
            strokeWidth: edgeStyle.width,
            strokeDasharray: edgeStyle.dasharray
          },
          markerEnd: {
            type: MarkerType.Arrow,
            color: edgeStyle.color,
            width: 20,
            height: 20,
          },
        });
      }
    });
  });

  return edges;
};

const getEdgeStyle = (sourceCategory: string, targetCategory: string) => {
  if (sourceCategory === 'atomic' && targetCategory === 'molecular') {
    return { color: '#3b82f6', width: 2, animated: true, dasharray: undefined };
  }
  if (sourceCategory === 'molecular' && targetCategory === 'organism') {
    return { color: '#10b981', width: 2, animated: true, dasharray: undefined };
  }
  if (sourceCategory === 'atomic' && targetCategory === 'organism') {
    return { color: '#f59e0b', width: 2, animated: false, dasharray: '5,5' };
  }
  return { color: '#64748b', width: 1, animated: false, dasharray: undefined };
};

// Create site map view with pages and components
const createSiteMapView = (components: ApiComponent[]) => {
  const pageMap = new Map<string, { name: string; path: string; components: string[] }>();
  
  // Extract pages from component usage
  components.forEach(component => {
    if (component.usedInPages) {
      component.usedInPages.forEach(pageName => {
        if (!pageMap.has(pageName)) {
          pageMap.set(pageName, {
            name: pageName,
            path: `/${pageName}`,
            components: []
          });
        }
        pageMap.get(pageName)?.components.push(component.name);
      });
    }
  });

  // Create page nodes
  const pageNodes: Node[] = Array.from(pageMap.entries()).map(([id, page], index) => ({
    id: `page-${id}`,
    type: 'page',
    position: { x: index * 250, y: 0 },
    data: { page }
  }));

  // Create component nodes positioned below pages
  const componentNodes: Node[] = components.map((component, index) => ({
    id: component.id,
    type: 'component',
    position: { x: index * 250, y: 300 },
    data: { component }
  }));

  // Create edges from pages to components
  const pageEdges: Edge[] = [];
  pageMap.forEach((page, pageId) => {
    page.components.forEach(compName => {
      const component = components.find(c => c.name === compName);
      if (component) {
        pageEdges.push({
          id: `page-${pageId}-${component.id}`,
          source: `page-${pageId}`,
          target: component.id,
          type: 'straight',
          style: { stroke: '#e2e8f0', strokeWidth: 1 }
        });
      }
    });
  });

  return {
    nodes: [...pageNodes, ...componentNodes],
    edges: pageEdges
  };
};

function DesignSystemGraphInner({ 
  components, 
  onComponentSelect, 
  searchQuery = '', 
  selectedCategory = 'all' 
}: DesignSystemGraphProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [layoutDirection, setLayoutDirection] = useState<'TB' | 'LR'>('TB');
  const [viewMode, setViewMode] = useState<'component' | 'sitemap'>('component');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());
  const { fitView } = useReactFlow();

  // Filter components based on search and category
  const filteredComponents = useMemo(() => {
    if (!Array.isArray(components)) {
      console.warn('DesignSystemGraph: components is not an array:', components);
      return [];
    }
    
    let filtered = components;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(component =>
        component?.name?.toLowerCase().includes(query) ||
        component?.description?.toLowerCase().includes(query) ||
        component?.category?.toLowerCase().includes(query)
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(component =>
        component?.category === selectedCategory
      );
    }

    return filtered;
  }, [components, searchQuery, selectedCategory]);

  // Create nodes with enhanced styling and interactions
  const createNodes = useCallback((components: ApiComponent[]): Node[] => {
    return components.map((component) => ({
      id: component.id,
      type: 'component',
      position: { x: 0, y: 0 },
      data: {
        component,
        onSelect: (comp: ApiComponent) => {
          setSelectedNode(comp.id);
          onComponentSelect(comp);
          
          // Highlight connected nodes
          const connected = new Set<string>();
          if (comp.dependencies) {
            comp.dependencies.forEach(dep => {
              const depComp = components.find(c => 
                c.name.toLowerCase().includes(dep.split('/').pop()?.split('.')[0]?.toLowerCase() || '')
              );
              if (depComp) connected.add(depComp.id);
            });
          }
          
          // Find components that depend on this one
          components.forEach(c => {
            if (c.dependencies?.some(dep => 
              dep.includes(comp.name.toLowerCase()) || dep.includes(comp.id)
            )) {
              connected.add(c.id);
            }
          });
          
          setHighlightedNodes(connected);
        },
        isSelected: selectedNode === component.id,
        isHighlighted: highlightedNodes.has(component.id),
      },
      draggable: true,
      selectable: true,
    }));
  }, [onComponentSelect, selectedNode, highlightedNodes]);

  // Handle view mode changes
  const handleViewModeChange = useCallback((mode: 'component' | 'sitemap') => {
    setViewMode(mode);
    setSelectedNode(null);
    setHighlightedNodes(new Set());
  }, []);

  // Update nodes and edges when components or view mode changes
  useEffect(() => {
    console.log('DesignSystemGraph: Creating view for', viewMode, 'with', filteredComponents.length, 'components');
    
    let newNodes: Node[] = [];
    let newEdges: Edge[] = [];
    
    if (viewMode === 'sitemap') {
      const siteMapData = createSiteMapView(filteredComponents);
      newNodes = siteMapData.nodes;
      newEdges = siteMapData.edges;
    } else {
      newNodes = createNodes(filteredComponents);
      newEdges = extractDependencies(filteredComponents);
    }
    
    console.log('DesignSystemGraph: Created', newNodes.length, 'nodes and', newEdges.length, 'edges');
    
    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
      newNodes,
      newEdges,
      layoutDirection
    );

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [filteredComponents, createNodes, layoutDirection, viewMode]);

  // Auto-fit view when layout changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.1, duration: 800 });
    }, 100);
    return () => clearTimeout(timer);
  }, [nodes, fitView]);

  const handleLayoutChange = (direction: 'TB' | 'LR') => {
    setLayoutDirection(direction);
  };

  const getCategoryCount = (category: string) => {
    return components.filter(c => c?.category === category).length;
  };

  // Handle node clicks
  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    if (node.data?.component) {
      node.data.onSelect(node.data.component);
    }
  }, []);

  // Handle background click to clear selection
  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setHighlightedNodes(new Set());
  }, []);

  return (
    <div className={styles.graphContainer}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className={styles.reactFlow}
        minZoom={0.1}
        maxZoom={2}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
      >
        <FlowBackground 
          color="var(--color-border-subtle)" 
          gap={24} 
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <FlowControls 
          className={styles.controls}
          showZoom={true}
          showFitView={true}
          showInteractive={true}
        />

        {/* Enhanced Control Panel */}
        <Panel position="top-left" className={styles.controlPanel}>
          <div className={styles.panelContent}>
            <h3 className={styles.panelTitle}>
              <Layers className="w-5 h-5" />
              {viewMode === 'sitemap' ? 'Site Map' : 'Component Graph'}
            </h3>
            
            {/* View Mode Toggle */}
            <div className={styles.viewModeControls}>
              <span className={styles.controlLabel}>View:</span>
              <div className={styles.buttonGroup}>
                <ButtonAtomic
                  variant={viewMode === 'component' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('component')}
                  className={styles.viewButton}
                >
                  <Package className="w-4 h-4" />
                  Components
                </ButtonAtomic>
                <ButtonAtomic
                  variant={viewMode === 'sitemap' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleViewModeChange('sitemap')}
                  className={styles.viewButton}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Site Map
                </ButtonAtomic>
              </div>
            </div>
            
            {/* Layout Controls */}
            <div className={styles.layoutControls}>
              <span className={styles.controlLabel}>Layout:</span>
              <div className={styles.buttonGroup}>
                <ButtonAtomic
                  variant={layoutDirection === 'TB' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleLayoutChange('TB')}
                  className={styles.layoutButton}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Vertical
                </ButtonAtomic>
                <ButtonAtomic
                  variant={layoutDirection === 'LR' ? 'primary' : 'outline'}
                  size="sm"
                  onClick={() => handleLayoutChange('LR')}
                  className={styles.layoutButton}
                >
                  <GitBranch className="w-4 h-4" />
                  Horizontal
                </ButtonAtomic>
              </div>
            </div>

            {/* Category Legend */}
            <div className={styles.legend}>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.atomic}`}></div>
                <span>Atomic ({getCategoryCount('atomic')})</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.molecular}`}></div>
                <span>Molecular ({getCategoryCount('molecular')})</span>
              </div>
              <div className={styles.legendItem}>
                <div className={`${styles.legendColor} ${styles.organism}`}></div>
                <span>Organism ({getCategoryCount('organism')})</span>
              </div>
            </div>
          </div>
        </Panel>

        {/* Enhanced Stats Panel */}
        <Panel position="top-right" className={styles.statsPanel}>
          <div className={styles.stat}>
            <strong>{filteredComponents.length}</strong>
            <span>{viewMode === 'sitemap' ? 'Pages & Components' : 'Components'}</span>
          </div>
          <div className={styles.stat}>
            <strong>{edges.length}</strong>
            <span>{viewMode === 'sitemap' ? 'Connections' : 'Dependencies'}</span>
          </div>
          {selectedNode && (
            <div className={styles.stat}>
              <strong>1</strong>
              <span>Selected</span>
            </div>
          )}
        </Panel>
      </ReactFlow>
    </div>
  );
}

export function DesignSystemGraph(props: DesignSystemGraphProps) {
  return (
    <ReactFlowProvider>
      <DesignSystemGraphInner {...props} />
    </ReactFlowProvider>
  );
}