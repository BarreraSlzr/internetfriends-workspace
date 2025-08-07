// InternetFriends Component Type Definitions
// Component-specific props, variants, and utility types

import { ComponentProps, ReactNode, ElementType, HTMLAttributes } from "react";
import { VariantProps } from "class-variance-authority";

// Base component props that all components should extend
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;
  /** Test identifier for testing */
  "data-testid"?: string;
  /** Component children */
  children?: ReactNode;
  /** Component ID */
  id?: string;
}

// Polymorphic component props for components that can render as different elements
export type PolymorphicProps<T extends ElementType = "div"> = {
  as?: T;
} & BaseComponentProps &
  Omit<ComponentProps<T>, keyof BaseComponentProps | "as">;

// Size variants used across components
export type SizeVariant = "xs" | "sm" | "md" | "lg" | "xl";

// Color variants for interactive elements
export type ColorVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info"
  | "neutral";

// Visual variants for styling
export type VisualVariant = "solid" | "outline" | "ghost" | "link" | "gradient";

// Loading states
export type LoadingState = "idle" | "loading" | "success" | "error";

// Animation directions
export type AnimationDirection = "up" | "down" | "left" | "right" | "fade";

// Button component types
export interface ButtonProps extends BaseComponentProps {
  /** Button variant */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";
  /** Button size */
  size?: SizeVariant;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Full width button */
  fullWidth?: boolean;
  /** Icon to display before text */
  startIcon?: ReactNode;
  /** Icon to display after text */
  endIcon?: ReactNode;
  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  /** Button type */
  type?: "button" | "submit" | "reset";
}

// Input component types
export interface InputProps extends BaseComponentProps {
  /** Input variant */
  variant?: "default" | "outline" | "filled";
  /** Input size */
  size?: SizeVariant;
  /** Input type */
  type?: "text" | "email" | "password" | "number" | "tel" | "url" | "search";
  /** Placeholder text */
  placeholder?: string;
  /** Input value */
  value?: string;
  /** Default value */
  defaultValue?: string;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Focus handler */
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Helper text */
  helperText?: string;
  /** Required field */
  required?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Read-only state */
  readOnly?: boolean;
  /** Icon to display in input */
  icon?: ReactNode;
  /** Icon position */
  iconPosition?: "start" | "end";
}

// Text component types
export interface TextProps extends BaseComponentProps {
  /** Text variant/semantic meaning */
  variant?:
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "body"
    | "caption"
    | "overline";
  /** Text size (can override variant) */
  size?: SizeVariant;
  /** Font weight */
  weight?: "light" | "normal" | "medium" | "semibold" | "bold";
  /** Text color */
  color?: ColorVariant | "inherit";
  /** Text alignment */
  align?: "left" | "center" | "right" | "justify";
  /** Text decoration */
  decoration?: "none" | "underline" | "line-through";
  /** Text transform */
  transform?: "none" | "uppercase" | "lowercase" | "capitalize";
  /** Line height */
  lineHeight?: "tight" | "normal" | "relaxed";
  /** Truncate text */
  truncate?: boolean;
  /** Maximum lines before truncation */
  lineClamp?: number;
}

// Card component types
export interface CardProps extends BaseComponentProps {
  /** Card variant */
  variant?: "default" | "outlined" | "elevated" | "glass";
  /** Card padding */
  padding?: SizeVariant;
  /** Card radius */
  radius?: SizeVariant;
  /** Interactive card (hover effects) */
  interactive?: boolean;
  /** Click handler for interactive cards */
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
}

// Navigation component types
export interface NavigationItem {
  /** Navigation item label */
  label: string;
  /** Navigation item URL */
  href: string;
  /** Icon component */
  icon?: ReactNode;
  /** Active state */
  active?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** External link */
  external?: boolean;
  /** Child navigation items */
  children?: NavigationItem[];
}

export interface NavigationProps extends BaseComponentProps {
  /** Navigation items */
  items: NavigationItem[];
  /** Navigation orientation */
  orientation?: "horizontal" | "vertical";
  /** Navigation variant */
  variant?: "default" | "pills" | "underline" | "sidebar";
  /** Current pathname for active state */
  pathname?: string;
  /** Collapse navigation on mobile */
  collapsible?: boolean;
  /** Logo component */
  logo?: ReactNode;
  /** Actions (buttons) to show */
  actions?: ReactNode;
}

// Header component types
export interface HeaderProps extends BaseComponentProps {
  /** Header variant */
  variant?: "default" | "transparent" | "glass";
  /** Sticky header */
  sticky?: boolean;
  /** Show border on scroll */
  borderOnScroll?: boolean;
  /** Logo component */
  logo?: ReactNode;
  /** Navigation component */
  navigation?: ReactNode;
  /** Header actions */
  actions?: ReactNode;
  /** Mobile menu component */
  mobileMenu?: ReactNode;
}

