import { test, expect } from "@playwright/test";

test.describe("Design System - Live Component Showcase", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the actual design system page
    await page.goto("/design-system");
    await page.waitForLoadState("networkidle");

    // Wait for the main title to appear
    await page.waitForSelector('h1:has-text("InternetFriends Design System")', {
      timeout: 10000,
    });
  });

  test.describe("Page Structure and Navigation", () => {
    test("should display main design system page successfully", async ({
      page,
    }) => {
      // Check main title is visible
      await expect(
        page.getByText("InternetFriends Design System"),
      ).toBeVisible();

      // Check description is visible
      await expect(
        page.getByText("Visual component architecture and live showcase"),
      ).toBeVisible();

      // Check stats section is visible
      const statsSection = page.locator(".grid.grid-cols-4");
      await expect(statsSection).toBeVisible();
    });

    test("should display component statistics correctly", async ({ page }) => {
      // Check for Total components stat
      const totalStat = page.locator('text="Total"').first();
      await expect(totalStat).toBeVisible();

      // Check for Atomic components stat
      const atomicStat = page.locator('text="Atomic"').first();
      await expect(atomicStat).toBeVisible();

      // Check for Test Coverage stat
      const testCoverageStat = page.locator('text="Test Coverage"').first();
      await expect(testCoverageStat).toBeVisible();
    });
  });

  test.describe("Interactive Component Showcase", () => {
    test("should display ButtonAtomic component node with live preview", async ({
      page,
    }) => {
      // Find the ButtonAtomic component node
      const buttonNode = page.locator('[data-id="button-atomic"]');
      await expect(buttonNode).toBeVisible();

      // Check that it shows as a passing test status
      const testStatusIcon = buttonNode.locator(
        'svg[data-testid="check-circle"]',
      );
      await expect(testStatusIcon).toBeVisible();

      // Check that it shows usage count
      const usageText = buttonNode.locator("text=/\\d+ uses/");
      await expect(usageText).toBeVisible();

      // Click the eye icon to show live preview
      const eyeButton = buttonNode.locator('button[title*="preview"]');
      await eyeButton.click();

      // Verify that a live button component is now visible - use first() to handle multiple matches
      const liveButton = buttonNode
        .locator('button:has-text("Primary")')
        .first();
      await expect(liveButton).toBeVisible();

      // Test that the live button is actually clickable
      await liveButton.click();

      // Verify button variants are shown
      const variantsSection = buttonNode.locator('text="Variants:"');
      await expect(variantsSection).toBeVisible();

      // Check for different variant buttons
      const glassButton = buttonNode
        .locator('button:has-text("Glass")')
        .first();
      await expect(glassButton).toBeVisible();
    });

    test("should display GlassCardAtomic component node", async ({ page }) => {
      // Find the GlassCardAtomic component node
      const glassCardNode = page.locator('[data-id="glass-card-atomic"]');
      await expect(glassCardNode).toBeVisible();

      // Check for passing test status
      const testStatusIcon = glassCardNode.locator(
        'svg[data-testid="check-circle"]',
      );
      await expect(testStatusIcon).toBeVisible();

      // Click preview button to show live component
      const eyeButton = glassCardNode.locator('button[title*="preview"]');
      await eyeButton.click();

      // Check for live preview content (should contain card variants)
      const livePreview = glassCardNode.locator(".bg-white.border.rounded-md");
      await expect(livePreview).toBeVisible();
    });
  });

  test.describe("Search and Filtering", () => {
    test("should support component search functionality", async ({ page }) => {
      // Find search input
      const searchInput = page.locator('input[placeholder*="Search"]');
      await expect(searchInput).toBeVisible();

      // Search for "Button"
      await searchInput.fill("Button");

      // Should still show ButtonAtomic
      await expect(page.locator('[data-id="button-atomic"]')).toBeVisible();

      // Clear search
      await searchInput.fill("");

      // Should show all components again
      await expect(page.locator('[data-id="button-atomic"]')).toBeVisible();
      await expect(page.locator('[data-id="glass-card-atomic"]')).toBeVisible();
    });

    test("should allow filtering by component category", async ({ page }) => {
      // Find category dropdown
      const categorySelect = page.locator("select");
      await expect(categorySelect).toBeVisible();

      // Filter by atomic
      await categorySelect.selectOption("atomic");

      // Should show atomic components
      await expect(page.locator('[data-id="button-atomic"]')).toBeVisible();
      await expect(page.locator('[data-id="glass-card-atomic"]')).toBeVisible();

      // Reset to all
      await categorySelect.selectOption("all");

      // Should show all components again
      await expect(page.locator('[data-id="button-atomic"]')).toBeVisible();
      await expect(page.locator('[data-id="glass-card-atomic"]')).toBeVisible();
    });
  });

  test.describe("Component Quality Indicators", () => {
    test("should display test status indicators for components", async ({
      page,
    }) => {
      // Check ButtonAtomic has passing status (green check)
      const buttonNode = page.locator('[data-id="button-atomic"]');
      const buttonStatus = buttonNode.locator(
        'svg[data-testid="check-circle"]',
      );
      await expect(buttonStatus).toBeVisible();

      // Check it shows usage count
      const usageCount = buttonNode.locator("text=/\\d+ uses/");
      await expect(usageCount).toBeVisible();
    });

    test("should show component descriptions", async ({ page }) => {
      const buttonNode = page.locator('[data-id="button-atomic"]');

      // Should show component description
      const description = buttonNode.locator(
        ':text("InternetFriends styled button")',
      );
      await expect(description).toBeVisible();
    });
  });
});
