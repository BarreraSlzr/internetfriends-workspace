/**
 * TextAtomic - InternetFriends Typography Primitive
 * -------------------------------------------------
 * Epic: component-architecture-v1
 * Feature: typography-foundation
 *
 * Purpose:
 *   Provide a consistent, theme-aware, accessible, semantic text primitive
 *   that normalizes typography scale, tone (color intention), hierarchy,
 *   and structural semantics (headings vs body) while remaining lightweight.
 *
 * Design Goals:
 *   - Separation of semantic element (h1/p/span/etc) from visual style variant.
 *   - Declarative hierarchy tokens (display, h1..h6, body, label, micro).
 *   - Tone system leveraging opacity / contrast rather than arbitrary colors:
 *       default  : primary readable copy
 *       subtle   : lowered contrast (50–65% opacity)
 *       muted    : more subdued auxiliary (40–55% opacity)
 *       inverted : for dark-on-light inversion contexts
 *       positive : success/affirmative messaging
 *       warning  : caution state
 *       danger   : destructive/severe messaging
 *       contrast : high-emphasis (pure or near-pure foreground)
 *   - Weight, alignment, truncation, line clamping, emphasis modifiers.
 *   - Data attributes for styling & future telemetry.
 *
 * Usage:
 *  <TextAtomic variant="h2" tone="contrast">Section Title</TextAtomic>
 *  <TextAtomic variant="body" tone="muted" clamp={2}>Multi-line excerpt...</TextAtomic>
 *  <TextAtomic as="p" variant="micro" uppercase subtle>SMALL LABEL</TextAtomic>
 *
 * Implementation Notes:
 *  - Tailwind utility classes + inline style for line clamp (fallback attr).
 *  - Extendable via SCSS module later if token theming expands.
 *  - Avoid inline color literals—prefer CSS vars (with fallbacks).
 *
 * Future Enhancements:
 *  - Motion preference scaling for large display variants.
 *  - Automatic heading level mapping based on content structure context provider.
 */

