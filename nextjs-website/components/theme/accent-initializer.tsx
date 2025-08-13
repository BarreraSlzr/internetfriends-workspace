import { generateStamp } from "@/lib/utils/timestamp";
"use client";

import { useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";
import { getAdaptiveGooColorTuples } from "@/app/(internetfriends)/lib/color-palette";

/**
 * AccentInitializer - Runtime adaptive color injection
 *
 * Injects adaptive accent colors into CSS custom properties based on current theme.
 * Follows Teenage Engineering aesthetic: subtle light mode, vivid dark mode.
 */
export function AccentInitializer() {
  const { theme } = useTheme();
  const isDark = theme.colorScheme === "dark";

  useEffect(() => {
    try {
      const root = document.documentElement;
      if (!root) return;

      // Generate adaptive color tuples
      const tuples = getAdaptiveGooColorTuples(isDark ? "dark" : "light", {
        desaturateLight: 0.5,
        lightenLight: 0.05,
        darkBoost: 1.07,
        count: 3,
      });

      const [primaryTuple] = tuples;
      if (!primaryTuple) return;

      // Convert RGB tuple to CSS rgba function
      const toCss = ([r, g, b]: [number, number, number], alpha = 1) =>
        `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)}, ${alpha})`;

      // Inject adaptive accent variables
      root.style.setProperty("--if-accent-primary", toCss(primaryTuple, 1));
      root.style.setProperty(
        "--if-accent-soft",
        toCss(primaryTuple, isDark ? 0.22 : 0.18)
      );
      root.style.setProperty(
        "--if-accent-faint",
        toCss(primaryTuple, isDark ? 0.14 : 0.10)
      );

      // Mark as accent-ready for progressive enhancement
      root.setAttribute("data-accent-ready", "true");
      root.setAttribute("data-accent-mode", isDark ? "dark" : "light");

    } catch (error) {
      console.warn("[AccentInitializer] Failed to inject adaptive colors:", error);
      // Fallback: ensure data attributes are still set for CSS
      document.documentElement?.setAttribute("data-accent-ready", "false");
    }
  }, [isDark]);

  return null; // This is a headless component
}
