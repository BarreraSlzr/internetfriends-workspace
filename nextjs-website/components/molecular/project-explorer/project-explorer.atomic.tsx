"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, ChevronDown, ChevronRight, Grid, List } from "lucide-react";

// Event-driven types matching the micro-ux-explorer
interface ExplorerEvent {
  type: "EXPLORE" | "SCAN" | "ANALYZE" | "TRANSPORT" | "UI_UPDATE";
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
  type: "file" | "directory";
  size?: number;
  extension?: string;
  children?: ProjectNode[];
  metadata: {
    lastModified?: Date;
    isConfig?: boolean;
    isComponent?: boolean;
    isScript?: boolean;
    isTest?: boolean;
    complexity?: "simple" | "moderate" | "complex";
    importance?: "low" | "medium" | "high" | "critical";
  };
}

interface TreeViewData {
  id: string;
  label: string;
  type: "file" | "directory";
  indent: number;
  icon: string;
  metadata: ProjectNode["metadata"];
  children?: TreeViewData[];
  expandable: boolean;
  ui_props: {
    className: string;
    style: { paddingLeft: string };
  };
}

interface GridViewData {
  id: string;
  name: string;
  type: string;
  importance: string;
  complexity: string;
  size?: number;
  lastModified?: Date;
  ui_props: {
    className: string;
    badge: string;
  };
}

interface TransportableUIData {
  tree_view: TreeViewData[];
  grid_view: GridViewData[];
  graph_data: {
    nodes: Array<{
      id: string;
      label: string;
      type: string;
      group: string;
      importance: string;
      size: number;
      color: string;
    }>;
    edges: Array<{
      from: string;
      to: string;
      arrows: string;
    }>;
  };
}

type ViewMode = "tree" | "grid" | "graph";

interface ProjectExplorerProps {
  initialData?: TransportableUIData;
  onNodeSelect?: (node: TreeViewData | GridViewData) => void;
  onEventGenerated?: (event: ExplorerEvent) => void;
  className?: string;
}

