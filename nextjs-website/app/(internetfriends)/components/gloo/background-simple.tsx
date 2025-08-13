
"use client";
/**
 * background-simple.tsx - Example Gloo Background Component
 *
 * ⚠️ DEPRECATED: This is a development/example component.
 * For production use, import GlooClient from '@/app/(internetfriends)/components/gloo-client'
 *
 * This component demonstrates the "Steadiest Addressability Agency" pattern:
 * 1. Minimal configuration surface - Only essential props
 * 2. Once-on-mount randomization - Stable effect selection
 * 3. Productive defaults - Parameters that work reliably
 * 4. Clear client-only boundary - No SSR complications
 * 5. Brand color consistency - InternetFriends palette
 *
 * @deprecated Use GlooClient instead
 * @example
 * // Instead of this:
 * // <GlooBackgroundSimple />
 *
 * // Use this:
 * import { GlooClient } from '@/app/(internetfriends)/components/gloo-client';
 * <GlooClient />
 */

import React, { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { GlooCanvasAtomic } from "./canvas.atomic";
import { effectFunctions } from "./effects";
import type { GlooPalette } from "./types";

/**
 * @deprecated Use GlooClient instead
 */
interface GlooBackgroundSimpleProps {
  /** Z-index for positioning (default: -1) */
  zIndex?: number;
  /** Disable rendering entirely */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Use absolute positioning instead of fixed */
  absolute?: boolean;
}

// Productive brand colors as normalized RGB tuples (from legacy repo)
const PRODUCTIVE_COLORS = {
  light: [
    [235 / 255, 231 / 255, 92 / 255], // Yellow
    [223 / 255, 72 / 255, 67 / 255], // Red
    [235 / 255, 64 / 255, 240 / 255], // Purple
  ] as const,
  dark: [
    [235 / 255, 231 / 255, 92 / 255], // Yellow (same - works in dark)
    [255 / 255, 92 / 255, 87 / 255], // Lighter red for dark mode
    [255 / 255, 84 / 255, 255 / 255], // Lighter purple for dark mode
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

/**
 * @deprecated Use GlooClient instead - this is kept for development/example purposes only
 */
export const GlooBackgroundSimple: React.FC<GlooBackgroundSimpleProps> = ({
  zIndex = -1,
  disabled = false,
  className,
  style,
  absolute = false,
}) => {
  const { isDark } = useTheme();
  const isSafari =
    typeof navigator !== "undefined" &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent);

  // Once-on-mount effect randomization - key learning from troubleshooting
  const [effectIndex] = useState(() =>
    Math.floor(Math.random() * effectFunctions.length),
  );

  // Respect reduced motion
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setShouldAnimate(!mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Generate theme-aware palette
  const palette: GlooPalette = {
    colors: tuplesToHexPalette(PRODUCTIVE_COLORS[isDark ? "dark" : "light"]),
    strategy: "brand-triad",
    mode: isDark ? "dark" : "light",
    metadata: {
      generated: false,
    },
  };

  if (disabled) return null;

  // Client-side only check
  if (typeof window === "undefined") return null;

  // Development warning
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "⚠️ GlooBackgroundSimple is deprecated. Use GlooClient from gloo-client.tsx instead.",
    );
  }

  return (
    <div
      className={[
        "gloo-background-simple",
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
        // Enforce full viewport to prevent render issues
        width: "100vw",
        height: "100vh",
        minWidth: "100vw",
        minHeight: "100vh",
        overflow: "hidden",
        ...style,
      }}
      data-gloo-simple="true"
      data-gloo-effect-index={effectIndex}
      data-gloo-theme={isDark ? "dark" : "light"}
      data-testid="gloo-background-simple"
    >
      <GlooCanvasAtomic
        // Productive parameters from legacy repo
        speed={0.4}
        resolution={2.0}
        depth={4}
        seed={2.4}
        // Stable configuration
        effectIndex={effectIndex}
        animate={shouldAnimate}
        still={!shouldAnimate}
        // Brand palette
        palette={palette}
        // Reduced motion support
        reducedMotion={!shouldAnimate}
        // Keep WebGL simple
        preserveDrawingBuffer={false}
        dpr={isSafari ? 1 : undefined}
      />

      {/* Development debug info */}
      {process.env.NODE_ENV === "development" && (
        <div
          className="absolute bottom-2 right-2 z-50 pointer-events-none"
          style={{
            fontSize: "10px",
            fontFamily: "ui-monospace, monospace",
            background: "rgba(0, 0, 0, 0.8)",
            color: "#00ff88",
            padding: "0.5rem",
            borderRadius: "4px",
            border: "1px solid rgba(0, 255, 136, 0.3)",
          }}
        >
          <div>🎭 Gloo Simple (DEPRECATED)</div>
          <div>
            Effect: {effectIndex}/{effectFunctions.length}
          </div>
          <div>Mode: {isDark ? "dark" : "light"}</div>
          <div>Animate: {shouldAnimate ? "yes" : "no"}</div>
          <div>Colors: {palette.colors.length}</div>
          <div className="text-red-300 text-xs mt-1">
            ⚠️ Use GlooClient instead
          </div>
        </div>
      )}
    </div>
  );
};

export default GlooBackgroundSimple;
