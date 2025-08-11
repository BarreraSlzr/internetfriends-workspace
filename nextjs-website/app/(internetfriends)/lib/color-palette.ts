type ColorPalette = {
  [colorName: string]: number[];
};

const r = {
  10: 0.8,
  9: 0.8,
  8: 0.8,
  7: 0.7,
  6: 0.6,
  5: 0.5,
  4: 0.4,
  3: 0.3,
  2: 0.2,
  "01": 0.2,
  "00": 0.2,
};

const colors: ColorPalette = {
  "Vibrant Pink": [r[10], r["00"], r[5]], // RGB(255, 0, 127)
  "Energetic Yellow": [r[10], r[10], r["00"]], // RGB(255, 255, 0)
  "Dynamic Orange": [r[10], r[6], r["00"]], // RGB(255, 153, 0)
  "Lively Green": [r["00"], r[10], r[4]], // RGB(0, 255, 102)
  "Bright Cyan": [r["00"], r[10], r[10]], // RGB(0, 255, 255)
  "Electric Blue": [r["00"], r[5], r[10]], // RGB(0, 127, 255)
  "Bright Yellow": [r[9], r[9], r[3]], // Softer yellow
  "Electric Pink": [r[9], r["01"], r[7]], // Slightly muted pink
  "Fiery Orange": [r[9], r[5], r["01"]], // Muted orange
  "Lime Green": [r[6], r[9], r[3]], // Softer lime green
  "Hot Magenta": [r[9], r["01"], r[5]], // Muted magenta
  "Vibrant Cyan": [r["01"], r[9], r[8]], // Softer cyan
  "Bold Blue": [r["01"], r[4], r[9]], // Muted blue
  "Sunset Red": [r[9], r[3], r[4]], // Softer red
  "Neon Purple": [r[6], r["01"], r[9]], // Muted purple
  "Radiant Gold": [r[9], r[8], r[3]], // Softer gold
};

export function getRandomColors(
  palette: ColorPalette = colors,
  count: number = 3,
): number[][] {
  const colorValues = Object.values(palette); // Get only the RGB values
  const selectedColors = new Set<number[]>(); // Use a Set to ensure uniqueness

  while (selectedColors.size < count) {
    const randomIndex = Math.floor(Math.random() * colorValues.length);
    selectedColors.add(colorValues[randomIndex]);
  }

  return Array.from(selectedColors); // Convert the Set back to an array
}

/* ------------------------------------------------------------------
 * Adaptive Goo / Background Color Utilities
 * Goal: reduce heavy \"brand blue wash\" in light mode while keeping
 * rich, saturated vibrancy in dark mode (teenage engineering vibe).
 * ------------------------------------------------------------------ */

/** Convert normalized rgb [0-1] to hsl tuple */
function rgbToHsl([r, g, b]: number[]): [number, number, number] {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  const l = (max + min) / 2;
  const d = max - min;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return [h, s, l];
}

/** Convert hsl (0-1) back to normalized rgb */
function hslToRgb([h, s, l]: [number, number, number]): [
  number,
  number,
  number,
] {
  if (s === 0) return [l, l, l];
  const hue2rgb = (p: number, q: number, t: number) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  };
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const r = hue2rgb(p, q, h + 1 / 3);
  const g = hue2rgb(p, q, h);
  const b = hue2rgb(p, q, h - 1 / 3);
  return [r, g, b];
}

interface AdaptiveOptions {
  desaturateLight?: number; // saturation multiplier in light mode (default 0.55)
  lightenLight?: number; // additive lightness shift in light mode (default +0.06)
  darkBoost?: number; // saturation multiplier in dark mode (default 1.05)
  rotateHue?: number; // hue rotation in degrees (default 0)
  count?: number; // number of colors (default 3)
  sourcePalette?: ColorPalette; // alternative palette
}

/**
 * Create adaptive palette oriented toward subtle, less-blue light mode
 * and vivid, contrast-rich dark mode. Inspired by Teenage Engineering style
 * where dark mode embraces saturated accents on deep neutral base.
 */
export function getAdaptiveGooColors(
  mode: "light" | "dark",
  {
    desaturateLight = 0.55,
    lightenLight = 0.06,
    darkBoost = 1.05,
    rotateHue = 0,
    count = 3,
    sourcePalette = colors,
  }: AdaptiveOptions = {},
): number[][] {
  const base = getRandomColors(sourcePalette, count);
  const rot = rotateHue / 360;
  return base.map((rgb, idx) => {
    let [h, s, l] = rgbToHsl(rgb);
    h = (h + rot + idx * 0.04) % 1; // progressive slight hue shift for separation
    if (mode === "light") {
      s *= desaturateLight;
      l = Math.min(1, l + lightenLight);
    } else {
      s = Math.min(1, s * darkBoost);
      l = Math.min(1, l * 0.95 + 0.02);
    }
    return hslToRgb([h, s, l]);
  });
}

export function getAdaptiveGooColorTuples(
  mode: "light" | "dark",
  opts?: AdaptiveOptions,
): [number, number, number][] {
  return getAdaptiveGooColors(mode, opts) as [number, number, number][];
}
