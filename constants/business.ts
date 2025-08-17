// InternetFriends Business Logic Constants
// Core business rules, G-level system, and application-specific constants

// === G-Level System Constants ===

export const G_LEVELS = {
  NEWBIE: 1,
  FRIEND: 2,
  CONNECTOR: 3,
  HUB: 4,
  NETWORK: 5,
  LEGEND: 6
} as const

export const G_LEVEL_NAMES = {
  [G_LEVELS.NEWBIE]: 'Newbie',
  [G_LEVELS.FRIEND]: 'Friend',
  [G_LEVELS.CONNECTOR]: 'Connector',
  [G_LEVELS.HUB]: 'Hub',
  [G_LEVELS.NETWORK]: 'Network',
  [G_LEVELS.LEGEND]: 'Legend'
} as const

export const G_LEVEL_COLORS = {
  [G_LEVELS.NEWBIE]: '#64748b',    // slate
  [G_LEVELS.FRIEND]: '#22c55e',    // green
  [G_LEVELS.CONNECTOR]: '#3b82f6', // blue
  [G_LEVELS.HUB]: '#8b5cf6',       // purple
  [G_LEVELS.NETWORK]: '#f59e0b',   // amber
  [G_LEVELS.LEGEND]: '#ef4444'     // red
} as const

export const G_LEVEL_THRESHOLDS = {
  [G_LEVELS.NEWBIE]: { min: 0, max: 99 },
  [G_LEVELS.FRIEND]: { min: 100, max: 499 },
  [G_LEVELS.CONNECTOR]: { min: 500, max: 1499 },
  [G_LEVELS.HUB]: { min: 1500, max: 4999 },
  [G_LEVELS.NETWORK]: { min: 5000, max: 14999 },
  [G_LEVELS.LEGEND]: { min: 15000, max: Infinity }
} as const

export const G_LEVEL_BANDWIDTH_MULTIPLIERS = {
  [G_LEVELS.NEWBIE]: 1.0,
  [G_LEVELS.FRIEND]: 1.1,
  [G_LEVELS.CONNECTOR]: 1.2,
  [G_LEVELS.HUB]: 1.35,
  [G_LEVELS.NETWORK]: 1.5,
  [G_LEVELS.LEGEND]: 1.75
} as const

export const G_LEVEL_COMMUNITY_LIMITS = {
  CREATE: {
    [G_LEVELS.NEWBIE]: 0,
    [G_LEVELS.FRIEND]: 1,
    [G_LEVELS.CONNECTOR]: 3,
    [G_LEVELS.HUB]: 5,
    [G_LEVELS.NETWORK]: 10,
    [G_LEVELS.LEGEND]: Infinity
  },
  JOIN: {
    [G_LEVELS.NEWBIE]: 3,
    [G_LEVELS.FRIEND]: 5,
    [G_LEVELS.CONNECTOR]: 10,
    [G_LEVELS.HUB]: 20,
    [G_LEVELS.NETWORK]: Infinity,
    [G_LEVELS.LEGEND]: Infinity
  }
} as const

// === Payment System Constants ===

export const PAYMENT_PROVIDERS = {
  PAYPAL: 'paypal',
  APPLE_PAY: 'apple_pay',
  GOOGLE_PAY: 'google_pay',
  STRIPE: 'stripe',
  MERCADO_PAGO: 'mercado_pago',
  OXXO: 'oxxo',
  GUMROAD: 'gumroad',
  REVENUECAT: 'revenuecat',
  POLAR: 'polar',
  LEMONSQUEEZY: 'lemonsqueezy',
  SLASH: 'slash'
} as const

export const PAYMENT_STATUSES = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded'
} as const

export const PAYMENT_CURRENCIES = {
  USD: 'USD',
  MXN: 'MXN'
} as const

