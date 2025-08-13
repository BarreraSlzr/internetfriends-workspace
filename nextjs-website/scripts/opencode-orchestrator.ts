#!/usr/bin/env bun
/**
 * OpenCode Orchestrator with /share progress monitoring
 * - Generates delegation + helper context
 * - Pipes to opencode in background terminal
 * - Writes progress to /share for async monitoring
 */

import { $ } from 'bun';
import { generateStamp, getIsoTimestamp } from '../../components/utils/stamp';
import { mkdir, writeFile } from 'node:fs/promises';

interface ProgressState {
  sessionId: string;
  createdAt: string;
  status: 'starting' | 'delegation' | 'helper' | 'opencode' | 'complete' | 'error';
  phase: string;
  progress: number;
  tasks: {
    delegation: { status: string; data?: unknown };
    helper: { status: string; data?: unknown };
    opencode: { status: string; data?: unknown };
  };
  artifacts: {
    prompt?: string;
    delegation?: string;
    helper?: string;
  };
  data?: { pid?: number };
}

async function ensureShareDir() {
  const shareDir = '/tmp/share/opencode';
  await mkdir(shareDir, { recursive: true });
  return shareDir;
}

async function writeProgress(sessionId: string, progress: Partial<ProgressState>) {
  const shareDir = await ensureShareDir();
  const progressFile = `${shareDir}/session-${sessionId}.json`;
  const currentFile = `${shareDir}/current.json`;
  
  try {
    await writeFile(progressFile, JSON.stringify(progress, null, 2));
    await writeFile(currentFile, JSON.stringify(progress, null, 2));
  } catch (err) {
    console.error('Failed to write progress:', err);
  }
}

async function buildPrompt(sessionId: string, runHelper: boolean): Promise<string> {
  // Update progress: delegation phase
  await writeProgress(sessionId, {
    sessionId,
    status: 'delegation',
    phase: 'Generating delegation plan',
    progress: 20
  });

  const delegation = await $`bun ../components/scripts/opencode-delegate.ts --json`.json();
  
  let helperOutput = '';
  if (runHelper) {
    await writeProgress(sessionId, {
      sessionId,
      status: 'helper',
      phase: 'Running component helper analysis',
      progress: 50
    });

    try {
      const result = await $`bun ../components/.opencode/helper.ts --all --events`;
      helperOutput = result.text();
    } catch (err) {
      helperOutput = `Helper failed: ${(err as Error).message}`;
    }
  }

  const prompt = `# OpenCode Session Context
Generated: ${getIsoTimestamp()}
Session ID: ${sessionId}

## Delegation Plan
\`\`\`json
${JSON.stringify(delegation, null, 2)}
\`\`\`

${runHelper ? `## Helper Analysis
\`\`\`
${helperOutput}
\`\`\`
` : ''}

## Instructions
Review the delegation tasks and ${runHelper ? 'helper analysis. ' : ''}Provide recommendations for:
1. Task prioritization and execution order  
2. Component patterns that need attention
3. Next actionable steps for development

Focus on steadiest addressability patterns and maintain workspace cohesion.`;

  // Store artifacts
  await writeProgress(sessionId, {
    sessionId,
    status: 'opencode',
    phase: 'Piping to OpenCode',
    progress: 80,
    artifacts: {
      prompt,
      delegation: JSON.stringify(delegation, null, 2),
      helper: helperOutput
    }
  });

  return prompt;
}

async function main() {
  const args = process.argv.slice(2);
  const runHelper = args.includes('--helper');
  const background = args.includes('--bg');
  const sessionId = generateStamp();

  try {
    // Initialize progress
    await writeProgress(sessionId, {
      sessionId,
      createdAt: getIsoTimestamp(),
      status: 'starting',
      phase: 'Initializing OpenCode session',
      progress: 0,
      tasks: {
        delegation: { status: 'pending' },
        helper: { status: runHelper ? 'pending' : 'skipped' },
        opencode: { status: 'pending' }
      },
      artifacts: {}
    });

    console.log(`🎭 OpenCode Session Started: ${sessionId}`);
    console.log(`📊 Progress: /tmp/share/opencode/session-${sessionId}.json`);
    
    const prompt = await buildPrompt(sessionId, runHelper);
    
    if (background) {
      // Background execution - start opencode and return
      const proc = Bun.spawn(['opencode'], {
        stdin: 'pipe',
        stdout: 'pipe',
        stderr: 'pipe'
      });
      
      proc.stdin?.write(prompt);
      proc.stdin?.end();
      
      console.log(`🔄 OpenCode running in background (PID: ${proc.pid})`);
      console.log(`📈 Monitor: bun scripts/monitor-opencode.ts ${sessionId}`);
      
      await writeProgress(sessionId, {
        sessionId,
        status: 'opencode',
        phase: 'OpenCode processing in background',
        progress: 90,
        data: { pid: proc.pid }
      });
      
    } else {
      // Foreground execution - pipe and wait
      const proc = Bun.spawn(['opencode'], {
        stdin: 'pipe',
        stdout: 'inherit',
        stderr: 'inherit'
      });
      
      proc.stdin?.write(prompt);
      proc.stdin?.end();
      
      await proc.exited;
      
      await writeProgress(sessionId, {
        sessionId,
        status: 'complete',
        phase: 'OpenCode session completed',
        progress: 100
      });
    }
    
  } catch (error) {
    await writeProgress(sessionId, {
      sessionId,
      status: 'error',
      phase: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      progress: 0
    });
    
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    process.exit(1);
  }
}

main();
