"use client";
/**
 * palette.ts - Epic Palette Generation System
 */

import type {
  GlooThemeMode,
  GlooPaletteOptions,
  GlooPalette,
  GlooColorTuple,
  GlooColorUtils,
} from "./types";

const INTERNETFRIENDS_CORE = [
  "#3b82f6",
  "#9333ea",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
];

const OCTOPUS_INSPIRED_FLAT = [
  "#3b82f6", // Primary blue (octopus.do inspired)
  "#1f2937", // Dark gray (flat design)
  "#6b7280", // Medium gray
  "#f9fafb", // Almost white
  "#10b981", // Emerald green
  "#06b6d4", // Cyan accent
  "#f97316", // Orange
  "#8b5cf6", // Purple
];

const MODERN_FLAT_CORE = [
  "#000000", // Pure black
  "#374151", // Dark blue-gray
  "#9ca3af", // Light gray
  "#ffffff", // Pure white
  "#3b82f6", // Blue
  "#10b981", // Green
  "#f59e0b", // Amber
  "#ef4444", // Red
];

const RETINA_OPTIMIZED = [
  "#0f172a", // Very dark blue (high contrast)
  "#1e293b", // Dark blue-gray
  "#475569", // Medium blue-gray
  "#cbd5e1", // Light blue-gray
  "#f1f5f9", // Very light blue-gray
  "#06b6d4", // Cyan accent
  "#3b82f6", // Primary blue
  "#10b981", // Green
];

function createSeededRNG(seed: number) {
  let state = seed >>> 0;
  return function random() {
    state += 0x6d2b79f5;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export const colorUtils: GlooColorUtils = {
  hexToRgb(hex: string) {
    const clean = hex.replace("#", "").trim();
    if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    };
  },

  rgbToHex(r: number, g: number, b: number) {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    return (
      "#" +
      [r, g, b].map((v) => clamp(v).toString(16).padStart(2, "0")).join("")
    );
  },

  hexToTuple(hex: string): GlooColorTuple | null {
    const rgb = this.hexToRgb(hex);
    if (!rgb) return null;
    return [rgb.r / 255, rgb.g / 255, rgb.b / 255];
  },

  tupleToHex(tuple: GlooColorTuple): string {
    return this.rgbToHex(tuple[0] * 255, tuple[1] * 255, tuple[2] * 255);
  },

  validateHex(hex: string): boolean {
    return /^#[0-9a-fA-F]{6}$/.test(hex);
  },

  generateContrast(baseHex: string, mode: GlooThemeMode): string {
    const rgb = this.hexToRgb(baseHex);
    if (!rgb) return baseHex;

    const { r, g, b } = rgb;
    const luminance = 0.299 * r + 0.587 * g + 0.114 * b;

    if (mode === "dark") {
      const boost = luminance < 128 ? 1.3 : 1.1;
      return this.rgbToHex(
        Math.min(255, r * boost),
        Math.min(255, g * boost),
        Math.min(255, b * boost),
      );
    } else {
      const dampen = luminance > 200 ? 0.8 : 0.9;
      return this.rgbToHex(r * dampen, g * dampen, b * dampen);
    }
  },
};

function shuffleArray<T>(array: T[], rng: () => number): T[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generateGlooPalette(options: GlooPaletteOptions): GlooPalette {
  const {
    mode = "light",
    strategy = "brand-triad",
    seed = Date.now(),
    anchorColor,
    coreColors = INTERNETFRIENDS_CORE,
  } = options;

  const rng = createSeededRNG(seed);
  const availableColors = [...coreColors];
  let generatedColors: string[] = [];

  switch (strategy) {
    case "brand-triad":
      generatedColors = [
        anchorColor || "#3b82f6",
        availableColors[1] || "#9333ea",
        availableColors[2] || "#ec4899",
      ];
      break;

    case "seeded-random":
      const shuffled = shuffleArray(availableColors, rng);
      generatedColors = [
        anchorColor || shuffled[0],
        shuffled[1] || "#9333ea",
        shuffled[2] || "#ec4899",
      ];
      break;

    case "soft-glass":
      if (mode === "dark") {
        generatedColors = ["#60a5fa", "#3b82f6", "#1d4ed8"];
      } else {
        generatedColors = ["#3b82f6", "#60a5fa", "#93c5fd"];
      }
      break;

    case "octopus-flat":
      if (mode === "dark") {
        generatedColors = ["#3b82f6", "#1f2937", "#6b7280"];
      } else {
        generatedColors = ["#3b82f6", "#f9fafb", "#06b6d4"];
      }
      break;

    case "modern-minimal":
      if (mode === "dark") {
        generatedColors = ["#374151", "#000000", "#3b82f6"];
      } else {
        generatedColors = ["#000000", "#ffffff", "#3b82f6"];
      }
      break;

    case "retina-optimized":
      if (mode === "dark") {
        generatedColors = ["#0f172a", "#475569", "#06b6d4"];
      } else {
        generatedColors = ["#1e293b", "#f1f5f9", "#3b82f6"];
      }
      break;

    case "primary-accent":
      const primary = anchorColor || "#3b82f6";
      generatedColors = [
        primary,
        colorUtils.generateContrast(primary, mode),
        availableColors[rng() < 0.5 ? 1 : 2] || "#9333ea",
      ];
      break;

    default:
      generatedColors = [
        anchorColor || availableColors[0],
        availableColors[1] || "#9333ea",
        availableColors[2] || "#ec4899",
      ];
  }

  const finalColors = generatedColors.map((color) =>
    colorUtils.generateContrast(color, mode),
  ) as [string, string, string];

  return {
    colors: finalColors,
    strategy,
    mode,
    metadata: {
      seed,
      anchor: anchorColor,
      generated: true,
    },
  };
}

export function getInternetFriendsPalette(mode: GlooThemeMode): GlooPalette {
  return generateGlooPalette({
    mode,
    strategy: "brand-triad",
    anchorColor: "#3b82f6",
  });
}

export function getOctopusFlatPalette(mode: GlooThemeMode): GlooPalette {
  return generateGlooPalette({
    mode,
    strategy: "octopus-flat",
    coreColors: OCTOPUS_INSPIRED_FLAT,
  });
}

export function getModernMinimalPalette(mode: GlooThemeMode): GlooPalette {
  return generateGlooPalette({
    mode,
    strategy: "modern-minimal",
    coreColors: MODERN_FLAT_CORE,
  });
}

export function getRetinaOptimizedPalette(mode: GlooThemeMode): GlooPalette {
  return generateGlooPalette({
    mode,
    strategy: "retina-optimized",
    coreColors: RETINA_OPTIMIZED,
  });
}

export function createPaletteFromStrategy(
  strategy: string,
  mode: GlooThemeMode = "light"
): GlooPalette {
  switch (strategy) {
    case "octopus-flat":
      return getOctopusFlatPalette(mode);
    case "modern-minimal":
      return getModernMinimalPalette(mode);
    case "retina-optimized":
      return getRetinaOptimizedPalette(mode);
    default:
      return getInternetFriendsPalette(mode);
  }
}
