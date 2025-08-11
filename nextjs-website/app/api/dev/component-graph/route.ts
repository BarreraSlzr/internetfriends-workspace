import { NextRequest, NextResponse } from 'next/server';
import { ComponentGraphBuilder } from '@/scripts/build-component-graph';
import fs from 'node:fs/promises';
import path from 'node:path';

// Only enable in development
export const dynamic = 'force-dynamic';

const CACHE_FILE = '.cache/component-graph.json';

export async function GET(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Component graph API is only available in development' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const refresh = searchParams.get('refresh') === 'true';
  const cacheFilePath = path.join(process.cwd(), CACHE_FILE);

  try {
    // Check if cached data exists and is recent (unless refresh requested)
    if (!refresh) {
      try {
        const stats = await fs.stat(cacheFilePath);
        const cacheAge = Date.now() - stats.mtime.getTime();
        const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

        if (cacheAge < CACHE_TTL) {
          const cachedData = await fs.readFile(cacheFilePath, 'utf-8');
          const graphData = JSON.parse(cachedData);

          return NextResponse.json({
            ...graphData,
            meta: {
              cached: true,
              cacheAge: Math.round(cacheAge / 1000),
              lastBuilt: graphData.generatedAt,
            },
          });
        }
      } catch (error) {
        // Cache file doesn't exist or is corrupted, continue to rebuild
        console.log('No valid cache found, rebuilding component graph...');
      }
    }

    // Build fresh component graph
    console.log('🏗️ Building component graph...');
    const builder = new ComponentGraphBuilder();
    const graphData = await builder.build();

    // Save to cache
    await builder.saveToFile(graphData, cacheFilePath);

    return NextResponse.json({
      ...graphData,
      meta: {
        cached: false,
        cacheAge: 0,
        lastBuilt: graphData.generatedAt,
      },
    });

  } catch (error) {
    console.error('Error building component graph:', error);

    return NextResponse.json(
      {
        error: 'Failed to build component graph',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Only allow in development environment
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { error: 'Component graph API is only available in development' },
      { status: 403 }
    );
  }

  try {
    const { action } = await request.json();

    switch (action) {
      case 'rebuild':
        // Force rebuild the component graph
        const builder = new ComponentGraphBuilder();
        const graphData = await builder.build();
        const cacheFilePath = path.join(process.cwd(), CACHE_FILE);
        await builder.saveToFile(graphData, cacheFilePath);

        return NextResponse.json({
          success: true,
          message: 'Component graph rebuilt successfully',
          stats: graphData.stats,
        });

      case 'clear-cache':
        // Clear the cache file
        const cachePath = path.join(process.cwd(), CACHE_FILE);
        try {
          await fs.unlink(cachePath);
          return NextResponse.json({
            success: true,
            message: 'Cache cleared successfully',
          });
        } catch (error) {
          return NextResponse.json({
            success: true,
            message: 'No cache file to clear',
          });
        }

      default:
        return NextResponse.json(
          { error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error processing component graph action:', error);

    return NextResponse.json(
      {
        error: 'Failed to process action',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
