"use client";
/**
 * boundary-patterns.tsx - Client/Server Boundary Pattern System
 *
 * Implements consistent patterns for client/server component separation
 * based on learnings from Gloo WebGL troubleshooting:
 *
 * 1. Clear client-only boundaries for WebGL/Canvas components
 * 2. Safe SSR handling with proper fallbacks
 * 3. Hydration-safe component wrapping
 * 4. Dynamic imports with error boundaries
 * 5. Epic-aware boundary management
 */

import React, { Suspense, ComponentType, ReactNode } from "react";
import dynamic from "next/dynamic";

// =====================================
// TYPES & INTERFACES
// =====================================

export interface BoundaryConfig {
  /** Fallback content during SSR/loading */
  fallback?: ReactNode;
  /** Enable development debug info */
  debug?: boolean;
  /** Epic context for tracking */
  epicContext?: {
    epicName: string;
    epicPhase: 'development' | 'review' | 'complete';
  };
  /** Error boundary configuration */
  errorBoundary?: {
    fallback: ReactNode;
    onError?: (error: Error) => void;
  };
}

export interface ClientOnlyProps {
  /** Only render on client (no SSR) */
  children: ReactNode;
  /** Configuration for boundary behavior */
  config?: BoundaryConfig;
}

export interface DynamicBoundaryProps<T = {}> {
  /** Component to load dynamically */
  component: () => Promise<{ default: ComponentType<T> }>;
  /** Props to pass to the dynamic component */
  props?: T;
  /** Boundary configuration */
  config?: BoundaryConfig;
}

// =====================================
// CLIENT-ONLY BOUNDARY
// =====================================

/**
 * ClientOnly - Renders children only on client side
 *
 * Use for:
 * - WebGL/Canvas components
 * - Browser-specific APIs
 * - Components with hydration issues
 */
export const ClientOnly: React.FC<ClientOnlyProps> = ({
  children,
  config = {}
}) => {
  const { fallback = null, debug = false, epicContext } = config;

  // SSR guard
  if (typeof window === "undefined") {
    return (
      <>
        {fallback}
        {debug && process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "absolute",
              top: "10px",
              left: "10px",
              background: "rgba(255, 0, 0, 0.9)",
              color: "white",
              padding: "4px 8px",
              fontSize: "10px",
              fontFamily: "monospace",
              borderRadius: "2px",
              zIndex: 9999,
            }}
          >
            SSR: ClientOnly boundary active
            {epicContext && ` (Epic: ${epicContext.epicName})`}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {children}
      {debug && process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "absolute",
            top: "10px",
            left: "10px",
            background: "rgba(0, 255, 0, 0.9)",
            color: "white",
            padding: "4px 8px",
            fontSize: "10px",
            fontFamily: "monospace",
            borderRadius: "2px",
            zIndex: 9999,
          }}
        >
          Client: Boundary active
          {epicContext && ` (Epic: ${epicContext.epicName})`}
        </div>
      )}
    </>
  );
};

// =====================================
// DYNAMIC BOUNDARY WITH ERROR HANDLING
// =====================================

/**
 * DynamicBoundary - Safely loads components with proper boundaries
 *
 * Use for:
 * - Heavy WebGL components
 * - Optional features that might fail
 * - Components with complex dependencies
 */
export function createDynamicBoundary<T extends Record<string, any>>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  boundaryConfig: BoundaryConfig = {}
): ComponentType<T> {
  const {
    fallback = null,
    debug = false,
    epicContext,
    errorBoundary
  } = boundaryConfig;

  const DynamicComponent = dynamic(importFn, {
    ssr: false,
    loading: () => (
      <>
        {fallback}
        {debug && process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "absolute",
              top: "30px",
              left: "10px",
              background: "rgba(255, 165, 0, 0.9)",
              color: "white",
              padding: "4px 8px",
              fontSize: "10px",
              fontFamily: "monospace",
              borderRadius: "2px",
              zIndex: 9999,
            }}
          >
            Loading: Dynamic component
            {epicContext && ` (Epic: ${epicContext.epicName})`}
          </div>
        )}
      </>
    ),
  });

  const BoundaryWrappedComponent: ComponentType<T> = (props) => {
    return (
      <ClientOnly config={{ debug, epicContext }}>
        <Suspense fallback={fallback}>
          {errorBoundary ? (
            <ErrorBoundaryWrapper
              fallback={errorBoundary.fallback}
              onError={errorBoundary.onError}
            >
              <DynamicComponent {...props} />
            </ErrorBoundaryWrapper>
          ) : (
            <DynamicComponent {...props} />
          )}
        </Suspense>
      </ClientOnly>
    );
  };

  BoundaryWrappedComponent.displayName = `DynamicBoundary(${importFn.name || 'Anonymous'})`;

  return BoundaryWrappedComponent;
}

// =====================================
// ERROR BOUNDARY WRAPPER
// =====================================

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
  fallback: ReactNode;
  onError?: (error: Error) => void;
}

