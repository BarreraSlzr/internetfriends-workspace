"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  ReactFlow,
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  useNodesState,
  useEdgesState,
  ConnectionMode,
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";
import {
  ComponentMetadata,
  ComponentGraphData,
} from "@/scripts/build-component-graph";
import { useTheme } from "@/hooks/use-theme";
import { GlassPanel } from "@/components/glass";
import { DashboardMetric } from "@/components/data/metric-display";
import {
  Layers3,
  Zap,
  Palette,
  Settings,
  RefreshCw,
  Filter,
  Eye,
  EyeOff,
  BarChart3,
  GitBranch,
  Cpu,
} from "lucide-react";

// Node types for different component categories - will be defined inline

interface ComponentNodeData extends ComponentMetadata {
  selected?: boolean;
  highlighted?: boolean;
}

function ComponentNode({ data }: { data: ComponentNodeData }) {
  const { theme } = useTheme();
  const isDark = theme.colorScheme === "dark";

  // Risk score color coding
  const getRiskColor = (score: number) => {
    if (score <= 4) return isDark ? "#10b981" : "#059669"; // green
    if (score <= 7) return isDark ? "#f59e0b" : "#d97706"; // amber
    return isDark ? "#ef4444" : "#dc2626"; // red
  };

  // Category color coding
  const getCategoryColor = (kind: string) => {
    const colors = {
      atomic: isDark ? "#3b82f6" : "#2563eb",
      molecular: isDark ? "#8b5cf6" : "#7c3aed",
      organism: isDark ? "#ec4899" : "#db2777",
      utility: isDark ? "#6b7280" : "#374151",
      hook: isDark ? "#06b6d4" : "#0891b2",
      page: isDark ? "#f59e0b" : "#d97706",
    };
    return colors[kind as keyof typeof colors] || colors.utility;
  };

  const badges = [];
  if (data.uses.glass) badges.push("G");
  if (data.uses.goo) badges.push("A");
  if (data.uses.noise) badges.push("N");
  if (data.uses.vignette) badges.push("V");
  if (data.uses.motion) badges.push("M");
  if (data.tokensReferenced.length >= 3) badges.push("T");

  return (
    <div
      className="component-node"
      style={{
        padding: "8px 12px",
        background: isDark
          ? "rgba(17, 24, 39, 0.95)"
          : "rgba(255, 255, 255, 0.95)",
        border: `2px solid ${getCategoryColor(data.kind)}`,
        borderRadius: "8px",
        backdropFilter: "blur(8px)",
        minWidth: "160px",
        boxShadow: data.selected
          ? `0 0 0 2px ${getRiskColor(data.riskScore)}`
          : "0 2px 8px rgba(0,0,0,0.1)",
        transform: data.highlighted ? "scale(1.05)" : "scale(1)",
        transition: "all 0.2s ease",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "6px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: "600",
            color: getCategoryColor(data.kind),
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          {data.kind}
        </span>
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: getRiskColor(data.riskScore),
          }}
        />
      </div>

      {/* Component name */}
      <div
        style={{
          fontSize: "13px",
          fontWeight: "600",
          color: isDark ? "#f3f4f6" : "#111827",
          marginBottom: "4px",
          lineHeight: "1.2",
        }}
      >
        {data.exportName}
      </div>

      {/* File path */}
      <div
        style={{
          fontSize: "10px",
          color: isDark ? "#9ca3af" : "#6b7280",
          marginBottom: "6px",
          fontFamily: "var(--font-mono)",
        }}
      >
        {data.filePath.split("/").slice(-2).join("/")}
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: "3px",
            flexWrap: "wrap",
          }}
        >
          {badges.map((badge, i) => (
            <span
              key={i}
              style={{
                fontSize: "8px",
                fontWeight: "700",
                padding: "2px 4px",
                borderRadius: "3px",
                backgroundColor: isDark
                  ? "rgba(59, 130, 246, 0.2)"
                  : "rgba(59, 130, 246, 0.1)",
                color: isDark ? "#93c5fd" : "#2563eb",
                border: "1px solid rgba(59, 130, 246, 0.3)",
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      )}

      {/* Metrics */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: "6px",
          fontSize: "9px",
          color: isDark ? "#9ca3af" : "#6b7280",
          fontFamily: "var(--font-mono)",
        }}
      >
        <span>LOC: {data.size.loc}</span>
        <span>Props: {data.props.total}</span>
        <span>Risk: {data.riskScore}</span>
      </div>
    </div>
  );
}

