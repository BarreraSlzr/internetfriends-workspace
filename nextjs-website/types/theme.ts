// InternetFriends Theme System Types
// Comprehensive type definitions for the theme system and design tokens

import { COLORS, DESIGN_TOKENS } from "../constants";

// Base theme types
export type ThemeMode = "light" | "dark" | "system";
export type ColorScheme = "light" | "dark";

// Theme configuration interface
export interface ThemeConfig {
  /** Current theme mode */
  mode: ThemeMode;
  /** Resolved color scheme (light/dark) */
  colorScheme: ColorScheme;
  /** Theme transition duration */
  transitionDuration: string;
  /** Enable theme transitions */
  enableTransitions: boolean;
  /** Custom theme overrides */
  overrides?: Partial<ThemeTokens>;
}

// Color system types
export interface ColorPalette {
  /** Primary brand color */
  primary: string;
  /** Primary hover state */
  primaryHover: string;
  /** Primary light background */
  primaryLight: string;
  /** Primary active state */
  primaryActive: string;

  /** Text colors */
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    contrast: string;
    inverse: string;
  };

  /** Background colors */
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    overlay: string;
  };

  /** Border colors */
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
    success: string;
    warning: string;
  };

  /** Status colors */
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
    neutral: string;
  };
}

// Glass morphism color system
export interface GlassColors {
  /** Header background */
  bgHeader: string;
  /** Header background when scrolled */
  bgHeaderScrolled: string;
  /** Overlay background */
  bgOverlay: string;
  /** Modal background */
  bgModal: string;
  /** Glass border */
  border: string;
  /** Enhanced glass border */
  borderEnhanced: string;
  /** Outset glass border */
  borderOutset: string;
}

// Typography system types
export interface Typography {
  /** Font families */
  fontFamily: {
    sans: string;
    serif: string;
    mono: string;
  };

  /** Font sizes */
  fontSize: {
    xs: string;
    sm: string;
    base: string;
    lg: string;
    xl: string;
    "2xl": string;
    "3xl": string;
    "4xl": string;
    "5xl": string;
  };

  /** Font weights */
  fontWeight: {
    light: number;
    normal: number;
    medium: number;
    semibold: number;
    bold: number;
  };

  /** Line heights */
  lineHeight: {
    tight: string;
    normal: string;
    relaxed: string;
  };

  /** Letter spacing */
  letterSpacing: {
    tight: string;
    normal: string;
    wide: string;
  };
}

// Spacing system types
export interface Spacing {
  xs: string; // 4px
  sm: string; // 8px
  md: string; // 12px
  lg: string; // 16px
  xl: string; // 20px
  "2xl": string; // 24px
  "3xl": string; // 32px
  "4xl": string; // 40px
  "5xl": string; // 48px
}

// Border radius system
export interface BorderRadius {
  xs: string; // 4px - Ultra compact
  sm: string; // 6px - Small compact
  md: string; // 8px - Medium compact
  lg: string; // 12px - Large (max for backgrounds)
}

// Shadow system types
export interface Shadows {
  sm: string;
  md: string;
  lg: string;
  xl: string;
  glass: string;
  inner: string;
  none: string;
}

// Z-index system
export interface ZIndex {
  hide: number;
  auto: string;
  base: number;
  docked: number;
  dropdown: number;
  sticky: number;
  banner: number;
  overlay: number;
  modal: number;
  popover: number;
  skipLink: number;
  toast: number;
  tooltip: number;
}

// Animation system types
export interface Animations {
  /** Animation durations */
  duration: {
    instant: string;
    fast: string;
    normal: string;
    slow: string;
    slower: string;
    slowest: string;
  };

  /** Animation easings */
  easing: {
    linear: string;
    easeIn: string;
    easeOut: string;
    easeInOut: string;
    bounce: string;
    smooth: string;
    sharp: string;
    glass: string;
  };

  /** Common transitions */
  transition: {
    default: string;
    fast: string;
    slow: string;
    color: string;
    background: string;
    border: string;
    shadow: string;
    transform: string;
    opacity: string;
    glass: string;
  };
}

// Breakpoint system types
export interface Breakpoints {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  "2xl": string;
}

// Complete theme tokens interface
export interface ThemeTokens {
  /** Color system */
  colors: ColorPalette;
  /** Glass morphism colors */
  glass: GlassColors;
  /** Typography system */
  typography: Typography;
  /** Spacing system */
  spacing: Spacing;
  /** Border radius system */
  radius: BorderRadius;
  /** Shadow system */
  shadows: Shadows;
  /** Z-index system */
  zIndex: ZIndex;
  /** Animation system */
  animations: Animations;
  /** Breakpoint system */
  breakpoints: Breakpoints;
}

// Component-specific theme types
export interface ComponentTheme {
  /** Button component theme */
  button: {
    primary: {
      background: string;
      backgroundHover: string;
      color: string;
      border: string;
    };
    secondary: {
      background: string;
      backgroundHover: string;
      color: string;
      border: string;
    };
    outline: {
      background: string;
      backgroundHover: string;
      color: string;
      border: string;
    };
    ghost: {
      background: string;
      backgroundHover: string;
      color: string;
      border: string;
    };
  };

  /** Input component theme */
  input: {
    background: string;
    backgroundFocus: string;
    border: string;
    borderFocus: string;
    borderError: string;
    color: string;
    placeholder: string;
  };

  /** Card component theme */
  card: {
    background: string;
    border: string;
    shadow: string;
    shadowHover: string;
  };

  /** Navigation component theme */
  navigation: {
    background: string;
    item: {
      color: string;
      colorHover: string;
      colorActive: string;
      background: string;
      backgroundHover: string;
      backgroundActive: string;
    };
  };

