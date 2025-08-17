"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface HeaderVignetteProps {
  intensity?: "light" | "medium" | "heavy";
  className?: string;
  children?: React.ReactNode;
}

export function HeaderVignette({
  intensity = "medium",
  className,
  children
}: HeaderVignetteProps) {
  const vignetteClasses = {
    light: "bg-gradient-to-b from-transparent via-transparent to-black/10",
    medium: "bg-gradient-to-b from-transparent via-transparent to-black/20", 
    heavy: "bg-gradient-to-b from-transparent via-transparent to-black/40"
  };

  return (
    <div className={cn("relative", className)}>
      {children}
      <div 
        className={cn(
          "absolute inset-0 pointer-events-none",
          vignetteClasses[intensity]
        )}
        aria-hidden="true"
      />
    </div>
  );
}

export default HeaderVignette;