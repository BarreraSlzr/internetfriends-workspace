"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface GlassRefinedAtomicProps {
  children?: React.ReactNode;
  className?: string;
  /** Glass strength from 0 to 1 (default: 0.45) */
  strength?: number;
  /** Semantic glass mode for automatic strength mapping */
  mode?: "ambient" | "focus" | "narrative" | "performance" | "immersive";
  /** Enable noise layer overlay */
  noise?: boolean;
  /** Variant for different use cases */
  variant?: "default" | "header" | "modal" | "overlay" | "card";
  /** Size preset */
  size?: "sm" | "md" | "lg" | "xl";
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
  /** Data attributes */
  [key: `data-${string}`]: unknown;
}

// Mode to strength mapping
const GLASS_MODE_CONFIG = {
  ambient: { strength: 0.4, noise: 0.5 },
  focus: { strength: 0.55, noise: 0.6 },
  narrative: { strength: 0.5, noise: 0.55 },
  performance: { strength: 0.3, noise: 0.2 },
  immersive: { strength: 0.6, noise: 0.65 },
} as const;

// Variant to strength mapping
const GLASS_VARIANT_CONFIG = {
  default: { strength: 0.45 },
  header: { strength: 0.5 },
  modal: { strength: 0.65 },
  overlay: { strength: 0.55 },
  card: { strength: 0.4 },
} as const;

export const GlassRefinedAtomic: React.FC<GlassRefinedAtomicProps> = ({
  children,
  className,
  strength: propStrength,
  mode,
  noise = false,
  variant = "default",
  size = "md",
  hover = false,
  padding = true,
  bordered = true,
  reducedMotion = false,
  style = {},
  as: Element = "div",
  ...props
}) => {
  // Calculate effective strength
  const modeConfig = mode ? GLASS_MODE_CONFIG[mode] : null;
  const variantConfig = GLASS_VARIANT_CONFIG[variant];
  const effectiveStrength = propStrength ?? modeConfig?.strength ?? variantConfig.strength;

  // Calculate derived properties
  const glassAlpha = Math.max(0.2, Math.min(0.75, 0.2 + 0.55 * effectiveStrength));
  const glassBlur = Math.max(2, Math.min(12, 2 + 10 * effectiveStrength));
  const glassBorderAlpha = 0.08 + 0.1 * effectiveStrength;
  const glassHighlightAlpha = 0.04 + 0.06 * effectiveStrength;
  const glassNoiseAlpha = Math.min(0.14, 0.04 + 0.1 * effectiveStrength);

  // Respect user's motion preferences
  const prefersReducedMotion = typeof window !== "undefined"
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : reducedMotion;

  const computedStyle: React.CSSProperties = {
    // Glass strength CSS custom properties
    "--glass-strength": effectiveStrength,
    "--glass-alpha": glassAlpha,
    "--glass-blur": `${glassBlur}px`,
    "--glass-border-alpha": glassBorderAlpha,
    "--glass-highlight-alpha": glassHighlightAlpha,
    "--glass-noise-alpha": glassNoiseAlpha,

    // Apply glass effects
    background: `rgba(var(--glass-base-color, 255, 255, 255), ${glassAlpha})`,
    backdropFilter: `blur(${glassBlur}px)`,
    WebkitBackdropFilter: `blur(${glassBlur}px)`,
    border: bordered
      ? `1px solid rgba(255, 255, 255, ${glassBorderAlpha})`
      : "none",

    // Subtle inner highlight
    boxShadow: bordered
      ? `inset 0 1px 0 rgba(255, 255, 255, ${glassHighlightAlpha}), 0 4px 14px -4px rgba(0, 0, 0, ${0.18 * effectiveStrength})`
      : `0 4px 14px -4px rgba(0, 0, 0, ${0.18 * effectiveStrength})`,

    // Position for noise overlay
    position: "relative",
    overflow: "hidden",

    ...style,
  } as React.CSSProperties;

  return (
    <Element
      className={cn(
        // Base glass styles
        "glass-refined",

        // Size variations
        {
          "p-3 rounded-[var(--radius-sm)]": size === "sm" && padding,
          "p-4 rounded-[var(--radius-md)]": size === "md" && padding,
          "p-6 rounded-[var(--radius-lg)]": size === "lg" && padding,
          "p-8 rounded-[var(--radius-lg)]": size === "xl" && padding,
        },

        // No padding variants
        {
          "rounded-[var(--radius-sm)]": size === "sm" && !padding,
          "rounded-[var(--radius-md)]": size === "md" && !padding,
          "rounded-[var(--radius-lg)]": size === "lg" && !padding,
          "rounded-[var(--radius-lg)]": size === "xl" && !padding,
        },

        // Hover effects (respect reduced motion)
        hover && !prefersReducedMotion && [
          "transition-all duration-200 ease-out",
          "hover:backdrop-blur-[14px]",
          "hover:shadow-lg",
          "hover:scale-[1.01]",
        ],

        // Reduced motion fallback
        hover && prefersReducedMotion && [
          "hover:shadow-lg",
        ],

        // Mode-specific classes
        mode && `glass-mode-${mode}`,

        // Variant-specific classes
        `glass-variant-${variant}`,

        className,
      )}
      style={computedStyle}
      data-glass-strength={effectiveStrength}
      data-glass-mode={mode}
      data-glass-variant={variant}
      data-glass-noise={noise}
      data-testid="glass-refined"
      {...props}
    >
      {children}

      {/* Noise overlay layer */}
      {noise && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                rgba(255, 255, 255, ${glassNoiseAlpha}) 0 1px,
                transparent 1px 2px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(0, 0, 0, ${glassNoiseAlpha * 0.4}) 0 1px,
                transparent 1px 2px
              )
            `,
            mixBlendMode: "overlay",
            opacity: 1,
          }}
          aria-hidden="true"
        />
      )}
    </Element>
  );
};

GlassRefinedAtomic.displayName = "GlassRefinedAtomic";

export default GlassRefinedAtomic;
