import { generateStamp } from "@/lib/utils/timestamp";
"use client";

import React from "react";
import { GlassRefinedAtomic } from "@/components/atomic/glass-refined";
import { cn } from "@/lib/utils";

export interface GlassBadgeProps {
  children: React.ReactNode;
  className?: string;
  strength?: number;
  noise?: boolean;
  hover?: boolean;
  variant?: "default" | "accent" | "muted";
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  className,
  strength = 0.35,
  noise = true,
  hover = true,
  variant = "default",
  ...props
}) => {
  const variantStyles = {
    default: "border-accent-medium text-foreground hover:border-accent-strong",
    accent: "border-if-primary/30 text-if-primary hover:border-if-primary/50",
    muted: "border-muted text-muted-foreground hover:border-muted-foreground/50",
  };

  return (
    <GlassRefinedAtomic
      variant="default"
      strength={strength}
      noise={noise}
      hover={hover}
      size="sm"
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {children}
    </GlassRefinedAtomic>
  );
};

export default GlassBadge;
