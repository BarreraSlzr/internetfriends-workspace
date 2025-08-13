import { generateStamp } from "@/lib/utils/timestamp";
"use client";
import { motion } from "framer-motion";
import { CSSProperties, useEffect } from "react";
import { useTheme } from "@/hooks/use-theme";

interface Props {
  className?: string;
  overlayBlendMode?: CSSProperties["backgroundBlendMode"];
  gradient?: string;
  strength?: "weak" | "normal" | "strong";
  blendProfile?: "soft" | "overlay" | "system";
  role?: "ambient" | "accent";
}

export default function NoiseFilter({
  className = "",
  overlayBlendMode = "multiply",
  strength = "normal",
  blendProfile = "system",
  role = "ambient",
}: Props) {
  const { theme } = useTheme();

  // Development warning for multiple ambient noise instances
  useEffect(() => {
    if (role === "ambient" && process.env.NODE_ENV === "development") {
      const ambientNoiseCount = document.querySelectorAll(
        '[data-noise-role="ambient"]',
      ).length;
      if (ambientNoiseCount > 1) {
        console.warn(
          `[NoiseFilter] Multiple ambient noise instances detected (${ambientNoiseCount}). Consider using only one ambient noise filter per page for cleaner visual hierarchy.`,
        );
      }
    }
  }, [role]);

  // CSS custom properties with fallbacks for Teenage Engineering tuning
  const getOpacity = () => {
    if (role === "accent") {
      const fallback = theme.colorScheme === "dark" ? 0.18 : 0.12;
      return `var(--if-atmos-noise-accent-opacity, ${fallback})`;
    }

    const fallback = theme.colorScheme === "dark" ? 0.14 : 0.08;
    const baseOpacity = `var(--if-atmos-noise-ambient-opacity, ${fallback})`;

    // Apply strength multiplier to CSS var
    const multiplier =
      strength === "weak" ? 0.6 : strength === "strong" ? 1.4 : 1;
    return multiplier === 1
      ? baseOpacity
      : `calc(${baseOpacity} * ${multiplier})`;
  };

  // Theme-aware blend mode with profile support
  const getBlendMode = () => {
    if (blendProfile === "soft" && theme.colorScheme === "light") {
      return "soft-light";
    }
    if (blendProfile === "overlay") {
      return "overlay";
    }
    if (theme.colorScheme === "dark") {
      return overlayBlendMode === "multiply" ? "overlay" : overlayBlendMode;
    }
    return overlayBlendMode;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: getOpacity() }}
      transition={{ duration: 1, ease: "easeOut" }}
      className={`absolute size-full min-w-fit min-h-fit bg-cover bg-no-repeat ${className}`}
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 1200 1200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='8' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%' height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundBlendMode: getBlendMode(),
      }}
      data-noise-role={role}
      data-noise-strength={strength}
    />
  );
}
