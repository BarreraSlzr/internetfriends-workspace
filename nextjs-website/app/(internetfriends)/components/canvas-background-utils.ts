/**
 * canvas-background-utils.ts - Canvas Background Utilities
 *
 * Utilities for canvas-based background debugging, URL parameter handling,
 * and browser compatibility checks. Replaces WebGL-specific utilities
 * with canvas-focused helpers.
 */

// Canvas effect configurations type
export interface CanvasEffect {
  name: string;
  render: (
    ctx: CanvasRenderingContext2D,
    time: number,
    colors: string[],
    width: number,
    height: number,
  ) => void;
}

// Debug configuration interface
export interface CanvasDebugConfig {
  effectIndex?: number;
  showFps?: boolean;
  showInfo?: boolean;
  colors?: string[];
  speed?: number;
}

// URL parameter parsing for canvas debugging
export function getCanvasDebugOverrides(): CanvasDebugConfig {
  if (typeof window === "undefined") return {};

  const params = new URLSearchParams(window.location.search);

  const overrides: CanvasDebugConfig = {};

  // Effect selection override
  if (params.has("canvasEffect")) {
    const effectIndex = parseInt(params.get("canvasEffect")!) || 0;
    overrides.effectIndex = Math.max(0, effectIndex);
  }

  // Debug info display
  if (params.has("canvasDebug")) {
    overrides.showInfo = true;
  }

  // FPS counter
  if (params.has("canvasFps")) {
    overrides.showFps = true;
  }

  // Custom colors (comma-separated hex values)
  if (params.has("canvasColors")) {
    const colorString = params.get("canvasColors")!;
    const colors = colorString
      .split(",")
      .map((c) => c.trim())
      .filter((c) => c.match(/^#[0-9a-fA-F]{6}$/));
    if (colors.length > 0) {
      overrides.colors = colors;
    }
  }

  // Animation speed multiplier
  if (params.has("canvasSpeed")) {
    const speed = parseFloat(params.get("canvasSpeed")!) || 1;
    overrides.speed = Math.max(0.1, Math.min(5, speed));
  }

  return overrides;
}

// Canvas context creation with error handling
export function createCanvasContext(
  canvas: HTMLCanvasElement,
): CanvasRenderingContext2D | null {
  try {
    const ctx = canvas.getContext("2d", {
      alpha: true,
      willReadFrequently: false,
    });

    if (!ctx) {
      console.warn("⚠️ Canvas 2D context not available");
      return null;
    }

    // Enable smooth rendering
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    return ctx;
  } catch (error) {
    console.error("❌ Failed to create canvas context:", error);
    return null;
  }
}

// Canvas size management with device pixel ratio
export function setupCanvasSize(
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
): void {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;

  // Set actual canvas size
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;

  // Scale context to handle high-DPI displays
  ctx.scale(dpr, dpr);

  // Set CSS size
  canvas.style.width = rect.width + "px";
  canvas.style.height = rect.height + "px";
}

// Color utility functions
export const canvasColorUtils = {
  // Convert hex to rgba with alpha
  hexToRgba: (hex: string, alpha: number = 1): string => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0, 0, 0, ${alpha})`;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  },

  // Add alpha channel to hex color
  hexWithAlpha: (hex: string, alpha: string): string => {
    return hex + alpha;
  },

  // Create gradient color stops from colors array
  createGradientStops: (
    colors: string[],
    alphas: number[] = [],
  ): Array<{ stop: number; color: string }> => {
    return colors.map((color, i) => ({
      stop: i / (colors.length - 1),
      color: canvasColorUtils.hexToRgba(color, alphas[i] || 1),
    }));
  },
};

// Performance monitoring for canvas animations
export class CanvasPerformanceMonitor {
  private frameCount = 0;
  private lastTime = 0;
  private fps = 0;
  private initialized = false;

  constructor() {
    if (typeof performance !== "undefined") {
      this.lastTime = performance.now();
      this.initialized = true;
    }
  }

  updateFPS(): number {
    if (!this.initialized || typeof performance === "undefined") {
      return 0;
    }

    this.frameCount++;
    const currentTime = performance.now();
    const deltaTime = currentTime - this.lastTime;

    if (deltaTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / deltaTime);
      this.frameCount = 0;
      this.lastTime = currentTime;
    }

    return this.fps;
  }

  getFPS(): number {
    return this.fps;
  }
}

// Canvas background configuration defaults
export const CANVAS_DEFAULTS = {
  speed: 1.0,
  opacity: 1.0,
  quality: "high" as "high" | "medium" | "low",
  reducedMotionOpacity: 0.5,
} as const;
