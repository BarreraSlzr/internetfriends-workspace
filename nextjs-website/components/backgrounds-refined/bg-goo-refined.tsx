"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useTheme } from "@/hooks/use-theme";

// Import existing GlooCanvasAtomic and effects from the established system
import { GlooCanvasAtomic } from "../../app/(internetfriends)/components/gloo/canvas.atomic";
import { effectFunctions } from "../../app/(internetfriends)/components/gloo/effects";
import type { GlooPalette } from "../../app/(internetfriends)/components/gloo/types";

export interface BgGooRefinedProps {
  /** Background mode for semantic configuration */
  mode?: "ambient" | "focus" | "narrative" | "performance" | "immersive";
  /** Manual strength override (0-1) */
  strength?: number;
  /** Parallax intensity (0-1, default: auto from mode) */
  parallaxIntensity?: number;
  /** Speed multiplier (default: auto from mode) */
  speed?: number;
  /** Resolution multiplier (default: 2.0) */
  resolution?: number;
  /** Depth layers (default: 4) */
  depth?: number;
  /** Random seed (default: 2.4) */
  seed?: number;
  /** Disable rendering entirely */
  disabled?: boolean;
  /** Z-index for positioning (default: -1) */
  zIndex?: number;
  /** Additional CSS class */
  className?: string;
  /** Use absolute positioning instead of fixed */
  absolute?: boolean;
  /** Custom color palette override */
  colors?: [string, string, string];
  /** Enable noise texture overlay */
  noise?: boolean;
  /** Respect reduced motion */
  respectReducedMotion?: boolean;
  /** Custom style overrides */
  style?: React.CSSProperties;
}

interface BgModeConfig {
  strength: number;
  parallax: number;
  saturation: number;
  noise: number;
  motionScale: number;
  speed: number;
}

const BG_MODE_CONFIGS: Record<string, BgModeConfig> = {
  ambient: {
    strength: 0.4,
    parallax: 0.25,
    saturation: 0.9,
    noise: 0.5,
    motionScale: 0.8,
    speed: 0.3,
  },
  focus: {
    strength: 0.55,
    parallax: 0.4,
    saturation: 1.05,
    noise: 0.6,
    motionScale: 1.0,
    speed: 0.4,
  },
  narrative: {
    strength: 0.5,
    parallax: 0.35,
    saturation: 1.0,
    noise: 0.55,
    motionScale: 1.2,
    speed: 0.5,
  },
  performance: {
    strength: 0.3,
    parallax: 0.1,
    saturation: 0.85,
    noise: 0.2,
    motionScale: 0.6,
    speed: 0.25,
  },
  immersive: {
    strength: 0.6,
    parallax: 0.45,
    saturation: 1.15,
    noise: 0.65,
    motionScale: 1.3,
    speed: 0.6,
  },
};

// Mature color palette - reduced saturation, more sophisticated
const REFINED_COLORS = {
  light: [
    [0.88, 0.85, 0.32], // Sophisticated yellow-gold
    [0.82, 0.28, 0.26], // Deep refined red
    [0.82, 0.25, 0.85], // Elegant purple
  ] as const,
  dark: [
    [0.88, 0.85, 0.32], // Consistent gold
    [0.92, 0.38, 0.34], // Warmer red for dark
    [0.88, 0.32, 0.92], // Brighter purple for dark
  ] as const,
};

// Convert RGB tuples to hex for palette
function tuplesToHexPalette(
  tuples: readonly (readonly [number, number, number])[],
): [string, string, string] {
  return tuples.map(
    ([r, g, b]) =>
      "#" +
      [r * 255, g * 255, b * 255]
        .map((c) => Math.round(c).toString(16).padStart(2, "0"))
        .join(""),
  ) as [string, string, string];
}

