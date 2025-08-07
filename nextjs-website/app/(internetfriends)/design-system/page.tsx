"use client";

import React, { useCallback, useMemo, useState } from "react";
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
  Panel,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

import { ComponentNode } from "./nodes/component.node";
import { UtilityNode } from "./nodes/utility.node";
import { PageNode } from "./nodes/page.node";
import { HookNode } from "./nodes/hook.node";
import { componentRegistry } from "./registry/component.registry";
import { ButtonAtomic } from "@/components/atomic/button";
import { GlassCardAtomic } from "@/components/atomic/glass-card";

const nodeTypes = {
  component: ComponentNode,
  utility: UtilityNode,
  page: PageNode,
  hook: HookNode,
};

function DesignSystemFlow() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showStats, setShowStats] = useState(true);

  // Generate nodes and edges from registry
  const initialNodes = useMemo(() => componentRegistry.generateFlowNodes(), []);
  const initialEdges = useMemo(() => componentRegistry.generateFlowEdges(), []);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Filter nodes based on search and category
  const filteredNodes = useMemo(() => {
    let filtered = nodes;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (node) =>
          node.data.label?.toLowerCase().includes(query) ||
          node.data.description?.toLowerCase().includes(query),
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (node) =>
          node.type === selectedCategory ||
          node.data.category === selectedCategory,
      );
    }

    return filtered;
  }, [nodes, searchQuery, selectedCategory]);

  const stats = useMemo(() => componentRegistry.getComponentStats(), []);

  const proOptions = { _hideAttribution: true };

  return (
    <div className="w-full h-screen bg-background">
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        proOptions={proOptions}
        fitView
        className="bg-background"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          _color="var(--if-primary)"
          style={{ _opacity: 0.1 }}
        />

        {/* Header Panel */}
        <Panel
          position="top-left"
          className="bg-glass-header backdrop-blur-glass border border-glass-border rounded-compact-lg p-4 min-w-[320px]"
        >
          <div className="space-y-4">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                InternetFriends Design System
              </h1>
              <p className="text-sm text-muted-foreground">
                Visual component architecture & registry
              </p>
            </div>

            {/* Search */}
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search components, utilities, hooks..."
                value={searchQuery}
                onChange={(_e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background/80 border border-border rounded-compact-sm focus:outline-none focus:ring-2 focus:ring-if-primary focus:border-transparent"
              />

              {/* Category Filter */}
              <select
                value={selectedCategory}
                onChange={(_e) => setSelectedCategory(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-background/80 border border-border rounded-compact-sm focus:outline-none focus:ring-2 focus:ring-if-primary focus:border-transparent"
              >
                <option value="all">All Categories</option>
                <option value="component">Components</option>
                <option value="atomic">Atomic</option>
                <option value="molecular">Molecular</option>
                <option value="organism">Organism</option>
                <option value="utility">Utilities</option>
                <option value="hook">Hooks</option>
                <option value="page">Pages</option>
              </select>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-compact-xs"></div>
                <span>Atomic</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-compact-xs"></div>
                <span>Molecular</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-compact-xs"></div>
                <span>Organism</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-compact-xs"></div>
                <span>Utility</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 rounded-compact-xs"></div>
                <span>Hook</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-gradient-to-br from-indigo-50 to-indigo-100 border border-indigo-200 rounded-compact-xs"></div>
                <span>Page</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2">
              <ButtonAtomic
                size="sm"
                variant="outline"
                onClick={() => setShowStats(!showStats)}
              >
                {showStats ? "Hide" : "Show"} Stats
              </ButtonAtomic>
              <ButtonAtomic
                size="sm"
                variant="ghost"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("all");
                }}
              >
                Clear Filters
              </ButtonAtomic>
            </div>
          </div>
        </Panel>

        {/* Stats Panel */}
        {showStats && (
          <Panel
            position="top-right"
            className="bg-glass-header backdrop-blur-glass border border-glass-border rounded-compact-md p-4"
          >
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">
                Registry Stats
              </h3>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <div className="text-muted-foreground">Components</div>
                  <div className="font-medium">{stats.total}</div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Stable</div>
                  <div className="font-medium text-green-600">
                    {stats.stable}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Beta</div>
                  <div className="font-medium text-yellow-600">
                    {stats.beta}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-muted-foreground">Planned</div>
                  <div className="font-medium text-blue-600">
                    {stats.planned}
                  </div>
                </div>
              </div>

              <div className="pt-2 border-t border-border space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Atomic:</span>
                  <span className="font-medium">{stats.atomic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Molecular:</span>
                  <span className="font-medium">{stats.molecular}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Organism:</span>
                  <span className="font-medium">{stats.organism}</span>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {/* Connection Legend */}
        <Panel
          position="bottom-left"
          className="bg-glass-header backdrop-blur-glass border border-glass-border rounded-compact-md p-3"
        >
          <div className="space-y-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-gray-400 rounded"></div>
              <span>Composition</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-if-primary rounded animate-pulse"></div>
              <span>Dependency</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-emerald-500 rounded"></div>
              <span>Hook Usage</span>
            </div>
          </div>
        </Panel>

        {/* Component Showcase */}
        <Panel
          position="bottom-right"
          className="bg-glass-header backdrop-blur-glass border border-glass-border rounded-compact-md p-4 max-w-xs"
        >
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-foreground">
              Live Components
            </h3>
            <div className="space-y-2">
              <GlassCardAtomic size="sm" className="p-2">
                <div className="text-xs">
                  <div className="font-medium">Glass Card</div>
                  <div className="text-muted-foreground">
                    Interactive preview
                  </div>
                </div>
              </GlassCardAtomic>

              <div className="flex gap-2">
                <ButtonAtomic size="sm" variant="primary">
                  Primary
                </ButtonAtomic>
                <ButtonAtomic size="sm" variant="ghost">
                  Glass
                </ButtonAtomic>
              </div>
            </div>
          </div>
        </Panel>

        <Controls className="bg-glass-header backdrop-blur-glass border border-glass-border rounded-compact-md" />

        <MiniMap
          className="bg-glass-header backdrop-blur-glass border border-glass-border rounded-compact-md"
          _nodeStrokeColor={(n) => {
            if (n.type === "component") return "#3b82f6";
            if (n.type === "utility") return "#f59e0b";
            if (n.type === "hook") return "#10b981";
            if (n.type === "page") return "#6366f1";
            return "#6b7280";
          }}
          _nodeColor={(n) => {
            if (n.type === "component") return "#dbeafe";
            if (n.type === "utility") return "#fef3c7";
            if (n.type === "hook") return "#d1fae5";
            if (n.type === "page") return "#e0e7ff";
            return "#f3f4f6";
          }}
        />
      </ReactFlow>
    </div>
  );
}

export default function DesignSystemPage() {
  return (
    <ReactFlowProvider>
      <DesignSystemFlow />
    </ReactFlowProvider>
  );
}
