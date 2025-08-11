"use client";
/**
 * canvas.atomic.tsx - Epic Gloo Canvas Atomic Component
 * WebGL canvas with InternetFriends palette integration
 */

import React, { useMemo, useEffect } from "react";
import { useGlooWebGL } from "./core";
import { effectFunctions } from "./effects";
import { getInternetFriendsPalette, colorUtils } from "./palette";
import type {
  GlooCanvasProps,
  GlooEffectName,
  GlooPalette,
  GlooColorTuple,
} from "./types";

const DEFAULT_COLOR_1: GlooColorTuple = [59 / 255, 130 / 255, 246 / 255];
const DEFAULT_COLOR_2: GlooColorTuple = [147 / 255, 51 / 255, 234 / 255];
const DEFAULT_COLOR_3: GlooColorTuple = [236 / 255, 72 / 255, 153 / 255];

const EFFECT_NAME_MAP: Record<number, GlooEffectName> = {
  0: "default",
  1: "spiral",
  2: "wave",
  3: "vortex",
  4: "pulse",
  5: "ripple",
  6: "twist",
  7: "oscillate",
  8: "fractal",
  9: "swirl",
  10: "bounce",
};

const FRAGMENT_TEMPLATE = (
  effectSource: string,
  depth: number,
  resolution: number,
  seed: number,
  speed: number,
) =>
  `
precision mediump float;

uniform vec2 iResolution;
uniform float iTime;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform vec3 uColor3;
uniform vec3 uTint;

const float speed = ${speed.toFixed(3)};

${effectSource}

void main() {
  vec2 p = (2.0 * gl_FragCoord.xy - iResolution.xy) / max(iResolution.x, iResolution.y);

  // Seed offset
  p += vec2(${seed.toFixed(3)}, ${seed.toFixed(3)});
  p *= ${resolution.toFixed(2)};

  // Iterative warp
  for (int i = 1; i < ${depth}; i++) {
    float fi = float(i);
    p += effect(p, fi, iTime);
  }

  // Color mixing
  vec3 col = mix(
    mix(uColor1, uColor2, 0.5 + 0.5 * sin(p.x)),
    uColor3,
    0.5 + 0.5 * cos(p.y + p.x)
  );

  // Tint
  col *= uTint;

  // Subtle vignette for containment
  float d = length(p);
  col *= 1.0 - smoothstep(0.9, 1.25, d);

  gl_FragColor = vec4(col, 1.0);
}
`.trim();

