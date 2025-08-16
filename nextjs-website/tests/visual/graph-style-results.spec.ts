import { test, expect } from '@playwright/test';
import { percySnapshot } from '@percy/playwright';

/**
 * Graph Style Results Testing Suite
 * Focuses on visual consistency of graph and data visualization components
 * Uses current InternetFriends project as the baseline standard
 */

const GRAPH_TEST_CONFIG = {
  baseUrl: 'http://localhost:3000',
  defaultViewports: [1024, 1440],
  graphAnimationDelay: 2000,
  networkTimeout: 5000
};

const GRAPH_COMPONENTS = [
  {
    path: '/design-system',
    name: 'design-system-graph',
    selectors: ['.design-system-graph', '[data-testid*="graph"]', '.react-flow'],
    variants: ['default', 'compact', 'detailed']
  },
  {
    path: '/orchestrator', 
    name: 'orchestrator-flow',
    selectors: ['.orchestrator-flow', '.real-time-monitor', '[data-testid*="flow"]'],
    variants: ['overview', 'detailed', 'realtime']
  },
  {
    path: '/visual-comparison',
    name: 'visual-analysis',
    selectors: ['.visual-comparison-panel', '.analysis-results', '[data-testid*="comparison"]'],
    variants: ['side-by-side', 'overlay', 'metrics']
  }
];

const GRAPH_INTERACTION_TESTS = [
  { action: 'hover', target: '.node', description: 'Node hover states' },
  { action: 'click', target: '.component-card', description: 'Component selection' },
  { action: 'zoom', target: '.react-flow__viewport', description: 'Graph zoom levels' },
  { action: 'pan', target: '.react-flow__pane', description: 'Graph panning' }
];

