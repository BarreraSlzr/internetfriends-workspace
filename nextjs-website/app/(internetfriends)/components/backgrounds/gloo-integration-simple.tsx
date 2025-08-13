"use client";
import { generateStamp } from "@/lib/utils/timestamp";
/**
 * gloo-integration-simple.tsx - Example Gloo Integration Component
 *
 * ⚠️ DEPRECATED: This is a development/example component.
 * For production use, import GlooClient from '@/app/(internetfriends)/components/gloo-client'
 *
 * This component demonstrates "Steadiest Addressability Agency" patterns:
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
 * @deprecated Use GlooClient instead
 * @example
 * // Instead of this:
 * // <GlooIntegrationSimple />
 *
 * // Use this:
 * import { GlooClient } from '@/app/(internetfriends)/components/gloo-client';
 * <GlooClient />
 */

import React, { useState, useEffect } from "react";
import { useTheme } from "../../../../hooks/use-theme";
import { ClientOnly } from "../../patterns/boundary-patterns";
import { GlooCanvasAtomic } from "../gloo/canvas.atomic";
import { effectFunctions } from "./gloo-effects";
import type { GlooPalette } from "../gloo/types";

// Steadiest Component Interface - MAXIMUM 5 props
/**
 * @deprecated Use GlooClient instead
 */
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
    [223 / 255, 72 / 255, 67 / 255], // InternetFriends red
    [235 / 255, 64 / 255, 240 / 255], // InternetFriends purple
  ] as const,
  dark: [
    [255 / 255, 235 / 255, 112 / 255], // Brighter yellow for dark
    [255 / 255, 92 / 255, 87 / 255], // Brighter red for dark
    [255 / 255, 84 / 255, 255 / 255], // Brighter purple for dark
  ] as const,
};

// Convert RGB tuples to hex strings
function rgbTuplesToHex(
  tuples: readonly (readonly [number, number, number])[],
): [string, string, string] {
  return tuples.map(([r, g, b]) => {
    const toHex = (n: number) =>
      Math.round(n * 255)
        .toString(16)
        .padStart(2, "0");
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
  const isSafari =
    typeof navigator !== "undefined" &&
    /Safari/.test(navigator.userAgent) &&
    !/Chrome/.test(navigator.userAgent);

  // Once-on-mount effect selection (key steadiest addressability pattern)
  const [selectedEffect] = useState(() => {
    const effectNames = Object.keys(effectFunctions);
    return Math.floor(Math.random() * effectNames.length);
  });

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
    },
  };

  if (disabled) return null;

  // Development warning
  if (process.env.NODE_ENV === "development") {
    console.warn(
      "⚠️ GlooIntegrationSimple is deprecated. Use GlooClient from gloo-client.tsx instead.",
    );
  }

  return (
    <ClientOnly
      config={{
        fallback: <div data-gloo-loading="true" />,
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
          speed={0.4} // Smooth, non-distracting animation
          resolution={2.0} // Good quality without performance issues
          depth={4} // Visual interest without complexity
          seed={2.4} // Aesthetically pleasing patterns
          // Stable configuration (no randomization during runtime)
          effectIndex={selectedEffect}
          // Motion preferences
          animate={motionEnabled}
          still={!motionEnabled}
          reducedMotion={!motionEnabled}
          // Brand palette
          palette={palette}
          // Simple WebGL settings
          preserveDrawingBuffer={false}
          dpr={isSafari ? 1 : undefined}
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
            <div>🎭 Gloo Simple (DEPRECATED)</div>
            <div>Effect: {selectedEffect + 1}</div>
            <div>Mode: {isDark ? "dark" : "light"}</div>
            <div>Motion: {motionEnabled ? "on" : "off"}</div>
            <div className="text-red-300 text-xs mt-1">
              ⚠️ Use GlooClient instead
            </div>
          </div>
        )}
      </div>
    </ClientOnly>
  );
};

export default GlooIntegrationSimple;
