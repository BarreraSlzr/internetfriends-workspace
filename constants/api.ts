// InternetFriends API and HTTP Constants
// Constants for API routes, HTTP status codes, and network communication

// === HTTP Status Codes ===

export const HTTP_STATUS = {
  // Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  
  // Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  
  // Client Errors
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  PAYMENT_REQUIRED: 402,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  REQUEST_TIMEOUT: 408,
  CONFLICT: 409,
  GONE: 410,
  PAYLOAD_TOO_LARGE: 413,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  
  // Server Errors
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504
} as const

// === HTTP Methods ===

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  PATCH: 'PATCH',
  DELETE: 'DELETE',
  HEAD: 'HEAD',
  OPTIONS: 'OPTIONS'
} as const

// === API Error Codes ===

export const API_ERROR_CODES = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  SERVER_ERROR: 'SERVER_ERROR',
  RATE_LIMITED: 'RATE_LIMITED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  INSUFFICIENT_BALANCE: 'INSUFFICIENT_BALANCE',
  COMMUNITY_FULL: 'COMMUNITY_FULL',
  BANDWIDTH_UNAVAILABLE: 'BANDWIDTH_UNAVAILABLE',
  DUPLICATE_USERNAME: 'DUPLICATE_USERNAME',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  MAINTENANCE_MODE: 'MAINTENANCE_MODE'
} as const

// === API Route Paths ===