export const GlooCanvasAtomic: React.FC<GlooCanvasProps> = ({
  speed = 0.4,
  resolution = 2.0,
  depth = 4,
  seed = 2.4,
  still = false,
  tint = [1, 1, 1],
  color1,
  color2,
  color3,
  colors,
  palette: explicitPalette,
  effectIndex = 0,
  effectName,
  width,
  height,
  className,
  style,
  animate = true,
  preserveDrawingBuffer = false,
  disabled = false,
  reducedMotion = false,
  onError,
  onEffectChange,
}) => {
  // Debug mode detection (must be at top level)
  const isDebugMode = useMemo(() => {
    if (typeof window === "undefined") return false;
    return new URLSearchParams(window.location.search).has("glooDebug");
  }, []);

  // Respect reduced motion preference
  const shouldAnimate = animate && !still && !disabled && !reducedMotion;

  // Enhanced z-index & enforced full-size for visibility/coverage
  const containerStyle = useMemo(
    () => ({
      position: "relative" as const,
      zIndex: 1,
      width: "100%",
      height: "100%",
      minWidth: "100%",
      minHeight: "100%",
      maxWidth: "100%",
      maxHeight: "100%",
      overflow: "hidden",
      ...style,
    }),
    [style],
  );

  // Choose effect based on priority: effectName > effectIndex > random
  const chosenEffectIndex = useMemo(() => {
    if (effectName) {
      const nameToIndex = Object.entries(EFFECT_NAME_MAP).find(
        ([, name]) => name === effectName,
      );
      return nameToIndex ? parseInt(nameToIndex[0]) : 0;
    }

    return Math.max(0, Math.min(effectFunctions.length - 1, effectIndex));
  }, [effectName, effectIndex]);

  const effectSource = effectFunctions[chosenEffectIndex];
  const currentEffectName = EFFECT_NAME_MAP[chosenEffectIndex] || "default";

  // Generate palette from props or use defaults
  const resolvedPalette = useMemo<GlooPalette>(() => {
    if (explicitPalette) {
      return explicitPalette;
    }

    if (colors && colors.length >= 3) {
      return {
        colors: colors.slice(0, 3) as [string, string, string],
        strategy: "brand-triad",
        mode: "light",
        metadata: { generated: false },
      };
    }

    // Use InternetFriends default palette
    return getInternetFriendsPalette("light");
  }, [explicitPalette, colors]);

  // Convert palette to RGB tuples
  const paletteRgb = useMemo<
    [GlooColorTuple, GlooColorTuple, GlooColorTuple]
  >(() => {
    const [hex1, hex2, hex3] = resolvedPalette.colors;

    return [
      colorUtils.hexToTuple(hex1) || color1 || DEFAULT_COLOR_1,
      colorUtils.hexToTuple(hex2) || color2 || DEFAULT_COLOR_2,
      colorUtils.hexToTuple(hex3) || color3 || DEFAULT_COLOR_3,
    ];
  }, [resolvedPalette.colors, color1, color2, color3]);

  // Build fragment shader
  const fragment = useMemo(
    () => FRAGMENT_TEMPLATE(effectSource, depth, resolution, seed, speed),
    [effectSource, depth, resolution, seed, speed],
  );

  // Static uniforms
  const staticUniforms = useMemo(
    () => ({
      uColor1: paletteRgb[0],
      uColor2: paletteRgb[1],
      uColor3: paletteRgb[2],
      uTint: tint,
    }),
    [paletteRgb, tint],
  );

  // Enhanced WebGL error handling
  const handleWebGLError = (err: string) => {
    console.error("🚨 Gloo Canvas WebGL Error:", err);

    // Enhanced debugging in development
    if (process.env.NODE_ENV === "development") {
      console.group("🔍 Gloo Canvas Debug");
      console.log("Effect:", currentEffectName, "Index:", chosenEffectIndex);
      console.log("Palette:", resolvedPalette);
      console.log("Static uniforms:", staticUniforms);
      console.log("Should animate:", shouldAnimate);
      console.log(
        "Fragment shader preview:",
        fragment.substring(0, 200) + "...",
      );
      console.groupEnd();
    }

    onError?.(err);
  };

  // WebGL hook with enhanced error reporting
  const { canvasRef, error, recompile, setPlaying } = useGlooWebGL({
    fragment,
    effectKey: chosenEffectIndex,
    playing: shouldAnimate,
    preserveDrawingBuffer,
    staticUniforms,
    dynamicUniforms: ({ time, canvas }) => ({
      iTime: still ? 0 : time,
      iResolution: [canvas.width, canvas.height],
    }),
    onError: handleWebGLError,
  });

  // Effect change callback
  useEffect(() => {
    onEffectChange?.(chosenEffectIndex, currentEffectName);
  }, [chosenEffectIndex, currentEffectName, onEffectChange]);

  // Auto effect cycling

  // Debug palette override (must be at top level)
  const debugPalette = useMemo(() => {
    if (isDebugMode) {
      return {
        colors: ["#ff0000", "#00ff00", "#0000ff"] as [string, string, string],
        strategy: "debug" as const,
        mode: resolvedPalette.mode,
        metadata: { generated: true, debug: true },
      };
    }
    return resolvedPalette;
  }, [resolvedPalette, isDebugMode]);

  // Sync animation state changes
  useEffect(() => {
    setPlaying(shouldAnimate);
  }, [shouldAnimate, setPlaying]);

  // Fallback resize enforcement:
  // Ensures the underlying canvas tracks its parent size if explicit width/height not provided
  // (acts as a safety net in cases where ResizeObserver in core fails or parent is dynamically sized)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    if (width || height) return; // Respect explicit dimensions

    const parent = canvas.parentElement as HTMLElement | null;
    if (!parent) return;

    const dpr = () => window.devicePixelRatio || 1;

    function enforce() {
      const rect = parent.getBoundingClientRect();
      const targetW = Math.max(1, Math.floor(rect.width * dpr()));
      const targetH = Math.max(1, Math.floor(rect.height * dpr()));
      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    }

    enforce();
    const ro = new ResizeObserver(enforce);
    ro.observe(parent);
    window.addEventListener("resize", enforce);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", enforce);
    };
  }, [canvasRef, width, height]);

  if (disabled) return null;

  const finalPalette = debugPalette;

  return (
    <div
      className={[
        "if-gloo-canvas",
        "relative block w-full h-full",
        "pointer-events-none select-none",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={containerStyle}
      data-gloo-effect={currentEffectName}
      data-gloo-index={chosenEffectIndex}
      data-gloo-playing={shouldAnimate}
      data-gloo-depth={depth}
      data-gloo-resolution={resolution}
      data-gloo-palette-strategy={finalPalette.strategy}
      data-gloo-palette-mode={finalPalette.mode}
      data-gloo-debug={isDebugMode}
    >
      <canvas
        ref={canvasRef}
        {...(typeof width === "number" ? { width } : {})}
        {...(typeof height === "number" ? { height } : {})}
        className="w-full h-full block"
        aria-hidden="true"
        data-testid="gloo-canvas"
      />
      {error && (
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{
            fontSize: 12,
            fontFamily: "ui-monospace, monospace",
            background:
              "linear-gradient(135deg, rgba(255,0,0,0.8), rgba(255,0,0,0.95))",
            color: "#fff",
            padding: "0.75rem",
            borderRadius: "var(--radius-sm)",
            zIndex: 1000,
          }}
        >
          <div className="text-center">
            <div className="font-semibold mb-1">🚨 Gloo WebGL Error</div>
            <div className="text-xs opacity-90 mb-2">{error}</div>
            <div className="text-xs opacity-75">Check console for details</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GlooCanvasAtomic;
