import { test, expect } from '@playwright/test';
import { percySnapshot } from '@percy/playwright';

// Percy Visual Regression Tests for G's Token Economics Dashboard
test.describe('G\'s Token Economics Dashboard - Visual Regression', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to economics dashboard
    await page.goto('/friends/economics');
    
    // Wait for dashboard to fully load
    await page.waitForSelector('[data-testid=\"economics-dashboard\"]');
    
    // Wait for charts to render
    await page.waitForTimeout(2000);
  });

  test('Trading Monitor Dashboard - Full View', async ({ page }) => {
    // Ensure all components are loaded
    await page.waitForSelector('[data-testid=\"trading-monitor\"]');
    await page.waitForSelector('[data-testid=\"volatility-chart\"]');
    await page.waitForSelector('[data-testid=\"market-data\"]');
    
    // Take Percy snapshot
    await percySnapshot(page, 'Economics Dashboard - Trading Monitor Full View', {
      widths: [375, 768, 1024, 1440],
      minHeight: 1024,
      percyCSS: `
        .percy-hide { visibility: hidden !important; }
        .real-time-updates { animation: none !important; }
        .trading-chart { animation-play-state: paused !important; }
      `,
    });
  });

  test('Mining Performance Dashboard', async ({ page }) => {
    // Switch to mining view
    await page.click('[data-testid=\"mining-tab\"]');
    await page.waitForSelector('[data-testid=\"mining-performance\"]');
    await page.waitForSelector('[data-testid=\"hashrate-chart\"]');
    
    await percySnapshot(page, 'Economics Dashboard - Mining Performance View', {
      widths: [768, 1024, 1440],
      percyCSS: `
        .animated-counter { animation: none !important; }
        .hashrate-animation { animation-play-state: paused !important; }
      `,
    });
  });

  test('Token Flow Analysis', async ({ page }) => {
    await page.click('[data-testid=\"token-flow-tab\"]');
    await page.waitForSelector('[data-testid=\"token-flow-chart\"]');
    await page.waitForSelector('[data-testid=\"burn-mint-stats\"]');
    
    await percySnapshot(page, 'Economics Dashboard - Token Flow Analysis', {
      widths: [768, 1024, 1440],
    });
  });

  test('AI Analysis Panel', async ({ page }) => {
    // Trigger AI analysis
    await page.click('[data-testid=\"ai-analysis-trigger\"]');
    await page.waitForSelector('[data-testid=\"ai-insights-panel\"]');
    
    // Wait for AI analysis to complete (mock)
    await page.waitForTimeout(1500);
    
    await percySnapshot(page, 'Economics Dashboard - AI Analysis Panel', {
      widths: [1024, 1440],
      percyCSS: `
        .ai-loading { display: none !important; }
        .typing-animation { animation: none !important; }
      `,
    });
  });

  test('Dark Mode Consistency', async ({ page }) => {
    // Toggle to dark mode
    await page.click('[data-testid=\"theme-toggle\"]');
    await page.waitForTimeout(500);
    
    await percySnapshot(page, 'Economics Dashboard - Dark Mode', {
      widths: [768, 1024, 1440],
      percyCSS: `
        .theme-transition { transition: none !important; }
      `,
    });
  });

  test('Mobile Responsive Layout', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForTimeout(500);
    
    await percySnapshot(page, 'Economics Dashboard - Mobile Layout', {
      widths: [375],
      minHeight: 812,
    });
  });

  test('Tablet Responsive Layout', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    
    await percySnapshot(page, 'Economics Dashboard - Tablet Layout', {
      widths: [768],
      minHeight: 1024,
    });
  });

  test('Error State Handling', async ({ page }) => {
    // Mock API error to trigger error state
    await page.route('/api/gs/economics-report', route => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Mock API Error' }),
      });
    });
    
    // Refresh to trigger error
    await page.reload();
    await page.waitForSelector('[data-testid=\"error-state\"]');
    
    await percySnapshot(page, 'Economics Dashboard - Error State', {
      widths: [768, 1024],
    });
  });

  test('Loading States', async ({ page }) => {
    // Mock slow API to capture loading state
    await page.route('/api/gs/economics-report', route => {
      setTimeout(() => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: 'success' }),
        });
      }, 5000);
    });
    
    await page.reload();
    await page.waitForSelector('[data-testid=\"loading-skeleton\"]');
    
    await percySnapshot(page, 'Economics Dashboard - Loading States', {
      widths: [768, 1024],
      percyCSS: `
        .loading-animation { animation-play-state: paused !important; }
        .skeleton-shimmer { animation: none !important; }
      `,
    });
  });

  test('Interactive Chart States', async ({ page }) => {
    // Hover over chart elements
    await page.hover('[data-testid=\"trading-chart\"] .chart-point:nth-child(5)');
    await page.waitForSelector('[data-testid=\"chart-tooltip\"]');
    
    await percySnapshot(page, 'Economics Dashboard - Chart Interaction', {
      widths: [1024, 1440],
    });
  });

  test('AI Model Comparison View', async ({ page }) => {
    // Navigate to AI model comparison
    await page.click('[data-testid=\"ai-comparison-tab\"]');
    await page.waitForSelector('[data-testid=\"model-consensus-chart\"]');
    
    await percySnapshot(page, 'Economics Dashboard - AI Model Comparison', {
      widths: [1024, 1440],
    });
  });

  test('Performance Metrics Grid', async ({ page }) => {
    // Focus on performance metrics section
    await page.locator('[data-testid=\"performance-metrics\"]').scrollIntoViewIfNeeded();
    
    await percySnapshot(page, 'Economics Dashboard - Performance Metrics Grid', {
      widths: [768, 1024, 1440],
      clip: {
        x: 0,
        y: 0,
        width: 1440,
        height: 800,
      },
    });
  });

  test('Real-time Alerts Panel', async ({ page }) => {
    // Trigger mock alert
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('mock-alert', {
        detail: {
          type: 'volatility',
          message: 'High volatility detected',
          severity: 'warning',
        },
      }));
    });
    
    await page.waitForSelector('[data-testid=\"alert-panel\"]');
    
    await percySnapshot(page, 'Economics Dashboard - Real-time Alerts', {
      widths: [768, 1024],
    });
  });

  test('Export Modal Dialog', async ({ page }) => {
    await page.click('[data-testid=\"export-button\"]');
    await page.waitForSelector('[data-testid=\"export-modal\"]');
    
    await percySnapshot(page, 'Economics Dashboard - Export Modal', {
      widths: [768, 1024],
    });
  });

  test('Settings Configuration Panel', async ({ page }) => {
    await page.click('[data-testid=\"settings-button\"]');
    await page.waitForSelector('[data-testid=\"settings-panel\"]');
    
    await percySnapshot(page, 'Economics Dashboard - Settings Panel', {
      widths: [768, 1024],
    });
  });
});

