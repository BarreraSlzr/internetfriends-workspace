"use client";

// InternetFriends Theme Hook
// Comprehensive theme management with system preference detection and persistence

import React, {
  useState,
  useEffect,
  useCallback,
  useContext,
  createContext,
} from "react";
// Simplified types for basic functionality
type ThemeMode = "light" | "dark" | "system";
type ColorScheme = "light" | "dark";

interface ThemeConfig {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  transitionDuration: string;
  enableTransitions: boolean;
}

interface UseThemeReturn {
  theme: ThemeConfig;
  tokens: Record<string, unknown>;
  components: Record<string, unknown>;
  setTheme: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  getColor: (property: string) => string;
  isDark: boolean;
  isLight: boolean;
  systemPreference: ColorScheme;
  mounted: boolean;
}

const HOOK_DEFAULTS = {
  storagePrefix: "if_",
};

class HookError extends Error {
  constructor(
    message: string,
    public readonly hook: string,
    public readonly code?: string,
  ) {
    super(message);
    this.name = "HookError";
  }
}

const createHookError = (hook: string, message: string, code?: string) => {
  return new HookError(message, hook, code);
};

// Theme context
const ThemeContext = createContext<UseThemeReturn | null>(null);

// Storage key for theme persistence
const STORAGE_KEY = `${HOOK_DEFAULTS.storagePrefix}theme`;

// Media query for system dark mode preference
const DARK_MODE_QUERY = "(prefers-color-scheme: dark)";

// Utility to get system color scheme
const getSystemColorScheme = (): ColorScheme => {
  if (typeof window === "undefined") return "light";

  try {
    return window.matchMedia(DARK_MODE_QUERY).matches ? "dark" : "light";
  } catch {
    return "light";
  }
};

// Utility to resolve theme mode to color scheme
const resolveColorScheme = (
  mode: ThemeMode,
  systemScheme: ColorScheme,
): ColorScheme => {
  if (mode === "system") return systemScheme;
  return mode;
};

// Utility to get stored theme
const getStoredTheme = (): ThemeMode => {
  if (typeof window === "undefined") return "system";

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && ["light", "dark", "system"].includes(stored)) {
      return stored as ThemeMode;
    }
  } catch (error) {
    console.warn("Failed to read theme from localStorage:", error);
  }

  return "system";
};

// Utility to store theme
const storeTheme = (mode: ThemeMode): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEY, mode);
  } catch (error) {
    console.warn("Failed to store theme in localStorage:", error);
  }
};

// Utility to apply theme to document
const applyThemeToDocument = (colorScheme: ColorScheme): void => {
  if (typeof document === "undefined") return;

  try {
    // Update data attribute
    document.documentElement.setAttribute("data-theme", colorScheme);

    // Update class for compatibility
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(colorScheme);

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      const color = colorScheme === "dark" ? "#111827" : "#ffffff";
      metaThemeColor.setAttribute("content", color);
    }
  } catch (error) {
    console.warn("Failed to apply theme to document:", error);
  }
};

