import { ReactNode } from "react";
import { HeaderAtomicProps } from "@/components/atomic/header";

export interface NavigationItem {
  /** Unique identifier */
  id: string;

  /** Display label */
  label: string;

  /** URL or route */
  href: string;

  /** Whether item is active */
  active?: boolean;

  /** Whether item is disabled */
  disabled?: boolean;

  /** Icon component (optional) */
  icon?: React.ComponentType<{ className?: string }>;

  /** Badge text (optional) */
  badge?: string;

  /** Badge variant */
  badgeVariant?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";

  /** External link indicator */
  external?: boolean;

  /** Description for dropdown items */
  description?: string;

  /** Child navigation items for dropdowns */
  children?: NavigationItem[];

  /** Custom click handler */
  onClick?: () => void;
}

export interface NavigationLogo {
  /** Logo image source */
  src?: string;

  /** Alt text for logo */
  alt?: string;

  /** Logo width */
  width?: number;

  /** Logo height */
  height?: number;

  /** Logo link href */
  href?: string;

  /** Click handler for logo */
  onClick?: () => void;

  /** Additional CSS classes for logo */
  className?: string;

  /** Text to display if no image provided */
  text?: string;
}

export interface NavigationMolecularProps
  extends Omit<HeaderAtomicProps, "children"> {
  /** Navigation items to display */
  items: NavigationItem[];

  /** Logo configuration */
  logo?: NavigationLogo;

  /** Action buttons/components to display on the right */
  actions?: ReactNode;

  /** Visual variant of the navigation */
  variant?: "transparent" | "solid" | "glass";

  /** Breakpoint for mobile menu toggle */
  mobileBreakpoint?: "sm" | "md" | "lg";

  /** Whether to show mobile menu toggle */
  showMobileToggle?: boolean;

  /** Currently active item identifier */
  activeItem?: string;

  /** Callback when navigation item is clicked */
  onItemClick?: (item: NavigationItem) => void;

  /** Additional CSS classes */
  className?: string;
}

export interface NavigationDropdownProps {
  /** Dropdown items */
  items: NavigationItem[];

  /** Whether dropdown is open */
  isOpen: boolean;

  /** Callback when dropdown state changes */
  onOpenChange: (open: boolean) => void;

  /** Trigger element */
  trigger: ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Alignment of dropdown */
  align?: "start" | "center" | "end";

  /** Side of dropdown */
  side?: "top" | "right" | "bottom" | "left";
}

export interface MobileMenuProps {
  /** Whether mobile menu is open */
  isOpen: boolean;

  /** Callback when mobile menu state changes */
  onOpenChange: (open: boolean) => void;

  /** Navigation items */
  items: NavigationItem[];

  /** Logo configuration */
  logo?: NavigationLogo;

  /** Action components */
  actions?: ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Animation variant */
  animation?: "slide" | "fade" | "scale";
}

export interface NavigationBreadcrumbProps {
  /** Breadcrumb items */
  items: Omit<NavigationItem, "children">[];

  /** Separator component */
  separator?: ReactNode;

  /** Maximum items to show before collapsing */
  maxItems?: number;

  /** Additional CSS classes */
  className?: string;
}

export interface NavigationTabsProps {
  /** Tab items */
  items: Omit<NavigationItem, "children">[];

  /** Currently active tab */
  activeTab?: string;

  /** Callback when tab changes */
  onTabChange?: (_tabId: string) => void;

  /** Tab variant */
  variant?: "default" | "pills" | "underline";

  /** Size variant */
  size?: "sm" | "md" | "lg";

  /** Additional CSS classes */
  className?: string;

  /** Whether tabs should be scrollable on mobile */
  scrollable?: boolean;
}
