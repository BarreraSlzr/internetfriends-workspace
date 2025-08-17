import { test, expect } from '@playwright/test';

test.describe('Dark Mode Text Visibility', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should capture initial light mode', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of light mode
    await page.screenshot({ 
      path: 'test-results/light-mode-initial.png',
      fullPage: true 
    });
  });

  test('should capture dark mode after 10 seconds', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Wait 10 seconds for any theme initialization
    await page.waitForTimeout(10000);
    
    // Toggle to dark mode
    await page.click('[title="Toggle theme"]');
    
    // Wait for theme transition
    await page.waitForTimeout(1000);
    
    // Take screenshot of dark mode
    await page.screenshot({ 
      path: 'test-results/dark-mode-after-10s.png',
      fullPage: true 
    });
    
    // Check text visibility in sections
    const companyInfo = page.locator('section').first();
    const navigation = page.locator('nav');
    
    // Verify these sections are visible
    await expect(companyInfo).toBeVisible();
    await expect(navigation).toBeVisible();
    
    // Get computed styles to check text color
    const companyTextColor = await companyInfo.evaluate(el => 
      window.getComputedStyle(el).color
    );
    const navTextColor = await navigation.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    console.log('Company info text color:', companyTextColor);
    console.log('Navigation text color:', navTextColor);
  });

  test('should check text contrast between header and hero', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');
    
    // Wait 10 seconds
    await page.waitForTimeout(10000);
    
    // Toggle to dark mode
    await page.click('[title="Toggle theme"]');
    await page.waitForTimeout(1000);
    
    // Check the problematic area between header and hero
    const problemSection = page.locator('section').first(); // Company info
    
    // Take focused screenshot of the problem area
    await problemSection.screenshot({ 
      path: 'test-results/problem-area-dark.png' 
    });
    
    // Check if text is readable
    const isVisible = await problemSection.isVisible();
    const textContent = await problemSection.textContent();
    
    console.log('Problem section visible:', isVisible);
    console.log('Text content:', textContent);
  });
});