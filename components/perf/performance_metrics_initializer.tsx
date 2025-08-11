'use client';

import React from 'react';
import { useWebVitalsTelemetry } from '../../hooks/perf/use_web_vitals_telemetry';

interface PerformanceMetricsInitializerProps {
  /** Optional beacon URL for sending metrics to analytics endpoint */
  beaconUrl?: string;
  /** Enable console logging of metrics (default: true in development, false in production) */
  enableConsoleLog?: boolean;
  /** Number of metrics to batch before auto-flushing (default: 10) */
  batchSize?: number;
  /** Interval in milliseconds for periodic metric flushing (default: 5000) */
  flushInterval?: number;
  /** Show debug info in development */
  showDebugInfo?: boolean;
}

export const PerformanceMetricsInitializer: React.FC<PerformanceMetricsInitializerProps> = ({
  beaconUrl = process.env.NEXT_PUBLIC_PERF_BEACON_URL,
  enableConsoleLog = process.env.NODE_ENV === 'development',
  batchSize = 10,
  flushInterval = 5000,
  showDebugInfo = process.env.NODE_ENV === 'development',
}) => {
  const { flushMetrics, metricsCount, navigationId } = useWebVitalsTelemetry({
    beaconUrl,
    enableConsoleLog,
    batchSize,
    flushInterval,
  });

  // Force flush metrics when component unmounts or on manual trigger
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Debug: Ctrl/Cmd + Shift + P to force flush metrics
      if (showDebugInfo && event.ctrlKey && event.shiftKey && event.key === 'P') {
        console.log('🔄 Force flushing performance metrics...');
        flushMetrics();
      }
    };

    if (showDebugInfo) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [flushMetrics, showDebugInfo]);

  // Debug info overlay (development only)
  if (showDebugInfo && typeof window !== 'undefined') {
    return (
      <div
        style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: 'rgba(0, 0, 0, 0.8)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '6px',
          fontSize: '12px',
          fontFamily: 'monospace',
          zIndex: 9999,
          maxWidth: '250px',
          lineHeight: '1.4',
        }}
      >
        <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
          🚀 Performance Telemetry
        </div>
        <div>Navigation: {navigationId.slice(-8)}</div>
        <div>Queued metrics: {metricsCount}</div>
        {beaconUrl && <div>Beacon: ✅</div>}
        <div style={{ marginTop: '4px', fontSize: '10px', opacity: 0.7 }}>
          Ctrl+Shift+P to flush
        </div>
      </div>
    );
  }

  // Production: invisible component, just runs the hook
  return null;
};

export default PerformanceMetricsInitializer;
