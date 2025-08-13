
"use client";

import React from "react";
import { cn } from "@/lib/utils";

export type GlassDepth = 1 | 2 | 3;
export type GlassNoise = "none" | "weak" | "strong";
export type GlassTint = "auto" | "brand" | "neutral" | "warm" | "cool";
export type GlassElevation = 1 | 2 | 3;

export interface GlassPanelProps extends React.HTMLAttributes<HTMLElement> {
  /** Glass depth level - controls opacity and blur intensity */
  depth?: GlassDepth;
  /** Noise overlay intensity */
  noise?: GlassNoise;
  /** Color tint variant */
  tint?: GlassTint;
  /** Elevation level - controls shadow and border brightness */
  elevation?: GlassElevation;
  /** HTML element to render as */
  as?: keyof React.JSX.IntrinsicElements;
  /** Custom className */
  className?: string;
  /** Children content */
  children?: React.ReactNode;
}

/**
 * GlassPanel - Atomic glass morphism component
 *
 * Provides a consistent glass effect with configurable depth, noise, tint, and elevation.
 * Replaces legacy `surface-glass` class with a proper component abstraction.
 *
 * @example
 * <GlassPanel depth={2} noise="weak" elevation={1}>
 *   Content goes here
 * </GlassPanel>
 */
export const GlassPanel: React.FC<GlassPanelProps> = ({
  depth = 1,
  noise = "weak",
  tint = "auto",
  elevation = depth,
  as: Component = "div",
  className,
  children,
  ...rest
}) => {
  // Generate CSS class names based on props
  const glassClasses = cn(
    // Base glass classes
    "glass-panel",
    `glass-layer-${depth}`,
    `glass-elevation-${elevation}`,

    // Conditional classes
    noise !== "none" && ["glass-noise-overlay", `glass-noise-${noise}`],

    tint !== "auto" && `glass-tint-${tint}`,

    // Custom className
    className,
  );

  return React.createElement(
    Component,
    {
      className: glassClasses,
      "data-depth": depth,
      "data-noise": noise,
      "data-tint": tint,
      "data-elevation": elevation,
      ...rest,
    },
    children,
  );
};

GlassPanel.displayName = "GlassPanel";

// Export types for external usage
export type GlassPanelComponentProps = GlassPanelProps;
