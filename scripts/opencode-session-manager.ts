#!/usr/bin/env bun
/**
 * OpenCode Session Manager - Async Background Processing
 * Handles parallel OpenCode sessions for visual analysis tasks
 */

import { spawn } from 'child_process';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { generateStamp, getIsoTimestamp } from '../nextjs-website/lib/utils/stamp';

interface SessionTask {
  id: string;
  name: string;
  command: string;
  args: string[];
  workingDir: string;
  estimatedTime: number; // in seconds
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'running' | 'completed' | 'failed';
  output: string[];
  startTime?: Date;
  endTime?: Date;
}

interface SessionManager {
  sessionId: string;
  createdAt: string;
  tasks: Map<string, SessionTask>;
  logFile: string;
  running: Set<string>;
  maxConcurrent: number;
}

class OpenCodeSessionManager {
  private sessions = new Map<string, SessionManager>();
  private readonly logsDir = join(process.cwd(), '.opencode-sessions');

  constructor() {
    // Ensure logs directory exists
    if (!existsSync(this.logsDir)) {
      mkdirSync(this.logsDir, { recursive: true });
    }
  }

  createSession(sessionId?: string): string {
    const id = sessionId || generateStamp();
    const logFile = join(this.logsDir, `session-${id}.log`);
    
    this.sessions.set(id, {
      sessionId: id,
      createdAt: getIsoTimestamp(),
      tasks: new Map(),
      logFile,
      running: new Set(),
      maxConcurrent: 3
    });

    this.log(id, `🚀 OpenCode session started: ${id}`);
    return id;
  }

  addTask(sessionId: string, task: Omit<SessionTask, 'id' | 'status' | 'output'>): string {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const taskId = generateStamp();
    const fullTask: SessionTask = {
      ...task,
      id: taskId,
      status: 'pending',
      output: []
    };

    session.tasks.set(taskId, fullTask);
    this.log(sessionId, `📋 Task added: ${task.name} (${taskId})`);
    
    return taskId;
  }

  async runTasksParallel(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (!session) throw new Error(`Session ${sessionId} not found`);

    const pendingTasks = Array.from(session.tasks.values())
      .filter(task => task.status === 'pending')
      .sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      });

    this.log(sessionId, `🔄 Starting ${pendingTasks.length} tasks in parallel (max ${session.maxConcurrent})`);

    // Process tasks in batches
    for (let i = 0; i < pendingTasks.length; i += session.maxConcurrent) {
      const batch = pendingTasks.slice(i, i + session.maxConcurrent);
      
      await Promise.all(
        batch.map(task => this.runTask(sessionId, task.id))
      );
    }

    this.log(sessionId, `✅ All tasks completed for session ${sessionId}`);
  }

  private async runTask(sessionId: string, taskId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    const task = session?.tasks.get(taskId);
    
    if (!session || !task) return;

    task.status = 'running';
    task.startTime = new Date();
    session.running.add(taskId);

    this.log(sessionId, `▶️ Running: ${task.name}`);

    return new Promise((resolve) => {
      const process = spawn(task.command, task.args, {
        cwd: task.workingDir,
        stdio: ['ignore', 'pipe', 'pipe'],
        shell: true
      });

      process.stdout?.on('data', (data) => {
        const output = data.toString().trim();
        task.output.push(output);
        this.log(sessionId, `📤 ${task.name}: ${output}`);
      });

      process.stderr?.on('data', (data) => {
        const error = data.toString().trim();
        task.output.push(`ERROR: ${error}`);
        this.log(sessionId, `❌ ${task.name}: ${error}`);
      });

      process.on('close', (code) => {
        task.endTime = new Date();
        task.status = code === 0 ? 'completed' : 'failed';
        session.running.delete(taskId);

        const duration = task.endTime.getTime() - (task.startTime?.getTime() || 0);
        const emoji = code === 0 ? '✅' : '❌';
        
        this.log(sessionId, `${emoji} ${task.name} finished (${duration}ms, exit code: ${code})`);
        resolve();
      });

      // Timeout handling
      setTimeout(() => {
        if (task.status === 'running') {
          process.kill();
          task.status = 'failed';
          task.output.push('TIMEOUT: Task exceeded estimated time');
          this.log(sessionId, `⏰ ${task.name} timed out`);
          resolve();
        }
      }, task.estimatedTime * 1000 * 2); // 2x estimated time for timeout
    });
  }

  private log(sessionId: string, message: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    const timestamp = new Date().toISOString();
    const logLine = `[${timestamp}] ${message}\n`;
    
    // Write to log file
    writeFileSync(session.logFile, logLine, { flag: 'a' });
    
    // Also console log for immediate feedback
    console.log(`[${sessionId.slice(-8)}] ${message}`);
  }

  getSessionStatus(sessionId: string): any {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    const tasks = Array.from(session.tasks.values());
    const completed = tasks.filter(t => t.status === 'completed').length;
    const failed = tasks.filter(t => t.status === 'failed').length;
    const running = tasks.filter(t => t.status === 'running').length;
    const pending = tasks.filter(t => t.status === 'pending').length;

    return {
      sessionId,
      createdAt: session.createdAt,
      stats: { completed, failed, running, pending, total: tasks.length },
      logFile: session.logFile,
      isComplete: pending === 0 && running === 0
    };
  }

  async createParallelSessions(sessionNames: string[]): Promise<string[]> {
    const sessionIds = sessionNames.map(name => {
      const sessionId = this.createSession(`${name}-${generateStamp().slice(-5)}`);
      
      // Add common development tasks for each session
      this.addTask(sessionId, {
        name: `Setup ${name} environment`,
        command: 'bun',
        args: ['-e', `"console.log('Setting up ${name} session...')"`],
        workingDir: process.cwd(),
        estimatedTime: 5,
        priority: 'high'
      });

      return sessionId;
    });

    // Start all sessions in parallel
    await Promise.all(
      sessionIds.map(id => this.runTasksParallel(id))
    );

    return sessionIds;
  }
}