// Theme provider component
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [themeMode, setThemeMode] = useState<ThemeMode>("system");
  const [systemColorScheme, setSystemColorScheme] =
    useState<ColorScheme>("light");
  const [mounted, setMounted] = useState(false);

  // Initialize theme on mount
  useEffect(() => {
    const storedTheme = getStoredTheme();
    const systemScheme = getSystemColorScheme();

    setThemeMode(storedTheme);
    setSystemColorScheme(systemScheme);
    setMounted(true);

    // Apply initial theme
    const resolvedScheme = resolveColorScheme(storedTheme, systemScheme);
    applyThemeToDocument(resolvedScheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(DARK_MODE_QUERY);

    const handleChange = (e: MediaQueryListEvent) => {
      const newSystemScheme = e.matches ? "dark" : "light";
      setSystemColorScheme(newSystemScheme);

      // Apply theme if in system mode
      if (themeMode === "system") {
        applyThemeToDocument(newSystemScheme);
      }
    };

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
      return () => mediaQuery.removeEventListener("change", handleChange);
    }
    // Legacy browsers
    else if (mediaQuery.addListener) {
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [themeMode]);

  // Apply theme when mode changes
  useEffect(() => {
    if (!mounted) return;

    const resolvedScheme = resolveColorScheme(themeMode, systemColorScheme);
    applyThemeToDocument(resolvedScheme);
  }, [themeMode, systemColorScheme, mounted]);

  // Set theme mode
  const setTheme = useCallback(
    (mode: ThemeMode) => {
      try {
        setThemeMode(mode);
        storeTheme(mode);

        // Immediately apply theme
        const resolvedScheme = resolveColorScheme(mode, systemColorScheme);
        applyThemeToDocument(resolvedScheme);
      } catch (error) {
        throw createHookError(
          "useTheme",
          `Failed to set theme: ${error}`,
          "SET_THEME_ERROR",
        );
      }
    },
    [systemColorScheme],
  );

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    const currentScheme = resolveColorScheme(themeMode, systemColorScheme);
    const newMode = currentScheme === "light" ? "dark" : "light";
    setTheme(newMode);
  }, [themeMode, systemColorScheme, setTheme]);

  // Get color value from CSS custom properties
  const getColor = useCallback((property: string): string => {
    if (typeof window === "undefined") return "";

    try {
      const value = getComputedStyle(document.documentElement)
        .getPropertyValue(`--${property}`)
        .trim();

      return value || "";
    } catch (error) {
      console.warn(`Failed to get color property --${property}:`, error);
      return "";
    }
  }, []);

  // Computed values
  const resolvedColorScheme = resolveColorScheme(themeMode, systemColorScheme);
  const isDark = resolvedColorScheme === "dark";
  const isLight = resolvedColorScheme === "light";

  // Theme configuration
  const theme: ThemeConfig = {
    mode: themeMode,
    colorScheme: resolvedColorScheme,
    transitionDuration: "300ms",
    enableTransitions: true,
  };

  const contextValue: UseThemeReturn = {
    theme,
    tokens: {},
    components: {},
    setTheme,
    toggleTheme,
    getColor,
    isDark,
    isLight,
    systemPreference: systemColorScheme,
    mounted,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Theme hook
export const useTheme = (): UseThemeReturn => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw createHookError(
      "useTheme",
      "useTheme must be used within a ThemeProvider",
      "MISSING_PROVIDER",
    );
  }

  return context;
};

// Hook for color scheme only
export const useColorScheme = () => {
  const { theme, isDark, isLight, systemPreference } = useTheme();

  return {
    colorScheme: theme.colorScheme,
    isDark,
    isLight,
    systemPreference,
  };
};

// Hook for theme-aware class names
export const useThemeClassName = (
  baseClassName: string,
  variants?: Record<string, boolean>,
) => {
  const { isDark, isLight } = useTheme();

  return useCallback(
    (additionalClasses?: string) => {
      const classes = [baseClassName];

      // Add theme-specific classes
      if (isDark) classes.push(`${baseClassName}--dark`);
      if (isLight) classes.push(`${baseClassName}--light`);

      // Add variant classes
      if (variants) {
        Object.entries(variants).forEach(([variant, active]) => {
          if (active) {
            classes.push(`${baseClassName}--${variant}`);
          }
        });
      }

      // Add additional classes
      if (additionalClasses) {
        classes.push(additionalClasses);
      }

      return classes.join(" ");
    },
    [baseClassName, isDark, isLight, variants],
  );
};

// Hook for theme-aware CSS custom properties
export const useThemeStyles = () => {
  const { getColor, theme } = useTheme();

  return {
    getColor,
    getCSSProperty: (property: string) => `var(--${property})`,
    createThemeAwareStyle: (lightValue: string, darkValue: string) => {
      return theme.colorScheme === "dark" ? darkValue : lightValue;
    },
  };
};

// Export theme utilities
export const themeUtils = {
  getSystemColorScheme,
  resolveColorScheme,
  applyThemeToDocument,
  STORAGE_KEY,
  DARK_MODE_QUERY,
};
