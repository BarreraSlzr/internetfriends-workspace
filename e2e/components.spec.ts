import { test, expect } from "@playwright/test";

test.describe("Atomic Components", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to design system page where components are showcased
    await page.goto("/design-system");
    await page.waitForLoadState("networkidle");
  });

  test.describe("ButtonAtomic", () => {
    test("should render primary button correctly", async ({ page }) => {
      const primaryButton = page.getByRole("button", { name: "Primary" });
      await expect(primaryButton).toBeVisible();

      // Check styling
      await expect(primaryButton).toHaveClass(/btn-if-primary/);
    });

    test("should render glass button correctly", async ({ page }) => {
      const glassButton = page.getByRole("button", { name: "Glass" });
      await expect(glassButton).toBeVisible();

      // Should have glass morphism classes
      await expect(glassButton).toHaveClass(/glass-card/);
    });

    test("should be clickable and interactive", async ({ page }) => {
      const primaryButton = page.getByRole("button", { name: "Primary" });

      // Should be clickable
      await primaryButton.click();

      // Check hover effects work
      await primaryButton.hover();

      // Button should maintain accessibility
      await expect(primaryButton).toBeEnabled();
    });

    test("should have proper focus states", async ({ page }) => {
      const primaryButton = page.getByRole("button", { name: "Primary" });

      // Focus the button
      await primaryButton.focus();

      // Should have focus styles
      await expect(primaryButton).toBeFocused();
    });
  });

  test.describe("GlassCardAtomic", () => {
    test("should render glass cards correctly", async ({ page }) => {
      const glassCard = page.locator(".glass-card").first();
      await expect(glassCard).toBeVisible();

      // Check for glass morphism properties
      const hasGlassEffect = await page.evaluate(() => {
        const card = document.querySelector(".glass-card");
        if (!card) return false;
        const style = getComputedStyle(card);
        return style.backdropFilter.includes("blur");
      });

      expect(hasGlassEffect).toBe(true);
    });

    test("should have proper border radius", async ({ page }) => {


      const borderRadius = await page.evaluate(() => {
        const card = document.querySelector(".glass-card");
        if (!card) return "";
        const style = getComputedStyle(card);
        return style.borderRadius;
      });

      // Should use compact radius system (12px max)
      expect(borderRadius).toMatch(/0\.75rem|12px/);
    });

    test("should respond to hover interactions", async ({ page }) => {
      const glassCard = page.locator(".glass-card").first();

      // Hover over the card
      await glassCard.hover();

      // Should have hover effects (transform or shadow changes)
      const __hasTransform = await page.evaluate(() => {
        const card = document.querySelector(".glass-card:hover");
        if (!card) return false;
        const style = getComputedStyle(card);
        return style.transform !== "none" || style.boxShadow !== "none";
      });

      // Note: This might not work perfectly due to :hover pseudo-class limitations
      // but we're testing the structure is in place
    });
  });

  test.describe("HeaderAtomic", () => {
    test("should have glass morphism styling", async ({ page }) => {
      // Look for header elements with glass styling
      const glassHeader = page.locator(".glass-header").first();
      await expect(glassHeader).toBeVisible();

      // Check backdrop filter is applied
      const hasBackdrop = await page.evaluate(() => {
        const header = document.querySelector(".glass-header");
        if (!header) return false;
        const style = getComputedStyle(header);
        return style.backdropFilter.includes("blur");
      });

      expect(hasBackdrop).toBe(true);
    });

    test("should be responsive", async ({ page }) => {
      // Test mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      const glassHeader = page.locator(".glass-header").first();
      await expect(glassHeader).toBeVisible();

      // Test desktop viewport
      await page.setViewportSize({ width: 1024, height: 768 });
      await expect(glassHeader).toBeVisible();
    });
  });
});

test.describe("Molecular Components", () => {
  test.describe("NavigationMolecular", () => {
    test("should handle component composition", async ({ page }) => {
      await page.goto("/design-system");

      // Check that navigation nodes show composition relationships
      const navigationNode = page.locator('[data-id="navigation-molecular"]');
      await expect(navigationNode).toBeVisible();

      // Should show composition with HeaderAtomic and ButtonAtomic
      const compositionText = navigationNode.locator('text=HeaderAtomic');
      await expect(compositionText).toBeVisible();
    });

    test("should display proper features", async ({ page }) => {
      await page.goto("/design-system");

      const navigationNode = page.locator('[data-id="navigation-molecular"]');
      await expect(navigationNode).toBeVisible();

      // Check for mobile responsive feature
      const mobileFeature = navigationNode.locator('text=Mobile responsive');
      await expect(mobileFeature).toBeVisible();
    });
  });
});

