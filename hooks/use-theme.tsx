"use client";

/* InternetFriends Theme Provider */
/* React context and hooks for accent theming system */

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";

// =================================================================
// THEME CONTEXT INTERFACE
// =================================================================

export interface ThemeContextValue {
  // State
  isInitialized: boolean;
  isHydrated: boolean;
  isDarkMode: boolean;
  isDark: boolean; // Alias for isDarkMode
  systemPrefersDark: boolean;
  errors: string[];

  // Actions
  toggleDarkMode: () => void;
  toggleTheme: () => void; // Alias for toggleDarkMode
  setDarkMode: (enabled: boolean) => void;
  reinitializeTheme: () => Promise<void>;

  // Debug utilities (development only)
  debug: {
    logThemeState: () => void;
    forceReinitialize: () => Promise<void>;
  };
}

// =================================================================
// THEME CONTEXT CREATION
// =================================================================

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// =================================================================
// THEME PROVIDER COMPONENT
// =================================================================

export interface ThemeProviderProps {
  children: React.ReactNode;
  debugMode?: boolean;
  onThemeError?: (error: string) => void;
}

export function ThemeProvider({
  children,
  debugMode = process.env.NODE_ENV === "development",
  onThemeError,
}: ThemeProviderProps) {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);

  // Dark mode state
  const [isDarkMode, setIsDarkModeState] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // =================================================================
  // THEME INITIALIZATION
  // =================================================================

  useEffect(() => {
    setIsInitialized(true);
    setIsHydrated(true);
  }, []);

  // =================================================================
  // DARK MODE DETECTION
  // =================================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Detect system preference
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    setSystemPrefersDark(mediaQuery.matches);

    // Set initial dark mode state
    const savedTheme = localStorage.getItem("if-theme-mode");
    if (savedTheme) {
      setIsDarkModeState(savedTheme === "dark");
    } else {
      setIsDarkModeState(mediaQuery.matches);
    }

    // Listen for system changes
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPrefersDark(e.matches);

      // Only auto-switch if user hasn't manually set preference
      if (!localStorage.getItem("if-theme-mode")) {
        setIsDarkModeState(e.matches);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Apply dark mode to DOM
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.setAttribute("data-theme", "light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  // =================================================================
  // THEME CONTROL FUNCTIONS
  // =================================================================

  const toggleDarkMode = useCallback(() => {
    const newMode = !isDarkMode;
    setIsDarkModeState(newMode);
    localStorage.setItem("if-theme-mode", newMode ? "dark" : "light");

    if (debugMode) {
      console.log("🌙 ThemeProvider: Dark mode toggled to", newMode);
    }
  }, [isDarkMode, debugMode]);

  const setDarkMode = useCallback(
    (enabled: boolean) => {
      setIsDarkModeState(enabled);
      localStorage.setItem("if-theme-mode", enabled ? "dark" : "light");

      if (debugMode) {
        console.log("🌙 ThemeProvider: Dark mode set to", enabled);
      }
    },
    [debugMode],
  );

  const reinitializeTheme = useCallback(async () => {
    try {
      setIsInitialized(false);
      setErrors([]);
      setIsInitialized(true);
      setIsHydrated(true);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Reinitialize failed";
      setErrors((prev) => [...prev, errorMessage]);
      onThemeError?.(errorMessage);
    }
  }, [onThemeError]);

  // =================================================================
  // DEBUG UTILITIES
  // =================================================================

  const debug = React.useMemo(
    () => ({
      logThemeState: () => {
        console.group("🎨 Theme Provider State");
        console.log("Initialized:", isInitialized);
        console.log("Hydrated:", isHydrated);
        console.log("Dark mode:", isDarkMode);
        console.log("System prefers dark:", systemPrefersDark);
        console.log("Errors:", errors);
        console.groupEnd();
      },

      forceReinitialize: async () => {
        console.warn("🔄 Force reinitializing theme system...");
        await reinitializeTheme();
      },
    }),
    [
      isInitialized,
      isHydrated,
      isDarkMode,
      systemPrefersDark,
      errors,
      reinitializeTheme,
    ],
  );

  // =================================================================
  // CONTEXT VALUE
  // =================================================================

  const contextValue: ThemeContextValue = React.useMemo(
    () => ({
      // State
      isInitialized,
      isHydrated,
      errors,

      // Theme controls
      isDarkMode,
      isDark: isDarkMode, // Alias for compatibility
      systemPrefersDark,

      // Actions
      toggleDarkMode,
      toggleTheme: toggleDarkMode, // Alias for compatibility
      setDarkMode,
      reinitializeTheme,

      // Debug utilities
      debug,
    }),
    [
      isInitialized,
      isHydrated,
      errors,
      isDarkMode,
      systemPrefersDark,
      toggleDarkMode,
      setDarkMode,
      reinitializeTheme,
      debug,
    ],
  );

  // =================================================================
  // RENDER
  // =================================================================

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

// =================================================================
// ADDITIONAL HOOKS
// =================================================================

/**
 * Hook for accessing only dark mode functionality
 */
export function useDarkMode() {
  const { isDarkMode, systemPrefersDark, toggleDarkMode, setDarkMode } =
    useTheme();
  return { isDarkMode, systemPrefersDark, toggleDarkMode, setDarkMode };
}

/**
 * Hook for theme debugging (development only)
 */
export function useThemeDebug() {
  const { debug, errors, isInitialized, isHydrated } = useTheme();
  return { debug, errors, isInitialized, isHydrated };
}