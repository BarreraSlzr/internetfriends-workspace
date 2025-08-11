"use client";
/**
 * global.organism.tsx - Epic Gloo Global Organism Component
 * Theme-aware WebGL background with InternetFriends palette integration
 */

import React, { useMemo, useEffect, useState } from "react";
import { useTheme } from "@/hooks/use-theme";
import { GlooCanvasAtomic } from "./canvas.atomic";
import { generateGlooPalette } from "./palette";
import type {
  GlooGlobalProps,
  GlooPalette,
  GlooThemeMode,
  GlooEffectName,
} from "./types";

export const GlooGlobalOrganism: React.FC<GlooGlobalProps> = ({
  speed = 0.4,
  resolution = 2.0,
  depth = 4,
  seed = 2.4,
  still = false,
  effectIndex = 0,
  effectName,

  animate = true,
  preserveDrawingBuffer = false,
  paletteStrategy = "brand-triad",
  paletteLight,
  paletteDark,
  palette,
  anchorToPrimary = true,
  autoRegeneratePalette = false,
  paletteRegenerateMs = 30000,
  disabled = false,
  className,
  style,
  absolute = false,
  zIndex = 1,
  reducedMotion,
  epicContext,
  onError,
  onEffectChange,
}): React.JSX.Element | null => {
  const { isDark } = useTheme();
  const [currentPalette, setCurrentPalette] = useState<GlooPalette | null>(
    null,
  );
  const [paletteGenerationSeed, setPaletteGenerationSeed] = useState(
    seed || Date.now(),
  );

  // Detect reduced motion preference
  const shouldRespectReducedMotion = useMemo(() => {
    if (reducedMotion !== undefined) return reducedMotion;
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }, [reducedMotion]);

  // Generate theme-aware palette
  const resolvedPalette = useMemo<GlooPalette>(() => {
    const mode: GlooThemeMode = isDark ? "dark" : "light";

    // Priority 1: Explicit palette prop
    if (palette && palette.length >= 3) {
      return {
        colors: palette.slice(0, 3) as [string, string, string],
        strategy: paletteStrategy,
        mode,
        metadata: { generated: false },
      };
    }

    // Priority 2: Theme-specific palettes
    if (isDark && paletteDark && paletteDark.length >= 3) {
      return {
        colors: paletteDark.slice(0, 3) as [string, string, string],
        strategy: paletteStrategy,
        mode,
        metadata: { generated: false },
      };
    }

    if (!isDark && paletteLight && paletteLight.length >= 3) {
      return {
        colors: paletteLight.slice(0, 3) as [string, string, string],
        strategy: paletteStrategy,
        mode,
        metadata: { generated: false },
      };
    }

    // Priority 3: Generated palette with strategy
    const anchorColor = anchorToPrimary ? "#3b82f6" : undefined;

    return generateGlooPalette({
      mode,
      strategy: paletteStrategy,
      seed: paletteGenerationSeed,
      anchorColor,
    });
  }, [
    isDark,
    palette,
    paletteLight,
    paletteDark,
    paletteStrategy,
    anchorToPrimary,
    paletteGenerationSeed,
  ]);

  // Update current palette when resolved palette changes
  useEffect(() => {
    setCurrentPalette(resolvedPalette);
  }, [resolvedPalette]);

  // Auto-regenerate palette
  useEffect(() => {
    if (!autoRegeneratePalette || still || disabled) return;

    const intervalId = setInterval(() => {
      setPaletteGenerationSeed(Date.now());
    }, paletteRegenerateMs);

    return () => clearInterval(intervalId);
  }, [autoRegeneratePalette, paletteRegenerateMs, still, disabled]);

  // Epic context logging (development mode)
  useEffect(() => {
    if (process.env.NODE_ENV === "development" && epicContext) {
      console.log("🎭 Gloo Epic Context:", {
        epic: epicContext.epicName,
        phase: epicContext.epicPhase,
        palette: currentPalette?.strategy,
        effect: effectName || effectIndex,
        theme: isDark ? "dark" : "light",
      });
    }
  }, [epicContext, currentPalette, effectName, effectIndex, isDark]);

  // Theme-aware tint adjustment
  const themeTint = useMemo<[number, number, number]>(() => {
    if (isDark) {
      // Dark mode: slightly boost brightness and reduce harsh whites
      return [0.95, 0.98, 1.05];
    } else {
      // Light mode: standard tinting
      return [1, 1, 1];
    }
  }, [isDark]);

  // Handle effect changes for epic tracking
  const handleEffectChange = (index: number, name: GlooEffectName) => {
    onEffectChange?.(index, name);

    // Epic metrics tracking
    if (epicContext?.epicMetrics?.visualImpact) {
      const visualImpact = epicContext.epicMetrics.visualImpact;
      visualImpact.effectCycles = (visualImpact.effectCycles || 0) + 1;
    }
  };

  const handlePaletteError = (error: string) => {
    console.warn("🎨 Gloo Palette Error:", error);

    // Enhanced WebGL debugging
    if (process.env.NODE_ENV === "development") {
      console.group("🔍 Gloo Debug Info");
      console.log(
        "Canvas element:",
        document.querySelector('[data-testid="gloo-canvas"]'),
      );
      const canvas = document.querySelector(
        '[data-testid="gloo-canvas"]',
      ) as HTMLCanvasElement;
      if (canvas) {
        const gl = (canvas.getContext("webgl") ||
          canvas.getContext(
            "experimental-webgl",
          )) as WebGLRenderingContext | null;
        console.log("WebGL context:", gl);
        console.log("Canvas dimensions:", canvas.width, canvas.height);
        console.log("Computed style z-index:", getComputedStyle(canvas).zIndex);
        if (gl) {
          console.log(
            "WebGL extensions:",
            gl.getSupportedExtensions()?.slice(0, 8),
          );
        }
      }
      console.groupEnd();
    }

    onError?.(error);
  };

  if (disabled) return null;

  // Simple fallback to verify wrapper renders
  if (!currentPalette) {
    return (
      <div
        className={[
          "if-gloo-global",
          absolute ? "absolute inset-0" : "fixed inset-0",
          "pointer-events-none",
          className || "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          zIndex,
          background:
            "linear-gradient(45deg, rgba(59,130,246,0.1), rgba(147,51,234,0.1))",
          ...style,
        }}
        data-gloo-global="true"
        data-gloo-fallback="no-palette"
        data-testid="gloo-fallback"
      >
        {process.env.NODE_ENV === "development" && (
          <div
            style={{
              position: "absolute",
              top: "20px",
              left: "20px",
              background: "rgba(255,0,0,0.8)",
              color: "white",
              padding: "8px",
              fontSize: "12px",
              fontFamily: "monospace",
            }}
          >
            Gloo Fallback: No Palette Generated
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={[
        "if-gloo-global",
        absolute ? "absolute inset-0" : "fixed inset-0",
        "pointer-events-none",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        zIndex,
        isolation: "isolate",
        willChange: shouldRespectReducedMotion ? "auto" : "transform",
        /* Enforce full-viewport sizing to avoid zero/partial render issues */
        width: "100vw",
        height: "100vh",
        minWidth: "100vw",
        minHeight: "100vh",
        maxWidth: "100vw",
        maxHeight: "100vh",
        overflow: "hidden",
        ...style,
      }}
      data-gloo-global="true"
      data-gloo-theme={isDark ? "dark" : "light"}
      data-gloo-strategy={currentPalette?.strategy}
      data-gloo-epic={epicContext?.epicName}
      data-gloo-epic-phase={epicContext?.epicPhase}
      data-testid="gloo-global"
    >
      {currentPalette && (
        <GlooCanvasAtomic
          speed={speed}
          resolution={resolution}
          depth={depth}
          seed={seed}
          still={still}
          effectIndex={effectIndex}
          effectName={effectName}
          animate={animate}
          preserveDrawingBuffer={preserveDrawingBuffer}
          palette={currentPalette}
          tint={themeTint}
          reducedMotion={shouldRespectReducedMotion}
          onError={handlePaletteError}
          onEffectChange={handleEffectChange}
        />
      )}

      {/* Enhanced Epic Development Debug Overlay */}
      {process.env.NODE_ENV === "development" && epicContext && (
        <div
          className="absolute top-4 right-4 z-50 pointer-events-none"
          style={{
            fontSize: "10px",
            fontFamily: "ui-monospace, monospace",
            background: "rgba(0, 0, 0, 0.9)",
            color: "#00ff88",
            padding: "0.75rem",
            borderRadius: "6px",
            maxWidth: "280px",
            border: "1px solid rgba(0, 255, 136, 0.3)",
          }}
        >
          <div className="text-blue-300 font-semibold mb-1">
            🎭 Epic Gloo Debug
          </div>
          <div>Epic: {epicContext.epicName || "none"}</div>
          <div>Phase: {epicContext.epicPhase || "dev"}</div>
          <div>Palette: {currentPalette?.strategy}</div>
          <div>Mode: {currentPalette?.mode}</div>
          <div>
            Effects: {epicContext?.epicMetrics?.visualImpact?.effectCycles ?? 0}
          </div>
          <div>Z-Index: {zIndex}</div>
          <div className="mt-1 text-xs opacity-75">
            {shouldRespectReducedMotion ? "🔇 Reduced Motion" : "▶️ Animating"}
          </div>
        </div>
      )}

      {/* WebGL Debug Overlay (Query Param Controlled) */}
      {typeof window !== "undefined" &&
        new URLSearchParams(window.location.search).has("glooDebug") && (
          <div
            className="absolute bottom-4 left-4 z-[999] pointer-events-none"
            style={{
              fontSize: "9px",
              fontFamily: "ui-monospace, monospace",
              background: "rgba(255, 0, 0, 0.95)",
              color: "#fff",
              padding: "0.5rem",
              borderRadius: "4px",
              maxWidth: "200px",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          >
            <div className="font-semibold">🔍 WebGL Debug Mode ACTIVE</div>
            <div>Canvas: {currentPalette ? "✓ Ready" : "✗ Missing"}</div>
            <div>Theme: {isDark ? "dark" : "light"}</div>
            <div>Z-Index: {zIndex}</div>
            <div>
              Animation: {shouldRespectReducedMotion ? "Reduced" : "Active"}
            </div>
            <div className="mt-1 text-xs">
              Colors: {currentPalette?.colors.join(", ").substring(0, 30)}...
            </div>
          </div>
        )}
    </div>
  );
};

export default GlooGlobalOrganism;
