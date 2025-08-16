import { 
  formatDistanceToNow, 
  format, 
  isValid, 
  parseISO, 
  formatRelative,
  formatDuration,
  intervalToDuration,
  isToday,
  isYesterday,
  isTomorrow,
  startOfDay,
  endOfDay
} from 'date-fns';
import { enUS, es, fr, de, ja, ko, zhCN } from 'date-fns/locale';

// Supported locales mapping
const locales = {
  en: enUS,
  'en-US': enUS,
  es: es,
  'es-ES': es,
  fr: fr,
  'fr-FR': fr,
  de: de,
  'de-DE': de,
  ja: ja,
  'ja-JP': ja,
  ko: ko,
  'ko-KR': ko,
  zh: zhCN,
  'zh-CN': zhCN,
};

export type SupportedLocale = keyof typeof locales;

interface DateFormatOptions {
  locale?: SupportedLocale;
  addSuffix?: boolean;
  includeTime?: boolean;
}

/**
 * Safely parse a date from various formats
 */
export function parseDate(date: Date | string | number | undefined | null): Date | null {
  if (!date) return null;
  
  let dateObj: Date;
  
  if (typeof date === 'string') {
    // Try parsing ISO string first, then fallback to Date constructor
    dateObj = parseISO(date);
    if (!isValid(dateObj)) {
      dateObj = new Date(date);
    }
  } else if (typeof date === 'number') {
    dateObj = new Date(date);
  } else if (date instanceof Date) {
    dateObj = date;
  } else {
    return null;
  }
  
  return isValid(dateObj) ? dateObj : null;
}

/**
 * Format date as human-readable relative time (e.g., "2 hours ago", "in 3 days")
 */
export function formatRelativeTime(
  date: Date | string | number | undefined | null,
  options: DateFormatOptions = {}
): string {
  const { locale = 'en', addSuffix = true } = options;
  
  const dateObj = parseDate(date);
  if (!dateObj) return 'Unknown';
  
  try {
    return formatDistanceToNow(dateObj, {
      addSuffix,
      locale: locales[locale] || locales.en
    });
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Unknown';
  }
}

/**
 * Format date in a smart way based on recency
 */
export function formatSmartDate(
  date: Date | string | number | undefined | null,
  options: DateFormatOptions = {}
): string {
  const { locale = 'en', includeTime = false } = options;
  
  const dateObj = parseDate(date);
  if (!dateObj) return 'Unknown';
  
  try {
    const localeObj = locales[locale] || locales.en;
    
    if (isToday(dateObj)) {
      return includeTime 
        ? `Today at ${format(dateObj, 'p', { locale: localeObj })}`
        : 'Today';
    }
    
    if (isYesterday(dateObj)) {
      return includeTime 
        ? `Yesterday at ${format(dateObj, 'p', { locale: localeObj })}`
        : 'Yesterday';
    }
    
    if (isTomorrow(dateObj)) {
      return includeTime 
        ? `Tomorrow at ${format(dateObj, 'p', { locale: localeObj })}`
        : 'Tomorrow';
    }
    
    // For dates within the current year, show month and day
    const currentYear = new Date().getFullYear();
    if (dateObj.getFullYear() === currentYear) {
      return format(dateObj, includeTime ? 'MMM d, p' : 'MMM d', { locale: localeObj });
    }
    
    // For older dates, include the year
    return format(dateObj, includeTime ? 'MMM d, yyyy, p' : 'MMM d, yyyy', { locale: localeObj });
  } catch (error) {
    console.warn('Date formatting error:', error);
    return 'Unknown';
  }
}

/**
 * Format date with full context (relative + absolute)
 */
export function formatFullDate(
  date: Date | string | number | undefined | null,
  options: DateFormatOptions = {}
): string {
  const { locale = 'en' } = options;
  
  const dateObj = parseDate(date);
  if (!dateObj) return 'Unknown';
  
  const relative = formatRelativeTime(date, { locale, addSuffix: true });
  const absolute = formatSmartDate(date, { locale, includeTime: true });
  
  return `${relative} (${absolute})`;
}

/**
 * Format duration between two dates
 */
export function formatTimeDuration(
  start: Date | string | number | undefined | null,
  end: Date | string | number | undefined | null = new Date(),
  options: DateFormatOptions = {}
): string {
  const { locale = 'en' } = options;
  
  const startDate = parseDate(start);
  const endDate = parseDate(end);
  
  if (!startDate || !endDate) return 'Unknown';
  
  try {
    const duration = intervalToDuration({ start: startDate, end: endDate });
    
    // Custom formatting for better UX
    if (duration.years && duration.years > 0) {
      return `${duration.years}y ${duration.months || 0}m`;
    }
    if (duration.months && duration.months > 0) {
      return `${duration.months}m ${duration.days || 0}d`;
    }
    if (duration.days && duration.days > 0) {
      return `${duration.days}d ${duration.hours || 0}h`;
    }
    if (duration.hours && duration.hours > 0) {
      return `${duration.hours}h ${duration.minutes || 0}m`;
    }
    if (duration.minutes && duration.minutes > 0) {
      return `${duration.minutes}m`;
    }
    
    return 'Just now';
  } catch (error) {
    console.warn('Duration formatting error:', error);
    return 'Unknown';
  }
}

/**
 * Get user's preferred locale from browser/system
 */
export function getUserLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  
  const browserLocale = navigator.language || 'en';
  
  // Check if we support the exact locale
  if (browserLocale in locales) {
    return browserLocale as SupportedLocale;
  }
  
  // Check if we support the language part
  const languageCode = browserLocale.split('-')[0];
  if (languageCode in locales) {
    return languageCode as SupportedLocale;
  }
  
  // Fallback to English
  return 'en';
}

/**
 * Validate if a date is within a reasonable range for component metadata
 */
export function isReasonableComponentDate(date: Date | string | number | undefined | null): boolean {
  const dateObj = parseDate(date);
  if (!dateObj) return false;
  
  const now = new Date();
  const tenYearsAgo = new Date(now.getFullYear() - 10, now.getMonth(), now.getDate());
  const oneYearFromNow = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  
  return dateObj >= tenYearsAgo && dateObj <= oneYearFromNow;
}

// Export common date formats for consistent UI
export const DATE_FORMATS = {
  SHORT: 'MMM d',
  MEDIUM: 'MMM d, yyyy',
  LONG: 'MMMM d, yyyy',
  FULL: 'EEEE, MMMM d, yyyy',
  TIME: 'p',
  DATETIME_SHORT: 'MMM d, p',
  DATETIME_MEDIUM: 'MMM d, yyyy, p',
  ISO: "yyyy-MM-dd'T'HH:mm:ss.SSSxxx"
} as const;