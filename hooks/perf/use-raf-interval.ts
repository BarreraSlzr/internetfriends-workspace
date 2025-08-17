"use client";
import { useRef, useEffect, useCallback } from "react";

interface UseRafIntervalOptions {
  callback: (deltaTime: number, timestamp: number) => void;
  delay?: number;
  enabled?: boolean;
  fps?: number;
}

export function useRafInterval({
  callback,
  delay = 0,
  enabled = true,
  fps = 60,
}: UseRafIntervalOptions) {
  const callbackRef = useRef(callback);
  const frameRef = useRef<number>();
  const lastTimeRef = useRef(0);
  const intervalTimeRef = useRef(0);

  const targetFrameTime = 1000 / fps;

  callbackRef.current = callback;

  const animate = useCallback((timestamp: number) => {
    const deltaTime = timestamp - lastTimeRef.current;
    intervalTimeRef.current += deltaTime;

    if (intervalTimeRef.current >= delay + targetFrameTime) {
      callbackRef.current(deltaTime, timestamp);
      intervalTimeRef.current = 0;
    }

    lastTimeRef.current = timestamp;
    frameRef.current = requestAnimationFrame(animate);
  }, [delay, targetFrameTime]);

  useEffect(() => {
    if (enabled) {
      frameRef.current = requestAnimationFrame(animate);
    } else {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    }

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [enabled, animate]);

  const start = useCallback(() => {
    if (!frameRef.current) {
      frameRef.current = requestAnimationFrame(animate);
    }
  }, [animate]);

  const stop = useCallback(() => {
    if (frameRef.current) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = undefined;
    }
  }, []);

  return { start, stop };
}

export type { UseRafIntervalOptions };