// Percy Specific Configuration Tests
test.describe('Percy Configuration Validation', () => {
  
  test('Responsive Breakpoints Coverage', async ({ page }) => {
    await page.goto('/friends/economics');
    await page.waitForSelector('[data-testid=\"economics-dashboard\"]');
    
    // Test all Percy configured widths
    const widths = [375, 768, 1024, 1440];
    
    for (const width of widths) {
      await page.setViewportSize({ width, height: 1024 });
      await page.waitForTimeout(300);
      
      await percySnapshot(page, `Economics Dashboard - Width ${width}px`, {
        widths: [width],
        minHeight: 1024,
      });
    }
  });

  test('Percy CSS Hiding Elements', async ({ page }) => {
    await page.goto('/friends/economics');
    
    // Add elements that should be hidden in Percy
    await page.addStyleTag({
      content: `
        .percy-hide-test { 
          background: red; 
          width: 100px; 
          height: 100px; 
          position: fixed; 
          top: 0; 
          left: 0; 
          z-index: 9999; 
        }
      `,
    });
    
    await page.evaluate(() => {
      const div = document.createElement('div');
      div.className = 'percy-hide-test percy-hide';
      div.textContent = 'Should be hidden';
      document.body.appendChild(div);
    });
    
    await percySnapshot(page, 'Percy CSS Hide Test', {
      widths: [1024],
      percyCSS: '.percy-hide { visibility: hidden !important; }',
    });
  });

  test('Network Idle Timeout Validation', async ({ page }) => {
    await page.goto('/friends/economics');
    
    // Simulate ongoing network requests
    await page.evaluate(() => {
      setInterval(() => {
        fetch('/api/health').catch(() => {});
      }, 100);
    });
    
    // Percy should wait for network idle (750ms as configured)
    await percySnapshot(page, 'Network Idle Timeout Test', {
      widths: [1024],
    });
  });
});

// AI-Enhanced Percy Tests
test.describe('AI-Enhanced Visual Regression', () => {
  
  test('AI Analysis Results Consistency', async ({ page }) => {
    await page.goto('/friends/economics');
    
    // Mock consistent AI responses for visual testing
    await page.route('/api/ai/economics-analysis', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          analysis: {
            visualAnalysis: {
              insights: {
                trends: ['Upward momentum', 'Strong support at 0.85'],
                signals: [{ type: 'buy', confidence: 0.78, reasoning: 'Technical breakout' }],
              },
            },
            strategicRecommendations: {
              immediate: ['Monitor resistance levels'],
              shortTerm: ['Increase position if breakout confirmed'],
            },
          },
        }),
      });
    });
    
    await page.click('[data-testid=\"ai-analysis-trigger\"]');
    await page.waitForSelector('[data-testid=\"ai-results\"]');
    
    await percySnapshot(page, 'AI Analysis Results - Consistent Mock Data', {
      widths: [1024, 1440],
      percyCSS: `
        .ai-loading { display: none !important; }
        .random-animation { animation: none !important; }
      `,
    });
  });

  test('Chart Rendering Consistency', async ({ page }) => {
    await page.goto('/friends/economics');
    
    // Ensure charts render with consistent data
    await page.evaluate(() => {
      // Mock consistent chart data
      window.mockChartData = {
        prices: [100, 105, 103, 108, 112, 109, 115],
        volumes: [1000, 1200, 800, 1500, 2000, 1100, 1800],
        timestamps: ['9:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'],
      };
    });
    
    await page.reload();
    await page.waitForSelector('[data-testid=\"trading-chart\"]');
    
    await percySnapshot(page, 'Chart Rendering - Consistent Data', {
      widths: [768, 1024, 1440],
      percyCSS: `
        .chart-animation { animation: none !important; }
        .live-updates { display: none !important; }
      `,
    });
  });
});

// Helper Functions for Percy Tests
export async function setupMockData(page: any) {
  await page.addInitScript(() => {
    // Mock consistent data for visual testing
    window.mockEconomicsData = {
      currentPrice: 1.23,
      priceChange24h: 0.15,
      volume24h: 45678,
      marketCap: 12345678,
      gs_per_hour: 150,
      mining_efficiency: 0.92,
      network_health: 0.87,
    };
  });
}

export async function disableAnimations(page: any) {
  await page.addStyleTag({
    content: `
      *, *::before, *::after {
        animation-duration: 0s !important;
        animation-delay: 0s !important;
        transition-duration: 0s !important;
        transition-delay: 0s !important;
      }
    `,
  });
}