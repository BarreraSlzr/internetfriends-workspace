
"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { GlassCardAtomicProps } from "./types";

export const GlassCardAtomic = React.memo(
  React.forwardRef<HTMLDivElement, GlassCardAtomicProps>(
    (
      {
        children,
        className,
        variant = "default",
        size = "md",
        hover = true,
        padding = true,
        bordered = true,
        animated = false,
        disabled = false,
        "data-testid": testId,
        ...props
      },
      ref,
    ) => {
      return (
        <div
          ref={ref}
          className={cn(
            // Base glass card styles
            "glass-card backdrop-blur-glass",

            // Variants
            {
              "bg-glass border-glass": variant === "default",
              "bg-glass-header border-glass-border-enhanced":
                variant === "elevated",
              "bg-background/80 border-border": variant === "subtle",
              "bg-if-primary/5 border-if-primary/20": variant === "primary",
              "bg-destructive/5 border-destructive/20":
                variant === "destructive",
            },

            // Size variations
            {
              "p-3 rounded-compact-sm": size === "sm" && padding,
              "p-4 rounded-compact-md": size === "md" && padding,
              "p-6 rounded-compact-lg": size === "lg" && padding,
              "p-8 rounded-compact-lg": size === "xl" && padding,
            },

            // No padding variants
            {
              "rounded-compact-sm": size === "sm" && !padding,
              "rounded-compact-md": size === "md" && !padding,
              "rounded-compact-lg": size === "lg" && !padding,
              "rounded-compact-xl": size === "xl" && !padding,
            },

            // Border control
            !bordered && "border-0",

            // Hover effects (disabled when disabled)
            hover &&
              !disabled && [
                "transition-all duration-200",
                "hover:border-glass-border-enhanced",
                "hover:shadow-glass-hover",
                "hover:transform hover:scale-[1.02]",
              ],

            // Animation
            animated && !disabled && "animate-glass-float",

            // Disabled state
            disabled && [
              "opacity-50",
              "pointer-events-none",
              "cursor-not-allowed",
            ],

            className,
          )}
          data-testid={testId}
          data-disabled={disabled}
          data-variant={variant}
          data-size={size}
          aria-disabled={disabled}
          {...props}
        >
          {children}
        </div>
      );
    },
  ),
);

GlassCardAtomic.displayName = "GlassCardAtomic";
