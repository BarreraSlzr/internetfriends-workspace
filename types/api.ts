// InternetFriends API Types
// Shared type definitions for API communication between frontend and backend

import { NextRequest, NextResponse } from 'next/server'

// Base API Response Structure
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
  meta?: {
    timestamp: string
    requestId: string
    version: string
  }
}

// Standardized API Error Types
export interface ApiError {
  code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'UNAUTHORIZED' | 'SERVER_ERROR' | 'RATE_LIMITED' | 'FORBIDDEN'
  message: string
  details?: Record<string, unknown>
  statusCode: number
}

// HTTP Methods and Status Codes
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'HEAD' | 'OPTIONS'
export type HttpStatusCode = 200 | 201 | 204 | 400 | 401 | 403 | 404 | 409 | 422 | 429 | 500 | 503

// API Route Handler Types (for Next.js 15 compatibility)
export type ApiRouteHandler<T = unknown> = (
  request: NextRequest,
  context?: { params?: Record<string, string> }
) => Promise<NextResponse<ApiResponse<T>>>

// Generic API Request/Response Types
export interface PaginationParams {
  page?: number
  limit?: number
  offset?: number
  sort?: string
  order?: 'asc' | 'desc'
}

export interface PaginatedResponse<T> {
  items: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

// Authentication Types
export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: string
  tokenType: 'Bearer'
}

export interface AuthUser {
  id: string
  email: string
  username: string
  displayName: string
  avatar?: string
  isVerified: boolean
  roles: string[]
  permissions: string[]
}

export interface AuthRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface AuthResponse extends ApiResponse<{
  user: AuthUser
  tokens: AuthTokens
}> {}

// Profile API Types
export interface ProfileUpdateRequest {
  displayName?: string
  bio?: string
  avatar?: string
  location?: {
    city?: string
    country?: string
    isPublic?: boolean
  }
  preferences?: {
    sharingEnabled?: boolean
    discoverable?: boolean
    notifications?: {
      newRequests?: boolean
      gEarned?: boolean
      levelUp?: boolean
      communityInvites?: boolean
    }
  }
}

export interface ProfileResponse extends ApiResponse<FriendsProfile> {}

// G's Balance and Economy Types
export interface BalanceUpdateRequest {
  amount: number
  reason: 'bandwidth_sharing' | 'achievement' | 'purchase' | 'transfer' | 'reward' | 'refund'
  metadata?: Record<string, unknown>
}

export interface BalanceResponse extends ApiResponse<{
  balance: number
  totalEarned: number
  lastUpdated: string
}> {}

export interface TransactionRecord {
  id: string
  amount: number
  type: 'credit' | 'debit'
  reason: string
  timestamp: string
  metadata?: Record<string, unknown>
}

export interface TransactionHistoryResponse extends ApiResponse<PaginatedResponse<TransactionRecord>> {}

// Payment API Types
export interface PaymentInitiationRequest {
  amount: number
  gsAmount: number
  provider: PaymentProvider
  currency: 'USD' | 'MXN'
  metadata?: Record<string, unknown>
}

export interface PaymentInitiationResponse extends ApiResponse<{
  sessionId: string
  checkoutUrl: string
  provider: PaymentProvider
  expiresAt: string
}> {}

export interface PaymentCompletionRequest {
  sessionId: string
  providerTransactionId: string
  amount: number
  gsAmount: number
  status: 'completed' | 'failed' | 'cancelled'
}

export interface PaymentCompletionResponse extends ApiResponse<{
  transactionId: string
  balanceUpdated: boolean
  newBalance: number
}> {}

// Community API Types
export interface CommunityCreateRequest {
  name: string
  description: string
  isPrivate: boolean
  maxMembers?: number
  tags?: string[]
}

export interface CommunityResponse extends ApiResponse<Community> {}

export interface CommunityListResponse extends ApiResponse<PaginatedResponse<Community>> {}

export interface CommunityInviteRequest {
  communityId: string
  userId: string
  message?: string
}

export interface CommunityInviteResponse extends ApiResponse<CommunityInvite> {}

