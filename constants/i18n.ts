// InternetFriends i18n Constants
// Internationalization keys, supported locales, and localization configuration

// === Supported Locales ===

export const LOCALES = {
  EN: 'en',       // English (default)
  ES: 'es',       // Spanish  
  ES_MX: 'es-MX', // Mexican Spanish
  PT: 'pt',       // Portuguese
  PT_BR: 'pt-BR', // Brazilian Portuguese
  FR: 'fr',       // French
  DE: 'de',       // German
  IT: 'it',       // Italian
  JA: 'ja',       // Japanese
  KO: 'ko',       // Korean
  ZH: 'zh',       // Chinese (Simplified)
  ZH_TW: 'zh-TW', // Chinese (Traditional)
  RU: 'ru',       // Russian
  AR: 'ar',       // Arabic
  HI: 'hi'        // Hindi
} as const

export const DEFAULT_LOCALE = LOCALES.EN

// Regional locale groupings
export const LOCALE_REGIONS = {
  NORTH_AMERICA: [LOCALES.EN, LOCALES.ES_MX, LOCALES.FR],
  LATIN_AMERICA: [LOCALES.ES, LOCALES.ES_MX, LOCALES.PT, LOCALES.PT_BR],
  EUROPE: [LOCALES.EN, LOCALES.FR, LOCALES.DE, LOCALES.IT, LOCALES.ES, LOCALES.RU],
  ASIA_PACIFIC: [LOCALES.EN, LOCALES.JA, LOCALES.KO, LOCALES.ZH, LOCALES.ZH_TW, LOCALES.HI],
  MIDDLE_EAST_AFRICA: [LOCALES.EN, LOCALES.AR, LOCALES.FR]
} as const

// === Translation Keys ===

