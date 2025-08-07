import { test, expect } from "@playwright/test";

test.describe("InternetFriends Landing Page", () => {
  test("should load homepage", async ({ page }) => {
    await page.goto("/");
    
    // Check page loads
    await expect(page).toHaveTitle(/InternetFriends/i);
    
    // Check for key elements
    await expect(page.locator("h1")).toBeVisible();
  });
  
  test("should have working navigation", async ({ page }) => {
    await page.goto("/");
    
    // Test navigation links (adjust selectors based on your actual nav)
    const navLinks = page.locator("nav a");
    await expect(navLinks.first()).toBeVisible();
  });
  
  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto("/");
    
    // Check mobile layout
    await expect(page.locator("body")).toBeVisible();
  });
  
  test("should have fast loading times", async ({ page }) => {
    const startTime = Date.now();
    await page.goto("/");
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds
    expect(loadTime).toBeLessThan(3000);
  });
  
  test("should handle hot reload", async ({ page }) => {
    await page.goto("/");
    
    // Wait for page to be fully loaded
    await page.waitForLoadState("networkidle");
    
    // Check console for errors
    const logs: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        logs.push(msg.text());
      }
    });
    
    // Simulate waiting for hot reload
    await page.waitForTimeout(1000);
    
    // Should have no console errors
    expect(logs.length).toBe(0);
  });
});
