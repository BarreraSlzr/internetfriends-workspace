"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useRef,
  useId,
  CSSProperties,
  useCallback,
  ElementType,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "@/hooks/use-theme";
import { getAdaptiveGooColorTuples } from "../../lib/color-palette";

/**
 * Enhanced BgGoo (gloo) component
 *
 * Goals:
 * - Motion preference awareness (`prefers-reduced-motion`)
 * - Intensity / variant system (visual density + energy)
 * - Flexible color API (array, single string, legacy triplets)
 * - Accessibility friendly (decorative only, inert, respects reduced motion)
 * - Performance conscious (pauses when offscreen, avoids unnecessary re-renders)
 * - Backwards compatibility with existing props (color1 / color2 / color3 / still)
 *
 * Design Philosophy:
 * - Fail soft: if animation libraries or hooks fail, still render a pleasant static gradient.
 * - Progressive: add motion only after mount + preference check.
 * - Configurable: provide pragmatic, minimal prop surface for most use cases.
 */

/* -------------------------------------------------------
 * Types
 * ----------------------------------------------------- */

type RGB = [number, number, number];

type GooVariant = "subtle" | "balanced" | "vivid";
type GooQuality = "low" | "medium" | "high";
type GooBlend = CSSProperties["mixBlendMode"];

export interface BgGooProps {
  /* Visual behavior */
  animate?: boolean;
  variant?: GooVariant;
  quality?: GooQuality;
  speed?: number;
  blendMode?: GooBlend;
  intensity?: number;
  exposureMultiplier?: number;

  /* Motion + performance */
  suspendOffscreen?: boolean;
  idleDelayMs?: number;
  staticFallback?: boolean;

  /* Color system */
  colors?: string | string[];
  tint?: RGB;
  scheme?: "auto" | "light" | "dark";

  /* Teenage Engineering presets */
  modeStyle?: "default" | "teen";
  adaptiveColors?: boolean;

  /* Legacy compatibility (deprecated) */
  still?: boolean;
  color1?: RGB;
  color2?: RGB;
  color3?: RGB;
  depth?: number;
  resolution?: number;
  seed?: number;

  /* Accessibility / debug */
  disabled?: boolean;
  "data-debug"?: boolean;
  className?: string;
  style?: CSSProperties;
  as?: ElementType;

  /* Experimental flags */
  enableIdleLoading?: boolean;
}

/* -------------------------------------------------------
 * Internal Constants
 * ----------------------------------------------------- */

const LEGACY_BRAND: RGB[] = [
  [59 / 255, 130 / 255, 246 / 255],
  [147 / 255, 51 / 255, 234 / 255],
  [236 / 255, 72 / 255, 153 / 255],
];

const VARIANT_CONFIG: Record<
  GooVariant,
  {
    blobCount: number;
    baseOpacity: number;
    movement: number;
    scaleVariance: number;
  }
> = {
  subtle: {
    blobCount: 2,
    baseOpacity: 0.45,
    movement: 14,
    scaleVariance: 0.05,
  },
  balanced: {
    blobCount: 3,
    baseOpacity: 0.6,
    movement: 22,
    scaleVariance: 0.12,
  },
  vivid: { blobCount: 4, baseOpacity: 0.75, movement: 32, scaleVariance: 0.18 },
};

const QUALITY_BLUR: Record<GooQuality, number[]> = {
  low: [36, 52, 60, 60],
  medium: [40, 60, 72, 80],
  high: [48, 72, 84, 96],
};

const QUALITY_SIZE: Record<GooQuality, number[]> = {
  low: [40, 36, 32, 28],
  medium: [48, 44, 40, 36],
  high: [56, 52, 48, 44],
};

/* -------------------------------------------------------
 * Utility Functions
 * ----------------------------------------------------- */

function clamp(n: number, min: number, max: number) {
  return Math.min(max, Math.max(min, n));
}

