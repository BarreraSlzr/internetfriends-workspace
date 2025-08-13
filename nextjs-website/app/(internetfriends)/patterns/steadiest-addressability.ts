import React from "react";

/**
 * steadiest-addressability.ts - Pattern System for Consistent Component Interfaces
 *
 * Core learnings from Gloo WebGL troubleshooting applied systematically:
 *
 * 1. Minimal Configuration Surface - Reduce API complexity
 * 2. Clear Boundaries - Explicit client/server separation
 * 3. Once-On-Mount Logic - Stable initialization patterns
 * 4. Productive Defaults - Ship with working, proven parameters
 * 5. Mature Addressability - Simple, predictable interfaces
 *
 * This pattern system ensures all components follow consistent principles
 * for reliability, maintainability, and developer experience.
 */

export interface SteadiestAddressabilityPatterns {
  minimalConfig: MinimalConfigPattern;
  clientBoundary: ClientBoundaryPattern;
  onceOnMount: OnceOnMountPattern;
  productiveDefaults: ProductiveDefaultsPattern;
  matureAddressability: MatureAddressabilityPattern;
}

// =====================================
// 1. MINIMAL CONFIG PATTERN
// =====================================

export interface MinimalConfigPattern {
  /**
   * Keep props surface area small and focused
   * Avoid over-configurable APIs that lead to complexity
   */
  maxProps: number; // Recommended: 8 or fewer props
  requiredProps: string[]; // Only essential props are required
  optionalProps: string[]; // Everything else has sensible defaults
  bannedPatterns: string[]; // Anti-patterns to avoid
}

export const MINIMAL_CONFIG: MinimalConfigPattern = {
  maxProps: 8,
  requiredProps: [], // Prefer zero required props when possible
  optionalProps: ["disabled", "className", "style", "zIndex"],
  bannedPatterns: [
    "strategy-props", // e.g., paletteStrategy, renderMode with 5+ options
    "micro-config", // e.g., speed1, speed2, speed3 instead of speed
    "config-objects", // e.g., config={{ deeply: { nested: { options: true } } }}
    "callback-soup", // e.g., onBefore, onAfter, onDuring, onMaybe, etc.
  ],
};

// =====================================
// 2. CLIENT BOUNDARY PATTERN
// =====================================

export interface ClientBoundaryPattern {
  /**
   * Clear separation between client and server components
   * No SSR complications or hydration mismatches
   */
  clientOnly: boolean;
  ssrFallback: "null" | "placeholder" | "static";
  boundaryLocation: "wrapper" | "component" | "lazy";
  hydrationSafe: boolean;
}

export const CLIENT_BOUNDARY: ClientBoundaryPattern = {
  clientOnly: true,
  ssrFallback: "null", // Prefer null over placeholder for WebGL/Canvas
  boundaryLocation: "wrapper", // Wrap in dedicated client component
  hydrationSafe: true,
};

// Helper for creating client boundary wrappers
export function createClientWrapper<T extends Record<string, any>>(
  Component: React.ComponentType<T>,
  fallback: React.ReactNode = null,
): React.FC<T> {
  return function ClientWrapper(props: T) {
    if (typeof window === "undefined") {
      return fallback as React.ReactElement;
    }
    return React.createElement(Component, props);
  };
}

// =====================================
// 3. ONCE-ON-MOUNT PATTERN
// =====================================

export interface OnceOnMountPattern {
  /**
   * Stable initialization that happens once on mount
   * Avoid continuous randomization or re-initialization
   */
  useStateInitializer: boolean; // Use useState(() => computation)
  avoidEffectChurn: boolean; // Don't re-run expensive computations
  stableRefs: boolean; // Use refs for persistent values
  mountOnlyLogic: string[]; // Types of logic that should only run on mount
}

export const ONCE_ON_MOUNT: OnceOnMountPattern = {
  useStateInitializer: true,
  avoidEffectChurn: true,
  stableRefs: true,
  mountOnlyLogic: [
    "randomization", // Pick random values once, not continuously
    "initialization", // Setup WebGL context, canvas, etc.
    "configuration", // Parse config, validate props
    "registration", // Event listeners, observers
  ],
};

// Helper hook for once-on-mount randomization
export function useOnceOnMount<T>(computation: () => T): T {
  const [value] = React.useState(computation);
  return value;
}

// Helper hook for stable random selection
export function useStableRandom(max: number): number {
  return useOnceOnMount(() => Math.floor(Math.random() * max));
}

// =====================================
// 4. PRODUCTIVE DEFAULTS PATTERN
// =====================================

export interface ProductiveDefaultsPattern {
  /**
   * Defaults that work reliably in production
   * Based on proven parameters from working implementations
   */
  source: "legacy" | "production" | "tested" | "research";
  parameters: Record<string, any>;
  reasoning: Record<string, string>;
  fallbackChain: string[];
}

