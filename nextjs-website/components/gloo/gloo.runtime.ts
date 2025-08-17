/**
 * gloo.runtime.ts
 * -------------------------------------------------------
 * Minimal, stable runtime utility for the Gloo (WebGL) background system.
 *
 * Responsibilities:
 *  - Centralize all randomness (effect + palette) so React components stay pure
 *  - Provide deterministic selection (seeded) for reproducible visual snapshots
 *  - Offer simple helpers for effect mapping, clamping, palette strategy
 *  - Keep zero React / DOM dependencies (pure functional module)
 *
 * This mirrors the lean philosophy of the earlier landing page approach:
 * one source of truth, no hidden side effects, easy to test.
 *
 * Usage sketch (in hero component):
 *   import { initGlooForHero } from "./gloo.runtime";
 *   const { effect, palette } = initGlooForHero({ seed, vivid, theme });
 *   <GlooCanvasAtomic effectIndex={effect.index} colors={palette.colors} ... />
 */

import { effectFunctions } from "./effects";
import { 
  getInternetFriendsPalette, 
  getOctopusFlatPalette, 
  getModernMinimalPalette, 
  getRetinaOptimizedPalette,
  createPaletteFromStrategy 
} from "./palette";
import type { GlooPalette, GlooPaletteStrategy } from "./types";

/* -------------------------------------------------- */
/* Effect Mapping                                      */
/* -------------------------------------------------- */

const EFFECT_NAME_MAP: Record<number, string> = {
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
  11: "octopus",
  12: "modernFlow",
  13: "minimalist",
  14: "retinal",
};

export interface SelectedEffect {
  index: number;
  name: string;
  source: string;
}

export function getEffectCount(): number {
  return effectFunctions.length;
}

export function clampEffectIndex(i: number): number {
  return Math.max(0, Math.min(effectFunctions.length - 1, i));
}

/* -------------------------------------------------- */
/* Deterministic Hash / Seed                           */
/* -------------------------------------------------- */

/**
 * Lightweight 32‑bit hashing (mix) for deterministic pseudorandom derivation.
 * Accepts any integer seed (will coerce to uint32).
 */
export function hashSeed(seed: number): number {
  let x = seed >>> 0;
  x ^= x >>> 16;
  x = Math.imul(x, 0x7feb352d);
  x ^= x >>> 15;
  x = Math.imul(x, 0x846ca68b);
  x ^= x >>> 16;
  return x >>> 0;
}

/**
 * Produce a deterministic pseudo-random float in [0,1) from a numeric seed + step.
 */
export function seededUnit(seed: number, step = 0): number {
  return (hashSeed(seed + step) & 0xffffffff) / 0x100000000;
}

/* -------------------------------------------------- */
/* Effect Selection                                    */
/* -------------------------------------------------- */

export interface GlooRuntimeOptions {
  seed?: number;
  effectOverride?: number | string;
  deterministic?: boolean;
  theme?: "light" | "dark";
  vivid?: boolean;
  paletteStrategy?: GlooPaletteStrategy;
  retinaOptimized?: boolean;
  reducedMotion?: boolean;
}

export function pickRandomEffect(seed?: number): SelectedEffect {
  let index: number;
  if (typeof seed === "number") {
    index = hashSeed(seed) % effectFunctions.length;
  } else {
    index = Math.floor(Math.random() * effectFunctions.length);
  }
  index = clampEffectIndex(index);
  return {
    index,
    name: EFFECT_NAME_MAP[index] || `effect-${index}`,
    source: effectFunctions[index],
  };
}

/**
 * Enhanced effect resolution with retina and reduced motion support
 */
export function resolveEffect(opts: GlooRuntimeOptions = {}): SelectedEffect {
  const { effectOverride, seed, deterministic = true, retinaOptimized, reducedMotion } = opts;

  // If reduced motion is enabled, use minimalist effect
  if (reducedMotion) {
    const idx = 13; // minimalist effect
    return {
      index: idx,
      name: EFFECT_NAME_MAP[idx] || `effect-${idx}`,
      source: effectFunctions[idx],
    };
  }

  // Use retina-optimized effects for high-DPI displays
  if (retinaOptimized || isRetinaDisplay()) {
    return getRetinaOptimalEffect(deterministic ? seed : undefined);
  }

  if (typeof effectOverride === "number") {
    const idx = clampEffectIndex(effectOverride);
    return {
      index: idx,
      name: EFFECT_NAME_MAP[idx] || `effect-${idx}`,
      source: effectFunctions[idx],
    };
  }

  if (typeof effectOverride === "string") {
    const found = Object.entries(EFFECT_NAME_MAP).find(
      ([, n]) => n.toLowerCase() === effectOverride.toLowerCase(),
    );
    if (found) {
      const idx = parseInt(found[0], 10);
      return {
        index: idx,
        name: found[1],
        source: effectFunctions[idx],
      };
    }
  }

  return pickRandomEffect(deterministic ? seed : undefined);
}

/* -------------------------------------------------- */
/* Palette Strategies                                  */
/* -------------------------------------------------- */

/**
 * Enhanced palette strategies supporting flat design and retina optimization.
 */