function hexToRgb(hex: string): RGB | null {
  const normalized = hex.trim().replace("#", "");
  if (![3, 6].includes(normalized.length)) return null;
  const full =
    normalized.length === 3
      ? normalized
          .split("")
          .map((c) => c + c)
          .join("")
      : normalized;
  const intVal = parseInt(full, 16);
  return [
    ((intVal >> 16) & 255) / 255,
    ((intVal >> 8) & 255) / 255,
    (intVal & 255) / 255,
  ];
}

function parseColorInput(input?: string | string[]): RGB[] | null {
  if (!input) return null;
  const arr = Array.isArray(input) ? input : [input];
  const parsed: RGB[] = [];
  for (const raw of arr) {
    if (!raw) continue;
    if (raw.startsWith("#")) {
      const rgb = hexToRgb(raw);
      if (rgb) parsed.push(rgb);
    } else {
      const m = raw.match(/(\d+(\.\d+)?)/g);
      if (m && (m.length === 3 || m.length === 4)) {
        const [r, g, b] = m.map((n) => clamp(parseFloat(n), 0, 255) / 255);
        parsed.push([r, g, b]);
      }
    }
  }
  return parsed.length ? parsed : null;
}

function rgbTupleToCss(rgb: RGB, alpha = 1) {
  return `rgba(${Math.round(rgb[0] * 255)}, ${Math.round(
    rgb[1] * 255,
  )}, ${Math.round(rgb[2] * 255)}, ${alpha})`;
}

function chooseBlend(isDark: boolean, override?: GooBlend): GooBlend {
  if (override) return override;
  return (isDark ? "screen" : "multiply") as GooBlend;
}

/* -------------------------------------------------------
 * Blob Generation
 * ----------------------------------------------------- */

interface BlobDef {
  id: string;
  sizeRem: number;
  blurPx: number;
  color: RGB;
  origin: [number, number];
  movementVector: [number, number];
  scale: number;
  duration: number;
  delay: number;
}

function generateBlobs(
  variant: GooVariant,
  quality: GooQuality,
  colors: RGB[],
  speed: number,
  seedKey: string,
  movementBoost = 1,
): BlobDef[] {
  const cfg = VARIANT_CONFIG[variant];
  const count = cfg.blobCount;
  const sizes = QUALITY_SIZE[quality];
  const blurs = QUALITY_BLUR[quality];

  const palette = [...colors];
  while (palette.length < count) {
    palette.push(...palette);
  }

  let seed = 0;
  for (let i = 0; i < seedKey.length; i++) {
    seed = (seed * 31 + seedKey.charCodeAt(i)) % 1_000_000;
  }
  function rand() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  }

  return Array.from({ length: count }).map((_, i) => {
    const sizeRem = sizes[i] ?? sizes[sizes.length - 1];
    const blurPx = blurs[i] ?? blurs[blurs.length - 1];
    const mv = cfg.movement * movementBoost;
    const movementVector: [number, number] = [
      (rand() * mv + mv * 0.4) * (rand() > 0.5 ? 1 : -1),
      (rand() * mv + mv * 0.4) * (rand() > 0.5 ? 1 : -1),
    ];
    const origin: [number, number] = [15 + rand() * 70, 15 + rand() * 70];
    const scale = 1 + (rand() - 0.5) * cfg.scaleVariance * 2;
    const duration = (8 + rand() * 6) / clamp(speed, 0.05, 4);
    const delay = rand() * 2;
    return {
      id: `goo-blob-${i}`,
      sizeRem,
      blurPx,
      color: palette[i],
      origin,
      movementVector,
      scale,
      duration,
      delay,
    };
  });
}

/* -------------------------------------------------------
 * Component
 * ----------------------------------------------------- */

