import { generateStamp } from "@/lib/utils/timestamp";
"use client";

import React from "react";
import { useTheme } from "@/hooks/use-theme";

export interface DarkVignetteProps {
  intensity?: "subtle" | "medium" | "strong";
  gradient?: "radial" | "linear" | "elliptical";
  className?: string;
  style?: React.CSSProperties;
  disabled?: boolean;
}

/**
 * DarkVignette - Adds atmospheric depth to dark mode layouts
 *
 * Teenage Engineering inspired component that adds subtle shadowing
 * and depth perception to dark surfaces. Only renders in dark mode.
 *
 * Features:
 * - Multiple intensity levels for different contexts
 * - Various gradient shapes for different layout needs
 * - Respects user motion preferences
 * - Performance optimized (CSS-only, no JS animations)
 */
export function DarkVignette({
  intensity = "medium",
  gradient = "radial",
  className = "",
  style,
  disabled = false,
}: DarkVignetteProps) {
  const { theme } = useTheme();
  const isDark = theme.colorScheme === "dark";

  // Only render in dark mode
  if (!isDark || disabled) {
    return null;
  }

  const getIntensityValues = () => {
    switch (intensity) {
      case "subtle":
        return {
          primary: "rgba(0, 0, 0, 0.15)",
          secondary: "rgba(0, 0, 0, 0.08)",
          tertiary: "rgba(0, 0, 0, 0.04)",
        };
      case "strong":
        return {
          primary: "rgba(0, 0, 0, 0.45)",
          secondary: "rgba(0, 0, 0, 0.25)",
          tertiary: "rgba(0, 0, 0, 0.12)",
        };
      default: // medium
        return {
          primary: "rgba(0, 0, 0, 0.25)",
          secondary: "rgba(0, 0, 0, 0.15)",
          tertiary: "rgba(0, 0, 0, 0.08)",
        };
    }
  };

  const getGradientBackground = () => {
    const { primary, secondary, tertiary } = getIntensityValues();

    switch (gradient) {
      case "linear":
        return `linear-gradient(
          180deg,
          ${primary} 0%,
          ${secondary} 40%,
          transparent 70%,
          ${tertiary} 100%
        )`;

      case "elliptical":
        return `radial-gradient(
          ellipse 120% 80% at 50% 0%,
          ${primary} 0%,
          ${secondary} 30%,
          transparent 60%
        )`;

      default: // radial
        return `radial-gradient(
          circle at 50% 0%,
          ${primary} 0%,
          ${secondary} 25%,
          ${tertiary} 50%,
          transparent 75%
        )`;
    }
  };

  const vignetteStyles: React.CSSProperties = {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    background: getGradientBackground(),
    pointerEvents: "none",
    zIndex: 1,
    ...style,
  };

  return (
    <div
      className={`dark-vignette ${className}`}
      style={vignetteStyles}
      aria-hidden="true"
      role="presentation"
      data-vignette-intensity={intensity}
      data-vignette-gradient={gradient}
    />
  );
}

// Convenience exports for common use cases
export const HeroVignette = (props: Omit<DarkVignetteProps, "intensity" | "gradient">) => (
  <DarkVignette intensity="medium" gradient="radial" {...props} />
);

export const HeaderVignette = (props: Omit<DarkVignetteProps, "intensity" | "gradient">) => (
  <DarkVignette intensity="subtle" gradient="linear" {...props} />
);

export const SectionVignette = (props: Omit<DarkVignetteProps, "intensity" | "gradient">) => (
  <DarkVignette intensity="subtle" gradient="elliptical" {...props} />
);