// CLI and module usage
const manager = new OpenCodeSessionManager();

// Export for module usage
export { manager as openCodeSessionManager, OpenCodeSessionManager };

// Export specific functions for dynamic imports
export function createParallelSessions(names: string[]) {
  return manager.createParallelSessions(names);
}

export function createVisualAnalysisSession(analysisResult: any) {
  const sessionId = manager.createSession(`visual-analysis-${generateStamp().slice(-8)}`);
  
  // Add specific visual analysis tasks
  if (analysisResult.analysis?.actionItems) {
    analysisResult.analysis.actionItems.forEach((item: any, index: number) => {
      manager.addTask(sessionId, {
        name: `Visual Fix ${index + 1}: ${item.task}`,
        command: 'bun',
        args: ['-e', `console.log('Processing: ${item.task.replace(/'/g, "\\'")}')`],
        workingDir: join(process.cwd(), 'nextjs-website'),
        estimatedTime: parseInt(item.estimatedTime) * 60 || 1800, // Convert to seconds
        priority: item.priority || 'medium'
      });
    });
  }

  // Add screenshot capture task
  manager.addTask(sessionId, {
    name: 'Capture Design System Screenshots',
    command: 'curl',
    args: [
      '-X', 'POST',
      'http://localhost:3000/api/screenshot',
      '-H', 'Authorization: Bearer dev-screenshot-key-2024',
      '-d', '{"components":["button","glass-card","header"]}'
    ],
    workingDir: process.cwd(),
    estimatedTime: 30,
    priority: 'medium'
  });

  return { sessionId, manager };
}

// CLI usage
if (import.meta.main) {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.length === 0) {
    console.log(`
🤖 OpenCode Session Manager

Usage:
  bun scripts/opencode-session-manager.ts [command] [options]

Commands:
  parallel <name1,name2,name3>     Create parallel sessions
  visual-analysis <analysis.json>  Create visual analysis session
  status <sessionId>               Get session status
  logs <sessionId>                 Show session logs

Examples:
  bun scripts/opencode-session-manager.ts parallel design-tokens,glass-utilities,component-audit
  bun -e "require('./scripts/opencode-session-manager').createParallelSessions(['test1', 'test2'])"
`);
    process.exit(0);
  }

  const command = args[0];
  
  if (command === 'parallel') {
    const names = args[1] ? args[1].split(',') : ['session1', 'session2'];
    manager.createParallelSessions(names).then(sessionIds => {
      console.log(`✅ Created ${sessionIds.length} parallel sessions:`, sessionIds);
    });
  } else if (command === 'status') {
    const sessionId = args[1];
    if (sessionId) {
      const status = manager.getSessionStatus(sessionId);
      console.log(JSON.stringify(status, null, 2));
    } else {
      console.error('Session ID required for status command');
    }
  } else {
    console.log('Unknown command. Use --help for usage.');
  }
}