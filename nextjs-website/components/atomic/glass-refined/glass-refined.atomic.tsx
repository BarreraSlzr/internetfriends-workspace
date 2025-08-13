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
  as?: React.ElementType;
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
  // Calculate effective strength with responsive adjustments
  const modeConfig = mode ? GLASS_MODE_CONFIG[mode] : null;
  const variantConfig = GLASS_VARIANT_CONFIG[variant];
  const baseStrength =
    propStrength ?? modeConfig?.strength ?? variantConfig.strength;

  // Reduce strength slightly on mobile for better performance and readability
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const effectiveStrength = isMobile
    ? Math.max(0.2, baseStrength * 0.85)
    : baseStrength;

  // Detect dark mode
  const isDarkMode =
    typeof window !== "undefined" &&
    (window.matchMedia("(prefers-color-scheme: dark)").matches ||
      document.documentElement.getAttribute("data-theme") === "dark");

  // Calculate derived properties with improved scaling for better transparency
  const glassAlpha = Math.max(
    0.08, // Much more transparent base
    Math.min(0.35, 0.08 + 0.27 * effectiveStrength), // Lower max opacity
  );
  const glassBlur = Math.max(6, Math.min(20, 6 + 14 * effectiveStrength)); // Stronger blur range
  const glassBorderAlpha = 0.08 + 0.15 * effectiveStrength;
  const glassHighlightAlpha = 0.03 + 0.12 * effectiveStrength;
  const glassNoiseAlpha = Math.min(0.06, 0.01 + 0.05 * effectiveStrength);

  // Respect user's motion preferences
  const prefersReducedMotion =
    typeof window !== "undefined"
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

    // Apply glass effects with enhanced transparency and stronger backdrop effects
    background: isDarkMode
      ? `rgba(var(--if-neutral-900, 15, 23, 42), ${glassAlpha})`
      : `rgba(var(--if-neutral-100, 241, 245, 249), ${glassAlpha})`,
    backdropFilter: `blur(${glassBlur}px) saturate(1.25) brightness(${isDarkMode ? "1.1" : "0.95"})`,
    WebkitBackdropFilter: `blur(${glassBlur}px) saturate(1.25) brightness(${isDarkMode ? "1.1" : "0.95"})`,
    border: bordered
      ? isDarkMode
        ? `1px solid rgba(var(--if-primary, 59, 130, 246), ${glassBorderAlpha * 1.5})`
        : `1px solid rgba(var(--if-neutral-300, 203, 213, 225), ${glassBorderAlpha * 1.2})`
      : "none",

    // Enhanced shadow system for better depth perception with softer shadows
    boxShadow: bordered
      ? isDarkMode
        ? `inset 0 1px 0 rgba(var(--if-primary, 59, 130, 246), ${glassHighlightAlpha * 0.5}), 0 ${Math.max(8, 12 * effectiveStrength)}px ${Math.max(24, 32 * effectiveStrength)}px -8px rgba(0, 0, 0, ${0.3 + 0.2 * effectiveStrength}), 0 0 0 1px rgba(255, 255, 255, 0.05)`
        : `inset 0 1px 0 rgba(var(--if-neutral-100, 241, 245, 249), ${glassHighlightAlpha * 1.2}), 0 ${Math.max(8, 12 * effectiveStrength)}px ${Math.max(24, 32 * effectiveStrength)}px -8px rgba(var(--if-neutral-900, 15, 23, 42), ${0.08 + 0.07 * effectiveStrength}), 0 0 0 1px rgba(255, 255, 255, 0.1)`
      : isDarkMode
        ? `0 ${Math.max(8, 12 * effectiveStrength)}px ${Math.max(24, 32 * effectiveStrength)}px -8px rgba(0, 0, 0, ${0.3 + 0.2 * effectiveStrength}), 0 0 0 1px rgba(255, 255, 255, 0.05)`
        : `0 ${Math.max(8, 12 * effectiveStrength)}px ${Math.max(24, 32 * effectiveStrength)}px -8px rgba(var(--if-neutral-900, 15, 23, 42), ${0.08 + 0.07 * effectiveStrength}), 0 0 0 1px rgba(255, 255, 255, 0.1)`,

    // Position for noise overlay with performance hints
    position: "relative",
    overflow: "hidden",

    // Performance optimizations
    willChange:
      hover && !prefersReducedMotion ? "transform, backdrop-filter" : "auto",
    isolation: "isolate", // Create stacking context for better compositing

    // Text contrast enhancement
    color: isDarkMode ? "rgba(255, 255, 255, 0.95)" : "rgba(0, 0, 0, 0.87)",
    textShadow: isDarkMode
      ? "0 1px 2px rgba(0, 0, 0, 0.4)"
      : "0 1px 2px rgba(255, 255, 255, 0.8)",

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
          "rounded-[var(--radius-lg)]":
            (size === "lg" || size === "xl") && !padding,
        },

        // Focus states for accessibility
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-if-primary focus-visible:ring-offset-2",
        "focus-visible:border-if-primary/50",

        // Text contrast classes
        isDarkMode ? "text-white/95" : "text-black/87",

        // Hover effects (respect reduced motion)
        hover &&
          !prefersReducedMotion && [
            "transition-all duration-300 ease-out",
            "hover:scale-[1.02]",
            "hover:shadow-xl",
          ],

        // Reduced motion fallback
        hover && prefersReducedMotion && ["hover:shadow-lg"],

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
      data-reduced-motion={prefersReducedMotion}
      data-testid="glass-refined"
      {...props}
    >
      {children}

      {/* Noise overlay layer */}
      {noise && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: isDarkMode
              ? `
                repeating-linear-gradient(
                  0deg,
                  rgba(var(--if-primary, 59, 130, 246), ${glassNoiseAlpha * 0.6}) 0 1px,
                  transparent 1px 2px
                ),
                repeating-linear-gradient(
                  90deg,
                  rgba(0, 0, 0, ${glassNoiseAlpha * 0.3}) 0 1px,
                  transparent 1px 2px
                )
              `
              : `
                repeating-linear-gradient(
                  0deg,
                  rgba(var(--if-neutral-100, 241, 245, 249), ${glassNoiseAlpha}) 0 1px,
                  transparent 1px 2px
                ),
                repeating-linear-gradient(
                  90deg,
                  rgba(var(--if-neutral-800, 30, 41, 59), ${glassNoiseAlpha * 0.4}) 0 1px,
                  transparent 1px 2px
                )
              `,
            mixBlendMode: "overlay",
            opacity: isMobile ? 0.4 : 0.6,
            // Performance: Prevent noise from affecting paint layers
            transform: "translateZ(0)",
            willChange: "auto",
          }}
          aria-hidden="true"
        />
      )}
    </Element>
  );
};

GlassRefinedAtomic.displayName = "GlassRefinedAtomic";

export default GlassRefinedAtomic;
