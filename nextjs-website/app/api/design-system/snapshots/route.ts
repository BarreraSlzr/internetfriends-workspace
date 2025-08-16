/**
 * Component Snapshots API
 * Serves pre-generated component documentation snapshots
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComponentSnapshotGenerator, SnapshotDatabase } from '@/lib/design-system/component-snapshot-generator';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = '.cache';

export async function GET(request: NextRequest) {
  const { pathname } = new URL(request.url);
  
  try {
    // Handle different routes
    if (pathname.endsWith('/snapshots')) {
      // Return database index
      return await getDatabaseIndex();
    }
    
    if (pathname.includes('/snapshots/')) {
      // Return specific component snapshot
      const componentId = pathname.split('/snapshots/')[1];
      return await getComponentSnapshot(componentId);
    }
    
    // Handle snapshot generation
    if (pathname.endsWith('/generate')) {
      return await generateSnapshots();
    }
    
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
    
  } catch (error) {
    console.error('Snapshots API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get database index
 */
async function getDatabaseIndex(): Promise<NextResponse> {
  const indexPath = join(process.cwd(), CACHE_DIR, 'component-index.json');
  
  if (!existsSync(indexPath)) {
    // Generate snapshots if they don't exist
    await generateSnapshots();
  }
  
  try {
    const content = readFileSync(indexPath, 'utf-8');
    const index = JSON.parse(content);
    
    return NextResponse.json(index, {
      headers: {
        'Cache-Control': 'public, max-age=300', // 5 minutes
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load index' }, { status: 500 });
  }
}

/**
 * Get specific component snapshot
 */
async function getComponentSnapshot(componentId: string): Promise<NextResponse> {
  const snapshotPath = join(process.cwd(), CACHE_DIR, `${componentId}.json`);
  
  if (!existsSync(snapshotPath)) {
    return NextResponse.json({ error: 'Component not found' }, { status: 404 });
  }
  
  try {
    const content = readFileSync(snapshotPath, 'utf-8');
    const snapshot = JSON.parse(content);
    
    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, max-age=600', // 10 minutes
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load snapshot' }, { status: 500 });
  }
}

/**
 * Generate new snapshots
 */
async function generateSnapshots(): Promise<NextResponse> {
  try {
    const generator = new ComponentSnapshotGenerator(CACHE_DIR);
    const database = await generator.generateSnapshots();
    
    return NextResponse.json({
      success: true,
      generated: database.totalComponents,
      timestamp: database.lastGenerated
    });
  } catch (error) {
    console.error('Failed to generate snapshots:', error);
    return NextResponse.json(
      { error: 'Failed to generate snapshots' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Force regeneration
  return await generateSnapshots();
}