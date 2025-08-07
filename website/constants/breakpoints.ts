// InternetFriends Responsive Breakpoints
// Mobile-first approach with progressive enhancement

// Breakpoint values (mobile-first)
export const BREAKPOINTS = {
  xs: '0px',        // Extra small devices
  sm: '640px',      // Small devices (phones)
  md: '768px',      // Medium devices (tablets)
  lg: '1024px',     // Large devices (desktops)
  xl: '1280px',     // Extra large devices
  '2xl': '1536px',  // Ultra wide devices
} as const;

// Media query helpers
export const MEDIA_QUERIES = {
  xs: `(min-width: ${BREAKPOINTS.xs})`,
  sm: `(min-width: ${BREAKPOINTS.sm})`,
  md: `(min-width: ${BREAKPOINTS.md})`,
  lg: `(min-width: ${BREAKPOINTS.lg})`,
  xl: `(min-width: ${BREAKPOINTS.xl})`,
  '2xl': `(min-width: ${BREAKPOINTS['2xl']})`,

  // Max-width queries for specific ranges
  'max-sm': `(max-width: ${parseInt(BREAKPOINTS.sm) - 1}px)`,
  'max-md': `(max-width: ${parseInt(BREAKPOINTS.md) - 1}px)`,
  'max-lg': `(max-width: ${parseInt(BREAKPOINTS.lg) - 1}px)`,
  'max-xl': `(max-width: ${parseInt(BREAKPOINTS.xl) - 1}px)`,

  // Range queries
  'sm-only': `(min-width: ${BREAKPOINTS.sm}) and (max-width: ${parseInt(BREAKPOINTS.md) - 1}px)`,
  'md-only': `(min-width: ${BREAKPOINTS.md}) and (max-width: ${parseInt(BREAKPOINTS.lg) - 1}px)`,
  'lg-only': `(min-width: ${BREAKPOINTS.lg}) and (max-width: ${parseInt(BREAKPOINTS.xl) - 1}px)`,

  // Device-specific queries
  mobile: `(max-width: ${parseInt(BREAKPOINTS.md) - 1}px)`,
  tablet: `(min-width: ${BREAKPOINTS.md}) and (max-width: ${parseInt(BREAKPOINTS.lg) - 1}px)`,
  desktop: `(min-width: ${BREAKPOINTS.lg})`,

  // Orientation queries
  portrait: '(orientation: portrait)',
  landscape: '(orientation: landscape)',

  // High DPI displays
  retina: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',

  // Preference queries
  reducedMotion: '(prefers-reduced-motion: reduce)',
  darkScheme: '(prefers-color-scheme: dark)',
  lightScheme: '(prefers-color-scheme: light)',
} as const;

// Container max-widths for each breakpoint
export const CONTAINER_SIZES = {
  xs: '100%',
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1200px',    // Custom max-width for InternetFriends
  '2xl': '1200px', // Keep consistent at 1200px
} as const;

// Grid system configuration
export const GRID = {
  columns: 12,
  gutter: {
    xs: '1rem',     // 16px
    sm: '1.5rem',   // 24px
    md: '2rem',     // 32px
    lg: '2.5rem',   // 40px
    xl: '3rem',     // 48px
  },
  margin: {
    xs: '1rem',     // 16px
    sm: '1.5rem',   // 24px
    md: '2rem',     // 32px
    lg: '2.5rem',   // 40px
    xl: '3rem',     // 48px
  },
} as const;

