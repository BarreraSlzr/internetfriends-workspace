import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Username validation schema
const UsernameSchema = z.object({
  username: z.string()
    .min(2, 'Username must be at least 2 characters')
    .max(30, 'Username too long (max 30 characters)')
    .regex(/^[a-zA-Z0-9_]+$/, 'Only letters, numbers, and underscores allowed')
    .refine(s => !s.startsWith('_') && !s.endsWith('_'), 'Cannot start or end with underscore'),
  tier: z.enum(['basic', 'premium', 'verified']).optional()
})

interface GrutiksHandle {
  username: string
  fullHandle: string
  owner?: string
  tier: 'basic' | 'premium' | 'verified'
  
  // Subscription Details
  monthly_cost: number
  renewal_date?: string
  status: 'available' | 'active' | 'expired' | 'suspended'
  next_billing: string
  
  // Profile Features
  features: string[]
  verification_badge: boolean
  created_date?: string
  profile?: {
    bio?: string
    avatar_url?: string
    social_links: string[]
    website?: string
  }
}

// Reserved usernames
const RESERVED_USERNAMES = new Set([
  'admin', 'root', 'support', 'help', 'api', 'www', 'mail', 'ftp',
  'moderator', 'staff', 'team', 'official', 'grutiks', 'system',
  'security', 'abuse', 'legal', 'dmca', 'privacy', 'terms',
  'bitcoin', 'ethereum', 'crypto', 'blockchain', 'defi', 'nft'
])

// Premium usernames (higher cost)
const PREMIUM_USERNAMES = new Set([
  'trader', 'investor', 'founder', 'ceo', 'dev', 'developer',
  'artist', 'creator', 'builder', 'maker', 'designer', 'writer',
  'expert', 'guru', 'pro', 'master', 'ninja', 'wizard'
])

// Mock database
const mockHandles = new Map<string, GrutiksHandle>([
  ['test_user', {
    username: 'test_user',
    fullHandle: 'test_user.grutiks.com',
    owner: 'user_123',
    tier: 'basic',
    monthly_cost: 200,
    renewal_date: '2025-02-15',
    status: 'active',
    next_billing: '2025-02-15',
    features: ['custom_profile', 'redirect', 'analytics'],
    verification_badge: false,
    created_date: '2025-01-15',
    profile: {
      bio: 'Crypto enthusiast and builder',
      social_links: ['https://twitter.com/test_user']
    }
  }],
  ['crypto_king', {
    username: 'crypto_king',
    fullHandle: 'crypto_king.grutiks.com', 
    owner: 'user_456',
    tier: 'verified',
    monthly_cost: 800,
    renewal_date: '2025-02-20',
    status: 'active',
    next_billing: '2025-02-20',
    features: ['all_premium', 'blue_checkmark', 'early_access', 'api_access'],
    verification_badge: true,
    created_date: '2025-01-10'
  }]
])

function getTierPricing(tier: 'basic' | 'premium' | 'verified'): {
  monthly_gs: number
  features: string[]
  verification_badge: boolean
} {
  const pricing = {
    basic: {
      monthly_gs: 200,    // $5/month
      features: ['custom_profile', 'redirect', 'analytics'],
      verification_badge: false
    },
    premium: {
      monthly_gs: 400,    // $10/month
      features: ['custom_profile', 'redirect', 'analytics', 'verified_badge', 'priority_support'],
      verification_badge: false
    },
    verified: {
      monthly_gs: 800,    // $20/month
      features: ['all_premium', 'blue_checkmark', 'early_access', 'api_access'],
      verification_badge: true
    }
  }
  return pricing[tier]
}

function determineUsernameTier(username: string): 'basic' | 'premium' | 'verified' {
  const lower = username.toLowerCase()
  
  // Check for premium keywords
  for (const keyword of PREMIUM_USERNAMES) {
    if (lower.includes(keyword)) {
      return 'premium'
    }
  }
  
  // Short usernames (3-5 chars) are premium
  if (username.length >= 3 && username.length <= 5) {
    return 'premium'
  }
  
  return 'basic'
}

