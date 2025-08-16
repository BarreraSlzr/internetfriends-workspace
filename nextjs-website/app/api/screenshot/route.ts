import { NextRequest, NextResponse } from 'next/server';
import { chromium } from 'playwright';

export const maxDuration = 30; // 30 seconds max for screenshots

export async function POST(request: NextRequest) {
  let browser = null;
  
  try {
    // Check API key authorization
    const authHeader = request.headers.get('authorization');
    const apiKey = process.env.SCREENSHOT_API_KEY || 'dev-screenshot-key-2024';
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ 
        error: 'Missing authorization header. Use: Authorization: Bearer <api-key>' 
      }, { status: 401 });
    }
    
    const providedKey = authHeader.replace('Bearer ', '');
    if (providedKey !== apiKey) {
      return NextResponse.json({ 
        error: 'Invalid API key' 
      }, { status: 403 });
    }
    
    const { 
      url, 
      name, 
      waitFor = 3000, 
      viewport = { width: 1280, height: 720 },
      fullPage = true,
      auth = null,
      cookies = null,
      headers = null
    } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    console.log(`📸 Capturing real screenshot for: ${url}`);

    // Launch browser with better options for production sites
    browser = await chromium.launch({ 
      headless: true,
      args: [
        '--no-sandbox', 
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--disable-gpu',
        '--window-size=1280,720'
      ]
    });
    
    const page = await browser.newPage();
    
    // Set viewport
    await page.setViewportSize(viewport);
    
    // Set extra headers if provided
    if (headers) {
      await page.setExtraHTTPHeaders(headers);
    }
    
    // Set cookies if provided (for authentication)
    if (cookies && Array.isArray(cookies)) {
      await page.context().addCookies(cookies);
    }
    
    // Set basic auth if provided
    if (auth && auth.username && auth.password) {
      await page.setHTTPCredentials({
        username: auth.username,
        password: auth.password
      });
    }
    
    // Navigate with better options for production sites
    const response = await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 25000 // 25 second timeout
    });
    
    if (!response) {
      throw new Error('Failed to load page - no response received');
    }
    
    if (!response.ok()) {
      console.warn(`Page returned status ${response.status()}: ${response.statusText()}`);
    }
    
    // Wait for content to stabilize
    await page.waitForTimeout(waitFor);
    
    // Wait for any remaining async operations
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    const screenshot = await page.screenshot({ 
      fullPage,
      animations: 'disabled',
      timeout: 10000
    });
    
    // Convert to base64
    const base64 = screenshot.toString('base64');
    const dataUrl = `data:image/png;base64,${base64}`;
    
    console.log(`✅ Real screenshot captured for ${name || url}`);
    
    return NextResponse.json({
      success: true,
      screenshot: dataUrl,
      name: name || 'Screenshot',
      url,
      timestamp: new Date().toISOString(),
      type: 'real-screenshot',
      size: screenshot.length,
      viewport
    });
    
  } catch (error) {
    console.error('❌ Real screenshot capture failed:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Screenshot capture failed',
      url: request.nextUrl.searchParams.get('url') || 'unknown'
    }, { status: 500 });
    
  } finally {
    if (browser) {
      await browser.close().catch(console.error);
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Real Screenshot API - Use POST with screenshot parameters',
    authentication: 'Required: Authorization: Bearer <api-key>',
    example: {
      url: 'https://example.com',
      name: 'Production',
      waitFor: 3000,
      viewport: { width: 1280, height: 720 },
      fullPage: true,
      auth: { username: 'user', password: 'pass' },
      cookies: [{ name: 'session', value: 'token', domain: '.example.com' }],
      headers: { 'Authorization': 'Bearer token' }
    },
    features: [
      'Real browser screenshots using Playwright',
      'API key authentication for security',
      'Authentication support (basic auth, cookies, headers)', 
      'Handles redirects and dynamic content',
      'Configurable viewport and wait times',
      'Full page or viewport screenshots'
    ]
  });
}