export const API_ROUTES = {
  // Authentication
  AUTH: {
    BASE: '/api/auth',
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REGISTER: '/api/auth/register',
    REFRESH: '/api/auth/refresh',
    VERIFY_EMAIL: '/api/auth/verify-email',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password'
  },
  
  // Profile Management
  PROFILE: {
    BASE: '/api/profile',
    GET: '/api/profile',
    UPDATE: '/api/profile',
    AVATAR_UPLOAD: '/api/profile/avatar',
    DELETE: '/api/profile',
    STATS: '/api/profile/stats',
    ACHIEVEMENTS: '/api/profile/achievements'
  },
  
  // G's Balance and Economy
  BALANCE: {
    BASE: '/api/balance',
    GET: '/api/balance',
    UPDATE: '/api/balance',
    HISTORY: '/api/balance/history',
    TRANSFER: '/api/balance/transfer'
  },
  
  // Payment System
  PAYMENTS: {
    BASE: '/api/payments',
    INITIATE: '/api/payments/initiate',
    COMPLETE: '/api/payments/complete',
    HISTORY: '/api/payments/history',
    TIERS: '/api/payments/tiers',
    // Provider-specific
    STRIPE: {
      CREATE_SESSION: '/api/payments/stripe/create-session',
      WEBHOOK: '/api/payments/stripe/webhook'
    },
    PAYPAL: {
      CREATE_ORDER: '/api/payments/paypal/create-order',
      CAPTURE_ORDER: '/api/payments/paypal/capture-order',
      WEBHOOK: '/api/payments/paypal/webhook'
    },
    REVENUECAT: {
      PURCHASE: '/api/payments/revenuecat/purchase',
      WEBHOOK: '/api/payments/revenuecat/webhook'
    }
  },
  
  // Community System
  COMMUNITIES: {
    BASE: '/api/communities',
    LIST: '/api/communities',
    CREATE: '/api/communities',
    GET: '/api/communities/[id]',
    UPDATE: '/api/communities/[id]',
    DELETE: '/api/communities/[id]',
    JOIN: '/api/communities/[id]/join',
    LEAVE: '/api/communities/[id]/leave',
    MEMBERS: '/api/communities/[id]/members',
    INVITE: '/api/communities/[id]/invite',
    INVITES: '/api/communities/invites'
  },
  
  // Bandwidth Sharing
  BANDWIDTH: {
    BASE: '/api/bandwidth',
    REQUESTS: '/api/bandwidth/requests',
    CREATE_REQUEST: '/api/bandwidth/requests',
    ACCEPT_REQUEST: '/api/bandwidth/requests/[id]/accept',
    COMPLETE_REQUEST: '/api/bandwidth/requests/[id]/complete',
    SESSIONS: '/api/bandwidth/sessions',
    ANALYTICS: '/api/bandwidth/analytics'
  },
  
  // Achievements
  ACHIEVEMENTS: {
    BASE: '/api/achievements',
    LIST: '/api/achievements',
    UNLOCK: '/api/achievements/unlock',
    PROGRESS: '/api/achievements/progress'
  },
  
  // Leaderboard
  LEADERBOARD: {
    BASE: '/api/leaderboard',
    GS: '/api/leaderboard/gs',
    BANDWIDTH: '/api/leaderboard/bandwidth',
    COMMUNITIES: '/api/leaderboard/communities',
    REPUTATION: '/api/leaderboard/reputation'
  },
  
  // Search
  SEARCH: {
    BASE: '/api/search',
    USERS: '/api/search/users',
    COMMUNITIES: '/api/search/communities',
    GLOBAL: '/api/search/global'
  },
  
  // File Management
  FILES: {
    BASE: '/api/files',
    UPLOAD: '/api/files/upload',
    DELETE: '/api/files/[id]',
    GET: '/api/files/[id]'
  },
  
  // Notifications
  NOTIFICATIONS: {
    BASE: '/api/notifications',
    LIST: '/api/notifications',
    MARK_READ: '/api/notifications/[id]/read',
    MARK_ALL_READ: '/api/notifications/read-all',
    DELETE: '/api/notifications/[id]',
    PREFERENCES: '/api/notifications/preferences'
  },
  
  // Messaging
  MESSAGES: {
    BASE: '/api/messages',
    LIST: '/api/messages',
    SEND: '/api/messages',
    CONVERSATION: '/api/messages/conversation/[id]',
    MARK_READ: '/api/messages/[id]/read'
  },
  
  // Tax Compliance (Mexican)
  TAXES: {
    BASE: '/api/taxes',
    RESICO: {
      SUBMIT: '/api/taxes/resico/submit',
      STATUS: '/api/taxes/resico/status'
    }
  },
  
  // Analytics and Metrics
  ANALYTICS: {
    BASE: '/api/analytics',
    USER: '/api/analytics/user',
    SYSTEM: '/api/analytics/system',
    PERFORMANCE: '/api/analytics/performance'
  },
  
  // WebSocket
  WEBSOCKET: {
    BASE: '/api/ws',
    AUTH: '/api/ws/auth',
    CONNECT: '/api/ws/connect'
  }
} as const

// === Frontend Route Paths ===

export const FRONTEND_ROUTES = {
  HOME: '/',
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
    VERIFY_EMAIL: '/auth/verify-email'
  },
  PROFILE: {
    VIEW: '/profile',
    EDIT: '/profile/edit',
    USER: '/profile/[username]'
  },
  COMMUNITIES: {
    LIST: '/communities',
    CREATE: '/communities/create',
    VIEW: '/communities/[id]',
    EDIT: '/communities/[id]/edit'
  },
  PURCHASE: {
    BASE: '/purchase',
    SUCCESS: '/purchase/success',
    CANCEL: '/purchase/cancel'
  },
  LEADERBOARD: '/leaderboard',
  BANDWIDTH: {
    SHARE: '/bandwidth/share',
    REQUESTS: '/bandwidth/requests'
  },
  SETTINGS: {
    BASE: '/settings',
    PROFILE: '/settings/profile',
    NOTIFICATIONS: '/settings/notifications',
    PRIVACY: '/settings/privacy',
    BILLING: '/settings/billing'
  },
  HELP: {
    BASE: '/help',
    FAQ: '/help/faq',
    CONTACT: '/help/contact',
    DOCS: '/help/docs'
  },
  LEGAL: {
    TERMS: '/legal/terms',
    PRIVACY: '/legal/privacy',
    COOKIES: '/legal/cookies'
  }
} as const