export function BgGoo(props: BgGooProps) {
  const {
    animate = true,
    variant = "balanced",
    quality = "medium",
    speed = 1,
    blendMode,
    intensity = 1,
    suspendOffscreen = true,
    idleDelayMs = 0,
    staticFallback = false,
    colors,
    tint,
    scheme = "auto",
    modeStyle = "default",
    adaptiveColors = false,
    still,
    color1,
    color2,
    color3,
    disabled = false,
    className,
    style,
    as: AsComponent = "div",
  } = props;

  const { theme } = useTheme();
  const isDark =
    scheme === "auto" ? theme.colorScheme === "dark" : scheme === "dark";
  const prefersReducedMotion = useReducedMotion();

  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(true);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceId = useId();

  useEffect(() => {
    if (color1 || color2 || color3) {
      console.warn(
        "[BgGoo] color1/color2/color3 props are deprecated. Use `colors` array instead.",
      );
    }
    if (still !== undefined) {
      console.warn(
        "[BgGoo] `still` prop is deprecated. Use `animate={false}` instead.",
      );
    }
  }, [color1, color2, color3, still]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const palette: RGB[] = useMemo(() => {
    // Adaptive colors override everything if enabled
    if (adaptiveColors && !colors) {
      return getAdaptiveGooColorTuples(isDark ? "dark" : "light", {
        desaturateLight: 0.5,
        lightenLight: 0.05,
        darkBoost: 1.07,
        count: 3,
      });
    }

    const fromNew = parseColorInput(colors);
    if (fromNew && fromNew.length) return fromNew.slice(0, 6);
    const legacy = [color1, color2, color3].filter(Boolean) as unknown as
      | RGB[]
      | undefined;
    if (legacy && legacy.length) return legacy;
    return LEGACY_BRAND;
  }, [colors, color1, color2, color3, adaptiveColors, isDark]);

  // Apply Teenage Engineering mode adjustments
  const teenAdjustments = useMemo(() => {
    if (modeStyle !== "teen")
      return { variant, quality, intensity, exposure: 1, movementBoost: 1 };

    if (isDark) {
      return {
        variant: "balanced" as GooVariant,
        quality: "medium" as GooQuality,
        intensity: Math.max(1.0, intensity * 1.05),
        exposure: 1,
        movementBoost: 1.1,
      };
    } else {
      return {
        variant: "balanced" as GooVariant,
        quality: "low" as GooQuality,
        intensity: Math.max(0.85, intensity * 0.9),
        exposure: 0.9,
        movementBoost: 1,
      };
    }
  }, [modeStyle, isDark, variant, quality, intensity]);

  const effectiveVariant = teenAdjustments.variant;
  const effectiveQuality = teenAdjustments.quality;
  const effectiveIntensity = clamp(teenAdjustments.intensity, 0.2, 2);
  const exposureMultiplier =
    props.exposureMultiplier || teenAdjustments.exposure;
  const movementBoost = teenAdjustments.movementBoost;

  // Improve blend mode for light teen mode
  const primaryBlend = useMemo(() => {
    if (blendMode) return blendMode;
    if (modeStyle === "teen" && !isDark && exposureMultiplier < 1) {
      return "normal" as GooBlend;
    }
    return chooseBlend(isDark, blendMode);
  }, [blendMode, modeStyle, isDark, exposureMultiplier]);

  const shouldAnimate =
    mounted &&
    animate &&
    !staticFallback &&
    still !== true &&
    !prefersReducedMotion &&
    visible &&
    !disabled;

  const blobs = useMemo(
    () =>
      generateBlobs(
        effectiveVariant,
        effectiveQuality,
        palette,
        clamp(speed, 0.05, 4),
        instanceId + JSON.stringify(palette),
        movementBoost,
      ),
    [
      effectiveVariant,
      effectiveQuality,
      palette,
      speed,
      instanceId,
      movementBoost,
    ],
  );

  useEffect(() => {
    if (!suspendOffscreen || !mounted) return;
    const el = containerRef.current;
    if (!el || typeof window === "undefined") return;

    let rafId: number | null = null;
    let lastVisible = true;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const currentlyVisible = entry.isIntersecting;
          if (currentlyVisible !== lastVisible) {
            if (rafId) cancelAnimationFrame(rafId);
            rafId = requestAnimationFrame(() => {
              setVisible(currentlyVisible);
              lastVisible = currentlyVisible;
            });
          }
        }
      },
      { root: null, threshold: [0, 0.05, 0.15] },
    );
    observer.observe(el);
    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      observer.disconnect();
    };
  }, [suspendOffscreen, mounted]);

  const [idleReady, setIdleReady] = useState(idleDelayMs === 0);
  useEffect(() => {
    if (idleDelayMs <= 0) return;
    const t = setTimeout(() => setIdleReady(true), idleDelayMs);
    return () => clearTimeout(t);
  }, [idleDelayMs]);

  const baseOpacity =
    VARIANT_CONFIG[effectiveVariant].baseOpacity *
    effectiveIntensity *
    exposureMultiplier;
  const gradientBackground = useMemo(() => {
    const c = palette.slice(0, 3);
    const layers = c
      .map((col, idx) => {
        const stop = rgbTupleToCss(col, baseOpacity * (0.85 - idx * 0.2));
        const posX = idx === 0 ? "25%" : idx === 1 ? "75%" : "50%";
        const posY = idx === 0 ? "30%" : idx === 1 ? "25%" : "70%";
        return `radial-gradient(circle at ${posX} ${posY}, ${stop} 0%, transparent 65%)`;
      })
      .join(", ");
    const wash = `linear-gradient(135deg, ${rgbTupleToCss(
      palette[0],
      0.08 * effectiveIntensity,
    )} 0%, ${rgbTupleToCss(palette[1] || palette[0], 0.08 * effectiveIntensity)} 50%, ${rgbTupleToCss(
      palette[2] || palette[1] || palette[0],
      0.08 * effectiveIntensity,
    )} 100%)`;
    return `${layers}, ${wash}`;
  }, [palette, baseOpacity, effectiveIntensity]);

  const containerStyles: CSSProperties = {
    position: "absolute",
    inset: "0",
    pointerEvents: "none",
    mixBlendMode: primaryBlend,
    background: gradientBackground,
    filter: `blur(${mounted ? 1 : 0}px)`,
    ...(style || {}),
  };

  palette.slice(0, 6).forEach((col, i) => {
    (containerStyles as unknown as Record<string, string>)[
      `--goo-color-${i + 1}`
    ] = rgbTupleToCss(col, 1);
  });
  (containerStyles as unknown as Record<string, string>)["--goo-opacity-base"] =
    baseOpacity.toString();
  (containerStyles as unknown as Record<string, string>)["--goo-intensity"] =
    effectiveIntensity.toString();

  const renderBlob = useCallback(
    (blob: BlobDef, index: number) => {
      const alpha =
        baseOpacity *
        (0.95 - index * 0.15) *
        clamp(effectiveIntensity * (1 + index * 0.05), 0, 1.2) *
        exposureMultiplier;
      const baseColor = rgbTupleToCss(blob.color, alpha);
      const blur = blob.blurPx;
      const sizeRem = blob.sizeRem;
      const translate = blob.movementVector;

      if (!shouldAnimate || !idleReady) {
        return (
          <div
            key={blob.id}
            aria-hidden="true"
            style={{
              position: "absolute",
              top: `${blob.origin[1]}%`,
              left: `${blob.origin[0]}%`,
              width: `${sizeRem}rem`,
              height: `${sizeRem}rem`,
              transform: `translate(-50%, -50%) scale(${blob.scale})`,
              background: `radial-gradient(circle, ${baseColor} 0%, transparent 70%)`,
              filter: `blur(${blur}px)`,
              borderRadius: "9999px",
              willChange: "transform",
            }}
          />
        );
      }

      return (
        <motion.div
          key={blob.id}
          aria-hidden="true"
          style={{
            position: "absolute",
            top: `${blob.origin[1]}%`,
            left: `${blob.origin[0]}%`,
            width: `${sizeRem}rem`,
            height: `${sizeRem}rem`,
            transform: `translate(-50%, -50%)`,
            background: `radial-gradient(circle, ${baseColor} 0%, transparent 70%)`,
            filter: `blur(${blur}px)`,
            borderRadius: "9999px",
            willChange: "transform",
          }}
          initial={{ opacity: 0, scale: 0.85 * blob.scale }}
          animate={{
            opacity: 1,
            x: [0, translate[0], 0, -translate[0] * 0.6, 0],
            y: [0, translate[1], 0, -translate[1] * 0.6, 0],
            scale: [
              blob.scale * 0.95,
              blob.scale * 1.05,
              blob.scale,
              blob.scale * (1 + Math.min(0.05, blob.scale - 1)),
              blob.scale,
            ],
          }}
          transition={{
            duration: blob.duration,
            repeat: Infinity,
            ease: "easeInOut",
            delay: blob.delay,
          }}
        />
      );
    },
    [baseOpacity, effectiveIntensity, idleReady, shouldAnimate],
  );

  if (disabled) return null;

  const ComponentElement = AsComponent as ElementType;

  return (
    <ComponentElement
      ref={containerRef}
      className={[
        "if-bg-goo absolute inset-0 w-full h-full",
        className || "",
        prefersReducedMotion ? "reduced-motion" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={containerStyles}
      aria-hidden="true"
      role="presentation"
      data-goo-variant={effectiveVariant}
      data-goo-quality={effectiveQuality}
      data-goo-mode-style={modeStyle}
      data-goo-adaptive-colors={adaptiveColors}
      data-goo-animate={shouldAnimate ? "true" : "false"}
      data-goo-mounted={mounted ? "true" : "false"}
      data-theme-scheme={isDark ? "dark" : "light"}
      data-prefers-reduced-motion={prefersReducedMotion ? "true" : "false"}
      data-offscreen-active={visible ? "true" : "false"}
      data-intensity={effectiveIntensity}
      data-debug={props["data-debug"] || undefined}
      data-exposure-multiplier={exposureMultiplier}
      data-movement-boost={movementBoost}
      data-blend-mode={primaryBlend}
    >
      {/* Debug overlay when data-debug is enabled */}
      {props["data-debug"] && (
        <div
          style={{
            position: "absolute",
            top: 8,
            left: 8,
            background: "rgba(0,0,0,0.8)",
            color: "white",
            padding: "4px 8px",
            fontSize: "10px",
            fontFamily: "monospace",
            borderRadius: "4px",
            pointerEvents: "none",
            zIndex: 999,
          }}
        >
          variant: {effectiveVariant} | quality: {effectiveQuality} | intensity:{" "}
          {effectiveIntensity.toFixed(2)} | exposure: {exposureMultiplier} |
          blend: {primaryBlend}
        </div>
      )}
      {tint && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(140deg, ${rgbTupleToCss(
              tint,
              0.05 * effectiveIntensity,
            )}, transparent)`,
            mixBlendMode: isDark ? "screen" : "multiply",
          }}
        />
      )}

      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          maskImage:
            "radial-gradient(circle at 50% 50%, rgba(0,0,0,0.9), transparent 92%)",
        }}
      >
        {blobs.map(renderBlob)}
      </div>

      {/* Optional overlay - only in non-teen mode or when explicitly needed */}
      {modeStyle !== "teen" && (
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `linear-gradient(180deg, ${
              isDark ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.1)"
            }, transparent 70%)`,
            mixBlendMode: "normal",
            pointerEvents: "none",
          }}
        />
      )}
    </ComponentElement>
  );
}

/* -------------------------------------------------------
 * Notes:
 * - For a purely static usage: <BgGoo animate={false} />
 * - For low-power mode: <BgGoo quality="low" variant="subtle" />
 * - For brand hero: <BgGoo variant="vivid" quality="high" intensity={1.2} />
 * - Colors example: <BgGoo colors={['#3b82f6','#9333ea','#ec4899']} />
 * - Automatic dark/light adaptation uses existing theme hook; override with scheme prop.
 *
 * Future Enhancements:
 * - Optional canvas / WebGL pipeline for ultra-high fidelity
 * - Route-based dynamic palette transitions
 * - User-controlled seed to replicate layouts
 */
