"use client";

import { useState, useEffect, useRef } from "react";

export interface OrbitTransform {
  x: number;
  y: number;
  scale: number;
}

export interface UseHeaderOrbitOptions {
  /** Orbital radius in pixels (default: 3) */
  radius?: number;
  /** Scroll threshold for scale effect (default: 50) */
  scrollThreshold?: number;
  /** Scale factor when scrolled (default: 0.96) */
  scrolledScale?: number;
  /** Vertical orbital compression factor (default: 0.5) */
  verticalCompression?: number;
  /** Scroll distance for full orbit cycle (default: 200) */
  orbitDistance?: number;
  /** Disable orbital motion entirely */
  disabled?: boolean;
}

export interface UseHeaderOrbitReturn {
  /** Current orbital transform values */
  transform: OrbitTransform;
  /** Whether the header is in scrolled state */
  isScrolled: boolean;
  /** Ref to attach to the header element */
  headerRef: React.RefObject<HTMLElement>;
  /** Current scroll progress (0-1) */
  scrollProgress: number;
}

/**
 * Custom hook for header orbital motion with shrink effect
 *
 * Provides smooth orbital motion tied to scroll position with:
 * - Elliptical drift pattern
 * - Scale reduction on scroll
 * - Respect for reduced motion preferences
 * - Performance optimized with transform3d
 *
 * @param options Configuration options
 * @returns Orbital motion state and controls
 */
export function useHeaderOrbit(options: UseHeaderOrbitOptions = {}): UseHeaderOrbitReturn {
  const {
    radius = 3,
    scrollThreshold = 50,
    scrolledScale = 0.96,
    verticalCompression = 0.5,
    orbitDistance = 200,
    disabled = false,
  } = options;

  const [transform, setTransform] = useState<OrbitTransform>({
    x: 0,
    y: 0,
    scale: 1,
  });

  const [isScrolled, setIsScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (typeof window === "undefined" || disabled) return;

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const handleScroll = () => {
      const scrollY = window.scrollY;
      const scrolled = scrollY > scrollThreshold;
      const progress = Math.min(scrollY / orbitDistance, 1);

      setIsScrolled(scrolled);
      setScrollProgress(progress);

      // Only apply orbital motion if reduced motion is not preferred
      if (!prefersReducedMotion) {
        // Orbital motion calculations
        const orbitSpeed = progress * Math.PI * 2;
        const x = Math.sin(orbitSpeed) * radius;
        const y = Math.cos(orbitSpeed) * radius * verticalCompression;

        // Scale effect
        const scale = scrolled ? scrolledScale : 1;

        setTransform({ x, y, scale });
      } else {
        // Reduced motion: only apply scale effect
        const scale = scrolled ? scrolledScale : 1;
        setTransform({ x: 0, y: 0, scale });
      }
    };

    // Initial call to set state
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [
    disabled,
    radius,
    scrollThreshold,
    scrolledScale,
    verticalCompression,
    orbitDistance,
  ]);

  return {
    transform,
    isScrolled,
    headerRef,
    scrollProgress,
  };
}

export default useHeaderOrbit;
