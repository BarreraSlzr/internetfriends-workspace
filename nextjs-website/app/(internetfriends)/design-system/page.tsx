import { generateStamp } from "@/lib/utils/timestamp";
"use client";

/**
 * Design System Graph Page
 *
 * Restored & modernized from legacy .bak variant.
 * - Integrated new HeaderOrganism (glass variant)
 * - Preserves interactive ReactFlow visualization of component registry
 * - Adds accessibility improvements (skip link via HeaderOrganism)
 *
 * Epic: glass-refinement-v1
 * Future Enhancements:
 *  - Move node + edge generation to a server module with caching
 *  - Add export-to-Markdown / JSON snapshot action
 *  - Add filtering by stability / ownership / epic
 */

import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  Suspense,
} from "react";
import dynamic from "next/dynamic";
import { HeaderOrganism } from "@/components/organisms/header/header.organism";
import { ButtonAtomic } from "@/components/atomic/button";
import { GlassRefinedAtomic } from "@/components/atomic/glass-refined";

// Dynamic import (ReactFlow is client-only & large – avoid blocking hydration)
const ReactFlow = dynamic(() => import("reactflow").then((m) => m.default), {
  ssr: false,
});
const Background = dynamic(
  () => import("reactflow").then((m) => m.Background),
  { ssr: false },
);
const Panel = dynamic(() => import("reactflow").then((m) => m.Panel), {
  ssr: false,
});
const MiniMap = dynamic(() => import("reactflow").then((m) => m.MiniMap), {
  ssr: false,
});
const Controls = dynamic(() => import("reactflow").then((m) => m.Controls), {
  ssr: false,
});

