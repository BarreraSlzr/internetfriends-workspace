// InternetFriends Gesture System & Interactions

import { z } from "zod";

// Gesture Configuration Schema
export const GestureConfigSchema = z.object({
  enabled: z.boolean(),
  sensitivity: z.number().min(0.1).max(2.0),
  threshold: z.number().min(10).max(100),
  debounceMs: z.number().min(50).max(500),
});

export type GestureConfig = z.infer<typeof GestureConfigSchema>;

// Default Gesture Configuration
export const defaultGestureConfig: GestureConfig = {
  enabled: true,
  sensitivity: 1.0,
  threshold: 50,
  debounceMs: 150,
};

// Touch Gesture Types
export type SwipeDirection = "up" | "down" | "left" | "right";
export type PinchType = "in" | "out";

export interface SwipeGesture {
  direction: SwipeDirection;
  distance: number;
  velocity: number;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

export interface PinchGesture {
  type: PinchType;
  scale: number;
  center: { x: number; y: number };
}

// Focus Management for Accessibility
export const FocusKeyPatterns = {
  // Keyboard navigation
  navigation: {
    next: ["Tab"],
    previous: ["Shift+Tab"],
    activate: ["Enter", "Space"],
    escape: ["Escape"],
  },
  // Vim-style navigation (for power users)
  vim: {
    up: ["k", "ArrowUp"],
    down: ["j", "ArrowDown"],
    left: ["h", "ArrowLeft"],
    right: ["l", "ArrowRight"],
  },
  // Modal/Dialog controls
  modal: {
    close: ["Escape", "Meta+w"],
    confirm: ["Enter", "Meta+Enter"],
    cancel: ["Escape"],
  },
} as const;

// Animation Presets for InternetFriends
export const AnimationPresets = {
  // Glass morphism transitions
  glassTransition: {
    duration: 300,
    easing: "cubic-bezier(0.4, 0, 0.2, 1)",
  },
  
  // Micro-interactions
  microInteraction: {
    duration: 150,
    easing: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
  },
  
  // Page transitions
  pageTransition: {
    duration: 500,
    easing: "cubic-bezier(0.33, 1, 0.68, 1)",
  },
  
  // Focus indicators (dashed borders like Mermaid viewer)
  focusIndicator: {
    duration: 200,
    borderStyle: "2px dashed var(--color-border-focus)",
    easing: "ease-in-out",
  },
} as const;

// Responsive Breakpoints
export const Breakpoints = {
  mobile: "375px",
  tablet: "768px", 
  desktop: "1024px",
  wide: "1440px",
  ultrawide: "1920px",
} as const;

// Component State Patterns
export const ComponentStates = {
  // Interactive states
  interactive: {
    idle: "opacity-100 transform-none",
    hover: "opacity-90 transform-scale-105",
    active: "opacity-80 transform-scale-95",
    focus: "ring-2 ring-if-primary ring-offset-2",
    disabled: "opacity-50 cursor-not-allowed",
  },
  
  // Loading states
  loading: {
    skeleton: "animate-pulse bg-gray-200",
    spinner: "animate-spin",
    shimmer: "animate-shimmer bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200",
  },
  
  // Validation states
  validation: {
    success: "border-green-500 text-green-700",
    error: "border-red-500 text-red-700",
    warning: "border-yellow-500 text-yellow-700",
  },
} as const;
