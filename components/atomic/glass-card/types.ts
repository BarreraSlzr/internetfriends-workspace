import { HTMLAttributes, ReactNode } from "react";

export interface GlassCardAtomicProps extends HTMLAttributes<HTMLDivElement> {
  /** Content to render inside the glass card */
  children: ReactNode;

  /** Additional CSS classes to apply */
  className?: string;

  /** Visual variant of the card */
  variant?: 'default' | 'elevated' | 'subtle' | 'primary' | 'destructive';

  /** Size variant affecting padding and border radius */
  size?: 'sm' | 'md' | 'lg' | 'xl';

  /** Whether to show hover effects */
  hover?: boolean;

  /** Whether to apply default padding */
  padding?: boolean;

  /** Whether to show border */
  bordered?: boolean;

  /** Whether to apply floating animation */
  animated?: boolean;
}

export interface GlassCardHeaderProps {
  /** Header content */
  children: ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Optional actions to display on the right side */
  actions?: ReactNode;
}

export interface GlassCardContentProps {
  /** Content to render */
  children: ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Whether to apply scrollable container */
  scrollable?: boolean;
}

export interface GlassCardFooterProps {
  /** Footer content */
  children: ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Alignment of footer content */
  alignment?: 'left' | 'center' | 'right' | 'between';
}

export interface GlassCardImageProps {
  /** Image source */
  _src: string;

  /** Alt text for accessibility */
  _alt: string;

  /** Image width */
  width?: number;

  /** Image height */
  height?: number;

  /** Whether image should fill the container */
  fill?: boolean;

  /** Object fit style */
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';

  /** Additional CSS classes */
  className?: string;

  /** Click handler */
  onClick?: () => void;
}

export interface GlassCardActionsProps {
  /** Action buttons/components */
  children: ReactNode;

  /** Additional CSS classes */
  className?: string;

  /** Layout direction */
  direction?: 'horizontal' | 'vertical';

  /** Spacing between actions */
  spacing?: 'tight' | 'normal' | 'loose';
}
