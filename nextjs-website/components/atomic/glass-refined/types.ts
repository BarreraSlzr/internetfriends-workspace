// Types for GlassRefined atomic component
// Glass morphism system with strength-based coupling

import { HTMLAttributes } from "react";

export type GlassStrength = number; // 0 to 1

export type GlassMode =
  | "ambient"
  | "focus"
  | "narrative"
  | "performance"
  | "immersive";

export type GlassVariant = "default" | "header" | "modal" | "overlay" | "card";

export type GlassSize = "sm" | "md" | "lg" | "xl";

export interface GlassModeConfig {
  strength: number;
  noise: number;
  saturation?: number;
  motionScale?: number;
}

export interface GlassVariantConfig {
  strength: number;
}

export interface GlassComputedProperties {
  alpha: number;
  blur: number;
  borderAlpha: number;
  highlightAlpha: number;
  noiseAlpha: number;
}

export interface GlassRefinedProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  children?: React.ReactNode;
  className?: string;

  /** Glass strength from 0 to 1 (default: 0.45) */
  strength?: GlassStrength;

  /** Semantic glass mode for automatic strength mapping */
  mode?: GlassMode;

  /** Enable noise layer overlay */
  noise?: boolean;

  /** Variant for different use cases */
  variant?: GlassVariant;

  /** Size preset */
  size?: GlassSize;

  /** Enable hover effects */
  hover?: boolean;

  /** Include padding */
  padding?: boolean;

  /** Show border */
  bordered?: boolean;

  /** Respect reduced motion */
  reducedMotion?: boolean;

  /** Custom style overrides */
  style?: React.CSSProperties;

  /** Element type */
  as?: keyof JSX.IntrinsicElements;

  /** Data attributes for testing and styling */
  [key: `data-${string}`]: unknown;
}

export type GlassRefinedAtomicProps = GlassRefinedProps;

// Constants for configuration
export const GLASS_STRENGTH_PRESETS = {
  subtle: 0.3,
  default: 0.45,
  medium: 0.55,
  strong: 0.65,
  maximum: 0.75,
} as const;

export const GLASS_MODE_CONFIGS: Record<GlassMode, GlassModeConfig> = {
  ambient: { strength: 0.4, noise: 0.5, saturation: 0.9, motionScale: 0.8 },
  focus: { strength: 0.55, noise: 0.6, saturation: 1.05, motionScale: 1.0 },
  narrative: { strength: 0.5, noise: 0.55, saturation: 1.0, motionScale: 1.2 },
  performance: {
    strength: 0.3,
    noise: 0.2,
    saturation: 0.85,
    motionScale: 0.6,
  },
  immersive: { strength: 0.6, noise: 0.65, saturation: 1.15, motionScale: 1.3 },
} as const;

export const GLASS_VARIANT_CONFIGS: Record<GlassVariant, GlassVariantConfig> = {
  default: { strength: 0.45 },
  header: { strength: 0.5 },
  modal: { strength: 0.65 },
  overlay: { strength: 0.55 },
  card: { strength: 0.4 },
} as const;

// Utility type for glass strength validation
export type ValidGlassStrength = number;

// CSS custom property interface
export interface GlassCSSProperties extends React.CSSProperties {
  "--glass-strength"?: string | number;
  "--glass-alpha"?: string | number;
  "--glass-blur"?: string;
  "--glass-border-alpha"?: string | number;
  "--glass-highlight-alpha"?: string | number;
  "--glass-noise-alpha"?: string | number;
  "--glass-base-color"?: string;
}

// Theme-aware glass properties
export interface ThemeGlassProperties {
  light: {
    baseColor: string;
    borderColor: string;
    highlightColor: string;
  };
  dark: {
    baseColor: string;
    borderColor: string;
    highlightColor: string;
  };
}

export const GLASS_THEME_PROPERTIES: ThemeGlassProperties = {
  light: {
    baseColor: "255, 255, 255",
    borderColor: "255, 255, 255",
    highlightColor: "255, 255, 255",
  },
  dark: {
    baseColor: "17, 24, 39",
    borderColor: "59, 130, 246",
    highlightColor: "96, 165, 250",
  },
} as const;

// Epic context integration
export interface EpicGlassContext {
  epicName?: string;
  epicPhase?: "development" | "review" | "complete";
  glassMetrics?: {
    performanceImpact?: number;
    accessibilityScore?: number;
    designSystemCompliance?: number;
  };
}

export type GlassRefinedWithEpicProps = GlassRefinedProps & EpicGlassContext;
