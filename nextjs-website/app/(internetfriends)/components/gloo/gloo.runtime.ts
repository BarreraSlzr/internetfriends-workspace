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
import { getInternetFriendsPalette } from "./palette";
import type { GlooPalette } from "./types";

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
  effectOverride?: number | string; // explicit index or effect name
  deterministic?: boolean;          // forces seed-based selection if seed provided
  theme?: "light" | "dark";
  vivid?: boolean;
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
 * Resolve effect according to override / name / seed.
 */
export function resolveEffect(opts: GlooRuntimeOptions = {}): SelectedEffect {
  const { effectOverride, seed, deterministic = true } = opts;

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
 * Standard brand triad palette (delegates to existing helper).
 * The vivid variant slightly intensifies mid/high saturation steps.
 */
export function getBrandPalette(
  theme: "light" | "dark" = "light",
  vivid = false,
): GlooPalette {
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
    strategy: "brand-vivid",
    mode: theme,
    metadata: { generated: false, vivid: true },
  };
}

/* -------------------------------------------------- */
/* High-Level Init Helper                              */
/* -------------------------------------------------- */

/**
 * Gather everything needed for a hero background in one deterministic step.
 * This stays pure (no side effects) so components can call once and memoize.
 */
export function initGlooForHero(opts: GlooRuntimeOptions = {}) {
  const effect = resolveEffect(opts);
  const palette = getBrandPalette(opts.theme || "light", !!opts.vivid);
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
