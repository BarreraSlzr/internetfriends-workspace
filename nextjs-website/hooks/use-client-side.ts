"use client";

import { useEffect, useState } from "react";

/**
 * Hook to safely detect client-side rendering and prevent hydration mismatches
 *
 * This hook ensures that server-side rendering returns consistent values
 * while allowing client-side specific features after hydration is complete.
 *
 * @returns Object with client-side detection flags and media query states
 */
export function useClientSide() {
  const [isClient, setIsClient] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Mark as client-side
    setIsClient(true);

    // Helper functions
    const checkMobile = () => window.innerWidth < 768;
    const checkDarkMode = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches ||
      document.documentElement.getAttribute("data-theme") === "dark";
    const checkReducedMotion = () =>
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Set initial values
    setIsMobile(checkMobile());
    setIsDarkMode(checkDarkMode());
    setPrefersReducedMotion(checkReducedMotion());

    // Set up media query listeners
    const mobileQuery = window.matchMedia("(max-width: 767px)");
    const darkModeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    const handleMobileChange = (e: MediaQueryListEvent) =>
      setIsMobile(e.matches);
    const handleDarkModeChange = (e: MediaQueryListEvent) =>
      setIsDarkMode(e.matches);
    const handleReducedMotionChange = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);

    // Add listeners
    mobileQuery.addEventListener("change", handleMobileChange);
    darkModeQuery.addEventListener("change", handleDarkModeChange);
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    // Listen for theme changes on document
    const observer = new MutationObserver(() => {
      setIsDarkMode(checkDarkMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    // Cleanup
    return () => {
      mobileQuery.removeEventListener("change", handleMobileChange);
      darkModeQuery.removeEventListener("change", handleDarkModeChange);
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange,
      );
      observer.disconnect();
    };
  }, []);

  return {
    isClient,
    isMobile,
    isDarkMode,
    prefersReducedMotion,
  };
}

/**
 * Hook to safely get window dimensions without hydration mismatches
 */
export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    // Set initial size
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowSize;
}

/**
 * Hook to safely detect if user prefers dark mode
 * Returns false during SSR to prevent hydration mismatches
 */
export function useDarkMode() {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const checkDarkMode = () =>
      window.matchMedia("(prefers-color-scheme: dark)").matches ||
      document.documentElement.getAttribute("data-theme") === "dark";

    setIsDarkMode(checkDarkMode());

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => setIsDarkMode(e.matches);

    mediaQuery.addEventListener("change", handleChange);

    // Listen for theme changes on document
    const observer = new MutationObserver(() => {
      setIsDarkMode(checkDarkMode());
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => {
      mediaQuery.removeEventListener("change", handleChange);
      observer.disconnect();
    };
  }, []);

  return isDarkMode;
}

/**
 * Hook to safely detect mobile viewport
 * Returns false during SSR to prevent hydration mismatches
 */
export function useMobile(breakpoint: number = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => window.innerWidth < breakpoint;
    setIsMobile(checkMobile());

    const handleResize = () => setIsMobile(checkMobile());
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isMobile;
}
