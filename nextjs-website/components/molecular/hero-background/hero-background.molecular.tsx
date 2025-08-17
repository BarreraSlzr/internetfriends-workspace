"use client";
import React, { useMemo, useEffect, useState } from "react";
import GlooCanvasAtomic from "@/components/gloo/canvas.atomic";
import { initOctopusFlat, isRetinaDisplay } from "@/components/gloo/gloo.runtime";
import { useRafInterval } from "@/hooks/perf/use-raf-interval";
import styles from "./hero-background.module.scss";

interface HeroBackgroundProps {
  variant?: "octopus" | "minimal" | "classic";
  speed?: number;
  className?: string;
  enablePerformanceMode?: boolean;
  children?: React.ReactNode;
}

export const HeroBackground: React.FC<HeroBackgroundProps> = ({
  variant = "octopus",
  speed,
  className,
  enablePerformanceMode = true,
  children,
}) => {
  const [deviceOptimizations, setDeviceOptimizations] = useState({
    isRetina: false,
    isSafari: false,
    isMobile: false,
    reducedMotion: false,
  });

  // Detect device capabilities for optimization
  useEffect(() => {
    if (typeof window === "undefined") return;

    const isRetina = isRetinaDisplay();
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(navigator.userAgent);
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    setDeviceOptimizations({
      isRetina,
      isSafari,
      isMobile,
      reducedMotion,
    });
  }, []);

  // Initialize gloo with octopus.do inspired flat design
  const glooConfig = useMemo(() => {
    switch (variant) {
      case "octopus":
        return initOctopusFlat({
          theme: "light",
          retinaOptimized: deviceOptimizations.isRetina,
          reducedMotion: deviceOptimizations.reducedMotion,
        });
      case "minimal":
        return initOctopusFlat({
          theme: "light",
          reducedMotion: true,
          effectOverride: "minimalist",
        });
      default:
        return initOctopusFlat({ theme: "light" });
    }
  }, [variant, deviceOptimizations]);

  // Optimized speed based on device capabilities
  const optimizedSpeed = useMemo(() => {
    if (speed) return speed;
    
    let baseSpeed = 0.25;
    
    // Reduce speed on mobile for battery efficiency
    if (deviceOptimizations.isMobile) {
      baseSpeed *= 0.6;
    }
    
    // Reduce speed for reduced motion preference
    if (deviceOptimizations.reducedMotion) {
      baseSpeed *= 0.3;
    }
    
    return baseSpeed;
  }, [speed, deviceOptimizations]);

  // Motion scale optimization
  const motionScale = useMemo(() => {
    let scale = 0.45; // Subtle, octopus.do-inspired movement
    
    if (deviceOptimizations.isRetina) {
      scale *= 0.8; // Reduce for retina performance
    }
    
    if (deviceOptimizations.isMobile) {
      scale *= 0.7; // Further reduce for mobile
    }
    
    return scale;
  }, [deviceOptimizations]);

  // Performance monitoring with useRafInterval
  useRafInterval({
    callback: (deltaTime: number, timestamp: number) => {
      if (!enablePerformanceMode) return;
      
      // Monitor frame rate and adjust if needed
      // This is where you could implement dynamic quality adjustment
    },
    delay: 100, // Check every 100ms
    enabled: enablePerformanceMode,
    fps: 10, // Low frequency for performance monitoring
  });

  return (
    <div className={`${styles.heroBackground} ${className || ""}`}>
      <div className={styles.glooContainer}>
        <GlooCanvasAtomic
          palette={glooConfig.palette}
          effectIndex={glooConfig.effect.index}
          speed={optimizedSpeed}
          motionScale={motionScale}
          retinaOptimized={deviceOptimizations.isRetina}
          safariCompatible={deviceOptimizations.isSafari}
          animate={!deviceOptimizations.reducedMotion}
          reducedMotion={deviceOptimizations.reducedMotion}
          depth={deviceOptimizations.isMobile ? 3 : 4}
          resolution={deviceOptimizations.isRetina ? 1.8 : 2.0}
          className={styles.glooCanvas}
        />
      </div>
      
      {children && (
        <div className={styles.content}>
          {children}
        </div>
      )}
      
      {/* Subtle overlay for content readability */}
      <div className={styles.overlay} />
    </div>
  );
};

export default HeroBackground;