// InternetFriends Validation Schemas
// Shared Zod validation schemas for frontend and backend type safety

import { z } from 'zod'

// === Base Validation Schemas ===

export const IdSchema = z.string().min(1, 'ID is required')
export const UsernameSchema = z.string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username cannot exceed 20 characters')
  .regex(/^[a-zA-Z0-9_-]+$/, 'Username can only contain letters, numbers, underscores, and hyphens')

export const EmailSchema = z.string().email('Invalid email address')
export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number')

export const DisplayNameSchema = z.string()
  .min(1, 'Display name is required')
  .max(50, 'Display name cannot exceed 50 characters')

export const BioSchema = z.string()
  .max(500, 'Bio cannot exceed 500 characters')
  .optional()

export const CountryCodeSchema = z.string()
  .length(2, 'Country code must be 2 characters')
  .regex(/^[A-Z]{2}$/, 'Country code must be uppercase letters')

export const CurrencySchema = z.enum(['USD', 'MXN'])

// === G-Level and Economy Schemas ===

export const GLevelTierSchema = z.object({
  level: z.number().min(1).max(10),
  name: z.string().min(1),
  minGs: z.number().min(0),
  maxGs: z.number().min(0),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
  benefits: z.array(z.string()),
  communityCreateLimit: z.number().min(0),
  communityJoinLimit: z.number().min(0),
  bandwidthMultiplier: z.number().min(0),
  specialPerks: z.array(z.string())
})

export const GSAmountSchema = z.number()
  .min(0, 'G amount cannot be negative')
  .max(1000000, 'G amount too large')

export const PriceSchema = z.number()
  .min(0.01, 'Price must be at least $0.01')
  .max(10000, 'Price cannot exceed $10,000')

// === Profile Validation Schemas ===

export const LocationSchema = z.object({
  city: z.string().min(1, 'City is required'),
  country: CountryCodeSchema,
  isPublic: z.boolean().default(true)
}).optional()

export const ReputationSchema = z.object({
  score: z.number().min(0).max(100),
  reviews: z.number().min(0),
  avgRating: z.number().min(1).max(5)
})

export const ProfileStatsSchema = z.object({
  gBalance: GSAmountSchema,
  totalGsEarned: GSAmountSchema,
  bandwidthShared: z.number().min(0),
  connectionsHelped: z.number().min(0),
  communitiesCreated: z.number().min(0),
  communitiesJoined: z.number().min(0)
})

export const NotificationPreferencesSchema = z.object({
  newRequests: z.boolean().default(true),
  gEarned: z.boolean().default(true),
  levelUp: z.boolean().default(true),
  communityInvites: z.boolean().default(true)
})

export const ProfilePreferencesSchema = z.object({
  sharingEnabled: z.boolean().default(true),
  discoverable: z.boolean().default(true),
  notifications: NotificationPreferencesSchema
})

export const AchievementSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  description: z.string().min(1),
  icon: z.string().min(1),
  unlockedAt: z.date(),
  gReward: GSAmountSchema,
  rarity: z.enum(['common', 'rare', 'epic', 'legendary'])
})

export const FriendsProfileSchema = z.object({
  id: IdSchema,
  username: UsernameSchema,
  displayName: DisplayNameSchema,
  email: EmailSchema.optional(),
  avatar: z.string().url().optional(),
  bio: BioSchema,
  location: LocationSchema,
  joinedAt: z.date(),
  lastActive: z.date(),
  isOnline: z.boolean(),
  gLevel: GLevelTierSchema,
  reputation: ReputationSchema,
  stats: ProfileStatsSchema,
  preferences: ProfilePreferencesSchema,
  achievements: z.array(AchievementSchema),
  // Legacy fields for backward compatibility
  country: CountryCodeSchema.optional(),
  tax_id: z.string().optional(),
  gs_balance: GSAmountSchema.optional(),
  level: z.number().min(1).max(10).optional()
})

export const ProfileUpdateSchema = z.object({
  displayName: DisplayNameSchema.optional(),
  bio: BioSchema,
  avatar: z.string().url().optional(),
  location: LocationSchema,
  preferences: ProfilePreferencesSchema.optional()
}).partial()

// === Payment Validation Schemas ===

export const PaymentProviderSchema = z.enum([
  'paypal', 'apple_pay', 'google_pay', 'stripe', 'mercado_pago', 
  'oxxo', 'gumroad', 'revenuecat', 'polar', 'lemonsqueezy', 'slash'
])

export const PaymentConfigSchema = z.object({
  provider: PaymentProviderSchema,
  enabled: z.boolean(),
  priority: z.number().min(1),
  user_friction: z.enum(['ultra_low', 'low', 'medium', 'high']),
  setup_required: z.boolean(),
  mobile_optimized: z.boolean(),
  regional_preference: z.array(CountryCodeSchema),
  fee_percentage: z.number().min(0).max(20),
  fee_fixed: z.number().min(0),
  supports_instant: z.boolean(),
  supports_cash: z.boolean(),
  mexican_tax_support: z.enum(['native', 'webhook', 'manual']),
  user_demographic: z.enum(['all', 'mobile', 'desktop', 'gaming', 'professional']),
  supported_currencies: z.array(CurrencySchema)
})

