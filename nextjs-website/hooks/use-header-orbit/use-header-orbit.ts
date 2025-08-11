"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface HeaderOrbitConfig {
  /** Scroll threshold in pixels before orbit begins (default: 64) */
  threshold?: number;
  /** Scroll range in pixels to reach full orbit progress (default: 400) */
  range?: number;
  /** Horizontal orbit amplitude in pixels (default: 6) */
  amplitudeX?: number;
  /** Vertical orbit amplitude in pixels (default: 3) */
  amplitudeY?: number;
  /** Scale range: [start, end] (default: [1, 0.75]) */
  scaleRange?: [number, number];
  /** Respect reduced motion preference (default: true) */
  respectReducedMotion?: boolean;
  /** Throttle scroll events in ms (default: 16 for 60fps) */
  throttle?: number;
}

export interface HeaderOrbitState {
  /** Scroll progress from 0 to 1 */
  progress: number;
  /** Current scroll position */
  scrollY: number;
  /** Whether header is in scrolled state */
  isScrolled: boolean;
  /** Current transform values */
  transform: {
    x: number;
    y: number;
    scale: number;
  };
  /** CSS transform string ready for use */
  transformStyle: string;
  /** Reduced motion state */
  prefersReducedMotion: boolean;
}

export interface UseHeaderOrbitReturn {
  /** Current orbit state */
  state: HeaderOrbitState;
  /** Ref to attach to header element */
  headerRef: React.RefObject<HTMLElement>;
  /** CSS custom properties object */
  cssProperties: Record<string, string | number>;
  /** Apply orbit styles directly (for CSS-in-JS) */
  orbitStyles: React.CSSProperties;
  /** Force update orbit state */
  updateOrbit: () => void;
}

const DEFAULT_CONFIG: Required<HeaderOrbitConfig> = {
  threshold: 64,
  range: 400,
  amplitudeX: 6,
  amplitudeY: 3,
  scaleRange: [1, 0.75],
  respectReducedMotion: true,
  throttle: 16,
};

function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

function interpolate(start: number, end: number, progress: number): number {
  return start + (end - start) * progress;
}

export function useHeaderOrbit(config: HeaderOrbitConfig = {}): UseHeaderOrbitReturn {
  const finalConfig = { ...DEFAULT_CONFIG, ...config };
  const headerRef = useRef<HTMLElement>(null);

  // Orbit state
  const [state, setState] = useState<HeaderOrbitState>({
    progress: 0,
    scrollY: 0,
    isScrolled: false,
    transform: { x: 0, y: 0, scale: 1 },
    transformStyle: "none",
    prefersReducedMotion: false,
  });

  // Throttling ref
  const lastUpdateRef = useRef(0);
  const rafRef = useRef<number>();

  // Check reduced motion preference
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => {
      setState(prev => ({
        ...prev,
        prefersReducedMotion: mediaQuery.matches,
      }));
    };

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Calculate orbit state from scroll
  const calculateOrbitState = useCallback((scrollY: number): Partial<HeaderOrbitState> => {
    const { threshold, range, amplitudeX, amplitudeY, scaleRange } = finalConfig;

    // Calculate progress (0 to 1)
    const rawProgress = (scrollY - threshold) / range;
    const progress = clamp(rawProgress);

    // Determine if scrolled past threshold
    const isScrolled = scrollY > threshold;

    // Calculate transform values
    let x = 0;
    let y = 0;
    let scale = scaleRange[0];

    if (progress > 0 && !state.prefersReducedMotion) {
      // Orbital motion using parametric equations
      const tauHalf = Math.PI * 2 * 0.5;
      x = amplitudeX * Math.sin(progress * tauHalf);
      y = amplitudeY * Math.cos(progress * tauHalf);
    }

    // Scale interpolation
    scale = interpolate(scaleRange[0], scaleRange[1], progress);

    // Build transform string
    const transformStyle = state.prefersReducedMotion
      ? `scale(${scale})`
      : `translate3d(${x}px, ${y}px, 0) scale(${scale})`;

    return {
      progress,
      scrollY,
      isScrolled,
      transform: { x, y, scale },
      transformStyle,
    };
  }, [finalConfig, state.prefersReducedMotion]);

  // Throttled update function
  const updateOrbit = useCallback(() => {
    if (typeof window === "undefined") return;

    const now = performance.now();
    if (now - lastUpdateRef.current < finalConfig.throttle) return;

    lastUpdateRef.current = now;

    const scrollY = window.scrollY;
    const newState = calculateOrbitState(scrollY);

    setState(prev => ({ ...prev, ...newState }));

    // Apply CSS custom properties to header element
    const header = headerRef.current;
    if (header) {
      header.style.setProperty("--orbit-progress", String(newState.progress));
      header.style.setProperty("--orbit-x", `${newState.transform?.x || 0}px`);
      header.style.setProperty("--orbit-y", `${newState.transform?.y || 0}px`);
      header.style.setProperty("--orbit-scale", String(newState.transform?.scale || 1));

      // Data attributes for styling
      header.setAttribute("data-orbit-active", String(newState.progress! > 0));
      header.setAttribute("data-scrolled", String(newState.isScrolled!));
    }
  }, [calculateOrbitState, finalConfig.throttle]);

  // Scroll event handler
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleScroll = () => {
      if (rafRef.current) return; // Already queued

      rafRef.current = requestAnimationFrame(() => {
        updateOrbit();
        rafRef.current = undefined;
      });
    };

    // Initial calculation
    updateOrbit();

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", updateOrbit, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", updateOrbit);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [updateOrbit]);

  // CSS custom properties object
  const cssProperties: Record<string, string | number> = {
    "--orbit-progress": state.progress,
    "--orbit-x": `${state.transform.x}px`,
    "--orbit-y": `${state.transform.y}px`,
    "--orbit-scale": state.transform.scale,
    "--orbit-scale-start": finalConfig.scaleRange[0],
    "--orbit-scale-end": finalConfig.scaleRange[1],
  };

  // Direct styles for CSS-in-JS
  const orbitStyles: React.CSSProperties = {
    willChange: state.progress > 0 ? "transform" : "auto",
    transform: state.transformStyle,
    transformOrigin: "center center",
    transition: state.prefersReducedMotion
      ? "box-shadow 200ms ease, background-color 250ms ease"
      : undefined,
  };

  return {
    state,
    headerRef,
    cssProperties,
    orbitStyles,
    updateOrbit,
  };
}

export default useHeaderOrbit;
