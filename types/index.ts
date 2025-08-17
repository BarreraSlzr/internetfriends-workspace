// InternetFriends Type System - Main Index
// Central export point for all shared types across the application

// === Core Data Types ===
export type {
  FriendsProfile,
  GLevelTier,
  Achievement,
  Community,
  CommunityInvite,
  CommunityMember,
  PaymentProvider,
  PaymentConfig,
  PaymentTransaction,
  GSPurchaseTier,
  BandwidthRequest,
  BandwidthSession,
  Message,
  Conversation,
  Notification,
  UserAnalytics,
  SystemMetrics,
  RequiredFields,
  OptionalFields,
  UpdateFields,
  DEFAULT_G_LEVEL,
  PAYMENT_PROVIDERS,
  ACHIEVEMENT_RARITIES,
  COMMUNITY_MEMBER_ROLES,
  NOTIFICATION_PRIORITIES
} from './data'

// === API Types ===
export type {
  ApiResponse,
  ApiError,
  HttpMethod,
  HttpStatusCode,
  ApiRouteHandler,
  PaginationParams,
  PaginatedResponse,
  AuthTokens,
  AuthUser,
  AuthRequest,
  AuthResponse,
  ProfileUpdateRequest,
  ProfileResponse,
  BalanceUpdateRequest,
  BalanceResponse,
  TransactionRecord,
  TransactionHistoryResponse,
  PaymentInitiationRequest,
  PaymentInitiationResponse,
  PaymentCompletionRequest,
  PaymentCompletionResponse,
  CommunityCreateRequest,
  CommunityResponse,
  CommunityListResponse,
  CommunityInviteRequest,
  CommunityInviteResponse,
  BandwidthShareRequest,
  BandwidthShareResponse,
  AchievementUnlockRequest,
  AchievementUnlockResponse,
  LeaderboardRequest,
  LeaderboardResponse,
  LeaderboardEntry,
  FileUploadRequest,
  FileUploadResponse,
  SearchRequest,
  SearchResponse,
  ValidationError,
  ValidationErrorResponse,
  RateLimitInfo,
  RateLimitResponse,
  WebSocketMessage,
  WebSocketAuth,
  ApiEndpoint,
  ApiVersion,
  ApiRouteConfig,
  isApiResponse,
  isApiError,
  createApiResponse,
  createApiError
} from './api'

// === Component Types ===
export type {
  BaseComponentProps,
  ButtonAtomicProps,
  GlassCardProps,
  HeaderAtomicProps,
  GlooPaletteStrategy,
  GlooThemeMode,
  GlooEffectName,
  GlooCanvasProps,
  GlooGlobalProps,
  NavigationItem,
  NavigationProps,
  GSPurchaseStoreProps,
  ProfileComponentProps,
  CommunityCardProps,
  LeaderboardProps,
  AchievementDisplayProps,
  HeroTextProps,
  FormProps,
  FormFieldProps,
  ModalProps,
  SizeVariant,
  ColorVariant,
  VisualVariant,
  LoadingState,
  AnimationDirection,
  PolymorphicProps,
  ComponentState,
  ClickHandler,
  ChangeHandler,
  SubmitHandler,
  RenderProp,
  ChildrenRenderProp,
  ForwardedRef,
  ComponentWithRef,
  ComponentRegistryItem,
  ComponentRegistryFilter,
  ThemeConfig,
  ThemeContextValue,
  PerformanceMetrics,
  OptimizationConfig,
  isHeroTextProps,
  isButtonAtomicProps,
  BUTTON_ATOMIC_DEFAULTS,
  GLOO_CANVAS_DEFAULTS
} from './components'

