// GlassRefined Atomic Component - Barrel Export
// Glass morphism system with strength-based coupling

export { GlassRefinedAtomic as default } from "./glass-refined.atomic";
export { GlassRefinedAtomic } from "./glass-refined.atomic";

export type {
  GlassRefinedProps,
  GlassRefinedAtomicProps,
  GlassStrength,
  GlassMode,
  GlassVariant,
  GlassSize,
  GlassModeConfig,
  GlassVariantConfig,
  GlassComputedProperties,
  GlassCSSProperties,
  ThemeGlassProperties,
  EpicGlassContext,
  GlassRefinedWithEpicProps,
  ValidGlassStrength,
} from "./types";

export {
  GLASS_STRENGTH_PRESETS,
  GLASS_MODE_CONFIGS,
  GLASS_VARIANT_CONFIGS,
  GLASS_THEME_PROPERTIES,
} from "./types";

// Component display name for dev tools
export const componentName = "GlassRefinedAtomic";

// Epic integration metadata
export const epicMetadata = {
  epicName: "glass-refinement-v1",
  component: "glass-refined",
  version: "1.0.0",
  features: ["strength-coupling", "noise-layer", "mode-taxonomy"],
  improvements: [
    "Coupled opacity and blur for consistent material appearance",
    "Semantic mode system (ambient/focus/narrative/performance/immersive)",
    "Noise layer overlay for premium texture",
    "Reduced motion compliance",
    "Theme-aware base colors",
  ],
};
