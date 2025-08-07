"use client";

import React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { ButtonAtomicProps } from './types';

const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap text-sm font-medium',
    'transition-all duration-200 ease-in-out',
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
    'disabled:pointer-events-none disabled:opacity-50',
    'rounded-compact-md',
  ],
  {
    variants: {
      variant: {
        primary: [
          'bg-if-primary text-white border-0',
          'hover:bg-if-primary-hover hover:transform hover:-translate-y-0.5',
          'hover:shadow-if-primary',
          'active:transform active:translate-y-0 active:shadow-if-primary-active',
        ],
        secondary: [
          'bg-secondary text-secondary-foreground border border-border',
          'hover:bg-secondary/80 hover:border-border/80',
          'hover:shadow-glass',
        ],
        outline: [
          'border-2 border-if-primary text-if-primary bg-transparent',
          'hover:bg-if-primary hover:text-white',
          'hover:transform hover:-translate-y-0.5 hover:shadow-if-primary',
        ],
        ghost: [
          'text-if-primary bg-transparent border-0',
          'hover:bg-if-primary-light hover:text-if-primary',
          'hover:transform hover:-translate-y-0.5',
        ],
        glass: [
          'glass-card bg-glass-header text-foreground',
          'border-glass-border backdrop-blur-glass',
          'hover:bg-glass-header-scrolled hover:border-glass-border-enhanced',
          'hover:shadow-glass-hover',
        ],
        destructive: [
          'bg-destructive text-destructive-foreground border-0',
          'hover:bg-destructive/90 hover:shadow-lg',
        ],
        link: [
          'text-if-primary underline-offset-4 p-0 h-auto',
          'hover:underline hover:text-if-primary-hover',
        ],
      },
      size: {
        sm: 'h-8 px-3 py-1.5 text-xs rounded-compact-sm',
        md: 'h-10 px-4 py-2 text-sm rounded-compact-md',
        lg: 'h-12 px-6 py-3 text-base rounded-compact-md',
        xl: 'h-14 px-8 py-4 text-lg rounded-compact-lg',
        icon: 'h-10 w-10 p-0 rounded-compact-md',
      },
      fullWidth: {
        true: 'w-full',
        false: 'w-auto',
      },
      loading: {
        true: 'cursor-not-allowed',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
      fullWidth: false,
      loading: false,
    },
  }
);

export const ButtonAtomic = React.forwardRef<HTMLButtonElement, ButtonAtomicProps>(
  (
    {
      className,
      variant,
      size,
      fullWidth,
      loading,
      disabled,
      asChild = false,
      leftIcon,
      rightIcon,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : 'button';
    const isDisabled = disabled || loading;

    return (
      <Comp
        className={cn(
          buttonVariants({ variant, size, fullWidth, loading }),
          className
        )}
        ref={ref}
        disabled={isDisabled}
        aria-disabled={isDisabled}
        data-loading={loading}
        {...props}
      >
        {loading && (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {leftIcon && !loading && (
          <span className="mr-2 flex-shrink-0">{leftIcon}</span>
        )}

        <span className={cn(
          'flex-1',
          loading && 'opacity-70'
        )}>
          {children}
        </span>

        {rightIcon && !loading && (
          <span className="ml-2 flex-shrink-0">{rightIcon}</span>
        )}
      </Comp>
    );
  }
);

ButtonAtomic.displayName = 'ButtonAtomic';

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
