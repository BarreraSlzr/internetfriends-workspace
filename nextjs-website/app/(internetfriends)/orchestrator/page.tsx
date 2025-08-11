"use client";

import React, { useCallback, useEffect, useState } from "react";
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
  Panel,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom node types
import { ProjectNode } from "./components/project-node";
import { StateNode } from "./components/state-node";
import { ProcessNode } from "./components/process-node";
import { RealTimeMonitor } from "./components/real-time-monitor";

// Types
interface OrchestratorState {
  currentTask: string;
  activeThreads: string[];
  completedTasks: string[];
  failedTasks: string[];
  systemHealth: "healthy" | "warning" | "error";
}

interface ProjectMetrics {
  eslintIssues: number;
  typeScriptErrors: number;
  testCoverage: number;
  buildStatus: "success" | "failed" | "pending";
  deploymentStatus: "deployed" | "pending" | "failed";
}

const nodeTypes = {
  projectNode: ProjectNode,
  stateNode: StateNode,
  processNode: ProcessNode,
};

export default function OrchestratorPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [orchestratorState, setOrchestratorState] = useState<OrchestratorState>(
    {
      currentTask: "System Initialization",
      activeThreads: [],
      completedTasks: [],
      failedTasks: [],
      systemHealth: "healthy",
    },
  );
  const [showMonitor, setShowMonitor] = useState(true);
  const [projectMetrics] = useState<ProjectMetrics>({
    eslintIssues: 927, // From our previous fix
    typeScriptErrors: 4,
    testCoverage: 0,
    buildStatus: "pending",
    deploymentStatus: "pending",
  });

  // Initialize the flow with project state
  const initializeFlow = useCallback(() => {
    const initialNodes: Node[] = [
      // Core System Nodes
      {
        id: "system-core",
        type: "stateNode",
        position: { x: 400, y: 50 },
        data: {
          label: "InternetFriends System Core",
          status: orchestratorState.systemHealth,
          metrics: {
            threads: orchestratorState.activeThreads.length,
            completed: orchestratorState.completedTasks.length,
            failed: orchestratorState.failedTasks.length,
          },
        },
      },

      // Development Flow
      {
        id: "dev-server",
        type: "processNode",
        position: { x: 100, y: 200 },
        data: {
          label: "Development Server",
          status: "running",
          port: 3000,
          process: "bun --bun next dev --turbopack",
        },
      },

      // Code Quality Pipeline
      {
        id: "eslint-fixes",
        type: "processNode",
        position: { x: 300, y: 200 },
        data: {
          label: "ESLint Fixes",
          status: "completed",
          issues: projectMetrics.eslintIssues,
          fixed: 927,
        },
      },

      {
        id: "typescript-check",
        type: "processNode",
        position: { x: 500, y: 200 },
        data: {
          label: "TypeScript Validation",
          status: projectMetrics.typeScriptErrors > 0 ? "warning" : "success",
          errors: projectMetrics.typeScriptErrors,
        },
      },

      // Build & Deploy Pipeline
      {
        id: "build-process",
        type: "processNode",
        position: { x: 700, y: 200 },
        data: {
          label: "Build Process",
          status: projectMetrics.buildStatus,
          turbopack: true,
        },
      },

      // Feature Development Nodes
      {
        id: "theme-system",
        type: "projectNode",
        position: { x: 150, y: 350 },
        data: {
          label: "Theme System",
          status: "completed",
          features: ["Dark Mode", "Glass Morphism", "Color Tokens"],
          progress: 100,
        },
      },

      {
        id: "component-library",
        type: "projectNode",
        position: { x: 350, y: 350 },
        data: {
          label: "Atomic Components",
          status: "active",
          features: ["Header", "Button", "Glass Card", "Navigation"],
          progress: 85,
        },
      },

      {
        id: "database-integration",
        type: "projectNode",
        position: { x: 550, y: 350 },
        data: {
          label: "Database Layer",
          status: "completed",
          features: ["Kysely ORM", "Neon Connection", "Health Checks"],
          progress: 95,
        },
      },

      // Analysis & Monitoring
      {
        id: "project-analytics",
        type: "stateNode",
        position: { x: 100, y: 500 },
        data: {
          label: "Project Analytics",
          status: "active",
          metrics: {
            components: 45,
            pages: 12,
            coverage: projectMetrics.testCoverage,
          },
        },
      },

      // Orchestrator Control Center
      {
        id: "orchestrator-control",
        type: "stateNode",
        position: { x: 400, y: 500 },
        data: {
          label: "Orchestrator Control",
          status: "active",
          metrics: {
            automatedFixes: 927,
            healthChecks: 14,
            activeMonitoring: true,
          },
        },
      },

      // Future Features
      {
        id: "ai-integration",
        type: "projectNode",
        position: { x: 650, y: 350 },
        data: {
          label: "AI Integration",
          status: "planned",
          features: ["Copilot Reviews", "Auto Fixes", "Code Generation"],
          progress: 20,
        },
      },
    ];

    const initialEdges: Edge[] = [
      // System Flow
      {
        id: "e1",
        source: "system-core",
        target: "dev-server",
        type: "smoothstep",
      },
      {
        id: "e2",
        source: "system-core",
        target: "eslint-fixes",
        type: "smoothstep",
      },
      {
        id: "e3",
        source: "system-core",
        target: "typescript-check",
        type: "smoothstep",
      },
      {
        id: "e4",
        source: "system-core",
        target: "build-process",
        type: "smoothstep",
      },

      // Development Pipeline
      {
        id: "e5",
        source: "eslint-fixes",
        target: "typescript-check",
        type: "smoothstep",
      },
      {
        id: "e6",
        source: "typescript-check",
        target: "build-process",
        type: "smoothstep",
      },

      // Project Dependencies
      {
        id: "e7",
        source: "dev-server",
        target: "theme-system",
        type: "smoothstep",
      },
      {
        id: "e8",
        source: "dev-server",
        target: "component-library",
        type: "smoothstep",
      },
      {
        id: "e9",
        source: "dev-server",
        target: "database-integration",
        type: "smoothstep",
      },

      // Analysis Flow
      {
        id: "e10",
        source: "component-library",
        target: "project-analytics",
        type: "smoothstep",
      },
      {
        id: "e11",
        source: "database-integration",
        target: "project-analytics",
        type: "smoothstep",
      },

      // Control Center
      {
        id: "e12",
        source: "project-analytics",
        target: "orchestrator-control",
        type: "smoothstep",
      },
      {
        id: "e13",
        source: "eslint-fixes",
        target: "orchestrator-control",
        type: "smoothstep",
      },

      // Future Integrations
      {
        id: "e14",
        source: "orchestrator-control",
        target: "ai-integration",
        type: "smoothstep",
        style: { strokeDasharray: "5,5" },
      },
    ];

    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [orchestratorState, projectMetrics, setEdges, setNodes]);

  // Update system state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      setOrchestratorState((prev) => ({
        ...prev,
        currentTask: `Monitoring System - ${new Date().toLocaleTimeString()}`,
        activeThreads: [
          "dev-server",
          "orchestrator-control",
          "project-analytics",
        ],
      }));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Initialize flow on mount
  useEffect(() => {
    initializeFlow();
  }, [initializeFlow]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // System actions
  const executeSystemAction = useCallback((action: string) => {
    console.log(`🚀 Executing system action: ${action}`);
    setOrchestratorState((prev) => ({
      ...prev,
      currentTask: action,
      activeThreads: [...prev.activeThreads, action],
    }));
  }, []);

  // Node color mapping based on status
  const getHealthColor = (health: string) => {
    switch (health) {
      case "healthy":
        return "#22c55e";
      case "warning":
        return "#f59e0b";
      case "error":
        return "#ef4444";
      default:
        return "#6b7280";
    }
  };

  return (
    <div className="w-full h-screen bg-gray-900 text-white">
      <div className="absolute top-4 left-4 z-10 bg-black/80 backdrop-blur rounded-lg p-4 min-w-80">
        <h1 className="text-xl font-bold text-blue-400 mb-2">
          🎛️ InternetFriends Orchestrator
        </h1>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Current Task:</span>
            <span className="text-green-400">
              {orchestratorState.currentTask}
            </span>
          </div>
          <div className="flex justify-between">
            <span>System Health:</span>
            <span
              style={{ color: getHealthColor(orchestratorState.systemHealth) }}
            >
              {orchestratorState.systemHealth.toUpperCase()}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Active Threads:</span>
            <span className="text-blue-400">
              {orchestratorState.activeThreads.length}
            </span>
          </div>
          <div className="flex justify-between">
            <span>ESLint Issues Fixed:</span>
            <span className="text-green-400">
              {projectMetrics.eslintIssues}
            </span>
          </div>
          <button
            onClick={() => setShowMonitor(!showMonitor)}
            className="mt-2 w-full px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-sm transition-colors"
          >
            {showMonitor ? "🔽 Hide Monitor" : "🔼 Show Monitor"}
          </button>
        </div>
      </div>

      {/* Real-time Monitor */}
      {showMonitor && (
        <div className="absolute top-4 left-96 z-10 w-96 max-h-screen overflow-y-auto">
          <RealTimeMonitor />
        </div>
      )}

      <div
        className={`absolute top-4 ${showMonitor ? "right-4" : "right-4"} z-10 bg-black/80 backdrop-blur rounded-lg p-4`}
      >
        <h2 className="text-lg font-semibold text-purple-400 mb-2">
          🚀 Quick Actions
        </h2>
        <div className="space-y-2">
          <button
            onClick={() => executeSystemAction("Run ESLint Fix")}
            className="w-full px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition-colors"
          >
            🔧 Fix Code Issues
          </button>
          <button
            onClick={() => executeSystemAction("TypeScript Check")}
            className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition-colors"
          >
            📋 Validate Types
          </button>
          <button
            onClick={() => executeSystemAction("Build & Deploy")}
            className="w-full px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded text-sm transition-colors"
          >
            🚀 Deploy Changes
          </button>
          <button
            onClick={() => executeSystemAction("Generate Report")}
            className="w-full px-3 py-2 bg-orange-600 hover:bg-orange-700 rounded text-sm transition-colors"
          >
            📊 System Report
          </button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-gray-900"
        connectionLineStyle={{ stroke: "#3b82f6", strokeWidth: 2 }}
        defaultEdgeOptions={{ style: { stroke: "#3b82f6", strokeWidth: 2 } }}
      >
        <Controls className="bg-gray-800 border border-gray-700" />
        <MiniMap
          className="bg-gray-800 border border-gray-700"
          maskColor="rgba(0, 0, 0, 0.8)"
          nodeColor={(node) => {
            if (node.type === "stateNode") return "#8b5cf6";
            if (node.type === "processNode") return "#3b82f6";
            if (node.type === "projectNode") return "#10b981";
            return "#6b7280";
          }}
        />
        <Background color="#374151" gap={20} />

        <Panel
          position="bottom-center"
          className="bg-black/80 backdrop-blur rounded-lg p-3"
        >
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-purple-500 rounded"></div>
              <span>State Nodes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Process Nodes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Project Nodes</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}
