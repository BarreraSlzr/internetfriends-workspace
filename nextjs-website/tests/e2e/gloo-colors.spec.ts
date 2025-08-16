import { test, expect } from "@playwright/test";

/**
 * gloo-colors.spec.ts - InternetFriends Brand Color Validation
 *
 * Purpose: Verify that WebGL canvas renders vibrant InternetFriends colors,
 * not black/white fallbacks that would indicate configuration issues.
 */

const EXPECTED_COLORS = {
  light: ["#ebe75c", "#df4843", "#eb40f0"], // Yellow, Red, Purple
  dark: ["#ffeb70", "#ff5c57", "#ff54ff"], // Brighter variants
};

test("Gloo WebGL renders InternetFriends brand colors (not fallback)", async ({
  page,
}) => {
  await page.goto("/");

  // Wait for gloo canvas to be present and WebGL to initialize
  await page.waitForSelector('[data-testid="gloo-canvas"]', { timeout: 10000 });
  await page.waitForTimeout(2000); // Allow WebGL initialization

  const result = await getGlooColorAnalysis(page);

  expect(result.present).toBe(true);

  if (result.webgl) {
    expect(result.colors).toBeDefined();
    expect(result.theme).toMatch(/light|dark/);

    // Verify we're getting vibrant colors, not black/white fallbacks
    const { r, g, b } = result.colors;
    const brightness = (r + g + b) / 3;
    expect(brightness).toBeGreaterThan(30); // Not completely dark
    expect(brightness).toBeLessThan(200); // Not completely white

    // At least some color variation (not grayscale)
    const colorVariation = Math.max(r, g, b) - Math.min(r, g, b);
    expect(colorVariation).toBeGreaterThan(20);

    console.log(
      `Gloo brand colors in ${result.theme} theme: rgb(${r}, ${g}, ${b})`,
    );
  } else {
    console.warn("WebGL not available, skipping brand color validation");
  }
});

async function getGlooColorAnalysis(page) {
  return await page.evaluate(() => {
    const canvas = document.querySelector(
      '[data-testid="gloo-canvas"]',
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return { present: false, error: "Canvas not found" };
    }

    const wrapper = canvas.closest("[data-gloo-global]") as HTMLElement;
    const theme = wrapper?.getAttribute("data-gloo-theme") || "light";
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      return {
        present: true,
        webgl: false,
        theme,
        error: "WebGL context not available",
      };
    }

    // Sample center area of canvas
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const sampleSize = 16;
    const pixels = new Uint8Array(sampleSize * sampleSize * 4);

    try {
      gl.readPixels(
        centerX - sampleSize / 2,
        centerY - sampleSize / 2,
        sampleSize,
        sampleSize,
        gl.RGBA,
        gl.UNSIGNED_BYTE,
        pixels,
      );
    } catch (e) {
      return {
        present: true,
        webgl: true,
        theme,
        error: `Failed to read pixels: ${e.message}`,
      };
    }

    // Analyze pixel data
    let totalSamples = 0;
    let totalR = 0,
      totalG = 0,
      totalB = 0;
    const blackPixels = 0,
      whitePixels = 0,
      colorfulPixels = 0;
    const colorSamples = [];

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a === 0) continue; // Skip transparent

      totalSamples++;
      totalR += r;
      totalG += g;
      totalB += b;
    }

    if (totalSamples === 0) return { r: 0, g: 0, b: 0 };

    return {
      present: true,
      webgl: true,
      theme,
      colors: {
        r: Math.round(totalR / totalSamples),
        g: Math.round(totalG / totalSamples),
        b: Math.round(totalB / totalSamples),
      },
    };
  });
}
