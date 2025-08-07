// InternetFriends Header Organism Types
// Comprehensive type definitions for the site header component

import { ReactNode } from "react";
import { NavigationMolecularProps } from "@/components/molecular/navigation/types";
import { ButtonAtomicProps } from "@/components/atomic/button/types";

// Logo configuration
export interface HeaderLogoConfig {
  /** Logo source URL or path */
  src?: string;
  /** Logo alt text for accessibility */
  alt?: string;
  /** Logo text fallback */
  text?: string;
  /** Logo width */
  width?: number;
  /** Logo height */
  height?: number;
  /** Logo destination URL */
  href?: string;
  /** Logo click handler */
  onClick?: () => void;
  /** Additional CSS classes */
  className?: string;
}

// Theme toggle configuration
export interface ThemeToggleConfig {
  /** Show theme toggle button */
  show?: boolean;
  /** Theme toggle position */
  position?: "left" | "right" | "mobile-only";
  /** Custom toggle button props */
  buttonProps?: Partial<ButtonAtomicProps>;
  /** Show theme labels */
  showLabels?: boolean;
  /** Custom light mode label */
  lightLabel?: string;
  /** Custom dark mode label */
  darkLabel?: string;
  /** Custom system mode label */
  systemLabel?: string;
}

// Language selector configuration
export interface LanguageSelectorConfig {
  /** Show language selector */
  show?: boolean;
  /** Language selector position */
  position?: "left" | "right" | "mobile-only";
  /** Show language flags */
  showFlags?: boolean;
  /** Show language names */
  showNames?: boolean;
  /** Show language codes only */
  showCodesOnly?: boolean;
  /** Custom selector button props */
  buttonProps?: Partial<ButtonAtomicProps>;
}

// Header actions configuration
export interface HeaderAction {
  /** Unique action ID */
  id: string;
  /** Action label */
  label: string;
  /** Action icon component */
  icon?: ReactNode;
  /** Action click handler */
  onClick?: () => void;
  /** Action destination URL */
  href?: string;
  /** External link */
  external?: boolean;
  /** Button variant */
  variant?: ButtonAtomicProps["variant"];
  /** Button size */
  size?: ButtonAtomicProps["size"];
  /** Disabled state */
  disabled?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Show only on desktop */
  desktopOnly?: boolean;
  /** Show only on mobile */
  mobileOnly?: boolean;
  /** Hide on certain screen sizes */
  hideOn?: Array<"xs" | "sm" | "md" | "lg" | "xl">;
  /** Custom button props */
  buttonProps?: Partial<ButtonAtomicProps>;
}

// Search configuration
export interface HeaderSearchConfig {
  /** Show search functionality */
  show?: boolean;
  /** Search placeholder text */
  placeholder?: string;
  /** Search handler */
  onSearch?: (query: string) => void;
  /** Search results handler */
  onResults?: (results: unknown[]) => void;
  /** Search position */
  position?: "left" | "center" | "right";
  /** Show search suggestions */
  showSuggestions?: boolean;
  /** Search keyboard shortcut */
  shortcut?: string;
  /** Custom search input props */
  inputProps?: unknown;
}

// Header announcement bar
export interface HeaderAnnouncementConfig {
  /** Show announcement bar */
  show?: boolean;
  /** Announcement content */
  content?: ReactNode;
  /** Announcement variant */
  variant?: "info" | "warning" | "success" | "error";
  /** Dismissible announcement */
  dismissible?: boolean;
  /** Auto-hide after duration (ms) */
  autoHide?: number;
  /** Announcement click handler */
  onClick?: () => void;
  /** Custom announcement props */
  className?: string;
}

// Header sticky behavior
export interface HeaderStickyConfig {
  /** Enable sticky header */
  enabled?: boolean;
  /** Sticky offset from top */
  offset?: number;
  /** Show different content when sticky */
  stickyContent?: ReactNode;
  /** Sticky transition duration */
  transitionDuration?: string;
  /** Custom sticky classes */
  stickyClassName?: string;
  /** Hide header when scrolling down */
  hideOnScroll?: boolean;
}

// Header responsive behavior
export interface HeaderResponsiveConfig {
  /** Mobile breakpoint */
  mobileBreakpoint?: "sm" | "md" | "lg";
  /** Show mobile menu toggle */
  showMobileToggle?: boolean;
  /** Mobile menu position */
  mobileMenuPosition?: "left" | "right" | "full";
  /** Mobile menu overlay */
  mobileMenuOverlay?: boolean;
  /** Desktop layout */
  desktopLayout?: "spread" | "center" | "compact";
  /** Mobile layout */
  mobileLayout?: "stacked" | "inline" | "minimal";
}

