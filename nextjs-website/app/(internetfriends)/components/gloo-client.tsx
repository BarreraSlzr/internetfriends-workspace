"use client";
/**
 * gloo-client.tsx - Simplified Gloo Client using Steadiest Addressability patterns
 *
 * Replaces over-configurable implementation with:
 * 1. Minimal configuration surface (only essential props)
 * 2. Once-on-mount randomization (stable effect selection)
 * 3. Productive defaults from legacy repo
 * 4. Clear client boundary with proper error handling
 * 5. Brand color consistency
 *
 * Usage:
 * <GlooClient />
 * <GlooClient disabled={reducedMotion} />
 * <GlooClient zIndex={-10} />
 */

import React, { useState, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { ClientOnly } from "../patterns/boundary-patterns";
import { GlooCanvasAtomic } from "./gloo/canvas.atomic";
import { effectFunctions } from "./gloo/effects";
import type { GlooPalette } from "./gloo/types";

// Steadiest Component Interface - minimal props only
interface GlooClientProps {
  /** Disable rendering entirely */
  disabled?: boolean;
  /** Z-index for positioning (default: 0) */
  zIndex?: number;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
  /** Debug info for development */
  "data-testid"?: string;
  /** Epic context for tracking */
  epicContext?: {
    epicName?: string;
    epicPhase?: "development" | "review" | "complete";
  };
}

// Productive brand colors from legacy repo (exact RGB tuples)
const PRODUCTIVE_COLORS = {
  light: [
    [235 / 255, 231 / 255, 92 / 255],
    [223 / 255, 72 / 255, 67 / 255],
    [235 / 255, 64 / 255, 240 / 255],
  ] as [number, number, number][],
  dark: [
    [235 / 255, 231 / 255, 92 / 255],
    [255 / 255, 92 / 255, 87 / 255],
    [255 / 255, 84 / 255, 255 / 255],
  ] as [number, number, number][],
};

// Convert RGB tuples to hex for palette API
function tuplesToHex(
  tuples: [number, number, number][],
): [string, string, string] {
  return tuples.map(
    ([r, g, b]) =>
      "#" +
      [r * 255, g * 255, b * 255]
        .map((c) => Math.round(c).toString(16).padStart(2, "0"))
        .join(""),
  ) as [string, string, string];
}

export const GlooClient: React.FC<GlooClientProps> = ({
  disabled = false,
  zIndex = 0,
  className,
  style,
  "data-testid": testId = "gloo-client",
  epicContext,
}) => {
  const { isDark } = useTheme();

  // Once-on-mount effect randomization - key steadiest addressability pattern
  const [effectIndex] = useState(() => {
    const randomIndex = Math.floor(Math.random() * effectFunctions.length);
    console.log(
      "🎲 Gloo Random Effect Selected:",
      randomIndex,
      "/",
      effectFunctions.length,
    );
    return randomIndex;
  });

  // Respect reduced motion preference
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setShouldAnimate(!mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Theme-aware productive palette
  const palette: GlooPalette = {
    colors: tuplesToHex(PRODUCTIVE_COLORS[isDark ? "dark" : "light"]),
    strategy: "brand-triad",
    mode: isDark ? "dark" : "light",
    metadata: {
      generated: false,
    },
  };

  // Debug logging
  React.useEffect(() => {
    console.log("🎨 Gloo Colors Debug:", {
      theme: isDark ? "dark" : "light",
      colors: palette.colors,
      effectIndex,
      webglSupported: !!window.WebGLRenderingContext,
      safari:
        /Safari/.test(navigator.userAgent) &&
        !/Chrome/.test(navigator.userAgent),
    });
  }, [isDark, palette.colors, effectIndex]);

  if (disabled) return null;

  return (
    <ClientOnly
      config={{
        fallback: null,
        debug: process.env.NODE_ENV === "development",
        epicContext: epicContext
          ? {
              epicName: epicContext.epicName || "unknown",
              epicPhase: epicContext.epicPhase || "development",
            }
          : undefined,
      }}
    >
      <div
        className={[
          "gloo-client",
          "fixed inset-0 pointer-events-none select-none",
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
        data-testid={testId}
        data-gloo-client="true"
        data-gloo-effect-index={effectIndex}
        data-gloo-theme={isDark ? "dark" : "light"}
        data-epic={epicContext?.epicName}
        data-epic-phase={epicContext?.epicPhase}
      >
        <GlooCanvasAtomic
          // Productive parameters from legacy repo (proven in production)
          speed={0.4}
          resolution={2.0}
          depth={4}
          seed={2.4}
          // Stable configuration
          effectIndex={effectIndex}
          // Animation state
          animate={shouldAnimate}
          still={!shouldAnimate}
          // Brand palette
          palette={palette}
          // Reduced motion support
          reducedMotion={!shouldAnimate}
          // Keep WebGL simple
          preserveDrawingBuffer={false}
          // Canvas debugging
          width={typeof window !== "undefined" ? window.innerWidth : 800}
          height={typeof window !== "undefined" ? window.innerHeight : 600}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            opacity: shouldAnimate ? 1 : 0.5,
          }}
          onError={(error) => {
            console.error("🚨 Gloo Canvas Error:", error);
            console.log("🔍 WebGL Support:", !!window.WebGLRenderingContext);
            console.log(
              "🔍 Safari:",
              /Safari/.test(navigator.userAgent) &&
                !/Chrome/.test(navigator.userAgent),
            );
          }}
        />

        {/* Development debug overlay */}
        {process.env.NODE_ENV === "development" && (
          <div
            className="absolute bottom-4 right-4 z-50 pointer-events-none"
            style={{
              fontSize: "10px",
              fontFamily: "ui-monospace, monospace",
              background: "rgba(59, 130, 246, 0.9)",
              color: "white",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid rgba(147, 197, 253, 0.3)",
              maxWidth: "200px",
            }}
          >
            <div className="font-semibold mb-1">🎭 Gloo Client</div>
            <div>
              Effect: {effectIndex + 1}/{effectFunctions.length}
            </div>
            <div>Theme: {isDark ? "dark" : "light"}</div>
            <div>Motion: {shouldAnimate ? "enabled" : "reduced"}</div>
            <div>Colors: {palette.colors.join(", ")}</div>
            <div>
              WebGL:{" "}
              {typeof window !== "undefined" && window.WebGLRenderingContext
                ? "✅"
                : "❌"}
            </div>
            <div>
              Safari:{" "}
              {typeof window !== "undefined" &&
              /Safari/.test(navigator.userAgent) &&
              !/Chrome/.test(navigator.userAgent)
                ? "✅"
                : "❌"}
            </div>
            {epicContext && (
              <div className="mt-1 pt-1 border-t border-blue-300/30">
                <div>Epic: {epicContext.epicName || "none"}</div>
                <div>Phase: {epicContext.epicPhase || "dev"}</div>
              </div>
            )}
          </div>
        )}

        {/* Canvas visibility test overlay */}
        <div
          className="absolute top-4 left-4 z-40 pointer-events-none"
          style={{
            fontSize: "12px",
            fontFamily: "ui-monospace, monospace",
            background: "rgba(255, 0, 0, 0.8)",
            color: "white",
            padding: "0.5rem",
            borderRadius: "4px",
            display: process.env.NODE_ENV === "development" ? "block" : "none",
          }}
        >
          🔍 Canvas should be visible behind this overlay
          <br />
          Effect #{effectIndex}: {palette.colors[0]}
        </div>
      </div>
    </ClientOnly>
  );
};

export default GlooClient;
