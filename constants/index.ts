// InternetFriends Constants - Main Index
// Central export point for all constants across the application

// === Component Constants ===
export {
  // Button constants
  BUTTON_VARIANTS,
  BUTTON_SIZES,
  BUTTON_DEFAULTS,
  
  // Card constants
  CARD_VARIANTS,
  CARD_DEFAULTS,
  
  // Header constants
  HEADER_VARIANTS,
  HEADER_DEFAULTS,
  
  // Size system
  SIZE_VARIANTS,
  COLOR_VARIANTS,
  VISUAL_VARIANTS,
  LOADING_STATES,
  ANIMATION_DIRECTIONS,
  
  // Gloo system (production-ready)
  GLOO_PALETTE_STRATEGIES,
  GLOO_THEME_MODES,
  GLOO_EFFECT_NAMES,
  GLOO_DEFAULTS,
  
  // Navigation
  NAVIGATION_ORIENTATIONS,
  NAVIGATION_VARIANTS,
  NAVIGATION_DEFAULTS,
  
  // Forms
  FORM_MODES,
  FORM_LAYOUTS,
  FORM_DEFAULTS,
  
  // Modals
  MODAL_SIZES,
  MODAL_DEFAULTS,
  
  // Style mappings
  SIZE_TO_PIXELS,
  SIZE_TO_SPACING,
  COLOR_TO_HEX,
  
  // Type exports
  type ButtonVariant,
  type ButtonSize,
  type CardVariant,
  type HeaderVariant,
  type SizeVariant,
  type ColorVariant,
  type VisualVariant,
  type LoadingState,
  type AnimationDirection,
  type GlooPaletteStrategy,
  type GlooThemeMode,
  type GlooEffectName,
  type NavigationOrientation,
  type NavigationVariant,
  type FormMode,
  type FormLayout,
  type ModalSize,
  
  // Validation helpers
  isButtonVariant,
  isButtonSize,
  isSizeVariant,
  isColorVariant,
  isGlooEffectName,
  
  // Option lists
  BUTTON_VARIANT_OPTIONS,
  BUTTON_SIZE_OPTIONS,
  SIZE_VARIANT_OPTIONS,
  COLOR_VARIANT_OPTIONS,
  GLOO_EFFECT_OPTIONS,
  GLOO_PALETTE_OPTIONS
} from './components'

// === Business Constants ===
export {
  // G-Level system
  G_LEVELS,
  G_LEVEL_NAMES,
  G_LEVEL_COLORS,
  G_LEVEL_THRESHOLDS,
  G_LEVEL_BANDWIDTH_MULTIPLIERS,
  G_LEVEL_COMMUNITY_LIMITS,
  
  // Payment system
  PAYMENT_PROVIDERS,
  PAYMENT_STATUSES,
  PAYMENT_CURRENCIES,
  PAYMENT_FRICTION_LEVELS,
  PAYMENT_DEMOGRAPHICS,
  MEXICAN_TAX_SUPPORT,
  
  // Purchase tiers
  GS_PURCHASE_TIERS,
  
  // Achievement system
  ACHIEVEMENT_RARITIES,
  ACHIEVEMENT_CATEGORIES,
  ACHIEVEMENT_REWARDS,
  
  // Community system
  COMMUNITY_MEMBER_ROLES,
  COMMUNITY_MODERATION_LEVELS,
  COMMUNITY_DEFAULTS,
  
  // Bandwidth sharing
  BANDWIDTH_REQUEST_TYPES,
  BANDWIDTH_REQUEST_STATUSES,
  BANDWIDTH_PRIORITIES,
  BANDWIDTH_QUALITY_LEVELS,
  BANDWIDTH_CONNECTION_TYPES,
  
  // Notification system
  NOTIFICATION_TYPES,
  NOTIFICATION_PRIORITIES,
  NOTIFICATION_CATEGORIES,
  
  // Messaging
  MESSAGE_TYPES,
  CONVERSATION_TYPES,
  
  // Analytics
  ANALYTICS_PERIODS,
  ANALYTICS_TRENDS,
  
  // Regional
  PRIORITY_COUNTRIES,
  REGIONAL_PREFERENCES,
  
  // Business rules
  BUSINESS_LIMITS,
  RATE_LIMITS,
  MEXICAN_TAX_THRESHOLDS,
  ECONOMIC_INDICATORS,
  
  // Type exports
  type GLevel,
  type PaymentProvider,
  type PaymentStatus,
  type PaymentCurrency,
  type AchievementRarity,
  type AchievementCategory,
  type CommunityMemberRole,
  type CommunityModerationLevel,
  type BandwidthRequestType,
  type BandwidthRequestStatus,
  type BandwidthPriority,
  type NotificationType,
  type NotificationPriority,
  type MessageType,
  type ConversationType,
  
  // Validation helpers
  isValidGLevel,
  isValidPaymentProvider,
  isValidPaymentStatus,
  isValidAchievementRarity,
  
  // Helper functions
  calculateGLevel,
  getGLevelInfo,
  getNextLevelRequirement,
  calculatePurchaseTierTotal,
  
  // Option lists
  PAYMENT_PROVIDER_OPTIONS,
  ACHIEVEMENT_RARITY_OPTIONS,
  COMMUNITY_ROLE_OPTIONS,
  BANDWIDTH_PRIORITY_OPTIONS,
  G_LEVEL_OPTIONS
} from './business'