// === API Versions ===

export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2'
} as const

// === Content Types ===

export const CONTENT_TYPES = {
  JSON: 'application/json',
  FORM_DATA: 'multipart/form-data',
  URL_ENCODED: 'application/x-www-form-urlencoded',
  TEXT: 'text/plain',
  HTML: 'text/html',
  XML: 'application/xml'
} as const

// === Request Headers ===

export const REQUEST_HEADERS = {
  AUTHORIZATION: 'Authorization',
  CONTENT_TYPE: 'Content-Type',
  ACCEPT: 'Accept',
  USER_AGENT: 'User-Agent',
  X_API_KEY: 'X-API-Key',
  X_REQUEST_ID: 'X-Request-ID',
  X_RATE_LIMIT: 'X-RateLimit-Limit',
  X_RATE_LIMIT_REMAINING: 'X-RateLimit-Remaining',
  X_RATE_LIMIT_RESET: 'X-RateLimit-Reset'
} as const

// === Response Headers ===

export const RESPONSE_HEADERS = {
  CONTENT_TYPE: 'Content-Type',
  CACHE_CONTROL: 'Cache-Control',
  ETAG: 'ETag',
  LAST_MODIFIED: 'Last-Modified',
  LOCATION: 'Location',
  X_TOTAL_COUNT: 'X-Total-Count',
  X_REQUEST_ID: 'X-Request-ID'
} as const

// === Cache Control Values ===

export const CACHE_CONTROL = {
  NO_CACHE: 'no-cache',
  NO_STORE: 'no-store',
  MUST_REVALIDATE: 'must-revalidate',
  PUBLIC: 'public',
  PRIVATE: 'private',
  MAX_AGE_HOUR: 'max-age=3600',
  MAX_AGE_DAY: 'max-age=86400',
  MAX_AGE_WEEK: 'max-age=604800'
} as const

// === WebSocket Event Types ===

export const WEBSOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  AUTHENTICATE: 'authenticate',
  MESSAGE: 'message',
  BANDWIDTH_REQUEST: 'bandwidth_request',
  BANDWIDTH_RESPONSE: 'bandwidth_response',
  G_EARNED: 'g_earned',
  LEVEL_UP: 'level_up',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  COMMUNITY_INVITE: 'community_invite',
  NOTIFICATION: 'notification',
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  TYPING_START: 'typing_start',
  TYPING_STOP: 'typing_stop'
} as const

// === Rate Limiting ===

export const RATE_LIMIT_WINDOWS = {
  MINUTE: 60 * 1000,      // 1 minute
  HOUR: 60 * 60 * 1000,   // 1 hour
  DAY: 24 * 60 * 60 * 1000 // 1 day
} as const

export const RATE_LIMITS_BY_ENDPOINT = {
  [API_ROUTES.AUTH.LOGIN]: { requests: 5, window: RATE_LIMIT_WINDOWS.MINUTE },
  [API_ROUTES.AUTH.REGISTER]: { requests: 3, window: RATE_LIMIT_WINDOWS.HOUR },
  [API_ROUTES.PAYMENTS.INITIATE]: { requests: 10, window: RATE_LIMIT_WINDOWS.HOUR },
  [API_ROUTES.COMMUNITIES.CREATE]: { requests: 3, window: RATE_LIMIT_WINDOWS.DAY },
  [API_ROUTES.MESSAGES.SEND]: { requests: 60, window: RATE_LIMIT_WINDOWS.MINUTE },
  [API_ROUTES.FILES.UPLOAD]: { requests: 20, window: RATE_LIMIT_WINDOWS.HOUR }
} as const

// === Request Timeouts ===

export const REQUEST_TIMEOUTS = {
  DEFAULT: 10000,      // 10 seconds
  UPLOAD: 60000,       // 1 minute
  PAYMENT: 30000,      // 30 seconds
  WEBSOCKET: 5000      // 5 seconds
} as const

