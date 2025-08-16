/**
 * Component Snapshots Generate API
 * Endpoint to force regeneration of component snapshots
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComponentSnapshotGenerator } from '@/lib/design-system/component-snapshot-generator';

const CACHE_DIR = '.cache';

export async function POST(request: NextRequest) {
  try {
    console.log('Generating component snapshots...');
    const generator = new ComponentSnapshotGenerator(CACHE_DIR);
    const database = await generator.generateSnapshots();
    
    return NextResponse.json({
      success: true,
      generated: database.totalComponents,
      timestamp: database.lastGenerated,
      components: database.components.map(c => ({
        id: c.id,
        name: c.metadata.name,
        category: c.metadata.category
      }))
    });
  } catch (error) {
    console.error('Failed to generate snapshots:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate snapshots',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Also allow GET for testing
  return POST(request);
}