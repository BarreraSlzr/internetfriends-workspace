import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isWebGLRenderingContext(
  context: RenderingContext | null,
): context is WebGLRenderingContext {
  return context !== null && "createShader" in context;
}

export function getWebGLContext(
  canvas: HTMLCanvasElement,
): WebGLRenderingContext | null {
  const context =
    canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  return isWebGLRenderingContext(context) ? context : null;
}
