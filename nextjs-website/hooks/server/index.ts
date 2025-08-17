// Server-side hook utilities for Next.js API routes and SSR
import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

// Server-side storage implementation
export class ServerStorage {
  private static dataDir = join(process.cwd(), '.data');

  static {
    if (!existsSync(this.dataDir)) {
      mkdirSync(this.dataDir, { recursive: true });
    }
  }

  static async get<T>(key: string): Promise<T | null> {
    try {
      const filePath = join(this.dataDir, `${key}.json`);
      if (!existsSync(filePath)) return null;
      
      const data = readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      console.error(`ServerStorage.get error for ${key}:`, error);
      return null;
    }
  }

  static async set<T>(key: string, value: T): Promise<void> {
    try {
      const filePath = join(this.dataDir, `${key}.json`);
      writeFileSync(filePath, JSON.stringify(value, null, 2));
    } catch (error) {
      console.error(`ServerStorage.set error for ${key}:`, error);
    }
  }

  static async remove(key: string): Promise<void> {
    try {
      const filePath = join(this.dataDir, `${key}.json`);
      if (existsSync(filePath)) {
        require('fs').unlinkSync(filePath);
      }
    } catch (error) {
      console.error(`ServerStorage.remove error for ${key}:`, error);
    }
  }
}

// Server-side API hook utility
export function createServerHook<T>(
  handler: (request: NextRequest, params?: any) => Promise<T>
) {
  return async function serverHook(
    request: NextRequest,
    context?: { params?: any }
  ): Promise<NextResponse> {
    try {
      const result = await handler(request, context?.params);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Server hook error:', error);
      return NextResponse.json(
        { 
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        },
        { status: 500 }
      );
    }
  };
}

// Component registry server hook
export const useComponentRegistryServer = createServerHook(async (request) => {
  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search');
  const category = searchParams.get('category');

  // Load from your existing component registry
  const { componentRegistry } = await import('@/app/(internetfriends)/design-system/registry/component.registry');
  
  let components = componentRegistry.getAllComponents();
  
  if (search) {
    components = componentRegistry.searchComponents(search);
  }
  
  if (category && category !== 'all') {
    components = componentRegistry.getComponentsByCategory(category);
  }

  return {
    components,
    statistics: componentRegistry.getComponentStats(),
    timestamp: new Date().toISOString()
  };
});

// Design system statistics server hook
export const useDesignSystemStatsServer = createServerHook(async () => {
  const { componentRegistry } = await import('@/app/(internetfriends)/design-system/registry/component.registry');
  const stats = componentRegistry.getComponentStats();

  // Add additional server-side computed stats
  const enhancedStats = {
    ...stats,
    reusabilityScore: Math.round((stats.stable / stats.total) * 100),
    averageComponentsPerPage: stats.total > 0 ? (stats.page / stats.total) * 10 : 0,
    totalPages: stats.page,
    lastUpdated: new Date().toISOString()
  };

  // Cache stats for 5 minutes
  await ServerStorage.set('design-system-stats', {
    data: enhancedStats,
    timestamp: Date.now()
  });

  return enhancedStats;
});

// OpenCode session server hook
export const useOpenCodeServer = createServerHook(async (request) => {
  const body = await request.json();
  const { screenshot, task, includeCode } = body;

  // Use your existing OpenCode session manager
  const { openCodeSessionManager } = await import('@/scripts/opencode-session-manager');
  
  // Create analysis session
  const sessionId = openCodeSessionManager.createSession('web-analysis');
  
  // Add screenshot analysis task
  const taskId = openCodeSessionManager.addTask(sessionId, {
    name: 'Analyze UI Screenshot',
    command: 'bun',
    args: ['-e', `console.log('Analyzing: ${task}')`],
    workingDir: process.cwd(),
    estimatedTime: 30,
    priority: 'high'
  });

  // Save screenshot for processing
  if (screenshot) {
    const screenshotPath = join(process.cwd(), '.temp', `screenshot-${Date.now()}.png`);
    const base64Data = screenshot.replace(/^data:image\/png;base64,/, '');
    writeFileSync(screenshotPath, base64Data, 'base64');
  }

  // Start processing in background
  openCodeSessionManager.runTasksParallel(sessionId);

  return {
    sessionId,
    taskId,
    status: 'processing',
    insights: 'Analysis started - OpenCode is processing your screenshot...',
    timestamp: new Date().toISOString()
  };
});

// Deployment server hook
export const useDeploymentServer = createServerHook(async (request) => {
  const body = await request.json();
  const { environment = 'staging' } = body;

  // Execute deployment script
  const { spawn } = require('child_process');
  const deployScript = environment === 'staging' ? 'deploy.sh' : 'deploy-prod.sh';
  const deployPath = join(process.cwd(), 'scripts', deployScript);

  return new Promise((resolve, reject) => {
    const deployProcess = spawn('bash', [deployPath], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let output = '';
    let deployUrl = '';

    deployProcess.stdout?.on('data', (data: Buffer) => {
      const text = data.toString();
      output += text;
      
      const urlMatch = text.match(/https:\/\/[^\s]+/);
      if (urlMatch) deployUrl = urlMatch[0];
    });

    deployProcess.stderr?.on('data', (data: Buffer) => {
      output += `ERROR: ${data.toString()}`;
    });

    deployProcess.on('close', (code: number) => {
      if (code === 0) {
        resolve({
          success: true,
          environment,
          url: deployUrl || `https://${environment}.internetfriends.dev`,
          timestamp: new Date().toISOString(),
          output: output.slice(-200)
        });
      } else {
        reject(new Error(`Deploy failed with code ${code}: ${output}`));
      }
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      deployProcess.kill();
      reject(new Error('Deploy timeout'));
    }, 300000);
  });
});

// Cache management utilities
export class ServerCache {
  static async get<T>(key: string, maxAge: number = 5 * 60 * 1000): Promise<T | null> {
    const cached = await ServerStorage.get<{ data: T; timestamp: number }>(`cache:${key}`);
    
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > maxAge) {
      await ServerStorage.remove(`cache:${key}`);
      return null;
    }
    
    return cached.data;
  }

  static async set<T>(key: string, data: T): Promise<void> {
    await ServerStorage.set(`cache:${key}`, {
      data,
      timestamp: Date.now()
    });
  }

  static async invalidate(pattern: string): Promise<void> {
    // Simple pattern matching - in production you'd want more sophisticated cache invalidation
    const keys = [`cache:${pattern}`];
    for (const key of keys) {
      await ServerStorage.remove(key);
    }
  }
}

// Request/Response helpers
export function withCors(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*');
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  return response;
}

export function withCache(response: NextResponse, maxAge: number = 300): NextResponse {
  response.headers.set('Cache-Control', `public, max-age=${maxAge}`);
  return response;
}

export {
  createServerHook,
  ServerStorage,
  ServerCache
};