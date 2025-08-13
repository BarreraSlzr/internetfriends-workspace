import { generateStamp } from "@/lib/utils/timestamp";
"use client";

import React, { useEffect, useRef, useState, useMemo } from "react";
import { BgGooSimple } from "./gloo-simple";
import { getRandomColors } from "../../lib/color-palette";
import { cn } from "@/lib/utils";

// Global flag interface augmentation
declare global {
  interface Window {
    [key: string]: unknown;
  }
}

/**
 * GlooRoot - Global ambient "gloo" background layer.
 *
 * Goals:
 * - Provide a SINGLE growing canvas / goo field for the entire app (hero, header, sections share it)
 * - Avoid duplicate BgGoo instances (performance)
 * - Respect reduced motion and visibility (auto pause / degrade)
 * - Offer simple preset API instead of ad hoc param soup
 * - Allow optional overlay gradient + subtle vignette
 *
 * Design:
 * - This is a fixed layer (not scrolling) by default; can optionally be 'absolute' if wrapped.
 * - It exposes CSS custom properties for downstream tuning (opacity / scale).
 * - Consumers should not mount more than one; the component guards against duplicates.
 */
interface GlooPresetConfig {
  speed: number;
  intensity: number;
  exposureMultiplier: number;
  quality: "low" | "medium" | "high";
}

type GlooPreset =
  | "subtle"
  | "balanced"
  | "vivid"
  | "hero"
  | "badge"
  | "section";

const PRESETS: Record<GlooPreset, GlooPresetConfig> = {
  subtle: {
    speed: 0.1,
    intensity: 0.55,
    exposureMultiplier: 0.85,
    quality: "low",
  },
  balanced: {
    speed: 0.18,
    intensity: 0.9,
    exposureMultiplier: 1.0,
    quality: "medium",
  },
  vivid: {
    speed: 0.24,
    intensity: 1.2,
    exposureMultiplier: 1.15,
    quality: "high",
  },
  hero: {
    speed: 0.28,
    intensity: 1.15,
    exposureMultiplier: 1.18,
    quality: "high",
  },
  badge: {
    speed: 0.16,
    intensity: 0.95,
    exposureMultiplier: 1.05,
    quality: "medium",
  },
  section: {
    speed: 0.14,
    intensity: 0.7,
    exposureMultiplier: 0.95,
    quality: "low",
  },
};

export interface GlooRootProps {
  preset?: GlooPreset;
  /** Force animation on/off; if undefined preset + reduced-motion decide */
  animate?: boolean;
  /** Override intensity (multiplies preset) */
  intensity?: number;
  /** Override speed (multiplies preset speed) */
  speedScale?: number;
  /** Optional z-index (default -1 so content sits above) */
  zIndex?: number;
  /** Use absolute instead of fixed positioning */
  absolute?: boolean;
  /** Hide / disable completely */
  disabled?: boolean;
  /** Blend mode used by container */
  blendMode?: React.CSSProperties["mixBlendMode"];
  /** Add a soft gradient overlay (top->bottom) */
  gradientOverlay?: boolean;
  /** Add a vignette radial mask */
  vignette?: boolean;
  /** ClassName passthrough */
  className?: string;
  /** Additional style overrides */
  style?: React.CSSProperties;
  /** Children (rendered ABOVE the gloo but INSIDE the same stacking context) */
  children?: React.ReactNode;
}

const GLOBAL_FLAG = "__IF_GLOO_ROOT__";

