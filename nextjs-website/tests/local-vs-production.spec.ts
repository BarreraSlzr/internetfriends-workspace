import { test, expect } from '@playwright/test';

test.describe('Local vs Production Comparison', () => {
  const LOCAL_URL = 'http://localhost:3001';
  const PRODUCTION_URL = 'https://internetfriends.xyz';

  test('Compare local vs production - Light Mode', async ({ page }) => {
    // Test Local version
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/local-light-mode.png',
      fullPage: true 
    });

    // Test Production version  
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    await page.screenshot({ 
      path: 'test-results/production-light-mode.png',
      fullPage: true 
    });
  });

  test('Compare local vs production - Dark Mode', async ({ page }) => {
    // Test Local version - Dark Mode
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000); // Wait for the 10s you mentioned
    
    // Try to find and click theme toggle
    const themeToggle = page.locator('[title="Toggle theme"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ 
      path: 'test-results/local-dark-mode.png',
      fullPage: true 
    });

    // Test Production version - Dark Mode
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000);
    
    // Try to find theme toggle on production (might be different)
    const prodThemeToggle = page.locator('button').filter({ hasText: /theme|dark|light/i }).first();
    if (await prodThemeToggle.isVisible()) {
      await prodThemeToggle.click();
      await page.waitForTimeout(1000);
    }
    
    await page.screenshot({ 
      path: 'test-results/production-dark-mode.png',
      fullPage: true 
    });
  });

  test('Check specific text visibility issue - Local', async ({ page }) => {
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000);
    
    // Toggle to dark mode
    const themeToggle = page.locator('[title="Toggle theme"]').first();
    if (await themeToggle.isVisible()) {
      await themeToggle.click();
      await page.waitForTimeout(1000);
    }
    
    // Check the problematic area (between header and hero)
    const companyInfo = page.locator('section').first();
    const navigation = page.locator('nav[aria-label="Main Navigation"]');
    
    // Take focused screenshots
    await companyInfo.screenshot({ path: 'test-results/local-company-info-dark.png' });
    await navigation.screenshot({ path: 'test-results/local-navigation-dark.png' });
    
    // Get computed text colors
    const companyTextColor = await companyInfo.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        visibility: computed.visibility,
        opacity: computed.opacity
      };
    });
    
    const navTextColor = await navigation.evaluate(el => {
      const computed = window.getComputedStyle(el);
      return {
        color: computed.color,
        backgroundColor: computed.backgroundColor,
        visibility: computed.visibility,
        opacity: computed.opacity
      };
    });
    
    console.log('Local Company Info Styles:', companyTextColor);
    console.log('Local Navigation Styles:', navTextColor);
    
    // Check text content visibility
    const companyText = await companyInfo.textContent();
    const navText = await navigation.textContent();
    
    console.log('Company Info Text:', companyText);
    console.log('Navigation Text:', navText);
  });

  test('Check text visibility issue - Production', async ({ page }) => {
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(10000);
    
    // Try to enable dark mode (production might have different toggle)
    await page.evaluate(() => {
      // Try to force dark mode via class or localStorage
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    });
    await page.waitForTimeout(1000);
    
    // Find similar sections on production
    const sections = page.locator('section');
    const navigation = page.locator('nav');
    
    // Take screenshots of first few sections
    const sectionCount = await sections.count();
    for (let i = 0; i < Math.min(3, sectionCount); i++) {
      const section = sections.nth(i);
      if (await section.isVisible()) {
        await section.screenshot({ path: `test-results/production-section-${i}-dark.png` });
        
        const styles = await section.evaluate(el => {
          const computed = window.getComputedStyle(el);
          return {
            color: computed.color,
            backgroundColor: computed.backgroundColor,
            visibility: computed.visibility,
            opacity: computed.opacity
          };
        });
        console.log(`Production Section ${i} Styles:`, styles);
      }
    }
    
    if (await navigation.isVisible()) {
      await navigation.screenshot({ path: 'test-results/production-navigation-dark.png' });
    }
  });

  test('Compare Gloo effects visibility', async ({ page }) => {
    // Local Gloo
    await page.goto(LOCAL_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(15000); // Wait for Gloo to load
    
    // Check for canvas elements
    const localCanvases = await page.locator('canvas').count();
    console.log('Local canvas count:', localCanvases);
    
    if (localCanvases > 0) {
      const canvas = page.locator('canvas').first();
      await canvas.screenshot({ path: 'test-results/local-gloo-effect.png' });
      
      const canvasStyles = await canvas.evaluate(el => {
        const computed = window.getComputedStyle(el);
        const parent = el.parentElement;
        const parentComputed = parent ? window.getComputedStyle(parent) : null;
        return {
          canvas: { opacity: computed.opacity, visibility: computed.visibility },
          parent: parentComputed ? { opacity: parentComputed.opacity, visibility: parentComputed.visibility } : null
        };
      });
      console.log('Local Gloo Canvas Styles:', canvasStyles);
    }
    
    // Production Gloo  
    await page.goto(PRODUCTION_URL);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(15000);
    
    const prodCanvases = await page.locator('canvas').count();
    console.log('Production canvas count:', prodCanvases);
    
    if (prodCanvases > 0) {
      const canvas = page.locator('canvas').first();
      await canvas.screenshot({ path: 'test-results/production-gloo-effect.png' });
    }
  });
});