// Responsive typography scale
export const RESPONSIVE_TYPOGRAPHY = {
  // Heading scales that adjust with breakpoints
  h1: {
    xs: '1.875rem',  // 30px
    sm: '2.25rem',   // 36px
    md: '3rem',      // 48px
    lg: '3.75rem',   // 60px
  },
  h2: {
    xs: '1.5rem',    // 24px
    sm: '1.875rem',  // 30px
    md: '2.25rem',   // 36px
    lg: '3rem',      // 48px
  },
  h3: {
    xs: '1.25rem',   // 20px
    sm: '1.5rem',    // 24px
    md: '1.875rem',  // 30px
    lg: '2.25rem',   // 36px
  },
  h4: {
    xs: '1.125rem',  // 18px
    sm: '1.25rem',   // 20px
    md: '1.5rem',    // 24px
    lg: '1.875rem',  // 30px
  },
  body: {
    xs: '0.875rem',  // 14px
    sm: '1rem',      // 16px
    md: '1rem',      // 16px
    lg: '1.125rem',  // 18px
  },
  caption: {
    xs: '0.75rem',   // 12px
    sm: '0.875rem',  // 14px
    md: '0.875rem',  // 14px
    lg: '1rem',      // 16px
  },
} as const;

// Component responsive behavior
export const COMPONENT_RESPONSIVE = {
  // Header behavior
  header: {
    height: {
      xs: '3.5rem',  // 56px
      sm: '4rem',    // 64px
      md: '4rem',    // 64px
      lg: '4rem',    // 64px
    },
    padding: {
      xs: '0 1rem',
      sm: '0 1.5rem',
      md: '0 2rem',
      lg: '0 2.5rem',
    },
  },

  // Navigation behavior
  navigation: {
    layout: {
      xs: 'mobile',    // Hamburger menu
      sm: 'mobile',    // Hamburger menu
      md: 'desktop',   // Horizontal nav
      lg: 'desktop',   // Horizontal nav
    },
  },

  // Card layouts
  cards: {
    columns: {
      xs: 1,
      sm: 1,
      md: 2,
      lg: 3,
      xl: 3,
    },
    gap: {
      xs: '1rem',
      sm: '1.5rem',
      md: '2rem',
      lg: '2rem',
    },
  },

  // Form layouts
  forms: {
    layout: {
      xs: 'stacked',   // All inputs stacked
      sm: 'stacked',   // All inputs stacked
      md: 'mixed',     // Some side-by-side
      lg: 'mixed',     // Some side-by-side
    },
    inputWidth: {
      xs: '100%',
      sm: '100%',
      md: 'auto',
      lg: 'auto',
    },
  },
} as const;

// Touch and interaction considerations
export const TOUCH_TARGETS = {
  // Minimum touch target sizes (44px minimum for accessibility)
  minSize: '44px',
  recommended: '48px',
  comfortable: '56px',

  // Spacing between touch targets
  minSpacing: '8px',
  recommended: '16px',
} as const;

// CSS utility classes for responsive design
export const RESPONSIVE_UTILITIES = {
  // Hide/show at breakpoints
  hideOn: {
    xs: 'hide-xs',
    sm: 'hide-sm',
    md: 'hide-md',
    lg: 'hide-lg',
    xl: 'hide-xl',
  },
  showOn: {
    xs: 'show-xs',
    sm: 'show-sm',
    md: 'show-md',
    lg: 'show-lg',
    xl: 'show-xl',
  },
} as const;

// Type definitions
export type Breakpoint = keyof typeof BREAKPOINTS;
export type MediaQuery = keyof typeof MEDIA_QUERIES;
export type ContainerSize = keyof typeof CONTAINER_SIZES;
export type ResponsiveValue<T> = {
  [K in Breakpoint]?: T;
};

// Utility function to get breakpoint value
export const getBreakpointValue = (breakpoint: Breakpoint): string => {
  return BREAKPOINTS[breakpoint];
};

// Utility function to create responsive styles
export const createResponsiveStyles = <T>(
  values: ResponsiveValue<T>,
  property: string
): string => {
  return Object.entries(values)
    .map(([breakpoint, value]) => {
      const bp = breakpoint as Breakpoint;
      if (bp === 'xs') {
        return `${property}: ${value};`;
      }
      return `@media ${MEDIA_QUERIES[bp]} { ${property}: ${value}; }`;
    })
    .join(' ');
};
