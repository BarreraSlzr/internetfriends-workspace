import { NextRequest, NextResponse } from 'next/server'
import { getPorkbunClient } from '@/lib/porkbun/client'
import { PorkbunAPIError } from '@/lib/porkbun/types'

// =================================================================
// DOMAIN MARKETPLACE STATUS API
// =================================================================

export async function GET(request: NextRequest) {
  try {
    const client = getPorkbunClient()
    
    // Test API connectivity
    const pingResult = await client.ping()
    const clientStatus = client.getClientStatus()
    
    // Get sample pricing to verify API is working
    const gsConversionRate = await client.getGSTokenConversionRate()
    
    // Calculate system health metrics
    const healthMetrics = {
      api_connectivity: pingResult.status === 'SUCCESS',
      cache_hit_rate: clientStatus.cache_stats.cache_hit_potential,
      queue_length: clientStatus.queue_status.queue_length,
      auth_configured: clientStatus.auth_configured,
      gs_token_integration: gsConversionRate > 0
    }
    
    const overallHealth = Object.values(healthMetrics).filter(Boolean).length / Object.keys(healthMetrics).length

    return NextResponse.json({
      success: true,
      status: overallHealth > 0.8 ? 'healthy' : overallHealth > 0.5 ? 'degraded' : 'unhealthy',
      health_score: Math.round(overallHealth * 100),
      metrics: healthMetrics,
      system_info: {
        porkbun_api: {
          status: pingResult.status,
          client_ip: pingResult.yourIp
        },
        cache: clientStatus.cache_stats,
        queue: clientStatus.queue_status,
        gs_token_rate: gsConversionRate
      },
      endpoints: {
        search: '/api/domain/search',
        check: '/api/domain/check',
        pricing: '/api/domain/pricing',
        purchase: '/api/domain/purchase' // Will be implemented next
      },
      features: {
        domain_search: true,
        availability_check: true,
        bulk_check: true,
        gs_token_pricing: true,
        rate_limiting: true,
        caching: true,
        csv_export: true
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Domain marketplace status error:', error)

    const isApiError = error instanceof PorkbunAPIError
    
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      health_score: 0,
      error: isApiError ? error.message : 'System health check failed',
      system_info: {
        error_type: error.constructor.name,
        error_details: error instanceof Error ? error.message : 'Unknown error'
      },
      timestamp: new Date().toISOString()
    }, { 
      status: isApiError ? (error.status || 500) : 500 
    })
  }
}