export const GSPurchaseTierSchema = z.object({
  id: IdSchema,
  name: z.string().min(1),
  gs_amount: GSAmountSchema,
  price_usd: PriceSchema,
  price_mxn: PriceSchema.optional(),
  discount_percentage: z.number().min(0).max(100).optional(),
  popular: z.boolean().optional(),
  bonus_gs: GSAmountSchema.optional(),
  total_gs: GSAmountSchema,
  description: z.string().optional(),
  features: z.array(z.string()).optional()
})

export const PaymentInitiationSchema = z.object({
  amount: PriceSchema,
  gsAmount: GSAmountSchema,
  provider: PaymentProviderSchema,
  currency: CurrencySchema,
  metadata: z.record(z.unknown()).optional()
})

export const PaymentCompletionSchema = z.object({
  sessionId: IdSchema,
  providerTransactionId: z.string().min(1),
  amount: PriceSchema,
  gsAmount: GSAmountSchema,
  status: z.enum(['completed', 'failed', 'cancelled'])
})

export const PaymentTransactionSchema = z.object({
  id: IdSchema,
  userId: IdSchema,
  amount: PriceSchema,
  currency: CurrencySchema,
  gsAmount: GSAmountSchema,
  provider: PaymentProviderSchema,
  providerTransactionId: z.string(),
  status: z.enum(['pending', 'completed', 'failed', 'cancelled', 'refunded']),
  createdAt: z.date(),
  completedAt: z.date().optional(),
  failureReason: z.string().optional(),
  metadata: z.record(z.unknown()).optional()
})

// === Community Validation Schemas ===

export const CommunitySettingsSchema = z.object({
  autoAcceptMembers: z.boolean().default(false),
  requireInvite: z.boolean().default(false),
  allowMemberInvites: z.boolean().default(true),
  moderationLevel: z.enum(['strict', 'moderate', 'relaxed']).default('moderate')
})

export const CommunityStatsSchema = z.object({
  totalBandwidthShared: z.number().min(0),
  totalGsEarned: GSAmountSchema,
  activeConnections: z.number().min(0),
  averageResponseTime: z.number().min(0)
})

export const CommunitySchema = z.object({
  id: IdSchema,
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  createdAt: z.date(),
  createdById: IdSchema,
  memberCount: z.number().min(0),
  maxMembers: z.number().min(1).optional(),
  isPrivate: z.boolean(),
  tags: z.array(z.string()),
  banner: z.string().url().optional(),
  avatar: z.string().url().optional(),
  rules: z.array(z.string()).optional(),
  settings: CommunitySettingsSchema,
  stats: CommunityStatsSchema,
  moderators: z.array(IdSchema),
  categories: z.array(z.string())
})

export const CommunityCreateSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  isPrivate: z.boolean().default(false),
  maxMembers: z.number().min(1).optional(),
  tags: z.array(z.string()).optional()
})

export const CommunityInviteSchema = z.object({
  id: IdSchema,
  communityId: IdSchema,
  communityName: z.string().min(1),
  inviterId: IdSchema,
  inviterName: z.string().min(1),
  inviteeId: IdSchema,
  message: z.string().max(500).optional(),
  createdAt: z.date(),
  expiresAt: z.date(),
  status: z.enum(['pending', 'accepted', 'declined', 'expired']),
  metadata: z.record(z.unknown()).optional()
})

export const CommunityInviteCreateSchema = z.object({
  communityId: IdSchema,
  userId: IdSchema,
  message: z.string().max(500).optional()
})

// === Bandwidth Sharing Validation Schemas ===

export const BandwidthRequestSchema = z.object({
  id: IdSchema,
  requesterId: IdSchema,
  helperId: IdSchema.optional(),
  type: z.enum(['connection_sharing', 'file_transfer', 'streaming_assist', 'latency_reduction']),
  status: z.enum(['pending', 'active', 'completed', 'failed', 'cancelled']),
  priority: z.enum(['low', 'normal', 'high', 'urgent']),
  bytesRequested: z.number().min(1),
  bytesShared: z.number().min(0).optional(),
  estimatedGReward: GSAmountSchema,
  actualGReward: GSAmountSchema.optional(),
  createdAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  location: z.object({
    country: CountryCodeSchema,
    region: z.string(),
    coordinates: z.tuple([z.number(), z.number()]).optional()
  }).optional(),
  quality: z.object({
    minSpeed: z.number().min(0),
    maxLatency: z.number().min(0),
    reliabilityScore: z.number().min(0).max(100)
  }),
  metadata: z.record(z.unknown()).optional()
})

