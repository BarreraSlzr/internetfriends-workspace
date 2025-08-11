import { test, expect } from "@playwright/test";

test.describe("InternetFriends Design System", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to design system page
    await page.goto("/design-system");
    await page.waitForLoadState("networkidle");
  });

  test("should load design system page successfully", async ({ page }) => {
    // Check page loads without errors
    await expect(page).toHaveTitle(/InternetFriends/i);

    // Check for React Flow container
    await expect(page.locator(".react-flow")).toBeVisible();

    // Check for main header
    await expect(page.getByText("InternetFriends Design System")).toBeVisible();
  });

  test("should display component nodes correctly", async ({ page }) => {
    // Wait for nodes to load
    await page.waitForSelector('[data-id="header-atomic"]', { timeout: 10000 });

    // Check atomic components are visible
    await expect(page.locator('[data-id="header-atomic"]')).toBeVisible();
    await expect(page.locator('[data-id="glass-card-atomic"]')).toBeVisible();
    await expect(page.locator('[data-id="button-atomic"]')).toBeVisible();

    // Check molecular components
    await expect(
      page.locator('[data-id="navigation-molecular"]'),
    ).toBeVisible();

    // Check utility nodes
    await expect(page.locator('[data-id="design-tokens"]')).toBeVisible();
    await expect(page.locator('[data-id="css-utilities"]')).toBeVisible();
  });

  test("should have working search functionality", async ({ page }) => {
    // Wait for search input
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Search for specific component
    await searchInput.fill("Button");

    // Should show button-related nodes
    await expect(page.locator('[data-id="button-atomic"]')).toBeVisible();

    // Clear search
    await searchInput.clear();
    await searchInput.fill("");

    // All nodes should be visible again
    await expect(page.locator('[data-id="header-atomic"]')).toBeVisible();
  });

  test("should have working category filter", async ({ page }) => {
    // Wait for filter dropdown
    const categoryFilter = page.locator("select");
    await expect(categoryFilter).toBeVisible();

    // Filter by atomic components
    await categoryFilter.selectOption("atomic");

    // Should show atomic components
    await expect(page.locator('[data-id="header-atomic"]')).toBeVisible();
    await expect(page.locator('[data-id="button-atomic"]')).toBeVisible();

    // Should not show utility nodes
    await expect(page.locator('[data-id="design-tokens"]')).not.toBeVisible();

    // Reset filter
    await categoryFilter.selectOption("all");
    await expect(page.locator('[data-id="design-tokens"]')).toBeVisible();
  });

  test("should display stats panel correctly", async ({ page }) => {
    // Check stats panel is visible
    const statsPanel = page.getByText("Registry Stats").locator("..");
    await expect(statsPanel).toBeVisible();

    // Check stats content
    await expect(page.getByText("Components")).toBeVisible();
    await expect(page.getByText("Stable")).toBeVisible();
    await expect(page.getByText("Atomic:")).toBeVisible();
    await expect(page.getByText("Molecular:")).toBeVisible();
  });

  test("should have working React Flow controls", async ({ page }) => {
    // Check controls panel exists
    await expect(page.locator(".react-flow__controls")).toBeVisible();

    // Check minimap exists
    await expect(page.locator(".react-flow__minimap")).toBeVisible();

    // Test zoom in button
    const zoomInButton = page.locator(
      '.react-flow__controls-button[title*="zoom in"]',
    );
    if ((await zoomInButton.count()) > 0) {
      await zoomInButton.click();
    }
  });

  test("should display live component showcase", async ({ page }) => {
    // Check component showcase panel
    const showcasePanel = page.getByText("Live Components").locator("..");
    await expect(showcasePanel).toBeVisible();

    // Check for actual working components
    await expect(page.locator(".glass-card")).toBeVisible();
    await expect(page.getByRole("button", { name: "Primary" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Glass" })).toBeVisible();
  });

  test("should handle node interactions", async ({ page }) => {
    // Wait for nodes to be interactive
    await page.waitForSelector('[data-id="button-atomic"]', {
      state: "visible",
    });

    // Click on a component node
    await page.locator('[data-id="button-atomic"]').click();

    // Should show selection styling (ring around node)
    const buttonNode = page.locator('[data-id="button-atomic"]');
    await expect(buttonNode).toHaveClass(/selected/);
  });

  test("should show connection edges", async ({ page }) => {
    // Wait for edges to render
    await page.waitForSelector(".react-flow__edge", { timeout: 10000 });

    // Check that edges are visible
    const edges = page.locator(".react-flow__edge");
    await expect(edges.first()).toBeVisible();

    // Should have multiple edges showing relationships
    expect(await edges.count()).toBeGreaterThan(0);
  });

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });

    // Should still show main content
    await expect(page.locator(".react-flow")).toBeVisible();

    // Panels should adapt to mobile
    const headerPanel = page
      .getByText("InternetFriends Design System")
      .locator("..");
    await expect(headerPanel).toBeVisible();
  });

  test("should handle clear filters action", async ({ page }) => {
    // Add a search filter
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("Button");

    // Add category filter
    const categoryFilter = page.locator("select");
    await categoryFilter.selectOption("atomic");

    // Click clear filters button
    const clearButton = page.getByRole("button", { name: "Clear Filters" });
    await clearButton.click();

    // Should reset both filters
    await expect(searchInput).toHaveValue("");
    await expect(categoryFilter).toHaveValue("all");

    // All nodes should be visible
    await expect(page.locator('[data-id="design-tokens"]')).toBeVisible();
  });

  test("should toggle stats panel", async ({ page }) => {
    // Find stats toggle button
    const statsToggle = page.getByRole("button", { name: /stats/i });

    // Stats should be visible initially
    const statsPanel = page.getByText("Registry Stats").locator("..");
    await expect(statsPanel).toBeVisible();

    // Click to hide stats
    await statsToggle.click();
    await expect(statsPanel).not.toBeVisible();

    // Click to show stats again
    await statsToggle.click();
    await expect(statsPanel).toBeVisible();
  });

  test("should have no JavaScript errors", async ({ page }) => {
    const consoleErrors: string[] = [];

    page.on("console", (msg) => {
      if (msg.type() === "error") {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate and interact with the page
    await page.goto("/design-system");
    await page.waitForLoadState("networkidle");

    // Interact with search
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill("Button");
    await searchInput.clear();

    // Interact with filters
    const categoryFilter = page.locator("select");
    await categoryFilter.selectOption("atomic");
    await categoryFilter.selectOption("all");

    // Should have no console errors
    expect(consoleErrors.length).toBe(0);
  });

  test("should have proper accessibility", async ({ page }) => {
    // Check for proper ARIA labels
    await expect(page.locator('input[placeholder*="Search"]')).toHaveAttribute(
      "type",
      "text",
    );

    // Check for proper semantic elements
    await expect(page.locator("h1")).toBeVisible();

    // Check buttons have proper roles
    const buttons = page.getByRole("button");
    expect(await buttons.count()).toBeGreaterThan(0);

    // Check select elements are accessible
    await expect(page.locator("select")).toBeVisible();
  });

  test("should load within performance budget", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/design-system");
    await page.waitForSelector('[data-id="button-atomic"]');

    const loadTime = Date.now() - startTime;

    // Should load within 5 seconds (React Flow is heavier than static pages)
    expect(loadTime).toBeLessThan(5000);
  });

  test("should handle network errors gracefully", async ({ page }) => {
    // Block network requests to simulate offline
    await page.route("**/*", (route) => route.abort());

    // Try to navigate (this will fail for external resources)
    await page.goto("/design-system", { waitUntil: "domcontentloaded" });

    // Should still show basic content
    await expect(page.locator("body")).toBeVisible();
  });
});

