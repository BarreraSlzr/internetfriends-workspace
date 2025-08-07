"use client";

import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ComponentFlowWorkspaceProvider } from "@/shared/component-flow/component.flow.workspace";
import {
  componentRegistry,
  registerInternetFriendsComponents,
} from "@/shared/component-flow/component.registry";
import { ComponentPreviewNode as ComponentPreviewNodeType } from "@/shared/component-flow/types";
import { patterns, themes } from "@/shared/patterns/design-system.patterns";
import "@/shared/styles/design-tokens.css";
import styles from "./component-flow.page.module.scss";

// Dynamically import React Flow to avoid SSR issues
const ComponentFlowWorkspace = dynamic(
  () =>
    import("@/shared/component-flow/component.flow.workspace").then(
      (mod) => mod.ComponentFlowWorkspaceProvider,
    ),
  {
    ssr: false,
    loading: () => (
      <div className={styles.loading}>Loading Component Flow...</div>
    ),
  },
);

interface ComponentFlowPageProps {
  searchParams?: {
    theme?: "light" | "dark" | "system";
    mode?: "demo" | "development" | "showcase";
  };
}

export default function ComponentFlowPage({
  searchParams,
}: ComponentFlowPageProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState<
    "light" | "dark" | "system"
  >(searchParams?.theme || "system");
  const [mode, setMode] = useState(searchParams?.mode || "demo");
  const [stats, setStats] = useState(componentRegistry.getStats());

  // Initialize component registry
  useEffect(() => {
    const initializeComponents = async () => {
      try {
        // Register sample components for demo
        registerDemoComponents();
        registerInternetFriendsComponents();

        setStats(componentRegistry.getStats());
        setIsInitialized(true);

        console.log(
          "🚀 Component Flow initialized with",
          stats.totalComponents,
          "components",
        );
      } catch (error) {
        console.error("Failed to initialize components:", error);
      }
    };

    initializeComponents();
  }, []);

  // Register demo components
  const registerDemoComponents = () => {
    // Demo Button Component
    const DemoButton: React.FC<any> = ({
      variant = "primary",
      children = "Button",
      ...props
    }) => (
      <button
        className={`demo-button demo-button--${variant}`}
        {...props}
        style={{
          padding: "0.5rem 1rem",
          borderRadius: "var(--radius-md, 0.5rem)",
          border:
            variant === "primary"
              ? "none"
              : "1px solid var(--border-primary, #e5e7eb)",
          background:
            variant === "primary"
              ? "var(--if-primary, #3b82f6)"
              : "var(--bg-primary, #fff)",
          color:
            variant === "primary" ? "white" : "var(--text-primary, #111827)",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: "500",
          transition: "all 0.15s ease-in-out",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-1px)";
          e.currentTarget.style.boxShadow = "0 4px 6px -1px rgba(0, 0, 0, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        {children}
      </button>
    );

    // Demo Card Component
    const DemoCard: React.FC<any> = ({
      title = "Card Title",
      children = "Card content goes here...",
      variant = "default",
      ...props
    }) => (
      <div
        className={`demo-card demo-card--${variant}`}
        {...props}
        style={{
          padding: "1rem",
          borderRadius: "var(--radius-lg, 0.75rem)",
          border:
            variant === "glass"
              ? "1px solid rgba(255, 255, 255, 0.18)"
              : "1px solid var(--border-primary, #e5e7eb)",
          background:
            variant === "glass"
              ? "rgba(255, 255, 255, 0.85)"
              : "var(--bg-primary, #fff)",
          backdropFilter: variant === "glass" ? "blur(12px)" : "none",
          boxShadow:
            variant === "elevated"
              ? "0 10px 15px -3px rgba(0, 0, 0, 0.1)"
              : "none",
        }}
      >
        <h3
          style={{
            margin: "0 0 0.5rem 0",
            fontSize: "1rem",
            fontWeight: "600",
            color: "var(--text-primary, #111827)",
          }}
        >
          {title}
        </h3>
        <p
          style={{
            margin: "0",
            fontSize: "0.875rem",
            color: "var(--text-secondary, #6b7280)",
            lineHeight: "1.5",
          }}
        >
          {children}
        </p>
      </div>
    );

    // Demo Input Component
    const DemoInput: React.FC<any> = ({
      placeholder = "Enter text...",
      type = "text",
      ...props
    }) => (
      <input
        type={type}
        placeholder={placeholder}
        {...props}
        style={{
          width: "100%",
          padding: "0.5rem 0.75rem",
          borderRadius: "var(--radius-sm, 0.375rem)",
          border: "1px solid var(--border-primary, #e5e7eb)",
          background: "var(--bg-primary, #fff)",
          color: "var(--text-primary, #111827)",
          fontSize: "0.875rem",
          transition: "all 0.15s ease-in-out",
        }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = "var(--if-primary, #3b82f6)";
          e.currentTarget.style.outline =
            "2px dashed var(--border-focus, #60a5fa)";
          e.currentTarget.style.outlineOffset = "2px";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = "var(--border-primary, #e5e7eb)";
          e.currentTarget.style.outline = "none";
        }}
      />
    );

    // Register components
    componentRegistry.registerComponents([
      {
        id: "demo-button",
        path: "demo/button.tsx",
        component: DemoButton,
        metadata: {
          componentName: "DemoButton",
          componentType: "atomic",
          component: DemoButton,
          category: "forms",
          tags: ["button", "interactive", "demo"],
          defaultProps: { variant: "primary", children: "Click me" },
          availableProps: [
            {
              name: "variant",
              type: "select",
              options: ["primary", "secondary", "ghost"],
              defaultValue: "primary",
            },
            { name: "children", type: "string", defaultValue: "Button" },
            { name: "disabled", type: "boolean", defaultValue: false },
          ],
          initialWidth: 200,
          initialHeight: 100,
          documentation: {
            description:
              "A demo button component showcasing InternetFriends design system",
            examples: [
              {
                title: "Primary Button",
                props: { variant: "primary", children: "Primary" },
              },
              {
                title: "Secondary Button",
                props: { variant: "secondary", children: "Secondary" },
              },
            ],
          },
        },
      },
      {
        id: "demo-card",
        path: "demo/card.tsx",
        component: DemoCard,
        metadata: {
          componentName: "DemoCard",
          componentType: "molecular",
          component: DemoCard,
          category: "layout",
          tags: ["card", "container", "demo"],
          defaultProps: {
            variant: "default",
            title: "Sample Card",
            children: "This is a demo card component.",
          },
          availableProps: [
            {
              name: "variant",
              type: "select",
              options: ["default", "glass", "elevated"],
              defaultValue: "default",
            },
            { name: "title", type: "string", defaultValue: "Card Title" },
            {
              name: "children",
              type: "string",
              defaultValue: "Card content...",
            },
          ],
          initialWidth: 300,
          initialHeight: 200,
          documentation: {
            description:
              "A flexible card component with glass morphism and elevation variants",
          },
        },
      },
      {
        id: "demo-input",
        path: "demo/input.tsx",
        component: DemoInput,
        metadata: {
          componentName: "DemoInput",
          componentType: "atomic",
          component: DemoInput,
          category: "forms",
          tags: ["input", "form", "demo"],
          defaultProps: { type: "text", placeholder: "Type here..." },
          availableProps: [
            {
              name: "type",
              type: "select",
              options: ["text", "email", "password", "number"],
              defaultValue: "text",
            },
            {
              name: "placeholder",
              type: "string",
              defaultValue: "Enter text...",
            },
            { name: "disabled", type: "boolean", defaultValue: false },
          ],
          initialWidth: 250,
          initialHeight: 80,
          documentation: {
            description:
              "A form input with focus states and accessibility support",
          },
        },
      },
    ]);
  };

  const handleWorkspaceChange = (
    nodes: ComponentPreviewNodeType[],
    edges: any[],
  ) => {
    console.log("Workspace updated:", {
      nodes: nodes.length,
      edges: edges.length,
    });
  };

  const handleNodeSelect = (node: ComponentPreviewNodeType | null) => {
    if (node) {
      console.log("Selected component:", node.data.componentName);
    }
  };

  if (!isInitialized) {
    return (
      <div className={styles.container} data-theme={selectedTheme}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <p>Initializing Component Flow System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} data-theme={selectedTheme}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.title}>
            <h1>InternetFriends Component Flow</h1>
            <p>Visual component development and testing workspace</p>
          </div>

          <div className={styles.controls}>
            <div className={styles.controlGroup}>
              <label>Theme:</label>
              <select
                value={selectedTheme}
                onChange={(e) => setSelectedTheme(e.target.value as any)}
                className={styles.select}
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className={styles.controlGroup}>
              <label>Mode:</label>
              <select
                value={mode}
                onChange={(e) => setMode(e.target.value)}
                className={styles.select}
              >
                <option value="demo">Demo</option>
                <option value="development">Development</option>
                <option value="showcase">Showcase</option>
              </select>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.totalComponents}</span>
            <span className={styles.statLabel}>Components</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.categoriesCount}</span>
            <span className={styles.statLabel}>Categories</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.statValue}>{stats.tagsCount}</span>
            <span className={styles.statLabel}>Tags</span>
          </div>
          <div className={styles.statBreakdown}>
            <span>Atomic: {stats.typeBreakdown.atomic}</span>
            <span>Molecular: {stats.typeBreakdown.molecular}</span>
            <span>Organism: {stats.typeBreakdown.organism}</span>
          </div>
        </div>
      </header>

      {/* Main workspace */}
      <main className={styles.main}>
        <ComponentFlowWorkspace
          theme={selectedTheme}
          showMinimap={true}
          showControls={true}
          showComponentLibrary={true}
          onWorkspaceChange={handleWorkspaceChange}
          onNodeSelect={handleNodeSelect}
          className={styles.workspace}
        />
      </main>

      {/* Info panel */}
      {mode === "demo" && (
        <aside className={styles.infoPanel}>
          <h3>🚀 Welcome to Component Flow!</h3>
          <p>
            This is your visual component development workspace. Here's what you
            can do:
          </p>

          <ul className={styles.featureList}>
            <li>
              <strong>📚 Browse Library:</strong> Click "Library" to see all
              available components
            </li>
            <li>
              <strong>🎯 Add Components:</strong> Click any component in the
              library to add it to the workspace
            </li>
            <li>
              <strong>🔧 Edit Props:</strong> Click the gear icon on any
              component to modify its properties
            </li>
            <li>
              <strong>📱 Test Responsive:</strong> Drag the resize handle to
              test responsive behavior
            </li>
            <li>
              <strong>🔗 Connect Flow:</strong> Drag from output handles to
              input handles to create data flows
            </li>
            <li>
              <strong>💾 Export:</strong> Save your workspace configuration for
              later use
            </li>
          </ul>

          <div className={styles.patternInfo}>
            <h4>Design Patterns Available:</h4>
            <div className={styles.patternList}>
              {Object.entries(patterns).map(([key, pattern]) => (
                <div key={key} className={styles.patternItem}>
                  <strong>{pattern.name}</strong>
                  <span>{pattern.description}</span>
                </div>
              ))}
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
