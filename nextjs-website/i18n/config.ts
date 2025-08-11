"use client";

// InternetFriends Internationalization Configuration
// Complete i18n setup with context and utilities

import { createContext, useContext } from "react";

// Supported locales
export const LOCALES = {
  en: {
    code: "en",
    name: "English",
    flag: "🇺🇸",
    dir: "ltr" as const,
    default: true,
  },
  es: {
    code: "es",
    name: "Español",
    flag: "🇪🇸",
    dir: "ltr" as "ltr" | "rtl",
    default: false,
  },
  fr: {
    code: "fr",
    name: "Français",
    flag: "🇫🇷",
    dir: "ltr" as "ltr" | "rtl",
    default: false,
  },
} as const;

export type SupportedLocale = keyof typeof LOCALES;
export type LocaleConfig = (typeof LOCALES)[SupportedLocale];

// Default locale
export const DEFAULT_LOCALE: SupportedLocale = "en";

// Get default locale from browser or fallback
export function getDefaultLocale(): SupportedLocale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;

  try {
    const browserLocale = navigator.language.split("-")[0] as SupportedLocale;
    return LOCALES[browserLocale] ? browserLocale : DEFAULT_LOCALE;
  } catch {
    return DEFAULT_LOCALE;
  }
}

// Locale storage key
export const LOCALE_STORAGE_KEY = "if_locale";

// Get stored locale
export function getStoredLocale(): SupportedLocale | null {
  if (typeof window === "undefined") return null;

  try {
    const stored = localStorage.getItem(LOCALE_STORAGE_KEY);
    if (stored && Object.keys(LOCALES).includes(stored)) {
      return stored as SupportedLocale;
    }
  } catch {
    // Ignore localStorage errors
  }

  return null;
}

// Store locale
export function storeLocale(locale: SupportedLocale): void {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    // Ignore localStorage errors
  }
}

// Translation type (based on our JSON structure)
export interface Translations {
  navigation: {
    home: string;
    about: string;
    portfolio: string;
    projects: string;
    samples: string;
    curriculum: string;
    contact: string;
    pricing: string;
    blog: string;
    services: string;
  };
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    submit: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    close: string;
    back: string;
    next: string;
    previous: string;
    search: string;
    filter: string;
    sort: string;
    export: string;
    import: string;
    download: string;
    upload: string;
    copy: string;
    share: string;
    print: string;
  };
  buttons: {
    getStarted: string;
    learnMore: string;
    contactUs: string;
    viewPortfolio: string;
    downloadResume: string;
    hireMeNow: string;
    requestQuote: string;
    viewDemo: string;
    readMore: string;
    showLess: string;
  };
  forms: {
    name: string;
    email: string;
    phone: string;
    company: string;
    message: string;
    subject: string;
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    minLength: string;
    maxLength: string;
    sending: string;
    sent: string;
    sendError: string;
    firstName: string;
    lastName: string;
    website: string;
    budget: string;
    timeline: string;
    services: string;
  };
  hero: {
    title: string;
    subtitle: string;
    description: string;
    primaryCta: string;
    secondaryCta: string;
    videoCta: string;
  };
  about: {
    title: string;
    subtitle: string;
    description: string;
    mission: string;
    missionText: string;
    vision: string;
    visionText: string;
  };
  features: {
    title: string;
    subtitle: string;
    description: string;
    modernDevelopment: {
      title: string;
      description: string;
      features: string[];
    };
    designSystems: {
      title: string;
      description: string;
      features: string[];
    };
    performanceFirst: {
      title: string;
      description: string;
      features: string[];
    };
    securityReliability: {
      title: string;
      description: string;
      features: string[];
    };
    userExperience: {
      title: string;
      description: string;
      features: string[];
    };
    mobileOptimized: {
      title: string;
      description: string;
      features: string[];
    };
  };
  testimonials: {
    title: string;
    subtitle: string;
    description: string;
    viewAll: string;
  };
  contact: {
    title: string;
    subtitle: string;
    description: string;
    formTitle: string;
    formDescription: string;
    contactInfo: string;
    address: string;
    phone: string;
    email: string;
    hours: string;
    mondayFriday: string;
    weekend: string;
  };
  footer: {
    tagline: string;
    quickLinks: string;
    services: string;
    resources: string;
    legal: string;
    followUs: string;
    newsletter: string;
    newsletterDescription: string;
    emailPlaceholder: string;
    subscribe: string;
    copyright: string;
    privacyPolicy: string;
    termsOfService: string;
    cookiePolicy: string;
  };
  portfolio: {
    title: string;
    subtitle: string;
    description: string;
    allProjects: string;
    webDevelopment: string;
    mobileApps: string;
    ecommerce: string;
    designSystems: string;
    viewProject: string;
    liveDemo: string;
    sourceCode: string;
    caseStudy: string;
  };
  pricing: {
    title: string;
    subtitle: string;
    description: string;
    starter: string;
    professional: string;
    enterprise: string;
    custom: string;
    perMonth: string;
    perProject: string;
    getQuote: string;
    choosePlan: string;
    mostPopular: string;
    contactSales: string;
  };
  stats: {
    happyClients: string;
    projectsCompleted: string;
    yearsExperience: string;
    teamMembers: string;
    averageRating: string;
    uptime: string;
  };
  theme: {
    light: string;
    dark: string;
    system: string;
    toggleTheme: string;
  };
  language: {
    english: string;
    spanish: string;
    french: string;
    selectLanguage: string;
  };
  seo: {
    defaultTitle: string;
    defaultDescription: string;
    keywords: string;
  };
  accessibility: {
    skipToContent: string;
    openMenu: string;
    closeMenu: string;
    toggleMobileMenu: string;
    previousSlide: string;
    nextSlide: string;
    playPause: string;
    mute: string;
    fullscreen: string;
  };
  errors: {
    pageNotFound: string;
    pageNotFoundDescription: string;
    serverError: string;
    serverErrorDescription: string;
    networkError: string;
    networkErrorDescription: string;
    formValidation: string;
    fileUploadError: string;
    sessionExpired: string;
  };
  success: {
    messageSent: string;
    subscribed: string;
    updated: string;
    saved: string;
    uploaded: string;
  };
}

