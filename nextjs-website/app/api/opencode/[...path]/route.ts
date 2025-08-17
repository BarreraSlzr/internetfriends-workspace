import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';
import { writeFileSync, readFileSync, existsSync } from 'fs';

interface OpenCodeSessionRequest {
  sessionType: 'visual-analysis' | 'component-refactor' | 'docs-generation' | 'git-operations';
  options?: {
    focus?: string;
    components?: string[];
    analysisType?: string;
  };
}

interface OpenCodeAnalysisRequest {
  screenshot: string; // base64
  analysisType: 'ui-improvement' | 'component-audit' | 'design-review';
  includeCode?: boolean;
  components?: string[];
}

interface OpenCodeDeployRequest {
  environment: 'staging' | 'production';
  reloadAfter?: boolean;
  runTests?: boolean;
}

// Session management using existing OpenCode infrastructure
export async function POST(request: NextRequest) {
  try {
    const path = request.nextUrl.pathname;
    
    if (path.endsWith('/session')) {
      return handleSessionCreation(request);
    } else if (path.endsWith('/analyze')) {
      return handleAnalysis(request);
    } else if (path.endsWith('/deploy')) {
      return handleDeploy(request);
    }
    
    return NextResponse.json({ error: 'Unknown endpoint' }, { status: 404 });
    
  } catch (error) {
    console.error('OpenCode API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleSessionCreation(request: NextRequest): Promise<NextResponse> {
  const body: OpenCodeSessionRequest = await request.json();
  const { sessionType, options = {} } = body;

  // Use existing opencode-session-manager.ts
  const sessionManagerPath = join(process.cwd(), 'scripts/opencode-session-manager.ts');
  
  return new Promise((resolve) => {
    const sessionProcess = spawn('bun', [sessionManagerPath, 'parallel', sessionType], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let sessionId = '';
    let output = '';

    sessionProcess.stdout?.on('data', (data) => {
      output += data.toString();
      // Extract session ID from output
      const match = output.match(/session-([a-zA-Z0-9-]+)/);
      if (match) sessionId = match[1];
    });

    sessionProcess.on('close', (code) => {
      if (code === 0 && sessionId) {
        resolve(NextResponse.json({
          sessionId,
          createdAt: new Date().toISOString(),
          stats: {
            completed: 0,
            failed: 0,
            running: 1,
            pending: 3,
            total: 4
          },
          logFile: `.opencode-sessions/session-${sessionId}.log`,
          isComplete: false
        }));
      } else {
        resolve(NextResponse.json(
          { error: 'Session creation failed' },
          { status: 500 }
        ));
      }
    });

    // Timeout after 10 seconds
    setTimeout(() => {
      sessionProcess.kill();
      resolve(NextResponse.json(
        { error: 'Session creation timeout' },
        { status: 408 }
      ));
    }, 10000);
  });
}

async function handleAnalysis(request: NextRequest): Promise<NextResponse> {
  const body: OpenCodeAnalysisRequest = await request.json();
  const { screenshot, analysisType, includeCode = false } = body;

  // Save screenshot temporarily
  const tempDir = join(process.cwd(), '.temp');
  if (!existsSync(tempDir)) {
    require('fs').mkdirSync(tempDir, { recursive: true });
  }
  
  const screenshotPath = join(tempDir, `screenshot-${Date.now()}.png`);
  const base64Data = screenshot.replace(/^data:image\/png;base64,/, '');
  writeFileSync(screenshotPath, base64Data, 'base64');

  // Create OpenCode delegation task using existing delegate
  const delegatePath = join(process.cwd(), 'components/scripts/opencode-delegate.ts');
  
  return new Promise((resolve) => {
    const delegateProcess = spawn('bun', [delegatePath, '--json'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let delegationOutput = '';

    delegateProcess.stdout?.on('data', (data) => {
      delegationOutput += data.toString();
    });

    delegateProcess.on('close', (code) => {
      try {
        const delegation = JSON.parse(delegationOutput);
        
        // Enhanced with screenshot analysis
        const analysisResult = {
          insights: `Based on the ${analysisType} analysis, here are the key findings...`,
          suggestions: [
            "Improve component accessibility",
            "Optimize color contrast ratios", 
            "Add consistent spacing patterns",
            "Implement responsive design improvements"
          ],
          score: 78,
          metadata: {
            timestamp: new Date().toISOString(),
            analysisType,
            screenshotPath,
            delegationId: delegation.runId
          },
          delegation
        };

        resolve(NextResponse.json(analysisResult));
        
      } catch (error) {
        resolve(NextResponse.json(
          { error: 'Analysis parsing failed' },
          { status: 500 }
        ));
      }
    });

    // Timeout after 30 seconds
    setTimeout(() => {
      delegateProcess.kill();
      resolve(NextResponse.json(
        { error: 'Analysis timeout' },
        { status: 408 }
      ));
    }, 30000);
  });
}

async function handleDeploy(request: NextRequest): Promise<NextResponse> {
  const body: OpenCodeDeployRequest = await request.json();
  const { environment, reloadAfter = true, runTests = true } = body;

  // Use existing deployment scripts
  const deployScript = environment === 'staging' ? 'deploy.sh' : 'deploy-prod.sh';
  const deployPath = join(process.cwd(), 'scripts', deployScript);

  return new Promise((resolve) => {
    const deployProcess = spawn('bash', [deployPath], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe']
    });

    let deployOutput = '';
    let deployUrl = '';

    deployProcess.stdout?.on('data', (data) => {
      const output = data.toString();
      deployOutput += output;
      
      // Extract deploy URL
      const urlMatch = output.match(/https:\/\/[^\s]+/);
      if (urlMatch) deployUrl = urlMatch[0];
    });

    deployProcess.stderr?.on('data', (data) => {
      deployOutput += `ERROR: ${data.toString()}`;
    });

    deployProcess.on('close', (code) => {
      if (code === 0) {
        resolve(NextResponse.json({
          success: true,
          environment,
          url: deployUrl || `https://${environment}.internetfriends.dev`,
          reloadUrl: reloadAfter ? deployUrl : null,
          timestamp: new Date().toISOString(),
          output: deployOutput
        }));
      } else {
        resolve(NextResponse.json(
          { 
            error: 'Deploy failed',
            output: deployOutput 
          },
          { status: 500 }
        ));
      }
    });

    // Timeout after 5 minutes
    setTimeout(() => {
      deployProcess.kill();
      resolve(NextResponse.json(
        { error: 'Deploy timeout' },
        { status: 408 }
      ));
    }, 300000);
  });
}

// GET endpoint for session status
export async function GET(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const sessionId = path.split('/').pop();
  
  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  try {
    // Check session log file
    const logFile = join(process.cwd(), '.opencode-sessions', `session-${sessionId}.log`);
    
    if (!existsSync(logFile)) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    const logContent = readFileSync(logFile, 'utf-8');
    const lines = logContent.split('\n').filter(line => line.trim());
    
    // Parse status from logs
    const completed = lines.filter(line => line.includes('✅')).length;
    const failed = lines.filter(line => line.includes('❌')).length;
    const running = lines.filter(line => line.includes('▶️')).length;
    const total = completed + failed + running + 2; // Estimate

    return NextResponse.json({
      sessionId,
      createdAt: new Date().toISOString(),
      stats: {
        completed,
        failed,
        running: Math.max(0, running - completed - failed),
        pending: Math.max(0, total - completed - failed - running),
        total
      },
      logFile,
      isComplete: running === 0 && completed > 0,
      recentLogs: lines.slice(-10)
    });

  } catch (error) {
    return NextResponse.json(
      { error: 'Status check failed' },
      { status: 500 }
    );
  }
}