import "reactflow/dist/style.css";
import {
  BackgroundVariant,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from "reactflow";

// Node type components (kept local to design-system)
import { ComponentNode } from "./nodes/component.node";
import { UtilityNode } from "./nodes/utility.node";
import { PageNode } from "./nodes/page.node";
import { HookNode } from "./nodes/hook.node";

// Component registry generator
import { componentRegistry } from "./registry/component.registry";

// Types from reactflow (typed lightly to avoid deep imports explosion)
import type {
  Edge,
  Node,
  OnConnect,
  OnEdgesChange,
  OnNodesChange,
} from "reactflow";

const nodeTypes = {
  component: ComponentNode,
  utility: UtilityNode,
  page: PageNode,
  hook: HookNode,
};

interface RegistryStats {
  total: number;
  atomic: number;
  molecular: number;
  organism: number;
  utility: number;
  hook: number;
  page: number;
}

export default function DesignSystemPage() {
  // --- UI State ---
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [showStats, setShowStats] = useState<boolean>(true);
  const [mounted, setMounted] = useState(false);

  // Mark client mount (avoid hydration mismatch for ReactFlow)
  useEffect(() => setMounted(true), []);

  // --- Registry Data (initial snapshot) ---
  const initialNodes: Node[] = useMemo(
    () => componentRegistry.generateFlowNodes(),
    [],
  );
  const initialEdges: Edge[] = useMemo(
    () => componentRegistry.generateFlowEdges(),
    [],
  );

  // ReactFlow managed state
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);

  const onNodesChange: OnNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );

  const onEdgesChange: OnEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect: OnConnect = useCallback(
    (connection) => setEdges((eds) => addEdge(connection, eds)),
    [],
  );

  // --- Filtering Logic ---
  const filteredNodes = useMemo(() => {
    let next = nodes;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      next = next.filter(
        (n) =>
          n.data?.label?.toLowerCase().includes(q) ||
          n.data?.description?.toLowerCase().includes(q),
      );
    }

    if (selectedCategory !== "all") {
      next = next.filter(
        (n) =>
          n.type === selectedCategory || n.data?.category === selectedCategory,
      );
    }
    return next;
  }, [nodes, searchQuery, selectedCategory]);

  // Edges trimmed to only those connecting currently visible nodes
  const visibleEdges = useMemo(() => {
    const visibleIds = new Set(filteredNodes.map((n) => n.id));
    return edges.filter(
      (e) =>
        visibleIds.has(e.source as string) &&
        visibleIds.has(e.target as string),
    );
  }, [filteredNodes, edges]);

  // Stats snapshot (could be dynamic, kept simple)
  const stats: RegistryStats = useMemo(() => {
    const raw =
      (componentRegistry.getComponentStats() as Partial<RegistryStats>) || {};
    return {
      total: raw.total ?? 0,
      atomic: raw.atomic ?? 0,
      molecular: raw.molecular ?? 0,
      organism: raw.organism ?? 0,
      utility: raw.utility ?? 0,
      hook: raw.hook ?? 0,
      page: raw.page ?? 0,
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

      <div className="flex flex-col flex-1">
        <section className="relative flex-1 min-h-[70vh]">
          {!mounted && (
            <div className="h-[60vh] flex items-center justify-center">
              <GlassRefinedAtomic
                variant="card"
                strength={0.4}
                className="p-8 flex flex-col gap-4 items-center"
              >
                <p className="text-sm opacity-70">
                  Initializing component graph…
                </p>
              </GlassRefinedAtomic>
            </div>
          )}

          {/* ReactFlow only after mount to avoid SSR mismatch */}
          {mounted && (
            <Suspense
              fallback={
                <div className="h-[60vh] flex items-center justify-center">
                  <p className="text-sm opacity-60">Loading graph…</p>
                </div>
              }
            >
              <ReactFlow
                nodes={filteredNodes}
                edges={visibleEdges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                proOptions={{ hideAttribution: true }}
                nodeTypes={nodeTypes}
                className="bg-background"
              >
                <Background
                  variant={BackgroundVariant.Dots}
                  gap={20}
                  size={1}
                  color="var(--if-primary)"
                  style={{ opacity: 0.08 }}
                />
                <MiniMap pannable zoomable />
                <Controls />

                {/* Left control panel */}
                <Panel
                  position="top-left"
                  className="max-w-xs w-[320px] space-y-4 bg-glass-bg-header backdrop-blur-lg border border-glass-border rounded-compact-md p-4 shadow-sm"
                >
                  <div>
                    <h1 className="text-base font-semibold">
                      InternetFriends Design System
                    </h1>
                    <p className="text-xs opacity-70">
                      Visual component architecture map
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      type="text"
                      placeholder="Search components, hooks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-compact-sm border border-border focus:outline-none focus:ring-2 focus:ring-if-primary/60 bg-background/70"
                    />
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-compact-sm border border-border focus:outline-none focus:ring-2 focus:ring-if-primary/60 bg-background/70"
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

                    <div className="flex flex-wrap gap-2">
                      <ButtonAtomic
                        size="xs"
                        variant="outline"
                        onClick={() => setShowStats((s) => !s)}
                      >
                        {showStats ? "Hide Stats" : "Show Stats"}
                      </ButtonAtomic>
                      <ButtonAtomic
                        size="xs"
                        variant="ghost"
                        onClick={() => {
                          setSearchQuery("");
                          setSelectedCategory("all");
                        }}
                      >
                        Clear
                      </ButtonAtomic>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[10px] leading-tight">
                    {[
                      ["Atomic", "from-blue-50 to-blue-100 border-blue-200"],
                      [
                        "Molecular",
                        "from-green-50 to-green-100 border-green-200",
                      ],
                      [
                        "Organism",
                        "from-purple-50 to-purple-100 border-purple-200",
                      ],
                      [
                        "Utility",
                        "from-amber-50 to-amber-100 border-amber-200",
                      ],
                      [
                        "Hook",
                        "from-emerald-50 to-emerald-100 border-emerald-200",
                      ],
                      [
                        "Page",
                        "from-indigo-50 to-indigo-100 border-indigo-200",
                      ],
                    ].map(([label, gradient]) => (
                      <div key={label} className="flex items-center gap-1">
                        <div
                          className={`w-3 h-3 bg-gradient-to-br ${gradient} border rounded-compact-xs`}
                        />
                        <span className="truncate">{label}</span>
                      </div>
                    ))}
                  </div>
                </Panel>

                {/* Stats Panel */}
                {showStats && (
                  <Panel
                    position="top-right"
                    className="w-[240px] space-y-3 bg-glass-bg-header backdrop-blur-lg border border-glass-border rounded-compact-md p-4 shadow-sm"
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-wide opacity-70">
                      Registry Stats
                    </h3>
                    <ul className="text-xs grid grid-cols-2 gap-x-4 gap-y-1">
                      <li className="flex justify-between">
                        <span>Total</span>
                        <span>{stats.total}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Atomic</span>
                        <span>{stats.atomic}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Molecular</span>
                        <span>{stats.molecular}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Organism</span>
                        <span>{stats.organism}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Utility</span>
                        <span>{stats.utility}</span>
                      </li>
                      <li className="flex justify-between">
                        <span>Hook</span>
                        <span>{stats.hook}</span>
                      </li>
                      <li className="flex justify-between col-span-2">
                        <span>Page</span>
                        <span>{stats.page}</span>
                      </li>
                    </ul>
                  </Panel>
                )}
              </ReactFlow>
            </Suspense>
          )}
        </section>

        {/* Footer meta / future actions */}
        <footer className="py-8">
          <div className="container mx-auto px-4 flex flex-col gap-4">
            <GlassRefinedAtomic
              variant="card"
              strength={0.25}
              className="p-4 md:p-6 flex flex-col gap-3"
            >
              <h2 className="text-sm font-semibold tracking-wide uppercase opacity-70">
                Design System Graph
              </h2>
              <p className="text-xs opacity-70 leading-relaxed">
                This visualization reflects the current registered components.
                As the system evolves, nodes will gain metadata (stability,
                ownership, epic lineage) and enable impact heat‑mapping.
              </p>
              <div className="flex flex-wrap gap-2">
                <ButtonAtomic
                  size="xs"
                  variant="outline"
                  onClick={() => {
                    // Placeholder export action
                    // Real implementation: serialize nodes/edges + download JSON
                    console.log("[design-system] export snapshot");
                  }}
                >
                  Export Snapshot
                </ButtonAtomic>
                <ButtonAtomic
                  size="xs"
                  variant="ghost"
                  onClick={() =>
                    window.scrollTo({ top: 0, behavior: "smooth" })
                  }
                >
                  Back to Top
                </ButtonAtomic>
              </div>
            </GlassRefinedAtomic>
          </div>
        </footer>
      </div>
    </main>
  );
}
