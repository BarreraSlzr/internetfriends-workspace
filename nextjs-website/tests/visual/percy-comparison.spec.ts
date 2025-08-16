import { test, expect } from '@playwright/test';
import { percySnapshot } from '@percy/playwright';

// Configuration
const BASELINE_URLS = {
  local: 'http://localhost:3000',
  staging: 'https://internetfriends-staging.vercel.app',
  production: 'https://internetfriends.xyz'
};

const COMPARISON_SITES = {
  octopus: 'https://octopus.do'
};

const CORE_PAGES = [
  { path: '/', name: 'homepage' },
  { path: '/design-system', name: 'design-system' },
  { path: '/orchestrator', name: 'orchestrator' },
  { path: '/visual-comparison', name: 'visual-comparison' },
  { path: '/theme-demo', name: 'theme-demo' },
  { path: '/curriculum', name: 'curriculum' },
  { path: '/contact', name: 'contact' }
];

const GRAPH_COMPONENTS = [
  '/design-system?view=graph',
  '/orchestrator?view=flow',
  '/visual-comparison?mode=analysis'
];

test.describe('Visual Regression Testing Suite', () => {
  
  test.describe('InternetFriends.xyz Comparison', () => {
    CORE_PAGES.forEach(({ path, name }) => {
      test(`${name} - Local vs Production`, async ({ page }) => {
        // Test local version (current project as baseline)
        await page.goto(`${BASELINE_URLS.local}${path}`);
        await page.waitForLoadState('networkidle');
        await percySnapshot(page, `${name}-local-baseline`, {
          widths: [375, 768, 1024, 1440]
        });

        // Test production version for comparison
        try {
          await page.goto(`${BASELINE_URLS.production}${path}`);
          await page.waitForLoadState('networkidle');
          await percySnapshot(page, `${name}-production-comparison`, {
            widths: [375, 768, 1024, 1440]
          });
        } catch (error) {
          console.warn(`Could not access production URL for ${name}: ${error.message}`);
        }
      });
    });
  });

  test.describe('Octopus.do Style Comparison', () => {
    test('Octopus.do homepage vs InternetFriends', async ({ page }) => {
      // Current project as baseline
      await page.goto(`${BASELINE_URLS.local}/`);
      await page.waitForLoadState('networkidle');
      await percySnapshot(page, 'homepage-internetfriends-baseline', {
        widths: [1024, 1440]
      });

      // Octopus.do for style comparison
      try {
        await page.goto(COMPARISON_SITES.octopus);
        await page.waitForLoadState('networkidle');
        await percySnapshot(page, 'homepage-octopus-comparison', {
          widths: [1024, 1440]
        });
      } catch (error) {
        console.warn(`Could not access octopus.do: ${error.message}`);
      }
    });

    test('Design system comparison', async ({ page }) => {
      // InternetFriends design system (baseline)
      await page.goto(`${BASELINE_URLS.local}/design-system`);
      await page.waitForLoadState('networkidle');
      await percySnapshot(page, 'design-system-internetfriends-baseline', {
        widths: [1024, 1440]
      });

      // Try to find octopus design patterns
      try {
        await page.goto(`${COMPARISON_SITES.octopus}/about`);
        await page.waitForLoadState('networkidle');
        await percySnapshot(page, 'design-patterns-octopus-comparison', {
          widths: [1024, 1440]
        });
      } catch (error) {
        console.warn(`Could not access octopus.do about page: ${error.message}`);
      }
    });
  });

  test.describe('Graphs Style Results', () => {
    GRAPH_COMPONENTS.forEach((graphPath) => {
      test(`Graph component: ${graphPath}`, async ({ page }) => {
        await page.goto(`${BASELINE_URLS.local}${graphPath}`);
        await page.waitForLoadState('networkidle');
        
        // Wait for any graph animations to complete
        await page.waitForTimeout(2000);
        
        // Hide dynamic elements that change frequently
        await page.addStyleTag({
          content: `
            .percy-hide,
            [data-timestamp],
            .real-time-monitor,
            .live-metrics {
              visibility: hidden !important;
            }
          `
        });

        await percySnapshot(page, `graph-${graphPath.replace(/[\/\?=]/g, '-')}`, {
          widths: [1024, 1440],
          minHeight: 800
        });
      });
    });

    test('Interactive graph states', async ({ page }) => {
      await page.goto(`${BASELINE_URLS.local}/design-system`);
      await page.waitForLoadState('networkidle');

      // Test different graph view modes
      const viewModes = ['components', 'relationships', 'metrics'];
      
      for (const mode of viewModes) {
        try {
          // Try to switch to different view mode
          await page.click(`[data-view="${mode}"]`, { timeout: 5000 });
          await page.waitForTimeout(1000);
          
          await percySnapshot(page, `graph-view-${mode}`, {
            widths: [1024, 1440]
          });
        } catch (error) {
          console.warn(`Could not test ${mode} view: ${error.message}`);
        }
      }
    });
  });

  test.describe('Component Comparison Matrix', () => {
    test('Glass morphism components baseline', async ({ page }) => {
      await page.goto(`${BASELINE_URLS.local}/theme-demo`);
      await page.waitForLoadState('networkidle');
      
      // Focus on glass components
      await page.addStyleTag({
        content: `
          body { background: #1a1a2e !important; }
          .percy-hide { visibility: hidden !important; }
        `
      });

      await percySnapshot(page, 'glass-components-baseline', {
        widths: [768, 1024],
        minHeight: 1200
      });
    });

    test('Navigation patterns comparison', async ({ page }) => {
      // Test InternetFriends navigation
      await page.goto(`${BASELINE_URLS.local}/`);
      await page.waitForLoadState('networkidle');
      
      // Highlight navigation
      await page.addStyleTag({
        content: `
          nav, header, .navigation, .header-organism {
            outline: 2px solid #3b82f6 !important;
          }
        `
      });

      await percySnapshot(page, 'navigation-internetfriends-baseline', {
        widths: [375, 768, 1024]
      });
    });
  });
});

test.describe('Cross-Site Integration Tests', () => {
  test('Default project integration check', async ({ page }) => {
    // Ensure current project is used as default baseline
    await page.goto(`${BASELINE_URLS.local}/`);
    await page.waitForLoadState('networkidle');
    
    // Check for key InternetFriends elements
    await expect(page.locator('h1, .hero-text, .header-organism')).toBeVisible();
    
    // Verify glass morphism is active
    const glassElements = page.locator('.glass-card-atomic, [class*="glass"]');
    await expect(glassElements.first()).toBeVisible();
    
    await percySnapshot(page, 'integration-baseline-verification', {
      widths: [1024]
    });
  });

  test('Performance metrics integration', async ({ page }) => {
    await page.goto(`${BASELINE_URLS.local}/orchestrator`);
    await page.waitForLoadState('networkidle');
    
    // Check if real-time monitor is working
    const monitor = page.locator('.real-time-monitor, [data-testid="real-time-monitor"]');
    if (await monitor.isVisible()) {
      await percySnapshot(page, 'performance-metrics-active', {
        widths: [1024, 1440]
      });
    }
  });
});