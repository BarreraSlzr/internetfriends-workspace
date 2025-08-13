#!/usr/bin/env bun
/**
 * OpenCode Progress Monitor
 * Watches /share/opencode for session progress updates
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

async function monitorSession(sessionId: string) {
  const shareDir = '/tmp/share/opencode';
  const sessionFile = `${shareDir}/session-${sessionId}.json`;
  
  if (!existsSync(sessionFile)) {
    console.log(`❌ Session ${sessionId} not found`);
    return;
  }

  console.log(`📊 Monitoring OpenCode session: ${sessionId}\n`);
  
  let lastStatus = '';
  const checkInterval = setInterval(async () => {
    try {
      const content = await readFile(sessionFile, 'utf8');
      const progress = JSON.parse(content);
      
      if (progress.status !== lastStatus) {
        const statusIcon = getStatusIcon(progress.status);
        console.log(`${statusIcon} ${progress.phase} (${progress.progress}%)`);
        
        if (progress.status === 'complete') {
          console.log('✅ OpenCode session completed');
          clearInterval(checkInterval);
        } else if (progress.status === 'error') {
          console.log('❌ OpenCode session failed');
          clearInterval(checkInterval);
        }
        
        lastStatus = progress.status;
      }
    } catch (err) {
      console.error('Error reading progress:', err);
    }
  }, 1000);
}

function getStatusIcon(status: string): string {
  switch (status) {
    case 'starting': return '🎬';
    case 'delegation': return '📋';
    case 'helper': return '🔍';
    case 'opencode': return '🎭';
    case 'complete': return '✅';
    case 'error': return '❌';
    default: return '⏳';
  }
}

async function listSessions() {
  const shareDir = '/tmp/share/opencode';
  
  if (!existsSync(shareDir)) {
    console.log('No OpenCode sessions found');
    return;
  }

  try {
    const currentFile = `${shareDir}/current.json`;
    if (existsSync(currentFile)) {
      const content = await readFile(currentFile, 'utf8');
      const current = JSON.parse(content);
      console.log(`📊 Current session: ${current.sessionId}`);
      console.log(`   Status: ${current.status} (${current.progress}%)`);
      console.log(`   Phase: ${current.phase}`);
    } else {
      console.log('No active OpenCode sessions');
    }
  } catch (err) {
    console.error('Error reading sessions:', err);
  }
}

// CLI behavior
const args = process.argv.slice(2);
const sessionId = args[0];

if (!sessionId) {
  listSessions();
} else {
  monitorSession(sessionId);
}