export function getBrandPalette(
  theme: "light" | "dark" = "light",
  vivid = false,
  strategy: GlooPaletteStrategy = "brand-triad",
  retinaOptimized = false
): GlooPalette {
  // Retina-optimized palette for high-DPI displays
  if (retinaOptimized) {
    return getRetinaOptimizedPalette(theme);
  }

  // Use specific palette strategy if provided
  if (strategy !== "brand-triad") {
    return createPaletteFromStrategy(strategy, theme);
  }

  if (!vivid) {
    return getInternetFriendsPalette(theme);
  }

  // Vivid variant: manually emphasize brand line with a brighter triad
  const vividLight: [string, string, string] = [
    "#3b82f6", // brighter blue
    "#9333ea", // saturated purple
    "#ec4899", // vivid pink
  ];
  const vividDark: [string, string, string] = [
    "#60a5fa", // lightened blue
    "#a855f7", // lighter purple
    "#f472b6", // lighter pink
  ];

  return {
    colors: theme === "light" ? vividLight : vividDark,
    strategy: "brand-triad",
    mode: theme,
    metadata: { generated: false },
  };
}

/**
 * Octopus.do-inspired flat palette selection
 */
export function getOctopusInspiredPalette(
  theme: "light" | "dark" = "light"
): GlooPalette {
  return getOctopusFlatPalette(theme);
}

/**
 * Modern minimalist palette for clean designs
 */
export function getMinimalistPalette(
  theme: "light" | "dark" = "light"
): GlooPalette {
  return getModernMinimalPalette(theme);
}

/**
 * Detect if retina display and recommend appropriate effects
 */
export function isRetinaDisplay(): boolean {
  if (typeof window === "undefined") return false;
  return window.devicePixelRatio > 1;
}

/**
 * Get optimal effect for retina displays
 */
export function getRetinaOptimalEffect(seed?: number): SelectedEffect {
  // For retina displays, prefer subtler effects
  const retinaFriendlyIndices = [0, 13, 14]; // default, minimalist, retinal
  let index: number;
  
  if (typeof seed === "number") {
    index = retinaFriendlyIndices[hashSeed(seed) % retinaFriendlyIndices.length];
  } else {
    index = retinaFriendlyIndices[Math.floor(Math.random() * retinaFriendlyIndices.length)];
  }
  
  return {
    index,
    name: EFFECT_NAME_MAP[index] || `effect-${index}`,
    source: effectFunctions[index],
  };
}

/* -------------------------------------------------- */
/* High-Level Init Helper                              */
/* -------------------------------------------------- */

/**
 * Enhanced initialization with octopus.do inspired features
 */
export function initGlooForHero(opts: GlooRuntimeOptions = {}) {
  const effect = resolveEffect(opts);
  const palette = getBrandPalette(
    opts.theme || "light", 
    !!opts.vivid,
    opts.paletteStrategy || "brand-triad",
    opts.retinaOptimized
  );
  return { effect, palette };
}

/**
 * Initialize with octopus.do flat design aesthetic
 */
export function initOctopusFlat(opts: Omit<GlooRuntimeOptions, 'paletteStrategy'> = {}) {
  const effect = resolveEffect({ ...opts, retinaOptimized: true });
  const palette = getOctopusFlatPalette(opts.theme || "light");
  return { effect, palette };
}

/**
 * Initialize with modern minimalist design
 */
export function initModernMinimal(opts: Omit<GlooRuntimeOptions, 'paletteStrategy'> = {}) {
  const effect = resolveEffect({ ...opts, reducedMotion: true });
  const palette = getModernMinimalPalette(opts.theme || "light");
  return { effect, palette };
}

/* -------------------------------------------------- */
/* URL Helper (Optional Consumer Utility)              */
/* -------------------------------------------------- */

/**
 * Parse URLSearchParams-like object for effect / seed overrides.
 * Not coupled to window.location to keep this module testable.
 */
export function parseGlooQuery(
  params: Record<string, string | string[] | undefined>,
) {
  const normalized = (key: string): string | undefined => {
    const v = params[key];
    if (Array.isArray(v)) return v[0];
    return v;
  };
  const effectParam = normalized("glooEffect");
  const seedParam = normalized("glooSeed");
  const vividParam = normalized("glooVivid");
  const themeParam = normalized("glooTheme");

  let effectOverride: number | string | undefined;
  if (effectParam) {
    const asNum = Number(effectParam);
    effectOverride = Number.isFinite(asNum) ? asNum : effectParam;
  }

  const seed = seedParam ? Number(seedParam) : undefined;
  const vivid = vividParam === "1" || vividParam === "true";
  const theme =
    themeParam === "dark" || themeParam === "light"
      ? (themeParam as "light" | "dark")
      : undefined;

  return {
    effectOverride,
    seed: Number.isFinite(seed) ? seed : undefined,
    vivid,
    theme,
  };
}

/* -------------------------------------------------- */
/* Diagnostic / Introspection                          */
/* -------------------------------------------------- */

export function listEffects(): { index: number; name: string }[] {
  return Array.from({ length: effectFunctions.length }, (_, i) => ({
    index: i,
    name: EFFECT_NAME_MAP[i] || `effect-${i}`,
  }));
}

export function describeRuntimeState(
  opts: GlooRuntimeOptions = {},
): Record<string, unknown> {
  const effect = resolveEffect(opts);
  return {
    effectIndex: effect.index,
    effectName: effect.name,
    paletteMode: opts.theme || "light",
    vivid: !!opts.vivid,
    totalEffects: getEffectCount(),
  };
}

/* -------------------------------------------------- */
/* END                                                 */
/* -------------------------------------------------- */