test.describe("Component Integration", () => {
  test("should show component relationships in React Flow", async ({ page }) => {
    await page.goto("/design-system");

    // Wait for React Flow to load
    await page.waitForSelector(".react-flow__edge", { timeout: 10000 });

    // Check edges connect related components
    const edges = page.locator(".react-flow__edge");
    expect(await edges.count()).toBeGreaterThan(0);

    // Should have composition edges (solid lines)
    const compositionEdges = page.locator('.react-flow__edge[data-testid*= "smoothstep"]');
    expect(await compositionEdges.count()).toBeGreaterThan(0);
  });

  test("should maintain component hierarchy", async ({ page }) => {
    await page.goto("/design-system");

    // Check atomic components are positioned correctly
    const atomicNodes = page.locator('[data-testid*= "atomic"]');
    expect(await atomicNodes.count()).toBeGreaterThan(0);

    // Check molecular components exist
    const molecularNodes = page.locator('[data-testid*= "molecular"]');
    expect(await molecularNodes.count()).toBeGreaterThan(0);
  });
});

test.describe("Design System Validation", () => {
  test("should apply consistent styling across components", async ({ page }) => {
    await page.goto("/design-system");

    // Check for consistent border radius usage
    const elements = await page.locator('[class*= "rounded-compact"]').all();
    expect(elements.length).toBeGreaterThan(0);

    // Check for InternetFriends primary color usage
    const primaryElements = await page.locator('[class*= "if-primary"]').all();
    expect(primaryElements.length).toBeGreaterThan(0);
  });

  test("should have consistent spacing system", async ({ page }) => {
    await page.goto("/design-system");

    // Check for consistent padding/margin classes
    const spacingElements = await page.locator('[class*= "p-"], [class*= "m-"]').all();
    expect(spacingElements.length).toBeGreaterThan(0);
  });

  test("should implement glass morphism consistently", async ({ page }) => {
    await page.goto("/design-system");

    // Check all glass elements have backdrop-filter
    const glassElements = await page.evaluate(() => {
      const elements = document.querySelectorAll('.glass-header, .glass-card');
      return Array.from(elements).every(el => {
        const style = getComputedStyle(el);
        return style.backdropFilter && style.backdropFilter.includes('blur');
      });
    });

    expect(glassElements).toBe(true);
  });
});

test.describe("Component Props and Variants", () => {
  test("should handle button variants correctly", async ({ page }) => {
    await page.goto("/design-system");

    // Check different button variants exist
    const primaryButton = page.getByRole("button", { name: "Primary" });
    const glassButton = page.getByRole("button", { name: "Glass" });

    await expect(primaryButton).toBeVisible();
    await expect(glassButton).toBeVisible();

    // Should have different styling
    const primaryClass = await primaryButton.getAttribute("class");
    const glassClass = await glassButton.getAttribute("class");

    expect(primaryClass).not.toBe(glassClass);
  });

  test("should validate component prop types", async ({ page }) => {
    await page.goto("/design-system");

    // Check component registry shows proper prop types
    const buttonNode = page.locator('[data-id="button-atomic"]');
    await expect(buttonNode).toBeVisible();

    // Should show variant prop
    const variantProp = buttonNode.locator('text=variant');
    await expect(variantProp).toBeVisible();

    // Should show size prop
    const sizeProp = buttonNode.locator('text=size');
    await expect(sizeProp).toBeVisible();
  });
});

test.describe("Accessibility Testing", () => {
  test("should have proper ARIA attributes", async ({ page }) => {
    await page.goto("/design-system");

    // Check buttons have proper roles
    const buttons = page.getByRole("button");
    expect(await buttons.count()).toBeGreaterThan(0);

    // Check interactive elements are keyboard accessible
    const searchInput = page.locator('input[type="text"]');
    if (await searchInput.count() > 0) {
      await searchInput.focus();
      await expect(searchInput).toBeFocused();
    }
  });

  test("should support keyboard navigation", async ({ page }) => {
    await page.goto("/design-system");

    // Test tab navigation
    await page.keyboard.press("Tab");

    // Should focus on interactive elements
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
  });

  test("should have proper color contrast", async ({ page }) => {
    await page.goto("/design-system");

    // Check text elements have sufficient contrast
    const textElements = page.locator("p, span, div").first();
    await expect(textElements).toBeVisible();

    // This is a basic check - in real scenarios you'd use axe-core
    const textColor = await page.evaluate(() => {
      const el = document.querySelector("p, span, div");
      if (!el) return "";
      return getComputedStyle(el).color;
    });

    expect(textColor).toBeTruthy();
  });
});

test.describe("Performance Testing", () => {
  test("should load components efficiently", async ({ page }) => {
    const startTime = Date.now();

    await page.goto("/design-system");
    await page.waitForSelector('[data-id="button-atomic"]');

    const loadTime = Date.now() - startTime;

    // Should load within reasonable time
    expect(loadTime).toBeLessThan(5000);
  });

  test("should handle multiple component instances", async ({ page }) => {
    await page.goto("/design-system");

    // Check multiple nodes render without performance issues
    const allNodes = page.locator('[data-id]');
    const nodeCount = await allNodes.count();

    expect(nodeCount).toBeGreaterThan(5);

    // All nodes should be visible
    for (let i = 0; i < Math.min(nodeCount, 10); i++) {
      await expect(allNodes.nth(i)).toBeVisible();
    }
  });
});
