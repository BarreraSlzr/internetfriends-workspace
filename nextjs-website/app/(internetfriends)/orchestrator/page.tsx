"use client";

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  Suspense,
} from "react";
import { getTimestamp } from "@/lib/utils/timestamp";
import dynamic from "next/dynamic";
import { HeaderOrganism } from "@/components/organisms/header/header.organism";
import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";
import { ButtonAtomic } from "@/components/atomic/button";

// ReactFlow (dynamic to avoid SSR mismatch)
import "reactflow/dist/style.css";
const ReactFlow = dynamic(() => import("reactflow").then((m) => m.default), {
  ssr: false,
});
const Background = dynamic(
  () => import("reactflow").then((m) => m.Background),
  { ssr: false },
);
const MiniMap = dynamic(() => import("reactflow").then((m) => m.MiniMap), {
  ssr: false,
});
const Controls = dynamic(() => import("reactflow").then((m) => m.Controls), {
  ssr: false,
});
const Panel = dynamic(() => import("reactflow").then((m) => m.Panel), {
  ssr: false,
});

// Custom node renderers (assumed to exist from original structure)
import { ProjectNode } from "./components/project-node";
import { StateNode } from "./components/state-node";
import { ProcessNode } from "./components/process-node";
import { RealTimeMonitor } from "./components/real-time-monitor";

