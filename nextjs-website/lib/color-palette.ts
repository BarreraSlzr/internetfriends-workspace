type ColorMode = "light" | "dark";
type ColorTuple = [number, number, number]; // RGB values 0-1

interface AdaptiveColorOptions {
  desaturateLight?: number;
  lightenLight?: number;
  darkBoost?: number;
  count?: number;
}

/**
 * Generate adaptive color tuples based on theme mode
 * Follows Teenage Engineering aesthetic: subtle light mode, vivid dark mode
 */
export function getAdaptiveGooColorTuples(
  mode: ColorMode,
  options: AdaptiveColorOptions = {}
): ColorTuple[] {
  const {
    desaturateLight = 0.5,
    lightenLight = 0.05,
    darkBoost = 1.07,
    count = 3,
  } = options;

  // Base accent colors (normalized RGB 0-1)
  const baseColors: ColorTuple[] = [
    [0.2, 0.8, 0.6], // Teal
    [0.8, 0.4, 0.9], // Purple
    [0.9, 0.6, 0.2], // Orange
  ];

  return baseColors.slice(0, count).map((color) => {
    if (mode === "light") {
      // Light mode: desaturate and lighten
      return color.map((channel, index) => {
        if (index === 0 || index === 1 || index === 2) {
          // Apply desaturation by moving towards gray (0.5)
          const desaturated = channel + (0.5 - channel) * desaturateLight;
          // Apply lightening
          return Math.min(1, desaturated + lightenLight);
        }
        return channel;
      }) as ColorTuple;
    } else {
      // Dark mode: boost saturation and vibrancy
      return color.map((channel) => {
        return Math.min(1, channel * darkBoost);
      }) as ColorTuple;
    }
  });
}
