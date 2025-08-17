import { useEffect, useRef } from 'react';
import { useFriendsDependencyTracker } from './use_friends_dependency_analytics';

interface WebVitalMetric {
  type: 'PERF_METRIC';
  metric: 'LCP' | 'FCP' | 'CLS' | 'INP' | 'TTFB';
  value: number;
  ts: string;
  navigationId: string;
  url: string;
}

interface WebVitalsTelemetryOptions {
  beaconUrl?: string;
  enableConsoleLog?: boolean;
  batchSize?: number;
  flushInterval?: number;
}

const DEFAULT_OPTIONS: Required<WebVitalsTelemetryOptions> = {
  beaconUrl: '',
  enableConsoleLog: true,
  batchSize: 10,
  flushInterval: 5000,
};

export const useWebVitalsTelemetry = (options: WebVitalsTelemetryOptions = {}) => {
  const config = { ...DEFAULT_OPTIONS, ...options };
  const metricsBuffer = useRef<WebVitalMetric[]>([]);
  const navigationId = useRef<string>('');
  const flushTimer = useRef<NodeJS.Timeout | null>(null);

  const { trackDependencyCall } = useFriendsDependencyTracker(
    'useWebVitalsTelemetry',
    ['performance-api', 'beacon-api', 'fetch-api', 'navigation-timing'],
    { 
      trackPerformance: true,
      trackErrors: true,
      reportInterval: 30000 
    }
  );

  // Generate unique navigation ID
  useEffect(() => {
    navigationId.current = `nav_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }, []);

  const createMetric = (metric: WebVitalMetric['metric'], value: number): WebVitalMetric => ({
    type: 'PERF_METRIC',
    metric,
    value: Math.round(value * 100) / 100, // Round to 2 decimals
    ts: new Date().toISOString(),
    navigationId: navigationId.current,
    url: typeof window !== 'undefined' ? window.location.href : '',
  });

  const addMetric = (metric: WebVitalMetric) => {
    metricsBuffer.current.push(metric);

    if (config.enableConsoleLog) {
      console.log(`🚀 ${metric.metric}: ${metric.value}ms`, metric);
    }

    // Auto-flush if buffer is full
    if (metricsBuffer.current.length >= config.batchSize) {
      flushMetrics();
    }
  };

  const flushMetrics = async () => {
    if (metricsBuffer.current.length === 0) return;

    const metricsToSend = [...metricsBuffer.current];
    metricsBuffer.current = []; // Clear buffer

    // Send to beacon if URL provided
    if (config.beaconUrl && typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const payload = JSON.stringify({
        metrics: metricsToSend,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      });

      await trackDependencyCall('beacon-api', 'api', async () => {
        try {
          navigator.sendBeacon(config.beaconUrl, payload);
        } catch (error) {
          console.warn('Failed to send performance metrics:', error);
          await trackDependencyCall('fetch-api', 'api', async () => {
            try {
              await fetch(config.beaconUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: payload,
                keepalive: true,
              });
            } catch {}
          });
        }
      });
    }
  };

  const startPeriodicFlush = () => {
    if (flushTimer.current) return;

    flushTimer.current = setInterval(() => {
      flushMetrics();
    }, config.flushInterval);
  };

  const stopPeriodicFlush = () => {
    if (flushTimer.current) {
      clearInterval(flushTimer.current);
      flushTimer.current = null;
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // TTFB (Time to First Byte)
    const collectTTFB = () => {
      const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigationEntry) {
        const ttfb = navigationEntry.responseStart - navigationEntry.requestStart;
        addMetric(createMetric('TTFB', ttfb));
      }
    };

    // FCP (First Contentful Paint)
    const collectFCP = () => {
      const paintEntries = performance.getEntriesByType('paint');
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry) {
        addMetric(createMetric('FCP', fcpEntry.startTime));
      }
    };

    // LCP (Largest Contentful Paint)
    let lcpObserver: PerformanceObserver | null = null;
    if ('PerformanceObserver' in window) {
      try {
        lcpObserver = new PerformanceObserver((entryList) => {
          const entries = entryList.getEntries();
          const lastEntry = entries[entries.length - 1];
          if (lastEntry) {
            addMetric(createMetric('LCP', lastEntry.startTime));
          }
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (error) {
        console.warn('LCP observer not supported:', error);
      }
    }

    // CLS (Cumulative Layout Shift)
    let clsValue = 0;
    let clsObserver: PerformanceObserver | null = null;
    if ('PerformanceObserver' in window) {
      try {
        clsObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (error) {
        console.warn('CLS observer not supported:', error);
      }
    }

    // INP (Interaction to Next Paint) - approximated via event timing
    let inpObserver: PerformanceObserver | null = null;
    if ('PerformanceObserver' in window) {
      try {
        inpObserver = new PerformanceObserver((entryList) => {
          entryList.getEntries().forEach((entry: any) => {
            if (entry.processingStart && entry.startTime) {
              const inp = entry.processingStart - entry.startTime;
              if (inp > 0) {
                addMetric(createMetric('INP', inp));
              }
            }
          });
        });
        inpObserver.observe({ entryTypes: ['event'] });
      } catch (error) {
        console.warn('INP observer not supported:', error);
      }
    }

    // Collect initial metrics
    setTimeout(() => {
      collectTTFB();
      collectFCP();
    }, 100);

    // Final CLS collection on page unload
    const handleUnload = () => {
      if (clsValue > 0) {
        addMetric(createMetric('CLS', clsValue));
      }
      flushMetrics();
    };

    // Start periodic flushing
    startPeriodicFlush();

    window.addEventListener('beforeunload', handleUnload);
    window.addEventListener('pagehide', handleUnload);

    return () => {
      lcpObserver?.disconnect();
      clsObserver?.disconnect();
      inpObserver?.disconnect();
      stopPeriodicFlush();
      window.removeEventListener('beforeunload', handleUnload);
      window.removeEventListener('pagehide', handleUnload);

      // Final flush on cleanup
      flushMetrics();
    };
  }, []);

  return {
    flushMetrics,
    metricsCount: metricsBuffer.current.length,
    navigationId: navigationId.current,
  };
};
