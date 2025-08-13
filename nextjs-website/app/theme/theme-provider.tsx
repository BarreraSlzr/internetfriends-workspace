import { generateStamp } from "@/lib/utils/timestamp";
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
import {
  initThemeSystem,
  isThemeInitialized,
  getThemeState,
  type ThemeInitOptions,
} from "./runtime/theme_init";
import {
  getCurrentAccentPreset,
  type AccentPreset,
} from "./runtime/accent_cycle";
import { type AccentMetrics } from "./runtime/accent_engine";

// =================================================================
// THEME CONTEXT INTERFACE
// =================================================================

export interface ThemeContextValue {
  // State
  isInitialized: boolean;
  isHydrated: boolean;
  currentAccent: AccentPreset | null;
  accentMetrics: AccentMetrics | null;
  errors: string[];

  // Theme controls
  isDarkMode: boolean;
  systemPrefersDark: boolean;

  // Actions
  toggleDarkMode: () => void;
  setDarkMode: (enabled: boolean) => void;
  reinitializeTheme: () => Promise<void>;

  // Debug utilities (development only)
  debug: {
    logThemeState: () => void;
    forceReinitialize: () => Promise<void>;
    previewAccent: (hex: string) => void;
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

  // Theme configuration
  enableAccentCycling?: boolean;
  enableDarkMode?: boolean;
  logoSelector?: string;

  // Development options
  debugMode?: boolean;

  // Event handlers
  onThemeInitialized?: (metrics: AccentMetrics) => void;
  onAccentChange?: (preset: AccentPreset, metrics: AccentMetrics) => void;
  onThemeError?: (error: string) => void;
}

export function ThemeProvider({
  children,
  enableAccentCycling = true,

  logoSelector = '[href="/"], .logo, [data-logo]',
  debugMode = process.env.NODE_ENV === "development",
  onThemeInitialized,
  onAccentChange,
  onThemeError,
}: ThemeProviderProps) {
  // =================================================================
  // STATE MANAGEMENT
  // =================================================================

  const [isInitialized, setIsInitialized] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const [currentAccent, setCurrentAccent] = useState<AccentPreset | null>(null);
  const [accentMetrics, setAccentMetrics] = useState<AccentMetrics | null>(
    null,
  );
  const [errors, setErrors] = useState<string[]>([]);

  // Dark mode state
  const [isDarkMode, setIsDarkModeState] = useState(false);
  const [systemPrefersDark, setSystemPrefersDark] = useState(false);

  // =================================================================
  // THEME INITIALIZATION
  // =================================================================

  useEffect(() => {
    let mounted = true;

    async function initialize() {
      try {
        if (debugMode) {
          console.log("🎨 ThemeProvider: Initializing...");
        }

        // Check if already initialized (prevents double init)
        if (isThemeInitialized()) {
          const themeState = getThemeState();
          setIsInitialized(themeState.isInitialized);
          setIsHydrated(themeState.isHydrated);
          setAccentMetrics(themeState.accentMetrics);
          setErrors(themeState.errors);

          const preset = getCurrentAccentPreset();
          setCurrentAccent(preset);

          return;
        }

        // Initialize theme system
        const initOptions: ThemeInitOptions = {
          enableAccentCycling,
          logoSelector,
          debugMode,
          onInitComplete: (metrics) => {
            if (!mounted) return;

            setAccentMetrics(metrics);
            setIsInitialized(true);
            setIsHydrated(true);

            const preset = getCurrentAccentPreset();
            setCurrentAccent(preset);

            onThemeInitialized?.(metrics);

            if (debugMode) {
              console.log("🎨 ThemeProvider: Initialization complete");
            }
          },
          onError: (error) => {
            if (!mounted) return;

            setErrors((prev) => [...prev, error]);
            onThemeError?.(error);

            console.error("🎨 ThemeProvider: Initialization error:", error);
          },
        };

        await initThemeSystem(initOptions);
      } catch (error) {
        if (!mounted) return;

        const errorMessage =
          error instanceof Error
            ? error.message
            : "Unknown initialization error";
        setErrors((prev) => [...prev, errorMessage]);
        onThemeError?.(errorMessage);

        console.error("🎨 ThemeProvider: Fatal initialization error:", error);
      }
    }

    initialize();

    return () => {
      mounted = false;
    };
  }, [
    enableAccentCycling,
    logoSelector,
    debugMode,
    onThemeInitialized,
    onThemeError,
  ]);

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
  // ACCENT CHANGE LISTENER
  // =================================================================

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleAccentChange = (event: Event) => {
      const customEvent = event as CustomEvent;
      const { preset, metrics } = customEvent.detail;

      setCurrentAccent(preset);
      setAccentMetrics(metrics);
      onAccentChange?.(preset, metrics);

      if (debugMode) {
        console.log("🎨 ThemeProvider: Accent changed to", preset.name);
      }
    };

    window.addEventListener("accentChange", handleAccentChange);
    return () => window.removeEventListener("accentChange", handleAccentChange);
  }, [onAccentChange, debugMode]);

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

      const initOptions: ThemeInitOptions = {
        enableAccentCycling,
        logoSelector,
        debugMode,
        onInitComplete: (metrics) => {
          setAccentMetrics(metrics);
          setIsInitialized(true);
          setIsHydrated(true);

          const preset = getCurrentAccentPreset();
          setCurrentAccent(preset);
        },
        onError: (error) => {
          setErrors((prev) => [...prev, error]);
          onThemeError?.(error);
        },
      };

      await initThemeSystem(initOptions);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Reinitialize failed";
      setErrors((prev) => [...prev, errorMessage]);
      onThemeError?.(errorMessage);
    }
  }, [enableAccentCycling, logoSelector, debugMode, onThemeError]);

  // =================================================================
  // DEBUG UTILITIES
  // =================================================================

  const debug = React.useMemo(
    () => ({
      logThemeState: () => {
        console.group("🎨 Theme Provider State");
        console.log("Initialized:", isInitialized);
        console.log("Hydrated:", isHydrated);
        console.log("Current accent:", currentAccent?.name || "None");
        console.log("Dark mode:", isDarkMode);
        console.log("System prefers dark:", systemPrefersDark);
        console.log("Errors:", errors);
        console.log("Metrics:", accentMetrics);
        console.groupEnd();
      },

      forceReinitialize: async () => {
        console.warn("🔄 Force reinitializing theme system...");
        await reinitializeTheme();
      },

      previewAccent: (hex: string) => {
        console.log("🎨 Preview accent:", hex);
        // Implementation would temporarily apply accent without saving
        console.log("Preview feature coming in future update");
      },
    }),
    [
      isInitialized,
      isHydrated,
      currentAccent,
      isDarkMode,
      systemPrefersDark,
      errors,
      accentMetrics,
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
      currentAccent,
      accentMetrics,
      errors,

      // Theme controls
      isDarkMode,
      systemPrefersDark,

      // Actions
      toggleDarkMode,
      setDarkMode,
      reinitializeTheme,

      // Debug utilities
      debug,
    }),
    [
      isInitialized,
      isHydrated,
      currentAccent,
      accentMetrics,
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
 * Hook for accessing only accent-related functionality
 */
export function useAccent() {
  const { currentAccent, accentMetrics, isInitialized } = useTheme();
  return { currentAccent, accentMetrics, isInitialized };
}

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
