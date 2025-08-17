import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Subdomain validation schema
const SubdomainSearchSchema = z.object({
  subdomain: z.string()
    .min(1, 'Subdomain is required')
    .max(63, 'Subdomain too long')
    .regex(/^[a-zA-Z0-9-]+$/, 'Invalid characters. Use only letters, numbers, and hyphens')
    .refine(s => !s.startsWith('-') && !s.endsWith('-'), 'Cannot start or end with hyphen'),
  category: z.enum(['basic', 'premium', 'enterprise']).optional()
})

interface GrutiksSubdomain {
  subdomain: string
  fullDomain: string
  available: boolean
  price: number
  category: 'basic' | 'premium' | 'enterprise'
  features: string[]
  owner?: string
  created_date?: string
}

// Reserved/premium subdomains
const RESERVED_SUBDOMAINS = new Set([
  'www', 'api', 'mail', 'ftp', 'admin', 'root', 'support', 'help',
  'blog', 'store', 'shop', 'pay', 'payment', 'secure', 'ssl',
  'app', 'mobile', 'dev', 'test', 'staging', 'prod', 'production'
])

const PREMIUM_KEYWORDS = new Set([
  'crypto', 'bitcoin', 'eth', 'nft', 'defi', 'web3', 'token', 'coin',
  'trade', 'exchange', 'wallet', 'finance', 'money', 'bank', 'invest',
  'ai', 'ml', 'tech', 'digital', 'online', 'cloud', 'data'
])

const ENTERPRISE_KEYWORDS = new Set([
  'store', 'shop', 'buy', 'sell', 'market', 'business', 'corp',
  'company', 'enterprise', 'pro', 'premium', 'official'
])

// Mock database - in production, this would be a real database
const mockSubdomains = new Map<string, GrutiksSubdomain>([
  ['test', {
    subdomain: 'test',
    fullDomain: 'test.grutiks.com',
    available: false,
    price: 50,
    category: 'basic',
    features: ['redirect', 'analytics'],
    owner: 'user_123',
    created_date: '2025-01-10'
  }],
  ['demo', {
    subdomain: 'demo', 
    fullDomain: 'demo.grutiks.com',
    available: false,
    price: 50,
    category: 'basic',
    features: ['redirect', 'analytics'],
    owner: 'user_456',
    created_date: '2025-01-12'
  }]
])

function categorizeSubdomain(subdomain: string): 'basic' | 'premium' | 'enterprise' {
  const lower = subdomain.toLowerCase()
  
  if (RESERVED_SUBDOMAINS.has(lower)) {
    return 'enterprise'
  }
  
  if (ENTERPRISE_KEYWORDS.has(lower)) {
    return 'enterprise'
  }
  
  if (PREMIUM_KEYWORDS.has(lower)) {
    return 'premium'
  }
  
  // Check if contains premium keywords
  for (const keyword of PREMIUM_KEYWORDS) {
    if (lower.includes(keyword)) {
      return 'premium'
    }
  }
  
  return 'basic'
}

function getPricing(category: 'basic' | 'premium' | 'enterprise'): number {
  const pricing = {
    basic: 50,     // 50 G's (~$1.25)
    premium: 100,  // 100 G's (~$2.50)
    enterprise: 200 // 200 G's (~$5.00)
  }
  return pricing[category]
}

function getFeatures(category: 'basic' | 'premium' | 'enterprise'): string[] {
  const features = {
    basic: ['redirect', 'analytics'],
    premium: ['redirect', 'analytics', 'custom_page', 'ssl'],
    enterprise: ['redirect', 'analytics', 'custom_page', 'ssl', 'ipfs_hosting', 'priority_support']
  }
  return features[category]
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')
    
    if (!subdomain) {
      return NextResponse.json({
        error: 'Missing subdomain parameter',
        example: '/api/subdomain/search?subdomain=myname'
      }, { status: 400 })
    }

    // Validate subdomain
    const validation = SubdomainSearchSchema.safeParse({ subdomain })
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid subdomain',
        details: validation.error.errors
      }, { status: 400 })
    }

    const { subdomain: validSubdomain } = validation.data
    const category = categorizeSubdomain(validSubdomain)
    const price = getPricing(category)
    const features = getFeatures(category)
    const fullDomain = `${validSubdomain}.grutiks.com`
    
    // Check availability
    const existing = mockSubdomains.get(validSubdomain.toLowerCase())
    const available = !existing && !RESERVED_SUBDOMAINS.has(validSubdomain.toLowerCase())
    
    const result: GrutiksSubdomain = {
      subdomain: validSubdomain,
      fullDomain,
      available,
      price,
      category,
      features,
      ...(existing && {
        owner: existing.owner,
        created_date: existing.created_date
      })
    }

    return NextResponse.json({
      success: true,
      subdomain: result,
      gs_per_dollar: 40,
      usd_price: price / 40,
      recommended_alternatives: available ? [] : generateAlternatives(validSubdomain)
    })

  } catch (error) {
    console.error('Subdomain search error:', error)
    return NextResponse.json({
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { subdomain, redirect_url, ipfs_hash, custom_html } = body
    
    // Validate subdomain
    const validation = SubdomainSearchSchema.safeParse({ subdomain })
    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid subdomain',
        details: validation.error.errors
      }, { status: 400 })
    }

    const { subdomain: validSubdomain } = validation.data
    
    // Check if already taken
    if (mockSubdomains.has(validSubdomain.toLowerCase()) || RESERVED_SUBDOMAINS.has(validSubdomain.toLowerCase())) {
      return NextResponse.json({
        error: 'Subdomain not available',
        subdomain: validSubdomain
      }, { status: 409 })
    }

    const category = categorizeSubdomain(validSubdomain)
    const price = getPricing(category)
    const features = getFeatures(category)
    const fullDomain = `${validSubdomain}.grutiks.com`
    
    // Create subdomain record
    const newSubdomain: GrutiksSubdomain = {
      subdomain: validSubdomain,
      fullDomain,
      available: false,
      price,
      category,
      features,
      owner: 'current_user', // In production, get from auth
      created_date: new Date().toISOString()
    }
    
    // Save to mock database
    mockSubdomains.set(validSubdomain.toLowerCase(), newSubdomain)
    
    // TODO: Create DNS record via Cloudflare API
    // TODO: Process G's token payment
    // TODO: Send confirmation email
    
    return NextResponse.json({
      success: true,
      message: 'Subdomain registered successfully',
      subdomain: newSubdomain,
      dns_setup: 'pending',
      estimated_propagation: '5-10 minutes'
    })

  } catch (error) {
    console.error('Subdomain registration error:', error)
    return NextResponse.json({
      error: 'Registration failed',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

function generateAlternatives(subdomain: string): string[] {
  const alternatives = []
  const base = subdomain.toLowerCase()
  
  // Add numbers
  for (let i = 1; i <= 5; i++) {
    alternatives.push(`${base}${i}`)
  }
  
  // Add common suffixes
  const suffixes = ['app', 'site', 'web', 'hub', 'zone', 'pro']
  for (const suffix of suffixes) {
    alternatives.push(`${base}${suffix}`)
  }
  
  // Add prefixes
  const prefixes = ['my', 'get', 'the', 'new']
  for (const prefix of prefixes) {
    alternatives.push(`${prefix}${base}`)
  }
  
  return alternatives.slice(0, 8)
}