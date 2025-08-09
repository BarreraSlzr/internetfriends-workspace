/**
 * Barrel Export: TextAtomic Typography Primitive
 * Epic: component-architecture-v1
 * Feature: typography-foundation
 *
 * Exposes:
 *  - TextAtomic (default + named)
 *  - Heading / Paragraph semantic helpers
 *  - Muted / Subtle / Contrast tone shortcuts
 *  - Types: TextHierarchyVariant, TextTone, TextWeight, TextProps
 *
 * Usage:
 *  import {
 *    TextAtomic,
 *    Heading,
 *    Paragraph,
 *    Muted,
 *    Subtle,
 *    Contrast,
 *    type TextHierarchyVariant,
 *    type TextTone,
 *    type TextWeight,
 *    type TextProps
 *  } from "@/components/atomic/text";
 *
 * Notes:
 *  - No side effects. Keep this barrel minimal.
 *  - Prefer named imports for clarity & tree-shaking.
 */

export {
  TextAtomic,
  Heading,
  Paragraph,
  Muted,
  Subtle,
  Contrast,
  type TextHierarchyVariant,
  type TextTone,
  type TextWeight,
  type TextProps,
} from "./text.atomic";

// Optional default export (kept for parity with some consumer patterns)
export default undefined;
// If desired later, switch to: export default TextAtomic;