// === API Constants ===
export {
  // HTTP constants
  HTTP_STATUS,
  HTTP_METHODS,
  API_ERROR_CODES,
  
  // Route definitions
  API_ROUTES,
  FRONTEND_ROUTES,
  
  // API configuration
  API_VERSIONS,
  CONTENT_TYPES,
  REQUEST_HEADERS,
  RESPONSE_HEADERS,
  CACHE_CONTROL,
  
  // WebSocket
  WEBSOCKET_EVENTS,
  
  // Rate limiting
  RATE_LIMIT_WINDOWS,
  RATE_LIMITS_BY_ENDPOINT,
  REQUEST_TIMEOUTS,
  
  // File uploads
  FILE_UPLOAD_LIMITS,
  
  // Pagination
  PAGINATION_DEFAULTS,
  
  // Type exports
  type HttpStatus,
  type HttpMethod,
  type ApiErrorCode,
  type ApiVersion,
  type ContentType,
  type WebSocketEvent,
  
  // Helper functions
  isSuccessStatus,
  isClientError,
  isServerError,
  buildApiUrl,
  buildFrontendUrl,
  getErrorMessage,
  
  // Option lists
  HTTP_STATUS_OPTIONS,
  HTTP_METHOD_OPTIONS,
  API_ERROR_CODE_OPTIONS,
  CONTENT_TYPE_OPTIONS,
  WEBSOCKET_EVENT_OPTIONS
} from './api'

// === Internationalization Constants ===
export {
  // Locales
  LOCALES,
  DEFAULT_LOCALE,
  LOCALE_REGIONS,
  
  // Translation keys
  I18N_KEYS,
  
  // Locale configuration
  LOCALE_CONFIG,
  BROWSER_LANGUAGE_MAP,
  COUNTRY_TO_LOCALE,
  
  // Type exports
  type Locale,
  type I18nKey,
  type LocaleRegion,
  
  // Helper functions
  isValidLocale,
  getDefaultLocaleForRegion,
  getBrowserLocale,
  getTextDirection,
  isRTL,
  getLocaleForCountry,
  
  // Option lists
  LOCALE_OPTIONS,
  SUPPORTED_LOCALES,
  LOCALE_REGION_OPTIONS
} from './i18n'

// === Unified Application Constants ===

// Application metadata
export const APP_CONFIG = {
  NAME: 'InternetFriends',
  VERSION: '1.0.0',
  DESCRIPTION: 'Decentralized Internet Connection Sharing Platform',
  AUTHOR: 'InternetFriends Team',
  WEBSITE: 'https://internetfriends.app',
  SUPPORT_EMAIL: 'support@internetfriends.app',
  API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.internetfriends.app',
  WS_BASE_URL: process.env.NEXT_PUBLIC_WS_BASE_URL || 'wss://ws.internetfriends.app'
} as const

// Feature flags
export const FEATURE_FLAGS = {
  ENABLE_PAYMENTS: true,
  ENABLE_COMMUNITIES: true,
  ENABLE_BANDWIDTH_SHARING: true,
  ENABLE_ACHIEVEMENTS: true,
  ENABLE_WEBSOCKETS: true,
  ENABLE_ANALYTICS: true,
  ENABLE_I18N: true,
  ENABLE_GLOO_BACKGROUNDS: true,
  ENABLE_MOBILE_APP: false,
  ENABLE_BETA_FEATURES: false,
  ENABLE_DEBUG_MODE: process.env.NODE_ENV === 'development'
} as const