// === Validation Schemas ===
export {
  // Base schemas
  IdSchema,
  UsernameSchema,
  EmailSchema,
  PasswordSchema,
  DisplayNameSchema,
  BioSchema,
  CountryCodeSchema,
  CurrencySchema,
  
  // Profile schemas
  GLevelTierSchema,
  GSAmountSchema,
  PriceSchema,
  LocationSchema,
  ReputationSchema,
  ProfileStatsSchema,
  NotificationPreferencesSchema,
  ProfilePreferencesSchema,
  AchievementSchema,
  FriendsProfileSchema,
  ProfileUpdateSchema,
  
  // Payment schemas
  PaymentProviderSchema,
  PaymentConfigSchema,
  GSPurchaseTierSchema,
  PaymentInitiationSchema,
  PaymentCompletionSchema,
  PaymentTransactionSchema,
  
  // Community schemas
  CommunitySettingsSchema,
  CommunityStatsSchema,
  CommunitySchema,
  CommunityCreateSchema,
  CommunityInviteSchema,
  CommunityInviteCreateSchema,
  
  // Bandwidth schemas
  BandwidthRequestSchema,
  BandwidthShareRequestSchema,
  
  // API schemas
  ApiErrorSchema,
  ApiResponseMetaSchema,
  ApiResponseSchema,
  PaginationParamsSchema,
  PaginatedResponseSchema,
  
  // Form schemas
  AuthRequestSchema,
  RegistrationRequestSchema,
  PasswordResetRequestSchema,
  PasswordResetConfirmSchema,
  FileUploadSchema,
  SearchRequestSchema,
  
  // Validation utilities
  validateWithSchema,
  createValidationMiddleware,
  validateProfile,
  validateProfileUpdate,
  validateCommunity,
  validateCommunityCreate,
  validatePaymentInitiation,
  validatePaymentCompletion,
  validateBandwidthRequest,
  validateAuthRequest,
  validateRegistrationRequest,
  
  // Inferred types
  type FriendsProfileType,
  type ProfileUpdateType,
  type CommunityType,
  type CommunityCreateType,
  type PaymentInitiationType,
  type PaymentCompletionType,
  type BandwidthRequestType,
  type AuthRequestType,
  type RegistrationRequestType,
  type ApiResponseType,
  type PaginatedResponseType
} from '../schemas/validation'

// === Type Guards ===
export {
  isFriendsProfile,
  isGLevelTier,
  isCommunity,
  isPaymentTransaction
} from './data'

// === Legacy Type Compatibility ===
// For backward compatibility with existing code

export type Profile = FriendsProfile
export type User = FriendsProfile
export type GLevel = GLevelTier
export type PaymentMethod = PaymentProvider

// === Utility Types ===

// Helper type for making certain fields required
export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>

// Helper type for making certain fields optional
export type WithOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>

// Helper type for API endpoint responses
export type ApiEndpointResponse<T> = ApiResponse<T>

// Helper type for paginated API responses
export type ApiPaginatedResponse<T> = ApiResponse<PaginatedResponse<T>>

// Helper type for async functions that return API responses
export type AsyncApiResponse<T> = Promise<ApiResponse<T>>

// Helper type for component props with ref
export type ComponentPropsWithRef<T, R = HTMLElement> = T & {
  ref?: React.Ref<R>
}

// Helper type for strict component props (no additional props allowed)
export type StrictComponentProps<T> = T & {
  [K in Exclude<string, keyof T>]: never
}

// === Constants ===

export const FRONTEND_ROUTES = {
  HOME: '/',
  PROFILE: '/profile',
  COMMUNITIES: '/communities',
  PURCHASE: '/purchase',
  LEADERBOARD: '/leaderboard',
  SETTINGS: '/settings'
} as const

export const API_ROUTES = {
  AUTH: '/api/auth',
  PROFILE: '/api/profile',
  COMMUNITIES: '/api/communities',
  PAYMENTS: '/api/payments',
  BANDWIDTH: '/api/bandwidth',
  ACHIEVEMENTS: '/api/achievements'
} as const

export const VALIDATION_ERRORS = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_USERNAME: 'Username can only contain letters, numbers, underscores, and hyphens',
  PASSWORD_TOO_SHORT: 'Password must be at least 8 characters',
  PASSWORD_WEAK: 'Password must contain uppercase, lowercase, and numbers',
  PROFILE_NAME_TOO_LONG: 'Display name cannot exceed 50 characters',
  BIO_TOO_LONG: 'Bio cannot exceed 500 characters'
} as const

export const HTTP_STATUS_CODES = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

// === Development Utilities ===

// Type to extract all string literal types from an object
export type ExtractStringLiterals<T> = T extends string ? T : never

// Type to check if all properties of an object are optional
export type AllOptional<T> = Partial<T> extends T ? true : false

// Type to get only the required properties of an object
export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T]

// Type to get only the optional properties of an object
export type OptionalKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? K : never
}[keyof T]