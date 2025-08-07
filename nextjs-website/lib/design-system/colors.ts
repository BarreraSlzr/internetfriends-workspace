// InternetFriends Design System - Colors & Brand Palette

export const InternetFriendsColors = {
  // Primary brand colors
  primary: "#3b82f6",              // Main brand blue
  primaryHover: "#2563eb",         // Hover state
  primaryLight: "rgba(59, 130, 246, 0.08)",  // Light backgrounds
  primaryActive: "rgba(59, 130, 246, 0.12)", // Active states
  
  // Glass morphism system
  glass: {
    header: "rgba(255, 255, 255, 0.85)",
    headerScrolled: "rgba(255, 255, 255, 0.92)",
    border: "rgba(255, 255, 255, 0.12)",
    borderEnhanced: "rgba(255, 255, 255, 0.18)",
    borderOutset: "rgba(59, 130, 246, 0.15)",
  },
  
  // Compact border radius system (InternetFriends)
  radius: {
    xs: "0.25rem",   // 4px - Ultra compact
    sm: "0.375rem",  // 6px - Small compact
    md: "0.5rem",    // 8px - Medium compact
    lg: "0.75rem",   // 12px - Large (max for backgrounds)
  },
  
  // Theme-aware colors
  light: {
    textPrimary: "#111827",        // Dark text on light
    textContrast: "#000000",       // Maximum contrast
    bgPrimary: "#ffffff",          // Pure white
    bgGlass: "rgba(255, 255, 255, 0.95)",
    borderFocus: "#60a5fa",        // Blue focus
  },
  
  dark: {
    textPrimary: "#ffffff",        // White text on dark
    textContrast: "#ffffff",       // Maximum contrast
    bgPrimary: "#111827",          // Dark background
    bgGlass: "rgba(17, 24, 39, 0.95)",
    borderFocus: "#60a5fa",        // Blue focus
  },
} as const;

// CSS Custom Properties Generator
export const generateCSSVariables = (theme: "light" | "dark" = "light") => {
  const colors = InternetFriendsColors;
  const themeColors = colors[theme];
  
  return {
    "--if-primary": colors.primary,
    "--if-primary-hover": colors.primaryHover,
    "--if-primary-light": colors.primaryLight,
    "--if-primary-active": colors.primaryActive,
    
    "--glass-bg-header": colors.glass.header,
    "--glass-bg-header-scrolled": colors.glass.headerScrolled,
    "--glass-border": colors.glass.border,
    "--glass-border-enhanced": colors.glass.borderEnhanced,
    "--glass-border-outset": colors.glass.borderOutset,
    
    "--radius-xs": colors.radius.xs,
    "--radius-sm": colors.radius.sm,
    "--radius-md": colors.radius.md,
    "--radius-lg": colors.radius.lg,
    
    "--color-text-primary": themeColors.textPrimary,
    "--color-text-contrast": themeColors.textContrast,
    "--color-bg-primary": themeColors.bgPrimary,
    "--color-bg-glass": themeColors.bgGlass,
    "--color-border-focus": themeColors.borderFocus,
  };
};

// Tailwind CSS Extension
export const InternetFriendsTailwindExtension = {
  colors: {
    "if-primary": "var(--if-primary)",
    "if-primary-hover": "var(--if-primary-hover)",
    "if-primary-light": "var(--if-primary-light)",
    "if-primary-active": "var(--if-primary-active)",
  },
  borderRadius: {
    "if-xs": "var(--radius-xs)",
    "if-sm": "var(--radius-sm)", 
    "if-md": "var(--radius-md)",
    "if-lg": "var(--radius-lg)",
  },
  backdropBlur: {
    "glass": "blur(12px)",
  },
};