// === File Upload Limits ===

export const FILE_UPLOAD_LIMITS = {
  AVATAR: {
    MAX_SIZE: 5 * 1024 * 1024,  // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
  },
  COMMUNITY_BANNER: {
    MAX_SIZE: 10 * 1024 * 1024, // 10MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
  },
  ATTACHMENT: {
    MAX_SIZE: 50 * 1024 * 1024, // 50MB
    ALLOWED_TYPES: ['*']
  }
} as const

// === Pagination Defaults ===

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  MAX_LIMIT: 100,
  SORT: 'createdAt',
  ORDER: 'desc'
} as const

// === Type derivation ===

export type HttpStatus = typeof HTTP_STATUS[keyof typeof HTTP_STATUS]
export type HttpMethod = typeof HTTP_METHODS[keyof typeof HTTP_METHODS]
export type ApiErrorCode = typeof API_ERROR_CODES[keyof typeof API_ERROR_CODES]
export type ApiVersion = typeof API_VERSIONS[keyof typeof API_VERSIONS]
export type ContentType = typeof CONTENT_TYPES[keyof typeof CONTENT_TYPES]
export type WebSocketEvent = typeof WEBSOCKET_EVENTS[keyof typeof WEBSOCKET_EVENTS]

// === Helper Functions ===

export const isSuccessStatus = (status: number): boolean => {
  return status >= 200 && status < 300
}

export const isClientError = (status: number): boolean => {
  return status >= 400 && status < 500
}

export const isServerError = (status: number): boolean => {
  return status >= 500 && status < 600
}

export const buildApiUrl = (endpoint: string, version: ApiVersion = API_VERSIONS.V1): string => {
  return `/api/${version}${endpoint}`
}

export const buildFrontendUrl = (path: string, params?: Record<string, string>): string => {
  let url = path
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url = url.replace(`[${key}]`, value)
    })
  }
  return url
}

export const getErrorMessage = (errorCode: ApiErrorCode): string => {
  const errorMessages: Record<ApiErrorCode, string> = {
    [API_ERROR_CODES.VALIDATION_ERROR]: 'Invalid input data',
    [API_ERROR_CODES.NOT_FOUND]: 'Resource not found',
    [API_ERROR_CODES.UNAUTHORIZED]: 'Authentication required',
    [API_ERROR_CODES.FORBIDDEN]: 'Access denied',
    [API_ERROR_CODES.SERVER_ERROR]: 'Internal server error',
    [API_ERROR_CODES.RATE_LIMITED]: 'Too many requests',
    [API_ERROR_CODES.PAYMENT_FAILED]: 'Payment processing failed',
    [API_ERROR_CODES.INSUFFICIENT_BALANCE]: 'Insufficient G balance',
    [API_ERROR_CODES.COMMUNITY_FULL]: 'Community is at capacity',
    [API_ERROR_CODES.BANDWIDTH_UNAVAILABLE]: 'Bandwidth sharing unavailable',
    [API_ERROR_CODES.DUPLICATE_USERNAME]: 'Username already exists',
    [API_ERROR_CODES.INVALID_CREDENTIALS]: 'Invalid email or password',
    [API_ERROR_CODES.TOKEN_EXPIRED]: 'Session expired',
    [API_ERROR_CODES.MAINTENANCE_MODE]: 'System under maintenance'
  }
  
  return errorMessages[errorCode] || 'Unknown error occurred'
}

// === Export lists for validation/dropdowns ===

export const HTTP_STATUS_OPTIONS = Object.values(HTTP_STATUS)
export const HTTP_METHOD_OPTIONS = Object.values(HTTP_METHODS)
export const API_ERROR_CODE_OPTIONS = Object.values(API_ERROR_CODES)
export const CONTENT_TYPE_OPTIONS = Object.values(CONTENT_TYPES)
export const WEBSOCKET_EVENT_OPTIONS = Object.values(WEBSOCKET_EVENTS)