/**
 * types.ts - Gloo System Type Definitions
 * Epic-aware WebGL background system for InternetFriends
 */

export type GlooPaletteStrategy =
  | "brand-triad"
  | "analogous"
  | "seeded-random"
  | "primary-accent"
  | "soft-glass"
  | "monochrome"
  | "complementary";

export type GlooThemeMode = "light" | "dark";

export type GlooEffectName =
  | "default"
  | "spiral"
  | "wave"
  | "vortex"
  | "pulse"
  | "ripple"
  | "twist"
  | "oscillate"
  | "fractal"
  | "swirl"
  | "bounce";

export interface GlooPaletteOptions {
  mode: GlooThemeMode;
  strategy?: GlooPaletteStrategy;
  seed?: number;
  anchorColor?: string;
  coreColors?: string[];
  saturationBoost?: number;
  lightnessShift?: number;
}

export interface GlooPalette {
  colors: [string, string, string];
  strategy: GlooPaletteStrategy;
  mode: GlooThemeMode;
  metadata: {
    seed?: number;
    anchor?: string;
    generated: boolean;
  };
}

export interface GlooWebGLContext {
  time: number;
  dt: number;
  frame: number;
  gl: WebGLRenderingContext;
  program: WebGLProgram;
  canvas: HTMLCanvasElement;
}

export type GlooUniformValue = number | number[];

export interface GlooWebGLOptions {
  fragment: string;
  effectKey?: unknown;
  playing?: boolean;
  autoResize?: boolean;
  dpr?: number;
  preserveDrawingBuffer?: boolean;
  onInit?: (gl: WebGLRenderingContext, program: WebGLProgram) => void;
  onError?: (message: string) => void;
  staticUniforms?: Record<string, GlooUniformValue>;
  dynamicUniforms?: (
    ctx: GlooWebGLContext,
  ) => Record<string, GlooUniformValue> | void;
  vertexShader?: string;
  clearEachFrame?: boolean;
  clearColor?: [number, number, number, number];
}

export interface GlooWebGLHookReturn {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  gl: WebGLRenderingContext | null;
  program: WebGLProgram | null;
  isReady: boolean;
  error: string | null;
  setPlaying: (playing: boolean) => void;
  updateStaticUniform: (name: string, value: GlooUniformValue) => void;
  recompile: () => void;
  dispose: () => void;
}

export interface GlooCanvasProps {
  speed?: number;
  resolution?: number;
  depth?: number;
  seed?: number;
  still?: boolean;
  tint?: [number, number, number];
  color1?: [number, number, number];
  color2?: [number, number, number];
  color3?: [number, number, number];
  colors?: string[];
  palette?: GlooPalette;
  effectIndex?: number;
  effectName?: GlooEffectName;
  width?: number;
  height?: number;
  className?: string;
  style?: React.CSSProperties;
  animate?: boolean;
  preserveDrawingBuffer?: boolean;
  disabled?: boolean;
  reducedMotion?: boolean;
  onError?: (err: string) => void;
  onEffectChange?: (effectIndex: number, effectName: GlooEffectName) => void;
}

export interface GlooGlobalProps
  extends Omit<GlooCanvasProps, "palette" | "colors"> {
  paletteStrategy?: GlooPaletteStrategy;
  paletteLight?: string[];
  paletteDark?: string[];
  palette?: string[];
  anchorToPrimary?: boolean;
  autoRegeneratePalette?: boolean;
  paletteRegenerateMs?: number;
  absolute?: boolean;
  zIndex?: number;
  epicContext?: {
    epicName?: string;
    epicPhase?: "development" | "review" | "complete";
    epicMetrics?: {
      performance?: GlooPerformanceMetrics;
      userEngagement?: {
        viewTime: number;
        interactions: number;
      };
      visualImpact?: {
        paletteChanges: number;
        effectCycles: number;
      };
    };
  };
}

export interface GlooDebugInfo {
  effectIndex: number;
  effectName: GlooEffectName;
  palette: GlooPalette;
  performance: {
    fps: number;
    frameTime: number;
    lastRender: number;
  };
  webgl: {
    context: boolean;
    program: boolean;
    uniforms: Record<string, unknown>;
  };
  canvas: {
    width: number;
    height: number;
    dpr: number;
  };
}

export interface GlooEffect {
  name: GlooEffectName;
  source: string;
  displayName: string;
  description?: string;
  recommendedSpeed?: number;
  recommendedDepth?: number;
}

export interface GlooPerformanceMetrics {
  avgFps: number;
  minFps: number;
  maxFps: number;
  frameTimeMs: number;
  dropped: number;
  total: number;
}

// Epic-specific interfaces
export interface EpicGlooContext {
  epicName?: string;
  epicPhase?: "development" | "review" | "complete";
  epicProgress?: number;
  epicMetrics?: {
    performance?: GlooPerformanceMetrics;
    userEngagement?: {
      viewTime: number;
      interactions: number;
    };
    visualImpact?: {
      paletteChanges: number;
      effectCycles: number;
    };
  };
}

// Utility types
export type GlooColorTuple = [number, number, number];
export type GlooColorHex = string;
export type GlooColorArray = string[];

export interface GlooColorUtils {
  hexToRgb: (hex: string) => { r: number; g: number; b: number } | null;
  rgbToHex: (r: number, g: number, b: number) => string;
  hexToTuple: (hex: string) => GlooColorTuple | null;
  tupleToHex: (tuple: GlooColorTuple) => string;
  validateHex: (hex: string) => boolean;
  generateContrast: (baseHex: string, mode: GlooThemeMode) => string;
}

// Re-export React types for convenience
export type GlooFC<P = object> = React.FC<P>;
export type GlooRef<T> = React.RefObject<T>;
export type GlooStyle = React.CSSProperties;
export type GlooClassName = string;
