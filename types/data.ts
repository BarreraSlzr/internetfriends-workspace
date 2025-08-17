// InternetFriends Data Models
// Shared data type definitions used across frontend and backend

// Core User and Profile Types
export interface FriendsProfile {
  id: string
  username: string
  displayName: string
  email?: string
  avatar?: string
  bio?: string
  location?: {
    city: string
    country: string
    isPublic: boolean
  }
  joinedAt: Date
  lastActive: Date
  isOnline: boolean
  gLevel: GLevelTier
  reputation: {
    score: number // 0-100
    reviews: number
    avgRating: number // 1-5 stars
  }
  stats: {
    gBalance: number
    totalGsEarned: number
    bandwidthShared: number // MB
    connectionsHelped: number
    communitiesCreated: number
    communitiesJoined: number
  }
  preferences: {
    sharingEnabled: boolean
    discoverable: boolean
    notifications: {
      newRequests: boolean
      gEarned: boolean
      levelUp: boolean
      communityInvites: boolean
    }
  }
  achievements: Achievement[]
  // Additional fields for API/database usage
  country?: string // Deprecated: use location.country
  tax_id?: string // For Mexican tax compliance
  gs_balance?: number // Deprecated: use stats.gBalance
  level?: number // Deprecated: use gLevel.level
}

// G-Level System
export interface GLevelTier {
  level: number
  name: string
  minGs: number
  maxGs: number
  color: string
  benefits: string[]
  communityCreateLimit: number
  communityJoinLimit: number
  bandwidthMultiplier: number // earning bonus
  specialPerks: string[]
}

// Achievement System
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  unlockedAt: Date
  gReward: number
  rarity: 'common' | 'rare' | 'epic' | 'legendary'
  category?: 'bandwidth' | 'community' | 'social' | 'special'
  requirements?: {
    type: 'gs_balance' | 'bandwidth_shared' | 'communities_created' | 'connections_helped' | 'time_active'
    value: number
    operator: 'gte' | 'lte' | 'eq'
  }[]
}

// Community System
export interface Community {
  id: string
  name: string
  description: string
  createdAt: Date
  createdById: string
  memberCount: number
  maxMembers?: number
  isPrivate: boolean
  tags: string[]
  banner?: string
  avatar?: string
  rules?: string[]
  settings: {
    autoAcceptMembers: boolean
    requireInvite: boolean
    allowMemberInvites: boolean
    moderationLevel: 'strict' | 'moderate' | 'relaxed'
  }
  stats: {
    totalBandwidthShared: number
    totalGsEarned: number
    activeConnections: number
    averageResponseTime: number // ms
  }
  moderators: string[] // user IDs
  categories: string[]
}

export interface CommunityInvite {
  id: string
  communityId: string
  communityName: string
  inviterId: string
  inviterName: string
  inviteeId: string
  message?: string
  createdAt: Date
  expiresAt: Date
  status: 'pending' | 'accepted' | 'declined' | 'expired'
  metadata?: {
    inviteCode?: string
    permissions?: string[]
  }
}

export interface CommunityMember {
  userId: string
  communityId: string
  joinedAt: Date
  role: 'member' | 'moderator' | 'admin'
  permissions: string[]
  stats: {
    bandwidthContributed: number
    connectionsHelped: number
    postsCreated: number
    helpfulVotes: number
  }
  lastActive: Date
}

// Payment System
export type PaymentProvider = 'paypal' | 'apple_pay' | 'google_pay' | 'stripe' | 'mercado_pago' | 'oxxo' | 'gumroad' | 'revenuecat' | 'polar' | 'lemonsqueezy' | 'slash'

export interface PaymentConfig {
  provider: PaymentProvider
  enabled: boolean
  priority: number // Lower = higher priority
  user_friction: 'ultra_low' | 'low' | 'medium' | 'high'
  setup_required: boolean
  mobile_optimized: boolean
  regional_preference: string[] // Country codes
  fee_percentage: number
  fee_fixed: number // in cents
  supports_instant: boolean
  supports_cash: boolean
  mexican_tax_support: 'native' | 'webhook' | 'manual'
  user_demographic: 'all' | 'mobile' | 'desktop' | 'gaming' | 'professional'
  supported_currencies: string[]
}

export interface PaymentTransaction {
  id: string
  userId: string
  amount: number
  currency: 'USD' | 'MXN'
  gsAmount: number
  provider: PaymentProvider
  providerTransactionId: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded'
  createdAt: Date
  completedAt?: Date
  failureReason?: string
  metadata?: {
    tierPurchased?: string
    taxDataSubmitted?: boolean
    resicoInvoiceId?: string
  }
}

export interface GSPurchaseTier {
  id: string
  name: string
  gs_amount: number
  price_usd: number
  price_mxn?: number
  discount_percentage?: number
  popular?: boolean
  bonus_gs?: number
  total_gs: number // gs_amount + bonus_gs
  description?: string
  features?: string[]
}

// Bandwidth Economy
export interface BandwidthRequest {
  id: string
  requesterId: string
  helperId?: string
  type: 'connection_sharing' | 'file_transfer' | 'streaming_assist' | 'latency_reduction'
  status: 'pending' | 'active' | 'completed' | 'failed' | 'cancelled'
  priority: 'low' | 'normal' | 'high' | 'urgent'
  bytesRequested: number
  bytesShared?: number
  estimatedGReward: number
  actualGReward?: number
  createdAt: Date
  startedAt?: Date
  completedAt?: Date
  location?: {
    country: string
    region: string
    coordinates?: [number, number] // [lat, lng]
  }
  quality: {
    minSpeed: number // Mbps
    maxLatency: number // ms
    reliabilityScore: number // 0-100
  }
  metadata?: {
    userAgent?: string
    connectionType?: string
    deviceType?: string
  }
}

