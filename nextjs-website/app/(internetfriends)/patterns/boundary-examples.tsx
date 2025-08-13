import { generateStamp } from "@/lib/utils/timestamp";
"use client";
/**
 * boundary-examples.tsx - Comprehensive Boundary Pattern Application Examples
 *
 * Demonstrates how to systematically apply "Steadiest Addressability Agency"
 * boundary patterns across different component types:
 *
 * 1. WebGL/Canvas Components - Client-only with capability detection
 * 2. Data-heavy Components - Epic-aware with error boundaries
 * 3. Interactive Components - Hydration-safe with fallbacks
 * 4. Performance-critical Components - Dynamic loading with presets
 * 5. Epic-tracked Components - Complete boundary integration
 *
 * Each example shows BEFORE (over-configured) vs AFTER (steadiest patterns)
 */

import React, { useState, useEffect } from "react";
import { ClientOnly, createDynamicBoundary, EpicBoundary, WebGLBoundary } from "./boundary-patterns";
import { useOnceOnMount, useStableRandom } from "./steadiest-addressability";

// =====================================
// EXAMPLE 1: WEBGL COMPONENT BOUNDARY
// =====================================

/**
 * BEFORE: Over-configured WebGL component with complex API
 */
interface WebGLVisualizerComplexProps {
  renderMode?: "webgl" | "canvas" | "svg";
  fallbackChain?: string[];
  webglVersion?: 1 | 2;
  antialias?: boolean;
  preserveDrawingBuffer?: boolean;
  powerPreference?: "default" | "high-performance" | "low-power";
  failIfMajorPerformanceCaveat?: boolean;
  shaderPrecision?: "highp" | "mediump" | "lowp";
  extensions?: string[];
  debugMode?: boolean;
  performanceMonitoring?: boolean;
  // ... 20+ more props
}

/**
 * AFTER: Simplified WebGL component with steadiest addressability
 */
interface WebGLVisualizerSimpleProps {
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
}

const WebGLVisualizerSimple: React.FC<WebGLVisualizerSimpleProps> = (props) => {
  // Once-on-mount effect selection
  const effectIndex = useStableRandom(5);

  // Productive defaults (no configuration needed)
  const webglConfig = {
    antialias: true,
    preserveDrawingBuffer: false,
    powerPreference: "default" as const,
  };

  return (
    <WebGLBoundary
      component={({ disabled, className, style, "data-testid": testId }) => (
        <canvas
          className={className}
          style={style}
          data-testid={testId}
          data-webgl-effect={effectIndex}
          data-webgl-config={JSON.stringify(webglConfig)}
        />
      )}
      props={props}
      fallback={
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-8 text-center">
          <div className="text-4xl mb-2">🎨</div>
          <div className="text-gray-500">WebGL visualization unavailable</div>
        </div>
      }
      epicContext={{
        epicName: "steadiest-addressability-v1",
        epicPhase: "development",
      }}
    />
  );
};

// =====================================
// EXAMPLE 2: DATA COMPONENT BOUNDARY
// =====================================

/**
 * BEFORE: Over-configured data component
 */
interface DataDashboardComplexProps {
  dataSource?: string;
  refreshInterval?: number;
  autoRefresh?: boolean;
  cacheStrategy?: "memory" | "localStorage" | "sessionStorage" | "none";
  cacheTTL?: number;
  retryAttempts?: number;
  retryDelay?: number;
  loadingStrategy?: "eager" | "lazy" | "on-demand";
  errorHandling?: "throw" | "fallback" | "ignore";
  transformations?: Array<(data: any) => any>;
  // ... 15+ more props
}

/**
 * AFTER: Simplified data component with boundary patterns
 */
interface DataDashboardSimpleProps {
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
}

const DataDashboardSimple: React.FC<DataDashboardSimpleProps> = (props) => {
  // Once-on-mount data configuration
  const dataConfig = useOnceOnMount(() => ({
    source: "/api/dashboard",
    refreshMs: 30000,
    maxRetries: 3,
  }));

  return (
    <EpicBoundary
      epicName="steadiest-addressability-v1"
      epicPhase="development"
      debug={process.env.NODE_ENV === "development"}
    >
      <ClientOnly
        config={{
          fallback: <DataLoadingSkeleton />,
          errorBoundary: {
            fallback: <DataErrorFallback />,
            onError: (error) => console.warn("Data dashboard error:", error),
          },
        }}
      >
        <DataDashboardContent {...props} config={dataConfig} />
      </ClientOnly>
    </EpicBoundary>
  );
};

// Simple content component (no over-configuration)
const DataDashboardContent: React.FC<DataDashboardSimpleProps & { config: any }> = ({
  disabled,
  className,
  "data-testid": testId,
  config,
}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simple data fetching with productive defaults
    fetch(config.source)
      .then(res => res.json())
      .then(setData)
      .catch(() => setData({ fallback: true }))
      .finally(() => setLoading(false));
  }, [config.source]);

  if (disabled) return null;

  return (
    <div
      className={`data-dashboard-simple ${className || ""}`}
      data-testid={testId}
      data-loading={loading}
    >
      {loading ? (
        <DataLoadingSkeleton />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded">Metric 1</div>
          <div className="bg-green-50 p-4 rounded">Metric 2</div>
        </div>
      )}
    </div>
  );
};

