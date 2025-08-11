"use client";

import { useEffect } from "react";

/**
 * Performance Metrics Initializer
 *
 * This component initializes the Real User Monitoring (RUM) system
 * for collecting Core Web Vitals and performance metrics as part of
 * the Phase 4 performance optimization epic.
 */

interface PerfPayload {
  ttfb?: number;
  fcp?: number;
  lcp?: number;
  cls?: number;
  fid_like?: number;
  inp?: number;
  navType?: string;
  url?: string;
  sessionId?: string;
  connectionType?: string;
  deviceMemory?: number;
}

// Extend global interfaces for experimental APIs
declare global {
  interface Navigator {
    connection?: {
      effectiveType?: string;
    };
    mozConnection?: {
      effectiveType?: string;
    };
    webkitConnection?: {
      effectiveType?: string;
    };
    deviceMemory?: number;
  }
  interface Window {
    rumInitialized?: boolean;
    rumMetrics?: PerfPayload;
  }
}

// Generate a session ID for this page session
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Get connection information if available
function getConnectionInfo(): Pick<
  PerfPayload,
  "connectionType" | "deviceMemory"
> {
  const info: Pick<PerfPayload, "connectionType" | "deviceMemory"> = {};

  try {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;

    if (connection?.effectiveType) {
      info.connectionType = connection.effectiveType;
    }

    if (navigator.deviceMemory) {
      info.deviceMemory = navigator.deviceMemory;
    }
  } catch {
    // Ignore errors accessing experimental APIs
  }

  return info;
}

function sendMetrics(payload: PerfPayload): void {
  if (!payload || Object.keys(payload).length === 0) {
    return;
  }

  // Use sendBeacon for reliability, fallback to fetch
  const data = JSON.stringify(payload);

  if (navigator.sendBeacon) {
    navigator.sendBeacon("/api/rum", data);
  } else {
    // Fallback for browsers without sendBeacon
    fetch("/api/rum", {
      method: "POST",
      body: data,
      headers: { "Content-Type": "application/json" },
      keepalive: true,
    }).catch((error) => {
      // Silently ignore network errors
      console.debug("RUM beacon failed:", error);
    });
  }
}

// Use direct sendMetrics call with simple throttling
let lastSent = 0;
const throttledSendMetrics = (payload: PerfPayload) => {
  const now = Date.now();
  if (now - lastSent > 1000) {
    lastSent = now;
    sendMetrics(payload);
  }
};

function initRUM(): void {
  if (typeof window === "undefined") {
    return; // Server-side rendering
  }

  // Skip in development unless explicitly enabled
  if (
    process.env.NODE_ENV === "development" &&
    !process.env.NEXT_PUBLIC_RUM_DEV
  ) {
    console.debug("RUM disabled in development");
    return;
  }

  // Prevent double initialization
  if (window.rumInitialized) {
    return;
  }

  const sessionId = generateSessionId();
  const connectionInfo = getConnectionInfo();

  const perf: PerfPayload = {
    sessionId,
    url: window.location.pathname,
    ...connectionInfo,
  };

  // Capture navigation type
  // Navigation type
  try {
    const navEntries = performance.getEntriesByType(
      "navigation",
    ) as PerformanceNavigationTiming[];
    if (navEntries.length > 0) {
      perf.navType = navEntries[0].type || "unknown";
    }
  } catch {
    // Ignore navigation timing errors
  }

  // Time to First Byte (TTFB)
  try {
    const navTiming = performance.getEntriesByType(
      "navigation",
    )[0] as PerformanceNavigationTiming;
    if (navTiming) {
      perf.ttfb = navTiming.responseStart - navTiming.requestStart;
    }
  } catch {
    // Ignore timing errors
  }

  // First Contentful Paint (FCP)
  const observeFCP = () => {
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            perf.fcp = entry.startTime;
            throttledSendMetrics({ ...perf });
          }
        }
      }).observe({ type: "paint", buffered: true });
    } catch {
      // PerformanceObserver not supported
    }
  };

  // Largest Contentful Paint (LCP)
  const observeLCP = () => {
    try {
      let lcpValue = 0;

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          // LCP can change multiple times, keep the latest
          lcpValue = entry.startTime;
          perf.lcp = lcpValue;
        }
        throttledSendMetrics({ ...perf });
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch {
      // PerformanceObserver not supported
    }
  };

  // Cumulative Layout Shift (CLS)
  const observeCLS = () => {
    try {
      let clsValue = 0;

      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const layoutShift = entry as PerformanceEntry & {
            value: number;
            hadRecentInput: boolean;
          };

          // Only count shifts without recent input
          if (!layoutShift.hadRecentInput) {
            clsValue += layoutShift.value;
            perf.cls = clsValue;
          }
        }
        throttledSendMetrics({ ...perf });
      }).observe({ type: "layout-shift", buffered: true });
    } catch {
      // PerformanceObserver not supported
    }
  };

  // First Input Delay (FID) approximation & Interaction to Next Paint (INP)
  const observeInteractions = () => {
    try {
      let firstInputProcessed = false;

      // FID approximation using first pointer/keyboard event
      const handleFirstInput = () => {
        if (firstInputProcessed) return;

        firstInputProcessed = true;
        const now = performance.now();

        // Rough approximation of processing delay
        requestIdleCallback(
          () => {
            const processingTime = performance.now() - now;
            perf.fid_like = processingTime;
            throttledSendMetrics({ ...perf });
          },
          { timeout: 100 },
        );
      };

      // Listen for first meaningful interaction
      document.addEventListener("click", handleFirstInput, {
        once: true,
        passive: true,
      });
      document.addEventListener("keydown", handleFirstInput, {
        once: true,
        passive: true,
      });
      document.addEventListener("touchstart", handleFirstInput, {
        once: true,
        passive: true,
      });

      // INP observation (if supported)
      if ("PerformanceObserver" in window) {
        try {
          new PerformanceObserver((list) => {
            let maxDelay = 0;

            for (const entry of list.getEntries()) {
              const eventTiming = entry as PerformanceEntry & {
                processingStart: number;
                startTime: number;
              };

              const delay = eventTiming.processingStart - eventTiming.startTime;
              if (delay > maxDelay) {
                maxDelay = delay;
                perf.inp = maxDelay;
              }
            }

            if (maxDelay > 0) {
              throttledSendMetrics({ ...perf });
            }
          }).observe({ type: "first-input", buffered: true });
        } catch {
          // FID observer not supported
        }
      }
    } catch {
      // Interaction to Next Paint not supported
    }
  };

  // Initialize all observers
  observeFCP();
  observeLCP();
  observeCLS();
  observeInteractions();

  // Send final metrics when page becomes hidden
  const sendFinalMetrics = () => {
    sendMetrics({ ...perf });
  };

  // Send metrics on page visibility change (user leaving)
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      sendFinalMetrics();
    }
  });

  // Send metrics on page unload (fallback)
  window.addEventListener("beforeunload", sendFinalMetrics);

  // Send initial metrics after a short delay (for early metrics)
  setTimeout(() => {
    throttledSendMetrics({ ...perf });
  }, 2000);

  // Mark as initialized
  window.rumInitialized = true;

  // For debugging in development
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_RUM_DEV
  ) {
    console.log("RUM initialized with session:", sessionId);

    // Expose perf object for debugging
    window.rumMetrics = perf;
  }
}

export function PerformanceMetricsInitializer() {
  useEffect(() => {
    // Initialize RUM system when component mounts
    initRUM();
  }, []);

  // This component renders nothing, it's just for side effects
  return null;
}

export default PerformanceMetricsInitializer;