// Footer component types
export interface FooterProps extends BaseComponentProps {
  /** Footer variant */
  variant?: "default" | "minimal" | "detailed";
  /** Logo component */
  logo?: ReactNode;
  /** Footer navigation */
  navigation?: ReactNode;
  /** Social links */
  socialLinks?: ReactNode;
  /** Newsletter signup */
  newsletter?: ReactNode;
  /** Copyright text */
  copyright?: string;
  /** Additional footer content */
  content?: ReactNode;
}

// Form component types
export interface FormProps extends BaseComponentProps {
  /** Form submission handler */
  onSubmit?: (event: React.FormEvent<HTMLFormElement>) => void;
  /** Form validation mode */
  mode?: "onChange" | "onBlur" | "onSubmit";
  /** Form layout */
  layout?: "vertical" | "horizontal" | "inline";
  /** Form spacing */
  spacing?: SizeVariant;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
}

export interface FormFieldProps extends BaseComponentProps {
  /** Field label */
  label?: string;
  /** Field description */
  description?: string;
  /** Required field indicator */
  required?: boolean;
  /** Error state */
  error?: boolean;
  /** Error message */
  errorMessage?: string;
  /** Field layout */
  layout?: "vertical" | "horizontal";
}

// Modal component types
export interface ModalProps extends BaseComponentProps {
  /** Modal open state */
  open: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal title */
  title?: string;
  /** Modal size */
  size?: SizeVariant | "fullscreen";
  /** Close on overlay click */
  closeOnOverlayClick?: boolean;
  /** Close on escape key */
  closeOnEscape?: boolean;
  /** Modal content */
  content?: ReactNode;
  /** Modal footer */
  footer?: ReactNode;
}

// Alert component types
export interface AlertProps extends BaseComponentProps {
  /** Alert variant */
  variant?: ColorVariant;
  /** Alert title */
  title?: string;
  /** Alert message */
  message: string;
  /** Dismissible alert */
  dismissible?: boolean;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** Alert icon */
  icon?: ReactNode;
  /** Alert actions */
  actions?: ReactNode;
}

// Badge component types
export interface BadgeProps extends BaseComponentProps {
  /** Badge variant */
  variant?: ColorVariant;
  /** Badge size */
  size?: SizeVariant;
  /** Badge content */
  content?: ReactNode;
  /** Dot variant (no content) */
  dot?: boolean;
  /** Badge position (for positioned badges) */
  position?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
}

// Avatar component types
export interface AvatarProps extends BaseComponentProps {
  /** Avatar image source */
  src?: string;
  /** Avatar alt text */
  alt?: string;
  /** Avatar size */
  size?: SizeVariant;
  /** Avatar shape */
  shape?: "circle" | "square" | "rounded";
  /** Fallback initials */
  initials?: string;
  /** Fallback background color */
  fallbackColor?: ColorVariant;
  /** Status indicator */
  status?: "online" | "offline" | "away" | "busy";
  /** Loading state */
  loading?: boolean;
}

// Skeleton component types
export interface SkeletonProps extends BaseComponentProps {
  /** Skeleton variant */
  variant?: "text" | "rectangle" | "circle";
  /** Skeleton width */
  width?: string | number;
  /** Skeleton height */
  height?: string | number;
  /** Animation type */
  animation?: "pulse" | "wave" | "none";
  /** Number of lines (for text variant) */
  lines?: number;
}

// Progress component types
export interface ProgressProps extends BaseComponentProps {
  /** Progress value (0-100) */
  value: number;
  /** Maximum value */
  max?: number;
  /** Progress variant */
  variant?: ColorVariant;
  /** Progress size */
  size?: SizeVariant;
  /** Show value label */
  showValue?: boolean;
  /** Value formatter */
  formatValue?: (value: number) => string;
  /** Indeterminate progress */
  indeterminate?: boolean;
}

// Tooltip component types
export interface TooltipProps extends BaseComponentProps {
  /** Tooltip content */
  content: ReactNode;
  /** Tooltip position */
  position?: "top" | "bottom" | "left" | "right";
  /** Tooltip trigger */
  trigger?: "hover" | "click" | "focus";
  /** Tooltip delay (ms) */
  delay?: number;
  /** Tooltip arrow */
  arrow?: boolean;
  /** Tooltip theme */
  theme?: "dark" | "light";
}

// Dropdown component types
export interface DropdownItem {
  /** Item label */
  label: string;
  /** Item value */
  value: string;
  /** Item icon */
  icon?: ReactNode;
  /** Item disabled state */
  disabled?: boolean;
  /** Item divider */
  divider?: boolean;
  /** Item click handler */
  onClick?: () => void;
}