// =====================================
// EXAMPLE 3: DYNAMIC BOUNDARY COMPONENT
// =====================================

/**
 * Heavy component that should be loaded dynamically
 */
const HeavyInteractiveComponent: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="heavy-component p-8 bg-gradient-to-r from-purple-400 to-pink-400 text-white rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <div className="grid grid-cols-3 gap-4">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="bg-white/20 p-4 rounded aspect-square flex items-center justify-center">
            Interactive {i + 1}
          </div>
        ))}
      </div>
    </div>
  );
};

/**
 * Dynamic boundary wrapper with steadiest addressability
 */
const HeavyComponentBoundary = createDynamicBoundary(
  () => Promise.resolve({ default: HeavyInteractiveComponent }),
  {
    fallback: <HeavyComponentSkeleton />,
    debug: process.env.NODE_ENV === "development",
    epicContext: {
      epicName: "steadiest-addressability-v1",
      epicPhase: "development",
    },
    errorBoundary: {
      fallback: <HeavyComponentError />,
      onError: (error) => console.warn("Heavy component failed:", error),
    },
  }
);

// =====================================
// EXAMPLE 4: COMPLETE EPIC INTEGRATION
// =====================================

/**
 * Component that demonstrates all boundary patterns working together
 */
interface ComprehensiveBoundaryExampleProps {
  disabled?: boolean;
  className?: string;
  "data-testid"?: string;
}

const ComprehensiveBoundaryExample: React.FC<ComprehensiveBoundaryExampleProps> = ({
  disabled = false,
  className,
  "data-testid": testId = "comprehensive-boundary-example",
}) => {
  // Once-on-mount configuration (steadiest pattern)
  const examples = useOnceOnMount(() => [
    { id: 1, title: "WebGL Visualization", type: "webgl" },
    { id: 2, title: "Data Dashboard", type: "data" },
    { id: 3, title: "Heavy Interactive", type: "dynamic" },
  ]);

  if (disabled) return null;

  return (
    <EpicBoundary
      epicName="steadiest-addressability-v1"
      epicPhase="development"
      debug={process.env.NODE_ENV === "development"}
    >
      <div
        className={`comprehensive-boundary-example space-y-8 ${className || ""}`}
        data-testid={testId}
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Steadiest Addressability Boundary Patterns
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Comprehensive examples of boundary pattern applications
          </p>
        </div>

        {/* WebGL Example */}
        <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">1. WebGL Component Boundary</h2>
          <WebGLVisualizerSimple className="h-48" />
        </section>

        {/* Data Example */}
        <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">2. Data Component Boundary</h2>
          <DataDashboardSimple />
        </section>

        {/* Dynamic Example */}
        <section className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4">3. Dynamic Component Boundary</h2>
          <HeavyComponentBoundary title="Dynamic Heavy Component" />
        </section>

        {/* Boundary Patterns Summary */}
        <section className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-6">
          <h2 className="text-xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
            Applied Boundary Patterns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">✅ Implemented</h3>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Client-only boundaries</li>
                <li>• WebGL capability detection</li>
                <li>• Error boundary wrapping</li>
                <li>• Dynamic component loading</li>
                <li>• Epic context integration</li>
                <li>• Fallback state management</li>
              </ul>
            </div>
            <div>
              <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">🚫 Avoided</h3>
              <ul className="space-y-1 text-blue-700 dark:text-blue-300">
                <li>• Over-configuration APIs</li>
                <li>• Complex strategy props</li>
                <li>• Nested config objects</li>
                <li>• SSR hydration issues</li>
                <li>• Callback soup patterns</li>
                <li>• Micro-config parameters</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </EpicBoundary>
  );
};

// =====================================
// HELPER COMPONENTS (SIMPLE)
// =====================================

const DataLoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 gap-4">
    <div className="bg-gray-200 dark:bg-gray-700 h-20 rounded animate-pulse" />
    <div className="bg-gray-200 dark:bg-gray-700 h-20 rounded animate-pulse" />
  </div>
);

const DataErrorFallback: React.FC = () => (
  <div className="text-center py-8">
    <div className="text-4xl mb-2">📊</div>
    <div className="text-gray-500 dark:text-gray-400">
      Data temporarily unavailable
    </div>
  </div>
);

const HeavyComponentSkeleton: React.FC = () => (
  <div className="bg-gray-200 dark:bg-gray-700 h-64 rounded-lg animate-pulse flex items-center justify-center">
    <div className="text-gray-400">Loading interactive component...</div>
  </div>
);

const HeavyComponentError: React.FC = () => (
  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-8 text-center">
    <div className="text-4xl mb-2">⚠️</div>
    <div className="text-red-600 dark:text-red-400">
      Interactive component failed to load
    </div>
  </div>
);

// =====================================
// EXPORTS
// =====================================

export {
  WebGLVisualizerSimple,
  DataDashboardSimple,
  HeavyComponentBoundary,
  ComprehensiveBoundaryExample,
};

export default ComprehensiveBoundaryExample;
