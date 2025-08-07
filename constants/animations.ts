// InternetFriends Animation System Constants
// CSS-first animations with reduced motion support

// Animation durations
export const DURATIONS = {
  instant: '0ms',
  fast: '150ms',
  normal: '300ms',
  slow: '500ms',
  slower: '750ms',
  slowest: '1000ms',
} as const;

// Animation easings (CSS cubic-bezier functions)
export const EASINGS = {
  linear: 'linear',
  easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
  easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
  easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',

  // Custom InternetFriends easings
  bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  smooth: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  sharp: 'cubic-bezier(0.55, 0.085, 0.68, 0.53)',

  // Glass morphism specific
  glass: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
} as const;

// Transition properties for common animations
export const TRANSITIONS = {
  // Basic transitions
  default: `all ${DURATIONS.normal} ${EASINGS.easeInOut}`,
  fast: `all ${DURATIONS.fast} ${EASINGS.easeOut}`,
  slow: `all ${DURATIONS.slow} ${EASINGS.smooth}`,

  // Specific property transitions
  color: `color ${DURATIONS.fast} ${EASINGS.easeOut}`,
  background: `background-color ${DURATIONS.normal} ${EASINGS.easeOut}`,
  border: `border-color ${DURATIONS.fast} ${EASINGS.easeOut}`,
  shadow: `box-shadow ${DURATIONS.normal} ${EASINGS.easeOut}`,
  transform: `transform ${DURATIONS.normal} ${EASINGS.easeOut}`,
  opacity: `opacity ${DURATIONS.fast} ${EASINGS.easeOut}`,

  // Glass morphism transitions
  glass: `backdrop-filter ${DURATIONS.normal} ${EASINGS.glass}, background-color ${DURATIONS.normal} ${EASINGS.glass}`,

  // Interactive element transitions
  button: `all ${DURATIONS.fast} ${EASINGS.easeOut}`,
  input: `border-color ${DURATIONS.fast} ${EASINGS.easeOut}, box-shadow ${DURATIONS.fast} ${EASINGS.easeOut}`,
  link: `color ${DURATIONS.fast} ${EASINGS.easeOut}`,

  // Layout transitions
  height: `height ${DURATIONS.normal} ${EASINGS.easeInOut}`,
  width: `width ${DURATIONS.normal} ${EASINGS.easeInOut}`,
  margin: `margin ${DURATIONS.normal} ${EASINGS.easeInOut}`,
  padding: `padding ${DURATIONS.normal} ${EASINGS.easeInOut}`,
} as const;

// Keyframe animations
export const KEYFRAMES = {
  // Fade animations
  fadeIn: {
    name: 'fadeIn',
    keyframes: `
      from { opacity: 0; }
      to { opacity: 1; }
    `,
  },
  fadeOut: {
    name: 'fadeOut',
    keyframes: `
      from { opacity: 1; }
      to { opacity: 0; }
    `,
  },

  // Slide animations
  slideInFromTop: {
    name: 'slideInFromTop',
    keyframes: `
      from {
        opacity: 0;
        transform: translateY(-1rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    `,
  },
  slideInFromBottom: {
    name: 'slideInFromBottom',
    keyframes: `
      from {
        opacity: 0;
        transform: translateY(1rem);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    `,
  },
  slideInFromLeft: {
    name: 'slideInFromLeft',
    keyframes: `
      from {
        opacity: 0;
        transform: translateX(-1rem);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    `,
  },
  slideInFromRight: {
    name: 'slideInFromRight',
    keyframes: `
      from {
        opacity: 0;
        transform: translateX(1rem);
      }
      to {
        opacity: 1;
        transform: translateX(0);
      }
    `,
  },

  // Scale animations
  scaleIn: {
    name: 'scaleIn',
    keyframes: `
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    `,
  },
  scaleOut: {
    name: 'scaleOut',
    keyframes: `
      from {
        opacity: 1;
        transform: scale(1);
      }
      to {
        opacity: 0;
        transform: scale(0.95);
      }
    `,
  },

  // Glass morphism specific animations
  glassBlur: {
    name: 'glassBlur',
    keyframes: `
      from {
        backdrop-filter: blur(0px);
        background-color: rgba(255, 255, 255, 0);
      }
      to {
        backdrop-filter: blur(12px);
        background-color: var(--glass-bg-header);
      }
    `,
  },

  // Loading animations
  pulse: {
    name: 'pulse',
    keyframes: `
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    `,
  },
  spin: {
    name: 'spin',
    keyframes: `
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    `,
  },
  bounce: {
    name: 'bounce',
    keyframes: `
      0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0, 0, 0);
      }
      40%, 43% {
        transform: translate3d(0, -30px, 0);
      }
      70% {
        transform: translate3d(0, -15px, 0);
      }
      90% {
        transform: translate3d(0, -4px, 0);
      }
    `,
  },

  // Focus ring animation (Mermaid viewer style)
  focusRing: {
    name: 'focusRing',
    keyframes: `
      0% {
        box-shadow: 0 0 0 0 var(--color-border-focus);
      }
      100% {
        box-shadow: 0 0 0 2px var(--color-border-focus);
      }
    `,
  },
} as const;