export interface DropdownProps extends BaseComponentProps {
  /** Dropdown items */
  items: DropdownItem[];
  /** Dropdown trigger */
  trigger: ReactNode;
  /** Dropdown position */
  position?: "bottom-start" | "bottom-end" | "top-start" | "top-end";
  /** Close on item click */
  closeOnClick?: boolean;
  /** Dropdown disabled state */
  disabled?: boolean;
}

// Tabs component types
export interface TabItem {
  /** Tab label */
  label: string;
  /** Tab value */
  value: string;
  /** Tab icon */
  icon?: ReactNode;
  /** Tab disabled state */
  disabled?: boolean;
  /** Tab content */
  content: ReactNode;
}

export interface TabsProps extends BaseComponentProps {
  /** Tab items */
  items: TabItem[];
  /** Default active tab */
  defaultValue?: string;
  /** Controlled active tab */
  value?: string;
  /** Tab change handler */
  onChange?: (value: string) => void;
  /** Tabs orientation */
  orientation?: "horizontal" | "vertical";
  /** Tabs variant */
  variant?: "default" | "pills" | "underline";
}

// Accordion component types
export interface AccordionItem {
  /** Accordion item title */
  title: string;
  /** Accordion item value */
  value: string;
  /** Accordion item content */
  content: ReactNode;
  /** Accordion item disabled state */
  disabled?: boolean;
}

export interface AccordionProps extends BaseComponentProps {
  /** Accordion items */
  items: AccordionItem[];
  /** Allow multiple items to be open */
  multiple?: boolean;
  /** Default open items */
  defaultValue?: string | string[];
  /** Controlled open items */
  value?: string | string[];
  /** Change handler */
  onChange?: (value: string | string[]) => void;
  /** Accordion variant */
  variant?: "default" | "bordered" | "separated";
}

// Section component types (for organisms)
export interface SectionProps extends BaseComponentProps {
  /** Section variant */
  variant?: "default" | "hero" | "features" | "testimonials" | "contact";
  /** Section background */
  background?: "none" | "muted" | "gradient" | "image";
  /** Section spacing */
  spacing?: SizeVariant;
  /** Container size */
  container?: "sm" | "md" | "lg" | "xl" | "full";
  /** Section content alignment */
  align?: "left" | "center" | "right";
}

// Animation component types
export interface AnimatedProps extends BaseComponentProps {
  /** Animation type */
  animation?: "fadeIn" | "slideIn" | "scaleIn" | "bounceIn";
  /** Animation direction */
  direction?: AnimationDirection;
  /** Animation duration */
  duration?: "fast" | "normal" | "slow";
  /** Animation delay */
  delay?: number;
  /** Trigger animation on scroll */
  triggerOnScroll?: boolean;
  /** Animation threshold for scroll trigger */
  threshold?: number;
}

// Layout component types
export interface ContainerProps extends BaseComponentProps {
  /** Container size */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Container padding */
  padding?: SizeVariant;
  /** Center container */
  center?: boolean;
}

export interface FlexProps extends BaseComponentProps {
  /** Flex direction */
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  /** Justify content */
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  /** Align items */
  align?: "start" | "center" | "end" | "stretch" | "baseline";
  /** Flex wrap */
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  /** Gap between items */
  gap?: SizeVariant;
}

export interface GridProps extends BaseComponentProps {
  /** Grid columns */
  columns?: number | string;
  /** Grid rows */
  rows?: number | string;
  /** Gap between items */
  gap?: SizeVariant;
  /** Column gap */
  columnGap?: SizeVariant;
  /** Row gap */
  rowGap?: SizeVariant;
  /** Auto fit columns */
  autoFit?: boolean;
  /** Auto fill columns */
  autoFill?: boolean;
  /** Minimum column width */
  minColumnWidth?: string;
}

// Responsive type utilities
export type ResponsiveProps<T> =
  | T
  | {
      xs?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
    };

// Component state types
export interface ComponentState {
  /** Loading state */
  loading?: boolean;
  /** Error state */
  error?: boolean;
  /** Success state */
  success?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Focus state */
  focused?: boolean;
  /** Hover state */
  hovered?: boolean;
  /** Active state */
  active?: boolean;
}

// Event handler types
export type ClickHandler = (event: React.MouseEvent) => void;
export type ChangeHandler<T = string> = (value: T) => void;
export type SubmitHandler<T = any> = (data: T) => void | Promise<void>;

// Render prop types
export type RenderProp<T> = (props: T) => ReactNode;
export type ChildrenRenderProp<T> = { children: RenderProp<T> };

// Forwarded ref types
export type ForwardedRef<T> = React.ForwardedRef<T>;

// Component with forwarded ref type
export type ComponentWithRef<T, P> = React.ForwardRefExoticComponent<
  P & React.RefAttributes<T>
>;
