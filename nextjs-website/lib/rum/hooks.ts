// RUM React Hook
// Easy integration of Real User Monitoring in React components

import { useEffect, useRef } from "react";
import { rum } from "./collector";

export function useRUM() {
  return {
    trackCustomMetric: rum.trackCustomMetric.bind(rum),
    trackError: rum.trackError.bind(rum),
    trackGlooPerformance: rum.trackGlooPerformance.bind(rum),
    getSessionMetrics: rum.getSessionMetrics.bind(rum),
  };
}

export function useComponentPerformance(componentName: string) {
  const startTime = useRef<number>();
  
  useEffect(() => {
    startTime.current = performance.now();
    
    return () => {
      if (startTime.current) {
        const renderTime = performance.now() - startTime.current;
        rum.trackCustomMetric(`component_${componentName}_render`, renderTime, "ms");
      }
    };
  }, [componentName]);
}

export function usePagePerformance() {
  useEffect(() => {
    const startTime = performance.now();
    
    const handleLoad = () => {
      const loadTime = performance.now() - startTime;
      rum.trackCustomMetric("page_interactive", loadTime, "ms");
    };
    
    if (document.readyState === "complete") {
      handleLoad();
    } else {
      window.addEventListener("load", handleLoad);
      return () => window.removeEventListener("load", handleLoad);
    }
  }, []);
}