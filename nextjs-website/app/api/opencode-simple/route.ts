import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { screenshot, task, includeCode = true } = await request.json();

    // Save screenshot for OpenCode to analyze
    const tempDir = join(process.cwd(), '.temp');
    if (!existsSync(tempDir)) {
      mkdirSync(tempDir, { recursive: true });
    }
    
    const timestamp = Date.now();
    const screenshotPath = join(tempDir, `ui-screenshot-${timestamp}.png`);
    
    // Convert base64 to file
    const base64Data = screenshot.replace(/^data:image\/png;base64,/, '');
    writeFileSync(screenshotPath, base64Data, 'base64');

    // Call your existing OpenCode session manager
    const sessionManagerPath = join(process.cwd(), 'scripts/opencode-session-manager.ts');
    
    return new Promise<NextResponse>((resolve) => {
      // Create a session for UI analysis
      const openCodeProcess = spawn('bun', [sessionManagerPath, 'visual-analysis'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          SCREENSHOT_PATH: screenshotPath,
          ANALYSIS_TASK: task,
          INCLUDE_CODE: includeCode.toString()
        }
      });

      let output = '';
      let insights = '';

      openCodeProcess.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Extract insights from OpenCode output
        if (text.includes('Analysis complete') || text.includes('suggestions')) {
          insights += text;
        }
      });

      openCodeProcess.stderr?.on('data', (data) => {
        output += `ERROR: ${data.toString()}`;
      });

      openCodeProcess.on('close', (code) => {
        const result = {
          success: code === 0,
          insights: insights || 'OpenCode analysis completed - check session logs for details',
          output: output.slice(-500), // Last 500 chars
          screenshotPath,
          timestamp: new Date().toISOString(),
          sessionId: `visual-analysis-${timestamp}`
        };

        resolve(NextResponse.json(result));
      });

      // Timeout after 60 seconds
      setTimeout(() => {
        openCodeProcess.kill();
        resolve(NextResponse.json({
          success: false,
          error: 'OpenCode analysis timeout',
          output,
          screenshotPath
        }));
      }, 60000);
    });

  } catch (error) {
    console.error('OpenCode simple API error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}