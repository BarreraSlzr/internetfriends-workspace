/**
 * Real User Monitoring (RUM) Initialization
 *
 * This module initializes performance monitoring for the InternetFriends
 * portfolio application, collecting Core Web Vitals and other performance
 * metrics to support the Phase 4 performance optimization epic.
 *
 * Usage:
 *   import { initRUM } from '@/lib/rum.init';
 *   initRUM();
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

interface NavigationTiming extends PerformanceEntry {
  type?: string;
}

// Generate a session ID for this page session
function generateSessionId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// Extend Navigator interface for experimental APIs
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
  } catch (error) {
    // Ignore errors accessing experimental APIs
  }

  return info;
}

// Debounce function to avoid excessive beacon calls
function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number,
): T {
  let timeout: NodeJS.Timeout;

  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
}

// Send metrics to the RUM endpoint
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

// Debounced version to avoid spam
const debouncedSendMetrics = debounce(sendMetrics, 1000);

export function initRUM(): void {
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

  const sessionId = generateSessionId();
  const connectionInfo = getConnectionInfo();

  const perf: PerfPayload = {
    sessionId,
    url: window.location.pathname,
    ...connectionInfo,
  };

  // Capture navigation type
  try {
    const navEntries = performance.getEntriesByType(
      "navigation",
    ) as NavigationTiming[];
    if (navEntries.length > 0) {
      perf.navType = navEntries[0].type || "unknown";
    }
  } catch (error) {
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
  } catch (error) {
    // Ignore timing errors
  }

  // First Contentful Paint (FCP)
  const observeFCP = () => {
    try {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === "first-contentful-paint") {
            perf.fcp = entry.startTime;
            debouncedSendMetrics({ ...perf });
          }
        }
      }).observe({ type: "paint", buffered: true });
    } catch (error) {
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
        debouncedSendMetrics({ ...perf });
      }).observe({ type: "largest-contentful-paint", buffered: true });
    } catch (error) {
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
        debouncedSendMetrics({ ...perf });
      }).observe({ type: "layout-shift", buffered: true });
    } catch (error) {
      // PerformanceObserver not supported
    }
  };

  // First Input Delay (FID) approximation & Interaction to Next Paint (INP)
  const observeInteractions = () => {
    try {
      let firstInputProcessed = false;

      // FID approximation using first pointer/keyboard event
      const handleFirstInput = (event: Event) => {
        if (firstInputProcessed) return;

        firstInputProcessed = true;
        const now = performance.now();

        // Rough approximation of processing delay
        requestIdleCallback(
          () => {
            const processingTime = performance.now() - now;
            perf.fid_like = processingTime;
            debouncedSendMetrics({ ...perf });
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
                processingEnd: number;
                startTime: number;
              };

              const delay = eventTiming.processingStart - eventTiming.startTime;
              if (delay > maxDelay) {
                maxDelay = delay;
                perf.inp = maxDelay;
              }
            }

            if (maxDelay > 0) {
              debouncedSendMetrics({ ...perf });
            }
          }).observe({ type: "event", buffered: true });
        } catch (error) {
          // event timing not supported
        }
      }
    } catch (error) {
      // Interaction observation not supported
    }
  };

  // Initialize all observers
  observeFCP();
  observeLCP();
  observeCLS();
  observeInteractions();

  // Send initial metrics when page becomes hidden
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
    debouncedSendMetrics({ ...perf });
  }, 2000);

  // For debugging in development
  if (
    process.env.NODE_ENV === "development" &&
    process.env.NEXT_PUBLIC_RUM_DEV
  ) {
    console.log("RUM initialized with session:", sessionId);

    // Expose perf object for debugging
    (window as any).rumMetrics = perf;
  }
}

// Auto-initialize if not imported as module
if (typeof window !== "undefined" && !(window as any).rumInitialized) {
  (window as any).rumInitialized = true;

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initRUM);
  } else {
    initRUM();
  }
}

// Export types for TypeScript usage
export type { PerfPayload };
