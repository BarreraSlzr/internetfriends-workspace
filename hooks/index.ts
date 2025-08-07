// InternetFriends Custom Hooks
// Centralized exports for all custom React hooks

import React from "react";

// Theme hooks (currently implemented)
export { useTheme } from "./use-theme";

// Export hook types
export type { UseThemeReturn, UseColorSchemeReturn } from "../types/theme";

// Common hook utilities
export const _HOOK_DEFAULTS = {
  // Debounce delay
  debounceDelay: 300,

  // Throttle delay
  throttleDelay: 100,

  // Intersection observer threshold
  intersectionThreshold: 0.1,

  // Local storage key prefix
  storagePrefix: "if_",

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
    public readonly code?: string,
  ) {
    super(message);
    this.name = "HookError";
  }
}

// Hook utilities
export const _createHookError = (
  hook: string,
  message: string,
  code?: string,
) => {
  return new HookError(message, hook, code);
};

// Common hook patterns
export const _useStableCallback = <T extends (...args: unknown[]) => any>(
  callback: T,
): T => {
  const ref = React.useRef<T>(callback);

  React.useLayoutEffect(() => {
    ref.current = callback;
  });

  return React.useMemo(
    () =>
      ((...args: unknown[]) => {
        return ref.current(...args);
      }) as T,
    [],
  );
};

export const _useConstant = <T>(fn: () => T): T => {
  const ref = React.useRef<{ value: T } | undefined>(undefined);

  if (!ref.current) {
    ref.current = { value: fn() };
  }

  return ref.current.value;
};

// Hook composition utilities
export const _composeHooks = <T extends Record<string, unknown>>(
  ...hooks: Array<() => Partial<T>>
): (() => T) => {
  return () => {
    const results = hooks.map((hook) => hook());
    return Object.assign({}, ...results) as T;
  };
};

// Hook testing utilities (for development)
export const _createMockHook = <T>(mockValue: T) => {
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
} from "react";