function generateAlternatives(username: string): string[] {
  const alternatives = []
  const base = username.toLowerCase()
  
  // Add numbers
  for (let i = 1; i <= 9; i++) {
    alternatives.push(`${base}${i}`)
    alternatives.push(`${base}_${i}`)
  }
  
  // Add common suffixes
  const suffixes = ['_official', '_real', '_pro', '_dev', '_crypto', '_nft']
  for (const suffix of suffixes) {
    alternatives.push(`${base}${suffix}`)
  }
  
  // Add years
  const years = ['2024', '2025']
  for (const year of years) {
    alternatives.push(`${base}_${year}`)
  }
  
  return alternatives.slice(0, 10)
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const username = searchParams.get('username')
    const action = searchParams.get('action') // 'search' or 'profile'
    
    if (!username) {
      return NextResponse.json({
        error: 'Missing username parameter',
        example: '/api/username/search?username=crypto_trader'
      }, { status: 400 })
    }

    // Validate username
    const validation = UsernameSchema.safeParse({ username })
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid username',
        details: validation.error.errors
      }, { status: 400 })
    }

    const { username: validUsername } = validation.data
    
    // Check if username exists
    const existing = mockHandles.get(validUsername.toLowerCase())
    
    if (action === 'profile' && existing) {
      // Return public profile
      return NextResponse.json({
        success: true,
        profile: {
          username: existing.username,
          fullHandle: existing.fullHandle,
          tier: existing.tier,
          verification_badge: existing.verification_badge,
          status: existing.status,
          created_date: existing.created_date,
          profile: existing.profile,
          public_stats: {
            days_active: Math.floor((Date.now() - new Date(existing.created_date!).getTime()) / (1000 * 60 * 60 * 24)),
            tier_name: existing.tier.charAt(0).toUpperCase() + existing.tier.slice(1)
          }
        }
      })
    }
    
    // Username availability search
    const available = !existing && !RESERVED_USERNAMES.has(validUsername.toLowerCase())
    const recommendedTier = determineUsernameTier(validUsername)
    const pricing = getTierPricing(recommendedTier)
    const fullHandle = `${validUsername}.grutiks.com`
    
    const result: GrutiksHandle = {
      username: validUsername,
      fullHandle,
      tier: recommendedTier,
      monthly_cost: pricing.monthly_gs,
      status: available ? 'available' : 'active',
      next_billing: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      features: pricing.features,
      verification_badge: pricing.verification_badge,
      ...(existing && {
        owner: existing.owner,
        created_date: existing.created_date,
        profile: existing.profile
      })
    }

    return NextResponse.json({
      success: true,
      username: result,
      available,
      pricing: {
        monthly_gs: pricing.monthly_gs,
        monthly_usd: pricing.monthly_gs / 40, // 40 G's per USD
        annual_gs: pricing.monthly_gs * 12,
        annual_usd: (pricing.monthly_gs * 12) / 40,
        annual_discount: '16.7%' // 2 months free when paying annually
      },
      alternatives: available ? [] : generateAlternatives(validUsername),
      tier_comparison: {
        basic: getTierPricing('basic'),
        premium: getTierPricing('premium'),
        verified: getTierPricing('verified')
      }
    })

  } catch (error) {
    console.error('Username search error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { username, tier = 'basic', billing_cycle = 'monthly', profile = {} } = body
    
    // Validate username
    const validation = UsernameSchema.safeParse({ username, tier })
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid username or tier',
        details: validation.error.errors
      }, { status: 400 })
    }

    const { username: validUsername, tier: selectedTier } = validation.data
    
    // Check availability
    if (mockHandles.has(validUsername.toLowerCase()) || RESERVED_USERNAMES.has(validUsername.toLowerCase())) {
      return NextResponse.json({
        error: 'Username not available',
        username: validUsername,
        alternatives: generateAlternatives(validUsername)
      }, { status: 409 })
    }

    const pricing = getTierPricing(selectedTier)
    const fullHandle = `${validUsername}.grutiks.com`
    const nextBilling = billing_cycle === 'annual' 
      ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    
    // Calculate total cost
    const monthlyCost = pricing.monthly_gs
    const totalCost = billing_cycle === 'annual' ? monthlyCost * 10 : monthlyCost // 2 months free for annual
    
    // Create username subscription
    const newHandle: GrutiksHandle = {
      username: validUsername,
      fullHandle,
      owner: 'current_user', // Get from auth in production
      tier: selectedTier,
      monthly_cost: monthlyCost,
      renewal_date: nextBilling,
      status: 'active',
      next_billing: nextBilling,
      features: pricing.features,
      verification_badge: pricing.verification_badge,
      created_date: new Date().toISOString(),
      profile: {
        bio: profile.bio || '',
        avatar_url: profile.avatar_url || '',
        social_links: profile.social_links || [],
        website: profile.website || ''
      }
    }
    
    // Save to mock database
    mockHandles.set(validUsername.toLowerCase(), newHandle)
    
    // TODO: Process G's token payment
    // TODO: Create DNS record
    // TODO: Set up recurring billing
    // TODO: Send welcome email
    
    return NextResponse.json({
      success: true,
      message: 'Username subscription activated!',
      handle: newHandle,
      billing: {
        total_cost_gs: totalCost,
        total_cost_usd: totalCost / 40,
        billing_cycle,
        next_billing: nextBilling,
        auto_renewal: true
      },
      setup_status: {
        dns_creation: 'pending',
        profile_page: 'active',
        estimated_propagation: '5-10 minutes'
      }
    })

  } catch (error) {
    console.error('Username subscription error:', error)
    return NextResponse.json({
      error: 'Subscription failed', 
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}