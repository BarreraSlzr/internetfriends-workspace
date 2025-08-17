import { NextRequest, NextResponse } from 'next/server'
import { LinkManager } from '@/lib/links/manager'
import { trackDomainMarketplaceActivity } from '@/lib/analytics/google-analytics'

// =================================================================
// GO.RICH LINK REDIRECTION
// =================================================================

export async function GET(request: NextRequest, { params }: { params: Promise<{ shortCode: string }> }) {
  try {
    const { shortCode } = await params
    
    if (!shortCode) {
      return NextResponse.redirect('https://go.rich/404')
    }

    // Get link data
    const link = LinkManager.getLink(shortCode)
    
    if (!link) {
      return NextResponse.redirect('https://go.rich/404')
    }

    if (!link.isActive) {
      return NextResponse.redirect('https://go.rich/inactive')
    }

    // Check if link has expired
    if (link.expiresAt && new Date() > new Date(link.expiresAt)) {
      return NextResponse.redirect('https://go.rich/expired')
    }

    // Get client information for analytics
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Determine device type
    const deviceType = getUserDeviceType(userAgent)
    
    // Record click
    LinkManager.recordClick(shortCode, {
      userAgent,
      referrer,
      clientIp,
      deviceType,
      timestamp: new Date().toISOString(),
    })

    // Track analytics (async, don't wait)
    trackDomainMarketplaceActivity.linkClick(
      link.id,
      link.destination,
      'go.rich',
      {
        user_agent: userAgent,
        referrer,
        device_type: deviceType,
        short_code: shortCode,
      }
    ).catch(error => 
      console.error('Analytics tracking failed:', error)
    )

    // Redirect to destination
    return NextResponse.redirect(link.destination, {
      status: 302, // Temporary redirect for tracking
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Link-ID': link.id,
        'X-Click-Count': link.clickCount.toString(),
      },
    })

  } catch (error) {
    console.error('Redirection error:', error)
    return NextResponse.redirect('https://go.rich/error')
  }
}

function getUserDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
  const ua = userAgent.toLowerCase()
  
  if (/tablet|ipad/.test(ua)) {
    return 'tablet'
  }
  
  if (/mobile|android|iphone/.test(ua)) {
    return 'mobile'
  }
  
  return 'desktop'
}