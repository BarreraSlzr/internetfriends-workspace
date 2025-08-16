import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');
    const name = searchParams.get('name') || 'Screenshot';
    const width = parseInt(searchParams.get('width') || '1200');
    const height = parseInt(searchParams.get('height') || '630');

    if (!url) {
      return new Response('URL parameter is required', { status: 400 });
    }

    // Fetch the actual webpage content
    let pageTitle = name;
    let pageDescription = `Screenshot of ${url}`;
    
    try {
      const response = await fetch(url);
      const html = await response.text();
      
      // Extract title
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleMatch) pageTitle = titleMatch[1];
      
      // Extract description
      const descMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"']+)["\'][^>]*>/i);
      if (descMatch) pageDescription = descMatch[1];
    } catch (error) {
      console.warn('Failed to fetch page metadata:', error);
    }

    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              borderRadius: '24px',
              padding: '60px',
              margin: '40px',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              maxWidth: '900px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                fontSize: '48px',
                fontWeight: 'bold',
                color: '#1f2937',
                marginBottom: '32px',
                lineHeight: 1.2,
              }}
            >
              {pageTitle}
            </div>

            <div
              style={{
                fontSize: '24px',
                color: '#6b7280',
                marginBottom: '32px',
                maxWidth: '700px',
                lineHeight: 1.4,
              }}
            >
              {pageDescription}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#f3f4f6',
                borderRadius: '12px',
                padding: '16px 24px',
                fontSize: '20px',
                color: '#374151',
                fontWeight: '500',
                fontFamily: 'Monaco, monospace',
              }}
            >
              🌐 {url}
            </div>

            <div
              style={{
                marginTop: '32px',
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: '12px',
                padding: '12px 24px',
                fontSize: '18px',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              📸 Visual Comparison
            </div>
          </div>

          <div
            style={{
              position: 'absolute',
              bottom: '20px',
              right: '30px',
              fontSize: '16px',
              color: 'rgba(255, 255, 255, 0.8)',
              fontWeight: '500',
            }}
          >
            InternetFriends.xyz
          </div>
        </div>
      ),
      {
        width,
        height,
      }
    );
  } catch (error) {
    console.error('OG Screenshot generation failed:', error);
    
    return new ImageResponse(
      (
        <div
          style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#fee2e2',
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          <div
            style={{
              fontSize: '48px',
              fontWeight: 'bold',
              color: '#dc2626',
              marginBottom: '24px',
            }}
          >
            ❌ Screenshot Failed
          </div>
          <div
            style={{
              fontSize: '24px',
              color: '#7f1d1d',
              textAlign: 'center',
              maxWidth: '600px',
            }}
          >
            Unable to generate screenshot for the provided URL
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, name, width = 1200, height = 630 } = await request.json();
    
    if (!url) {
      return Response.json({ error: 'URL is required' }, { status: 400 });
    }

    // Generate the OG image URL
    const ogUrl = new URL('/api/og-screenshot', request.nextUrl.origin);
    ogUrl.searchParams.set('url', url);
    ogUrl.searchParams.set('name', name || 'Screenshot');
    ogUrl.searchParams.set('width', width.toString());
    ogUrl.searchParams.set('height', height.toString());

    return Response.json({
      success: true,
      screenshot: ogUrl.toString(),
      name: name || 'Screenshot',
      url,
      timestamp: new Date().toISOString(),
      type: 'og-image'
    });
    
  } catch (error) {
    console.error('OG Screenshot API error:', error);
    
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Screenshot generation failed'
    }, { status: 500 });
  }
}