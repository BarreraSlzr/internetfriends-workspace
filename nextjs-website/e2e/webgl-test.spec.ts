import { test, expect } from "@playwright/test";

test("WebGL availability in Playwright", async ({ page }) => {
  await page.goto("/");

  const webglInfo = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    return {
      webglAvailable: !!gl,
      webgl2Available: !!canvas.getContext("webgl2"),
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio,
      webglExtensions: gl ? gl.getSupportedExtensions()?.slice(0, 10) : null,
      maxTextureSize: gl ? gl.getParameter(gl.MAX_TEXTURE_SIZE) : null,
      maxViewportDims: gl ? gl.getParameter(gl.MAX_VIEWPORT_DIMS) : null,
      vendor: gl ? gl.getParameter(gl.VENDOR) : null,
      renderer: gl ? gl.getParameter(gl.RENDERER) : null,
    };
  });

  console.log("WebGL Test Results:", webglInfo);

  if (!webglInfo.webglAvailable) {
    console.warn("❌ WebGL not available - this explains black/white Gloo background");
  } else {
    console.log("✅ WebGL available - Gloo should render colors");
  }
});
