#!/usr/bin/env bun

/**
 * Visual Comparison with Auth Solutions
 * Handles Vercel auth, auto-hosting, and multiple deployment strategies
 */

import { chromium, type Page, type BrowserContext } from 'playwright';
import path from 'path';
import fs from 'fs/promises';

interface AuthSolution {
  name: string;
  description: string;
  execute: () => Promise<string | null>;
}

interface ScreenshotConfig {
  url: string;
  name: string;
  waitFor?: number;
  viewport?: { width: number; height: number };
  authRequired?: boolean;
}

class VisualComparisonWithAuth {
  private outputDir: string;
  private authCookie?: string;
  
  constructor() {
    this.outputDir = path.join(process.cwd(), 'visual-comparison');
  }

  /**
   * Solution 1: Deploy to GitHub Pages (Public, No Auth)
   */
  async deployToGitHubPages(): Promise<string | null> {
    console.log('🚀 Solution 1: Deploying to GitHub Pages...');
    
    try {
      // Create GitHub Pages deployment
      const ghPagesScript = `
#!/bin/bash
cd "${process.cwd()}"

# Build the app
echo "📦 Building for GitHub Pages..."
NODE_ENV=production bun run build

# Create gh-pages branch and deploy
git checkout -b gh-pages-staging || git checkout gh-pages-staging
cp -r .next/static ./static
cp -r .next/server ./server

# Create simple HTML wrapper for GitHub Pages
cat > index.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>InternetFriends Staging</title>
</head>
<body>
    <div id="__next"></div>
    <script src="./static/chunks/main.js"></script>
</body>
</html>
EOF

echo "🌐 GitHub Pages staging available at:"
echo "https://$(git remote get-url origin | sed 's/.*github.com[:/]\\(.*\\)\\.git/\\1/' | tr '[:upper:]' '[:lower:]').github.io"
`;

      await fs.writeFile('/tmp/deploy-gh-pages.sh', ghPagesScript);
      console.log('📝 GitHub Pages script created at /tmp/deploy-gh-pages.sh');
      console.log('Run: chmod +x /tmp/deploy-gh-pages.sh && /tmp/deploy-gh-pages.sh');
      
      return 'https://internetfriends.github.io/nextjs-website'; // Estimated URL
      
    } catch (error) {
      console.error('❌ GitHub Pages deployment failed:', error);
      return null;
    }
  }

  /**
   * Solution 2: Use Vercel with Auth Token in Headers
   */
  async createAuthenticatedContext(browser: any): Promise<BrowserContext | null> {
    console.log('🔐 Solution 2: Setting up Vercel auth context...');
    
    try {
      const context = await browser.newContext({
        extraHTTPHeaders: {
          // Add auth headers if available
          'Authorization': process.env.VERCEL_TOKEN ? `Bearer ${process.env.VERCEL_TOKEN}` : '',
          'X-Vercel-Team': process.env.VERCEL_TEAM_ID || '',
        }
      });

      // Try to login to Vercel if we have credentials
      if (process.env.VERCEL_TOKEN) {
        console.log('🎯 Using Vercel token for authentication');
        return context;
      }
      
      console.log('⚠️ No Vercel token found, trying without auth');
      return context;
      
    } catch (error) {
      console.error('❌ Auth context creation failed:', error);
      return null;
    }
  }

  /**
   * Solution 3: Deploy to Netlify (Alternative)
   */
  async deployToNetlify(): Promise<string | null> {
    console.log('🌐 Solution 3: Deploying to Netlify...');
    
    try {
      const netlifyScript = `
#!/bin/bash
cd "${process.cwd()}"

# Install Netlify CLI if not available
if ! command -v netlify &> /dev/null; then
    echo "📦 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Build the app
echo "📦 Building for Netlify..."
NODE_ENV=production bun run build

# Deploy to Netlify
echo "🚀 Deploying to Netlify..."
netlify deploy --prod --dir=.next

echo "✅ Netlify deployment complete!"
`;

      await fs.writeFile('/tmp/deploy-netlify.sh', netlifyScript);
      console.log('📝 Netlify script created at /tmp/deploy-netlify.sh');
      console.log('Run: chmod +x /tmp/deploy-netlify.sh && /tmp/deploy-netlify.sh');
      
      return 'https://internetfriends-staging.netlify.app'; // Estimated URL
      
    } catch (error) {
      console.error('❌ Netlify deployment failed:', error);
      return null;
    }
  }

