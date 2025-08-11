/**
 * gloo.defaults.ts - Centralized Gloo Configuration
 *
 * Single source of truth for all Gloo WebGL background parameters.
 * These are the "productive defaults" proven in legacy implementations.
 */

import type { GlooPalette } from "../types";

// Core WebGL parameters (proven stable across browsers)
export const GLOO_DEFAULTS = {
  // Animation parameters
  speed: 0.4,     // Smooth, non-distracting animation
  resolution: 2.0, // Good quality without performance issues
  depth: 4,       // Visual interest without complexity
  seed: 2.4,      // Aesthetically pleasing patterns

  // Browser-specific tuning
  safari: {
    dpr: 1,         // Clamp device pixel ratio to prevent memory issues
    resolution: 1.0, // Lower resolution for stability if needed
  },

  // Z-index positioning
  zIndex: {
    background: -1,  // Behind all content
    overlay: 0,      // At content level
    debug: 50,       // Above most content for debugging
  },
} as const;

// Brand color palettes (InternetFriends hex values)
export const BRAND_PALETTE_LIGHT: [string, string, string] = [
  "#ebe75c", // InternetFriends yellow (235, 231, 92)
  "#df4843", // InternetFriends red (223, 72, 67)
  "#eb40f0", // InternetFriends purple (235, 64, 240)
];

export const BRAND_PALETTE_DARK: [string, string, string] = [
  "#ffeb70", // Brighter yellow for dark mode (255, 235, 112)
  "#ff5c57", // Brighter red for dark mode (255, 92, 87)
  "#ff54ff", // Brighter purple for dark mode (255, 84, 255)
];

// Generate complete palette object for theme
export function createBrandPalette(isDark: boolean): GlooPalette {
  return {
    colors: isDark ? BRAND_PALETTE_DARK : BRAND_PALETTE_LIGHT,
    strategy: "brand-triad",
    mode: isDark ? "dark" : "light",
    metadata: {
      generated: false,
      anchor: BRAND_PALETTE_LIGHT[0], // Always anchor to primary brand yellow
    },
  };
}

// Browser detection utilities
export const BROWSER_UTILS = {
  isSafari: () =>
    typeof navigator !== "undefined" &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent),

  isHighDPR: () =>
    typeof window !== "undefined" &&
    window.devicePixelRatio > 1.5,

  hasWebGL: () =>
    typeof window !== "undefined" &&
    !!(window.WebGLRenderingContext || window.WebGL2RenderingContext),
} as const;

// URL parameter overrides for debugging
export function getDebugOverrides() {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);

  return {
    effectIndex: params.has("glooEffect")
      ? parseInt(params.get("glooEffect")!) || 0
      : undefined,
    dpr: params.has("glooDpr")
      ? parseFloat(params.get("glooDpr")!) || 1
      : undefined,
    debug: params.has("glooDebug"),
    resolution: params.has("glooResolution")
      ? parseFloat(params.get("glooResolution")!) || GLOO_DEFAULTS.resolution
      : undefined,
  };
}

// Compute final configuration for a component
export function computeGlooConfig(overrides: {
  isDark?: boolean;
  forceSafariMode?: boolean;
  debugOverrides?: boolean;
} = {}) {
  const { isDark = false, forceSafariMode = false, debugOverrides = true } = overrides;

  const isSafari = forceSafariMode || BROWSER_UTILS.isSafari();
  const debug = debugOverrides ? getDebugOverrides() : {};

  return {
    // Core parameters with Safari adjustments
    speed: GLOO_DEFAULTS.speed,
    resolution: isSafari && !debug.resolution
      ? GLOO_DEFAULTS.safari.resolution
      : (debug.resolution ?? GLOO_DEFAULTS.resolution),
    depth: GLOO_DEFAULTS.depth,
    seed: GLOO_DEFAULTS.seed,

    // Browser-specific tuning
    dpr: debug.dpr ?? (isSafari ? GLOO_DEFAULTS.safari.dpr : undefined),

    // Theme and palette
    palette: createBrandPalette(isDark),

    // Debug and development
    effectIndex: debug.effectIndex,
    debugMode: debug.debug,

    // Browser context
    isSafari,
    hasWebGL: BROWSER_UTILS.hasWebGL(),
    isHighDPR: BROWSER_UTILS.isHighDPR(),
  };
}

// Epic context integration
export interface GlooEpicConfig {
  epicName?: string;
  epicPhase?: "development" | "review" | "complete";
  trackMetrics?: boolean;
}

export function createEpicGlooConfig(
  baseConfig: ReturnType<typeof computeGlooConfig>,
  epicConfig: GlooEpicConfig = {}
) {
  return {
    ...baseConfig,
    epic: {
      name: epicConfig.epicName || "unknown",
      phase: epicConfig.epicPhase || "development",
      trackMetrics: epicConfig.trackMetrics ?? process.env.NODE_ENV === "development",
      timestamp: Date.now(),
    },
  };
}
