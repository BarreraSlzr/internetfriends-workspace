// InternetFriends Application Constants
// Centralized constants for consistent values across the application

// === Component Variants ===

export const BUTTON_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary', 
  OUTLINE: 'outline',
  GHOST: 'ghost',
  LINK: 'link'
} as const

export const BUTTON_SIZES = {
  XS: 'xs',
  SM: 'sm',
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
} as const

export const CARD_VARIANTS = {
  DEFAULT: 'default',
  OUTLINED: 'outlined',
  ELEVATED: 'elevated', 
  GLASS: 'glass'
} as const

export const HEADER_VARIANTS = {
  DEFAULT: 'default',
  TRANSPARENT: 'transparent',
  GLASS: 'glass'
} as const

// === Size System ===

export const SIZE_VARIANTS = {
  XS: 'xs',
  SM: 'sm', 
  MD: 'md',
  LG: 'lg',
  XL: 'xl'
} as const

export const COLOR_VARIANTS = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  SUCCESS: 'success',
  WARNING: 'warning',
  ERROR: 'error',
  INFO: 'info',
  NEUTRAL: 'neutral'
} as const

export const VISUAL_VARIANTS = {
  SOLID: 'solid',
  OUTLINE: 'outline',
  GHOST: 'ghost',
  LINK: 'link',
  GRADIENT: 'gradient'
} as const

// === Loading States ===

export const LOADING_STATES = {
  IDLE: 'idle',
  LOADING: 'loading',
  SUCCESS: 'success',
  ERROR: 'error'
} as const

// === Animation Directions ===

export const ANIMATION_DIRECTIONS = {
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
  FADE: 'fade'
} as const

// === Component Defaults ===

export const BUTTON_DEFAULTS = {
  VARIANT: BUTTON_VARIANTS.PRIMARY,
  SIZE: BUTTON_SIZES.MD,
  TYPE: 'button',
  LOADING: false,
  DISABLED: false,
  FULL_WIDTH: false
} as const

export const CARD_DEFAULTS = {
  VARIANT: CARD_VARIANTS.DEFAULT,
  PADDING: SIZE_VARIANTS.MD,
  RADIUS: SIZE_VARIANTS.MD,
  INTERACTIVE: false
} as const

export const HEADER_DEFAULTS = {
  VARIANT: HEADER_VARIANTS.DEFAULT,
  STICKY: false,
  BORDER_ON_SCROLL: true
} as const

// === Gloo System Constants ===

export const GLOO_PALETTE_STRATEGIES = {
  BRAND_TRIAD: 'brand-triad',
  ANALOGOUS: 'analogous',
  SEEDED_RANDOM: 'seeded-random',
  PRIMARY_ACCENT: 'primary-accent',
  SOFT_GLASS: 'soft-glass',
  MONOCHROME: 'monochrome',
  COMPLEMENTARY: 'complementary',
  OCTOPUS_FLAT: 'octopus-flat',
  MODERN_MINIMAL: 'modern-minimal',
  RETINA_OPTIMIZED: 'retina-optimized'
} as const

export const GLOO_THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const

export const GLOO_EFFECT_NAMES = {
  DEFAULT: 'default',
  SPIRAL: 'spiral',
  WAVE: 'wave',
  VORTEX: 'vortex',
  PULSE: 'pulse',
  RIPPLE: 'ripple',
  TWIST: 'twist',
  OSCILLATE: 'oscillate',
  FRACTAL: 'fractal',
  SWIRL: 'swirl',
  BOUNCE: 'bounce',
  OCTOPUS: 'octopus',
  MODERN_FLOW: 'modernFlow',
  MINIMALIST: 'minimalist',
  RETINAL: 'retinal'
} as const

// === Gloo System Constants (Production-Ready) ===

export const GLOO_PALETTE_STRATEGIES = {
  BRAND_TRIAD: 'brand-triad',
  ANALOGOUS: 'analogous',
  SEEDED_RANDOM: 'seeded-random',
  PRIMARY_ACCENT: 'primary-accent',
  SOFT_GLASS: 'soft-glass',
  MONOCHROME: 'monochrome',
  COMPLEMENTARY: 'complementary',
  OCTOPUS_FLAT: 'octopus-flat',
  MODERN_MINIMAL: 'modern-minimal',
  RETINA_OPTIMIZED: 'retina-optimized'
} as const

export const GLOO_THEME_MODES = {
  LIGHT: 'light',
  DARK: 'dark'
} as const

