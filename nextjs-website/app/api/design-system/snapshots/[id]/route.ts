/**
 * Individual Component Snapshot API
 */

import { NextRequest, NextResponse } from 'next/server';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const CACHE_DIR = '.cache';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: componentId } = await params;
  
  try {
    const snapshotPath = join(process.cwd(), CACHE_DIR, `${componentId}.json`);
    
    if (!existsSync(snapshotPath)) {
      return NextResponse.json({ error: 'Component not found' }, { status: 404 });
    }
    
    const content = readFileSync(snapshotPath, 'utf-8');
    const snapshot = JSON.parse(content);
    
    return NextResponse.json(snapshot, {
      headers: {
        'Cache-Control': 'public, max-age=600', // 10 minutes
      },
    });
  } catch (error) {
    console.error(`Failed to load snapshot for ${componentId}:`, error);
    return NextResponse.json(
      { error: 'Failed to load component snapshot' },
      { status: 500 }
    );
  }
}