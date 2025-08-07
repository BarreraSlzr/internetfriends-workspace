// InternetFriends Custom Hooks
// Centralized exports for all custom React hooks

// Theme hooks
export { useTheme } from './use-theme';
export { useColorScheme } from './use-color-scheme';
export { useMediaQuery } from './use-media-query';

// UI hooks
export { useToggle } from './use-toggle';
export { useLocalStorage } from './use-local-storage';
export { useDebounce } from './use-debounce';
export { useClickOutside } from './use-click-outside';
export { useKeyPress } from './use-key-press';
export { useCopyToClipboard } from './use-copy-to-clipboard';

// Scroll hooks
export { useScroll } from './use-scroll';
export { useScrollPosition } from './use-scroll-position';
export { useIntersectionObserver } from './use-intersection-observer';

// Form hooks
export { useForm } from './use-form';
export { useFormField } from './use-form-field';
export { useValidation } from './use-validation';

// Animation hooks
export { useAnimation } from './use-animation';
export { useReducedMotion } from './use-reduced-motion';
export { useStagger } from './use-stagger';

// Network hooks
export { useFetch } from './use-fetch';
export { useApi } from './use-api';
export { useWebSocket } from './use-websocket';

// Performance hooks
export { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
export { useEventListener } from './use-event-listener';
export { useMountedState } from './use-mounted-state';
export { useUpdateEffect } from './use-update-effect';

// Business logic hooks
export { useContactForm } from './use-contact-form';
export { useNewsletter } from './use-newsletter';
export { useAnalytics } from './use-analytics';
export { usePortfolio } from './use-portfolio';

// Export hook types
export type {
  UseThemeReturn,
  UseColorSchemeReturn,
  UseMediaQueryReturn,
  UseToggleReturn,
  UseLocalStorageReturn,
  UseDebounceReturn,
  UseScrollReturn,
  UseScrollPositionReturn,
  UseIntersectionObserverReturn,
  UseFormReturn,
  UseFormFieldReturn,
  UseValidationReturn,
  UseAnimationReturn,
  UseFetchReturn,
  UseApiReturn,
  UseContactFormReturn,
  UseNewsletterReturn,
  UseAnalyticsReturn,
  UsePortfolioReturn,
} from './types';

// Common hook utilities
export const HOOK_DEFAULTS = {
  // Debounce delay
  debounceDelay: 300,

  // Throttle delay
  throttleDelay: 100,

  // Intersection observer threshold
  intersectionThreshold: 0.1,

  // Local storage key prefix
  storagePrefix: 'if_',

  // API request timeout
  apiTimeout: 10000,

  // Animation duration
  animationDuration: 300,

  // Scroll debounce
  scrollDebounce: 10,
} as const;

// Hook error types
export class HookError extends Error {
  constructor(
    message: string,
    public readonly hook: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'HookError';
  }
}

// Hook utilities
export const createHookError = (hook: string, message: string, code?: string) => {
  return new HookError(message, hook, code);
};

// Common hook patterns
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T
): T => {
  const ref = React.useRef<T>(callback);

  React.useLayoutEffect(() => {
    ref.current = callback;
  });

  return React.useMemo(
    () =>
      ((...args: any[]) => {
        return ref.current(...args);
      }) as T,
    []
  );
};

export const useConstant = <T>(fn: () => T): T => {
  const ref = React.useRef<{ value: T }>();

  if (!ref.current) {
    ref.current = { value: fn() };
  }

  return ref.current.value;
};

// Hook composition utilities
export const composeHooks = <T extends Record<string, any>>(
  ...hooks: Array<() => Partial<T>>
): (() => T) => {
  return () => {
    const results = hooks.map(hook => hook());
    return Object.assign({}, ...results) as T;
  };
};

// Hook testing utilities (for development)
export const createMockHook = <T>(mockValue: T) => {
  return () => mockValue;
};

// Re-export React hooks for convenience
export {
  useState,
  useEffect,
  useLayoutEffect,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  useRef,
  useImperativeHandle,
  useDebugValue,
  useDeferredValue,
  useId,
  useInsertionEffect,
  useSyncExternalStore,
  useTransition,
  startTransition,
} from 'react';