// Environment detection
export const ENVIRONMENT = {
  IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  IS_TEST: process.env.NODE_ENV === 'test',
  IS_CLIENT: typeof window !== 'undefined',
  IS_SERVER: typeof window === 'undefined'
} as const

// Browser detection utilities
export const BROWSER_FEATURES = {
  SUPPORTS_WEBGL: typeof WebGLRenderingContext !== 'undefined',
  SUPPORTS_WEBSOCKETS: typeof WebSocket !== 'undefined',
  SUPPORTS_WEBRTC: typeof RTCPeerConnection !== 'undefined',
  SUPPORTS_SERVICE_WORKERS: typeof navigator !== 'undefined' && 'serviceWorker' in navigator,
  SUPPORTS_PUSH_NOTIFICATIONS: typeof navigator !== 'undefined' && 'PushManager' in window,
  SUPPORTS_INTL: typeof Intl !== 'undefined',
  SUPPORTS_GEOLOCATION: typeof navigator !== 'undefined' && 'geolocation' in navigator
} as const

// Local storage keys (with i18n awareness)
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'internetfriends_auth_token',
  REFRESH_TOKEN: 'internetfriends_refresh_token',
  USER_PROFILE: 'internetfriends_user_profile',
  THEME_MODE: 'internetfriends_theme_mode',
  LANGUAGE: 'internetfriends_language',
  LOCALE: 'internetfriends_locale',
  NOTIFICATION_PREFERENCES: 'internetfriends_notification_preferences',
  TUTORIAL_COMPLETED: 'internetfriends_tutorial_completed',
  ANALYTICS_CONSENT: 'internetfriends_analytics_consent',
  GLOO_PREFERENCES: 'internetfriends_gloo_preferences',
  I18N_CACHE: 'internetfriends_i18n_cache'
} as const

// Analytics event names (i18n ready)
export const ANALYTICS_EVENTS = {
  PAGE_VIEW: 'page_view',
  USER_SIGNUP: 'user_signup',
  USER_LOGIN: 'user_login',
  PROFILE_UPDATED: 'profile_updated',
  LANGUAGE_CHANGED: 'language_changed',
  LOCALE_CHANGED: 'locale_changed',
  COMMUNITY_CREATED: 'community_created',
  COMMUNITY_JOINED: 'community_joined',
  PAYMENT_INITIATED: 'payment_initiated',
  PAYMENT_COMPLETED: 'payment_completed',
  BANDWIDTH_SHARED: 'bandwidth_shared',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  MESSAGE_SENT: 'message_sent',
  SEARCH_PERFORMED: 'search_performed',
  FEATURE_USED: 'feature_used',
  ERROR_OCCURRED: 'error_occurred',
  GLOO_EFFECT_CHANGED: 'gloo_effect_changed'
} as const

// === Validation Messages (i18n keys) ===
export const VALIDATION_MESSAGE_KEYS = {
  REQUIRED: I18N_KEYS.VALIDATION.REQUIRED,
  INVALID_EMAIL: I18N_KEYS.VALIDATION.INVALID_EMAIL,
  INVALID_USERNAME: I18N_KEYS.VALIDATION.INVALID_USERNAME,
  USERNAME_TOO_SHORT: I18N_KEYS.VALIDATION.USERNAME_TOO_SHORT,
  USERNAME_TOO_LONG: I18N_KEYS.VALIDATION.USERNAME_TOO_LONG,
  PASSWORD_TOO_SHORT: I18N_KEYS.VALIDATION.PASSWORD_TOO_SHORT,
  PASSWORD_WEAK: I18N_KEYS.VALIDATION.PASSWORD_WEAK,
  PASSWORDS_DONT_MATCH: I18N_KEYS.VALIDATION.PASSWORDS_DONT_MATCH,
  DISPLAY_NAME_TOO_LONG: I18N_KEYS.VALIDATION.DISPLAY_NAME_TOO_LONG,
  BIO_TOO_LONG: I18N_KEYS.VALIDATION.BIO_TOO_LONG,
  INVALID_AMOUNT: I18N_KEYS.VALIDATION.INVALID_AMOUNT,
  AMOUNT_TOO_LOW: I18N_KEYS.VALIDATION.AMOUNT_TOO_LOW,
  AMOUNT_TOO_HIGH: I18N_KEYS.VALIDATION.AMOUNT_TOO_HIGH,
  INVALID_FILE_TYPE: I18N_KEYS.VALIDATION.INVALID_FILE_TYPE,
  FILE_TOO_LARGE: I18N_KEYS.VALIDATION.FILE_TOO_LARGE
} as const

