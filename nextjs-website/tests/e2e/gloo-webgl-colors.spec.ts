import { test, expect } from "@playwright/test";

/**
 * gloo-webgl-colors.spec.ts - InternetFriends WebGL Color Validation
 *
 * Purpose: Verify InternetFriends brand colors render correctly in WebGL
 * when running in real browser environments with WebGL support.
 *
 * This test validates the core issue: ensuring vibrant brand colors
 * (#ebe75c yellow, #df4843 red, #eb40f0 purple) are displayed
 * instead of black/white when WebGL is available.
 */

const EXPECTED_COLORS = {
  light: ["#ebe75c", "#df4843", "#eb40f0"], // Yellow, Red, Purple
  dark: ["#ffeb70", "#ff5c57", "#ff54ff"], // Brighter variants
};

async function checkWebGLAvailability(page: any) {
  return await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) return { available: false, reason: "No WebGL context" };

    const webglContext = gl as WebGLRenderingContext;
    return {
      available: true,
      vendor: webglContext.getParameter(webglContext.VENDOR),
      renderer: webglContext.getParameter(webglContext.RENDERER),
      version: webglContext.getParameter(webglContext.VERSION),
      maxTextureSize: webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE),
      extensions: webglContext.getSupportedExtensions()?.slice(0, 5) || [],
    };
  });
}

async function analyzeGlooCanvasColors(page: any) {
  return await page.evaluate(() => {
    const canvas = document.querySelector(
      '[data-testid="gloo-canvas"]',
    ) as HTMLCanvasElement;

    if (!canvas) {
      return { present: false, error: "Canvas element not found" };
    }

    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      return {
        present: true,
        webglActive: false,
        error: "WebGL context unavailable on Gloo canvas",
      };
    }

    const webglContext = gl as WebGLRenderingContext;
    // Sample pixels from center area
    const centerX = Math.floor(canvas.width / 2);
    const centerY = Math.floor(canvas.height / 2);
    const sampleSize = 20;
    const pixels = new Uint8Array(sampleSize * sampleSize * 4);

    try {
      webglContext.readPixels(
        centerX - sampleSize / 2,
        centerY - sampleSize / 2,
        sampleSize,
        sampleSize,
        webglContext.RGBA,
        webglContext.UNSIGNED_BYTE,
        pixels,
      );
    } catch (error) {
      return {
        present: true,
        webglActive: true,
        error: `Failed to read pixels: ${(error as Error).message}`,
      };
    }

    // Analyze color data
    let totalPixels = 0;
    let totalR = 0,
      totalG = 0,
      totalB = 0;
    let blackCount = 0,
      whiteCount = 0,
      colorfulCount = 0;
    const colorSamples = [];

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a === 0) continue; // Skip transparent

      totalPixels++;
      totalR += r;
      totalG += g;
      totalB += b;
      colorSamples.push({ r, g, b });

      // Categorize colors
      if (r < 30 && g < 30 && b < 30) {
        blackCount++;
      } else if (r > 225 && g > 225 && b > 225) {
        whiteCount++;
      } else {
        colorfulCount++;
      }
    }

    if (totalPixels === 0) {
      return {
        present: true,
        webglActive: true,
        error: "No valid pixels found",
      };
    }

    const avgR = Math.round(totalR / totalPixels);
    const avgG = Math.round(totalG / totalPixels);
    const avgB = Math.round(totalB / totalPixels);

    return {
      present: true,
      webglActive: true,
      totalPixels,
      avgColor: { r: avgR, g: avgG, b: avgB },
      avgHex: `#${avgR.toString(16).padStart(2, "0")}${avgG.toString(16).padStart(2, "0")}${avgB.toString(16).padStart(2, "0")}`,
      blackPixels: blackCount,
      whitePixels: whiteCount,
      colorfulPixels: colorfulCount,
      isVibrant: colorfulCount > blackCount + whiteCount,
      canvasSize: { width: canvas.width, height: canvas.height },
      colorSamples: colorSamples.slice(0, 5), // First 5 for debugging
    };
  });
}

test.describe("Gloo WebGL Color Validation", () => {
  test("should render InternetFriends brand colors when WebGL is available", async ({
    page,
  }) => {
    await test.step("Check WebGL availability", async () => {
      const webglInfo = await checkWebGLAvailability(page);

      if (!webglInfo.available) {
        test.skip();
      }

      console.log("🎮 WebGL Info:", webglInfo);
    });

    await test.step("Navigate to homepage", async () => {
      await page.goto("/");
    });

    await test.step("Wait for Gloo initialization", async () => {
      await page.waitForSelector("[data-gloo-client]", { timeout: 8000 });
      await page.waitForSelector('[data-testid="gloo-canvas"]', {
        timeout: 8000,
      });
      await page.waitForTimeout(1500); // Allow WebGL to render frames
    });

    const colorAnalysis = await analyzeGlooCanvasColors(page);

    await test.step("Validate WebGL canvas renders colors", async () => {
      console.log("🎨 Gloo Color Analysis:", {
        webglActive: colorAnalysis.webglActive,
        avgHex: colorAnalysis.avgHex,
        totalPixels: colorAnalysis.totalPixels,
        isVibrant: colorAnalysis.isVibrant,
        colorDistribution: {
          colorful: colorAnalysis.colorfulPixels,
          black: colorAnalysis.blackPixels,
          white: colorAnalysis.whitePixels,
        },
      });

      expect(colorAnalysis.present).toBe(true);
      expect(colorAnalysis.webglActive).toBe(true);

      if (colorAnalysis.error) {
        throw new Error(`WebGL canvas error: ${colorAnalysis.error}`);
      }

      expect(colorAnalysis.totalPixels).toBeGreaterThan(0);
      expect(colorAnalysis.colorfulPixels).toBeGreaterThan(0);
      expect(colorAnalysis.isVibrant).toBe(true);

      // Should NOT be predominantly black (WebGL failure) or white (blank)
      const blackRatio = colorAnalysis.blackPixels / colorAnalysis.totalPixels;
      const whiteRatio = colorAnalysis.whitePixels / colorAnalysis.totalPixels;

      if (blackRatio > 0.9) {
        throw new Error(
          `Gloo canvas is predominantly BLACK (${(blackRatio * 100).toFixed(1)}%) - ` +
            `Expected vibrant InternetFriends colors: ${EXPECTED_COLORS.light.join(", ")}`,
        );
      }

      if (whiteRatio > 0.9) {
        throw new Error(
          `Gloo canvas is predominantly WHITE (${(whiteRatio * 100).toFixed(1)}%) - ` +
            `Expected vibrant InternetFriends colors: ${EXPECTED_COLORS.light.join(", ")}`,
        );
      }
    });
  });

  test("should show WebGL requirement message when WebGL unavailable", async ({
    page,
  }) => {
    const webglInfo = await checkWebGLAvailability(page);

    if (webglInfo.available) {
      test.skip();
    }

    await test.step("Navigate to homepage", async () => {
      await page.goto("/");
    });

    await test.step("Wait for Gloo client", async () => {
      await page.waitForSelector("[data-gloo-client]", { timeout: 8000 });
      await page.waitForTimeout(1000);
    });

    await test.step("Validate WebGL requirement message displayed", async () => {
      const hasRequirementMessage = await page.evaluate(() => {
        const client = document.querySelector("[data-gloo-client]");
        return client?.textContent?.includes("WebGL Required") || false;
      });

      expect(hasRequirementMessage).toBe(true);
      console.log("✅ WebGL requirement message displayed correctly");
    });
  });
});