// Common UI elements
export const I18N_KEYS = {
  // Navigation
  NAV: {
    HOME: 'nav.home',
    PROFILE: 'nav.profile',
    COMMUNITIES: 'nav.communities',
    PURCHASE: 'nav.purchase',
    LEADERBOARD: 'nav.leaderboard',
    SETTINGS: 'nav.settings',
    HELP: 'nav.help',
    LOGOUT: 'nav.logout'
  },
  
  // Authentication
  AUTH: {
    LOGIN: 'auth.login',
    REGISTER: 'auth.register',
    LOGOUT: 'auth.logout',
    FORGOT_PASSWORD: 'auth.forgotPassword',
    RESET_PASSWORD: 'auth.resetPassword',
    EMAIL: 'auth.email',
    PASSWORD: 'auth.password',
    CONFIRM_PASSWORD: 'auth.confirmPassword',
    USERNAME: 'auth.username',
    DISPLAY_NAME: 'auth.displayName',
    REMEMBER_ME: 'auth.rememberMe',
    SIGN_IN: 'auth.signIn',
    SIGN_UP: 'auth.signUp',
    ACCEPT_TERMS: 'auth.acceptTerms',
    VERIFY_EMAIL: 'auth.verifyEmail'
  },
  
  // Profile
  PROFILE: {
    TITLE: 'profile.title',
    EDIT: 'profile.edit',
    SAVE: 'profile.save',
    CANCEL: 'profile.cancel',
    BIO: 'profile.bio',
    LOCATION: 'profile.location',
    CITY: 'profile.city',
    COUNTRY: 'profile.country',
    JOINED: 'profile.joined',
    LAST_ACTIVE: 'profile.lastActive',
    ONLINE: 'profile.online',
    OFFLINE: 'profile.offline',
    LEVEL: 'profile.level',
    REPUTATION: 'profile.reputation',
    STATS: 'profile.stats',
    ACHIEVEMENTS: 'profile.achievements'
  },
  
  // G-Level System
  G_LEVEL: {
    CURRENT_LEVEL: 'gLevel.currentLevel',
    NEXT_LEVEL: 'gLevel.nextLevel',
    PROGRESS: 'gLevel.progress',
    BENEFITS: 'gLevel.benefits',
    REQUIREMENTS: 'gLevel.requirements',
    LEVEL_UP: 'gLevel.levelUp',
    // Level names
    NEWBIE: 'gLevel.names.newbie',
    FRIEND: 'gLevel.names.friend',
    CONNECTOR: 'gLevel.names.connector',
    HUB: 'gLevel.names.hub',
    NETWORK: 'gLevel.names.network',
    LEGEND: 'gLevel.names.legend'
  },
  
  // G's Economy
  GS: {
    BALANCE: 'gs.balance',
    EARN: 'gs.earn',
    SPEND: 'gs.spend',
    PURCHASE: 'gs.purchase',
    TRANSFER: 'gs.transfer',
    HISTORY: 'gs.history',
    TRANSACTION: 'gs.transaction',
    INSUFFICIENT_BALANCE: 'gs.insufficientBalance',
    EARNED_FROM_BANDWIDTH: 'gs.earnedFromBandwidth',
    EARNED_FROM_ACHIEVEMENT: 'gs.earnedFromAchievement'
  },
  
  // Payments
  PAYMENT: {
    TITLE: 'payment.title',
    CHOOSE_TIER: 'payment.chooseTier',
    CHOOSE_PROVIDER: 'payment.chooseProvider',
    PROCESSING: 'payment.processing',
    SUCCESS: 'payment.success',
    FAILED: 'payment.failed',
    CANCELLED: 'payment.cancelled',
    TOTAL: 'payment.total',
    FEES: 'payment.fees',
    SECURE: 'payment.secure',
    POPULAR: 'payment.popular',
    BEST_VALUE: 'payment.bestValue',
    BONUS_GS: 'payment.bonusGs'
  },
  
  // Communities
  COMMUNITY: {
    TITLE: 'community.title',
    CREATE: 'community.create',
    JOIN: 'community.join',
    LEAVE: 'community.leave',
    INVITE: 'community.invite',
    MEMBERS: 'community.members',
    DESCRIPTION: 'community.description',
    RULES: 'community.rules',
    PRIVATE: 'community.private',
    PUBLIC: 'community.public',
    MEMBER_COUNT: 'community.memberCount',
    CREATED_BY: 'community.createdBy',
    CREATED_AT: 'community.createdAt',
    MODERATORS: 'community.moderators'
  },
  
  // Bandwidth Sharing
  BANDWIDTH: {
    SHARE: 'bandwidth.share',
    REQUEST: 'bandwidth.request',
    ACCEPT: 'bandwidth.accept',
    DECLINE: 'bandwidth.decline',
    ACTIVE: 'bandwidth.active',
    COMPLETED: 'bandwidth.completed',
    QUALITY: 'bandwidth.quality',
    SPEED: 'bandwidth.speed',
    LATENCY: 'bandwidth.latency',
    BYTES_SHARED: 'bandwidth.bytesShared',
    DURATION: 'bandwidth.duration',
    REWARD: 'bandwidth.reward'
  },
  
  // Achievements
  ACHIEVEMENT: {
    UNLOCKED: 'achievement.unlocked',
    LOCKED: 'achievement.locked',
    PROGRESS: 'achievement.progress',
    REWARD: 'achievement.reward',
    RARITY: 'achievement.rarity',
    CATEGORY: 'achievement.category',
    // Rarities
    COMMON: 'achievement.rarity.common',
    RARE: 'achievement.rarity.rare',
    EPIC: 'achievement.rarity.epic',
    LEGENDARY: 'achievement.rarity.legendary'
  },
  
  // Notifications
  NOTIFICATION: {
    TITLE: 'notification.title',
    MARK_READ: 'notification.markRead',
    MARK_ALL_READ: 'notification.markAllRead',
    DELETE: 'notification.delete',
    PREFERENCES: 'notification.preferences',
    G_EARNED: 'notification.gEarned',
    LEVEL_UP: 'notification.levelUp',
    ACHIEVEMENT_UNLOCKED: 'notification.achievementUnlocked',
    COMMUNITY_INVITE: 'notification.communityInvite',
    BANDWIDTH_REQUEST: 'notification.bandwidthRequest',
    MESSAGE: 'notification.message'
  },
  
  // Settings
  SETTINGS: {
    TITLE: 'settings.title',
    PROFILE: 'settings.profile',
    NOTIFICATIONS: 'settings.notifications',
    PRIVACY: 'settings.privacy',
    LANGUAGE: 'settings.language',
    THEME: 'settings.theme',
    BILLING: 'settings.billing',
    ADVANCED: 'settings.advanced',
    SAVE: 'settings.save',
    RESET: 'settings.reset'
  },
  
  // Search
  SEARCH: {
    PLACEHOLDER: 'search.placeholder',
    RESULTS: 'search.results',
    NO_RESULTS: 'search.noResults',
    USERS: 'search.users',
    COMMUNITIES: 'search.communities',
    FILTER: 'search.filter',
    SORT: 'search.sort'
  },
  
  // Leaderboard
  LEADERBOARD: {
    TITLE: 'leaderboard.title',
    RANK: 'leaderboard.rank',
    USER: 'leaderboard.user',
    SCORE: 'leaderboard.score',
    CHANGE: 'leaderboard.change',
    TOP_GS: 'leaderboard.topGs',
    TOP_BANDWIDTH: 'leaderboard.topBandwidth',
    TOP_COMMUNITIES: 'leaderboard.topCommunities',
    TOP_REPUTATION: 'leaderboard.topReputation'
  },
  
  // Common actions
  ACTION: {
    SAVE: 'action.save',
    CANCEL: 'action.cancel',
    DELETE: 'action.delete',
    EDIT: 'action.edit',
    VIEW: 'action.view',
    SHARE: 'action.share',
    COPY: 'action.copy',
    DOWNLOAD: 'action.download',
    UPLOAD: 'action.upload',
    SUBMIT: 'action.submit',
    CONFIRM: 'action.confirm',
    RETRY: 'action.retry',
    REFRESH: 'action.refresh',
    CLOSE: 'action.close',
    BACK: 'action.back',
    NEXT: 'action.next',
    PREVIOUS: 'action.previous',
    CONTINUE: 'action.continue'
  },
  
  // States
  STATE: {
    LOADING: 'state.loading',
    SUCCESS: 'state.success',
    ERROR: 'state.error',
    EMPTY: 'state.empty',
    OFFLINE: 'state.offline',
    ONLINE: 'state.online',
    CONNECTING: 'state.connecting',
    DISCONNECTED: 'state.disconnected'
  },
  
  // Validation messages
  VALIDATION: {
    REQUIRED: 'validation.required',
    INVALID_EMAIL: 'validation.invalidEmail',
    INVALID_USERNAME: 'validation.invalidUsername',
    USERNAME_TOO_SHORT: 'validation.usernameTooShort',
    USERNAME_TOO_LONG: 'validation.usernameTooLong',
    PASSWORD_TOO_SHORT: 'validation.passwordTooShort',
    PASSWORD_WEAK: 'validation.passwordWeak',
    PASSWORDS_DONT_MATCH: 'validation.passwordsDontMatch',
    DISPLAY_NAME_TOO_LONG: 'validation.displayNameTooLong',
    BIO_TOO_LONG: 'validation.bioTooLong',
    INVALID_AMOUNT: 'validation.invalidAmount',
    AMOUNT_TOO_LOW: 'validation.amountTooLow',
    AMOUNT_TOO_HIGH: 'validation.amountTooHigh',
    INVALID_FILE_TYPE: 'validation.invalidFileType',
    FILE_TOO_LARGE: 'validation.fileTooLarge'
  },
  
  // Success messages
  SUCCESS: {
    PROFILE_UPDATED: 'success.profileUpdated',
    COMMUNITY_CREATED: 'success.communityCreated',
    COMMUNITY_JOINED: 'success.communityJoined',
    PAYMENT_COMPLETED: 'success.paymentCompleted',
    MESSAGE_SENT: 'success.messageSent',
    FILE_UPLOADED: 'success.fileUploaded',
    SETTINGS_SAVED: 'success.settingsSaved'
  },
  
  // Error messages
  ERROR: {
    GENERIC: 'error.generic',
    NETWORK: 'error.network',
    SERVER: 'error.server',
    UNAUTHORIZED: 'error.unauthorized',
    SESSION_EXPIRED: 'error.sessionExpired',
    PAYMENT_FAILED: 'error.paymentFailed',
    COMMUNITY_FULL: 'error.communityFull',
    INSUFFICIENT_BALANCE: 'error.insufficientBalance',
    RATE_LIMIT_EXCEEDED: 'error.rateLimitExceeded'
  },
  
  // Time and dates
  TIME: {
    NOW: 'time.now',
    JUST_NOW: 'time.justNow',
    MINUTES_AGO: 'time.minutesAgo',
    HOURS_AGO: 'time.hoursAgo',
    DAYS_AGO: 'time.daysAgo',
    WEEKS_AGO: 'time.weeksAgo',
    MONTHS_AGO: 'time.monthsAgo',
    YEARS_AGO: 'time.yearsAgo',
    YESTERDAY: 'time.yesterday',
    TODAY: 'time.today',
    TOMORROW: 'time.tomorrow'
  },
  
  // Units and formatting
  UNIT: {
    BYTES: 'unit.bytes',
    KB: 'unit.kb',
    MB: 'unit.mb',
    GB: 'unit.gb',
    MBPS: 'unit.mbps',
    MS: 'unit.ms',
    SECONDS: 'unit.seconds',
    MINUTES: 'unit.minutes',
    HOURS: 'unit.hours',
    DAYS: 'unit.days',
    CURRENCY_USD: 'unit.currencyUsd',
    CURRENCY_MXN: 'unit.currencyMxn'
  }
} as const

