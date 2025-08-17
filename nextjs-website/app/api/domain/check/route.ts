import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPorkbunClient } from '@/lib/porkbun/client'
import { PorkbunAPIError, RateLimitError } from '@/lib/porkbun/types'
import { getMockDomainByName, mockDomainResults } from '@/lib/porkbun/mock-data'

// =================================================================
// DOMAIN AVAILABILITY CHECK API
// =================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain')
    
    if (!domain) {
      return NextResponse.json(
        { error: 'Domain parameter is required', success: false },
        { status: 400 }
      )
    }

    // Basic domain validation
    const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
    if (!domainRegex.test(domain)) {
      return NextResponse.json(
        { error: 'Invalid domain format', success: false },
        { status: 400 }
      )
    }

    // Check if Porkbun API is available
    const useMockData = !process.env.PORKBUN_API_KEY || !process.env.PORKBUN_SECRET_API_KEY
    
    if (useMockData) {
      // Use mock data when API keys unavailable
      const mockDomain = getMockDomainByName(domain)
      
      if (mockDomain) {
        return NextResponse.json({
          success: true,
          domain: domain,
          availability: {
            available: mockDomain.available,
            premium: mockDomain.category === 'premium',
            first_year_promo: false
          },
          pricing: {
            usd: {
              price: mockDomain.price,
              regular_price: mockDomain.price,
              renewal_price: Math.round(mockDomain.price * 0.8),
              transfer_price: Math.round(mockDomain.price * 0.6)
            },
            gs_tokens: {
              price: Math.round(mockDomain.price / 2.5),
              conversion_rate: 2.5,
              savings_percent: 12
            }
          },
          brandability_score: mockDomain.brandabilityScore,
          seo_score: mockDomain.seoScore,
          features: mockDomain.features,
          mock_data: true,
          timestamp: new Date().toISOString()
        })
      } else {
        // Domain not in mock data, generate a response
        return NextResponse.json({
          success: true,
          domain: domain,
          availability: {
            available: Math.random() > 0.3, // 70% chance available
            premium: false,
            first_year_promo: false
          },
          pricing: {
            usd: {
              price: 12.99,
              regular_price: 12.99,
              renewal_price: 12.99,
              transfer_price: 8.99
            },
            gs_tokens: {
              price: 6,
              conversion_rate: 2.5,
              savings_percent: 12
            }
          },
          mock_data: true,
          timestamp: new Date().toISOString()
        })
      }
    }

    const client = getPorkbunClient()
    
    // Check domain availability
    const availabilityResult = await client.checkDomainAvailability(domain)
    
    // Calculate G's token pricing
    const usdPrice = parseFloat(availabilityResult.response.price)
    const gsTokenPricing = await client.calculateGSTokenPricing(usdPrice)

    const response = {
      success: true,
      domain: domain,
      availability: {
        available: availabilityResult.response.avail === 'yes',
        premium: availabilityResult.response.premium === 'yes',
        first_year_promo: availabilityResult.response.firstYearPromo === 'yes'
      },
      pricing: {
        usd: {
          price: usdPrice,
          regular_price: parseFloat(availabilityResult.response.regularPrice),
          renewal_price: parseFloat(availabilityResult.response.additional.renewal.price),
          transfer_price: parseFloat(availabilityResult.response.additional.transfer.price)
        },
        gs_tokens: gsTokenPricing
      },
      rate_limit: availabilityResult.limits ? {
        used: availabilityResult.limits.used,
        limit: parseInt(availabilityResult.limits.limit),
        ttl: parseInt(availabilityResult.limits.TTL),
        description: availabilityResult.limits.naturalLanguage
      } : null,
      timestamp: new Date().toISOString()
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Domain availability check error:', error)

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
        error: 'Availability check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    )
  }
}

// =================================================================
// BULK DOMAIN CHECK API (POST)
// =================================================================

const BulkCheckRequestSchema = z.object({
  domains: z.array(z.string()).min(1).max(50), // Limit to 50 domains per request
  include_pricing: z.boolean().optional().default(true)
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { domains, include_pricing } = BulkCheckRequestSchema.parse(body)
    
    const client = getPorkbunClient()
    const results: any[] = []
    const errors: any[] = []

    // Process domains in parallel with reasonable concurrency
    const BATCH_SIZE = 5 // Process 5 domains at a time
    
    for (let i = 0; i < domains.length; i += BATCH_SIZE) {
      const batch = domains.slice(i, i + BATCH_SIZE)
      
      const batchPromises = batch.map(async (domain) => {
        try {
          // Basic domain validation
          const domainRegex = /^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/
          if (!domainRegex.test(domain)) {
            throw new Error(`Invalid domain format: ${domain}`)
          }

          const availabilityResult = await client.checkDomainAvailability(domain)
          
          let gsTokenPricing = null
          if (include_pricing) {
            const usdPrice = parseFloat(availabilityResult.response.price)
            gsTokenPricing = await client.calculateGSTokenPricing(usdPrice)
          }

          return {
            domain,
            available: availabilityResult.response.avail === 'yes',
            premium: availabilityResult.response.premium === 'yes',
            price_usd: parseFloat(availabilityResult.response.price),
            gs_token_pricing: gsTokenPricing,
            error: null
          }

        } catch (error) {
          return {
            domain,
            available: false,
            premium: false,
            price_usd: null,
            gs_token_pricing: null,
            error: error instanceof Error ? error.message : 'Unknown error'
          }
        }
      })

      const batchResults = await Promise.all(batchPromises)
      
      // Separate successful results from errors
      batchResults.forEach(result => {
        if (result.error) {
          errors.push({ domain: result.domain, error: result.error })
        } else {
          results.push(result)
        }
      })

      // Small delay between batches to respect rate limits
      if (i + BATCH_SIZE < domains.length) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    }

    return NextResponse.json({
      success: true,
      results,
      errors,
      summary: {
        total_checked: domains.length,
        successful: results.length,
        failed: errors.length,
        available: results.filter(r => r.available).length,
        premium: results.filter(r => r.premium).length
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Bulk domain check error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid request parameters', 
          details: (error as any).errors,
          success: false 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Bulk check failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    )
  }
}