export const PAYMENT_FRICTION_LEVELS = {
  ULTRA_LOW: 'ultra_low',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const

export const PAYMENT_DEMOGRAPHICS = {
  ALL: 'all',
  MOBILE: 'mobile',
  DESKTOP: 'desktop',
  GAMING: 'gaming',
  PROFESSIONAL: 'professional'
} as const

export const MEXICAN_TAX_SUPPORT = {
  NATIVE: 'native',
  WEBHOOK: 'webhook',
  MANUAL: 'manual'
} as const

// === Purchase Tier Constants ===

export const GS_PURCHASE_TIERS = {
  STARTER: {
    id: 'starter',
    name: 'Starter Pack',
    gs_amount: 100,
    price_usd: 4.99,
    bonus_gs: 10,
    popular: false
  },
  POPULAR: {
    id: 'popular',
    name: 'Popular Pack',
    gs_amount: 500,
    price_usd: 19.99,
    bonus_gs: 75,
    popular: true
  },
  VALUE: {
    id: 'value',
    name: 'Value Pack',
    gs_amount: 1000,
    price_usd: 34.99,
    bonus_gs: 200,
    popular: false
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium Pack',
    gs_amount: 2500,
    price_usd: 79.99,
    bonus_gs: 600,
    popular: false
  },
  LEGEND: {
    id: 'legend',
    name: 'Legend Pack',
    gs_amount: 5000,
    price_usd: 149.99,
    bonus_gs: 1500,
    popular: false
  }
} as const

// === Achievement System Constants ===

export const ACHIEVEMENT_RARITIES = {
  COMMON: 'common',
  RARE: 'rare',
  EPIC: 'epic',
  LEGENDARY: 'legendary'
} as const

export const ACHIEVEMENT_CATEGORIES = {
  BANDWIDTH: 'bandwidth',
  COMMUNITY: 'community',
  SOCIAL: 'social',
  SPECIAL: 'special'
} as const

export const ACHIEVEMENT_REWARDS = {
  [ACHIEVEMENT_RARITIES.COMMON]: 25,
  [ACHIEVEMENT_RARITIES.RARE]: 50,
  [ACHIEVEMENT_RARITIES.EPIC]: 100,
  [ACHIEVEMENT_RARITIES.LEGENDARY]: 500
} as const

// === Community System Constants ===

export const COMMUNITY_MEMBER_ROLES = {
  MEMBER: 'member',
  MODERATOR: 'moderator',
  ADMIN: 'admin'
} as const

export const COMMUNITY_MODERATION_LEVELS = {
  STRICT: 'strict',
  MODERATE: 'moderate',
  RELAXED: 'relaxed'
} as const

export const COMMUNITY_DEFAULTS = {
  AUTO_ACCEPT_MEMBERS: false,
  REQUIRE_INVITE: false,
  ALLOW_MEMBER_INVITES: true,
  MODERATION_LEVEL: COMMUNITY_MODERATION_LEVELS.MODERATE,
  IS_PRIVATE: false,
  MAX_MEMBERS: 1000
} as const

// === Bandwidth Sharing Constants ===

export const BANDWIDTH_REQUEST_TYPES = {
  CONNECTION_SHARING: 'connection_sharing',
  FILE_TRANSFER: 'file_transfer',
  STREAMING_ASSIST: 'streaming_assist',
  LATENCY_REDUCTION: 'latency_reduction'
} as const

export const BANDWIDTH_REQUEST_STATUSES = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled'
} as const

export const BANDWIDTH_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high',
  URGENT: 'urgent'
} as const

export const BANDWIDTH_QUALITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high'
} as const

export const BANDWIDTH_CONNECTION_TYPES = {
  DIRECT: 'direct',
  RELAY: 'relay',
  TUNNEL: 'tunnel'
} as const

// === Notification System Constants ===

export const NOTIFICATION_TYPES = {
  G_EARNED: 'g_earned',
  LEVEL_UP: 'level_up',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  COMMUNITY_INVITE: 'community_invite',
  BANDWIDTH_REQUEST: 'bandwidth_request',
  MESSAGE: 'message',
  SYSTEM: 'system'
} as const

export const NOTIFICATION_PRIORITIES = {
  LOW: 'low',
  NORMAL: 'normal',
  HIGH: 'high'
} as const

export const NOTIFICATION_CATEGORIES = {
  SOCIAL: 'social',
  FINANCIAL: 'financial',
  SYSTEM: 'system',
  ACHIEVEMENT: 'achievement'
} as const

// === Message System Constants ===

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
  BANDWIDTH_REQUEST: 'bandwidth_request'
} as const