// === Success Messages (i18n keys) ===
export const SUCCESS_MESSAGE_KEYS = {
  PROFILE_UPDATED: I18N_KEYS.SUCCESS.PROFILE_UPDATED,
  COMMUNITY_CREATED: I18N_KEYS.SUCCESS.COMMUNITY_CREATED,
  COMMUNITY_JOINED: I18N_KEYS.SUCCESS.COMMUNITY_JOINED,
  PAYMENT_COMPLETED: I18N_KEYS.SUCCESS.PAYMENT_COMPLETED,
  MESSAGE_SENT: I18N_KEYS.SUCCESS.MESSAGE_SENT,
  FILE_UPLOADED: I18N_KEYS.SUCCESS.FILE_UPLOADED,
  SETTINGS_SAVED: I18N_KEYS.SUCCESS.SETTINGS_SAVED
} as const

// === Error Messages (i18n keys) ===
export const ERROR_MESSAGE_KEYS = {
  GENERIC: I18N_KEYS.ERROR.GENERIC,
  NETWORK: I18N_KEYS.ERROR.NETWORK,
  SERVER: I18N_KEYS.ERROR.SERVER,
  UNAUTHORIZED: I18N_KEYS.ERROR.UNAUTHORIZED,
  SESSION_EXPIRED: I18N_KEYS.ERROR.SESSION_EXPIRED,
  PAYMENT_FAILED: I18N_KEYS.ERROR.PAYMENT_FAILED,
  COMMUNITY_FULL: I18N_KEYS.ERROR.COMMUNITY_FULL,
  INSUFFICIENT_BALANCE: I18N_KEYS.ERROR.INSUFFICIENT_BALANCE,
  RATE_LIMIT_EXCEEDED: I18N_KEYS.ERROR.RATE_LIMIT_EXCEEDED
} as const

// Export everything for easy access
export const CONSTANTS = {
  APP_CONFIG,
  FEATURE_FLAGS,
  ENVIRONMENT,
  BROWSER_FEATURES,
  STORAGE_KEYS,
  ANALYTICS_EVENTS,
  VALIDATION_MESSAGE_KEYS,
  SUCCESS_MESSAGE_KEYS,
  ERROR_MESSAGE_KEYS
} as const

// Type helpers for the main constants
export type StorageKey = typeof STORAGE_KEYS[keyof typeof STORAGE_KEYS]
export type AnalyticsEvent = typeof ANALYTICS_EVENTS[keyof typeof ANALYTICS_EVENTS]
export type ValidationMessageKey = typeof VALIDATION_MESSAGE_KEYS[keyof typeof VALIDATION_MESSAGE_KEYS]
export type SuccessMessageKey = typeof SUCCESS_MESSAGE_KEYS[keyof typeof SUCCESS_MESSAGE_KEYS]
export type ErrorMessageKey = typeof ERROR_MESSAGE_KEYS[keyof typeof ERROR_MESSAGE_KEYS]

// === Development and Production Utilities ===

// Get all available constant categories
export const CONSTANT_CATEGORIES = [
  'COMPONENTS',
  'BUSINESS',
  'API',
  'I18N',
  'APP_CONFIG',
  'FEATURE_FLAGS',
  'ENVIRONMENT',
  'BROWSER_FEATURES'
] as const

// Validate environment setup
export const validateEnvironment = () => {
  const checks = {
    hasWebGL: BROWSER_FEATURES.SUPPORTS_WEBGL,
    hasWebSockets: BROWSER_FEATURES.SUPPORTS_WEBSOCKETS,
    hasIntl: BROWSER_FEATURES.SUPPORTS_INTL,
    isProduction: ENVIRONMENT.IS_PRODUCTION,
    hasSupportedLocale: SUPPORTED_LOCALES.includes(getBrowserLocale())
  }
  
  return {
    isValid: Object.values(checks).every(Boolean),
    checks
  }
}

// Export validation function
export { validateEnvironment as validateAppEnvironment }