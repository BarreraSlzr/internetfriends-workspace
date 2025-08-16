// Date Utility Testing and Demo
// This file demonstrates the internationalization capabilities

import { 
  formatRelativeTime, 
  formatSmartDate, 
  formatFullDate, 
  formatTimeDuration, 
  getUserLocale 
} from '@/lib/utils/date';

// Example dates for testing
const testDates = {
  now: new Date(),
  oneHourAgo: new Date(Date.now() - 60 * 60 * 1000),
  oneDay: new Date(Date.now() - 24 * 60 * 60 * 1000),
  oneWeek: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  oneMonth: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
  oneYear: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
  tomorrow: new Date(Date.now() + 24 * 60 * 60 * 1000),
  invalidDate: 'invalid-date-string',
  nullDate: null,
  undefinedDate: undefined
};

const supportedLocales = ['en', 'es', 'fr', 'de', 'ja', 'ko', 'zh'] as const;

/**
 * Test date formatting across different locales
 */
export function testDateFormatting() {
  console.log('=== Date Formatting Test ===');
  console.log('User locale:', getUserLocale());
  console.log('');

  // Test relative time formatting
  console.log('Relative Time Formatting:');
  Object.entries(testDates).forEach(([key, date]) => {
    console.log(`${key}: ${formatRelativeTime(date)}`);
  });
  console.log('');

  // Test smart date formatting
  console.log('Smart Date Formatting:');
  Object.entries(testDates).forEach(([key, date]) => {
    console.log(`${key}: ${formatSmartDate(date, { includeTime: true })}`);
  });
  console.log('');

  // Test different locales
  console.log('Locale Variations (one day ago):');
  supportedLocales.forEach(locale => {
    console.log(`${locale}: ${formatRelativeTime(testDates.oneDay, { locale })}`);
  });
  console.log('');

  // Test full date formatting
  console.log('Full Date Context:');
  console.log(formatFullDate(testDates.oneWeek));
  console.log('');

  // Test duration formatting
  console.log('Duration Formatting:');
  console.log(`Since one hour ago: ${formatTimeDuration(testDates.oneHourAgo)}`);
  console.log(`Since one week ago: ${formatTimeDuration(testDates.oneWeek)}`);
  console.log(`Since one year ago: ${formatTimeDuration(testDates.oneYear)}`);
}

/**
 * Component date examples for UI demo
 */
export const componentDateExamples = {
  recentComponent: {
    name: 'ButtonAtomic',
    lastModified: testDates.oneHourAgo,
    created: testDates.oneWeek
  },
  oldComponent: {
    name: 'LegacyModal', 
    lastModified: testDates.oneYear,
    created: new Date('2020-01-15')
  },
  futureComponent: {
    name: 'FutureComponent',
    lastModified: testDates.tomorrow,
    created: testDates.now
  }
};

/**
 * Format component dates for display in the design system
 */
export function formatComponentDate(date: Date | string | undefined, options = {}) {
  return formatRelativeTime(date, { locale: getUserLocale(), ...options });
}

/**
 * Format component date with tooltip
 */
export function formatComponentDateWithTooltip(date: Date | string | undefined) {
  const relative = formatRelativeTime(date, { locale: getUserLocale() });
  const absolute = formatSmartDate(date, { locale: getUserLocale(), includeTime: true });
  
  return {
    display: relative,
    tooltip: absolute,
    full: formatFullDate(date)
  };
}

// Export for console testing
if (typeof window !== 'undefined') {
  (window as any).testDateFormatting = testDateFormatting;
  (window as any).componentDateExamples = componentDateExamples;
}