export const BgGooRefined: React.FC<BgGooRefinedProps> = ({
  mode = "ambient",
  strength,
  parallaxIntensity,
  speed,
  resolution = 2.0,
  depth = 4,
  seed = 2.4,
  disabled = false,
  zIndex = -1,
  className,
  absolute = false,
  colors,
  noise = false,
  respectReducedMotion = true,
  style,
}) => {
  const { isDark } = useTheme();
  const isSafari =
    typeof navigator !== "undefined" &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent);

  // Get mode configuration
  const modeConfig = BG_MODE_CONFIGS[mode] || BG_MODE_CONFIGS.ambient;

  // Apply mode config with manual overrides
  const effectiveStrength = strength ?? modeConfig.strength;
  const effectiveParallax = parallaxIntensity ?? modeConfig.parallax;
  const effectiveSpeed = speed ?? modeConfig.speed;

  // Once-on-mount effect randomization - stable across renders
  const [effectIndex] = useState(() =>
    Math.floor(Math.random() * effectFunctions.length),
  );

  // Respect reduced motion
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      const reducedMotion = mediaQuery.matches;
      setShouldAnimate(respectReducedMotion ? !reducedMotion : true);
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [respectReducedMotion]);

  // Generate refined theme-aware palette
  const palette: GlooPalette = useMemo(() => {
    if (colors) {
      return {
        colors,
        strategy: "brand-triad",
        mode: isDark ? "dark" : "light",
        metadata: { generated: false },
      };
    }

    const colorTuples = REFINED_COLORS[isDark ? "dark" : "light"];
    return {
      colors: tuplesToHexPalette(colorTuples),
      strategy: "brand-triad",
      mode: isDark ? "dark" : "light",
      metadata: {
        generated: false,
      },
    };
  }, [isDark, colors, modeConfig.saturation, mode]);

  if (disabled || typeof window === "undefined") {
    return null;
  }

  // CSS custom properties for strength-based glass integration
  const glassStrengthStyles = {
    "--glass-strength": effectiveStrength,
    "--glass-mode": mode,
    "--bg-saturation": modeConfig.saturation,
    "--bg-noise-intensity": modeConfig.noise,
  } as React.CSSProperties;

  return (
    <div
      className={[
        "bg-goo-refined",
        absolute ? "absolute inset-0" : "fixed inset-0",
        "pointer-events-none select-none",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        zIndex,
        isolation: "isolate",
        willChange: shouldAnimate ? "transform" : "auto",
        width: "100vw",
        height: "100vh",
        minWidth: "100vw",
        minHeight: "100vh",
        overflow: "hidden",
        ...glassStrengthStyles,
        ...style,
      }}
      data-bg-mode={mode}
      data-bg-strength={effectiveStrength}
      data-bg-effect-index={effectIndex}
      data-bg-theme={isDark ? "dark" : "light"}
      data-testid="bg-goo-refined"
    >
      <GlooCanvasAtomic
        // Mode-driven parameters
        speed={effectiveSpeed}
        resolution={resolution}
        depth={depth}
        seed={seed}
        // Stable configuration
        effectIndex={effectIndex}
        animate={shouldAnimate}
        still={!shouldAnimate}
        // Refined palette with saturation control
        palette={palette}
        // Motion settings
        reducedMotion={!shouldAnimate}
        // Performance optimizations
        preserveDrawingBuffer={false}
        dpr={isSafari ? 1 : undefined}
      />

      {/* Optional noise overlay */}
      {noise && modeConfig.noise > 0 && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: `
              repeating-linear-gradient(
                0deg,
                rgba(255, 255, 255, ${modeConfig.noise * 0.1}) 0 1px,
                transparent 1px 2px
              ),
              repeating-linear-gradient(
                90deg,
                rgba(0, 0, 0, ${modeConfig.noise * 0.05}) 0 1px,
                transparent 1px 2px
              )
            `,
            mixBlendMode: "overlay",
            opacity: isDark ? 0.6 : 0.8,
          }}
          aria-hidden="true"
        />
      )}

      {/* Development debug info */}
      {process.env.NODE_ENV === "development" && (
        <div
          className="absolute bottom-2 left-2 z-50 pointer-events-none"
          style={{
            fontSize: "10px",
            fontFamily: "ui-monospace, monospace",
            background: isDark
              ? "rgba(59, 130, 246, 0.9)"
              : "rgba(0, 0, 0, 0.8)",
            color: isDark ? "#000000" : "#00ff88",
            padding: "0.5rem",
            borderRadius: "4px",
            border: isDark
              ? "1px solid rgba(96, 165, 250, 0.3)"
              : "1px solid rgba(0, 255, 136, 0.3)",
          }}
        >
          <div>🎭 BgGooRefined v1.0</div>
          <div>Mode: {mode}</div>
          <div>Strength: {effectiveStrength.toFixed(2)}</div>
          <div>Parallax: {effectiveParallax.toFixed(2)}</div>
          <div>Speed: {effectiveSpeed.toFixed(2)}</div>
          <div>
            Effect: {effectIndex}/{effectFunctions.length}
          </div>
          <div>Saturation: {modeConfig.saturation.toFixed(2)}</div>
          <div>Animate: {shouldAnimate ? "yes" : "no"}</div>
          <div>
            Noise: {noise && modeConfig.noise > 0 ? "enabled" : "disabled"}
          </div>
        </div>
      )}
    </div>
  );
};

BgGooRefined.displayName = "BgGooRefined";

export default BgGooRefined;
