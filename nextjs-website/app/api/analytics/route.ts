import { NextRequest, NextResponse } from 'next/server'
import { analytics, trackDomainMarketplaceActivity } from '@/lib/analytics/google-analytics'

// =================================================================
// LINK REDIRECTION WITH ANALYTICS TRACKING
// =================================================================

export async function GET(request: NextRequest) {
  try {
    const { searchParams, pathname } = new URL(request.url)
    const linkId = pathname.split('/').pop() // Get link ID from URL path
    
    if (!linkId) {
      return NextResponse.json(
        { error: 'Link ID is required', success: false },
        { status: 400 }
      )
    }

    // Get client information for analytics
    const userAgent = request.headers.get('user-agent') || ''
    const referrer = request.headers.get('referer') || ''
    const clientIp = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'unknown'

    // Determine device type from user agent
    const deviceType = getUserDeviceType(userAgent)
    
    // Get link destination from database/storage
    // For now, using mock data
    const linkData = await getLinkData(linkId)
    
    if (!linkData) {
      return NextResponse.redirect('/404')
    }

    // Track analytics before redirect
    const analyticsPromise = trackDomainMarketplaceActivity.linkClick(
      linkId,
      linkData.destination,
      linkData.sourceDomain || 'unknown',
      {
        user_agent: userAgent,
        referrer,
        device_type: deviceType,
        client_ip: clientIp,
        utm_source: searchParams.get('utm_source') || undefined,
        utm_medium: searchParams.get('utm_medium') || undefined,
        utm_campaign: searchParams.get('utm_campaign') || undefined,
      }
    );

    // Don't wait for analytics to complete before redirect
    analyticsPromise.catch(error => 
      console.error('Analytics tracking failed:', error)
    );

    // Redirect to destination
    return NextResponse.redirect(linkData.destination, {
      status: linkData.permanent ? 301 : 302,
      headers: {
        'Cache-Control': linkData.permanent ? 'public, max-age=86400' : 'no-cache',
      },
    });

  } catch (error) {
    console.error('Link redirection error:', error);
    return NextResponse.redirect('/error');
  }
}

// =================================================================
// ANALYTICS API ENDPOINT
// =================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event_type, ...eventData } = body

    switch (event_type) {
      case 'link_click':
        await analytics.trackLinkClick(
          eventData.link_id,
          eventData.destination_url,
          eventData.source_domain,
          eventData.metadata
        );
        break;
        
      case 'domain_search':
        await analytics.trackDomainSearch(
          eventData.query,
          eventData.results_count
        );
        break;
        
      case 'domain_purchase':
        await analytics.trackDomainPurchase(
          eventData.domain,
          eventData.price_usd,
          eventData.gs_tokens_used,
          eventData.category,
          eventData.user_id
        );
        break;
        
      default:
        await analytics.trackEvent({
          event_name: event_type,
          parameters: eventData,
        });
    }

    return NextResponse.json({ success: true });
    
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Analytics tracking failed', success: false },
      { status: 500 }
    );
  }
}

// =================================================================
// ANALYTICS DASHBOARD ENDPOINT
// =================================================================

export async function GET_ANALYTICS(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeframe = searchParams.get('timeframe') || '24h'
    
    // Get real-time metrics
    const realtimeMetrics = await analytics.getRealtimeMetrics()
    
    // Get historical data (mock for now)
    const historicalData = await getHistoricalAnalytics(timeframe)
    
    return NextResponse.json({
      success: true,
      data: {
        realtime: realtimeMetrics,
        historical: historicalData,
        timeframe,
        last_updated: new Date().toISOString(),
      },
    });
    
  } catch (error) {
    console.error('Analytics dashboard error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', success: false },
      { status: 500 }
    );
  }
}

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

function getUserDeviceType(userAgent: string): 'mobile' | 'desktop' | 'tablet' {
  const ua = userAgent.toLowerCase();
  
  if (/tablet|ipad/.test(ua)) {
    return 'tablet';
  }
  
  if (/mobile|android|iphone/.test(ua)) {
    return 'mobile';
  }
  
  return 'desktop';
}

async function getLinkData(linkId: string) {
  // Mock link data - in production this would come from database
  const mockLinks: Record<string, any> = {
    'example': {
      destination: 'https://example.com',
      sourceDomain: 'go.to',
      permanent: false,
      created_at: '2025-01-01T00:00:00Z',
      click_count: 42,
    },
    'social': {
      destination: 'https://instagram.com/internetfriends',
      sourceDomain: 'lnk.app',
      permanent: false,
      created_at: '2025-01-01T00:00:00Z',
      click_count: 128,
    },
    'demo': {
      destination: 'https://localhost:3000/domain',
      sourceDomain: 'short.ly',
      permanent: false,
      created_at: '2025-01-01T00:00:00Z',
      click_count: 15,
    },
  };
  
  return mockLinks[linkId] || null;
}

async function getHistoricalAnalytics(timeframe: string) {
  // Mock historical data - in production this would come from GA4 Reporting API
  const now = new Date();
  const dataPoints = timeframe === '24h' ? 24 : timeframe === '7d' ? 7 : 30;
  
  return {
    clicks_over_time: Array.from({ length: dataPoints }, (_, i) => ({
      timestamp: new Date(now.getTime() - (dataPoints - i) * (timeframe === '24h' ? 60 * 60 * 1000 : 24 * 60 * 60 * 1000)).toISOString(),
      clicks: Math.floor(Math.random() * 100) + 20,
    })),
    top_links: [
      { link_id: 'social', clicks: 128, destination: 'https://instagram.com/internetfriends' },
      { link_id: 'example', clicks: 42, destination: 'https://example.com' },
      { link_id: 'demo', clicks: 15, destination: 'https://localhost:3000/domain' },
    ],
    geographic_data: [
      { country: 'US', clicks: 45, percentage: 35.2 },
      { country: 'UK', clicks: 32, percentage: 25.0 },
      { country: 'CA', clicks: 28, percentage: 21.9 },
      { country: 'DE', clicks: 23, percentage: 17.9 },
    ],
    device_breakdown: [
      { device: 'mobile', clicks: 78, percentage: 60.9 },
      { device: 'desktop', clicks: 35, percentage: 27.3 },
      { device: 'tablet', clicks: 15, percentage: 11.7 },
    ],
  };
}