// Bandwidth Sharing API Types
export interface BandwidthShareRequest {
  requestId: string
  bytesShared: number
  durationMs: number
  quality: 'low' | 'medium' | 'high'
}

export interface BandwidthShareResponse extends ApiResponse<{
  gEarned: number
  newBalance: number
  achievementsUnlocked: string[]
}> {}

// Achievement API Types
export interface AchievementUnlockRequest {
  achievementId: string
  metadata?: Record<string, unknown>
}

export interface AchievementUnlockResponse extends ApiResponse<{
  achievement: Achievement
  gReward: number
  newBalance: number
}> {}

// Leaderboard API Types
export interface LeaderboardRequest extends PaginationParams {
  category: 'gs' | 'bandwidth' | 'communities' | 'reputation'
  timeframe?: 'daily' | 'weekly' | 'monthly' | 'all'
}

export interface LeaderboardResponse extends ApiResponse<PaginatedResponse<LeaderboardEntry>> {}

export interface LeaderboardEntry {
  rank: number
  profile: Pick<FriendsProfile, 'id' | 'username' | 'displayName' | 'avatar' | 'gLevel'>
  value: number
  change: number // position change from previous period
}

// File Upload Types
export interface FileUploadRequest {
  file: File
  type: 'avatar' | 'community_banner' | 'attachment'
  maxSize?: number
}

export interface FileUploadResponse extends ApiResponse<{
  url: string
  filename: string
  size: number
  mimeType: string
}> {}

// Search API Types
export interface SearchRequest extends PaginationParams {
  query: string
  type: 'users' | 'communities' | 'all'
  filters?: Record<string, unknown>
}

export interface SearchResponse extends ApiResponse<{
  users: PaginatedResponse<Pick<FriendsProfile, 'id' | 'username' | 'displayName' | 'avatar' | 'gLevel'>>
  communities: PaginatedResponse<Pick<Community, 'id' | 'name' | 'description' | 'memberCount' | 'isPrivate'>>
}> {}

// Validation Error Types
export interface ValidationError {
  field: string
  message: string
  code: string
  value?: unknown
}

export interface ValidationErrorResponse extends ApiResponse<never> {
  error: {
    code: 'VALIDATION_ERROR'
    message: string
    details: {
      fields: ValidationError[]
    }
  }
}

// Rate Limiting Types
export interface RateLimitInfo {
  limit: number
  remaining: number
  resetTime: string
  retryAfter?: number
}

export interface RateLimitResponse extends ApiResponse<never> {
  error: {
    code: 'RATE_LIMITED'
    message: string
    details: RateLimitInfo
  }
}

// WebSocket API Types
export interface WebSocketMessage<T = unknown> {
  type: string
  data: T
  timestamp: string
  id: string
}

export interface WebSocketAuth {
  token: string
  userId: string
}

// Utility Types for API Development
export type ApiEndpoint = 'auth' | 'profile' | 'balance' | 'payments' | 'communities' | 'bandwidth' | 'achievements' | 'leaderboard' | 'search' | 'files'

export type ApiVersion = 'v1' | 'v2'

export interface ApiRouteConfig {
  endpoint: ApiEndpoint
  version: ApiVersion
  methods: HttpMethod[]
  authentication: boolean
  rateLimit?: {
    requests: number
    windowMs: number
  }
}

// Type Guards for Runtime Validation
export const isApiResponse = <T>(value: unknown): value is ApiResponse<T> => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'success' in value &&
    typeof (value as ApiResponse).success === 'boolean'
  )
}

export const isApiError = (value: unknown): value is ApiError => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'code' in value &&
    'message' in value &&
    'statusCode' in value
  )
}

// Helper Functions
export const createApiResponse = <T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> => ({
  success: true,
  data,
  meta: meta || {
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    version: 'v1'
  }
})

export const createApiError = (error: ApiError): ApiResponse<never> => ({
  success: false,
  error: {
    code: error.code,
    message: error.message,
    details: error.details
  },
  meta: {
    timestamp: new Date().toISOString(),
    requestId: `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    version: 'v1'
  }
})

// Import shared data types (will be defined in separate files)
export type { FriendsProfile, Community, CommunityInvite, Achievement, PaymentProvider } from './data'