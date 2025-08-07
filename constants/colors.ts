// InternetFriends Color System Constants
// Based on the "coin of value" color system with glass morphism support

// Primary brand colors
export const BRAND_COLORS = {
  primary: '#3b82f6',              // Main brand blue
  primaryHover: '#2563eb',         // Hover state
  primaryLight: 'rgba(59, 130, 246, 0.08)',  // Light backgrounds
  primaryActive: 'rgba(59, 130, 246, 0.12)', // Active states
} as const;

// Glass morphism system
export const GLASS_COLORS = {
  bgHeader: 'rgba(255, 255, 255, 0.85)',
  bgHeaderScrolled: 'rgba(255, 255, 255, 0.92)',
  bgOverlay: 'rgba(255, 255, 255, 0.95)',
  bgModal: 'rgba(255, 255, 255, 0.98)',
  border: 'rgba(255, 255, 255, 0.12)',
  borderEnhanced: 'rgba(255, 255, 255, 0.18)',
  borderOutset: 'rgba(59, 130, 246, 0.15)',
} as const;

// Light theme colors
export const LIGHT_THEME = {
  // Text colors
  textPrimary: '#111827',        // Dark text on light
  textSecondary: '#6b7280',      // Muted text
  textTertiary: '#9ca3af',       // Placeholder text
  textContrast: '#000000',       // Maximum contrast
  textInverse: '#ffffff',        // White text

  // Background colors
  bgPrimary: '#ffffff',          // Pure white
  bgSecondary: '#f9fafb',        // Light gray
  bgTertiary: '#f3f4f6',         // Lighter gray
  bgMuted: '#e5e7eb',            // Muted background

  // Border colors
  borderPrimary: '#e5e7eb',      // Default borders
  borderSecondary: '#d1d5db',    // Subtle borders
  borderFocus: '#60a5fa',        // Blue focus
  borderError: '#ef4444',        // Error state
  borderSuccess: '#10b981',      // Success state
  borderWarning: '#f59e0b',      // Warning state

  // State colors
  success: '#10b981',            // Success green
  warning: '#f59e0b',            // Warning orange
  error: '#ef4444',              // Error red
  info: '#3b82f6',               // Info blue
} as const;

// Dark theme colors
export const DARK_THEME = {
  // Text colors
  textPrimary: '#ffffff',        // White text on dark
  textSecondary: '#d1d5db',      // Muted text
  textTertiary: '#9ca3af',       // Placeholder text
  textContrast: '#ffffff',       // Maximum contrast
  textInverse: '#000000',        // Black text

  // Background colors
  bgPrimary: '#111827',          // Dark background
  bgSecondary: '#1f2937',        // Lighter dark
  bgTertiary: '#374151',         // Even lighter dark
  bgMuted: '#4b5563',            // Muted background

  // Border colors
  borderPrimary: '#374151',      // Default borders
  borderSecondary: '#4b5563',    // Subtle borders
  borderFocus: '#60a5fa',        // Blue focus
  borderError: '#ef4444',        // Error state
  borderSuccess: '#10b981',      // Success state
  borderWarning: '#f59e0b',      // Warning state

  // State colors
  success: '#10b981',            // Success green
  warning: '#f59e0b',            // Warning orange
  error: '#ef4444',              // Error red
  info: '#3b82f6',               // Info blue
} as const;

// Glass morphism dark theme
export const GLASS_DARK_COLORS = {
  bgHeader: 'rgba(17, 24, 39, 0.85)',
  bgHeaderScrolled: 'rgba(17, 24, 39, 0.92)',
  bgOverlay: 'rgba(17, 24, 39, 0.95)',
  bgModal: 'rgba(17, 24, 39, 0.98)',
  border: 'rgba(255, 255, 255, 0.08)',
  borderEnhanced: 'rgba(255, 255, 255, 0.12)',
  borderOutset: 'rgba(59, 130, 246, 0.15)',
} as const;

// Semantic color mapping
export const SEMANTIC_COLORS = {
  // Interactive elements
  interactive: BRAND_COLORS.primary,
  interactiveHover: BRAND_COLORS.primaryHover,
  interactiveActive: BRAND_COLORS.primaryActive,

  // Focus states (inspired by Mermaid viewer)
  focusRing: '#60a5fa',
  focusRingOffset: '#ffffff',

  // Status colors
  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
    neutral: '#6b7280',
  },

  // Shadow colors (max 0.15 opacity)
  shadows: {
    light: 'rgba(0, 0, 0, 0.05)',
    medium: 'rgba(0, 0, 0, 0.1)',
    heavy: 'rgba(0, 0, 0, 0.15)',
    colored: 'rgba(59, 130, 246, 0.15)',
  },
} as const;

// CSS custom property names
export const CSS_VARIABLES = {
  // Brand colors
  primary: '--if-primary',
  primaryHover: '--if-primary-hover',
  primaryLight: '--if-primary-light',
  primaryActive: '--if-primary-active',

  // Glass system
  glassBg: '--glass-bg-header',
  glassBgScrolled: '--glass-bg-header-scrolled',
  glassBorder: '--glass-border',
  glassBorderEnhanced: '--glass-border-enhanced',
  glassBorderOutset: '--glass-border-outset',

  // Theme colors
  textPrimary: '--color-text-primary',
  textSecondary: '--color-text-secondary',
  textContrast: '--color-text-contrast',
  bgPrimary: '--color-bg-primary',
  bgSecondary: '--color-bg-secondary',
  borderPrimary: '--color-border-primary',
  borderFocus: '--color-border-focus',

  // Status
  success: '--color-success',
  warning: '--color-warning',
  error: '--color-error',
  info: '--color-info',
} as const;

// Utility function to get theme colors
export const _getThemeColors = (theme: 'light' | 'dark') => {
  return theme === 'light' ? LIGHT_THEME : DARK_THEME;
};

// Utility function to get glass colors
export const _getGlassColors = (theme: 'light' | 'dark') => {
  return theme === 'light' ? GLASS_COLORS : GLASS_DARK_COLORS;
};

// Export all color constants
export const _COLORS = {
  brand: BRAND_COLORS,
  glass: GLASS_COLORS,
  glassDark: GLASS_DARK_COLORS,
  light: LIGHT_THEME,
  dark: DARK_THEME,
  semantic: SEMANTIC_COLORS,
  cssVars: CSS_VARIABLES,
} as const;

// Type definitions for color system
export type BrandColor = keyof typeof BRAND_COLORS;
export type GlassColor = keyof typeof GLASS_COLORS;
export type LightThemeColor = keyof typeof LIGHT_THEME;
export type DarkThemeColor = keyof typeof DARK_THEME;
export type SemanticColor = keyof typeof SEMANTIC_COLORS;
export type Theme = 'light' | 'dark';
