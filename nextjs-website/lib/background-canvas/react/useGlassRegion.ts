"use client";
import { useEffect, useRef } from "react";
import { useGlassContext } from "./GlassProvider";

export interface UseGlassRegionOptions {
  intensity?: number;
  dispersion?: number;
  aberration?: number;
  rimStrength?: number;
  tintStrength?: number;
  radius?: number;
  dynamicSampling?: "always" | "hover" | "never";
}

export function useGlassRegion(opts: UseGlassRegionOptions = {}) {
  const { registerRegion } = useGlassContext();
  const elRef = useRef<HTMLDivElement | null>(null);
  const handleRef = useRef<ReturnType<typeof registerRegion> | null>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    if (!handleRef.current) {
      handleRef.current = registerRegion(el, opts);
    } else {
      handleRef.current.update(opts);
    }
    return () => {
      handleRef.current?.dispose();
      handleRef.current = null;
    };
  }, [opts.intensity, opts.dispersion, opts.aberration, opts.rimStrength, opts.tintStrength, opts.radius, opts.dynamicSampling, registerRegion]);

  return { ref: elRef } as const;
}
