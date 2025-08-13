/**
 * Navigation Component Types - Steadiest Addressability Pattern
 * 
 * Following glass-refinement-v1 epic principles:
 * - Minimal interface surface
 * - Clear type definitions
 * - Productive defaults
 */

import type React from 'react';

export interface NavigationItem {
  /** Display label for the navigation item */
  label: string;
  
  /** URL or path for the navigation link */
  href: string;
  
  /** Visual priority affects ordering and styling */
  priority?: 'high' | 'medium' | 'low';
  
  /** Optional icon (React node or string) */
  icon?: React.ReactNode | string;
  
  /** Optional badge count or indicator */
  badge?: number | string;
  
  /** External link indicator */
  external?: boolean;
}

export interface NavigationConfig {
  /** Layout variant for different contexts */
  variant?: 'horizontal' | 'vertical' | 'mobile';
  
  /** Theme mode (auto detects system preference) */
  theme?: 'light' | 'dark' | 'auto';
  
  /** Show branding/logo area */
  showBranding?: boolean;
  
  /** Enable search functionality */
  enableSearch?: boolean;
  
  /** Sticky behavior on scroll */
  stickyBehavior?: 'always' | 'smart' | 'never';
}

/**
 * Navigation Props - Steadiest Addressability Interface
 * 
 * Limited to 6 essential props:
 * 1. items - navigation content
 * 2. variant - layout mode  
 * 3. theme - appearance
 * 4. disabled - state control
 * 5. className - styling override
 * 6. data-testid - testing support
 */
export interface NavigationProps {
  /** Navigation items to display */
  items?: NavigationItem[];
  
  /** Layout variant (default: 'horizontal') */
  variant?: NavigationConfig['variant'];
  
  /** Theme mode (default: 'auto') */
  theme?: NavigationConfig['theme'];
  
  /** Disable the navigation entirely */
  disabled?: boolean;
  
  /** Additional CSS classes */
  className?: string;
  
  /** Test identifier */
  'data-testid'?: string;
}

// Navigation state types for internal use
export interface NavigationState {
  isExpanded?: boolean;
  activeItem?: string;
  scrollDirection?: 'up' | 'down' | 'none';
  isSticky?: boolean;
}

// Theme-aware style configuration
export interface NavigationTheme {
  colors: {
    background: string;
    text: string;
    accent: string;
    hover: string;
    active: string;
    border: string;
  };
  spacing: {
    padding: string;
    margin: string;
    itemGap: string;
  };
  typography: {
    fontSize: string;
    fontWeight: string;
    lineHeight: string;
  };
}

// Export types for external usage
export type { NavigationProps as default };

// Utility types
export type NavigationVariant = NonNullable<NavigationConfig['variant']>;
export type NavigationThemeMode = NonNullable<NavigationConfig['theme']>;
export type NavigationPriority = NonNullable<NavigationItem['priority']>;