export const BandwidthShareRequestSchema = z.object({
  requestId: IdSchema,
  bytesShared: z.number().min(1),
  durationMs: z.number().min(1),
  quality: z.enum(['low', 'medium', 'high'])
})

// === API Response Validation Schemas ===

export const ApiErrorSchema = z.object({
  code: z.enum(['VALIDATION_ERROR', 'NOT_FOUND', 'UNAUTHORIZED', 'SERVER_ERROR', 'RATE_LIMITED', 'FORBIDDEN']),
  message: z.string().min(1),
  details: z.record(z.unknown()).optional(),
  statusCode: z.number().min(100).max(599)
})

export const ApiResponseMetaSchema = z.object({
  timestamp: z.string(),
  requestId: z.string(),
  version: z.string()
})

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) => z.object({
  success: z.boolean(),
  data: dataSchema.optional(),
  error: ApiErrorSchema.optional(),
  meta: ApiResponseMetaSchema.optional()
})

export const PaginationParamsSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).optional(),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('asc')
})

export const PaginatedResponseSchema = <T extends z.ZodTypeAny>(itemSchema: T) => z.object({
  items: z.array(itemSchema),
  pagination: z.object({
    page: z.number().min(1),
    limit: z.number().min(1),
    total: z.number().min(0),
    totalPages: z.number().min(0),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  })
})

// === Form Validation Schemas ===

export const AuthRequestSchema = z.object({
  email: EmailSchema,
  password: PasswordSchema,
  rememberMe: z.boolean().default(false)
})

export const RegistrationRequestSchema = z.object({
  username: UsernameSchema,
  email: EmailSchema,
  password: PasswordSchema,
  displayName: DisplayNameSchema,
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions'
  })
})

export const PasswordResetRequestSchema = z.object({
  email: EmailSchema
})

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1),
  password: PasswordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

// === File Upload Validation Schemas ===

export const FileUploadSchema = z.object({
  type: z.enum(['avatar', 'community_banner', 'attachment']),
  maxSize: z.number().min(1).optional()
})

// === Search Validation Schemas ===

export const SearchRequestSchema = z.object({
  query: z.string().min(1).max(100),
  type: z.enum(['users', 'communities', 'all']).default('all'),
  filters: z.record(z.unknown()).optional()
}).merge(PaginationParamsSchema)

// === Utility Functions for Validation ===

export const validateWithSchema = <T>(schema: z.ZodSchema<T>, data: unknown): { success: true; data: T } | { success: false; errors: z.ZodError } => {
  const result = schema.safeParse(data)
  if (result.success) {
    return { success: true, data: result.data }
  } else {
    return { success: false, errors: result.error }
  }
}

export const createValidationMiddleware = <T>(schema: z.ZodSchema<T>) => {
  return (data: unknown) => {
    const result = validateWithSchema(schema, data)
    if (!result.success) {
      throw new Error(`Validation failed: ${result.errors.message}`)
    }
    return result.data
  }
}

// === Pre-configured Validation Functions ===

export const validateProfile = createValidationMiddleware(FriendsProfileSchema)
export const validateProfileUpdate = createValidationMiddleware(ProfileUpdateSchema)
export const validateCommunity = createValidationMiddleware(CommunitySchema)
export const validateCommunityCreate = createValidationMiddleware(CommunityCreateSchema)
export const validatePaymentInitiation = createValidationMiddleware(PaymentInitiationSchema)
export const validatePaymentCompletion = createValidationMiddleware(PaymentCompletionSchema)
export const validateBandwidthRequest = createValidationMiddleware(BandwidthRequestSchema)
export const validateAuthRequest = createValidationMiddleware(AuthRequestSchema)
export const validateRegistrationRequest = createValidationMiddleware(RegistrationRequestSchema)

// === Type Inference Helpers ===

export type FriendsProfileType = z.infer<typeof FriendsProfileSchema>
export type ProfileUpdateType = z.infer<typeof ProfileUpdateSchema>
export type CommunityType = z.infer<typeof CommunitySchema>
export type CommunityCreateType = z.infer<typeof CommunityCreateSchema>
export type PaymentInitiationType = z.infer<typeof PaymentInitiationSchema>
export type PaymentCompletionType = z.infer<typeof PaymentCompletionSchema>
export type BandwidthRequestType = z.infer<typeof BandwidthRequestSchema>
export type AuthRequestType = z.infer<typeof AuthRequestSchema>
export type RegistrationRequestType = z.infer<typeof RegistrationRequestSchema>
export type ApiResponseType<T> = z.infer<ReturnType<typeof ApiResponseSchema<z.ZodSchema<T>>>>
export type PaginatedResponseType<T> = z.infer<ReturnType<typeof PaginatedResponseSchema<z.ZodSchema<T>>>>