#!/usr/bin/env bun

/**
 * Design System Pre-build Hook
 * Generates component snapshots before starting development
 */

import { ComponentSnapshotGenerator } from '../lib/design-system/component-snapshot-generator';
import { existsSync } from 'fs';

async function ensureSnapshots() {
  console.log('🔍 Checking component snapshots...');
  
  const generator = new ComponentSnapshotGenerator();
  
  // Check if snapshots exist and are recent
  if (await generator.needsRegeneration()) {
    console.log('📋 Generating component documentation snapshots...');
    await generator.generateSnapshots();
    console.log('✅ Component snapshots ready!');
  } else {
    console.log('📋 Component snapshots are up to date');
  }
}

// Run if called directly
if (import.meta.main) {
  await ensureSnapshots();
}