class ErrorBoundaryWrapper extends React.Component<
  ErrorBoundaryWrapperProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.props.onError?.(error);

    if (process.env.NODE_ENV === "development") {
      console.error("🚨 Boundary Error:", error);
      console.error("🔍 Error Info:", errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          {this.props.fallback}
          {process.env.NODE_ENV === "development" && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                left: "10px",
                background: "rgba(255, 0, 0, 0.95)",
                color: "white",
                padding: "8px",
                fontSize: "11px",
                fontFamily: "monospace",
                borderRadius: "4px",
                zIndex: 9999,
                maxWidth: "300px",
              }}
            >
              <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                🚨 Component Error
              </div>
              <div>{this.state.error?.message}</div>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                style={{
                  background: "rgba(255, 255, 255, 0.2)",
                  border: "1px solid rgba(255, 255, 255, 0.3)",
                  color: "white",
                  padding: "2px 6px",
                  borderRadius: "2px",
                  fontSize: "10px",
                  marginTop: "4px",
                  cursor: "pointer",
                }}
              >
                Retry
              </button>
            </div>
          )}
        </>
      );
    }

    return this.props.children;
  }
}

// =====================================
// EPIC-AWARE BOUNDARY
// =====================================

export interface EpicBoundaryProps {
  /** Epic context for tracking */
  epicName: string;
  epicPhase: 'development' | 'review' | 'complete';
  /** Children to wrap */
  children: ReactNode;
  /** Enable debug info */
  debug?: boolean;
}

/**
 * EpicBoundary - Tracks component rendering within epic context
 *
 * Use for:
 * - Epic-specific components
 * - Performance tracking per epic
 * - Development debugging
 */
export const EpicBoundary: React.FC<EpicBoundaryProps> = ({
  epicName,
  epicPhase,
  children,
  debug = false,
}) => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log(`🎭 Epic Boundary: ${epicName} (${epicPhase}) mounted`);
    }
  }, [epicName, epicPhase]);

  return (
    <div
      data-epic-boundary={epicName}
      data-epic-phase={epicPhase}
      style={{ position: "relative" }}
    >
      {children}
      {debug && process.env.NODE_ENV === "development" && (
        <div
          style={{
            position: "absolute",
            top: "70px",
            left: "10px",
            background: "rgba(147, 51, 234, 0.9)",
            color: "white",
            padding: "4px 8px",
            fontSize: "10px",
            fontFamily: "monospace",
            borderRadius: "2px",
            zIndex: 9999,
          }}
        >
          🎭 Epic: {epicName} ({epicPhase})
        </div>
      )}
    </div>
  );
};

// =====================================
// WEBGL-SPECIFIC BOUNDARY
// =====================================

export interface WebGLBoundaryProps<T = {}> {
  /** Component to render with WebGL context */
  component: ComponentType<T>;
  /** Props for the WebGL component */
  props: T;
  /** Fallback for WebGL unsupported */
  fallback?: ReactNode;
  /** Epic context */
  epicContext?: {
    epicName: string;
    epicPhase: 'development' | 'review' | 'complete';
  };
}

/**
 * WebGLBoundary - Specialized boundary for WebGL components
 *
 * Features:
 * - WebGL capability detection
 * - Graceful fallback for unsupported browsers
 * - Performance monitoring
 * - Epic integration
 */
export function WebGLBoundary<T extends Record<string, any>>({
  component: Component,
  props,
  fallback,
  epicContext,
}: WebGLBoundaryProps<T>) {
  const [webglSupported, setWebglSupported] = React.useState<boolean | null>(null);

  React.useEffect(() => {
    // Check WebGL support
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    setWebglSupported(!!gl);

    if (process.env.NODE_ENV === "development") {
      console.log('🎮 WebGL Support:', !!gl);
      if (gl) {
        console.log('🔧 WebGL Renderer:', gl.getParameter(gl.RENDERER));
        console.log('🏢 WebGL Vendor:', gl.getParameter(gl.VENDOR));
      }
    }
  }, []);

  // Loading state
  if (webglSupported === null) {
    return (
      <>
        {fallback}
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "absolute",
              top: "90px",
              left: "10px",
              background: "rgba(6, 182, 212, 0.9)",
              color: "white",
              padding: "4px 8px",
              fontSize: "10px",
              fontFamily: "monospace",
              borderRadius: "2px",
              zIndex: 9999,
            }}
          >
            🎮 Checking WebGL support...
          </div>
        )}
      </>
    );
  }

  // WebGL not supported
  if (!webglSupported) {
    return (
      <>
        {fallback}
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "absolute",
              top: "90px",
              left: "10px",
              background: "rgba(239, 68, 68, 0.9)",
              color: "white",
              padding: "4px 8px",
              fontSize: "10px",
              fontFamily: "monospace",
              borderRadius: "2px",
              zIndex: 9999,
            }}
          >
            🚫 WebGL not supported
          </div>
        )}
      </>
    );
  }

  // WebGL supported - render component
  return (
    <ClientOnly
      config={{
        debug: process.env.NODE_ENV === "development",
        epicContext,
      }}
    >
      {epicContext ? (
        <EpicBoundary
          epicName={epicContext.epicName}
          epicPhase={epicContext.epicPhase}
          debug={process.env.NODE_ENV === "development"}
        >
          <Component {...props} />
        </EpicBoundary>
      ) : (
        <Component {...props} />
      )}
    </ClientOnly>
  );
}

// =====================================
// CONVENIENCE EXPORTS
// =====================================

export default {
  ClientOnly,
  createDynamicBoundary,
  EpicBoundary,
  WebGLBoundary,
};
