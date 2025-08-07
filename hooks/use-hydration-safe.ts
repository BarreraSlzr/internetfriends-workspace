"use client";

import { useEffect, useState } from "react";

/**
 * Hook to safely handle hydration mismatches by ensuring consistent server/client rendering
 *
 * @param serverFallback - The fallback content to show during SSR and before hydration
 * @param clientContent - The actual content to show after hydration
 * @returns The appropriate content based on hydration state
 */
export function useHydrationSafe<T>(serverFallback: T, clientContent: T): T {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, [] // eslint-disable-line react-hooks/exhaustive-deps);

  return isHydrated ? clientContent : serverFallback;
}

/**
 * Hook that returns whether the component has been hydrated on the client
 * Useful for conditional rendering to avoid hydration mismatches
 *
 * @returns boolean indicating if the component is hydrated
 */
export function useIsHydrated(): boolean {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, [] // eslint-disable-line react-hooks/exhaustive-deps);

  return isHydrated;
}

/**
 * Hook that safely renders different content on server vs client
 * while avoiding hydration mismatches
 *
 * @param clientOnlyContent - Content that should only render on client
 * @param fallback - Fallback content for server and pre-hydration
 * @returns JSX element or null
 */
export function useClientOnly<T>(
  clientOnlyContent: () => T,
  fallback: T | null = null
): T | null {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, [] // eslint-disable-line react-hooks/exhaustive-deps);

  return isMounted ? clientOnlyContent() : fallback;
}

/**
 * Hook for components that need to access window/document APIs safely
 * Returns true only when running in browser environment after hydration
 *
 * @returns boolean indicating if browser APIs are safe to use
 */
export function useBrowserSafe(): boolean {
  const [isBrowser, setIsBrowser] = useState(false);

  useEffect(() => {
    setIsBrowser(typeof window !== 'undefined');
  }, [] // eslint-disable-line react-hooks/exhaustive-deps);

  return isBrowser;
}

/**
 * Hook that provides both hydration state and browser safety checks
 * Useful for components that need to handle both concerns
 *
 * @returns object with hydration and browser state flags
 */
export function useHydrationAndBrowser() {
  const [state, setState] = useState({
    isHydrated: false,
    isBrowser: false,
    isReady: false
  });

  useEffect(() => {
    setState({
      isHydrated: true,
      isBrowser: typeof window !== 'undefined',
      isReady: true
    });
  }, []);

  return state;
}

/**
 * Hook for handling theme-related hydration issues specifically
 * Returns safe theme state that won't cause hydration mismatches
 *
 * @param getCurrentTheme - Function to get current theme
 * @param fallbackTheme - Fallback theme for server rendering
 * @returns Safe theme state
 */
export function useThemeHydrationSafe<T>(
  getCurrentTheme: () => T,
  fallbackTheme: T
): { theme: T; isThemeReady: boolean } {
  const [themeState, setThemeState] = useState({
    theme: fallbackTheme,
    isThemeReady: false
  });

  useEffect(() => {
    setThemeState({
      theme: getCurrentTheme(),
      isThemeReady: true
    });
  }, [getCurrentTheme]);

  return themeState;
}

/**
 * Hook that prevents hydration mismatches for components with dynamic content
 * Uses a two-phase rendering approach: placeholder -> actual content
 *
 * @param placeholder - Static placeholder for consistent SSR
 * @param getDynamicContent - Function that returns dynamic content
 * @returns The appropriate content based on hydration phase
 */
export function useDynamicHydrationSafe<T>(
  placeholder: T,
  getDynamicContent: () => T
): T {
  const [content, setContent] = useState(placeholder);

  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM is ready
    requestAnimationFrame(() => {
      setContent(getDynamicContent());
    });
  }, [getDynamicContent]);

  return content;
}

/**
 * Hook for suppressing hydration warnings on specific elements
 * Use sparingly and only when you're certain the mismatch is intentional
 *
 * @returns Props object with suppressHydrationWarning flag
 */
export function useHydrationWarningSuppress() {
  return {
    suppressHydrationWarning: true
  };
}
