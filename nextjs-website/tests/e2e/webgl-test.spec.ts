import { test, expect } from "@playwright/test";

test("WebGL availability in Playwright", async ({ page }) => {
  await page.goto("/");

  const webglInfo = await page.evaluate(() => {
    const canvas = document.createElement("canvas");
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    if (!gl) {
      return {
        webglAvailable: false,
        webgl2Available: !!canvas.getContext("webgl2"),
        userAgent: navigator.userAgent,
        devicePixelRatio: window.devicePixelRatio,
        webglExtensions: null,
        maxTextureSize: null,
        maxViewportDims: null,
        vendor: null,
        renderer: null,
      };
    }

    const webglContext = gl as WebGLRenderingContext;
    return {
      webglAvailable: true,
      webgl2Available: !!canvas.getContext("webgl2"),
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio,
      webglExtensions:
        webglContext.getSupportedExtensions()?.slice(0, 10) || null,
      maxTextureSize: webglContext.getParameter(webglContext.MAX_TEXTURE_SIZE),
      maxViewportDims: webglContext.getParameter(
        webglContext.MAX_VIEWPORT_DIMS,
      ),
      vendor: webglContext.getParameter(webglContext.VENDOR),
      renderer: webglContext.getParameter(webglContext.RENDERER),
    };
  });

  console.log("WebGL Test Results:", webglInfo);

  if (!webglInfo.webglAvailable) {
    console.warn(
      "❌ WebGL not available - this explains black/white Gloo background",
    );
  } else {
    console.log("✅ WebGL available - Gloo should render colors");
  }
});
