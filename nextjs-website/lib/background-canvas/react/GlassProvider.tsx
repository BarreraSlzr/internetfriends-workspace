"use client";
import React, { createContext, useContext, useEffect, useMemo, useRef } from "react";

export type QualityMode = "auto" | "low" | "high";
export interface GlassProviderProps {
  quality?: QualityMode;
  fpsCap?: number;
  preferredMode?: "glsl" | "css" | "auto";
  children?: React.ReactNode;
}

interface RegionOptions {
  intensity?: number;
  dispersion?: number;
  aberration?: number;
  rimStrength?: number;
  tintStrength?: number;
  radius?: number;
  dynamicSampling?: "always" | "hover" | "never";
}

export interface GlassRegionHandle {
  id: number;
  update: (opts: RegionOptions) => void;
  dispose: () => void;
}

interface GlassContextValue {
  registerRegion: (el: HTMLElement, opts: RegionOptions) => GlassRegionHandle;
  mode: "glsl" | "css";
}

const GlassContext = createContext<GlassContextValue | null>(null);

export function GlassProvider({ quality = "auto", fpsCap = 60, preferredMode = "auto", children }: GlassProviderProps) {
  const regionId = useRef(1);
  const mode: "glsl" | "css" = useMemo(() => {
    if (preferredMode === "css") return "css";
    if (preferredMode === "glsl") return supportsWebGL() ? "glsl" : "css";
    return supportsWebGL() && !prefersReducedMotion() ? "glsl" : "css";
  }, [preferredMode]);

  useEffect(() => {
    // No-op scaffolding: real GL init will be added later
    return () => {
      // cleanup on unmount
    };
  }, [mode, quality, fpsCap]);

  const value = useMemo<GlassContextValue>(() => ({
    registerRegion: (el: HTMLElement, _opts: RegionOptions) => {
      const id = regionId.current++;
      // Return stub handle; future implementation wires to renderer
      return {
        id,
        update: () => {},
        dispose: () => {},
      };
    },
    mode,
  }), [mode]);

  return <GlassContext.Provider value={value}>{children}</GlassContext.Provider>;
}

export function useGlassContext() {
  const ctx = useContext(GlassContext);
  if (!ctx) throw new Error("useGlassContext must be used within <GlassProvider>");
  return ctx;
}

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
    return !!gl;
  } catch {
    return false;
  }
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
