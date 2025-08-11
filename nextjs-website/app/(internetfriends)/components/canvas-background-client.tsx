"use client";
/**
 * canvas-background-client.tsx - Canvas-based Background Client
 *
 * Replaces WebGL Gloo with a simpler 2D canvas approach:
 * 1. Uses the same productive colors from InternetFriends.xyz
 * 2. Similar randomness and effect selection
 * 3. Much more stable across all browsers and devices
 * 4. No WebGL dependencies or Safari issues
 * 5. Maintains the same visual appeal with gradient animations
 *
 * Usage:
 * <CanvasBackgroundClient />
 * <CanvasBackgroundClient disabled={reducedMotion} />
 */

import React, {
  useRef,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import { useTheme } from "@/hooks/use-theme";
import { ClientOnly } from "../patterns/boundary-patterns";
import {
  getCanvasDebugOverrides,
  createCanvasContext,
  setupCanvasSize,
  CANVAS_DEFAULTS,
} from "./canvas-background-utils";

// InternetFriends brand colors (from productive version)
const BRAND_PALETTE_LIGHT = [
  "#ebe75c", // InternetFriends yellow
  "#df4843", // InternetFriends red
  "#eb40f0", // InternetFriends purple
];

const BRAND_PALETTE_DARK = [
  "#ffeb70", // Brighter yellow for dark mode
  "#ff5c57", // Brighter red for dark mode
  "#ff54ff", // Brighter purple for dark mode
];

// Canvas effect configurations (inspired by productive Gloo effects)
const CANVAS_EFFECTS = [
  {
    name: "flowing_gradient",
    render: (
      ctx: CanvasRenderingContext2D,
      time: number,
      colors: string[],
      width: number,
      height: number,
    ) => {
      const gradient = ctx.createRadialGradient(
        width * (0.5 + 0.3 * Math.sin(time * 0.0005)),
        height * (0.5 + 0.2 * Math.cos(time * 0.0007)),
        0,
        width * (0.5 + 0.3 * Math.sin(time * 0.0005)),
        height * (0.5 + 0.2 * Math.cos(time * 0.0007)),
        Math.max(width, height) * 0.8,
      );

      gradient.addColorStop(0, colors[0] + "40");
      gradient.addColorStop(0.5, colors[1] + "20");
      gradient.addColorStop(1, colors[2] + "10");

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    },
  },
  {
    name: "wave_pattern",
    render: (
      ctx: CanvasRenderingContext2D,
      time: number,
      colors: string[],
      width: number,
      height: number,
    ) => {
      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < 3; i++) {
        const gradient = ctx.createLinearGradient(0, 0, width, height);
        const offset = (time * 0.0003 + i * 2) % (Math.PI * 2);

        gradient.addColorStop(0, colors[i] + "30");
        gradient.addColorStop(0.5, colors[(i + 1) % 3] + "15");
        gradient.addColorStop(1, colors[(i + 2) % 3] + "08");

        ctx.fillStyle = gradient;
        ctx.transform(
          1,
          0,
          Math.sin(offset) * 0.1,
          1,
          Math.cos(offset) * 20,
          Math.sin(offset * 0.7) * 15,
        );
        ctx.fillRect(0, 0, width, height);
        ctx.resetTransform();
      }
    },
  },
  {
    name: "particle_field",
    render: (
      ctx: CanvasRenderingContext2D,
      time: number,
      colors: string[],
      width: number,
      height: number,
    ) => {
      ctx.clearRect(0, 0, width, height);

      const particleCount = Math.min(50, Math.floor((width * height) / 10000));

      for (let i = 0; i < particleCount; i++) {
        const seed = i * 12.345;
        const x =
          (width * ((seed % 1) + Math.sin(time * 0.0002 + seed) * 0.3)) % width;
        const y =
          (height * (((seed * 7) % 1) + Math.cos(time * 0.0003 + seed) * 0.2)) %
          height;
        const size = 2 + Math.sin(time * 0.001 + seed) * 3;
        const colorIndex =
          Math.floor((time * 0.0001 + seed) * colors.length) % colors.length;

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 4);
        gradient.addColorStop(0, colors[colorIndex] + "60");
        gradient.addColorStop(0.7, colors[colorIndex] + "20");
        gradient.addColorStop(1, colors[colorIndex] + "00");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, size * 4, 0, Math.PI * 2);
        ctx.fill();
      }
    },
  },
  {
    name: "geometric_flow",
    render: (
      ctx: CanvasRenderingContext2D,
      time: number,
      colors: string[],
      width: number,
      height: number,
    ) => {
      ctx.clearRect(0, 0, width, height);

      const gridSize = 60;
      const cols = Math.ceil(width / gridSize);
      const rows = Math.ceil(height / gridSize);

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const x = col * gridSize;
          const y = row * gridSize;
          const phase = time * 0.0005 + (col + row) * 0.5;
          const intensity = (Math.sin(phase) + 1) * 0.5;
          const colorIndex =
            Math.floor((col + row + time * 0.0001) * colors.length) %
            colors.length;

          const gradient = ctx.createLinearGradient(
            x,
            y,
            x + gridSize,
            y + gridSize,
          );
          gradient.addColorStop(
            0,
            colors[colorIndex] +
              Math.floor(intensity * 40)
                .toString(16)
                .padStart(2, "0"),
          );
          gradient.addColorStop(
            1,
            colors[(colorIndex + 1) % colors.length] + "10",
          );

          ctx.fillStyle = gradient;
          ctx.fillRect(x, y, gridSize, gridSize);
        }
      }
    },
  },
];

