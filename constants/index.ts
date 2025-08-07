// InternetFriends Design System Constants
export * from "./colors";
export * from "./breakpoints";
export * from "./animations";
export * from "./routes";

// Design tokens
export const DESIGN_TOKENS = {
  // Spacing scale (0.25rem increments)
  spacing: {

    xs: "0.25rem",    // 4px
    sm: "0.5rem",     // 8px
    md: "0.75rem",    // 12px
    lg: "1rem",       // 16px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "2rem",    // 32px
    "4xl": "2.5rem",  // 40px
    "5xl": "3rem",    // 48px
  },

  // Compact border radius system (max 12px for backgrounds)
  radius: {

    xs: "0.25rem",   // 4px - Ultra compact
    sm: "0.375rem",  // 6px - Small compact
    md: "0.5rem",    // 8px - Medium compact
    lg: "0.75rem",   // 12px - Large (max for backgrounds)
  },

  // Typography scale
  fontSize: {

    xs: "0.75rem",     // 12px
    sm: "0.875rem",    // 14px
    base: "1rem",      // 16px
    lg: "1.125rem",    // 18px
    xl: "1.25rem",     // 20px
    "2xl": "1.5rem",   // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem",  // 36px
    "5xl": "3rem",     // 48px
  },

  // Line heights
  lineHeight: {

    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },

  // Shadow system (subtle shadows with max 0.15 opacity)
  shadows: {

    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    glass: "0 4px 6px -1px rgba(59, 130, 246, 0.15)",
  },

  // Z-index scale
  zIndex: {

    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    dropdown: 1000,
    sticky: 1100,
    banner: 1200,
    overlay: 1300,
    modal: 1400,
    popover: 1500,
    skipLink: 1600,
    toast: 1700,
    tooltip: 1800,
  },

  // Animation durations
  duration: {

    instant: "0ms",
    fast: "150ms",
    normal: "300ms",
    slow: "500ms",
  },

  // Animation easings
  easing: {

    linear: "linear",
    easeIn: "cubic-bezier(0.4, 0, 1, 1)",
    easeOut: "cubic-bezier(0, 0, 0.2, 1)",
    easeInOut: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
} as const;

// Component variants
export const _COMPONENT_VARIANTS = {
  button: {

    size: ["xs", 'sm", "md", "lg", "xl"] as const,
    variant: ["primary", 'secondary", "outline", "ghost", "link"] as const,
  },
  input: {

    size: ['sm", "md", "lg"] as const,
    variant: ["default", "outline", "filled"] as const,
  },
  text: {

    size: ["xs", 'sm", "base", "lg", "xl", "2xl", "3xl", "4xl", "5xl"] as const,
    weight: ["light", "normal", "medium", 'semibold", "bold"] as const,
  },
} as const;

// Layout constants
export const _LAYOUT = {
  header: {

    height: "4rem", // 64px
    zIndex: DESIGN_TOKENS.zIndex.sticky,
  },
  footer: {

    height: "auto",
  },
  sidebar: {

    width: "16rem", // 256px
    collapsedWidth: "4rem", // 64px
  },
  container: {

    maxWidth: "1200px",
    padding: DESIGN_TOKENS.spacing.lg,
  },
} as const;

// InternetFriends specific constants
export const _INTERNETFRIENDS = {
  brand: {

    name: "InternetFriends",
    tagline: "Building digital connections",
  },
  social: {

    github: "https://github.com/internetfriends",
    twitter: "https://twitter.com/internetfriends",
    linkedin: "https://linkedin.com/company/internetfriends",
  },
  contact: {

    email: "hello@internetfriends.dev",
    support: 'support@internetfriends.dev",
  },
} as const;
