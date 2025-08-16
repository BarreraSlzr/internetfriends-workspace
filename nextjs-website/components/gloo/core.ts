"use client";
/**
 * gloo-core.ts
 * Core, framework-agnostic WebGL hook powering the BgGoo (and other) ambient effects.
 *
 * Goals:
 *  - Provide a thin, reliable, testable WebGL layer (compile / link / render / recompile / dispose)
 *  - Decouple shader authoring (fragment/effect sources) from React component concerns
 *  - Allow dynamic + static uniform management (time, resolution, user params)
 *  - Support effect hot-swapping (recompile) without remounting the canvas
 *  - Offer predictable cleanup for shaders, program, and buffers
 *  - Enhanced WebGL debugging and error reporting
 *
 * NOT responsible for:
 *  - Color / variant taxonomy decisions
 *  - Theme adaptation
 *  - Random effect selection logic
 *  - Motion reduction policy (consumer decides whether to play)
 *
 * Usage (minimal):
 *  const { canvasRef } = useGlooWebGL({
 *    fragment: myFragmentSource,
 *    dynamicUniforms: ({ time, gl, canvas }) => ({
 *      iTime: time,
 *      iResolution: [canvas.width, canvas.height],
 *    })
 *  });
 *  return <canvas ref={canvasRef} className="w-full h-full" />;
 *
 * Advanced (effect injection):
 *  const fragment = FRAGMENT_TEMPLATE.replace("__EFFECT__", effectFnSource);
 *  useGlooWebGL({ fragment, effectKey: effectFnSource });
 *
 * Conventions:
 *  - We use a single fullscreen quad (two triangles) with an attribute 'a_position'
 *  - All uniform names are user-defined; hook resolves location lazily and caches
 *  - Dynamic uniforms override static ones each frame
 *
 * Safety:
 *  - On every recompile we fully rebuild and delete the old program & shaders
 *  - We guard against rapid successive recompiles with a small deferral window (RAF boundary)
 */

import { useRef, useState, useEffect, useCallback, RefObject } from "react";

/* ---------------------------------------------
 * WebGL Debug Utilities
 * ------------------------------------------- */