// Component interface
interface CanvasBackgroundClientProps {
  disabled?: boolean;
  zIndex?: number;
  className?: string;
  style?: React.CSSProperties;
  "data-testid"?: string;
  epicContext?: {
    epicName?: string;
    epicPhase?: "development" | "review" | "complete";
  };
}

export const CanvasBackgroundClient: React.FC<CanvasBackgroundClientProps> = ({
  disabled = false,
  zIndex = 0,
  className,
  style,
  "data-testid": testId = "canvas-background",
  epicContext,
}) => {
  const { isDark } = useTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const [fps, setFps] = useState(0);
  const frameCountRef = useRef(0);
  const lastTimeRef = useRef(0);

  // Get debug overrides with useMemo for stable reference
  const debugConfig = useMemo(() => {
    return typeof window !== "undefined" ? getCanvasDebugOverrides() : {};
  }, []);

  // Simple FPS calculation without class
  const updateFPS = useCallback(() => {
    if (typeof performance === "undefined") return 0;

    frameCountRef.current++;
    const currentTime = performance.now();

    if (lastTimeRef.current === 0) {
      lastTimeRef.current = currentTime;
      return 0;
    }

    const deltaTime = currentTime - lastTimeRef.current;

    if (deltaTime >= 1000) {
      const newFps = Math.round((frameCountRef.current * 1000) / deltaTime);
      setFps(newFps);
      frameCountRef.current = 0;
      lastTimeRef.current = currentTime;
      return newFps;
    }

    return fps;
  }, [fps]);

  // Once-on-mount effect selection (like productive Gloo)
  const [effectIndex] = useState(() => {
    if (debugConfig.effectIndex !== undefined) {
      console.log("🔍 Canvas Debug Effect Override:", debugConfig.effectIndex);
      return Math.max(
        0,
        Math.min(CANVAS_EFFECTS.length - 1, debugConfig.effectIndex),
      );
    }

    const randomIndex = Math.floor(Math.random() * CANVAS_EFFECTS.length);
    console.log(
      "🎲 Canvas Random Effect Selected:",
      randomIndex,
      "/",
      CANVAS_EFFECTS.length,
    );
    return randomIndex;
  });

  // Respect reduced motion preference
  const [shouldAnimate, setShouldAnimate] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setShouldAnimate(!mediaQuery.matches);

    handleChange();
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // Get current brand colors with debug overrides
  const colors =
    debugConfig.colors || (isDark ? BRAND_PALETTE_DARK : BRAND_PALETTE_LIGHT);
  const currentEffect = CANVAS_EFFECTS[effectIndex];
  const speedMultiplier = debugConfig.speed || CANVAS_DEFAULTS.speed;

  // Canvas animation loop
  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !shouldAnimate) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const now = Date.now();
    const elapsed = (now - startTimeRef.current) * speedMultiplier;

    // Update FPS counter
    const currentFps = updateFPS();

    // Clear canvas with proper alpha handling
    ctx.clearRect(
      0,
      0,
      canvas.width / (window.devicePixelRatio || 1),
      canvas.height / (window.devicePixelRatio || 1),
    );

    // Render current effect
    currentEffect.render(
      ctx,
      elapsed,
      colors,
      canvas.width / (window.devicePixelRatio || 1),
      canvas.height / (window.devicePixelRatio || 1),
    );

    // Debug FPS display
    if (debugConfig.showFps && process.env.NODE_ENV === "development") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.font = "12px monospace";
      ctx.fillText(`FPS: ${currentFps}`, 10, 25);
    }

    animationFrameRef.current = requestAnimationFrame(animate);
  }, [
    currentEffect,
    colors,
    shouldAnimate,
    speedMultiplier,
    debugConfig.showFps,
    updateFPS,
  ]);

  // Setup canvas and start animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || disabled) return;

    const ctx = createCanvasContext(canvas);
    if (!ctx) return;

    // Setup canvas size with utilities
    const updateSize = () => {
      setupCanvasSize(canvas, ctx);
    };

    updateSize();

    // Start animation
    startTimeRef.current = Date.now();
    animate();

    // Handle resize
    const handleResize = () => {
      updateSize();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [animate, disabled]);

  // Debug logging
  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      console.log("🎨 Canvas Background Configuration:", {
        theme: isDark ? "dark" : "light",
        colors,
        effectIndex,
        effectName: currentEffect.name,
        shouldAnimate,
        speedMultiplier,
        debugConfig,
        epicName: epicContext?.epicName,
      });
    }
  }, [
    isDark,
    colors,
    effectIndex,
    currentEffect.name,
    shouldAnimate,
    speedMultiplier,
    debugConfig,
    epicContext?.epicName,
  ]);

  if (disabled) return null;

  return (
    <ClientOnly
      config={{
        fallback: null,
        debug: process.env.NODE_ENV === "development",
        epicContext: epicContext
          ? {
              epicName: epicContext.epicName || "unknown",
              epicPhase: epicContext.epicPhase || "development",
            }
          : undefined,
      }}
    >
      <div
        className={[
          "canvas-background-client",
          "fixed inset-0 pointer-events-none select-none",
          className || "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          zIndex,
          isolation: "isolate",
          willChange: shouldAnimate ? "transform" : "auto",
          width: "100vw",
          height: "100vh",
          minWidth: "100vw",
          minHeight: "100vh",
          overflow: "hidden",
          ...style,
        }}
        data-testid={testId}
        data-canvas-client="true"
        data-canvas-effect-index={effectIndex}
        data-canvas-theme={isDark ? "dark" : "light"}
        data-epic={epicContext?.epicName}
        data-epic-phase={epicContext?.epicPhase}
      >
        <canvas
          ref={canvasRef}
          style={{
            width: "100%",
            height: "100%",
            display: "block",
            opacity: shouldAnimate ? 1 : 0.5,
          }}
        />

        {/* Development debug info */}
        {process.env.NODE_ENV === "development" && (
          <div
            className="absolute top-4 right-4 z-50 pointer-events-none"
            style={{
              fontSize: "10px",
              fontFamily: "ui-monospace, monospace",
              background: "rgba(59, 130, 246, 0.9)",
              color: "white",
              padding: "0.5rem",
              borderRadius: "4px",
              border: "1px solid rgba(147, 197, 253, 0.3)",
            }}
          >
            <div className="font-semibold mb-1">🎨 Canvas Background</div>
            <div>
              Effect: {effectIndex + 1}/{CANVAS_EFFECTS.length}
            </div>
            <div>Name: {currentEffect.name}</div>
            <div>Theme: {isDark ? "dark" : "light"}</div>
            <div>Motion: {shouldAnimate ? "enabled" : "reduced"}</div>
            <div>Speed: {speedMultiplier}x</div>
            <div>Colors: {colors.join(", ")}</div>
            {debugConfig.showFps && <div>FPS: {fps}</div>}
            <div className="mt-1 pt-1 border-t border-blue-300/30">
              <div>Epic: {epicContext?.epicName || "unknown"}</div>
              <div>Phase: {epicContext?.epicPhase || "development"}</div>
            </div>
          </div>
        )}

        {/* Canvas status indicator */}
        <div
          className="absolute top-4 left-4 z-40 pointer-events-none"
          style={{
            fontSize: "12px",
            fontFamily: "ui-monospace, monospace",
            background: "rgba(34, 197, 94, 0.8)",
            color: "white",
            padding: "0.5rem",
            borderRadius: "4px",
            display: process.env.NODE_ENV === "development" ? "block" : "none",
          }}
        >
          🎨 InternetFriends Canvas Active
          <br />
          Effect: {currentEffect.name} #{effectIndex}
          <br />
          Colors: {colors[0]}
        </div>
      </div>
    </ClientOnly>
  );
};

export default CanvasBackgroundClient;
