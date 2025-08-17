import { NextRequest, NextResponse } from 'next/server'
import { getPorkbunClient } from '@/lib/porkbun/client'
import { PorkbunAPIError } from '@/lib/porkbun/types'

// =================================================================
// DOMAIN PRICING API
// =================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const format = searchParams.get('format') || 'json'
    const tld = searchParams.get('tld') // Optional: get pricing for specific TLD
    
    const client = getPorkbunClient()
    
    // Get all TLD pricing from Porkbun
    const pricingData = await client.getDomainPricing()
    
    // Get current G's token conversion rate
    const gsConversionRate = await client.getGSTokenConversionRate()
    
    // Transform pricing data to include G's token pricing
    const enhancedPricing = Object.entries(pricingData.pricing).reduce((acc, [tldName, prices]) => {
      const registrationUSD = parseFloat((prices as any).registration)
      const renewalUSD = parseFloat((prices as any).renewal)
      const transferUSD = parseFloat((prices as any).transfer)
      
      // Calculate G's token pricing with 10% marketplace fee
      const marketplaceFee = 0.10
      const registrationGS = Math.ceil(registrationUSD * gsConversionRate * (1 + marketplaceFee))
      const renewalGS = Math.ceil(renewalUSD * gsConversionRate * (1 + marketplaceFee))
      const transferGS = Math.ceil(transferUSD * gsConversionRate * (1 + marketplaceFee))
      
      acc[tldName] = {
        usd: {
          registration: registrationUSD,
          renewal: renewalUSD,
          transfer: transferUSD
        },
        gs_tokens: {
          registration: registrationGS,
          renewal: renewalGS,
          transfer: transferGS,
          marketplace_fee: Math.ceil(registrationUSD * gsConversionRate * marketplaceFee)
        },
        metadata: {
          conversion_rate: gsConversionRate,
          markup_percentage: marketplaceFee * 100,
          popularity_rank: getPTLDPopularityRank(tldName)
        }
      }
      
      return acc
    }, {} as Record<string, any>)
    
    // If specific TLD requested, return only that
    if (tld) {
      const specificTLD = enhancedPricing[tld.toLowerCase()]
      if (!specificTLD) {
        return NextResponse.json(
          { error: `TLD '${tld}' not found or not supported`, success: false },
          { status: 404 }
        )
      }
      
      return NextResponse.json({
        success: true,
        tld: tld.toLowerCase(),
        pricing: specificTLD,
        timestamp: new Date().toISOString()
      })
    }
    
    // Return format based on request
    if (format === 'csv') {
      const csvData = generatePricingCSV(enhancedPricing)
      
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="domain-pricing-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }
    
    if (format === 'simplified') {
      // Return simplified pricing for frontend display
      const simplified = Object.entries(enhancedPricing)
        .sort(([a], [b]) => getPTLDPopularityRank(a) - getPTLDPopularityRank(b))
        .slice(0, 20) // Top 20 most popular TLDs
        .reduce((acc, [tld, pricing]) => {
          acc[tld] = {
            registration_usd: pricing.usd.registration,
            registration_gs: pricing.gs_tokens.registration,
            popular: getPTLDPopularityRank(tld) <= 10
          }
          return acc
        }, {} as Record<string, any>)
      
      return NextResponse.json({
        success: true,
        pricing: simplified,
        conversion_rate: gsConversionRate,
        marketplace_fee_percent: 10,
        timestamp: new Date().toISOString()
      })
    }
    
    // Default: return full pricing data
    return NextResponse.json({
      success: true,
      pricing: enhancedPricing,
      metadata: {
        total_tlds: Object.keys(enhancedPricing).length,
        conversion_rate: gsConversionRate,
        marketplace_fee_percent: 10,
        last_updated: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Domain pricing error:', error)

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
        error: 'Failed to fetch pricing data',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    )
  }
}

// =================================================================
// TLD POPULARITY RANKING
// =================================================================

function getPTLDPopularityRank(tld: string): number {
  const popularityMap: Record<string, number> = {
    'com': 1,
    'org': 2,
    'net': 3,
    'edu': 4,
    'gov': 5,
    'io': 6,
    'app': 7,
    'dev': 8,
    'tech': 9,
    'ai': 10,
    'me': 11,
    'co': 12,
    'biz': 13,
    'info': 14,
    'name': 15,
    'pro': 16,
    'mobi': 17,
    'travel': 18,
    'jobs': 19,
    'tel': 20
  }
  
  return popularityMap[tld.toLowerCase()] || 999
}

// =================================================================
// CSV EXPORT FUNCTIONALITY
// =================================================================

function generatePricingCSV(pricingData: Record<string, any>): string {
  const headers = [
    'TLD',
    'Registration_USD',
    'Renewal_USD', 
    'Transfer_USD',
    'Registration_GS',
    'Renewal_GS',
    'Transfer_GS',
    'Marketplace_Fee_GS',
    'Popularity_Rank'
  ]
  
  const rows = Object.entries(pricingData).map(([tld, pricing]) => [
    tld,
    pricing.usd.registration,
    pricing.usd.renewal,
    pricing.usd.transfer,
    pricing.gs_tokens.registration,
    pricing.gs_tokens.renewal,
    pricing.gs_tokens.transfer,
    pricing.gs_tokens.marketplace_fee,
    pricing.metadata.popularity_rank
  ])
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')
  
  return csvContent
}

// =================================================================
// CACHE MANAGEMENT
// =================================================================

export async function DELETE(request: NextRequest) {
  try {
    const client = getPorkbunClient()
    
    // Clear pricing cache
    client.clearCache()
    
    return NextResponse.json({
      success: true,
      message: 'Pricing cache cleared successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Cache clear error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to clear cache',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    )
  }
}