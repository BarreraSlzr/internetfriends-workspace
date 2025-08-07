import { HTMLAttributes, ReactNode } from "react";

export interface HeaderAtomicProps extends HTMLAttributes<HTMLElement> {
  /** Content to render inside the header */
  children: ReactNode;

  /** Additional CSS classes to apply */
  className?: string;

  /** Whether the header should stick to the top when scrolling */
  sticky?: boolean;

  /** Whether to use glass morphism transparency effect */
  transparent?: boolean;

  /** Scroll threshold in pixels before header changes appearance */
  scrollThreshold?: number;

  /** Callback fired when scroll state changes */
  onScrollChange?: (_isScrolled: boolean) => void;

export interface HeaderNavigationProps {
  /** Navigation items to display */
  items: NavigationItem[];

  /** Currently active item identifier */
  activeItem?: string;

  /** Whether to show mobile menu toggle */
  showMobileToggle?: boolean;

  /** Callback when navigation item is clicked */
  onItemClick?: (item: NavigationItem) => void;

  /** Additional CSS classes */
  className?: string;

export interface NavigationItem {
  /** Unique identifier */
  _id: string;

  /** Display label */
  label: string;

  /** URL or route */
  _href: string;

  /** Whether item is active */
  active?: boolean;

  /** Whether item is disabled */
  disabled?: boolean;

  /** Icon component (optional) */
  icon?: React.ComponentType<{ className?: string }>;

  /** Badge text (optional) */
  badge?: string;

  /** External link indicator */
  external?: boolean;

export interface HeaderLogoProps {
  /** Logo image source */
  src?: string;

  /** Alt text for logo */
  alt?: string;

  /** Logo width */
  width?: number;

  /** Logo height */
  height?: number;

  /** Click handler for logo */
  onClick?: () => void;

  /** Additional CSS classes */
  className?: string;

  /** Text to display if no image provided */
  text?: string;

export interface HeaderActionsProps {
  /** Action buttons/components to display */
  children: ReactNode;

  /** Additional CSS classes */
  className?: string;

export interface ThemeToggleProps {
  /** Current theme */
  theme?: "light" | "dark" | "system";

  /** Callback when theme changes */
  onThemeChange?: (theme: "light" | "dark" | "system") => void;

  /** Size variant */
  size?: "sm" | "md" | "lg";

  /** Additional CSS classes */
  className?: string;
