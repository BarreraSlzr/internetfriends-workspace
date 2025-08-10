/**
 * Barrel Export: Stack Atomic Component
 * Epic: component-architecture-v1 (feature: atomic-foundation)
 *
 * Exposes:
 *  - StackAtomic  : Core flexible layout primitive
 *  - HStack / VStack helpers
 *  - Types        : StackProps, StackResponsiveConfig, StackResponsiveOverride
 *
 * Usage:
 *  import {
 *    StackAtomic,
 *    HStack,
 *    VStack,
 *    type StackProps
 *  } from "@/components/atomic/stack";
 *
 * Notes:
 *  - Keep this barrel free of side effects.
 *  - No default export to encourage explicit named imports (better tree-shaking).
 */

export { StackAtomic, HStack, VStack } from "./stack.atomic";

export type {
  StackProps,
  StackResponsiveConfig,
  StackResponsiveOverride,
} from "./stack.atomic";
