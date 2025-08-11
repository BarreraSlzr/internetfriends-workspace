/**
 * Glass System Components - InternetFriends Design System
 *
 * Unified glass morphism components with proper TypeScript support
 * and accessibility features.
 */

export { GlassPanel } from "./glass-panel.atomic";
export type {
  GlassPanelComponentProps as GlassPanelProps,
  GlassDepth,
  GlassNoise,
  GlassTint,
  GlassElevation,
} from "./glass-panel.atomic";

// Re-export common glass utilities
export const GLASS_DEPTHS = [1, 2, 3] as const;
export const GLASS_NOISE_LEVELS = ["none", "weak", "strong"] as const;
export const GLASS_TINTS = [
  "auto",
  "brand",
  "neutral",
  "warm",
  "cool",
] as const;
export const GLASS_ELEVATIONS = [1, 2, 3] as const;

/**
 * Glass system CSS custom properties
 * These are automatically injected by the GlassPanel component
 */
export const GLASS_CSS_TOKENS = {
  blur: {
    1: "--glass-blur-1",
    2: "--glass-blur-2",
    3: "--glass-blur-3",
  },
  opacity: {
    1: "--glass-opacity-1",
    2: "--glass-opacity-2",
    3: "--glass-opacity-3",
  },
  border: {
    1: "--glass-border-1",
    2: "--glass-border-2",
    3: "--glass-border-3",
  },
  shadow: {
    1: "--glass-shadow-1",
    2: "--glass-shadow-2",
    3: "--glass-shadow-3",
  },
} as const;
