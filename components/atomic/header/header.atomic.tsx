"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { HeaderAtomicProps } from "./types";

export const HeaderAtomic: React.FC<HeaderAtomicProps> = ({

  children,
  className,
  sticky = true,
  transparent = true,
  scrollThreshold = 50,
  onScrollChange,
  ...props
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      const scrolled = window.scrollY > scrollThreshold;
      setIsScrolled(scrolled);
      onScrollChange?.(scrolled);

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrollThreshold, onScrollChange]);

  return (
    <header
      className={cn(// Base header styles
        "w-full transition-all duration-300 ease-in-out",

        // Positioning
        sticky && "sticky top-0 z-50",

        // Glass morphism system
        transparent && [
          "glass-header",
          "backdrop-blur-glass",
          isScrolled && "glass-header-scrolled",
        ],

        // Non-transparent fallback
        !transparent && [
          "bg-background border-b border-border",
          isScrolled && "shadow-glass",
        ],
)
        className,)
      )}
      data-scrolled={isScrolled}
      data-theme="light" // Will be controlled by theme provider
      {...props}
    >
      <div className="container mx-auto px-4 sm: px-6 lg:px-8">

        <div className="flex items-center justify-between h-16 lg: h-20">

          {children}
        </div>
      </div>
    </header>
  );

HeaderAtomic._displayName = "HeaderAtomic";