test.describe('Graph Style Results - Baseline Standards', () => {
  
  test.beforeEach(async ({ page }) => {
    // Set consistent baseline conditions
    await page.addInitScript(() => {
      // Disable animations for consistent snapshots
      document.addEventListener('DOMContentLoaded', () => {
        const style = document.createElement('style');
        style.textContent = `
          *, *::before, *::after {
            animation-duration: 0s !important;
            animation-delay: 0s !important;
            transition-duration: 0s !important;
            transition-delay: 0s !important;
          }
          .percy-stabilize {
            animation: none !important;
            transition: none !important;
          }
        `;
        document.head.appendChild(style);
      });
    });
  });

  test.describe('Core Graph Components', () => {
    GRAPH_COMPONENTS.forEach(({ path, name, selectors, variants }) => {
      test(`${name} - Baseline Visual Standards`, async ({ page }) => {
        await page.goto(`${GRAPH_TEST_CONFIG.baseUrl}${path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(GRAPH_TEST_CONFIG.graphAnimationDelay);

        // Hide dynamic elements for consistent snapshots
        await page.addStyleTag({
          content: `
            .percy-hide,
            [data-timestamp],
            .live-metrics,
            .real-time-data {
              visibility: hidden !important;
            }
            .percy-stabilize {
              animation: none !important;
              transition: none !important;
            }
          `
        });

        // Test main graph view
        await percySnapshot(page, `${name}-baseline-default`, {
          widths: GRAPH_TEST_CONFIG.defaultViewports,
          minHeight: 800
        });

        // Test graph component variants if available
        for (const variant of variants) {
          try {
            const variantSelector = `[data-variant="${variant}"], [data-view="${variant}"], .${variant}`;
            if (await page.locator(variantSelector).count() > 0) {
              await page.click(variantSelector, { timeout: 2000 });
              await page.waitForTimeout(1000);
              
              await percySnapshot(page, `${name}-variant-${variant}`, {
                widths: GRAPH_TEST_CONFIG.defaultViewports
              });
            }
          } catch (error) {
            console.warn(`Variant ${variant} not available for ${name}`);
          }
        }
      });
    });
  });

  test.describe('Graph Interaction States', () => {
    test('Design System Graph - Interactive States', async ({ page }) => {
      await page.goto(`${GRAPH_TEST_CONFIG.baseUrl}/design-system`);
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(GRAPH_TEST_CONFIG.graphAnimationDelay);

      // Test different interaction states
      for (const { action, target, description } of GRAPH_INTERACTION_TESTS) {
        try {
          const element = page.locator(target).first();
          
          if (await element.count() > 0) {
            switch (action) {
              case 'hover':
                await element.hover();
                break;
              case 'click':
                await element.click();
                break;
              case 'zoom':
                await page.mouse.wheel(0, -500); // Zoom in
                break;
              case 'pan':
                await page.mouse.move(500, 300);
                await page.mouse.down();
                await page.mouse.move(600, 400);
                await page.mouse.up();
                break;
            }
            
            await page.waitForTimeout(500);
            await percySnapshot(page, `graph-interaction-${action}-state`, {
              widths: [1024]
            });
          }
        } catch (error) {
          console.warn(`Could not test ${action}: ${error.message}`);
        }
      }
    });
  });

  test.describe('Data Visualization Standards', () => {
    test('Real-time Monitoring Graphs', async ({ page }) => {
      await page.goto(`${GRAPH_TEST_CONFIG.baseUrl}/orchestrator`);
      await page.waitForLoadState('networkidle');

      // Focus on data visualization elements
      const chartSelectors = [
        '.metrics-chart',
        '.performance-graph', 
        '.real-time-monitor',
        '[data-testid*="chart"]',
        'canvas'
      ];

      for (const selector of chartSelectors) {
        try {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            await element.first().scrollIntoViewIfNeeded();
            await page.waitForTimeout(1000);
            
            await percySnapshot(page, `data-viz-${selector.replace(/[^\w]/g, '-')}`, {
              widths: [1024, 1440],
              minHeight: 600
            });
          }
        } catch (error) {
          console.warn(`Could not capture ${selector}: ${error.message}`);
        }
      }
    });

    test('Component Relationship Graphs', async ({ page }) => {
      await page.goto(`${GRAPH_TEST_CONFIG.baseUrl}/design-system`);
      await page.waitForLoadState('networkidle');

      // Test component relationship visualization
      try {
        // Switch to graph view if available
        const graphViewButton = page.locator('[data-view="graph"], .graph-view-toggle');
        if (await graphViewButton.count() > 0) {
          await graphViewButton.click();
          await page.waitForTimeout(2000);
        }

        // Capture the relationship graph
        await percySnapshot(page, 'component-relationships-graph', {
          widths: [1024, 1440],
          minHeight: 800
        });

        // Test filtering if available
        const filterButtons = page.locator('[data-filter], .filter-button');
        const filterCount = await filterButtons.count();
        
        for (let i = 0; i < Math.min(filterCount, 3); i++) {
          try {
            await filterButtons.nth(i).click();
            await page.waitForTimeout(1000);
            
            const filterValue = await filterButtons.nth(i).getAttribute('data-filter') || `filter-${i}`;
            await percySnapshot(page, `relationships-filtered-${filterValue}`, {
              widths: [1024]
            });
          } catch (error) {
            console.warn(`Could not test filter ${i}: ${error.message}`);
          }
        }
      } catch (error) {
        console.warn(`Could not test relationship graph: ${error.message}`);
      }
    });
  });

  test.describe('Performance Metrics Visualization', () => {
    test('Performance Dashboard Graphs', async ({ page }) => {
      await page.goto(`${GRAPH_TEST_CONFIG.baseUrl}/orchestrator`);
      await page.waitForLoadState('networkidle');

      // Hide timestamp-based elements for consistent snapshots
      await page.addStyleTag({
        content: `
          .timestamp,
          .current-time,
          [data-timestamp],
          .live-update {
            visibility: hidden !important;
          }
        `
      });

      // Focus on performance metrics
      const metricsElements = [
        '.cpu-usage-chart',
        '.memory-chart', 
        '.network-graph',
        '.performance-metrics',
        '.system-stats'
      ];

      for (const selector of metricsElements) {
        try {
          const element = page.locator(selector);
          if (await element.count() > 0) {
            await element.first().scrollIntoViewIfNeeded();
            await percySnapshot(page, `performance-${selector.replace(/[^\w]/g, '-')}`, {
              widths: [1024]
            });
          }
        } catch (error) {
          console.warn(`Could not capture performance metric ${selector}`);
        }
      }

      // Capture overall dashboard
      await percySnapshot(page, 'performance-dashboard-complete', {
        widths: [1024, 1440],
        minHeight: 1200
      });
    });
  });

  test.describe('Graph Accessibility & Responsive Design', () => {
    test('Mobile Graph Adaptations', async ({ page }) => {
      // Test how graphs adapt to mobile viewports
      await page.setViewportSize({ width: 375, height: 667 });
      
      for (const { path, name } of GRAPH_COMPONENTS) {
        await page.goto(`${GRAPH_TEST_CONFIG.baseUrl}${path}`);
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(1000);

        await percySnapshot(page, `${name}-mobile-responsive`, {
          widths: [375]
        });
      }
    });

    test('High Contrast Mode', async ({ page }) => {
      // Test graphs in high contrast mode
      await page.emulateMedia({ 
        media: 'screen',
        colorScheme: 'dark', 
        reducedMotion: 'reduce'
      });

      await page.goto(`${GRAPH_TEST_CONFIG.baseUrl}/design-system`);
      await page.waitForLoadState('networkidle');

      await percySnapshot(page, 'graphs-high-contrast-mode', {
        widths: [1024]
      });
    });
  });
});

test.describe('Cross-Reference Comparison Tests', () => {
  test('Current Project as Integration Default', async ({ page }) => {
    // Verify current project serves as the reliable baseline
    await page.goto(`${GRAPH_TEST_CONFIG.baseUrl}/`);
    await page.waitForLoadState('networkidle');

    // Check for key InternetFriends graph elements
    const graphIndicators = [
      '.design-system-graph',
      '.orchestrator-flow', 
      '.visual-comparison',
      '[data-testid*="graph"]'
    ];

    let hasGraphElements = false;
    for (const selector of graphIndicators) {
      if (await page.locator(selector).count() > 0) {
        hasGraphElements = true;
        break;
      }
    }

    expect(hasGraphElements).toBeTruthy();

    await percySnapshot(page, 'baseline-integration-verification', {
      widths: [1024]
    });
  });
});