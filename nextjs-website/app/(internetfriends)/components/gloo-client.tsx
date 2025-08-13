
"use client";
/**
 * gloo-client.tsx - Simplified Gloo Client using landingpage approach
 *
 * Uses BgGooSimple for consistent, minimal WebGL background:
 * 1. Same approach as landingpage productive version
 * 2. Random effect and color selection on mount
 * 3. Parallax support with configurable intensity
 * 4. Same colors for light/dark mode
 * 5. Simple integration anywhere in app
 *
 * Usage:
 * <GlooClient />
 * <GlooClient disabled={reducedMotion} />
 * <GlooClient parallaxIntensity={0.5} />
 */

import React, { useMemo } from "react";
import { BgGooSimple } from "./backgrounds/gloo-simple";
import { getRandomColors } from "@/lib/color-palette";

// Simple interface matching landingpage approach
interface GlooClientProps {
  /** Disable rendering entirely */
  disabled?: boolean;
  /** Animation speed multiplier (default: 0.4) */
  speed?: number;
  /** Resolution multiplier (default: 2.0) */
  resolution?: number;
  /** Effect depth (default: 4) */
  depth?: number;
  /** Random seed offset (default: random) */
  seed?: number;
  /** Parallax intensity (default: 1.0) */
  parallaxIntensity?: number;
  /** Static mode - no animation */
  still?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Additional inline styles */
  style?: React.CSSProperties;
}

export const GlooClient: React.FC<GlooClientProps> = ({
  disabled = false,
  speed = 0.4,
  resolution = 2.0,
  depth = 4,
  seed,
  parallaxIntensity = 1.0,
  still = false,
  className,
  style,
}) => {
  // Random colors once on mount, same approach as landingpage
  const randomColors = useMemo(() => getRandomColors(), []);

  // Use random seed if not provided
  const finalSeed = useMemo(() => seed || Math.random() * 10, [seed]);

  if (disabled) return null;

  return (
    <div
      className={[
        "gloo-client",
        "fixed inset-0 pointer-events-none select-none",
        className || "",
      ]
        .filter(Boolean)
        .join(" ")}
      style={{
        zIndex: 0,
        isolation: "isolate",
        width: "100vw",
        height: "100vh",
        minWidth: "100vw",
        minHeight: "100vh",
        overflow: "hidden",
        ...style,
      }}
    >
      <BgGooSimple
        speed={speed}
        resolution={resolution}
        depth={depth}
        seed={finalSeed}
        still={still}
        parallaxIntensity={parallaxIntensity}
        color1={randomColors[0]}
        color2={randomColors[1]}
        color3={randomColors[2]}
      />
    </div>
  );
};

export default GlooClient;