export const GlooDebugUtils = {
  checkWebGLSupport: (): boolean => {
    if (typeof window === "undefined") return false;
    try {
      const canvas = document.createElement("canvas");
      return !!(
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl")
      );
    } catch {
      return false;
    }
  },

  logWebGLInfo: (gl: WebGLRenderingContext): void => {
    console.group("🔍 WebGL Context Info");
    console.log("Vendor:", gl.getParameter(gl.VENDOR));
    console.log("Renderer:", gl.getParameter(gl.RENDERER));
    console.log("WebGL Version:", gl.getParameter(gl.VERSION));
    console.log("GLSL Version:", gl.getParameter(gl.SHADING_LANGUAGE_VERSION));
    console.log("Max Texture Size:", gl.getParameter(gl.MAX_TEXTURE_SIZE));
    console.log("Max Viewport Dims:", gl.getParameter(gl.MAX_VIEWPORT_DIMS));
    console.groupEnd();
  },

  validateShader: (
    gl: WebGLRenderingContext,
    source: string,
    type: number,
  ): string | null => {
    const shader = gl.createShader(type);
    if (!shader) return "Failed to create shader";

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader) || "Unknown shader error";
      gl.deleteShader(shader);
      return info;
    }

    gl.deleteShader(shader);
    return null;
  },
  checkCanvasVisibility: (
    canvas: HTMLCanvasElement,
  ): {
    visible: boolean;
    issues: string[];
    debug: Record<string, unknown>;
  } => {
    const issues: string[] = [];
    const rect = canvas.getBoundingClientRect();
    const style = getComputedStyle(canvas);

    if (rect.width === 0 || rect.height === 0) {
      issues.push("Canvas has zero dimensions");
    }

    if (style.display === "none") {
      issues.push("Canvas display is none");
    }

    if (style.visibility === "hidden") {
      issues.push("Canvas visibility is hidden");
    }

    if (parseFloat(style.opacity) === 0) {
      issues.push("Canvas opacity is 0");
    }

    const zIndex = parseInt(style.zIndex);
    if (zIndex < -100) {
      issues.push(`Canvas z-index is very low: ${zIndex}`);
    }

    // Check for covering elements
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const topElement = document.elementFromPoint(centerX, centerY);
    const isCovered = topElement && topElement !== canvas;

    if (isCovered) {
      issues.push(`Canvas covered by: ${topElement.tagName.toLowerCase()}`);
    }

    return {
      visible: issues.length === 0,
      issues,
      debug: {
        rect: { width: rect.width, height: rect.height },
        style: {
          display: style.display,
          visibility: style.visibility,
          opacity: style.opacity,
          zIndex: style.zIndex,
          position: style.position,
        },
        topElement: topElement?.tagName || "canvas",
        isCovered,
      },
    };
  },

  captureFrame: (canvas: HTMLCanvasElement): string | null => {
    try {
      return canvas.toDataURL();
    } catch {
      return null;
    }
  },

  diagnoseGlooSystem: (): void => {
    console.group("🔍 Gloo System Diagnosis");

    // Check basic WebGL support
    const webglSupported = GlooDebugUtils.checkWebGLSupport();
    console.log("WebGL Support:", webglSupported ? "✅" : "❌");

    // Check canvas presence
    const canvas = document.querySelector(
      '[data-testid="gloo-canvas"]',
    ) as HTMLCanvasElement;
    console.log("Canvas Found:", canvas ? "✅" : "❌");

    if (canvas) {
      // Canvas visibility analysis
      const visibility = GlooDebugUtils.checkCanvasVisibility(canvas);
      console.log("Canvas Visible:", visibility.visible ? "✅" : "❌");
      if (visibility.issues.length > 0) {
        console.warn("Visibility Issues:", visibility.issues);
      }
      console.log("Canvas Debug Info:", visibility.debug);

      // WebGL context test
      const gl =
        canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      console.log("WebGL Context:", gl ? "✅" : "❌");

      if (gl) {
        GlooDebugUtils.logWebGLInfo(gl as WebGLRenderingContext);

        // Check for active program
        const webglContext = gl as WebGLRenderingContext;
        const currentProgram = webglContext.getParameter(
          webglContext.CURRENT_PROGRAM,
        );
        console.log("Active Program:", currentProgram ? "✅" : "❌");
      }
    }

    // Check global wrapper
    const wrapper = document.querySelector("[data-gloo-global]");
    if (wrapper) {
      const wrapperStyle = getComputedStyle(wrapper);
      console.log("Global Wrapper Debug:", {
        position: wrapperStyle.position,
        zIndex: wrapperStyle.zIndex,
        display: wrapperStyle.display,
        theme: wrapper.getAttribute("data-gloo-theme"),
        playing: wrapper.querySelector('[data-gloo-playing="true"]')
          ? "✅"
          : "❌",
      });
    }

    // Debug mode detection
    const isDebugMode = new URLSearchParams(window.location.search).has(
      "glooDebug",
    );
    console.log(
      "Debug Mode Active:",
      isDebugMode ? "✅" : "❌ (add ?glooDebug=1 to URL)",
    );

    console.groupEnd();
  },
};

/* ---------------------------------------------
 * Types
 * ------------------------------------------- */

export type GlooUniformValue = number | number[];
type Numeric = GlooUniformValue;

export interface GlooWebGLContext {
  time: number;
  dt: number;
  frame: number;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  canvas: HTMLCanvasElement;
}

export interface UseGlooWebGLOptions {
  /**
   * Full fragment shader source including precision + main().
   * If you want to inject an effect snippet, do that before passing it here.
   */
  fragment: string;

  /**
   * Optional key (any serializable) that forces program recompile when changed.
   * Typically the GLSL effect snippet or hash of configuration.
   */
  effectKey?: unknown;

  /**
   * Whether animation loop should run. Can be toggled externally.
   * Defaults to true.
   */
  playing?: boolean;

  /**
   * Automatically resize the underlying <canvas> when its client rect changes.
   * Defaults to true.
   */
  autoResize?: boolean;

  /**
   * Desired device pixel ratio multiplier. If unset, uses window.devicePixelRatio (clamped).
   */
  dpr?: number;

  /**
   * Preserve drawing buffer (needed if you plan to snapshot the canvas).
   * Slight perf cost if true.
   */
  preserveDrawingBuffer?: boolean;

  /**
   * Called once after a program is successfully linked & made current.
   */
  onInit?: (gl: WebGLRenderingContext, program: WebGLProgram) => void;

