// useHeaderOrbit Hook - Barrel Export
// Header orbital motion system with sticky positioning and scroll-driven animation

export { useHeaderOrbit as default } from "./use-header-orbit";
export { useHeaderOrbit } from "./use-header-orbit";

export type {
  HeaderOrbitConfig,
  HeaderOrbitState,
  UseHeaderOrbitReturn,
} from "./use-header-orbit";

// Hook display name for dev tools
export const hookName = "useHeaderOrbit";

// Epic integration metadata
export const epicMetadata = {
  epicName: "glass-refinement-v1",
  hook: "use-header-orbit",
  version: "1.0.0",
  features: ["orbital-motion", "scroll-driven", "reduced-motion", "throttling"],
  improvements: [
    "Smooth orbital motion with parametric equations",
    "Scroll-driven scaling with sticky positioning",
    "Reduced motion compliance with fallback",
    "Performance-optimized with RAF throttling",
    "CSS custom properties integration",
  ],
};

// Configuration presets
export const HEADER_ORBIT_PRESETS = {
  subtle: {
    threshold: 64,
    range: 600,
    amplitudeX: 4,
    amplitudeY: 2,
    scaleRange: [1, 0.85] as [number, number],
  },
  default: {
    threshold: 64,
    range: 400,
    amplitudeX: 6,
    amplitudeY: 3,
    scaleRange: [1, 0.75] as [number, number],
  },
  dramatic: {
    threshold: 48,
    range: 300,
    amplitudeX: 10,
    amplitudeY: 5,
    scaleRange: [1, 0.65] as [number, number],
  },
  performance: {
    threshold: 64,
    range: 400,
    amplitudeX: 0,
    amplitudeY: 0,
    scaleRange: [1, 0.9] as [number, number],
    throttle: 32, // Lower frequency for performance
  },
} as const;

// Utility functions
export const orbitUtils = {
  /** Convert progress to orbital coordinates */
  calculateOrbit: (
    progress: number,
    amplitudeX: number,
    amplitudeY: number
  ): { x: number; y: number } => {
    const tauHalf = Math.PI * 2 * 0.5;
    return {
      x: amplitudeX * Math.sin(progress * tauHalf),
      y: amplitudeY * Math.cos(progress * tauHalf),
    };
  },

  /** Interpolate between two values */
  interpolate: (start: number, end: number, progress: number): number => {
    return start + (end - start) * progress;
  },

  /** Clamp value between min and max */
  clamp: (value: number, min = 0, max = 1): number => {
    return Math.min(max, Math.max(min, value));
  },
};