export const GlooRoot: React.FC<GlooRootProps> = ({
  preset = "balanced",
  animate,
  intensity,
  speedScale = 1,
  zIndex = -1,
  absolute = false,
  disabled = false,
  blendMode = "normal",
  gradientOverlay = true,
  vignette = true,
  className,
  style,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canAnimate, setCanAnimate] = useState(false);
  const [alreadyMounted, setAlreadyMounted] = useState(false);

  // Random colors once on mount, same approach as landingpage
  const randomColors = useMemo(() => getRandomColors(), []);

  // Guard: single instance
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window[GLOBAL_FLAG]) {
      setAlreadyMounted(true);
      return;
    }
    window[GLOBAL_FLAG] = true;
    return () => {
      // do not unset on unmount intentionally (prevents thrash during route transitions)
    };
  }, []);

  // Reduced motion & visibility management
  useEffect(() => {
    if (disabled) return;
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const reduce = media.matches;
    const decide = () => {
      if (typeof animate === "boolean") {
        setCanAnimate(animate && !reduce);
      } else {
        // Auto: disable if reduce; else enable for non-low presets
        setCanAnimate(!reduce && preset !== "subtle");
      }
    };
    decide();
    const handle = () => decide();
    media.addEventListener("change", handle);
    const vis = () => {
      if (document.visibilityState === "hidden") {
        setCanAnimate(false);
      } else {
        decide();
      }
    };
    document.addEventListener("visibilitychange", vis);
    return () => {
      media.removeEventListener("change", handle);
      document.removeEventListener("visibilitychange", vis);
    };
  }, [animate, disabled, preset]);

  if (disabled || alreadyMounted) {
    return children ? <>{children}</> : null;
  }

  const cfg = PRESETS[preset];
  const effIntensity = intensity ?? cfg.intensity;
  const effSpeed = cfg.speed * speedScale;

  return (
    <div
      ref={containerRef}
      className={cn(
        "if-gloo-root pointer-events-none select-none",
        absolute ? "absolute inset-0" : "fixed inset-0",
        "overflow-hidden",
        className,
      )}
      style={{
        zIndex,
        mixBlendMode: blendMode,
        ...style,
      }}
      aria-hidden="true"
      data-gloo-preset={preset}
      data-gloo-anim={canAnimate ? "on" : "off"}
    >
      <div className="absolute inset-0">
        <BgGooSimple
          speed={effSpeed}
          resolution={
            cfg.quality === "high" ? 2.5 : cfg.quality === "medium" ? 2.0 : 1.5
          }
          depth={cfg.quality === "high" ? 5 : cfg.quality === "medium" ? 4 : 3}
          seed={Math.random() * 5}
          still={!canAnimate}
          parallaxIntensity={effIntensity}
          color1={randomColors[0]}
          color2={randomColors[1]}
          color3={randomColors[2]}
        />
      </div>

      {gradientOverlay && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(to bottom, rgba(255,255,255,0.65) 0%, rgba(255,255,255,0.25) 35%, rgba(255,255,255,0.05) 60%, rgba(255,255,255,0) 85%)",
            mixBlendMode: "overlay",
          }}
          data-gloo-layer="gradient"
        />
      )}
      {gradientOverlay && (
        <div
          className="absolute inset-0 pointer-events-none dark:block hidden"
          style={{
            background:
              "linear-gradient(to bottom, rgba(15,18,22,0.85) 0%, rgba(15,18,22,0.55) 40%, rgba(15,18,22,0.25) 70%, rgba(15,18,22,0.1) 90%)",
            mixBlendMode: "normal",
          }}
          data-gloo-layer="gradient-dark"
        />
      )}

      {vignette && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 55%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.08) 75%, rgba(0,0,0,0.18) 100%)",
            mixBlendMode: "multiply",
          }}
          data-gloo-layer="vignette"
        />
      )}

      {/* Children (optional layering) */}
      {children && (
        <div className="absolute inset-0 pointer-events-none" data-gloo-slot>
          {children}
        </div>
      )}
    </div>
  );
};

export default GlooRoot;

/**
 * Suggested usage (once in root layout):
 *
 * <GlooRoot preset="hero" zIndex={-1} />
 *
 * Section-level local suppression:
 * body[data-reduced-gloo="true"] .if-gloo-root { opacity: .4; filter: saturate(.8); }
 *
 * TODO (future):
 * - Palette cycling on route transitions
 * - Optional WebGL pipeline behind feature flag
 */