// === Locale Configuration ===

export const LOCALE_CONFIG = {
  // Date/time formatting
  DATE_FORMAT: {
    [LOCALES.EN]: 'MM/dd/yyyy',
    [LOCALES.ES]: 'dd/MM/yyyy',
    [LOCALES.ES_MX]: 'dd/MM/yyyy',
    [LOCALES.PT]: 'dd/MM/yyyy',
    [LOCALES.PT_BR]: 'dd/MM/yyyy',
    [LOCALES.FR]: 'dd/MM/yyyy',
    [LOCALES.DE]: 'dd.MM.yyyy',
    [LOCALES.IT]: 'dd/MM/yyyy',
    [LOCALES.JA]: 'yyyy/MM/dd',
    [LOCALES.KO]: 'yyyy.MM.dd',
    [LOCALES.ZH]: 'yyyy/MM/dd',
    [LOCALES.ZH_TW]: 'yyyy/MM/dd',
    [LOCALES.RU]: 'dd.MM.yyyy',
    [LOCALES.AR]: 'dd/MM/yyyy',
    [LOCALES.HI]: 'dd/MM/yyyy'
  },
  
  // Number formatting
  NUMBER_FORMAT: {
    [LOCALES.EN]: { decimal: '.', thousand: ',' },
    [LOCALES.ES]: { decimal: ',', thousand: '.' },
    [LOCALES.ES_MX]: { decimal: '.', thousand: ',' },
    [LOCALES.PT]: { decimal: ',', thousand: '.' },
    [LOCALES.PT_BR]: { decimal: ',', thousand: '.' },
    [LOCALES.FR]: { decimal: ',', thousand: ' ' },
    [LOCALES.DE]: { decimal: ',', thousand: '.' },
    [LOCALES.IT]: { decimal: ',', thousand: '.' },
    [LOCALES.JA]: { decimal: '.', thousand: ',' },
    [LOCALES.KO]: { decimal: '.', thousand: ',' },
    [LOCALES.ZH]: { decimal: '.', thousand: ',' },
    [LOCALES.ZH_TW]: { decimal: '.', thousand: ',' },
    [LOCALES.RU]: { decimal: ',', thousand: ' ' },
    [LOCALES.AR]: { decimal: '.', thousand: ',' },
    [LOCALES.HI]: { decimal: '.', thousand: ',' }
  },
  
  // Currency formatting
  CURRENCY_FORMAT: {
    [LOCALES.EN]: { symbol: '$', position: 'before' },
    [LOCALES.ES]: { symbol: '€', position: 'after' },
    [LOCALES.ES_MX]: { symbol: '$', position: 'before' },
    [LOCALES.PT]: { symbol: '€', position: 'after' },
    [LOCALES.PT_BR]: { symbol: 'R$', position: 'before' },
    [LOCALES.FR]: { symbol: '€', position: 'after' },
    [LOCALES.DE]: { symbol: '€', position: 'after' },
    [LOCALES.IT]: { symbol: '€', position: 'after' },
    [LOCALES.JA]: { symbol: '¥', position: 'before' },
    [LOCALES.KO]: { symbol: '₩', position: 'before' },
    [LOCALES.ZH]: { symbol: '¥', position: 'before' },
    [LOCALES.ZH_TW]: { symbol: 'NT$', position: 'before' },
    [LOCALES.RU]: { symbol: '₽', position: 'after' },
    [LOCALES.AR]: { symbol: '$', position: 'before' },
    [LOCALES.HI]: { symbol: '₹', position: 'before' }
  },
  
  // Text direction
  TEXT_DIRECTION: {
    [LOCALES.EN]: 'ltr',
    [LOCALES.ES]: 'ltr',
    [LOCALES.ES_MX]: 'ltr',
    [LOCALES.PT]: 'ltr',
    [LOCALES.PT_BR]: 'ltr',
    [LOCALES.FR]: 'ltr',
    [LOCALES.DE]: 'ltr',
    [LOCALES.IT]: 'ltr',
    [LOCALES.JA]: 'ltr',
    [LOCALES.KO]: 'ltr',
    [LOCALES.ZH]: 'ltr',
    [LOCALES.ZH_TW]: 'ltr',
    [LOCALES.RU]: 'ltr',
    [LOCALES.AR]: 'rtl',
    [LOCALES.HI]: 'ltr'
  }
} as const