  /**
   * Called on fatal compilation / link errors.
   */
  onError?: (message: string) => void;

  /**
   * Static (mostly constant) uniforms; applied every frame AFTER dynamicUniforms.
   * Use numbers or arrays (up to length 4 supported for vec[234]).
   */
  staticUniforms?: Record<string, Numeric>;

  /**
   * Dynamic uniform provider invoked every frame before draw.
   * Return an object mapping uniform name -> value (number | vec2 | vec3 | vec4).
   * These override static uniforms for that frame.
   */
  dynamicUniforms?: (ctx: GlooWebGLContext) => Record<string, Numeric> | void;

  /**
   * Override vertex shader (only needed for advanced pipelines). Must expose 'a_position'.
   */
  vertexShader?: string;

  /**
   * Optional toggle to clear each frame (default true). Set false if you want accumulation
   * for certain feedback effects (then likely you need custom blending logic).
   */
  clearEachFrame?: boolean;

  /**
   * Clear color (default transparent).
   */
  clearColor?: [number, number, number, number];
}

export interface UseGlooWebGLReturn {
  canvasRef: RefObject<HTMLCanvasElement | null>;
  gl: WebGLRenderingContext | null;
  program: WebGLProgram | null;
  isReady: boolean;
  error: string | null;
  /**
   * Imperatively pause/resume animation.
   */
  setPlaying: (playing: boolean) => void;
  /**
   * Update or add a static uniform (applied every frame unless overridden dynamically).
   */
  updateStaticUniform: (name: string, value: Numeric) => void;
  /**
   * Force a manual recompile (e.g., after external mutation of fragment outside React change detection).
   */
  recompile: () => void;
  /**
   * Dispose program & cancel animation (idempotent). Canvas remains, but drawing stops.
   */
  dispose: () => void;
}

/* ---------------------------------------------
 * Default Shaders
 * ------------------------------------------- */

