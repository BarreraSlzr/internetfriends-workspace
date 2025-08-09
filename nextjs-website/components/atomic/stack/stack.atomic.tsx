/**
 * InternetFriends Stack Atomic Component
 * --------------------------------------
 * Purpose:
 *   A low-level layout primitive providing consistent spacing, alignment,
 *   direction control, responsive overrides, and optional dividers between children.
 *
 * Epic: component-architecture-v1 (feature: atomic-foundation)
 *
 * Design Principles:
 *   - Purely presentational (no business logic)
 *   - Composable: does not impose margins (consumer manages outer spacing)
 *   - Accessible: does not alter semantics unless `as` prop used
 *   - Deterministic class generation (stable output for given props)
 *
 * Usage Examples:
 *   <StackAtomic gap="md">
 *     <ButtonAtomic>One</ButtonAtomic>
 *     <ButtonAtomic>Two</ButtonAtomic>
 *   </StackAtomic>
 *
 *   <StackAtomic direction="row" gap="sm" align="center" justify="between">
 *     <Logo />
 *     <Nav />
 *   </StackAtomic>
 *
 *   <StackAtomic
 *     direction="row"
 *     gap="sm"
 *     divider
 *     responsive={{
 *       md: { direction: "column", gap: "md" },
 *       lg: { direction: "row", gap: "lg" },
 *     }}
 *   >
 *     <Card />
 *     <Card />
 *     <Card />
 *   </StackAtomic>
 */

import React, {
  forwardRef,
  HTMLAttributes,
  ReactElement,
  ReactNode,
  useMemo,
} from "react";
import { cn } from "@/lib/utils";

// Gap scale mapping (aligned to 0.25rem modular scale)
const GAP_CLASSES: Record<NonNullable<StackAtomicProps["gap"]>, string> = {
  "0": "gap-0",
  xs: "gap-1", // 0.25rem
  sm: "gap-2", // 0.5rem
  md: "gap-3", // 0.75rem
  lg: "gap-4", // 1.0rem
  xl: "gap-6", // 1.5rem
  "2xl": "gap-8", // 2.0rem
};

// Alignment mapping
const ALIGN_MAP: Record<
  NonNullable<StackAtomicProps["align"]>,
  string
> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

// Justify mapping
const JUSTIFY_MAP: Record<
  NonNullable<StackAtomicProps["justify"]>,
  string
> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

// Responsive breakpoint prefixes (Tailwind-style)
type Breakpoint = "sm" | "md" | "lg" | "xl";
const BREAKPOINTS: Breakpoint[] = ["sm", "md", "lg", "xl"];

/**
 * Partial subset of StackAtomic props allowed in responsive overrides
 */
type ResponsiveOverride = Partial<
  Pick<
    StackAtomicProps,
    "direction" | "gap" | "align" | "justify" | "wrap"
  >
>;

interface ResponsiveConfig {
  sm?: ResponsiveOverride;
  md?: ResponsiveOverride;
  lg?: ResponsiveOverride;
  xl?: ResponsiveOverride;
}

export interface StackAtomicProps
  extends Omit<HTMLAttributes<HTMLElement>, "children"> {
  /** Children to be stacked */
  children?: ReactNode;

  /** Flex direction (row = horizontal, column = vertical) */
  direction?: "row" | "column";

  /** Gap scale token */
  gap?: "0" | "xs" | "sm" | "md" | "lg" | "xl" | "2xl";

  /** Cross-axis alignment */
  align?: "start" | "center" | "end" | "stretch" | "baseline";

  /** Main-axis distribution */
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";

  /** Allow flex wrapping (only meaningful with row direction typically) */
  wrap?: boolean;

  /** Make the stack inline-flex instead of block-level flex */
  inline?: boolean;

  /** Force full width of parent */
  fullWidth?: boolean;

  /** Allow consumer to choose rendered element */
  as?: keyof JSX.IntrinsicElements;

  /**
   * Divider between children.
   * - boolean true => render default divider
   * - ReactNode => custom divider element cloned for each gap
   */
  divider?: boolean | ReactNode;

  /** Additional class for divider wrapper */
  dividerClassName?: string;

  /**
   * Responsive overrides per breakpoint.
   * Example:
   *   responsive={{
   *     md: { direction: 'row', gap: 'lg' },
   *     lg: { align: 'center' }
   *   }}
   */
  responsive?: ResponsiveConfig;

  /** Data test id */
  "data-testid"?: string;
}

/**
 * Generate responsive classes from overrides mapping.
 */
