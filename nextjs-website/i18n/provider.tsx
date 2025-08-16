"use client";

import React, { useContext, useState, useEffect, useCallback } from "react";
import {
  I18nContext,
  type I18nContextType,
  type SupportedLocale,
  type Translations,
  DEFAULT_LOCALE,
  getDefaultLocale,
  getStoredLocale,
  storeLocale,
  loadTranslations,
  createTranslationFunction,
} from "./config";

export interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: SupportedLocale;
  initialTranslations?: Translations;
}

/**
 * InternetFriends I18n Provider
 * Provides internationalization context to the entire application
 * SSR-compatible with proper hydration handling
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({
  children,
  defaultLocale,
  initialTranslations,
}) => {
  // Use default locale for SSR, will be updated on client-side
  const [locale, setLocaleState] = useState<SupportedLocale>(
    defaultLocale || DEFAULT_LOCALE,
  );
  const [translations, setTranslations] = useState<Translations | null>(
    initialTranslations || null,
  );
  const [isLoading, setIsLoading] = useState(!initialTranslations);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Load translations for the current locale
  const loadLocaleTranslations = useCallback(
    async (targetLocale: SupportedLocale) => {
      try {
        setIsLoading(true);
        setError(null);

        const newTranslations = await loadTranslations(targetLocale);
        setTranslations(newTranslations);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load translations";
        console.error("Translation loading error:", err);
        setError(errorMessage);

        // Try to load default locale as fallback
        if (targetLocale !== DEFAULT_LOCALE) {
          try {
            const fallbackTranslations = await loadTranslations(DEFAULT_LOCALE);
            setTranslations(fallbackTranslations);
            setError(
              `Failed to load ${targetLocale} translations, using English as fallback`,
            );
          } catch (fallbackErr) {
            console.error("Fallback translation loading error:", fallbackErr);
          }
        }
      } finally {
        setIsLoading(false);
      }
    },
    [],
  );

  // Handle client-side hydration and locale initialization
  useEffect(() => {
    setIsClient(true);

    // Check for stored locale preference on client-side only
    const storedLocale = getStoredLocale();
    const browserLocale = getDefaultLocale();
    const initialLocale = defaultLocale || storedLocale || browserLocale;

    if (initialLocale !== locale) {
      setLocaleState(initialLocale);
    }

    // Load translations if not already loaded
    if (!translations) {
      loadLocaleTranslations(initialLocale);
    }
  }, []);

  // Load translations when locale changes (client-side only)
  useEffect(() => {
    if (isClient && !translations) {
      loadLocaleTranslations(locale);
    }
  }, [locale, translations, loadLocaleTranslations, isClient]);

  // Set locale and load new translations
  const setLocale = useCallback(
    async (newLocale: SupportedLocale) => {
      if (newLocale === locale) return;

      try {
        setLocaleState(newLocale);

        // Only store locale on client-side
        if (isClient) {
          storeLocale(newLocale);

          // Update document language
          if (typeof document !== "undefined") {
            document.documentElement.lang = newLocale;
          }
        }

        await loadLocaleTranslations(newLocale);
      } catch (err) {
        console.error("Locale change error:", err);
        setError("Failed to change language");
      }
    },
    [locale, loadLocaleTranslations, isClient],
  );

  // Create translation function
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      if (!translations) {
        console.warn("Translations not loaded yet, returning key:", key);
        return key;
      }

      const translateFn = createTranslationFunction(translations);
      return translateFn(key, params);
    },
    [translations],
  );

  // Format message (alias for t function for consistency)
  const formatMessage = useCallback(
    (key: string, params?: Record<string, string | number>) => {
      return t(key, params);
    },
    [t],
  );

  // Context value
  const contextValue: I18nContextType = {
    locale,
    translations: translations || ({} as Translations),
    setLocale,
    t,
    formatMessage,
    isLoading,
    error,
  };

  // Show loading state during SSR or when translations are loading
  if ((!isClient && !initialTranslations) || (isLoading && !translations)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">
            Loading translations...
          </p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !translations) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-6 max-w-md">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-lg font-semibold text-foreground mb-2">
            Translation Error
          </h2>
          <p className="text-sm text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <I18nContext.Provider value={contextValue}>{children}</I18nContext.Provider>
  );
};

/**
 * Hook to use i18n context
 */
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
}

/**
 * Hook to get only translation function (lighter than full context)
 */
export function useTranslation() {
  const { t, locale, isLoading } = useI18n();

  return {
    t,
    locale,
    isLoading,
  };
}

/**
 * Hook to get locale management functions
 */
export function useLocale() {
  const { locale, setLocale, isLoading, error } = useI18n();

  return {
    locale,
    setLocale,
    isLoading,
    error,
  };
}

/**
 * Higher-order component to wrap components with i18n
 */
export function withI18n<T extends object>(Component: React.ComponentType<T>) {
  const WrappedComponent = (props: T) => {
    return (
      <I18nProvider>
        <Component {...props} />
      </I18nProvider>
    );
  };

  WrappedComponent.displayName = `withI18n(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

export default I18nProvider;
