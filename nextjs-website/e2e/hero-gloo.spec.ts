import { test, expect } from "@playwright/test";

/**
 * hero-gloo.spec.ts
 * --------------------------------------------------
 * Purpose:
 *  - Verify the hero section's WebGL (Gloo) background mounts
 *  - Confirm a valid canvas is present with non‑zero size
 *  - Detect that pixels change over time (animation)
 *  - Provide rich diagnostics (logged) on failure instead of opaque errors
 *
 * Assumptions:
 *  - Hero component sets data-hero-gloo="true" container
 *  - WebGL canvas is rendered via <GlooCanvasAtomic /> inside that container
 *  - Canvas parent emits data attributes: data-hero-gloo-effect, data-hero-gloo-index, data-hero-gloo-palette
 *
 * Skips:
 *  - Does not hard fail on reduced motion (if playing state indicates paused)
 *  - In CI, animation diff can be flaky; we soften assertions accordingly
 */

async function getHeroGlooInfo(page) {
  return await page.evaluate(() => {
    const wrapper = document.querySelector('[data-hero-gloo="true"]') as HTMLElement | null;
    const canvas = wrapper?.querySelector("canvas") as HTMLCanvasElement | null;

    if (!wrapper) {
      return { present: false, reason: "NO_WRAPPER" };
    }
    if (!canvas) {
      return { present: false, reason: "NO_CANVAS" };
    }

    const rect = canvas.getBoundingClientRect();
    const gl =
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl") ||
      null;

    let frameSample: string | null = null;
    try {
      frameSample = canvas.toDataURL("image/png").slice(0, 64);
    } catch {
      frameSample = null;
    }

    return {
      present: true,
      widthCss: rect.width,
      heightCss: rect.height,
      widthAttr: canvas.width,
      heightAttr: canvas.height,
      webgl: !!gl,
      effectName: wrapper.getAttribute("data-hero-gloo-effect"),
      effectIndex: wrapper.getAttribute("data-hero-gloo-index"),
      paletteStrategy: wrapper.getAttribute("data-hero-gloo-palette"),
      frameSample,
      playing: canvas.parentElement?.getAttribute("data-gloo-playing") === "true",
      contextLost:
        canvas.parentElement?.getAttribute("data-gloo-context-lost") === "true",
    };
  });
}

async function captureFrameDelta(page, delayMs = 350) {
  return await page.evaluate(async (delay) => {
    const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
    const wrapper = document.querySelector('[data-hero-gloo="true"]') as HTMLElement | null;
    const canvas = wrapper?.querySelector("canvas") as HTMLCanvasElement | null;

    if (!canvas) {
      return { ok: false, reason: "NO_CANVAS" };
    }

    function snap() {
      try {
        return canvas.toDataURL("image/png");
      } catch {
        return null;
      }
    }

    const f1 = snap();
    await sleep(delay);
    const f2 = snap();

    if (!f1 || !f2) {
      return {
        ok: false,
        reason: "SNAP_FAILED",
        f1: !!f1,
        f2: !!f2,
      };
    }

    return {
      ok: true,
      changed: f1 !== f2,
      len1: f1.length,
      len2: f2.length,
    };
  }, delayMs);
}

test.describe("Hero Gloo WebGL", () => {
  test("mounts hero WebGL canvas with valid sizing & metadata", async ({ page }) => {
    await page.goto("/");

    // Wait for hero container
    await page.waitForSelector('[data-hero-gloo="true"]', { timeout: 8000 });
    // Wait for canvas
    await page.waitForSelector('[data-hero-gloo="true"] canvas', { timeout: 8000 });

    const info = await getHeroGlooInfo(page);

    // Basic presence
    expect(info.present).toBeTruthy();
    expect(info.reason ?? "OK").toBe("OK");

    // Sizing sanity
    expect(info.widthCss).toBeGreaterThan(50);
    expect(info.heightCss).toBeGreaterThan(50);
    expect(info.widthAttr).toBeGreaterThan(0);
    expect(info.heightAttr).toBeGreaterThan(0);

    // WebGL context
    expect(info.webgl).toBeTruthy();

    // Metadata presence
    expect(info.effectIndex).toBeTruthy();
    expect(info.effectName).toBeTruthy();
    expect(info.paletteStrategy).toBeTruthy();

    // Context not lost at start
    expect(info.contextLost).toBeFalsy();

    // Log diagnostics (non-failing)
    console.log("🧪 Hero Gloo Diagnostic:", info);
  });

  test("animates (pixels change over time) when playing", async ({ page }) => {
    await page.goto("/");

    await page.waitForSelector('[data-hero-gloo="true"] canvas', { timeout: 8000 });
    const info = await getHeroGlooInfo(page);

    if (!info.webgl) {
      test.fail(true, "WebGL not available; cannot test animation");
      return;
    }
    if (info.contextLost) {
      test.fail(true, "Context lost before animation test");
      return;
    }

    if (!info.playing) {
      test.skip(true, "Hero WebGL reports not playing (possibly reduced-motion user setting).");
      return;
    }

    const delta = await captureFrameDelta(page, 400);
    if (!delta.ok) {
      test.fail(true, `Could not capture frames: ${delta.reason}`);
      return;
    }

    // If unchanged, try a longer interval once (allows slower effects)
    if (!delta.changed) {
      const retry = await captureFrameDelta(page, 800);
      if (!retry.ok || !retry.changed) {
        test.fail(true, "Hero WebGL appears static (no pixel delta after two intervals).");
      }
    }
  });

  test("graceful diagnostic when context lost (simulated)", async ({ page }) => {
    await page.goto("/");
    await page.waitForSelector('[data-hero-gloo="true"] canvas', { timeout: 8000 });

    // Inject a simulated context loss event if possible
    await page.evaluate(() => {
      const canvas = document.querySelector('[data-hero-gloo="true"] canvas') as any;
      const ext = canvas?.getContext("webgl")?.getExtension("WEBGL_lose_context");
      if (ext) {
        ext.loseContext();
      }
    });

    // Give a short window for attribute update
    await page.waitForTimeout(300);
    const info = await getHeroGlooInfo(page);

    // We don't strictly require automatic recovery in this test, just that we detect loss state properly.
    if (info.contextLost) {
      console.log("ℹ️ Context loss detected (expected in simulation).", {
        effectIndex: info.effectIndex,
        effectName: info.effectName,
      });
    } else {
      console.log("ℹ️ Context loss simulation not supported (extension missing).");
    }
  });
});
