/**
 * index.ts - Gloo System Barrel Exports
 * Epic WebGL background system for InternetFriends
 *
 * This barrel export provides a clean API surface for the entire Gloo system,
 * organizing exports by category and providing both named and default exports
 * for different use cases.
 */

// Core WebGL Hook & Types
export { useGlooWebGL } from "./core";
export type {
  UseGlooWebGLOptions,
  UseGlooWebGLReturn,
  GlooWebGLContext,
  GlooUniformValue,
} from "./core";

// Effect System
export { effectFunctions } from "./effects";
export {
  defaultEffect,
  spiralEffect,
  waveEffect,
  vortexEffect,
  pulseEffect,
  rippleEffect,
  twistEffect,
  oscillateEffect,
  fractalEffect,
  swirlEffect,
  bounceEffect,
} from "./effects";

// Palette Generation System
export {
  generateGlooPalette,
  getInternetFriendsPalette,
  colorUtils,
} from "./palette";

// Component Exports
export { GlooCanvasAtomic } from "./canvas.atomic";
export { GlooGlobalOrganism } from "./global.organism";
export { GlooGlobalClient } from "./client-wrapper";

// Legacy compatibility (for migration from backgrounds folder)
export { GlooCanvasAtomic as BgGoo } from "./canvas.atomic";
export { GlooGlobalClient as BgGooGlobal } from "./client-wrapper";

// Default component exports (common usage patterns)
export { GlooCanvasAtomic as GlooCanvas } from "./canvas.atomic";
export { GlooGlobalClient as GlooGlobal } from "./client-wrapper";

// Type Exports
export type {
  // Core Types
  GlooPaletteStrategy,
  GlooThemeMode,
  GlooEffectName,
  GlooColorTuple,
  GlooColorHex,
  GlooColorArray,
  GlooColorUtils,

  // Palette Types
  GlooPaletteOptions,
  GlooPalette,

  // Component Props
  GlooCanvasProps,
  GlooGlobalProps,

  // Debug & Performance
  GlooDebugInfo,
  GlooPerformanceMetrics,

  // Epic Integration
  EpicGlooContext,

  // Effect System
  GlooEffect,

  // Utility Types
  GlooFC,
  GlooRef,
  GlooStyle,
  GlooClassName,
} from "./types";

// Constants & Utilities
export const GLOO_EFFECTS = {
  DEFAULT: 0,
  SPIRAL: 1,
  WAVE: 2,
  VORTEX: 3,
  PULSE: 4,
  RIPPLE: 5,
  TWIST: 6,
  OSCILLATE: 7,
  FRACTAL: 8,
  SWIRL: 9,
  BOUNCE: 10,
} as const;

export const GLOO_PALETTE_STRATEGIES = {
  BRAND_TRIAD: "brand-triad",
  ANALOGOUS: "analogous",
  SEEDED_RANDOM: "seeded-random",
  PRIMARY_ACCENT: "primary-accent",
  SOFT_GLASS: "soft-glass",
  MONOCHROME: "monochrome",
  COMPLEMENTARY: "complementary",
} as const;

export const INTERNETFRIENDS_CORE_COLORS = [
  "#3b82f6", // Primary blue
  "#9333ea", // Violet
  "#ec4899", // Pink
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
] as const;

// Helper Functions
export const createGlooConfig = (
  overrides?: Partial<import("./types").GlooGlobalProps>,
) => ({
  speed: 0.4,
  resolution: 2.0,
  depth: 5,
  seed: 1.25,
  paletteStrategy: "brand-triad" as const,
  autoEffectCycle: false,
  effectCycleMs: 12000,
  animate: true,
  anchorToPrimary: true,
  zIndex: 0,
  ...overrides,
});

export const createEpicGlooConfig = (
  epicName: string,
  epicPhase: "development" | "review" | "complete" = "development",
) => ({
  ...createGlooConfig(),
  epicContext: {
    epicName,
    epicPhase,
    epicMetrics: {
      visualImpact: {
        paletteChanges: 0,
        effectCycles: 0,
      },
    },
  },
});

// Version info
export const GLOO_VERSION = "1.0.0-epic";
export const GLOO_BUILD_DATE = new Date().toISOString();

/**
 * Quick setup helpers for common use cases
 */
export const GlooQuick = {
  InternetFriends: () =>
    createGlooConfig({
      paletteStrategy: "brand-triad",
      anchorToPrimary: true,
      autoEffectCycle: false,
    }),

  Epic: (epicName: string) => createEpicGlooConfig(epicName),

  Subtle: () =>
    createGlooConfig({
      speed: 0.2,
      resolution: 1.5,
      depth: 3,
      paletteStrategy: "soft-glass",
    }),

  Dynamic: () =>
    createGlooConfig({
      speed: 0.6,
      autoEffectCycle: true,
      effectCycleMs: 8000,
      paletteStrategy: "seeded-random",
    }),

  Performance: () =>
    createGlooConfig({
      resolution: 1.0,
      depth: 3,
      preserveDrawingBuffer: false,
      autoEffectCycle: false,
    }),

  Debug: () =>
    createGlooConfig({
      speed: 0.8,
      resolution: 2.5,
      depth: 6,
      paletteStrategy: "seeded-random",
      autoEffectCycle: true,
      effectCycleMs: 5000,
      zIndex: 1,
    }),
} as const;