const DEFAULT_VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = (a_position + 1.0) * 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`.trim();

/* ---------------------------------------------
 * Utility: Uniform Setter
 * ------------------------------------------- */
function applyUniform(
  gl: WebGLRenderingContext,
  location: WebGLUniformLocation | null,
  value: Numeric,
) {
  if (!location) return;
  if (typeof value === "number") {
    gl.uniform1f(location, value);
    return;
  }
  switch (value.length) {
    case 1:
      gl.uniform1f(location, value[0]);
      break;
    case 2:
      gl.uniform2f(location, value[0], value[1]);
      break;
    case 3:
      gl.uniform3f(location, value[0], value[1], value[2]);
      break;
    case 4:
      gl.uniform4f(location, value[0], value[1], value[2], value[3]);
      break;
    default:
      // Silent ignore for incompatible sizes (we keep this lean;
      // caller should validate their uniform lengths)
      break;
  }
}

/* ---------------------------------------------
 * Hook
 * ------------------------------------------- */
export function useGlooWebGL(options: UseGlooWebGLOptions): UseGlooWebGLReturn {
  const {
    fragment,
    vertexShader = DEFAULT_VERTEX_SHADER,
    effectKey,
    playing: externalPlaying = true,
    autoResize = true,
    dpr,
    preserveDrawingBuffer = false,
    onInit,
    onError,
    staticUniforms = {},
    dynamicUniforms,
    clearEachFrame = true,
    clearColor = [0, 0, 0, 0],
  } = options;

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const frameRef = useRef<number>(0);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(performance.now());
  const lastTimeRef = useRef<number>(performance.now());
  const uniformLocationCacheRef = useRef<
    Record<string, WebGLUniformLocation | null>
  >({});
  const staticUniformsRef = useRef<Record<string, Numeric>>({
    ...staticUniforms,
  });

  const fragmentRef = useRef(fragment);
  // Removed unused vertexRef (vertex shader source tracked via dependency)
  const effectKeyRef = useRef(effectKey);

  const disposedRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [playing, setPlaying] = useState(externalPlaying);
  const [error, setError] = useState<string | null>(null);

  // Keep external prop-controlled playing state in sync
  useEffect(() => {
    setPlaying(externalPlaying);
  }, [externalPlaying]);

  // Resize handling (device pixel ratio + element size)
  useEffect(() => {
    if (!autoResize) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const pixelRatio = dpr || window.devicePixelRatio || 1;
      const targetW = Math.max(1, Math.floor(rect.width * pixelRatio));
      const targetH = Math.max(1, Math.floor(rect.height * pixelRatio));

      if (canvas.width !== targetW || canvas.height !== targetH) {
        canvas.width = targetW;
        canvas.height = targetH;
      }
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("resize", resize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [autoResize, dpr]);

  /* -----------------------------------------
   * Compilation / Program Lifecycle
   * --------------------------------------- */

  const dispose = useCallback(() => {
    disposedRef.current = true;
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    const gl = glRef.current;
    const program = programRef.current;
    if (gl && program) {
      // Attempt to detach & delete attached shaders
      const attachedShaders = gl.getAttachedShaders
        ? gl.getAttachedShaders(program) || []
        : [];
      attachedShaders.forEach((shader) => {
        gl.detachShader(program, shader);
        gl.deleteShader(shader);
      });
      gl.deleteProgram(program);
    }
    programRef.current = null;
    glRef.current = null;
    uniformLocationCacheRef.current = {};
    setIsReady(false);
  }, []);

  const compileAndLink = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setError("Canvas not mounted");
      return;
    }

    // If previously disposed, allow re-init
    disposedRef.current = false;
    setError(null);

    const gl =
      glRef.current ||
      canvas.getContext("webgl", { preserveDrawingBuffer }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      const msg = "WebGL context not available";
      setError(msg);
      onError?.(msg);
      return;
    }

    glRef.current = gl;

    // Helper to build shader
    const buildShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) throw new Error("Failed to create shader");
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader) || "Unknown shader error";
        gl.deleteShader(shader);
        throw new Error(info);
      }
      return shader;
    };

    let program: WebGLProgram | null = null;
    try {
      // Enhanced shader validation in development
      if (process.env.NODE_ENV === "development") {
        const vertError = GlooDebugUtils.validateShader(
          gl,
          vertexShader,
          gl.VERTEX_SHADER,
        );
        if (vertError) {
          console.error("🚨 Vertex shader validation failed:", vertError);
        }

        const fragError = GlooDebugUtils.validateShader(
          gl,
          fragment,
          gl.FRAGMENT_SHADER,
        );
        if (fragError) {
          console.error("🚨 Fragment shader validation failed:", fragError);
          console.log("Fragment source preview:", fragment.substring(0, 500));
        }
      }

      const vert = buildShader(gl.VERTEX_SHADER, vertexShader);
      const frag = buildShader(gl.FRAGMENT_SHADER, fragment);

      program = gl.createProgram();
      if (!program) throw new Error("Failed to create program");

      gl.attachShader(program, vert);
      gl.attachShader(program, frag);
      gl.linkProgram(program);

      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        const info = gl.getProgramInfoLog(program) || "Unknown link error";
        gl.deleteProgram(program);
        gl.deleteShader(vert);
        gl.deleteShader(frag);
        throw new Error(info);
      }

      // Clean up previous program
      if (programRef.current) {
        const old = programRef.current;
        const attachedOld = gl.getAttachedShaders?.(old) || [];
        attachedOld.forEach((s) => {
          gl.detachShader(old, s);
          gl.deleteShader(s);
        });
        gl.deleteProgram(old);
      }

      programRef.current = program;
      uniformLocationCacheRef.current = {}; // Reset uniform cache
      gl.useProgram(program);

      // Fullscreen quad
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
      gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

      const positionLoc = gl.getAttribLocation(program, "a_position");
      if (positionLoc !== -1) {
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);
      }

      onInit?.(gl, program);

      // Enhanced debugging on successful initialization
      if (process.env.NODE_ENV === "development") {
        GlooDebugUtils.logWebGLInfo(gl);
        const canvas = canvasRef.current!;
        const visibility = GlooDebugUtils.checkCanvasVisibility(canvas);
        if (!visibility.visible) {
          console.warn("🔍 Canvas visibility issues:", visibility.issues);
          console.log("🔧 Canvas debug info:", visibility.debug);
        }
        console.log("✅ Gloo WebGL initialized successfully");

        // Make diagnosis available globally in development
        if (typeof window !== "undefined") {
          (
            window as Window & {
              GlooDebug?: typeof GlooDebugUtils.diagnoseGlooSystem;
            }
          ).GlooDebug = GlooDebugUtils.diagnoseGlooSystem;
        }
      }

      setIsReady(true);
    } catch (e: unknown) {
      const errMsg = e instanceof Error ? e.message : String(e);
      const msg = `[gloo-core] ${errMsg}`;

      // Enhanced error reporting
      if (process.env.NODE_ENV === "development") {
        console.group("🚨 Gloo WebGL Error");
        console.error("Error:", errMsg);
        console.log("Fragment shader length:", fragment.length);
        console.log("Fragment preview:", fragment.substring(0, 200) + "...");
        console.log("WebGL support:", GlooDebugUtils.checkWebGLSupport());
        if (canvasRef.current) {
          const visibility = GlooDebugUtils.checkCanvasVisibility(
            canvasRef.current,
          );
          console.log(
            "Canvas visibility:",
            visibility.visible ? "OK" : "ISSUE",
          );
          if (!visibility.visible) {
            console.warn("Visibility issues:", visibility.issues);
            console.log("Debug details:", visibility.debug);
          }
        }

        // Suggest recovery actions
        console.log("🔧 Recovery suggestions:");
        console.log("1. Try: GlooDebug() in console");
        console.log("2. Add: ?glooDebug=1 to URL");
        console.log("3. Check browser WebGL: chrome://gpu/");

        console.groupEnd();
      }

      setError(msg);
      onError?.(msg);
      return;
    }
  }, [fragment, vertexShader, onInit, onError, preserveDrawingBuffer]);

  // Recompile trigger
  const recompile = useCallback(() => {
    compileAndLink();
  }, [compileAndLink]);

  // Recompile when fragment / effectKey changes
  useEffect(() => {
    const fragmentChanged = fragmentRef.current !== fragment;
    const effectChanged = effectKeyRef.current !== effectKey;
    if (fragmentChanged || effectChanged) {
      fragmentRef.current = fragment;
      effectKeyRef.current = effectKey;
      recompile();
    }
  }, [fragment, effectKey, recompile]);

  // Initial compile
  useEffect(() => {
    compileAndLink();
    return () => {
      dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // compile once at mount (subsequent changes handled by fragment/effectKey effect)

  /* -----------------------------------------
   * Frame Loop
   * --------------------------------------- */
  useEffect(() => {
    if (!playing || !isReady || disposedRef.current) {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      return;
    }

    const gl = glRef.current;
    const program = programRef.current;
    if (!gl || !program) return;

    const loop = () => {
      if (disposedRef.current) return;
      const now = performance.now();
      const elapsed = (now - startTimeRef.current) * 0.001;
      const dt = (now - lastTimeRef.current) * 0.001;
      lastTimeRef.current = now;

      // Set viewport each frame in case of resize
      const canvas = canvasRef.current!;
      gl.viewport(0, 0, canvas.width, canvas.height);

      if (clearEachFrame) {
        const [r, g, b, a] = clearColor;
        gl.clearColor(r, g, b, a);
        gl.clear(gl.COLOR_BUFFER_BIT);
      }

      // Uniform merging order: static -> dynamic (dynamic overrides)
      const dyn =
        (dynamicUniforms &&
          dynamicUniforms({
            time: elapsed,
            dt,
            frame: frameRef.current,
            gl,
            program,
            canvas,
          })) ||
        {};

      const merged: Record<string, Numeric> = {
        ...staticUniformsRef.current,
        ...dyn,
      };

      // Apply uniforms
      for (const [key, val] of Object.entries(merged)) {
        if (val == null) continue;
        let loc = uniformLocationCacheRef.current[key];
        if (loc === undefined) {
          loc = gl.getUniformLocation(program, key);
          uniformLocationCacheRef.current[key] = loc;
        }
        applyUniform(gl, loc, val);
      }

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      frameRef.current += 1;
      rafIdRef.current = requestAnimationFrame(loop);
    };

    rafIdRef.current = requestAnimationFrame(loop);
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
    };
  }, [playing, isReady, dynamicUniforms, clearEachFrame, clearColor]);

  /* -----------------------------------------
   * Public API Helpers
   * --------------------------------------- */
  const updateStaticUniform = useCallback(
    (name: string, value: GlooUniformValue) => {
      staticUniformsRef.current[name] = value;
    },
    [],
  );

  return {
    canvasRef,
    gl: glRef.current,
    program: programRef.current,
    isReady,
    error,
    setPlaying,
    updateStaticUniform,
    recompile,
    dispose,
  };
}