export const CONVERSATION_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
  COMMUNITY: 'community'
} as const

// === Analytics Constants ===

export const ANALYTICS_PERIODS = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  MONTHLY: 'monthly'
} as const

export const ANALYTICS_TRENDS = {
  INCREASING: 'increasing',
  DECREASING: 'decreasing',
  STABLE: 'stable'
} as const

// === Country and Regional Constants ===

export const PRIORITY_COUNTRIES = {
  MEXICO: 'MX',
  UNITED_STATES: 'US',
  CANADA: 'CA',
  BRAZIL: 'BR',
  ARGENTINA: 'AR',
  COLOMBIA: 'CO',
  INDIA: 'IN'
} as const

export const REGIONAL_PREFERENCES = {
  NORTH_AMERICA: ['US', 'CA', 'MX'],
  LATIN_AMERICA: ['MX', 'BR', 'AR', 'CO'],
  EUROPE: ['DE', 'FR', 'IT', 'ES', 'UK'],
  ASIA_PACIFIC: ['IN', 'JP', 'AU', 'SG']
} as const

// === Business Rules ===

export const BUSINESS_LIMITS = {
  MIN_GS_PURCHASE: 1,
  MAX_GS_PURCHASE: 10000,
  MIN_BANDWIDTH_SHARE: 1, // MB
  MAX_BANDWIDTH_SHARE: 1000, // MB
  COMMUNITY_NAME_MIN_LENGTH: 3,
  COMMUNITY_NAME_MAX_LENGTH: 50,
  COMMUNITY_DESCRIPTION_MAX_LENGTH: 1000,
  BIO_MAX_LENGTH: 500,
  USERNAME_MIN_LENGTH: 3,
  USERNAME_MAX_LENGTH: 20,
  DISPLAY_NAME_MAX_LENGTH: 50,
  MESSAGE_MAX_LENGTH: 2000,
  INVITE_EXPIRY_DAYS: 7,
  SESSION_TIMEOUT_HOURS: 24,
  MAX_ACHIEVEMENTS_PER_USER: 100,
  MAX_COMMUNITIES_PER_USER: 50
} as const

// === Rate Limiting ===

export const RATE_LIMITS = {
  API_REQUESTS_PER_MINUTE: 60,
  PAYMENTS_PER_HOUR: 5,
  COMMUNITIES_CREATED_PER_DAY: 3,
  INVITES_SENT_PER_HOUR: 10,
  MESSAGES_PER_MINUTE: 20,
  BANDWIDTH_REQUESTS_PER_HOUR: 20
} as const

// === Mexican Tax Compliance ===

export const MEXICAN_TAX_THRESHOLDS = {
  INVOICE_REQUIRED_MXN: 2000,
  MONTHLY_LIMIT_MXN: 8000,
  ANNUAL_LIMIT_MXN: 96000
} as const

// === Economic Constants ===

export const ECONOMIC_INDICATORS = {
  BASE_G_PER_MB: 0.1,
  INFLATION_RATE_MONTHLY: 0.01,
  QUALITY_BONUS_MULTIPLIER: 1.5,
  PEAK_HOURS_MULTIPLIER: 1.2,
  WEEKEND_MULTIPLIER: 1.1
} as const

// === Type derivation ===

