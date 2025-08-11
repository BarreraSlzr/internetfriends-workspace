"use client";
/**
 * gloo-integration-simple.tsx - Simplified Gloo Integration
 *
 * Applies "Steadiest Addressability Agency" patterns to replace
 * the over-configurable GlooIntegration component:
 *
 * BEFORE: 20+ props with complex strategy configurations
 * AFTER: 5 essential props with productive defaults
 *
 * Key simplifications:
 * 1. Remove strategy props (mode, fallbackChain, variant, quality)
 * 2. Remove micro-config (intensity, speed, blendMode, etc.)
 * 3. Remove nested config objects
 * 4. Use once-on-mount logic for stable behavior
 * 5. Apply productive defaults from proven implementations
 *
 * Usage:
 * <GlooIntegrationSimple />
 * <GlooIntegrationSimple disabled={reducedMotion} />
 * <GlooIntegrationSimple className="custom-positioning" />
 */

import React, { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { ClientOnly } from "../../patterns/boundary-patterns";
import { GlooCanvasAtomic } from "../gloo/canvas.atomic";
import { effectFunctions } from "../gloo/effects";
import type { GlooPalette } from "../gloo/types";

// Steadiest Component Interface - MAXIMUM 5 props
interface GlooIntegrationSimpleProps {
  /** Disable rendering entirely */
  disabled?: boolean;
  /** Additional CSS class for positioning */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Z-index (default: -1) */
  zIndex?: number;
  /** Data attribute for testing */
  "data-testid"?: string;
}

// Productive brand colors (from successful legacy implementation)
const BRAND_PALETTE = {
  light: [
    [235 / 255, 231 / 255, 92 / 255], // InternetFriends yellow
    [223 / 255, 72 / 255, 67 / 255],  // InternetFriends red
    [235 / 255, 64 / 255, 240 / 255], // InternetFriends purple
  ] as const,
  dark: [
    [255 / 255, 235 / 255, 112 / 255], // Brighter yellow for dark
    [255 / 255, 92 / 255, 87 / 255],   // Brighter red for dark
    [255 / 255, 84 / 255, 255 / 255],  // Brighter purple for dark
  ] as const,
};

// Convert RGB tuples to hex strings
function rgbTuplesToHex(tuples: readonly [number, number, number][]): [string, string, string] {
  return tuples.map(([r, g, b]) => {
    const toHex = (n: number) => Math.round(n * 255).toString(16).padStart(2, "0");
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }) as [string, string, string];
}

export const GlooIntegrationSimple: React.FC<GlooIntegrationSimpleProps> = ({
  disabled = false,
  className,
  style,
  zIndex = -1,
  "data-testid": testId = "gloo-integration-simple",
}) => {
  const { isDark } = useTheme();

  // Once-on-mount effect selection (key steadiest addressability pattern)
  const [selectedEffect] = useState(() =>
    Math.floor(Math.random() * effectFunctions.length)
  );

  // Respect accessibility preferences
  const [motionEnabled, setMotionEnabled] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updateMotion = () => setMotionEnabled(!mediaQuery.matches);

    updateMotion();
    mediaQuery.addEventListener("change", updateMotion);

    return () => mediaQuery.removeEventListener("change", updateMotion);
  }, []);

  // Generate theme-appropriate palette
  const palette: GlooPalette = {
    colors: rgbTuplesToHex(BRAND_PALETTE[isDark ? "dark" : "light"]),
    strategy: "brand-triad",
    mode: isDark ? "dark" : "light",
    metadata: {
      generated: false,
      source: "brand-productive",
    },
  };

  if (disabled) return null;

  return (
    <ClientOnly
      config={{
        fallback: null,
        debug: process.env.NODE_ENV === "development",
      }}
    >
      <div
        className={[
          "gloo-integration-simple",
          "fixed inset-0 pointer-events-none select-none overflow-hidden",
          className || "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          zIndex,
          isolation: "isolate",
          willChange: motionEnabled ? "transform" : "auto",
          // Enforce viewport coverage
          width: "100vw",
          height: "100vh",
          minWidth: "100vw",
          minHeight: "100vh",
          ...style,
        }}
        data-testid={testId}
        data-gloo-simple="true"
        data-gloo-effect={selectedEffect}
        data-gloo-theme={isDark ? "dark" : "light"}
        data-gloo-motion={motionEnabled ? "enabled" : "reduced"}
      >
        <GlooCanvasAtomic
          // Productive defaults (proven in production environments)
          speed={0.4}           // Smooth, non-distracting animation
          resolution={2.0}      // Good quality without performance issues
          depth={4}            // Visual interest without complexity
          seed={2.4}           // Aesthetically pleasing patterns

          // Stable configuration (no randomization during runtime)
          effectIndex={selectedEffect}
          randomEffect={false}
          autoEffectCycle={false}

          // Motion preferences
          animate={motionEnabled}
          still={!motionEnabled}
          reducedMotion={!motionEnabled}

          // Brand palette
          palette={palette}

          // Simple WebGL settings
          preserveDrawingBuffer={false}
        />

        {/* Development debug info (minimal) */}
        {process.env.NODE_ENV === "development" && (
          <div
            className="absolute top-4 left-4 z-50 pointer-events-none"
            style={{
              fontSize: "9px",
              fontFamily: "ui-monospace, monospace",
              background: "rgba(59, 130, 246, 0.85)",
              color: "white",
              padding: "6px 8px",
              borderRadius: "3px",
              border: "1px solid rgba(147, 197, 253, 0.3)",
            }}
          >
            <div>🎭 Gloo Simple</div>
            <div>Effect: {selectedEffect + 1}</div>
            <div>Theme: {isDark ? "dark" : "light"}</div>
            <div>Motion: {motionEnabled ? "on" : "off"}</div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
};

export default GlooIntegrationSimple;