  /** Header component theme */
  header: {
    background: string;
    backgroundScrolled: string;
    border: string;
    shadow: string;
  };
}

// Theme context types
export interface ThemeContextValue {
  /** Current theme configuration */
  theme: ThemeConfig;
  /** Current theme tokens */
  tokens: ThemeTokens;
  /** Component themes */
  components: ComponentTheme;
  /** Set theme mode */
  setTheme: (mode: ThemeMode) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Get computed color value */
  getColor: (path: string) => string;
  /** Check if current theme is dark */
  isDark: boolean;
  /** Check if current theme is light */
  isLight: boolean;
  /** System preference */
  systemPreference: ColorScheme;
}

// CSS custom property types
export type CSSCustomProperty = `--${string}`;

export interface CSSCustomProperties {
  [key: CSSCustomProperty]: string | number;
}

// Theme variable mapping
export interface ThemeVariables {
  /** Color variables */
  colors: Record<string, CSSCustomProperty>;
  /** Spacing variables */
  spacing: Record<string, CSSCustomProperty>;
  /** Typography variables */
  typography: Record<string, CSSCustomProperty>;
  /** Animation variables */
  animations: Record<string, CSSCustomProperty>;
}

// Media query types for theme
export interface ThemeMediaQueries {
  /** Dark color scheme preference */
  prefersDark: string;
  /** Light color scheme preference */
  prefersLight: string;
  /** Reduced motion preference */
  prefersReducedMotion: string;
  /** High contrast preference */
  prefersHighContrast: string;
}

// Theme utilities
export interface ThemeUtils {
  /** Convert theme tokens to CSS custom properties */
  toCSSProperties: (tokens: ThemeTokens) => CSSCustomProperties;
  /** Get responsive value for current breakpoint */
  getResponsiveValue: <T>(
    value: T | Record<string, T>,
    breakpoint: string,
  ) => T;
  /** Create theme-aware class name */
  createClassName: (base: string, variants?: Record<string, boolean>) => string;
  /** Generate color variations */
  generateColorVariations: (baseColor: string) => Record<string, string>;
}

// Theme provider props
export interface ThemeProviderProps {
  /** Children components */
  children: React.ReactNode;
  /** Default theme mode */
  defaultTheme?: ThemeMode;
  /** Custom theme tokens */
  tokens?: Partial<ThemeTokens>;
  /** Custom component themes */
  components?: Partial<ComponentTheme>;
  /** Storage key for persistence */
  storageKey?: string;
  /** Disable theme transitions */
  disableTransitions?: boolean;
}

// Hook return types
export interface UseThemeReturn extends ThemeContextValue {
  /** Whether the theme has been mounted on the client */
  mounted: boolean;
}

export interface UseColorSchemeReturn {
  /** Current color scheme */
  colorScheme: ColorScheme;
  /** Set color scheme */
  setColorScheme: (scheme: ColorScheme) => void;
  /** System color scheme */
  systemColorScheme: ColorScheme;
}

export interface UseMediaQueryReturn {
  /** Media query matches */
  matches: boolean;
  /** Media query string */
  query: string;
}

// Theme creation types
export interface CreateThemeOptions {
  /** Base theme to extend */
  extends?: ThemeTokens;
  /** Color overrides */
  colors?: Partial<ColorPalette>;
  /** Typography overrides */
  typography?: Partial<Typography>;
  /** Custom CSS properties */
  cssProperties?: CSSCustomProperties;
}

// Style system types
export type StyleValue = string | number | undefined;

export interface StyleProps {
  /** Margin */
  m?: StyleValue;
  /** Margin top */
  mt?: StyleValue;
  /** Margin right */
  mr?: StyleValue;
  /** Margin bottom */
  mb?: StyleValue;
  /** Margin left */
  ml?: StyleValue;
  /** Margin x-axis */
  mx?: StyleValue;
  /** Margin y-axis */
  my?: StyleValue;

  /** Padding */
  p?: StyleValue;
  /** Padding top */
  pt?: StyleValue;
  /** Padding right */
  pr?: StyleValue;
  /** Padding bottom */
  pb?: StyleValue;
  /** Padding left */
  pl?: StyleValue;
  /** Padding x-axis */
  px?: StyleValue;
  /** Padding y-axis */
  py?: StyleValue;

  /** Width */
  w?: StyleValue;
  /** Height */
  h?: StyleValue;
  /** Min width */
  minW?: StyleValue;
  /** Min height */
  minH?: StyleValue;
  /** Max width */
  maxW?: StyleValue;
  /** Max height */
  maxH?: StyleValue;

  /** Color */
  color?: StyleValue;
  /** Background color */
  bg?: StyleValue;
  /** Border color */
  borderColor?: StyleValue;

  /** Font size */
  fontSize?: StyleValue;
  /** Font weight */
  fontWeight?: StyleValue;
  /** Line height */
  lineHeight?: StyleValue;

  /** Display */
  display?: StyleValue;
  /** Position */
  position?: StyleValue;
  /** Z-index */
  zIndex?: StyleValue;
}

// Theme validation types
export interface ThemeValidationResult {
  /** Validation passed */
  valid: boolean;
  /** Validation errors */
  errors: string[];
  /** Validation warnings */
  warnings: string[];
}

// Export utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ThemeKey = keyof ThemeTokens;
export type ColorKey = keyof ColorPalette;
export type SpacingKey = keyof Spacing;
export type BreakpointKey = keyof Breakpoints;

// Type guards
export const isThemeMode = (value: string): value is ThemeMode => {
  return ["light", "dark", "system"].includes(value);
};

export const isColorScheme = (value: string): value is ColorScheme => {
  return ["light", "dark"].includes(value);
};

// Theme constants types
export type ThemeConstants = typeof DESIGN_TOKENS;
export type ColorConstants = typeof COLORS;