function buildResponsiveClasses(cfg?: ResponsiveConfig): string[] {
  if (!cfg) return [];

  const classes: string[] = [];

  BREAKPOINTS.forEach((bp) => {
    const override = cfg[bp];
    if (!override) return;

    if (override.direction) {
      classes.push(
        `${bp}:${
          override.direction === "row" ? "flex-row" : "flex-col"
        }`,
      );
    }
    if (override.gap) {
      const gapClass = GAP_CLASSES[override.gap];
      if (gapClass) classes.push(`${bp}:${gapClass}`);
    }
    if (override.align) {
      classes.push(`${bp}:${ALIGN_MAP[override.align]}`);
    }
    if (override.justify) {
      classes.push(`${bp}:${JUSTIFY_MAP[override.justify]}`);
    }
    if (override.wrap !== undefined) {
      classes.push(`${bp}:${override.wrap ? "flex-wrap" : "flex-nowrap"}`);
    }
  });

  return classes;
}

/**
 * Create default divider element based on direction.
 */
function DefaultDivider({
  orientation,
}: {
  orientation: "vertical" | "horizontal";
}) {
  // Using a lightweight span with background color / border
  return (
    <span
      aria-hidden="true"
      className={cn(
        "shrink-0",
        orientation === "vertical"
          ? "w-px h-full bg-[var(--glass-border,rgba(255,255,255,0.12))]"
          : "h-px w-full bg-[var(--glass-border,rgba(255,255,255,0.12))]",
      )}
    />
  );
}

/**
 * Interleave children with divider if specified.
 * Avoids unnecessary fragment creation when no divider is used.
 */
function useInterleavedChildren(
  children: ReactNode,
  divider: StackAtomicProps["divider"],
  orientation: "vertical" | "horizontal",
  dividerClassName?: string,
): ReactNode {
  return useMemo(() => {
    if (!divider) return children;

    const arrayChildren = React.Children.toArray(children);
    if (arrayChildren.length < 2) return children;

    const dividerElement =
      divider === true ? (
        <DefaultDivider orientation={orientation} />
      ) : (
        divider
      );

    const interleaved: ReactElement[] = [];

    arrayChildren.forEach((child, index) => {
      interleaved.push(child as ReactElement);
      if (index < arrayChildren.length - 1) {
        interleaved.push(
          React.cloneElement(
            <div className={cn("flex items-center justify-center")}>
              {dividerElement}
            </div>,
            {
              key: `__divider-${index}`,
              className: cn(
                "pointer-events-none select-none",
                orientation === "vertical" ? "self-stretch" : "w-full",
                dividerClassName,
              ),
            },
          ),
        );
      }
    });

    return interleaved;
  }, [children, divider, orientation, dividerClassName]);
}

/**
 * StackAtomic
 * A flexible atomic layout primitive.
 */
export const StackAtomic = forwardRef<HTMLElement, StackAtomicProps>(
  (
    {
      as: Component = "div",
      children,
      direction = "column",
      gap = "md",
      align = "stretch",
      justify = "start",
      wrap = false,
      inline = false,
      fullWidth = false,
      divider,
      dividerClassName,
      responsive,
      className,
      "data-testid": testId,
      ...rest
    },
    ref,
  ) => {
    const orientation =
      direction === "row" ? "horizontal" : "vertical";

    const interleavedChildren = useInterleavedChildren(
      children,
      divider,
      orientation === "horizontal" ? "vertical" : "horizontal",
      dividerClassName,
    );

    const classes = cn(
      // Base display
      inline ? "inline-flex" : "flex",

      // Direction
      direction === "row" ? "flex-row" : "flex-col",

      // Gap
      GAP_CLASSES[gap],

      // Alignment
      ALIGN_MAP[align],

      // Justify
      JUSTIFY_MAP[justify],

      // Wrap control
      wrap ? "flex-wrap" : "flex-nowrap",

      // Full width
      fullWidth && "w-full",

      // Responsive overrides
      buildResponsiveClasses(responsive),

      // Data attribute friendly debug marker
      "stack-atomic",

      className,
    );

    return (
      <Component
        ref={ref as any}
        className={classes}
        data-testid={testId}
        data-direction={direction}
        data-gap={gap}
        data-align={align}
        data-justify={justify}
        data-wrap={wrap || undefined}
        {...rest}
      >
        {interleavedChildren}
      </Component>
    );
  },
);

StackAtomic.displayName = "StackAtomic";

/**
 * Helper factory for a horizontal stack (row)
 * Example: <HStack gap="sm">...</HStack>
 */
export const HStack: React.FC<
  Omit<StackAtomicProps, "direction">
> = (props) => <StackAtomic direction="row" {...props} />;

/**
 * Helper factory for a vertical stack (column)
 * Example: <VStack gap="lg">...</VStack>
 */
export const VStack: React.FC<
  Omit<StackAtomicProps, "direction">
> = (props) => <StackAtomic direction="column" {...props} />;

/**
 * Type Guards (optional convenience)
 */
export function isStackElement(
  element: any,
): element is React.ReactElement<StackAtomicProps> {
  return (
    React.isValidElement(element) &&
    (element.type === StackAtomic ||
      element.type === HStack ||
      element.type === VStack)
  );
}

/**
 * Export types for downstream consumers
 */
export type {
  StackAtomicProps as StackProps,
  ResponsiveConfig as StackResponsiveConfig,
  ResponsiveOverride as StackResponsiveOverride,
};