// Main header organism props
export interface HeaderOrganismProps {
  /** Header logo configuration */
  logo?: HeaderLogoConfig;

  /** Navigation configuration (extends molecular navigation) */
  navigation?: Omit<NavigationMolecularProps, "logo">;

  /** Header actions array */
  actions?: HeaderAction[];

  /** Theme toggle configuration */
  themeToggle?: ThemeToggleConfig;

  /** Language selector configuration */
  languageSelector?: LanguageSelectorConfig;

  /** Search configuration */
  search?: HeaderSearchConfig;

  /** Announcement bar configuration */
  announcement?: HeaderAnnouncementConfig;

  /** Sticky behavior configuration */
  sticky?: HeaderStickyConfig;

  /** Responsive behavior configuration */
  responsive?: HeaderResponsiveConfig;

  /** Header variant */
  variant?: "default" | "transparent" | "solid" | "glass";

  /** Header size */
  size?: "sm" | "md" | "lg";

  /** Additional CSS classes */
  className?: string;

  /** Custom header content */
  children?: ReactNode;

  /** Test identifier */
  "data-testid"?: string;

  /** Header ID */
  id?: string;

  /** ARIA label for accessibility */
  "aria-label"?: string;

  /** Skip to main content link */
  skipToMain?: boolean;

  /** Main content selector for skip link */
  mainContentSelector?: string;
}

// Header state interface
export interface HeaderState {
  /** Is header sticky */
  _isSticky: boolean;

  /** Is mobile menu open */
  _isMobileMenuOpen: boolean;

  /** Current scroll position */
  _scrollPosition: number;

  /** Is header hidden (scroll behavior) */
  _isHidden: boolean;

  /** Is search active */
  _isSearchActive: boolean;

  /** Current search query */
  _searchQuery: string;

  /** Is announcement visible */
  _isAnnouncementVisible: boolean;
}

// Header context value
export interface HeaderContextValue extends HeaderState {
  /** Toggle mobile menu */
  _toggleMobileMenu: () => void;

  /** Close mobile menu */
  _closeMobileMenu: () => void;

  /** Toggle search */
  _toggleSearch: () => void;

  /** Set search query */
  _setSearchQuery: (query: string) => void;

  /** Dismiss announcement */
  _dismissAnnouncement: () => void;

  /** Update header state */
  _updateState: (_updates: Partial<HeaderState>) => void;
}

// Header utilities
export interface HeaderUtils {
  /** Get header height */
  _getHeaderHeight: () => number;

  /** Scroll to top */
  _scrollToTop: () => void;

  /** Focus main content */
  _focusMainContent: () => void;

  /** Get current route */
  _getCurrentRoute: () => string;

  /** Check if route is active */
  _isRouteActive: (path: string) => boolean;
}

// Default configurations
export const _HEADER_DEFAULTS: Required<
  Pick<
    HeaderOrganismProps,
    "variant" | "size" | "skipToMain" | "mainContentSelector"
  >
> = {
  variant: "default",
  size: "md",
  skipToMain: true,
  mainContentSelector: "#main-content",
};

export const _HEADER_STICKY_DEFAULTS: Required<
  Omit<HeaderStickyConfig, "stickyContent">
> & { stickyContent: ReactNode | null } = {
  enabled: true,
  offset: 0,
  stickyContent: null,
  transitionDuration: "300ms",
  stickyClassName: "",
  hideOnScroll: false,
};

export const _HEADER_RESPONSIVE_DEFAULTS: Required<HeaderResponsiveConfig> = {
  mobileBreakpoint: "lg",
  showMobileToggle: true,
  mobileMenuPosition: "right",
  mobileMenuOverlay: true,
  desktopLayout: "spread",
  mobileLayout: "stacked",
};

// Type guards
export const __isHeaderAction = (value: unknown): value is HeaderAction => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof value.id === "string" &&
    typeof value.label === "string"
  );
};

export const __isHeaderVariant = (
  value: string | undefined,
): value is HeaderOrganismProps["variant"] => {
  return (
    value !== undefined &&
    ["default", "transparent", "solid", "glass"].includes(value)
  );
};

export const __isHeaderSize = (
  value: string | undefined,
): value is HeaderOrganismProps["size"] => {
  return value !== undefined && ["sm", "md", "lg"].includes(value);
};