// Event-driven micro UX component
export const ProjectExplorerAtomic: React.FC<ProjectExplorerProps> = ({
  initialData,
  onNodeSelect,
  onEventGenerated,
  className = "",
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [data, setData] = useState<TransportableUIData | null>(
    initialData || null,
  );
  const [eventHistory, setEventHistory] = useState<ExplorerEvent[]>([]);

  // Event creation utility
  const createEvent = useCallback(
    (type: ExplorerEvent["type"], data: unknown) => {
      const event: ExplorerEvent = {
        type,
        timestamp: new Date().toISOString(),
        data,
        metadata: {
          source: "project-explorer-client",
          transportable: true,
          ui_ready: true,
        },
      };

      setEventHistory((prev) => [...prev, event]);
      onEventGenerated?.(event);
      return event;
    },
    [onEventGenerated],
  );

  // Load data from micro-ux-explorer via API or direct import
  const loadProjectData = useCallback(async () => {
    createEvent("UI_UPDATE", { action: "loading_started" });

    try {
      // This would typically fetch from an API endpoint that runs the micro-ux-explorer
      const response = await fetch("/api/project-explorer");
      if (response.ok) {
        const explorerData = await response.json();
        setData(explorerData.transportable_ui_data);
        createEvent("UI_UPDATE", {
          action: "data_loaded",
          data_size: explorerData.statistics?.totalFiles || 0,
        });
      }
    } catch (error) {
      console.error("Failed to load project data:", error);
      createEvent("UI_UPDATE", {
        action: "loading_failed",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }, [createEvent]);

  useEffect(() => {
    if (!data) {
      loadProjectData();
    }
  }, [data, loadProjectData]);

  // Filter data based on search query
  const filteredData = useMemo(() => {
    if (!data || !searchQuery) return data;

    const filterTreeNodes = (nodes: TreeViewData[]): TreeViewData[] => {
      return nodes
        .filter((node) => {
          const matchesSearch = node.label
            .toLowerCase()
            .includes(searchQuery.toLowerCase());
          const hasMatchingChildren = node.children
            ? filterTreeNodes(node.children).length > 0
            : false;

          return matchesSearch || hasMatchingChildren;
        })
        .map((node) => ({
          ...node,
          children: node.children ? filterTreeNodes(node.children) : undefined,
        }));
    };

    const filterGridNodes = (nodes: GridViewData[]): GridViewData[] => {
      return nodes.filter((node) =>
        node.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    };

    return {
      ...data,
      tree_view: filterTreeNodes(data.tree_view),
      grid_view: filterGridNodes(data.grid_view),
    };
  }, [data, searchQuery]);

  // Handle node selection
  const handleNodeSelect = (
    nodeId: string,
    nodeData: TreeViewData | GridViewData,
  ) => {
    setSelectedNode(nodeId);
    onNodeSelect?.(nodeData);
    createEvent("UI_UPDATE", {
      action: "node_selected",
      node_id: nodeId,
      node_type: nodeData.type,
    });
  };

  // Handle node expansion
  const toggleNodeExpansion = (nodeId: string) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
    createEvent("UI_UPDATE", {
      action: "node_toggled",
      node_id: nodeId,
      expanded: newExpanded.has(nodeId),
    });
  };

  // Get importance badge color
  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case "critical":
        return "bg-red-500 text-white";
      case "high":
        return "bg-amber-500 text-white";
      case "medium":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Get complexity indicator
  const getComplexityIndicator = (complexity: string) => {
    switch (complexity) {
      case "complex":
        return "⚡";
      case "moderate":
        return "⚖️";
      default:
        return "○";
    }
  };

  // Render tree node
  const renderTreeNode = (node: TreeViewData) => {
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedNode === node.id;

    return (
      <div key={node.id} className="select-none">
        <div
          className={`
            flex items-center py-1 px-2 hover:bg-blue-50 cursor-pointer rounded
            ${isSelected ? "bg-blue-100 border-l-2 border-blue-500" : ""}
            ${node.ui_props.className}
          `}
          style={node.ui_props.style}
          onClick={() => handleNodeSelect(node.id, node)}
        >
          {node.expandable && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNodeExpansion(node.id);
              }}
              className="mr-1 p-0.5 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown size={14} />
              ) : (
                <ChevronRight size={14} />
              )}
            </button>
          )}

          <span className="mr-2">{node.icon}</span>

          <span className="flex-1 text-sm truncate">{node.label}</span>

          {/* Importance badge */}
          {node.metadata.importance && node.metadata.importance !== "low" && (
            <span
              className={`
              ml-2 px-1.5 py-0.5 text-xs rounded-full
              ${getImportanceBadge(node.metadata.importance)}
            `}
            >
              {node.metadata.importance === "critical"
                ? "!"
                : node.metadata.importance === "high"
                  ? "⭐"
                  : "●"}
            </span>
          )}

          {/* Complexity indicator */}
          <span className="ml-1 text-xs">
            {getComplexityIndicator(node.metadata.complexity || "simple")}
          </span>
        </div>

        {node.children && isExpanded && (
          <div>{node.children.map((child) => renderTreeNode(child))}</div>
        )}
      </div>
    );
  };

  // Render grid item
  const renderGridItem = (item: GridViewData) => {
    const isSelected = selectedNode === item.id;

    return (
      <div
        key={item.id}
        className={`
          p-3 border rounded-lg cursor-pointer transition-all duration-200
          hover:shadow-md hover:border-blue-300
          ${isSelected ? "bg-blue-50 border-blue-500 shadow-md" : "bg-white border-gray-200"}
          ${item.ui_props.className}
        `}
        onClick={() => handleNodeSelect(item.id, item)}
      >
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-medium text-sm truncate flex-1">{item.name}</h3>
          {item.ui_props.badge && (
            <span className="text-lg">{item.ui_props.badge}</span>
          )}
        </div>

        <div className="flex justify-between items-center text-xs text-gray-600">
          <span
            className={`
            px-2 py-1 rounded-full
            ${getImportanceBadge(item.importance)}
          `}
          >
            {item.importance}
          </span>

          <span className="flex items-center">
            {getComplexityIndicator(item.complexity)}
            <span className="ml-1">{item.complexity}</span>
          </span>
        </div>

        {item.size && (
          <div className="mt-2 text-xs text-gray-500">
            {Math.round(item.size / 1024)}KB
          </div>
        )}
      </div>
    );
  };

  if (!filteredData) {
    return (
      <div className={`flex items-center justify-center h-64 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading project structure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header with controls */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Project Explorer
          </h2>

          {/* View mode toggle */}
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode("tree")}
              className={`
                px-3 py-1 rounded text-sm flex items-center
                ${viewMode === "tree" ? "bg-white shadow-sm" : "hover:bg-gray-200"}
              `}
            >
              <List size={16} className="mr-1" />
              Tree
            </button>
            <button
              onClick={() => setViewMode("grid")}
              className={`
                px-3 py-1 rounded text-sm flex items-center
                ${viewMode === "grid" ? "bg-white shadow-sm" : "hover:bg-gray-200"}
              `}
            >
              <Grid size={16} className="mr-1" />
              Grid
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            placeholder="Search files and directories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Content area */}
      <div className="p-4 max-h-96 overflow-auto">
        {viewMode === "tree" && (
          <div className="space-y-1">
            {filteredData.tree_view.map((node) => renderTreeNode(node))}
          </div>
        )}

        {viewMode === "grid" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredData.grid_view.map((item) => renderGridItem(item))}
          </div>
        )}
      </div>

      {/* Footer with stats */}
      <div className="px-4 py-2 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex justify-between text-xs text-gray-600">
          <span>
            {viewMode === "tree"
              ? filteredData.tree_view.length
              : filteredData.grid_view.length}{" "}
            items
          </span>
          <span>Events: {eventHistory.length}</span>
        </div>
      </div>
    </div>
  );
};

export default ProjectExplorerAtomic;