export interface BandwidthSession {
  id: string
  requestId: string
  helperId: string
  requesterId: string
  startedAt: Date
  endedAt?: Date
  totalBytes: number
  averageSpeed: number // Mbps
  qualityScore: number // 0-100
  gEarned: number
  connectionType: 'direct' | 'relay' | 'tunnel'
  metrics: {
    latency: number[]
    throughput: number[]
    packetLoss: number
    jitter: number
  }
  issues?: {
    type: 'slow_speed' | 'high_latency' | 'connection_drops' | 'quality_degradation'
    description: string
    timestamp: Date
  }[]
}

// Messaging and Communication
export interface Message {
  id: string
  senderId: string
  recipientId: string
  communityId?: string // for community messages
  type: 'text' | 'image' | 'file' | 'system' | 'bandwidth_request'
  content: string
  attachments?: {
    url: string
    filename: string
    size: number
    mimeType: string
  }[]
  createdAt: Date
  readAt?: Date
  editedAt?: Date
  replyToId?: string
  reactions?: {
    emoji: string
    userId: string
    createdAt: Date
  }[]
  metadata?: Record<string, unknown>
}

export interface Conversation {
  id: string
  type: 'direct' | 'group' | 'community'
  participants: string[] // user IDs
  name?: string // for group conversations
  avatar?: string
  lastMessage?: Message
  lastActivity: Date
  isArchived: boolean
  isMuted: boolean
  unreadCount: number
  metadata?: {
    communityId?: string
    tags?: string[]
  }
}

// Notification System
export interface Notification {
  id: string
  userId: string
  type: 'g_earned' | 'level_up' | 'achievement_unlocked' | 'community_invite' | 'bandwidth_request' | 'message' | 'system'
  title: string
  content: string
  data?: Record<string, unknown>
  isRead: boolean
  createdAt: Date
  readAt?: Date
  actionUrl?: string
  priority: 'low' | 'normal' | 'high'
  category: 'social' | 'financial' | 'system' | 'achievement'
}

// Analytics and Metrics
export interface UserAnalytics {
  userId: string
  period: 'daily' | 'weekly' | 'monthly'
  startDate: Date
  endDate: Date
  metrics: {
    gsEarned: number
    gsSpent: number
    bandwidthShared: number
    connectionsHelped: number
    averageResponseTime: number
    qualityScore: number
    activeTime: number // minutes
    communitiesVisited: number
    messagesExchanged: number
  }
  trends: {
    gsEarning: 'increasing' | 'decreasing' | 'stable'
    activityLevel: 'increasing' | 'decreasing' | 'stable'
    helpfulness: 'increasing' | 'decreasing' | 'stable'
  }
}

export interface SystemMetrics {
  timestamp: Date
  activeUsers: number
  totalGsInCirculation: number
  bandwidthSharedToday: number
  newCommunitiesCreated: number
  totalConnections: number
  averageResponseTime: number
  systemHealth: {
    apiLatency: number
    dbLatency: number
    errorRate: number
    uptime: number
  }
  economicIndicators: {
    gInflationRate: number
    averageGPerMB: number
    mostActiveRegions: string[]
    paymentVolume: number
  }
}

// Utility Types for Type Safety
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>
export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type UpdateFields<T> = Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>

// Type Guards for Runtime Validation
export const isFriendsProfile = (value: unknown): value is FriendsProfile => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'username' in value &&
    'gLevel' in value &&
    'stats' in value
  )
}

export const isGLevelTier = (value: unknown): value is GLevelTier => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'level' in value &&
    'name' in value &&
    'minGs' in value &&
    'maxGs' in value
  )
}

export const isCommunity = (value: unknown): value is Community => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'name' in value &&
    'createdById' in value &&
    'isPrivate' in value
  )
}

export const isPaymentTransaction = (value: unknown): value is PaymentTransaction => {
  return (
    typeof value === 'object' &&
    value !== null &&
    'id' in value &&
    'amount' in value &&
    'provider' in value &&
    'status' in value
  )
}

// Constants and Defaults
export const DEFAULT_G_LEVEL: GLevelTier = {
  level: 1,
  name: 'Newbie',
  minGs: 0,
  maxGs: 99,
  color: '#64748b',
  benefits: ['Basic profile', 'Join up to 3 communities'],
  communityCreateLimit: 0,
  communityJoinLimit: 3,
  bandwidthMultiplier: 1.0,
  specialPerks: []
}

export const PAYMENT_PROVIDERS: PaymentProvider[] = [
  'paypal', 'apple_pay', 'google_pay', 'stripe', 'mercado_pago', 'oxxo', 'gumroad'
]

export const ACHIEVEMENT_RARITIES: Achievement['rarity'][] = ['common', 'rare', 'epic', 'legendary']

export const COMMUNITY_MEMBER_ROLES: CommunityMember['role'][] = ['member', 'moderator', 'admin']

export const NOTIFICATION_PRIORITIES: Notification['priority'][] = ['low', 'normal', 'high']