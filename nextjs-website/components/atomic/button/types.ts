// InternetFriends Button Component Types
// Type definitions for the atomic button component

import { ButtonHTMLAttributes, ReactNode } from "react";
import { VariantProps } from "class-variance-authority";
import { buttonVariants } from "./button.atomic";

// Base button props extending HTML button attributes
export interface ButtonAtomicProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Additional CSS classes */
  className?: string;

  /** Button variant */
  variant?: "primary" | "secondary" | "outline" | "ghost" | "link";

  /** Button size */
  size?: "xs" | "sm" | "md" | "lg" | "xl";

  /** Loading state - shows spinner and disables button */
  loading?: boolean;

  /** Disabled state */
  disabled?: boolean;

  /** Full width button */
  fullWidth?: boolean;

  /** Icon to display before button text */
  startIcon?: ReactNode;

  /** Icon to display after button text */
  endIcon?: ReactNode;

  /** Button content */
  children?: ReactNode;

  /** Test identifier for testing */
  "data-testid"?: string;

  /** Button type attribute */
  type?: "button" | "submit" | "reset";

  /** Click handler */
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Focus handler */
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;

  /** Blur handler */
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;

  /** Mouse enter handler */
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Mouse leave handler */
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;

  /** Key down handler */
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

// Button variant types for external consumption
export type ButtonVariant = NonNullable<ButtonAtomicProps["variant"]>;
export type ButtonSize = NonNullable<ButtonAtomicProps["size"]>;

// Button state interface
export interface ButtonState {
  /** Is button currently loading */
  loading: boolean;

  /** Is button disabled */
  disabled: boolean;

  /** Is button focused */
  focused: boolean;

  /** Is button hovered */
  hovered: boolean;

  /** Is button pressed/active */
  pressed: boolean;
}

// Button theme configuration
export interface ButtonTheme {
  /** Primary variant colors */
  primary: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    color: string;
    border: string;
  };

  /** Secondary variant colors */
  secondary: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    color: string;
    border: string;
  };

  /** Outline variant colors */
  outline: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    color: string;
    border: string;
  };

  /** Ghost variant colors */
  ghost: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    color: string;
    border: string;
  };

  /** Link variant colors */
  link: {
    background: string;
    backgroundHover: string;
    backgroundActive: string;
    color: string;
    border: string;
  };
}

// Button accessibility props
export interface ButtonA11yProps {
  /** ARIA label for screen readers */
  "aria-label"?: string;

  /** ARIA described by */
  "aria-describedby"?: string;

  /** ARIA pressed state for toggle buttons */
  "aria-pressed"?: boolean;

  /** ARIA expanded state for disclosure buttons */
  "aria-expanded"?: boolean;

  /** ARIA controls - ID of element controlled by button */
  "aria-controls"?: string;

  /** ARIA has popup */
  "aria-haspopup"?:
    | boolean
    | "false"
    | "true"
    | "menu"
    | "listbox"
    | "tree"
    | "grid"
    | "dialog";

  /** Tab index override */
  tabIndex?: number;
}

// Extended button props with accessibility
export interface ButtonAtomicA11yProps
  extends Omit<ButtonAtomicProps, "aria-expanded" | "aria-pressed" | "role">,
    ButtonA11yProps {
  /** Role override */
  role?: string;
}

// Button group props for when buttons are grouped together
export interface ButtonGroupProps {
  /** Button elements */
  children: ReactNode;

  /** Group orientation */
  orientation?: "horizontal" | "vertical";

  /** Attached buttons (no spacing) */
  attached?: boolean;

  /** Group size (applies to all buttons) */
  size?: ButtonSize;

  /** Group variant (applies to all buttons) */
  variant?: ButtonVariant;

  /** Additional CSS classes */
  className?: string;

  /** Test identifier */
  "data-testid"?: string;
}

// Button configuration for form integration
export interface ButtonFormConfig {
  /** Form ID this button belongs to */
  form?: string;

  /** Form action URL for submit buttons */
  formAction?: string;

  /** Form encoding type */
  formEncType?: string;

  /** Form method */
  formMethod?: string;

  /** Form target */
  formTarget?: string;

  /** Form validation bypass */
  formNoValidate?: boolean;
}

// Complete button props with all extensions
export interface ButtonAtomicCompleteProps
  extends Omit<
      ButtonAtomicProps,
      "aria-expanded" | "aria-pressed" | "formAction" | "role"
    >,
    ButtonA11yProps,
    ButtonFormConfig {
  /** Role override */
  role?: string;
}

// Button event handlers interface
export interface ButtonEventHandlers {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onDoubleClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseDown?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseUp?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseEnter?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  onFocus?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLButtonElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onKeyUp?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
  onKeyPress?: (event: React.KeyboardEvent<HTMLButtonElement>) => void;
}

// Button render prop types
export interface ButtonRenderProps extends ButtonState {
  /** Button variant */
  variant: ButtonVariant;

  /** Button size */
  size: ButtonSize;

  /** Button theme colors */
  theme: ButtonTheme[ButtonVariant];
}

export type _ButtonRenderProp = (props: ButtonRenderProps) => ReactNode;

// Type guards
export const _isButtonVariant = (value: string): value is ButtonVariant => {
  return ["primary", "secondary", "outline", "ghost", "link"].includes(value);
};

export const _isButtonSize = (value: string): value is ButtonSize => {
  return ["xs", "sm", "md", "lg", "xl"].includes(value);
};

// Default props
export const _BUTTON_DEFAULTS: Required<
  Pick<
    ButtonAtomicProps,
    "variant" | "size" | "type" | "loading" | "disabled" | "fullWidth"
  >
> = {
  variant: "primary",
  size: "md",
  type: "button",
  loading: false,
  disabled: false,
  fullWidth: false,
};

// Export all types - no duplicate exports
export type { ButtonAtomicProps as default };