export const GLOO_EFFECT_NAMES = {
  DEFAULT: 'default',
  SPIRAL: 'spiral',
  WAVE: 'wave',
  VORTEX: 'vortex',
  PULSE: 'pulse',
  RIPPLE: 'ripple',
  TWIST: 'twist',
  OSCILLATE: 'oscillate',
  FRACTAL: 'fractal',
  SWIRL: 'swirl',
  BOUNCE: 'bounce',
  OCTOPUS: 'octopus',
  MODERN_FLOW: 'modernFlow',
  MINIMALIST: 'minimalist',
  RETINAL: 'retinal'
} as const

// Production-tested Gloo defaults (stable across browsers)
export const GLOO_DEFAULTS = {
  // Core animation parameters (proven stable)
  SPEED: 0.4,         // Smooth, non-distracting animation
  RESOLUTION: 2.0,    // Good quality without performance issues  
  DEPTH: 4,           // Visual interest without complexity
  SEED: 2.4,          // Aesthetically pleasing patterns
  
  // Performance and reliability
  ANIMATE: true,
  DISABLED: false,
  AUTO_THEME_DETECTION: true,  // Automatically detects light/dark mode
  BROWSER_OPTIMIZATION: true,  // Enables Safari/browser-specific tuning
  
  // Brand colors (InternetFriends palette)
  BRAND_PALETTE_LIGHT: ['#ebe75c', '#df4843', '#eb40f0'] as const, // Yellow, Red, Purple
  BRAND_PALETTE_DARK: ['#ffeb70', '#ff5c57', '#ff54ff'] as const,  // Brighter versions for dark mode
  
  // Default strategy and theme
  PALETTE_STRATEGY: GLOO_PALETTE_STRATEGIES.BRAND_TRIAD,
  THEME_MODE: GLOO_THEME_MODES.LIGHT,
  EFFECT_NAME: GLOO_EFFECT_NAMES.DEFAULT,
  
  // Browser-specific optimizations
  SAFARI: {
    DPR: 1,           // Clamp device pixel ratio for memory management
    RESOLUTION: 1.0   // Lower resolution for stability
  },
  
  // Z-index layering
  Z_INDEX: {
    BACKGROUND: -1,   // Behind all content
    OVERLAY: 0,       // At content level
    DEBUG: 50         // Above most content for debugging
  }
} as const

// === Navigation Constants ===

export const NAVIGATION_ORIENTATIONS = {
  HORIZONTAL: 'horizontal',
  VERTICAL: 'vertical'
} as const

export const NAVIGATION_VARIANTS = {
  DEFAULT: 'default',
  PILLS: 'pills',
  UNDERLINE: 'underline',
  SIDEBAR: 'sidebar'
} as const

export const NAVIGATION_DEFAULTS = {
  ORIENTATION: NAVIGATION_ORIENTATIONS.HORIZONTAL,
  VARIANT: NAVIGATION_VARIANTS.DEFAULT,
  COLLAPSIBLE: true
} as const

// === Form Constants ===

export const FORM_MODES = {
  ON_CHANGE: 'onChange',
  ON_BLUR: 'onBlur',
  ON_SUBMIT: 'onSubmit'
} as const

export const FORM_LAYOUTS = {
  VERTICAL: 'vertical',
  HORIZONTAL: 'horizontal',
  INLINE: 'inline'
} as const

export const FORM_DEFAULTS = {
  MODE: FORM_MODES.ON_CHANGE,
  LAYOUT: FORM_LAYOUTS.VERTICAL,
  SPACING: SIZE_VARIANTS.MD,
  LOADING: false,
  DISABLED: false
} as const

// === Modal Constants ===

export const MODAL_SIZES = {
  ...SIZE_VARIANTS,
  FULLSCREEN: 'fullscreen'
} as const

export const MODAL_DEFAULTS = {
  SIZE: MODAL_SIZES.MD,
  CLOSE_ON_OVERLAY_CLICK: true,
  CLOSE_ON_ESCAPE: true
} as const

// === Type derivation from constants ===