// === Language Detection ===

export const BROWSER_LANGUAGE_MAP = {
  'en': LOCALES.EN,
  'en-US': LOCALES.EN,
  'en-GB': LOCALES.EN,
  'es': LOCALES.ES,
  'es-ES': LOCALES.ES,
  'es-MX': LOCALES.ES_MX,
  'pt': LOCALES.PT,
  'pt-PT': LOCALES.PT,
  'pt-BR': LOCALES.PT_BR,
  'fr': LOCALES.FR,
  'fr-FR': LOCALES.FR,
  'de': LOCALES.DE,
  'de-DE': LOCALES.DE,
  'it': LOCALES.IT,
  'it-IT': LOCALES.IT,
  'ja': LOCALES.JA,
  'ja-JP': LOCALES.JA,
  'ko': LOCALES.KO,
  'ko-KR': LOCALES.KO,
  'zh': LOCALES.ZH,
  'zh-CN': LOCALES.ZH,
  'zh-TW': LOCALES.ZH_TW,
  'ru': LOCALES.RU,
  'ru-RU': LOCALES.RU,
  'ar': LOCALES.AR,
  'hi': LOCALES.HI,
  'hi-IN': LOCALES.HI
} as const

// === Type Definitions ===

export type Locale = typeof LOCALES[keyof typeof LOCALES]
export type I18nKey = typeof I18N_KEYS[keyof typeof I18N_KEYS]
export type LocaleRegion = keyof typeof LOCALE_REGIONS

