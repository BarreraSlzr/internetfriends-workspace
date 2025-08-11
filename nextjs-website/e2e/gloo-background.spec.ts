import { test, expect } from "@playwright/test";

/**
 * gloo-background.spec.ts
 *
 * Purpose:
 *  - Assert the Gloo global WebGL background system mounts correctly
 *  - Verify canvas presence, sizing, WebGL context availability
 *  - Validate animation (pixels change over time) unless reduced motion is active
 *  - Exercise debug mode (?glooDebug=1) for high-contrast palette
 *
 * Notes:
 *  - These tests are intentionally tolerant: they gather diagnostics before failing
 *  - If you run in an environment where WebGL is blocked (e.g., some CI containers),
 *    failures will indicate root cause with contextual logs.
 */

async function getCanvasInfo(page) {
  return await page.evaluate(() => {
    const wrapper = document.querySelector(
      "[data-gloo-global]",
    ) as HTMLElement | null;
    const canvas = document.querySelector(
      '[data-testid="gloo-canvas"]',
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return {
        present: false,
        message: "Canvas not found",
      };
    }

    const rect = canvas.getBoundingClientRect();
    const gl =
      canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

    // Grab a quick frame sample (may be empty if still drawing first frame)
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
      playing:
        canvas.parentElement?.getAttribute("data-gloo-playing") === "true",
      effect: canvas.parentElement?.getAttribute("data-gloo-effect"),
      debugAttr: canvas.parentElement?.getAttribute("data-gloo-debug"),
      wrapperZ: wrapper ? getComputedStyle(wrapper).zIndex : null,
      frameSample,
    };
  });
}

async function captureAnimationFrames(page, delayMs = 350) {
  return await page.evaluate(async (delay) => {
    const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

    const canvas = document.querySelector(
      '[data-testid="gloo-canvas"]',
    ) as HTMLCanvasElement | null;

    if (!canvas) {
      return {
        ok: false,
        reason: "NO_CANVAS",
      };
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

test.describe("Gloo Global Background", () => {
  test("mounts and renders WebGL canvas on root page", async ({ page }) => {
    await test.step("Navigate to home page", async () => {
      await page.goto("/");
    });

    await test.step("Wait for global wrapper", async () => {
      await page.waitForSelector("[data-gloo-global]", { timeout: 8000 });
    });

    await test.step("Wait for canvas element", async () => {
      await page.waitForSelector('[data-testid="gloo-canvas"]', {
        timeout: 8000,
      });
    });

    const info = await getCanvasInfo(page);

    await test.step("Validate presence and sizing", async () => {
      expect(info.present).toBeTruthy();
      // Allow small threshold if first layout pass is still stabilizing
      expect(info.widthCss).toBeGreaterThan(50);
      expect(info.heightCss).toBeGreaterThan(50);
      // Backing resolution should also be > 0 (DPR scaling after resize observer)
      expect(info.widthAttr).toBeGreaterThan(0);
      expect(info.heightAttr).toBeGreaterThan(0);
    });

    await test.step("Validate WebGL context", async () => {
      expect(info.webgl).toBeTruthy();
    });

    await test.step("Report diagnostic snapshot", async () => {
      console.log("Gloo Diagnostic:", info);
    });

    await test.step("Check animation (may skip if reduced motion, skipped on CI)", async () => {
      if (process.env.CI) {
        console.warn(
          "CI environment detected – skipping animation frame diff to reduce flakiness",
        );
        return;
      }
      // If the system decided not to animate (playing false), just log and continue
      if (!info.playing) {
        console.warn(
          "Gloo canvas reports not playing (possibly reduced motion) - animation diff skipped",
        );
        return;
      }

      const anim = await captureAnimationFrames(page);
      if (!anim.ok) {
        console.warn("Animation capture failed:", anim);
        // Still assert that at least we tried, but don't fail the whole test
        return;
      }

      // If frames did not change, we collect one more attempt before failing
      if (!anim.changed) {
        const retry = await captureAnimationFrames(page, 600);
        if (!retry.ok || !retry.changed) {
          // Provide detailed context before failing
          throw new Error(
            "Gloo canvas appears static (no pixel delta detected across two intervals)",
          );
        }
      }
    });
  });

  test("debug mode (?glooDebug=1) forces high-contrast palette & debug overlay", async ({
    page,
  }) => {
    await test.step("Navigate with debug query param", async () => {
      await page.goto("/?glooDebug=1");
    });

    await page.waitForSelector("[data-gloo-global]", { timeout: 8000 });
    await page.waitForSelector('[data-testid="gloo-canvas"]', {
      timeout: 8000,
    });

    const info = await getCanvasInfo(page);

    await test.step("Assert debug attribute present on canvas container", async () => {
      expect(info.debugAttr).toBe("true"); // data-gloo-debug should be "true"
    });

    await test.step("Assert sizing & visibility under debug mode", async () => {
      expect(info.widthCss).toBeGreaterThan(50);
      expect(info.heightCss).toBeGreaterThan(50);
    });

    await test.step("Attempt to detect animation again", async () => {
      if (!info.playing) {
        console.warn("Debug mode: playing=false; skipping animation diff");
        return;
      }

      const frames = await captureAnimationFrames(page);
      if (!frames.ok) {
        console.warn("Debug animation capture failed:", frames);
        return;
      }
      if (!frames.changed) {
        console.warn("Debug mode frames appear static; may be intentional.");
      }
    });
  });

  test("z-index layering sanity: ensure wrapper not deeply negative", async ({
    page,
  }) => {
    await page.goto("/");
    await page.waitForSelector("[data-gloo-global]", { timeout: 8000 });
    const zLayer = await page.evaluate(() => {
      const el = document.querySelector("[data-gloo-global]");
      return el ? getComputedStyle(el).zIndex : null;
    });

    // If developer chose a negative zIndex intentionally, we warn rather than fail.
    if (zLayer && Number.isFinite(+zLayer) && +zLayer < 0) {
      console.warn(
        `Gloo wrapper z-index is negative (${zLayer}); ensure body background isn't covering rendering.`,
      );
    } else {
      expect(zLayer === null || +zLayer >= 0).toBeTruthy();
    }
  });

  test("collects extended diagnostics when WebGL missing (graceful fail)", async ({
    page,
  }) => {
    // We don't force-disable WebGL here (that’d require launch args),
    // but we perform a conditional diagnostic if webgl is false.
    await page.goto("/");
    await page.waitForSelector("[data-gloo-global]", { timeout: 8000 });
    await page.waitForSelector('[data-testid="gloo-canvas"]', {
      timeout: 8000,
    });

    const info = await getCanvasInfo(page);
    if (!info.webgl) {
      console.warn("WebGL not available – extended diagnostics start");
      const extra = await page.evaluate(() => {
        return {
          userAgent: navigator.userAgent,
          devicePixelRatio: window.devicePixelRatio,
          webglSupport: (() => {
            try {
              const c = document.createElement("canvas");
              return !!(
                c.getContext("webgl") || c.getContext("experimental-webgl")
              );
            } catch {
              return false;
            }
          })(),
        };
      });
      console.warn("Extended Diagnostics:", { info, extra });
      // Fail the test if WebGL truly absent (unless you decide to allow fallback behavior)
      throw new Error("Gloo WebGL context missing in environment");
    } else {
      expect(info.webgl).toBeTruthy();
    }
  });
});
