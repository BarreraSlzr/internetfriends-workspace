import { test, expect } from "@playwright/test";

/**
 * gloo-color-validation.spec.ts - InternetFriends WebGL Color Validation
 *
 * Purpose: Verify that WebGL canvas renders vibrant InternetFriends colors
 * in real browser environments where WebGL is available.
 */

const EXPECTED_COLORS = {
  light: ["#ebe75c", "#df4843", "#eb40f0"], // Yellow, Red, Purple
  dark: ["#ffeb70", "#ff5c57", "#ff54ff"], // Brighter variants
};

async function analyzeGlooColors(page) {
  return await page.evaluate(() => {
    const canvas = document.querySelector('[data-testid="gloo-canvas"]') as HTMLCanvasElement | null;

    if (!canvas) {
      return { present: false, error: "Canvas not found" };
    }

    const wrapper = canvas.closest("[data-gloo-client]") as HTMLElement;
    const theme = wrapper?.getAttribute("data-gloo-theme") || "light";
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      return {
        present: true,
        webgl: false,
        theme,
        error: "WebGL context not available"
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
        error: `Failed to read pixels: ${e instanceof Error ? e.message : "Unknown error"}`,
      };
    }

    // Analyze pixel data
    let totalSamples = 0;
    let totalR = 0, totalG = 0, totalB = 0;
    let blackPixels = 0, whitePixels = 0, colorfulPixels = 0;
    const colorSamples = [];

    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const a = pixels[i + 3];

      if (a === 0) continue; // Skip transparent

      totalSamples++;
      totalR += r;
      total