export type ButtonVariant = typeof BUTTON_VARIANTS[keyof typeof BUTTON_VARIANTS]
export type ButtonSize = typeof BUTTON_SIZES[keyof typeof BUTTON_SIZES]
export type CardVariant = typeof CARD_VARIANTS[keyof typeof CARD_VARIANTS]
export type HeaderVariant = typeof HEADER_VARIANTS[keyof typeof HEADER_VARIANTS]
export type SizeVariant = typeof SIZE_VARIANTS[keyof typeof SIZE_VARIANTS]
export type ColorVariant = typeof COLOR_VARIANTS[keyof typeof COLOR_VARIANTS]
export type VisualVariant = typeof VISUAL_VARIANTS[keyof typeof VISUAL_VARIANTS]
export type LoadingState = typeof LOADING_STATES[keyof typeof LOADING_STATES]
export type AnimationDirection = typeof ANIMATION_DIRECTIONS[keyof typeof ANIMATION_DIRECTIONS]
export type GlooPaletteStrategy = typeof GLOO_PALETTE_STRATEGIES[keyof typeof GLOO_PALETTE_STRATEGIES]
export type GlooThemeMode = typeof GLOO_THEME_MODES[keyof typeof GLOO_THEME_MODES]
export type GlooEffectName = typeof GLOO_EFFECT_NAMES[keyof typeof GLOO_EFFECT_NAMES]
export type NavigationOrientation = typeof NAVIGATION_ORIENTATIONS[keyof typeof NAVIGATION_ORIENTATIONS]
export type NavigationVariant = typeof NAVIGATION_VARIANTS[keyof typeof NAVIGATION_VARIANTS]
export type FormMode = typeof FORM_MODES[keyof typeof FORM_MODES]
export type FormLayout = typeof FORM_LAYOUTS[keyof typeof FORM_LAYOUTS]
export type ModalSize = typeof MODAL_SIZES[keyof typeof MODAL_SIZES]

// === Validation Helpers ===

export const isButtonVariant = (value: string): value is ButtonVariant => {
  return Object.values(BUTTON_VARIANTS).includes(value as ButtonVariant)
}

export const isButtonSize = (value: string): value is ButtonSize => {
  return Object.values(BUTTON_SIZES).includes(value as ButtonSize)
}

export const isSizeVariant = (value: string): value is SizeVariant => {
  return Object.values(SIZE_VARIANTS).includes(value as SizeVariant)
}

export const isColorVariant = (value: string): value is ColorVariant => {
  return Object.values(COLOR_VARIANTS).includes(value as ColorVariant)
}

export const isGlooEffectName = (value: string): value is GlooEffectName => {
  return Object.values(GLOO_EFFECT_NAMES).includes(value as GlooEffectName)
}

// === Component Lists (for dropdowns, etc.) ===

export const BUTTON_VARIANT_OPTIONS = Object.values(BUTTON_VARIANTS)
export const BUTTON_SIZE_OPTIONS = Object.values(BUTTON_SIZES)
export const SIZE_VARIANT_OPTIONS = Object.values(SIZE_VARIANTS)
export const COLOR_VARIANT_OPTIONS = Object.values(COLOR_VARIANTS)
export const GLOO_EFFECT_OPTIONS = Object.values(GLOO_EFFECT_NAMES)
export const GLOO_PALETTE_OPTIONS = Object.values(GLOO_PALETTE_STRATEGIES)

// === Style Mappings ===

export const SIZE_TO_PIXELS = {
  [SIZE_VARIANTS.XS]: '0.5rem',
  [SIZE_VARIANTS.SM]: '0.75rem',
  [SIZE_VARIANTS.MD]: '1rem',
  [SIZE_VARIANTS.LG]: '1.25rem',
  [SIZE_VARIANTS.XL]: '1.5rem'
} as const

export const SIZE_TO_SPACING = {
  [SIZE_VARIANTS.XS]: '0.25rem',
  [SIZE_VARIANTS.SM]: '0.5rem',
  [SIZE_VARIANTS.MD]: '1rem',
  [SIZE_VARIANTS.LG]: '1.5rem',
  [SIZE_VARIANTS.XL]: '2rem'
} as const

export const COLOR_TO_HEX = {
  [COLOR_VARIANTS.PRIMARY]: '#3b82f6',
  [COLOR_VARIANTS.SECONDARY]: '#6b7280',
  [COLOR_VARIANTS.SUCCESS]: '#22c55e',
  [COLOR_VARIANTS.WARNING]: '#f59e0b',
  [COLOR_VARIANTS.ERROR]: '#ef4444',
  [COLOR_VARIANTS.INFO]: '#06b6d4',
  [COLOR_VARIANTS.NEUTRAL]: '#64748b'
} as const