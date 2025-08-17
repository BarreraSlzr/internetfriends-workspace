// Real User Monitoring (RUM) System
// Lightweight performance tracking for InternetFriends

export interface RUMMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count" | "score";
  timestamp: number;
  url: string;
  userAgent: string;
  connection?: {
    effectiveType: string;
    downlink: number;
    rtt: number;
  };
}

export interface WebVitalsData {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
  inp?: number; // Interaction to Next Paint
}

class RUMCollector {
  private metrics: RUMMetric[] = [];
  private sessionId: string;
  private enabled: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.enabled = typeof window !== "undefined" && process.env.NODE_ENV === "production";
    
    if (this.enabled) {
      this.initializeWebVitals();
      this.initializeNavigationMetrics();
      this.initializeResourceMetrics();
    }
  }

  private generateSessionId(): string {
    return `rum_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private addMetric(metric: Omit<RUMMetric, "timestamp" | "url" | "userAgent">) {
    if (!this.enabled) return;

    const fullMetric: RUMMetric = {
      ...metric,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Add connection info if available
    const connection = (navigator as any).connection;
    if (connection) {
      fullMetric.connection = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      };
    }

    this.metrics.push(fullMetric);
    
    // Send metric to API (batch every 10 metrics or 30 seconds)
    if (this.metrics.length >= 10) {
      this.flush();
    }
  }

  private initializeWebVitals() {
    // Web Vitals collection using native APIs
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.entryType === "paint") {
          this.addMetric({
            name: entry.name === "first-contentful-paint" ? "fcp" : "fp",
            value: entry.startTime,
            unit: "ms",
          });
        }
        
        if (entry.entryType === "largest-contentful-paint") {
          this.addMetric({
            name: "lcp",
            value: entry.startTime,
            unit: "ms",
          });
        }
        
        if (entry.entryType === "first-input" && "processingStart" in entry) {
          this.addMetric({
            name: "fid",
            value: (entry as any).processingStart - entry.startTime,
            unit: "ms",
          });
        }
        
        if (entry.entryType === "layout-shift" && !(entry as any).hadRecentInput) {
          this.addMetric({
            name: "cls",
            value: (entry as any).value,
            unit: "score",
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["paint", "largest-contentful-paint", "first-input", "layout-shift"] });
    } catch (e) {
      console.warn("RUM: Some performance metrics not supported", e);
    }
  }

  private initializeNavigationMetrics() {
    window.addEventListener("load", () => {
      const navigation = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.addMetric({
          name: "ttfb",
          value: navigation.responseStart - navigation.fetchStart,
          unit: "ms",
        });
        
        this.addMetric({
          name: "domContentLoaded",
          value: navigation.domContentLoadedEventEnd - navigation.fetchStart,
          unit: "ms",
        });
        
        this.addMetric({
          name: "loadComplete",
          value: navigation.loadEventEnd - navigation.fetchStart,
          unit: "ms",
        });
      }
    });
  }

  private initializeResourceMetrics() {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name.includes(".js") || entry.name.includes(".css")) {
          this.addMetric({
            name: "resourceLoad",
            value: entry.duration,
            unit: "ms",
          });
        }
      }
    });

    try {
      observer.observe({ entryTypes: ["resource"] });
    } catch (e) {
      console.warn("RUM: Resource timing not supported", e);
    }
  }

  public trackCustomMetric(name: string, value: number, unit: RUMMetric["unit"] = "count") {
    this.addMetric({ name: `custom_${name}`, value, unit });
  }

  public trackError(error: Error, context?: string) {
    this.addMetric({
      name: "error",
      value: 1,
      unit: "count",
    });
  }

  public trackGlooPerformance(renderTime: number, effectName: string) {
    this.addMetric({
      name: `gloo_${effectName}_render`,
      value: renderTime,
      unit: "ms",
    });
  }

  public async flush() {
    if (!this.enabled || this.metrics.length === 0) return;

    const metricsToSend = [...this.metrics];
    this.metrics = [];

    try {
      await fetch("/api/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId: this.sessionId,
          metrics: metricsToSend,
          timestamp: Date.now(),
        }),
      });
    } catch (error) {
      console.warn("RUM: Failed to send metrics", error);
      // Restore metrics for retry
      this.metrics.unshift(...metricsToSend);
    }
  }

  public getSessionMetrics(): RUMMetric[] {
    return [...this.metrics];
  }
}

// Global RUM instance
export const rum = new RUMCollector();

// Auto-flush on page unload
if (typeof window !== "undefined") {
  window.addEventListener("beforeunload", () => {
    rum.flush();
  });
  
  // Auto-flush every 30 seconds
  setInterval(() => {
    rum.flush();
  }, 30000);
}

export default rum;