import React, { forwardRef, HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

/* ---------------------------------- Types ---------------------------------- */

type TextHierarchyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "subtitle"
  | "lead"
  | "body"
  | "body-sm"
  | "label"
  | "label-sm"
  | "micro"
  | "code";

type TextTone =
  | "default"
  | "subtle"
  | "muted"
  | "inverted"
  | "positive"
  | "warning"
  | "danger"
  | "contrast";

type TextWeight = "light" | "regular" | "medium" | "semibold" | "bold";

interface TextAtomicBaseProps {
  children?: ReactNode;
  /** Visual hierarchy variant (does not force semantic element) */
  variant?: TextHierarchyVariant;
  /** Semantic HTML tag override (defaults derived from variant) */
  as?: keyof JSX.IntrinsicElements;
  /** Color intent / emphasis tone */
  tone?: TextTone;
  /** Font weight override */
  weight?: TextWeight;
  /** Align text horizontally */
  align?: "start" | "center" | "end" | "justify";
  /** Force single line + ellipsis */
  truncate?: boolean;
  /** Clamp (line limit) for multi-line truncation */
  clamp?: number;
  /** Uppercase transform */
  uppercase?: boolean;
  /** Italic style */
  italic?: boolean;
  /** Prevent wrapping (white-space: nowrap) */
  nowrap?: boolean;
  /** Increase emphasis (applies stronger contrast / weight bump) */
  emphasis?: boolean;
  /** Reduce opacity subtlely (alias for tone=subtle but can combine) */
  subtle?: boolean;
  /** Inline display (span) vs block */
  inline?: boolean;
  /** Custom className */
  className?: string;
  /** Test id for testing */
  "data-testid"?: string;
}

export type TextAtomicProps = TextAtomicBaseProps &
  Omit<HTMLAttributes<HTMLElement>, keyof TextAtomicBaseProps>;

/* ------------------------------ Variant Mapping ---------------------------- */

/**
 * Visual style definitions for each hierarchy variant.
 * Tailwind utility clusters chosen for consistent scale.
 * (Adjust sizes to match design tokens if a future global scale is defined.)
 */
const VARIANT_CLASS_MAP: Record<TextHierarchyVariant, string> = {
  display:
    "text-5xl md:text-6xl font-semibold tracking-tight leading-[1.05] -mt-1",
  h1: "text-4xl md:text-5xl font-semibold tracking-tight leading-tight",
  h2: "text-3xl md:text-4xl font-semibold tracking-tight leading-snug",
  h3: "text-2xl md:text-3xl font-semibold leading-snug",
  h4: "text-xl md:text-2xl font-semibold leading-snug",
  h5: "text-lg font-semibold leading-snug",
  h6: "text-base font-semibold leading-snug",
  subtitle: "text-lg md:text-xl font-medium leading-snug",
  lead: "text-xl md:text-2xl font-normal leading-relaxed",
  body: "text-base leading-relaxed",
  "body-sm": "text-sm leading-relaxed",
  label: "text-sm font-medium leading-tight tracking-wide",
  "label-sm": "text-xs font-medium leading-tight tracking-wide",
  micro: "text-[10px] leading-tight tracking-wider",
  code: "font-mono text-sm leading-tight",
};

/**
 * Default semantic tag for a variant if `as` not provided.
 */
const VARIANT_DEFAULT_TAG: Partial<Record<TextHierarchyVariant, keyof JSX.IntrinsicElements>> =
  {
    display: "h1",
    h1: "h1",
    h2: "h2",
    h3: "h3",
    h4: "h4",
    h5: "h5",
    h6: "h6",
    subtitle: "h6",
    lead: "p",
    body: "p",
    "body-sm": "p",
    label: "span",
    "label-sm": "span",
    micro: "span",
    code: "code",
  };

/**
 * Tone → CSS variable mapping.
 * Uses opacity layering for subtlety wherever feasible so theming can
 * shift the underlying base color without refactoring.
 */
const TONE_CLASS_MAP: Record<TextTone, string> = {
  default:
    "text-[var(--color-text-primary,rgba(17,24,39,0.92))] dark:text-[var(--color-text-primary,#ffffff)]",
  subtle:
    "text-[color:var(--color-text-primary,rgba(17,24,39,0.92))]/70 dark:text-[color:var(--color-text-primary,#ffffff)]/65",
  muted:
    "text-[color:var(--color-text-primary,rgba(17,24,39,0.92))]/55 dark:text-[color:var(--color-text-primary,#ffffff)]/50",
  inverted:
    "text-[var(--color-bg-primary,#ffffff)] dark:text-[var(--color-bg-primary,#111827)]",
  positive:
    "text-[var(--color-positive,#10b981)] dark:text-[var(--color-positive,#10b981)]",
  warning:
    "text-[var(--color-warning,#f59e0b)] dark:text-[var(--color-warning,#f59e0b)]",
  danger:
    "text-[var(--color-danger,#ef4444)] dark:text-[var(--color-danger,#ef4444)]",
  contrast:
    "text-[var(--color-text-contrast,#000000)] dark:text-[var(--color-text-contrast,#ffffff)]",
};

/**
 * Weight override mapping. (Semibold is baseline for many heading variants; we
 * allow explicit override to ensure accessibility contrast).
 */
const WEIGHT_CLASS_MAP: Record<TextWeight, string> = {
  light: "font-light",
  regular: "font-normal",
  medium: "font-medium",
  semibold: "font-semibold",
  bold: "font-bold",
};

/* ------------------------------ Helper Functions --------------------------- */

function deriveWeightClass(
  variant: TextHierarchyVariant,
  explicit?: TextWeight,
  emphasis?: boolean,
): string | undefined {
  if (explicit) return WEIGHT_CLASS_MAP[explicit];
  // Provide default heuristics:
  if (variant === "display" || variant.startsWith("h")) {
    return emphasis ? "font-bold" : undefined; // already semibold in variant class
  }
  if (variant === "lead") {
    return emphasis ? "font-semibold" : undefined;
  }
  if (variant === "body" || variant === "body-sm") {
    return emphasis ? "font-medium" : undefined;
  }
  if (variant === "label" || variant === "label-sm" || variant === "micro") {
    return emphasis ? "font-semibold" : undefined;
  }
  if (variant === "code") {
    return emphasis ? "font-semibold" : undefined;
  }
  return undefined;
}

function alignmentClass(align?: TextAtomicProps["align"]): string | undefined {
  if (!align) return;
  return (
    {
      start: "text-left",
      center: "text-center",
      end: "text-right",
      justify: "text-justify",
    } as const
  )[align];
}

/* --------------------------- Component Declaration ------------------------- */

export const TextAtomic = forwardRef<HTMLElement, TextAtomicProps>(
  (
    {
      variant = "body",
      as,
      tone = "default",
      weight,
      align,
      truncate,
      clamp,
      uppercase,
      italic,
      nowrap,
      emphasis,
      subtle,
      inline,
      className,
      children,
      "data-testid": testId,
      ...rest
    },
    ref,
  ) => {
    const Component =
      (as as any) ||
      VARIANT_DEFAULT_TAG[variant] ||
      (inline ? "span" : "p");

    const variantClasses = VARIANT_CLASS_MAP[variant];
    const toneClasses = TONE_CLASS_MAP[subtle ? "subtle" : tone];
    const weightClass = deriveWeightClass(variant, weight, emphasis);

    const utilClasses = cn(
      variantClasses,
      toneClasses,
      weightClass,
      uppercase && "uppercase",
      italic && "italic",
      nowrap && "whitespace-nowrap",
      truncate && "truncate",
      clamp && !truncate && "line-clamp-" + clamp, // Requires line-clamp plugin; fallback below if absent.
      alignmentClass(align),
      emphasis && "tracking-tight",
      inline && "inline",
      !inline && "block",
      "selection:bg-[var(--if-primary,#3b82f6)]/15 selection:text-current",
      className,
    );

    // Inline fallback if line-clamp utility not present
    const style =
      clamp && !truncate
        ? ({
            WebkitLineClamp: clamp,
            WebkitBoxOrient: "vertical",
            display: "block",
            overflow: "hidden",
          } as React.CSSProperties)
        : undefined;

    return (
      <Component
        ref={ref}
        className={utilClasses}
        style={style}
        data-variant={variant}
        data-tone={tone}
        data-size={variant}
        data-weight={weight || undefined}
        data-inline={inline || undefined}
        data-emphasis={emphasis || undefined}
        data-testid={testId}
        {...rest}
      >
        {children}
      </Component>
    );
  },
);

TextAtomic.displayName = "TextAtomic";

/* ------------------------------- Shortcuts -------------------------------- */

/**
 * Heading wrapper that auto-selects hierarchy variant based on level.
 * <Heading level={2}>Title</Heading> => variant="h2"
 */
export const Heading: React.FC<
  Omit<TextAtomicProps, "variant" | "as"> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }
> = ({ level = 2, ...props }) => {
  const variant = ("h" + level) as TextHierarchyVariant;
  const Tag = ("h" + level) as keyof JSX.IntrinsicElements;
  return <TextAtomic as={Tag} variant={variant} {...props} />;
};

export const Paragraph: React.FC<
  Omit<TextAtomicProps, "variant" | "as">
> = (props) => <TextAtomic as="p" variant="body" {...props} />;

export const Muted: React.FC<Omit<TextAtomicProps, "tone">> = (props) => (
  <TextAtomic tone="muted" {...props} />
);

export const Subtle: React.FC<Omit<TextAtomicProps, "tone">> = (props) => (
  <TextAtomic tone="subtle" {...props} />
);

export const Contrast: React.FC<Omit<TextAtomicProps, "tone">> = (props) => (
  <TextAtomic tone="contrast" {...props} />
);

/* -------------------------------- Exports --------------------------------- */

export type {
  TextHierarchyVariant,
  TextTone,
  TextWeight,
  TextAtomicProps as TextProps,
};

export default TextAtomic;
