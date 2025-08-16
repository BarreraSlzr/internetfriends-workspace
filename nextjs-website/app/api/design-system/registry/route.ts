import { NextRequest, NextResponse } from 'next/server';
import { componentRegistry } from '@/lib/design-system/component-registry';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'components'; // 'components', 'pages', or 'full'
    const includeScreenshots = searchParams.get('screenshots') === 'true';

    if (type === 'full') {
      // Return the complete registry for client-side use
      const components = await componentRegistry.getAllComponents();
      const pages = await componentRegistry.getAllPages();
      const statistics = await componentRegistry.getStatistics();
      
      const relationships = {
        componentToPages: components.reduce((acc, comp) => {
          acc[comp.id] = comp.usedInPages;
          return acc;
        }, {} as Record<string, string[]>),
        pageToComponents: pages.reduce((acc, page) => {
          acc[page.id] = page.componentsUsed;
          return acc;
        }, {} as Record<string, string[]>),
        componentDependencies: components.reduce((acc, comp) => {
          acc[comp.id] = comp.dependencies;
          return acc;
        }, {} as Record<string, string[]>)
      };

      return NextResponse.json({
        success: true,
        registry: {
          components,
          pages,
          relationships,
          statistics
        },
        type: 'full'
      });
    }

    if (type === 'pages') {
      const pages = await componentRegistry.getAllPages();
      
      if (includeScreenshots) {
        // In a real implementation, this would generate screenshots for pages
        const pagesWithScreenshots = await Promise.all(
          pages.map(async (page) => ({
            ...page,
            screenshotUrl: page.hasScreenshot 
              ? `/api/screenshot?url=${encodeURIComponent(`http://localhost:3002${page.route}`)}&name=${page.name}`
              : null
          }))
        );
        
        return NextResponse.json({
          success: true,
          data: pagesWithScreenshots,
          type: 'pages',
          count: pagesWithScreenshots.length
        });
      }
      
      return NextResponse.json({
        success: true,
        data: pages,
        type: 'pages',
        count: pages.length
      });
    }

    // Return components
    const components = await componentRegistry.getAllComponents();
    const statistics = await componentRegistry.getStatistics();
    
    return NextResponse.json({
      success: true,
      data: components,
      statistics,
      type: 'components',
      count: components.length,
      relationships: {
        componentToPages: components.reduce((acc, comp) => {
          acc[comp.id] = comp.usedInPages;
          return acc;
        }, {} as Record<string, string[]>)
      }
    });
    
  } catch (error) {
    console.error('Registry API error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to load registry data'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, data } = await request.json();
    
    switch (action) {
      case 'update_component':
        await componentRegistry.updateComponent(data.id, data.updates);
        return NextResponse.json({ success: true, message: 'Component updated' });
        
      case 'add_component':
        await componentRegistry.addComponent(data);
        return NextResponse.json({ success: true, message: 'Component added' });
        
      case 'add_page':
        await componentRegistry.addPage(data);
        return NextResponse.json({ success: true, message: 'Page added' });
        
      case 'refresh_registry':
        await componentRegistry.refreshRegistry();
        return NextResponse.json({ success: true, message: 'Registry refreshed' });
        
      case 'generate_screenshots':
        // Trigger screenshot generation for all pages
        const pages = await componentRegistry.getAllPages();
        const screenshotResults = [];
        
        for (const page of pages) {
          try {
            const response = await fetch('/api/screenshot', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.SCREENSHOT_API_KEY || 'dev-screenshot-key-2024'}`
              },
              body: JSON.stringify({
                url: `http://localhost:3002${page.route}`,
                name: page.name,
                waitFor: 2000,
                viewport: { width: 1280, height: 720 },
                fullPage: true
              })
            });
            
            if (response.ok) {
              const result = await response.json();
              screenshotResults.push({
                pageId: page.id,
                success: true,
                screenshot: result.screenshot
              });
              
              // Update registry with screenshot URL
              await componentRegistry.addPage({
                ...page,
                hasScreenshot: true,
                screenshotUrl: result.screenshot
              });
            } else {
              screenshotResults.push({
                pageId: page.id,
                success: false,
                error: 'Screenshot API error'
              });
            }
          } catch (error) {
            screenshotResults.push({
              pageId: page.id,
              success: false,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        }
        
        return NextResponse.json({
          success: true,
          message: 'Screenshot generation completed',
          results: screenshotResults
        });
        
      default:
        return NextResponse.json({
          success: false,
          error: 'Unknown action'
        }, { status: 400 });
    }
    
  } catch (error) {
    console.error('Registry API POST error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process request'
    }, { status: 500 });
  }
}