// === Helper Functions ===

export const isValidLocale = (locale: string): locale is Locale => {
  return Object.values(LOCALES).includes(locale as Locale)
}

export const getDefaultLocaleForRegion = (region: keyof typeof LOCALE_REGIONS): Locale => {
  return LOCALE_REGIONS[region][0] || DEFAULT_LOCALE
}

export const getBrowserLocale = (): Locale => {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE
  
  const browserLang = navigator.language || navigator.languages?.[0]
  if (!browserLang) return DEFAULT_LOCALE
  
  // Try exact match first
  if (browserLang in BROWSER_LANGUAGE_MAP) {
    return BROWSER_LANGUAGE_MAP[browserLang as keyof typeof BROWSER_LANGUAGE_MAP]
  }
  
  // Try language without region
  const langOnly = browserLang.split('-')[0]
  if (langOnly in BROWSER_LANGUAGE_MAP) {
    return BROWSER_LANGUAGE_MAP[langOnly as keyof typeof BROWSER_LANGUAGE_MAP]
  }
  
  return DEFAULT_LOCALE
}

export const getTextDirection = (locale: Locale): 'ltr' | 'rtl' => {
  return LOCALE_CONFIG.TEXT_DIRECTION[locale] as 'ltr' | 'rtl'
}

export const isRTL = (locale: Locale): boolean => {
  return getTextDirection(locale) === 'rtl'
}

// === Export Lists ===

export const LOCALE_OPTIONS = Object.values(LOCALES)
export const SUPPORTED_LOCALES = Object.values(LOCALES)
export const LOCALE_REGION_OPTIONS = Object.keys(LOCALE_REGIONS) as LocaleRegion[]

// === Country to Locale Mapping ===

export const COUNTRY_TO_LOCALE = {
  'US': LOCALES.EN,
  'CA': LOCALES.EN,
  'GB': LOCALES.EN,
  'AU': LOCALES.EN,
  'NZ': LOCALES.EN,
  'MX': LOCALES.ES_MX,
  'ES': LOCALES.ES,
  'AR': LOCALES.ES,
  'CO': LOCALES.ES,
  'CL': LOCALES.ES,
  'PE': LOCALES.ES,
  'VE': LOCALES.ES,
  'BR': LOCALES.PT_BR,
  'PT': LOCALES.PT,
  'FR': LOCALES.FR,
  'DE': LOCALES.DE,
  'IT': LOCALES.IT,
  'JP': LOCALES.JA,
  'KR': LOCALES.KO,
  'CN': LOCALES.ZH,
  'TW': LOCALES.ZH_TW,
  'HK': LOCALES.ZH_TW,
  'RU': LOCALES.RU,
  'SA': LOCALES.AR,
  'AE': LOCALES.AR,
  'IN': LOCALES.HI
} as const

export const getLocaleForCountry = (countryCode: string): Locale => {
  return COUNTRY_TO_LOCALE[countryCode as keyof typeof COUNTRY_TO_LOCALE] || DEFAULT_LOCALE
}