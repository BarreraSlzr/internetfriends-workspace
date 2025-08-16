#!/usr/bin/env bun

import { chromium, type Page } from 'playwright';
import path from 'path';
import fs from 'fs/promises';

interface ScreenshotConfig {
  url: string;
  name: string;
  waitFor?: number;
  viewport?: { width: number; height: number };
}

const SITES: ScreenshotConfig[] = [
  {
    url: 'https://internetfriends.xyz',
    name: 'production',
    waitFor: 3000, // Wait 3s for animations
    viewport: { width: 1280, height: 720 }
  },
  {
    url: 'https://nextjs-website-8ot8t69bi-internetfriends.vercel.app',
    name: 'staging',
    waitFor: 3000,
    viewport: { width: 1280, height: 720 }
  }
];

async function captureScreenshot(page: Page, config: ScreenshotConfig, outputDir: string) {
  console.log(`📸 Capturing ${config.name}: ${config.url}`);
  
  try {
    // Set viewport
    if (config.viewport) {
      await page.setViewportSize(config.viewport);
    }
    
    // Navigate to page
    await page.goto(config.url, { 
      waitUntil: 'networkidle',
      timeout: 30000 
    });
    
    // Wait for animations/content to load
    if (config.waitFor) {
      await page.waitForTimeout(config.waitFor);
    }
    
    // Take full page screenshot
    const screenshotPath = path.join(outputDir, `${config.name}.png`);
    await page.screenshot({ 
      path: screenshotPath, 
      fullPage: true,
      animations: 'disabled' // Disable animations for consistent screenshots
    });
    
    console.log(`✅ Screenshot saved: ${screenshotPath}`);
    return screenshotPath;
    
  } catch (error) {
    console.error(`❌ Failed to capture ${config.name}:`, error);
    return null;
  }
}

async function generateHtmlReport(outputDir: string, screenshots: Record<string, string | null>) {
  const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Visual Comparison Report - InternetFriends</title>
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
        .timestamp {
            color: #6b7280;
            font-size: 14px;
            margin-top: 20px;
            text-align: center;
        }
        .analysis-prompt {
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        .analysis-prompt h3 {
            color: #1e40af;
            margin-top: 0;
        }
        .analysis-prompt code {
            background: #1f2937;
            color: #f9fafb;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 13px;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎯 Visual Comparison Report</h1>
        <p><strong>Production vs Staging</strong> • Generated on ${new Date().toLocaleString()}</p>
        
        <div class="analysis-prompt">
            <h3>💡 AI Analysis Instructions</h3>
            <p>To analyze these screenshots with an AI vision model, use this prompt:</p>
            <blockquote>
                <em>"Compare these two website screenshots and identify visual differences. Look for layout inconsistencies, styling differences, missing elements, color variations, typography changes, spacing issues, and animation states. Provide specific, actionable feedback for achieving pixel-perfect alignment between the staging and production versions."</em>
            </blockquote>
            <p><strong>Tools you can use:</strong></p>
            <ul>
                <li><code>Claude</code> (Anthropic) - Upload both images</li>
                <li><code>ChatGPT Vision</code> (OpenAI) - GPT-4V with image inputs</li>
                <li><code>Gemini Vision</code> (Google) - Multi-modal analysis</li>
            </ul>
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
                <div class="site-header">🚀 Staging (Vercel Deploy)</div>
                <div class="site-content">
                    ${screenshots.staging 
                        ? `<img src="${path.basename(screenshots.staging)}" alt="Staging Screenshot" class="screenshot" />`
                        : '<div class="error">❌ Failed to capture staging screenshot</div>'
                    }
                </div>
            </div>
        </div>
        
        <div class="timestamp">
            Screenshots captured on ${new Date().toLocaleString()} • 
            Resolution: 1280x720 • 
            Wait time: 3s for animations
        </div>
    </div>
</body>
</html>`;

  const reportPath = path.join(outputDir, 'visual-comparison-report.html');
  await fs.writeFile(reportPath, htmlContent);
  console.log(`📊 HTML report generated: ${reportPath}`);
  return reportPath;
}

async function main() {
  const outputDir = path.join(process.cwd(), 'visual-comparison');
  
  // Create output directory
  try {
    await fs.mkdir(outputDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  console.log('🎬 Starting visual comparison capture...');
  console.log(`📁 Output directory: ${outputDir}`);
  
  // Launch browser
  const browser = await chromium.launch({ 
    headless: true 
  });
  
  const screenshots: Record<string, string | null> = {};
  
  try {
    // Capture screenshots for each site
    for (const site of SITES) {
      const page = await browser.newPage();
      const screenshotPath = await captureScreenshot(page, site, outputDir);
      screenshots[site.name] = screenshotPath;
      await page.close();
    }
    
    // Generate HTML comparison report
    const reportPath = await generateHtmlReport(outputDir, screenshots);
    
    console.log('\n🎉 Visual comparison complete!');
    console.log(`📊 Open report: ${reportPath}`);
    console.log(`\n💡 Next steps:`);
    console.log(`1. Open the HTML report in your browser`);
    console.log(`2. Upload both screenshots to Claude/ChatGPT/Gemini`);
    console.log(`3. Use the provided analysis prompt for detailed feedback`);
    
  } finally {
    await browser.close();
  }
}

// Run the script
if (import.meta.main) {
  main().catch(console.error);
}