test.describe("Component Registry", () => {
  test("should have proper component data structure", async ({ page }) => {
    await page.goto("/design-system");

    // Test component registry via browser evaluation
    const registryStats = await page.evaluate(() => {
      // Access the component registry if it's available globally
      const registry = (window as { componentRegistry?: any })
        .componentRegistry;
      if (!registry) return null;

      return {
        totalComponents: registry.getAllComponents?.().length || 0,
        totalUtilities: registry.getAllUtilities?.().length || 0,
        totalHooks: registry.getAllHooks?.().length || 0,
        totalPages: registry.getAllPages?.().length || 0,
      };
    });

    // Should have components registered
    if (registryStats) {
      expect(registryStats.totalComponents).toBeGreaterThan(0);
      expect(registryStats.totalUtilities).toBeGreaterThan(0);
    }
  });
});

test.describe("Design System Integration", () => {
  test("should apply InternetFriends design tokens", async ({ page }) => {
    await page.goto("/design-system");

    // Check CSS custom properties are applied
    const rootStyles = await page.evaluate(() => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);
      return {
        ifPrimary: computedStyle.getPropertyValue("--if-primary").trim(),
        glassHeader: computedStyle.getPropertyValue("--glass-bg-header").trim(),
        radiusLg: computedStyle.getPropertyValue("--radius-lg").trim(),
      };
    });

    // Should have InternetFriends design tokens
    expect(rootStyles.ifPrimary).toBe("#3b82f6");
    expect(rootStyles.glassHeader).toBe("rgba(255, 255, 255, 0.85)");
    expect(rootStyles.radiusLg).toBe("0.75rem");
  });

  test("should have glass morphism effects", async ({ page }) => {
    await page.goto("/design-system");

    // Check for glass morphism classes
    const glassElements = page.locator(".glass-header");
    await expect(glassElements.first()).toBeVisible();

    // Check for backdrop blur
    const hasBackdropBlur = await page.evaluate(() => {
      const element = document.querySelector(".glass-header");
      if (!element) return false;
      const style = getComputedStyle(element);
      return style.backdropFilter.includes("blur");
    });

    expect(hasBackdropBlur).toBe(true);
  });
});