// I18n context interface
export interface I18nContextType {
  locale: SupportedLocale;
  translations: Translations;
  setLocale: (locale: SupportedLocale) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
  formatMessage: (
    key: string,
    params?: Record<string, string | number>,
  ) => string;
  isLoading: boolean;
  error: string | null;
}

// Create i18n context
export const I18nContext = createContext<I18nContextType | null>(null);

// Custom hook to use i18n
export function useI18n(): I18nContextType {
  const context = useContext(I18nContext);

  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider");
  }

  return context;
}

// Translation utility function
export function createTranslationFunction(translations: Translations) {
  return function t(
    key: string,
    params?: Record<string, string | number>,
  ): string {
    try {
      // Navigate nested object using dot notation
      const keys = key.split(".");
      let value: unknown = translations;

      for (const k of keys) {
        if (value && typeof value === "object" && k in value) {
          value = (value as Record<string, unknown>)[k];
        } else {
          console.warn(`Translation key not found: ${key}`);
          return key; // Return key if not found
        }
      }

      if (typeof value !== "string") {
        console.warn(`Translation value is not a string: ${key}`);
        return key;
      }

      // Replace parameters if provided
      if (params) {
        return value.replace(
          /\{\{(\w+)\}\}/g,
          (match: string, param: string) => {
            return params[param] !== undefined ? String(params[param]) : match;
          },
        );
      }

      return value;
    } catch (error) {
      console.error(`Translation error for key "${key}":`, error);
      return key;
    }
  };
}

// Load translations for a specific locale
export async function loadTranslations(
  locale: SupportedLocale,
): Promise<Translations> {
  try {
    // Dynamic import of translation file
    const translations = await import(`./locales/${locale}/common.json`);
    return translations.default;
  } catch (error) {
    console.error(`Failed to load translations for locale "${locale}":`, error);

    // Fallback to English if locale fails to load
    if (locale !== DEFAULT_LOCALE) {
      try {
        const fallbackTranslations = await import(
          `./locales/${DEFAULT_LOCALE}/common.json`
        );
        return fallbackTranslations.default;
      } catch (fallbackError) {
        console.error("Failed to load fallback translations:", fallbackError);
        throw new Error("Failed to load any translations");
      }
    }

    throw error;
  }
}

// Format date according to locale
export function formatDate(
  date: Date,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  try {
    return new Intl.DateTimeFormat(locale, {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch {
    return date.toLocaleDateString();
  }
}

// Format number according to locale
export function formatNumber(
  number: number,
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  try {
    return new Intl.NumberFormat(locale).format(number);
  } catch {
    return number.toString();
  }
}

// Format currency according to locale
export function formatCurrency(
  amount: number,
  currency: string = "USD",
  locale: SupportedLocale = DEFAULT_LOCALE,
): string {
  try {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

// Check if locale is RTL
export function isRTL(locale: SupportedLocale): boolean {
  const localeData = LOCALES[locale];
  if (!localeData) return false;
  return localeData.dir === "rtl";
}

// Get opposite direction
export function getOppositeDirection(locale: SupportedLocale): "ltr" | "rtl" {
  return isRTL(locale) ? "ltr" : "rtl";
}

// Validate locale
export function isValidLocale(locale: string): locale is SupportedLocale {
  return Object.keys(LOCALES).includes(locale);
}

// Get locale from URL path
export function getLocaleFromPath(path: string): SupportedLocale | null {
  const segments = path.split("/").filter(Boolean);
  const potentialLocale = segments[0];

  if (potentialLocale && isValidLocale(potentialLocale)) {
    return potentialLocale;
  }

  return null;
}

// Remove locale from path
export function removeLocaleFromPath(
  path: string,
  locale: SupportedLocale,
): string {
  if (path.startsWith(`/${locale}`)) {
    return path.slice(`/${locale}`.length) || "/";
  }
  return path;
}

// Add locale to path
export function addLocaleToPath(path: string, locale: SupportedLocale): string {
  if (locale === DEFAULT_LOCALE) {
    return path; // Don't add default locale to URL
  }

  return `/${locale}${path === "/" ? "" : path}`;
}