// Node types for different component categories
const nodeTypes = {
  component: ComponentNode,
};

export default function ComponentMapPage() {
  const { theme } = useTheme();
  const isDark = theme.colorScheme === "dark";

  const [graphData, setGraphData] = useState<ComponentGraphData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const [selectedNode, setSelectedNode] = useState<ComponentMetadata | null>(
    null,
  );
  const [filters, setFilters] = useState({
    showOnlyAtmospheric: false,
    showOnlyHighRisk: false,
    hideUtilities: false,
    minTokens: 0,
  });

  // Fetch component graph data
  const fetchGraphData = useCallback(async (refresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const url = `/api/dev/component-graph${refresh ? "?refresh=true" : ""}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const data: ComponentGraphData = await response.json();
      setGraphData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      console.error("Error fetching component graph:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchGraphData();
  }, [fetchGraphData]);

  // Convert component data to React Flow nodes
  const flowNodes = useMemo(() => {
    if (!graphData) return [];

    let filteredComponents = graphData.nodes;

    // Apply filters
    if (filters.showOnlyAtmospheric) {
      filteredComponents = filteredComponents.filter(
        (c) => c.uses.glass || c.uses.goo || c.uses.noise || c.uses.vignette,
      );
    }

    if (filters.showOnlyHighRisk) {
      filteredComponents = filteredComponents.filter((c) => c.riskScore > 6);
    }

    if (filters.hideUtilities) {
      filteredComponents = filteredComponents.filter(
        (c) => c.kind !== "utility",
      );
    }

    if (filters.minTokens > 0) {
      filteredComponents = filteredComponents.filter(
        (c) => c.tokensReferenced.length >= filters.minTokens,
      );
    }

    // Layout nodes in a hierarchical structure
    const nodesByKind = filteredComponents.reduce(
      (acc, component) => {
        if (!acc[component.kind]) acc[component.kind] = [];
        acc[component.kind].push(component);
        return acc;
      },
      {} as Record<string, ComponentMetadata[]>,
    );

    const nodes: Node<ComponentNodeData>[] = [];
    let yOffset = 0;
    const kindOrder = [
      "atomic",
      "molecular",
      "organism",
      "utility",
      "hook",
      "page",
    ];

    kindOrder.forEach((kind) => {
      const components = nodesByKind[kind] || [];
      components.forEach((component, index) => {
        const x = (index % 6) * 200 + 50;
        const y = yOffset + Math.floor(index / 6) * 150;

        nodes.push({
          id: component.id,
          type: "component",
          position: { x, y },
          data: {
            ...component,
            selected: selectedNode?.id === component.id,
          },
        });
      });

      if (components.length > 0) {
        yOffset += Math.ceil(components.length / 6) * 150 + 50;
      }
    });

    return nodes;
  }, [graphData, filters, selectedNode]);

  // Convert edges
  const flowEdges = useMemo(() => {
    if (!graphData) return [];

    // Only show edges for visible nodes
    const visibleNodeIds = new Set(flowNodes.map((n) => n.id));

    return graphData.edges
      .filter(
        (edge) =>
          visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target),
      )
      .map((edge) => ({
        id: edge.id,
        source: edge.source,
        target: edge.target,
        type: "smoothstep",
        style: {
          stroke: isDark ? "#374151" : "#d1d5db",
          strokeWidth: Math.min(edge.weight + 1, 3),
        },
        animated: edge.weight > 2,
      }));
  }, [graphData, flowNodes, isDark]);

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: Node<ComponentNodeData>) => {
      setSelectedNode(node.data);
    },
    [],
  );

  // Rebuild graph
  const handleRebuild = useCallback(async () => {
    try {
      const response = await fetch("/api/dev/component-graph", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "rebuild" }),
      });

      if (response.ok) {
        await fetchGraphData(true);
      }
    } catch (err) {
      console.error("Error rebuilding graph:", err);
    }
  }, [fetchGraphData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg font-medium">Building Component Graph...</p>
          <p className="text-sm text-muted-foreground mt-2">
            This might take a moment on first load
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-destructive mb-4">
            ❌ Error loading component graph
          </div>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => fetchGraphData(true)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-background">
      <div style={{ width: "100vw", height: "100vh" }}>
        <ReactFlow
          nodes={flowNodes}
          edges={flowEdges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          connectionMode={ConnectionMode.Loose}
          fitView
          attributionPosition="top-right"
        >
          <Controls />
          <MiniMap
            nodeColor={(node) => {
              const data = node.data as ComponentNodeData;
              return data.riskScore > 7
                ? "#ef4444"
                : data.riskScore > 4
                  ? "#f59e0b"
                  : "#10b981";
            }}
            maskColor="rgb(240, 242, 247, 0.7)"
          />
          <Background variant="dots" gap={12} size={1} />

          {/* Top Panel - Stats */}
          <Panel position="top-left">
            <GlassPanel depth={2} noise="weak" className="p-4 min-w-[600px]">
              <h1 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Component Architecture Explorer
              </h1>

              {graphData && (
                <div className="grid grid-cols-5 gap-4">
                  <DashboardMetric
                    value={graphData.stats.totalComponents}
                    label="Components"
                    trend="neutral"
                  />
                  <DashboardMetric
                    value={graphData.stats.tokenCoverage}
                    unit="%"
                    label="Token Coverage"
                    trend={graphData.stats.tokenCoverage > 70 ? "up" : "down"}
                    accent
                  />
                  <DashboardMetric
                    value={graphData.stats.avgRiskScore}
                    label="Avg Risk"
                    trend={graphData.stats.avgRiskScore < 5 ? "up" : "down"}
                  />
                  <DashboardMetric
                    value={graphData.stats.atmoshericUsage}
                    unit="%"
                    label="Atmospheric"
                    trend="up"
                  />
                  <DashboardMetric
                    value={graphData.stats.legacyPatterns}
                    label="Legacy"
                    trend={graphData.stats.legacyPatterns === 0 ? "up" : "down"}
                  />
                </div>
              )}
            </GlassPanel>
          </Panel>

          {/* Left Panel - Filters */}
          <Panel position="top-right">
            <GlassPanel depth={2} noise="weak" className="p-4 min-w-[280px]">
              <div className="flex items-center gap-2 mb-3">
                <Filter className="h-4 w-4" />
                <span className="font-medium">Filters</span>
                <button
                  onClick={handleRebuild}
                  className="ml-auto p-1 hover:bg-accent rounded"
                  title="Rebuild graph"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>

              <div className="space-y-3">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.showOnlyAtmospheric}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        showOnlyAtmospheric: e.target.checked,
                      }))
                    }
                  />
                  <Palette className="h-3 w-3" />
                  Only Atmospheric
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.showOnlyHighRisk}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        showOnlyHighRisk: e.target.checked,
                      }))
                    }
                  />
                  <Zap className="h-3 w-3" />
                  High Risk Only
                </label>

                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={filters.hideUtilities}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        hideUtilities: e.target.checked,
                      }))
                    }
                  />
                  <EyeOff className="h-3 w-3" />
                  Hide Utilities
                </label>

                <div className="text-sm">
                  <label className="block mb-1">Min Tokens:</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    value={filters.minTokens}
                    onChange={(e) =>
                      setFilters((f) => ({
                        ...f,
                        minTokens: Number(e.target.value),
                      }))
                    }
                    className="w-full"
                  />
                  <span className="text-xs text-muted-foreground">
                    {filters.minTokens}
                  </span>
                </div>
              </div>
            </GlassPanel>
          </Panel>

          {/* Bottom Panel - Selected Component Details */}
          {selectedNode && (
            <Panel position="bottom-center">
              <GlassPanel depth={3} noise="weak" className="p-4 min-w-[500px]">
                <div className="flex items-center gap-2 mb-3">
                  <Cpu className="h-4 w-4" />
                  <span className="font-medium">{selectedNode.exportName}</span>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="ml-auto p-1 hover:bg-accent rounded"
                  >
                    ✕
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <div className="font-medium text-muted-foreground mb-1">
                      File Path
                    </div>
                    <div className="font-mono text-xs">
                      {selectedNode.filePath}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-muted-foreground mb-1">
                      Tokens Used
                    </div>
                    <div className="text-xs">
                      {selectedNode.tokensReferenced.length > 0
                        ? selectedNode.tokensReferenced.slice(0, 3).join(", ")
                        : "None"}
                    </div>
                  </div>

                  <div>
                    <div className="font-medium text-muted-foreground mb-1">
                      Atmospheric
                    </div>
                    <div className="flex gap-1">
                      {Object.entries(selectedNode.uses)
                        .filter(([key, value]) => key !== "hooks" && value)
                        .map(([key]) => (
                          <span
                            key={key}
                            className="text-xs bg-accent px-1 rounded"
                          >
                            {key}
                          </span>
                        ))}
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </Panel>
          )}
        </ReactFlow>
      </div>
    </div>
  );
}
