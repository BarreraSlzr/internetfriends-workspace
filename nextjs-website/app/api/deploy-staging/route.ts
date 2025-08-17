import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import { join } from 'path';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { environment = 'staging' } = await request.json();

    // Use your existing deploy script
    const deployScript = environment === 'staging' ? 'deploy.sh' : 'deploy-prod.sh';
    const deployPath = join(process.cwd(), 'scripts', deployScript);

    return new Promise<NextResponse>((resolve) => {
      const deployProcess = spawn('bash', [deployPath], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe']
      });

      let output = '';
      let deployUrl = '';

      deployProcess.stdout?.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // Extract deployment URL
        const urlMatch = text.match(/https:\/\/[^\s]+/);
        if (urlMatch) {
          deployUrl = urlMatch[0];
        }
      });

      deployProcess.stderr?.on('data', (data) => {
        output += `ERROR: ${data.toString()}`;
      });

      deployProcess.on('close', (code) => {
        if (code === 0) {
          resolve(NextResponse.json({
            success: true,
            environment,
            url: deployUrl || `https://${environment}.internetfriends.dev`,
            timestamp: new Date().toISOString(),
            output: output.slice(-200) // Last 200 chars
          }));
        } else {
          resolve(NextResponse.json({
            success: false,
            error: 'Deploy failed',
            output,
            environment
          }, { status: 500 }));
        }
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        deployProcess.kill();
        resolve(NextResponse.json({
          success: false,
          error: 'Deploy timeout',
          environment
        }, { status: 408 }));
      }, 300000);
    });

  } catch (error) {
    console.error('Deploy staging error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}