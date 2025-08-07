"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import ReactFlow, {
  Node,
  Edge,
  Controls,
  MiniMap,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  ConnectionMode,
  Panel,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { ComponentPreviewNode as ComponentPreviewNodeType } from "./types";
import { ComponentPreviewNode } from "./component.preview.node";
import { componentRegistry } from "./component.registry";
import styles from "./component.flow.workspace.module.scss";

// Node types for React Flow
const nodeTypes = {
  componentPreview: ComponentPreviewNode,
};

interface ComponentFlowWorkspaceProps {
  initialNodes?: ComponentPreviewNodeType[];
  initialEdges?: Edge[];
  className?: string;
  theme?: 'light' | 'dark' | 'system';
  showMinimap?: boolean;
  showControls?: boolean;
  showComponentLibrary?: boolean;
  onNodeSelect?: (node: ComponentPreviewNodeType | null) => void;
  onWorkspaceChange?: (nodes: ComponentPreviewNodeType[], edges: Edge[]) => void;
}

interface ComponentLibraryItem {
  id: string;
  name: string;
  type: string;
  category: string;
  tags: string[];
}

export const ComponentFlowWorkspace: React.FC<ComponentFlowWorkspaceProps> = ({
  initialNodes = [],
  initialEdges = [],
  className = '',
  theme = 'system',
  showMinimap = true,
  showControls = true,
  showComponentLibrary = true,
  onNodeSelect,
  onWorkspaceChange,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [selectedNode, setSelectedNode] = useState<ComponentPreviewNodeType | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Get component library items
  const libraryItems = useMemo<ComponentLibraryItem[]>(() => {
    const components = componentRegistry.getAllComponents();
    return components.map(comp => ({
      id: comp.id,
      name: comp.metadata.componentName,
      type: comp.metadata.componentType,
      category: comp.metadata.category || 'general',
      tags: comp.metadata.tags || [],
    }));
  }, []);

  // Filter library items based on search and category
  const filteredLibraryItems = useMemo(() => {
    let filtered = libraryItems;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [libraryItems, selectedCategory, searchQuery]);

  // Get unique categories for filter
  const categories = useMemo(() => {
    const cats = Array.from(new Set(libraryItems.map(item => item.category)));
    return ['all', ...cats.sort()];
  }, [libraryItems]);

  // Handle connection between nodes
  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  // Handle node selection
  const handleNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    const componentNode = node as ComponentPreviewNodeType;
    setSelectedNode(componentNode);
    onNodeSelect?.(componentNode);
  }, [onNodeSelect]);

  // Handle pane click (deselect)
  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    onNodeSelect?.(null);
  }, [onNodeSelect]);

  // Add component from library
  const addComponentFromLibrary = useCallback((componentId: string) => {
    const componentEntry = componentRegistry.getComponent(componentId);
    if (!componentEntry) return;

    const newNode: ComponentPreviewNodeType = {
      id: `${componentId}-${Date.now()}`,
      type: 'componentPreview',
      position: {
        x: Math.random() * 300 + 100,
        y: Math.random() * 200 + 100,
      },
      data: componentEntry.metadata,
    };

    setNodes((nds) => nds.concat(newNode));
    setShowLibrary(false);
  }, [setNodes]);

  // Handle workspace changes
  useEffect(() => {
    onWorkspaceChange?.(nodes, edges);
  }, [nodes, edges, onWorkspaceChange]);

  // Auto-layout nodes
  const autoLayoutNodes = useCallback(() => {
    const layouted = nodes.map((node, index) => {
      const cols = Math.ceil(Math.sqrt(nodes.length));
      const row = Math.floor(index / cols);
      const col = index % cols;

      return {
        ...node,
        position: {
          x: col * 500 + 50,
          y: row * 400 + 50,
        },
      };
    });

    setNodes(layouted);
  }, [nodes, setNodes]);

  // Clear workspace
  const clearWorkspace = useCallback(() => {
    setNodes([]);
    setEdges([]);
    setSelectedNode(null);
  }, [setNodes, setEdges]);

  // Export workspace
  const exportWorkspace = useCallback(() => {
    const data = {
      nodes,
      edges,
      metadata: {
        exportedAt: new Date().toISOString(),
        nodeCount: nodes.length,
        edgeCount: edges.length,
      },
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `component-workspace-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [nodes, edges]);

  return (
    <div className={`${styles.workspace}${className}`} data-theme={theme}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeClick={handleNodeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView
        className={styles.reactFlow}
      >
        {showMinimap && (
          <MiniMap
            className={styles.minimap}
            nodeColor={(node) => {
              const data = node.data as any;
              switch (data?.componentType) {
                case 'atomic': return '#10b981';
                case 'molecular': return '#3b82f6';
                case 'organism': return '#8b5cf6';
                case 'template': return '#ec4899';
                default: return '#6b7280';
              }
            }}
          />
        )}

        {showControls && <Controls className={styles.controls} />}

        <Background variant="dots" gap={20} size={1} className={styles.background} />

        {/* Toolbar Panel */}
        <Panel position="top-left" className={styles.toolbar}>
          <div className={styles.toolbarGroup}>
            <button
              className={`${styles.toolBtn}${showLibrary ? styles.active : ''}`}
              onClick={() => setShowLibrary(!showLibrary)}
              title="Toggle Component Library"
            >
              📚 Library
            </button>

            <button
              className={styles.toolBtn}
              onClick={autoLayoutNodes}
              title="Auto Layout Components"
              disabled={nodes.length === 0}
            >
              🎯 Layout
            </button>

            <button
              className={styles.toolBtn}
              onClick={clearWorkspace}
              title="Clear Workspace"
              disabled={nodes.length === 0}
            >
              🗑️ Clear
            </button>

            <button
              className={styles.toolBtn}
              onClick={exportWorkspace}
              title="Export Workspace"
              disabled={nodes.length === 0}
            >
              💾 Export
            </button>
          </div>

          {/* Workspace Stats */}
          <div className={styles.stats}>
            <span>{nodes.length} components</span>
            <span>{edges.length} connections</span>
          </div>
        </Panel>

        {/* Selected Node Info Panel */}
        {selectedNode && (
          <Panel position="bottom-right" className={styles.nodeInfo}>
            <div className={styles.nodeInfoContent}>
              <h3>{selectedNode.data.componentName}</h3>
              <p>Type: <code>{selectedNode.data.componentType}</code></p>
              <p>Category: <code>{selectedNode.data.category || 'general'}</code></p>

              {selectedNode.data.tags && (
                <div className={styles.tags}>
                  {selectedNode.data.tags.map((tag) => (
                    <span key={tag} className={styles.tag}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {selectedNode.data.documentation?.description && (
                <p className={styles.description}>
                  {selectedNode.data.documentation.description}
                </p>
              )}
            </div>
          </Panel>
        )}
      </ReactFlow>

      {/* Component Library Sidebar */}
      {showComponentLibrary && showLibrary && (
        <div className={styles.libraryPanel}>
          <div className={styles.libraryHeader}>
            <h2>Component Library</h2>
            <button
              className={styles.closeBtn}
              onClick={() => setShowLibrary(false)}
              title="Close Library"
            >
              ✕
            </button>
          </div>

          {/* Search and Filter */}
          <div className={styles.libraryControls}>
            <input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />

            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className={styles.categorySelect}
            >
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
          </div>

          {/* Component List */}
          <div className={styles.componentList}>
            {filteredLibraryItems.length === 0 ? (
              <div className={styles.emptyState}>
                <p>No components found</p>
                <small>Try adjusting your search or category filter</small>
              </div>
            ) : (
              filteredLibraryItems.map((item) => (
                <div
                  key={item.id}
                  className={styles.componentItem}
                  onClick={() => addComponentFromLibrary(item.id)}
                  title={`Add ${item.name} to workspace`}
                >
                  <div className={styles.componentHeader}>
                    <h4>{item.name}</h4>
                    <span className={`${styles.componentType}${styles[item.type]}`}>
                      {item.type}
                    </span>
                  </div>

                  <p className={styles.componentCategory}>
                    {item.category}
                  </p>

                  {item.tags.length > 0 && (
                    <div className={styles.componentTags}>
                      {item.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className={styles.componentTag}>
                          {tag}
                        </span>
                      ))}
                      {item.tags.length > 3 && (
                        <span className={styles.moreTag}>
                          +{item.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Library Stats */}
          <div className={styles.libraryFooter}>
            <small>
              {filteredLibraryItems.length} of {libraryItems.length} components
            </small>
          </div>
        </div>
      )}
    </div>
  );
};

// Wrapper component with ReactFlowProvider
export const ComponentFlowWorkspaceProvider: React.FC<ComponentFlowWorkspaceProps> = (props) => {
  return (
    <ReactFlowProvider>
      <ComponentFlowWorkspace {...props} />
    </ReactFlowProvider>
  );
};

export default ComponentFlowWorkspaceProvider;