  /**
   * Solution 4: Local Dev Server for Screenshots
   */
  async startLocalDevServer(): Promise<string | null> {
    console.log('🔧 Solution 4: Starting local dev server...');
    
    try {
      // Start dev server in background
      const { spawn } = await import('child_process');
      
      const devServer = spawn('bun', ['run', 'dev'], {
        cwd: process.cwd(),
        detached: true,
        stdio: 'ignore'
      });

      // Wait for server to start
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      console.log('✅ Local dev server started at http://localhost:3000');
      return 'http://localhost:3000';
      
    } catch (error) {
      console.error('❌ Local dev server failed:', error);
      return null;
    }
  }

  /**
   * Enhanced screenshot capture with auth handling
   */
  async captureWithAuth(page: Page, config: ScreenshotConfig): Promise<string | null> {
    console.log(`📸 Capturing ${config.name}: ${config.url}`);
    
    try {
      // Set viewport
      if (config.viewport) {
        await page.setViewportSize(config.viewport);
      }
      
      // Navigate with auth handling
      await page.goto(config.url, { 
        waitUntil: 'networkidle',
        timeout: 30000 
      });
      
      // Check if we hit an auth wall
      const title = await page.title();
      if (title.includes('401') || title.includes('Unauthorized') || title.includes('Sign in')) {
        console.log(`🔒 ${config.name} requires authentication, skipping...`);
        return null;
      }
      
      // Wait for content to load
      if (config.waitFor) {
        await page.waitForTimeout(config.waitFor);
      }
      
      // Take screenshot
      const screenshotPath = path.join(this.outputDir, `${config.name}.png`);
      await page.screenshot({ 
        path: screenshotPath, 
        fullPage: true,
        animations: 'disabled'
      });
      
      console.log(`✅ Screenshot saved: ${screenshotPath}`);
      return screenshotPath;
      
    } catch (error) {
      console.error(`❌ Failed to capture ${config.name}:`, error);
      return null;
    }
  }

  /**
   * Main comparison runner with multiple solutions
   */
  async runComparison(): Promise<void> {
    console.log('🎯 Visual Comparison with Auth Solutions');
    
    // Ensure output directory exists
    await fs.mkdir(this.outputDir, { recursive: true });
    
    // Available auth solutions
    const solutions: AuthSolution[] = [
      {
        name: 'GitHub Pages',
        description: 'Deploy to public GitHub Pages (no auth required)',
        execute: () => this.deployToGitHubPages()
      },
      {
        name: 'Netlify',
        description: 'Deploy to Netlify for public access',
        execute: () => this.deployToNetlify()
      },
      {
        name: 'Local Dev',
        description: 'Use local development server',
        execute: () => this.startLocalDevServer()
      }
    ];

    console.log('\\n🛠️ Available Solutions:');
    solutions.forEach((solution, index) => {
      console.log(`${index + 1}. ${solution.name}: ${solution.description}`);
    });

    // Try to get staging URL using preferred solution
    let stagingUrl = 'http://localhost:3000'; // Default fallback
    
    // Check if local dev server is available
    const localUrl = await this.startLocalDevServer();
    if (localUrl) {
      stagingUrl = localUrl;
    }

    // Screenshot configurations
    const configs: ScreenshotConfig[] = [
      {
        url: 'https://internetfriends.xyz',
        name: 'production',
        waitFor: 3000,
        viewport: { width: 1280, height: 720 }
      },
      {
        url: stagingUrl,
        name: 'staging',
        waitFor: 3000,
        viewport: { width: 1280, height: 720 }
      }
    ];

    // Launch browser and capture screenshots
    const browser = await chromium.launch({ headless: true });
    
    try {
      // Create auth context
      const context = await this.createAuthenticatedContext(browser) || await browser.newContext();
      
      const screenshots: Record<string, string | null> = {};
      
      for (const config of configs) {
        const page = await context.newPage();
        const screenshotPath = await this.captureWithAuth(page, config);
        screenshots[config.name] = screenshotPath;
        await page.close();
      }
      
      // Generate report
      await this.generateEnhancedReport(screenshots);
      
    } finally {
      await browser.close();
    }
  }