export type GLevel = typeof G_LEVELS[keyof typeof G_LEVELS]
export type PaymentProvider = typeof PAYMENT_PROVIDERS[keyof typeof PAYMENT_PROVIDERS]
export type PaymentStatus = typeof PAYMENT_STATUSES[keyof typeof PAYMENT_STATUSES]
export type PaymentCurrency = typeof PAYMENT_CURRENCIES[keyof typeof PAYMENT_CURRENCIES]
export type AchievementRarity = typeof ACHIEVEMENT_RARITIES[keyof typeof ACHIEVEMENT_RARITIES]
export type AchievementCategory = typeof ACHIEVEMENT_CATEGORIES[keyof typeof ACHIEVEMENT_CATEGORIES]
export type CommunityMemberRole = typeof COMMUNITY_MEMBER_ROLES[keyof typeof COMMUNITY_MEMBER_ROLES]
export type CommunityModerationLevel = typeof COMMUNITY_MODERATION_LEVELS[keyof typeof COMMUNITY_MODERATION_LEVELS]
export type BandwidthRequestType = typeof BANDWIDTH_REQUEST_TYPES[keyof typeof BANDWIDTH_REQUEST_TYPES]
export type BandwidthRequestStatus = typeof BANDWIDTH_REQUEST_STATUSES[keyof typeof BANDWIDTH_REQUEST_STATUSES]
export type BandwidthPriority = typeof BANDWIDTH_PRIORITIES[keyof typeof BANDWIDTH_PRIORITIES]
export type NotificationType = typeof NOTIFICATION_TYPES[keyof typeof NOTIFICATION_TYPES]
export type NotificationPriority = typeof NOTIFICATION_PRIORITIES[keyof typeof NOTIFICATION_PRIORITIES]
export type MessageType = typeof MESSAGE_TYPES[keyof typeof MESSAGE_TYPES]
export type ConversationType = typeof CONVERSATION_TYPES[keyof typeof CONVERSATION_TYPES]

// === Validation Helpers ===

export const isValidGLevel = (level: number): level is GLevel => {
  return Object.values(G_LEVELS).includes(level as GLevel)
}

export const isValidPaymentProvider = (provider: string): provider is PaymentProvider => {
  return Object.values(PAYMENT_PROVIDERS).includes(provider as PaymentProvider)
}

export const isValidPaymentStatus = (status: string): status is PaymentStatus => {
  return Object.values(PAYMENT_STATUSES).includes(status as PaymentStatus)
}

export const isValidAchievementRarity = (rarity: string): rarity is AchievementRarity => {
  return Object.values(ACHIEVEMENT_RARITIES).includes(rarity as AchievementRarity)
}

// === Helper Functions ===

export const calculateGLevel = (gsAmount: number): GLevel => {
  for (const [level, threshold] of Object.entries(G_LEVEL_THRESHOLDS)) {
    if (gsAmount >= threshold.min && gsAmount <= threshold.max) {
      return parseInt(level) as GLevel
    }
  }
  return G_LEVELS.NEWBIE
}

export const getGLevelInfo = (gsAmount: number) => {
  const level = calculateGLevel(gsAmount)
  return {
    level,
    name: G_LEVEL_NAMES[level],
    color: G_LEVEL_COLORS[level],
    threshold: G_LEVEL_THRESHOLDS[level],
    multiplier: G_LEVEL_BANDWIDTH_MULTIPLIERS[level],
    communityLimits: {
      create: G_LEVEL_COMMUNITY_LIMITS.CREATE[level],
      join: G_LEVEL_COMMUNITY_LIMITS.JOIN[level]
    }
  }
}

export const getNextLevelRequirement = (currentGs: number) => {
  const currentLevel = calculateGLevel(currentGs)
  const nextLevel = (currentLevel + 1) as GLevel
  
  if (!G_LEVEL_THRESHOLDS[nextLevel]) {
    return null // Already at max level
  }
  
  const gsNeeded = G_LEVEL_THRESHOLDS[nextLevel].min - currentGs
  return {
    nextLevel,
    gsNeeded,
    name: G_LEVEL_NAMES[nextLevel],
    threshold: G_LEVEL_THRESHOLDS[nextLevel]
  }
}

export const calculatePurchaseTierTotal = (tierId: keyof typeof GS_PURCHASE_TIERS) => {
  const tier = GS_PURCHASE_TIERS[tierId]
  return {
    ...tier,
    total_gs: tier.gs_amount + (tier.bonus_gs || 0)
  }
}

// === Export lists for dropdowns/selects ===

export const PAYMENT_PROVIDER_OPTIONS = Object.values(PAYMENT_PROVIDERS)
export const ACHIEVEMENT_RARITY_OPTIONS = Object.values(ACHIEVEMENT_RARITIES)
export const COMMUNITY_ROLE_OPTIONS = Object.values(COMMUNITY_MEMBER_ROLES)
export const BANDWIDTH_PRIORITY_OPTIONS = Object.values(BANDWIDTH_PRIORITIES)
export const G_LEVEL_OPTIONS = Object.values(G_LEVELS)