// Gloo WebGL productive defaults from troubleshooting
export const GLOO_PRODUCTIVE_DEFAULTS: ProductiveDefaultsPattern = {
  source: "legacy",
  parameters: {
    speed: 0.4, // Smooth animation, not too fast
    resolution: 2.0, // Good quality without performance hit
    depth: 4, // Sufficient layers for visual interest
    seed: 2.4, // Proven seed value from legacy
  },
  reasoning: {
    speed:
      "Tested in production - provides smooth motion without being distracting",
    resolution:
      "Balance between visual quality and performance on various devices",
    depth: "Creates sufficient visual depth without overwhelming the interface",
    seed: "Specific value that generates pleasing visual patterns",
  },
  fallbackChain: ["webgl", "canvas", "dom", "static"],
};

// InternetFriends brand colors (productive)
export const IF_BRAND_COLORS = {
  productive: {
    light: [
      [235 / 255, 231 / 255, 92 / 255], // Yellow
      [223 / 255, 72 / 255, 67 / 255], // Red
      [235 / 255, 64 / 255, 240 / 255], // Purple
    ] as const,
    dark: [
      [235 / 255, 231 / 255, 92 / 255], // Yellow (same)
      [255 / 255, 92 / 255, 87 / 255], // Lighter red
      [255 / 255, 84 / 255, 255 / 255], // Lighter purple
    ] as const,
  },
};

// =====================================
// 5. MATURE ADDRESSABILITY PATTERN
// =====================================

export interface MatureAddressabilityPattern {
  /**
   * Simple, predictable interfaces that are easy to address/control
   * Avoid clever abstractions that make debugging harder
   */
  explicitState: boolean; // Expose important state explicitly
  debuggableProps: boolean; // Props that help with debugging
  testableInterface: boolean; // Easy to test and verify behavior
  documentedBehavior: boolean; // Clear documentation of what component does
}

export const MATURE_ADDRESSABILITY: MatureAddressabilityPattern = {
  explicitState: true,
  debuggableProps: true,
  testableInterface: true,
  documentedBehavior: true,
};

// Helper for creating debuggable components
export interface DebuggableComponentProps {
  "data-testid"?: string;
  "data-component"?: string;
  "data-state"?: string;
  "data-epic"?: string;
}

export function createDebuggableProps(
  componentName: string,
  state?: Record<string, any>,
  epicContext?: string,
): DebuggableComponentProps {
  return {
    "data-testid": componentName.toLowerCase().replace(/([A-Z])/g, "-$1"),
    "data-component": componentName,
    "data-state": state ? JSON.stringify(state) : undefined,
    "data-epic": epicContext,
  };
}

// =====================================
// COMPLETE PATTERN APPLICATION
// =====================================

/**
 * Interface that components should implement to follow
 * the Steadiest Addressability Agency pattern
 */
export interface SteadiestComponent<T = {}> {
  // Minimal config - only essential props
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;

  // Debug/test support
  "data-testid"?: string;

  // Epic context (optional)
  epicContext?: {
    epicName?: string;
    epicPhase?: "development" | "review" | "complete";
  };
}

/**
 * Validation function to check if a component follows the pattern
 */
export function validateSteadiestPattern<T>(
  componentProps: Record<string, any>,
  pattern: Partial<SteadiestAddressabilityPatterns> = {},
): { valid: boolean; issues: string[] } {
  const issues: string[] = [];

  // Check prop count
  const propCount = Object.keys(componentProps).length;
  const maxProps = pattern.minimalConfig?.maxProps ?? MINIMAL_CONFIG.maxProps;
  if (propCount > maxProps) {
    issues.push(`Too many props: ${propCount} > ${maxProps}`);
  }

  // Check for banned patterns
  const bannedPatterns =
    pattern.minimalConfig?.bannedPatterns ?? MINIMAL_CONFIG.bannedPatterns;
  const propNames = Object.keys(componentProps);

  bannedPatterns.forEach((banned) => {
    if (
      banned === "strategy-props" &&
      propNames.some((p) => p.includes("Strategy"))
    ) {
      issues.push("Contains strategy props (over-configurable)");
    }
    if (
      banned === "micro-config" &&
      propNames.filter((p) => p.match(/^(speed|size|color)\d+$/)).length > 0
    ) {
      issues.push("Contains micro-config props");
    }
    if (
      banned === "config-objects" &&
      propNames.some(
        (p) => typeof componentProps[p] === "object" && p.includes("config"),
      )
    ) {
      issues.push("Contains nested config objects");
    }
  });

  return {
    valid: issues.length === 0,
    issues,
  };
}

// Export singleton instance
export const SteadiestAddressability: SteadiestAddressabilityPatterns = {
  minimalConfig: MINIMAL_CONFIG,
  clientBoundary: CLIENT_BOUNDARY,
  onceOnMount: ONCE_ON_MOUNT,
  productiveDefaults: GLOO_PRODUCTIVE_DEFAULTS,
  matureAddressability: MATURE_ADDRESSABILITY,
};

export default SteadiestAddressability;