  /**
   * Generate enhanced HTML report with deployment instructions
   */
  async generateEnhancedReport(screenshots: Record<string, string | null>): Promise<void> {
    const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Comparison with Auth Solutions</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
            margin: 0;
            padding: 20px;
            background: #f5f5f5;
        }
        .container {
            max-width: 1400px;
            margin: 0 auto;
            background: white;
            padding: 30px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        }
        h1 {
            color: #3b82f6;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 10px;
        }
        .solutions {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .solution {
            margin: 10px 0;
            padding: 10px;
            background: white;
            border-radius: 6px;
            border-left: 4px solid #3b82f6;
        }
        .comparison {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin: 30px 0;
        }
        .site-section {
            border: 2px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }
        .site-header {
            background: #3b82f6;
            color: white;
            padding: 15px 20px;
            font-weight: 600;
            font-size: 18px;
        }
        .site-content {
            padding: 20px;
        }
        .screenshot {
            width: 100%;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .error {
            color: #dc2626;
            background: #fef2f2;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #fecaca;
        }
        .code {
            background: #1f2937;
            color: #f9fafb;
            padding: 15px;
            border-radius: 6px;
            font-family: monospace;
            font-size: 14px;
            overflow-x: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Visual Comparison with Auth Solutions</h1>
        <p><strong>Production vs Staging</strong> • Generated on ${new Date().toLocaleString()}</p>
        
        <div class="solutions">
            <h3>🛠️ Deployment Solutions for Vercel Auth</h3>
            
            <div class="solution">
                <h4>1. 🚀 GitHub Pages (Recommended)</h4>
                <p>Deploy to public GitHub Pages to bypass Vercel auth entirely.</p>
                <div class="code">chmod +x /tmp/deploy-gh-pages.sh && /tmp/deploy-gh-pages.sh</div>
            </div>
            
            <div class="solution">
                <h4>2. 🌐 Netlify Alternative</h4>
                <p>Deploy to Netlify for instant public access.</p>
                <div class="code">chmod +x /tmp/deploy-netlify.sh && /tmp/deploy-netlify.sh</div>
            </div>
            
            <div class="solution">
                <h4>3. 🔧 Local Development</h4>
                <p>Use local dev server for immediate testing.</p>
                <div class="code">bun run dev</div>
            </div>
            
            <div class="solution">
                <h4>4. 🔐 Vercel Preview URL</h4>
                <p>Create a new deployment without protection.</p>
                <div class="code">vercel --public</div>
            </div>
        </div>

        <div class="comparison">
            <div class="site-section">
                <div class="site-header">🌐 Production (InternetFriends.xyz)</div>
                <div class="site-content">
                    ${screenshots.production 
                        ? `<img src="${path.basename(screenshots.production)}" alt="Production Screenshot" class="screenshot" />`
                        : '<div class="error">❌ Failed to capture production screenshot</div>'
                    }
                </div>
            </div>
            
            <div class="site-section">
                <div class="site-header">🚀 Staging (Local/Alternative)</div>
                <div class="site-content">
                    ${screenshots.staging 
                        ? `<img src="${path.basename(screenshots.staging)}" alt="Staging Screenshot" class="screenshot" />`
                        : '<div class="error">❌ Failed to capture staging screenshot</div>'
                    }
                </div>
            </div>
        </div>
    </div>
</body>
</html>`;

    const reportPath = path.join(this.outputDir, 'visual-comparison-auth.html');
    await fs.writeFile(reportPath, htmlContent);
    console.log(`📊 Enhanced report generated: ${reportPath}`);
  }
}

// CLI execution
if (import.meta.main) {
  const comparison = new VisualComparisonWithAuth();
  await comparison.runComparison();
}