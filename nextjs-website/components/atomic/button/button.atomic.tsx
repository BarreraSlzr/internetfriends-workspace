// InternetFriends Atomic Button Component
// Extends shadcn/ui Button with InternetFriends design system

import React, { forwardRef } from "react";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Button as ShadcnButton } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import styles from "./button.styles.module.scss";
import type { ButtonAtomicProps } from "./types";

// Button variants using class-variance-authority
const buttonVariants = cva(
  [
    // Base styles
    styles.button,
    "inline-flex items-center justify-center gap-2",
    "font-medium transition-all duration-300",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    // InternetFriends specific
    "border-2 border-dashed border-transparent",
    "focus-visible:border-[var(--color-border-focus)]",
    "focus-visible:ring-[var(--color-border-focus)]",
  ],
  {
    variants: {
      variant: {
        primary: [
          styles.primary,
          "bg-[var(--if-primary)] text-white",
          "hover:bg-[var(--if-primary-hover)]",
          "active:bg-[var(--if-primary-active)]",
          "shadow-sm hover:shadow-md",
        ],
        secondary: [
          styles.secondary,
          "bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)]",
          "border-[var(--color-border-primary)]",
          "hover:bg-[var(--color-bg-tertiary)]",
        ],
        outline: [
          styles.outline,
          "border-[var(--color-border-primary)] bg-transparent",
          "text-[var(--color-text-primary)]",
          "hover:bg-[var(--color-bg-secondary)]",
          "hover:border-[var(--if-primary)]",
        ],
        ghost: [
          styles.ghost,
          "bg-transparent text-[var(--color-text-primary)]",
          "hover:bg-[var(--if-primary-light)]",
          "hover:text-[var(--if-primary)]",
        ],
        link: [
          styles.link,
          "bg-transparent text-[var(--if-primary)]",
          "underline-offset-4 hover:underline",
          "h-auto p-0 font-normal",
        ],
      },
      size: {
        xs: [styles.xs, "h-7 px-2 text-xs rounded-[var(--radius-xs)]"],
        sm: [styles.sm, "h-8 px-3 text-sm rounded-[var(--radius-sm)]"],
        md: [styles.md, "h-10 px-4 text-sm rounded-[var(--radius-md)]"],
        lg: [styles.lg, "h-12 px-6 text-base rounded-[var(--radius-lg)]"],
        xl: [styles.xl, "h-14 px-8 text-lg rounded-[var(--radius-lg)]"],
      },
      fullWidth: {
        true: "w-full",
        false: "w-auto",
      },
      loading: {
        true: "cursor-not-allowed",
        false: "",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
      fullWidth: false,
      loading: false,
    },
  },
);

// Button component with forwarded ref
export const ButtonAtomic = forwardRef<HTMLButtonElement, ButtonAtomicProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      fullWidth = false,
      startIcon,
      endIcon,
      children,
      "data-testid": testId,
      ...props
    },
    ref,
  ) => {
    // Combine disabled states
    const isDisabled = disabled || loading;

    // Loading icon
    const loadingIcon = (
      <Loader2
        className={cn(
          "animate-spin",
          size === "xs" && "h-3 w-3",
          size === "sm" && "h-3 w-3",
          size === "md" && "h-4 w-4",
          size === "lg" && "h-5 w-5",
          size === "xl" && "h-6 w-6",
        )}
        data-testid={testId ? `${testId}-loading` : undefined}
      />
    );

    // Icon sizing based on button size
    const getIconSize = () => {
      switch (size) {
        case "xs":
        case "sm":
          return "h-3 w-3";
        case "md":
          return "h-4 w-4";
        case "lg":
          return "h-5 w-5";
        case "xl":
          return "h-6 w-6";
        default:
          return "h-4 w-4";
      }
    };

    // Helper to safely clone an icon element with merged className (simplified typing to satisfy TS)
    const withIconClass = (
      el: React.ReactElement<{ className?: string }>,
      sizeClass: string,
    ): React.ReactElement<{ className?: string }> =>
      React.cloneElement(el, {
        className: cn(
          sizeClass,
          (el.props as { className?: string }).className,
        ),
      });

    // Start icon with proper sizing
    const startIconElement = startIcon && (
      <span
        className={cn("flex-shrink-0", getIconSize())}
        data-testid={testId ? `${testId}-start-icon` : undefined}
      >
        {React.isValidElement(startIcon)
          ? withIconClass(
              startIcon as React.ReactElement<{ className?: string }>,
              getIconSize(),
            )
          : startIcon}
      </span>
    );

    // End icon with proper sizing
    const endIconElement = endIcon && (
      <span
        className={cn("flex-shrink-0", getIconSize())}
        data-testid={testId ? `${testId}-end-icon` : undefined}
      >
        {React.isValidElement(endIcon)
          ? withIconClass(
              endIcon as React.ReactElement<{ className?: string }>,
              getIconSize(),
            )
          : endIcon}
      </span>
    );

    return (
      <ShadcnButton
        ref={ref}
        className={cn(
          buttonVariants({ variant, size, fullWidth, loading }),
          className,
        )}
        disabled={isDisabled}
        data-testid={testId}
        data-variant={variant}
        data-size={size}
        data-loading={loading}
        data-disabled={isDisabled}
        {...props}
      >
        {/* Loading state */}
        {loading && loadingIcon}

        {/* Start icon */}
        {!loading && startIconElement}

        {/* Button content */}
        {children && (
          <span
            className={cn(
              "truncate",
              loading && "ml-2",
              startIcon && !loading && "ml-1",
              endIcon && "mr-1",
            )}
            data-testid={testId ? `${testId}-content` : undefined}
          >
            {children}
          </span>
        )}

        {/* End icon */}
        {!loading && endIconElement}
      </ShadcnButton>
    );
  },
);

ButtonAtomic.displayName = "ButtonAtomic";

// Export variants for external use
export { buttonVariants };
export type { ButtonAtomicProps };