// Types (shallow import to keep bundle minimal)
import type {
  Node,
  Edge,
  Connection,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "reactflow";
import { BackgroundVariant } from "reactflow";

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

const INITIAL_STATE: OrchestratorState = {
  currentTask: "System Initialization",
  activeThreads: [],
  completedTasks: [],
  failedTasks: [],
  systemHealth: "healthy",
};

const INITIAL_METRICS: ProjectMetrics = {
  eslintIssues: 927,
  typeScriptErrors: 4,
  testCoverage: 0,
  buildStatus: "pending",
  deploymentStatus: "pending",
};

export default function OrchestratorPage() {
  // Core orchestrator state
  const [orchestratorState, setOrchestratorState] =
    useState<OrchestratorState>(INITIAL_STATE);
  const [projectMetrics, setProjectMetrics] =
    useState<ProjectMetrics>(INITIAL_METRICS);

  // UI state
  const [showMonitor, setShowMonitor] = useState(true);
  const [mounted, setMounted] = useState(false);
  const simulationRef = useRef<number | null>(null);

  // Mark mount (avoid mismatch with dynamic ReactFlow)
  useEffect(() => setMounted(true), []);

  // Initialize nodes (subset reconstructed from partial .bak)
  const initialNodes: Node[] = useMemo(
    () => [
      {
        id: "system-core",
        type: "stateNode",
        position: { x: 400, y: 40 },
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
      {
        id: "dev-server",
        type: "processNode",
        position: { x: 80, y: 220 },
        data: {
          label: "Development Server",
          status: "running",
          port: 3000,
          process: "bun --bun next dev --turbopack",
        },
      },
      {
        id: "eslint-fixes",
        type: "processNode",
        position: { x: 300, y: 220 },
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
        position: { x: 520, y: 220 },
        data: {
          label: "TypeScript Validation",
          status: projectMetrics.typeScriptErrors > 0 ? "warning" : "success",
          errors: projectMetrics.typeScriptErrors,
        },
      },
      {
        id: "build-pipeline",
        type: "processNode",
        position: { x: 740, y: 220 },
        data: {
          label: "Build Pipeline",
          status: projectMetrics.buildStatus,
          artifacts: 0,
        },
      },
      {
        id: "deployment",
        type: "processNode",
        position: { x: 960, y: 220 },
        data: {
          label: "Deployment",
          status: projectMetrics.deploymentStatus,
          target: "Vercel Edge",
        },
      },
    ],
    [
      orchestratorState.systemHealth,
      orchestratorState.activeThreads.length,
      orchestratorState.completedTasks.length,
      orchestratorState.failedTasks.length,
      projectMetrics.eslintIssues,
      projectMetrics.typeScriptErrors,
      projectMetrics.buildStatus,
      projectMetrics.deploymentStatus,
    ],
  );

  // Basic edges (static for now)
  const initialEdges: Edge[] = useMemo(
    () => [
      {
        id: "core-dev",
        source: "system-core",
        target: "dev-server",
      },
      {
        id: "dev-eslint",
        source: "dev-server",
        target: "eslint-fixes",
      },
      {
        id: "eslint-ts",
        source: "eslint-fixes",
        target: "typescript-check",
      },
      {
        id: "ts-build",
        source: "typescript-check",
        target: "build-pipeline",
      },
      {
        id: "build-deploy",
        source: "build-pipeline",
        target: "deployment",
      },
    ],
    [],
  );

  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  // Sync nodes when dynamic metrics/state change (basic re-init approach)
  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  // ReactFlow handlers (lightweight placeholders)
  const onNodesChange: OnNodesChange = useCallback((_changes) => {
    // Future: allow repositioning & persist
    setNodes((nds) => nds.map((n) => ({ ...n })));
  }, []);

  const onEdgesChange: OnEdgesChange = useCallback(
    () => setEdges((eds) => eds),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (connection: Connection) =>
      setEdges((eds) => [
        ...eds,
        {
          ...connection,
          id: `${connection.source}-${connection.target}-${getTimestamp()}`,
          source: connection.source || "",
          target: connection.target || "",
        },
      ]),
    [],
  );

  // Simulation: evolve metrics to simulate work
  useEffect(() => {
    if (simulationRef.current != null) return;

    simulationRef.current = window.setInterval(() => {
      setProjectMetrics((m) => {
        const next: ProjectMetrics = { ...m };
        // Reduce ESLint issues gradually
        if (next.eslintIssues > 0)
          next.eslintIssues -= Math.min(25, next.eslintIssues);
        // Reduce TS errors slower
        if (next.typeScriptErrors > 0 && Math.random() > 0.6) {
          next.typeScriptErrors -= 1;
        }
        // Increase test coverage
        if (next.testCoverage < 85 && Math.random() > 0.4) {
          next.testCoverage = Math.min(100, next.testCoverage + 2);
        }
        // Build status progression
        if (next.buildStatus === "pending" && next.eslintIssues < 100) {
          next.buildStatus = "success";
        }
        // Deployment progression
        if (
          next.buildStatus === "success" &&
          next.deploymentStatus === "pending" &&
          next.typeScriptErrors === 0
        ) {
          next.deploymentStatus = "deployed";
        }
        return next;
      });

      setOrchestratorState((s) => {
        // Rotate current task
        const tasks = [
          "Refining glass morphism",
          "Optimizing header orbital motion",
          "Analyzing bundle split",
          "Generating AI orchestration metrics",
          "Preparing hybrid deployment",
        ];
        const currentIndex = tasks.indexOf(s.currentTask);
        return {
          ...s,
          currentTask: tasks[(currentIndex + 1 + tasks.length) % tasks.length],
        };
      });
    }, 1800);

    return () => {
      if (simulationRef.current != null) {
        clearInterval(simulationRef.current);
        simulationRef.current = null;
      }
    };
  }, []);

  return (
    <main id="main-content" className="flex flex-col min-h-screen">
      <HeaderOrganism
        variant="glass"
        size="md"
        navigation={{ items: [] }}
        themeToggle={{ show: true, showLabels: false }}
        languageSelector={{ show: false }}
        skipToMain
      />

      <div className="flex flex-col flex-1 relative">
        {/* Graph Region */}
        <section className="flex-1 relative min-h-[60vh]">
          {!mounted && (
            <div className="flex items-center justify-center h-[50vh]">
              <GlassCardAtomic
                variant="card"
                strength={0.4}
                className="p-8 flex flex-col gap-4 items-center"
              >
                <p className="text-sm opacity-70">
                  Initializing orchestration graph…
                </p>
              </GlassCardAtomic>
            </div>
          )}

          {mounted && (
            <Suspense
              fallback={
                <div className="flex items-center justify-center h-[50vh]">
                  <p className="text-sm opacity-60">
                    Loading orchestration graph…
                  </p>
                </div>
              }
            >
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                nodeTypes={nodeTypes}
                proOptions={{ hideAttribution: true }}
                className="bg-background"
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={22}
                  size={1}
                  color="var(--if-primary)"
                  style={{ opacity: 0.07 }}
                />
                <MiniMap pannable zoomable />
                <Controls />

                {/* Left Panel: System Core */}
                <Panel
                  position="top-left"
                  className="space-y-3 max-w-xs w-[300px] bg-glass-bg-header backdrop-blur-lg border border-glass-border rounded-compact-md p-4 shadow-sm"
                >
                  <div>
                    <h1 className="text-sm font-semibold">
                      System Orchestrator
                    </h1>
                    <p className="text-[11px] opacity-70 leading-snug">
                      Real-time visualization of development pipeline
                    </p>
                  </div>

                  <GlassCardAtomic
                    variant="card"
                    strength={0.25}
                    className="p-3 flex flex-col gap-2"
                  >
                    <span className="text-xs font-mono opacity-70">
                      current-task:
                    </span>
                    <span className="text-xs">
                      {orchestratorState.currentTask}
                    </span>
                    <div className="flex gap-2 flex-wrap mt-2">
                      <ButtonAtomic
                        size="xs"
                        variant="outline"
                        onClick={() => setShowMonitor((s) => !s)}
                      >
                        {showMonitor ? "Hide Monitor" : "Show Monitor"}
                      </ButtonAtomic>
                      <ButtonAtomic
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          setProjectMetrics(INITIAL_METRICS);
                          setOrchestratorState(INITIAL_STATE);
                        }}
                      >
                        Reset
                      </ButtonAtomic>
                    </div>
                  </GlassCardAtomic>

                  <div className="grid grid-cols-2 gap-2 text-[10px] leading-tight">
                    <Stat label="ESLint" value={projectMetrics.eslintIssues} />
                    <Stat
                      label="TS Errors"
                      value={projectMetrics.typeScriptErrors}
                    />
                    <Stat
                      label="Coverage"
                      value={`${projectMetrics.testCoverage}%`}
                    />
                    <Stat label="Build" value={projectMetrics.buildStatus} />
                    <Stat
                      label="Deploy"
                      value={projectMetrics.deploymentStatus}
                    />
                  </div>
                </Panel>

                {/* Right Panel: Live Monitor */}
                {showMonitor && (
                  <Panel
                    position="top-right"
                    className="w-[320px] max-w-sm bg-glass-bg-header backdrop-blur-lg border border-glass-border rounded-compact-md p-4 shadow-sm"
                  >
                    <RealTimeMonitor />
                  </Panel>
                )}
              </ReactFlow>
            </Suspense>
          )}
        </section>

        {/* Footer / Narrative */}
        <footer className="py-10">
          <div className="container mx-auto px-4">
            <GlassCardAtomic
              variant="card"
              strength={0.25}
              className="p-6 flex flex-col gap-4"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wide opacity-70">
                Orchestrator Narrative
              </h2>
              <p className="text-xs opacity-70 leading-relaxed">
                This orchestration graph simulates the lifecycle from
                development server to deployment. As the platform matures, real
                metrics (CI runs, lint pipelines, test coverage, performance
                budgets, AI agent tasks) will drive node states.
              </p>
              <div className="flex flex-wrap gap-2">
                <ButtonAtomic
                  size="xs"
                  variant="outline"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Back to Top
                </ButtonAtomic>
              </div>
            </GlassCardAtomic>
          </div>
        </footer>
      </div>
    </main>
  );
}

/* ---------- Small Presentational Helpers ---------- */

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col bg-background/60 border border-border rounded-compact-sm p-2">
      <span className="text-[10px] uppercase tracking-wide opacity-60">
        {label}
      </span>
      <span className="text-[11px] font-mono">{value}</span>
    </div>
  );
}
