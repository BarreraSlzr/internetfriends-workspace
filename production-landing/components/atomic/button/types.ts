import { ButtonHTMLAttributes, ReactNode } from 'react';

export interface ButtonAtomicProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Content to render inside the button */
  children: ReactNode;

  /** Additional CSS classes to apply */
  className?: string;

  /** Visual variant of the button */
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'glass'
    | 'destructive'
    | 'link';

  /** Size variant affecting padding and height */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon';

  /** Whether button should take full width */
  fullWidth?: boolean;

  /** Whether button is in loading state */
  loading?: boolean;

  /** Whether to render as child component (using Radix Slot) */
  asChild?: boolean;

  /** Icon to display on the left side of the button */
  leftIcon?: ReactNode;

  /** Icon to display on the right side of the button */
  rightIcon?: ReactNode;

  /** Whether button is disabled */
  disabled?: boolean;
}

export interface ButtonGroupProps {
  /** Button components to group together */
  children: ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Orientation of the button group */
  orientation?: 'horizontal' | 'vertical';

  /** Size applied to all buttons in group */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Variant applied to all buttons in group */
  variant?:
    | 'primary'
    | 'secondary'
    | 'outline'
    | 'ghost'
    | 'glass'
    | 'destructive';

  /** Whether buttons should be connected (no gaps) */
  attached?: boolean;
}

export interface IconButtonProps extends Omit<ButtonAtomicProps, 'children' | 'leftIcon' | 'rightIcon'> {
  /** Icon to display in the button */
  icon: ReactNode;

  /** Accessible label for the button */
  'aria-label': string;

  /** Optional tooltip text */
  tooltip?: string;
}

export interface ToggleButtonProps extends ButtonAtomicProps {
  /** Whether the toggle is currently active/pressed */
  pressed?: boolean;

  /** Callback when toggle state changes */
  onPressedChange?: (pressed: boolean) => void;

  /** Default pressed state */
  defaultPressed?: boolean;
}

export interface LinkButtonProps extends Omit<ButtonAtomicProps, 'asChild'> {
  /** URL to navigate to */
  href: string;

  /** Whether link opens in new tab */
  external?: boolean;

  /** Whether to use Next.js Link component */
  nextLink?: boolean;
}
