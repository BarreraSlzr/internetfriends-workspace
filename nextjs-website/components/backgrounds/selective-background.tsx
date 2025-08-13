import { generateStamp } from "@/lib/utils/timestamp";
"use client";

import React from "react";
import { BgGooRefined } from "@/components/backgrounds-refined/bg-goo-refined";

export type BackgroundStrategy =
  | "flat" // Clean solid color - no effects (default/productive)
  | "subtle" // Minimal gradient - clean but not flat
  | "glass" // Glass effects only - no Gloo background
  | "gloo-hero" // Gloo for hero moments - high impact
  | "gloo-ambient"; // Gloo for ambient sections - low impact

export interface SelectiveBackgroundProps {
  /** Background strategy - defaults to flat for productivity */
  strategy?: BackgroundStrategy;
  /** Custom className */
  className?: string;
  /** Custom styles */
  style?: React.CSSProperties;
  /** Children content */
  children?: React.ReactNode;
  /** Z-index for positioning */
  zIndex?: number;
}

/**
 * SelectiveBackground - Strategic background placement
 *
 * Hierarchy (most to least used):
 * 1. flat = Solid colors (primary choice for productive UI)
 * 2. subtle = Clean gradients (cards, sections)
 * 3. glass = Glass effects only (interactive elements)
 * 4. gloo-ambient = Subtle Gloo (background accent)
 * 5. gloo-hero = Full Gloo (hero sections only)
 */
export const SelectiveBackground: React.FC<SelectiveBackgroundProps> = ({
  strategy = "flat",
  className = "",
  style = {},
  children,
  zIndex = 0,
}) => {
  const renderBackground = () => {
    switch (strategy) {
      case "flat":
        return (
          <div
            className={`absolute inset-0 ${className}`}
            style={{
              background: "var(--background)",
              zIndex,
              ...style,
            }}
          />
        );

      case "subtle":
        return (
          <div
            className={`absolute inset-0 ${className}`}
            style={{
              background: `
                linear-gradient(135deg,
                  rgba(var(--if-neutral-50), 0.8) 0%,
                  rgba(var(--if-neutral-100), 0.6) 50%,
                  rgba(var(--if-neutral-50), 0.8) 100%
                )
              `,
              zIndex,
              ...style,
            }}
          />
        );

      case "glass":
        return (
          <div
            className={`absolute inset-0 ${className}`}
            style={{
              background: "var(--background)",
              zIndex,
              ...style,
            }}
          />
        );

      case "gloo-ambient":
        return (
          <BgGooRefined
            mode="ambient"
            noise={false}
            parallaxIntensity={0.1}
            respectReducedMotion={true}
            absolute={true}
            className={className}
            style={style}
            zIndex={zIndex}
          />
        );

      case "gloo-hero":
        return (
          <BgGooRefined
            mode="focus"
            noise={true}
            parallaxIntensity={0.3}
            respectReducedMotion={true}
            absolute={true}
            className={className}
            style={style}
            zIndex={zIndex}
          />
        );

      default:
        return null;
    }
  };

  if (children) {
    return (
      <div className="relative">
        {renderBackground()}
        <div className="relative z-10">{children}</div>
      </div>
    );
  }

  return renderBackground();
};

export default SelectiveBackground;
