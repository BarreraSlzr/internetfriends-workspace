"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useId,
  useCallback,
  ReactNode,
  ElementType,
  Suspense,
  lazy,
  CSSProperties,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "../../../../hooks/use-theme";
import { getAdaptiveGooColorTuples } from "../../lib/color-palette";
import { effectFunctions } from "./gloo-effects";

/**
 * GlooIntegration - Unified ambient background component
 *
 * Integrates three rendering approaches:
 * - DOM: Framer Motion blobs (default, accessible)
 * - Canvas: 2D Canvas rendering (performance middle-ground)
 * - WebGL: Shader-based effects (high-performance, experimental)
 *
 * Goals:
 * - Single API for all rendering modes
 * - Automatic fallback chain: WebGL → Canvas → DOM
 * - Performance-aware mode selection
 * - Consistent visual output across modes
 * - Epic-aligned development with measurable impact
 */

/* -------------------------------------------------------
 * Types & Interfaces
 * ----------------------------------------------------- */

type RGB = [number, number, number];
type GooVariant = "subtle" | "balanced" | "vivid";
type GooQuality = "low" | "medium" | "high";
type GooRenderMode = "auto" | "dom" | "canvas" | "webgl";
type GooBlend = CSSProperties["mixBlendMode"];

export interface GlooIntegrationProps {
  /* Rendering Strategy */
  mode?: GooRenderMode; // "auto" by default - intelligent fallback
  fallbackChain?: GooRenderMode[]; // Custom fallback order

  /* Visual Behavior */
  animate?: boolean; // true by default
  variant?: GooVariant; // "balanced" by default
  quality?: GooQuality; // "medium" by default
  speed?: number; // 1.0 by default
  blendMode?: GooBlend;
  intensity?: number; // 1.0 by default

  /* Performance & Motion */
  suspendOffscreen?: boolean; // true by default
  respectReducedMotion?: boolean; // true by default
  idleDelayMs?: number; // 0 by default

  /* Color System */
  colors?: string | string[];
  palette?: RGB[]; // Direct RGB array
  adaptiveColors?: boolean; // false by default
  scheme?: "auto" | "light" | "dark"; // "auto" by default

  /* WebGL Specific */
  shaderEffect?: string; // From gloo-effects.ts
  webglFallback?: boolean; // true by default

  /* Canvas Specific */
  canvasBlur?: boolean; // true by default
  blobCount?: number; // Derived from variant if not set

  /* DOM Specific */
  domOptimized?: boolean; // true by default - reduced DOM nodes when possible

  /* Debug & Development */
  debug?: boolean; // false by default
  performanceMonitoring?: boolean; // false by default

  /* Standard Props */
  className?: string;
  style?: CSSProperties;
  as?: ElementType;
  disabled?: boolean;

  /* Epic Integration */
  epicContext?: {
    name?: string;
    phase?: "development" | "review" | "complete";
    metrics?: boolean;
  };
}

/* -------------------------------------------------------
 * Rendering Mode Detection & Capability Check
 * ----------------------------------------------------- */

interface RenderCapabilities {
  webgl: boolean;
  canvas: boolean;
  dom: boolean;
  webgl2: boolean;
  performanceAPI: boolean;
}

function detectRenderCapabilities(): RenderCapabilities {
  if (typeof window === "undefined") {
    return {
      webgl: false,
      canvas: false,
      dom: true,
      webgl2: false,
      performanceAPI: false,
    };
  }

  // Test WebGL
  let webgl = false;
  let webgl2 = false;
  try {
    const testCanvas = document.createElement("canvas");
    const gl = testCanvas.getContext("webgl2");
    const gl1 = testCanvas.getContext("webgl");
    webgl2 = !!gl;
    webgl = !!(gl || gl1);
  } catch (e) {
    webgl = false;
    webgl2 = false;
  }

  // Test 2D Canvas
  let canvas = false;
  try {
    const testCanvas = document.createElement("canvas");
    const ctx = testCanvas.getContext("2d");
    canvas = !!ctx;
  } catch (e) {
    canvas = false;
  }

  return {
    webgl,
    canvas,
    dom: true, // Always available in React
    webgl2,
    performanceAPI: typeof performance !== "undefined" && !!performance.now,
  };
}

/* -------------------------------------------------------
 * Lazy-loaded Renderer Components
 * ----------------------------------------------------- */

const WebGLGloo = lazy(() =>
  import("./renderers/webgl-gloo").catch(() => ({
    default: () => <div data-gloo-error="webgl-load-failed" />,
  })),
);

const CanvasGloo = lazy(() =>
  import("./renderers/canvas-gloo").catch(() => ({
    default: () => <div data-gloo-error="canvas-load-failed" />,
  })),
);

// Use simplified BgGooSimple as fallback renderer
import { BgGooSimple } from "./gloo-simple";

/* -------------------------------------------------------
 * Performance Monitoring Hook
 * ----------------------------------------------------- */

interface PerformanceMetrics {
  renderMode: string;
  frameTime: number;
  memoryUsage?: number;
  gpuTime?: number;
  animationActive: boolean;
}

function useGlooPerformance(enabled: boolean, renderMode: string) {
  const metricsRef = useRef<PerformanceMetrics>({
    renderMode,
    frameTime: 0,
    animationActive: false,
  });

  const measureFrame = useCallback(
    (startTime: number, endTime: number) => {
      if (!enabled) return;

      metricsRef.current.frameTime = endTime - startTime;
      metricsRef.current.renderMode = renderMode;

      // Log performance warnings in development
      if (
        process.env.NODE_ENV === "development" &&
        metricsRef.current.frameTime > 16
      ) {
        console.warn(
          `[GlooIntegration] Slow frame detected: ${metricsRef.current.frameTime.toFixed(2)}ms in ${renderMode} mode`,
        );
      }
    },
    [enabled, renderMode],
  );

  return { metrics: metricsRef.current, measureFrame };
}

/* -------------------------------------------------------
 * Mode Selection Logic
 * ----------------------------------------------------- */

function selectOptimalRenderMode(
  requestedMode: GooRenderMode,
  capabilities: RenderCapabilities,
): GooRenderMode {
  // If WebGL2 is not available, fall back to Canvas
  if (!capabilities.webgl2) {
    return "canvas";
  }

  // If high performance mode is requested but device doesn't support it
  // For now, return the requested mode as capabilities checking is not implemented
  if (requestedMode === "webgl" && !capabilities.webgl2) {
    return "canvas";
  }

  // Return requested mode if supported
  return requestedMode;
}
