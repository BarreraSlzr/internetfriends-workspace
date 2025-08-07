// InternetFriends Internationalization (i18n)
// Main export file for all internationalization functionality

// Provider and hooks
export { I18nProvider, useI18n, useTranslation, useLocale, withI18n } from './provider';

// Configuration and utilities
export {
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_STORAGE_KEY,
  I18nContext,
  getDefaultLocale,
  getStoredLocale,
  storeLocale,
  loadTranslations,
  createTranslationFunction,
  formatDate,
  formatNumber,
  formatCurrency,
  isRTL,
  getOppositeDirection,
  isValidLocale,
  getLocaleFromPath,
  removeLocaleFromPath,
  addLocaleToPath,
} from './config';

// Types
export type {
  SupportedLocale,
  LocaleConfig,
  Translations,
  I18nContextType,
} from './config';

// Default export
export { I18nProvider as default } from './provider';