// Pre-built animation configurations
export const ANIMATIONS = {
  // Entrance animations
  entrance: {
    fadeIn: `${KEYFRAMES.fadeIn.name} ${DURATIONS.normal} ${EASINGS.easeOut} forwards`,
    slideInFromTop: `${KEYFRAMES.slideInFromTop.name} ${DURATIONS.normal} ${EASINGS.easeOut} forwards`,
    slideInFromBottom: `${KEYFRAMES.slideInFromBottom.name} ${DURATIONS.normal} ${EASINGS.easeOut} forwards`,
    slideInFromLeft: `${KEYFRAMES.slideInFromLeft.name} ${DURATIONS.normal} ${EASINGS.easeOut} forwards`,
    slideInFromRight: `${KEYFRAMES.slideInFromRight.name} ${DURATIONS.normal} ${EASINGS.easeOut} forwards`,
    scaleIn: `${KEYFRAMES.scaleIn.name} ${DURATIONS.normal} ${EASINGS.bounce} forwards`,
  },

  // Exit animations
  exit: {
    fadeOut: `${KEYFRAMES.fadeOut.name} ${DURATIONS.fast} ${EASINGS.easeIn} forwards`,
    scaleOut: `${KEYFRAMES.scaleOut.name} ${DURATIONS.fast} ${EASINGS.easeIn} forwards`,
  },

  // Loading animations
  loading: {
    pulse: `${KEYFRAMES.pulse.name} ${DURATIONS.slow} ${EASINGS.easeInOut} infinite`,
    spin: `${KEYFRAMES.spin.name} ${DURATIONS.slowest} ${EASINGS.linear} infinite`,
    bounce: `${KEYFRAMES.bounce.name} ${DURATIONS.slowest} ${EASINGS.easeInOut} infinite`,
  },

  // Interactive animations
  interactive: {
    focusRing: `${KEYFRAMES.focusRing.name} ${DURATIONS.fast} ${EASINGS.easeOut} forwards`,
    glassBlur: `${KEYFRAMES.glassBlur.name} ${DURATIONS.normal} ${EASINGS.glass} forwards`,
  },
} as const;

// Animation utilities for JavaScript
export const ANIMATION_UTILS = {
  // Parse duration to milliseconds
  getDurationMs: (duration: keyof typeof DURATIONS): number => {
    return parseInt(DURATIONS[duration]);
  },

  // Get animation delay based on index (for staggered animations)
  getStaggerDelay: (index: number, baseDelay: number = 100): string => {
    return `${index * baseDelay}ms`;
  },

  // Create staggered animation
  createStagger: (
    animation: string,
    itemCount: number,
    staggerDelay: number = 100
  ): string[] => {
    return Array.from({ length: itemCount }, (_, index) =>
      `${animation} ${ANIMATION_UTILS.getStaggerDelay(index, staggerDelay)}`
    );
  },
} as const;

// Reduced motion preferences
export const REDUCED_MOTION = {
  // Fallback styles for users who prefer reduced motion
  transitions: {
    none: 'none',
    instant: `all ${DURATIONS.instant} ${EASINGS.linear}`,
  },

  // Safe animations that respect reduced motion
  safeAnimations: {
    opacity: `opacity ${DURATIONS.fast} ${EASINGS.easeOut}`,
    color: `color ${DURATIONS.fast} ${EASINGS.easeOut}`,
  },
} as const;

// CSS custom property names for animations
export const ANIMATION_CSS_VARS = {
  duration: '--animation-duration',
  easing: '--animation-easing',
  delay: '--animation-delay',
  fillMode: '--animation-fill-mode',
} as const;

// Type definitions
export type Duration = keyof typeof DURATIONS;
export type Easing = keyof typeof EASINGS;
export type Transition = keyof typeof TRANSITIONS;
export type KeyframeName = keyof typeof KEYFRAMES;
export type AnimationType = keyof typeof ANIMATIONS;

// Export all animation constants
export const _ANIMATION_CONSTANTS = {
  durations: DURATIONS,
  easings: EASINGS,
  transitions: TRANSITIONS,
  keyframes: KEYFRAMES,
  animations: ANIMATIONS,
  utils: ANIMATION_UTILS,
  reducedMotion: REDUCED_MOTION,
  cssVars: ANIMATION_CSS_VARS,
} as const;
