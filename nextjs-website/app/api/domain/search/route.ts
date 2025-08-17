import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPorkbunClient } from '@/lib/porkbun/client'
import { PorkbunAPIError, RateLimitError } from '@/lib/porkbun/types'
import { searchMockDomains, mockDomainResults } from '@/lib/porkbun/mock-data'

// =================================================================
// DOMAIN SEARCH API - MAIN ENDPOINT
// =================================================================

// Search request validation schema
const DomainSearchRequestSchema = z.object({
  query: z.string().min(1).max(50),
  tlds: z.array(z.string()).optional(),
  max_price_usd: z.number().positive().optional(),
  max_price_gs: z.number().positive().optional(),
  max_length: z.number().min(1).max(100).optional(),
  include_premium: z.boolean().optional(),
  require_available: z.boolean().optional(),
  sort_by: z.enum(['price', 'length', 'brandability', 'popularity']).optional(),
  sort_order: z.enum(['asc', 'desc']).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const searchParams = DomainSearchRequestSchema.parse(body)
    
    // Check if Porkbun API is available
    const useMockData = !process.env.PORKBUN_API_KEY || !process.env.PORKBUN_SECRET_API_KEY
    
    if (useMockData) {
      // Use mock data when API keys unavailable
      const mockResults = searchMockDomains(searchParams.query)
      
      return NextResponse.json({
        success: true,
        data: {
          query: searchParams.query,
          suggestions: mockResults,
          total_found: mockResults.length,
          search_time_ms: 150, // Simulated search time
          gs_conversion_rate: 2.5, // 1 G's token = $2.50
          mock_data: true
        },
        timestamp: new Date().toISOString()
      })
    }
    
    // Get Porkbun client
    const client = getPorkbunClient()
    
    // Perform domain search
    const searchResult = await client.searchDomains(searchParams.query, {
      tlds: searchParams.tlds,
      max_price_usd: searchParams.max_price_usd,
      max_price_gs: searchParams.max_price_gs,
      max_length: searchParams.max_length,
      include_premium: searchParams.include_premium,
      require_available: searchParams.require_available,
      sort_by: searchParams.sort_by,
      sort_order: searchParams.sort_order
    })

    return NextResponse.json({
      success: true,
      data: searchResult,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Domain search error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid search parameters', 
          details: error.errors,
          success: false 
        },
        { status: 400 }
      )
    }

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          retry_after: error.resetTime,
          success: false 
        },
        { status: 429 }
      )
    }

    if (error instanceof PorkbunAPIError) {
      return NextResponse.json(
        { 
          error: error.message,
          status_code: error.status,
          success: false 
        },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    )
  }
}

// =================================================================
// GET ENDPOINT FOR QUICK DOMAIN SUGGESTIONS
// =================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')
    
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required', success: false },
        { status: 400 }
      )
    }

    if (query.length > 50) {
      return NextResponse.json(
        { error: 'Query too long (max 50 characters)', success: false },
        { status: 400 }
      )
    }

    // Check if Porkbun API is available
    const useMockData = !process.env.PORKBUN_API_KEY || !process.env.PORKBUN_SECRET_API_KEY
    
    if (useMockData) {
      // Use mock data when API keys unavailable
      const mockResults = searchMockDomains(query).slice(0, 10)
      
      return NextResponse.json({
        success: true,
        query,
        suggestions: mockResults,
        total_found: mockResults.length,
        search_time_ms: 120,
        gs_conversion_rate: 2.5,
        mock_data: true,
        timestamp: new Date().toISOString()
      })
    }

    const client = getPorkbunClient()
    
    // Quick search with default parameters
    const searchResult = await client.searchDomains(query, {
      tlds: ['com', 'net', 'org', 'io', 'app'], // Popular TLDs only
      require_available: true,
      sort_by: 'price',
      sort_order: 'asc'
    })

    // Return simplified response for GET requests
    return NextResponse.json({
      success: true,
      query: searchResult.query,
      suggestions: searchResult.suggestions.slice(0, 10), // Limit to 10 for quick search
      total_found: searchResult.total_found,
      search_time_ms: searchResult.search_time_ms,
      gs_conversion_rate: searchResult.gs_conversion_rate,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Quick domain search error:', error)

    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded', 
          retry_after: error.resetTime,
          success: false 
        },
        { status: 429 }
      )
    }

    if (error instanceof PorkbunAPIError) {
      return NextResponse.json(
        { 
          error: error.message,
          success: false 
        },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Search failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    )
  }
}