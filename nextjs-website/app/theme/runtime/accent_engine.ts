/* InternetFriends Accent Engine */
/* Dynamic HSL-based color generation and application system */

export interface HSL {
  h: number; // Hue (0-360)
  s: number; // Saturation (0-100)
  l: number; // Lightness (0-100)
}

export interface RGB {
  r: number; // Red (0-255)
  g: number; // Green (0-255)
  b: number; // Blue (0-255)
}

export interface AccentScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
}

export interface AccentMetrics {
  baseHue: number;
  baseSaturation: number;
  baseLightness: number;
  contrastRatio: number;
  accessibility: "AA" | "AAA" | "FAIL";
  generationTime: number;
}

// =================================================================
// COLOR CONVERSION UTILITIES
// =================================================================

/**
 * Convert hex color to HSL
 * @param hex - Hex color string (e.g., "#3b82f6" or "3b82f6")
 * @returns HSL object
 */
export function hexToHSL(hex: string): HSL {
  // Remove # if present
  let h = hex.replace("#", "");

  // Convert 3-digit hex to 6-digit
  if (h.length === 3) {
    h = h
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // Parse RGB values
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  // Calculate lightness
  const lightness = (max + min) / 2;

  // Calculate saturation
  let saturation = 0;
  if (diff !== 0) {
    saturation = diff / (1 - Math.abs(2 * lightness - 1));
  }

  // Calculate hue
  let hue = 0;
  if (diff !== 0) {
    switch (max) {
      case r:
        hue = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        hue = (b - r) / diff / 6 + 1 / 3;
        break;
      case b:
        hue = (r - g) / diff / 6 + 2 / 3;
        break;
    }
  }

  return {
    h: Math.round(hue * 360),
    s: Math.round(saturation * 100),
    l: Math.round(lightness * 100),
  };
}

/**
 * Convert HSL to RGB
 * @param hsl - HSL object
 * @returns RGB object
 */
export function hslToRGB(hsl: HSL): RGB {
  const { h, s, l } = hsl;
  const hueNorm = h / 360;
  const satNorm = s / 100;
  const lightNorm = l / 100;

  const c = (1 - Math.abs(2 * lightNorm - 1)) * satNorm;
  const x = c * (1 - Math.abs(((hueNorm * 6) % 2) - 1));
  const m = lightNorm - c / 2;

  let r = 0,
    g = 0,
    b = 0;

  if (0 <= hueNorm && hueNorm < 1 / 6) {
    r = c;
    g = x;
    b = 0;
  } else if (1 / 6 <= hueNorm && hueNorm < 2 / 6) {
    r = x;
    g = c;
    b = 0;
  } else if (2 / 6 <= hueNorm && hueNorm < 3 / 6) {
    r = 0;
    g = c;
    b = x;
  } else if (3 / 6 <= hueNorm && hueNorm < 4 / 6) {
    r = 0;
    g = x;
    b = c;
  } else if (4 / 6 <= hueNorm && hueNorm < 5 / 6) {
    r = x;
    g = 0;
    b = c;
  } else if (5 / 6 <= hueNorm && hueNorm < 1) {
    r = c;
    g = 0;
    b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Format HSL as CSS hsl() string
 * @param h - Hue (0-360)
 * @param s - Saturation (0-100)
 * @param l - Lightness (0-100)
 * @returns CSS hsl() string format
 */
export function formatHSL(h: number, s: number, l: number): string {
  return `${h} ${s}% ${l}%`;
}

// =================================================================
// ACCENT SCALE GENERATION
// =================================================================

/**
 * Generate complete accent scale from base HSL
 * Uses InternetFriends lightness/saturation adjustment formulas
 * @param base - Base HSL color (typically the 500 weight)
 * @returns Complete accent scale object
 */
export function generateAccentScale(base: HSL): AccentScale {
  const { h, s, l } = base;

  // Lightness adjustment functions
  const lighten = (factor: number) => Math.min(100, l + (100 - l) * factor);
  const darken = (factor: number) => Math.max(0, l * factor);

  // Saturation adjustment for lighter tints (reduced saturation for pastels)
  const adjustSaturation = (targetL: number) => {
    if (targetL > 85) return s * 0.4; // Very light - desaturated
    if (targetL > 75) return s * 0.6; // Light - moderately desaturated
    if (targetL > 60) return s * 0.8; // Medium-light - slightly desaturated
    return s; // Preserve saturation for medium and dark colors
  };

  // Generate scale with optimized lightness and saturation
  const scale = {
    50: formatHSL(h, adjustSaturation(lighten(0.45)), lighten(0.45)),
    100: formatHSL(h, adjustSaturation(lighten(0.38)), lighten(0.38)),
    200: formatHSL(h, adjustSaturation(lighten(0.28)), lighten(0.28)),
    300: formatHSL(h, adjustSaturation(lighten(0.16)), lighten(0.16)),
    400: formatHSL(h, s * 0.9, lighten(0.06)),
    500: formatHSL(h, s, l), // Base color (anchor)
    600: formatHSL(h, Math.min(100, s * 1.05), darken(0.88)),
    700: formatHSL(h, Math.min(100, s * 1.1), darken(0.72)),
    800: formatHSL(h, Math.min(100, s * 1.15), darken(0.58)),
    900: formatHSL(h, Math.min(100, s * 1.2), darken(0.42)),
  };

  return scale;
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First color HSL
 * @param color2 - Second color HSL
 * @returns Contrast ratio (1:1 to 21:1)
 */
export function calculateContrast(color1: HSL, color2: HSL): number {
  // Convert to RGB first
  const rgb1 = hslToRGB(color1);
  const rgb2 = hslToRGB(color2);

  // Calculate relative luminance
  const getLuminance = (rgb: RGB) => {
    const { r, g, b } = rgb;
    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  };

  const lum1 = getLuminance(rgb1);
  const lum2 = getLuminance(rgb2);

  // Calculate contrast ratio
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);

  return (brightest + 0.05) / (darkest + 0.05);
}

/**
 * Determine appropriate text color for background
 * @param backgroundHSL - Background color HSL
 * @returns Text color HSL for optimal contrast
 */
export function getContrastColor(backgroundHSL: HSL): HSL {
  const lightText: HSL = { h: 0, s: 0, l: 100 }; // White
  const darkText: HSL = { h: 0, s: 0, l: 10 }; // Near black

  const lightContrast = calculateContrast(backgroundHSL, lightText);
  const darkContrast = calculateContrast(backgroundHSL, darkText);

  // Return the color with better contrast (WCAG AA requires 4.5:1 minimum)
  return lightContrast > darkContrast ? lightText : darkText;
}

// =================================================================
// ACCENT APPLICATION ENGINE
// =================================================================

/**
 * Apply accent color to CSS custom properties
 * Updates all accent-related CSS variables in :root
 * @param hex - Hex color string
 * @returns Accent metrics for debugging/analytics
 */
export function applyAccent(hex: string): AccentMetrics {
  const startTime = performance.now();

  try {
    // Convert to HSL and generate scale
    const baseHSL = hexToHSL(hex);
    const scale = generateAccentScale(baseHSL);
    const baseRGB = hslToRGB(baseHSL);

    // Get root element
    const root = document.documentElement;

    // Apply accent scale
    Object.entries(scale).forEach(([weight, hslValue]) => {
      root.style.setProperty(`--accent-${weight}`, hslValue);
    });

    // Apply RGB values for alpha compositing
    root.style.setProperty(
      `--accent-500-rgb`,
      `${baseRGB.r}, ${baseRGB.g}, ${baseRGB.b}`,
    );

    // Calculate and apply contrast colors
    const contrastColors = Object.entries(scale).reduce(
      (acc, [weight, hslValue]) => {
        const [h, s, l] = hslValue
          .split(" ")
          .map((v: string, i: number) =>
            i === 0 ? parseInt(v) : parseFloat(v.replace("%", "")),
          );
        const contrast = getContrastColor({ h, s, l });
        acc[weight] = formatHSL(contrast.h, contrast.s, contrast.l);
        return acc;
      },
      {} as Record<string, string>,
    );

    Object.entries(contrastColors).forEach(([weight, contrastValue]) => {
      root.style.setProperty(`--accent-contrast-${weight}`, contrastValue);
    });

    // Set data attribute for theme identification
    root.setAttribute("data-accent", hex.toLowerCase());

    // Calculate metrics
    const whiteContrast = calculateContrast(baseHSL, { h: 0, s: 0, l: 100 });
    const accessibility: "AA" | "AAA" | "FAIL" =
      whiteContrast >= 7 ? "AAA" : whiteContrast >= 4.5 ? "AA" : "FAIL";

    const endTime = performance.now();

    return {
      baseHue: baseHSL.h,
      baseSaturation: baseHSL.s,
      baseLightness: baseHSL.l,
      contrastRatio: whiteContrast,
      accessibility,
      generationTime: endTime - startTime,
    };
  } catch (error) {
    console.error("Failed to apply accent color:", error);

    // Return fallback metrics
    return {
      baseHue: 217,
      baseSaturation: 89,
      baseLightness: 60,
      contrastRatio: 0,
      accessibility: "FAIL",
      generationTime: performance.now() - startTime,
    };
  }
}

// =================================================================
// ACCENT PERSISTENCE & INITIALIZATION
// =================================================================

const ACCENT_STORAGE_KEY = "if-accent-color";
const DEFAULT_ACCENT = "#3b82f6"; // InternetFriends brand blue

/**
 * Save accent preference to localStorage
 * @param hex - Hex color string
 */
export function saveAccentPreference(hex: string): void {
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(ACCENT_STORAGE_KEY, hex);
    }
  } catch (error) {
    console.warn("Failed to save accent preference:", error);
  }
}

/**
 * Load accent preference from localStorage
 * @returns Saved hex color or default
 */
export function loadAccentPreference(): string {
  try {
    if (typeof window !== "undefined") {
      return localStorage.getItem(ACCENT_STORAGE_KEY) || DEFAULT_ACCENT;
    }
  } catch (error) {
    console.warn("Failed to load accent preference:", error);
  }
  return DEFAULT_ACCENT;
}

/**
 * Initialize accent system with saved or default color
 * Call this on app startup after hydration
 * @param defaultHex - Fallback color if no preference saved
 * @returns Applied accent metrics
 */
export function initAccent(defaultHex: string = DEFAULT_ACCENT): AccentMetrics {
  const savedAccent = loadAccentPreference();
  const accentToApply = savedAccent || defaultHex;

  const metrics = applyAccent(accentToApply);

  // Save if we used the default (first time user)
  if (!savedAccent) {
    saveAccentPreference(accentToApply);
  }

  return metrics;
}

/**
 * Change accent color with persistence
 * @param hex - New hex color
 * @returns Applied accent metrics
 */
export function changeAccent(hex: string): AccentMetrics {
  const metrics = applyAccent(hex);
  saveAccentPreference(hex);
  return metrics;
}

// =================================================================
// DEBUGGING & DEVELOPMENT UTILITIES
// =================================================================

/**
 * Generate preview of accent scale for debugging
 * @param hex - Hex color to preview
 * @returns Object with scale colors and contrast info
 */
export function previewAccentScale(hex: string) {
  const baseHSL = hexToHSL(hex);
  const scale = generateAccentScale(baseHSL);

  return {
    baseColor: hex,
    baseHSL,
    scale,
    contrast: Object.entries(scale).map(([weight, hslValue]) => {
      const [h, s, l] = hslValue
        .split(" ")
        .map((v: string, i: number) =>
          i === 0 ? parseInt(v) : parseFloat(v.replace("%", "")),
        );
      const colorHSL = { h, s, l };
      const whiteContrast = calculateContrast(colorHSL, { h: 0, s: 0, l: 100 });
      const blackContrast = calculateContrast(colorHSL, { h: 0, s: 0, l: 0 });

      return {
        weight,
        hsl: hslValue,
        whiteContrast: Math.round(whiteContrast * 100) / 100,
        blackContrast: Math.round(blackContrast * 100) / 100,
        accessibility:
          whiteContrast >= 4.5
            ? "AA"
            : blackContrast >= 4.5
              ? "AA-dark"
              : "FAIL",
      };
    }),
  };
}

/**
 * Log current accent system state to console
 * Useful for debugging accent application
 */
export function debugAccentSystem(): void {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const currentAccent = root.getAttribute("data-accent") || "none";

  console.group("🎨 Accent System Debug");
  console.log("Current accent:", currentAccent);
  console.log("Saved preference:", loadAccentPreference());

  // Log all accent CSS variables
  const accentVars: Record<string, string> = {};
  const weights = [
    "50",
    "100",
    "200",
    "300",
    "400",
    "500",
    "600",
    "700",
    "800",
    "900",
  ];

  weights.forEach((weight) => {
    const value = getComputedStyle(root).getPropertyValue(`--accent-${weight}`);
    if (value) accentVars[`--accent-${weight}`] = value.trim();
  });

  console.table(accentVars);
  console.groupEnd();
}
