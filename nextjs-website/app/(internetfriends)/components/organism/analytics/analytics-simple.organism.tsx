
"use client";
/**
 * analytics-simple.organism.tsx - Simplified Analytics Component
 *
 * Applies "Steadiest Addressability Agency" patterns:
 *
 * BEFORE: 12+ props with micro-configuration options
 * AFTER: 4 essential props with productive defaults
 *
 * Removed complexity:
 * - Strategy props (timeRange, autoRefresh, refreshInterval)
 * - Micro-config (showKPIs, showCharts, showInsights)
 * - Callback soup (onTimeRangeChange, onExport)
 * - Config objects ([key: string]: unknown)
 *
 * Key simplifications:
 * 1. Single preset approach instead of configuration matrix
 * 2. Once-on-mount data fetching with stable intervals
 * 3. Productive defaults based on common usage patterns
 * 4. Clear component boundary with error handling
 *
 * Usage:
 * <AnalyticsSimpleOrganism />
 * <AnalyticsSimpleOrganism disabled={loading} />
 * <AnalyticsSimpleOrganism title="Custom Analytics" />
 */

import React, { useState, useEffect } from "react";
import { ClientOnly } from "../../../patterns/boundary-patterns";

// Steadiest Component Interface - MAXIMUM 4 props
interface AnalyticsSimpleProps {
  /** Analytics title (default: "Analytics Overview") */
  title?: string;
  /** Disable the component entirely */
  disabled?: boolean;
  /** Additional CSS class */
  className?: string;
  /** Data attribute for testing */
  "data-testid"?: string;
}

// Productive analytics data structure (simplified)
interface AnalyticsData {
  visitors: number;
  pageviews: number;
  conversion: number;
  revenue: number;
}

// Mock productive defaults (replace with real API)
const PRODUCTIVE_ANALYTICS: AnalyticsData = {
  visitors: 12450,
  pageviews: 45670,
  conversion: 3.2,
  revenue: 2340,
};

export const AnalyticsSimpleOrganism: React.FC<AnalyticsSimpleProps> = ({
  title = "Analytics Overview",
  disabled = false,
  className,
  "data-testid": testId = "analytics-simple",
}) => {
  // Once-on-mount data loading (key steadiest addressability pattern)
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading with productive defaults
    const loadAnalytics = async () => {
      try {
        // In real implementation, this would be an API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setData(PRODUCTIVE_ANALYTICS);
      } catch (error) {
        console.warn("Analytics data loading failed, using fallback");
        setData(PRODUCTIVE_ANALYTICS);
      } finally {
        setLoading(false);
      }
    };

    loadAnalytics();
  }, []);

  if (disabled) return null;

  return (
    <ClientOnly
      config={{
        fallback: <AnalyticsLoadingSkeleton />,
        debug: process.env.NODE_ENV === "development",
      }}
    >
      <div
        className={[
          "analytics-simple-organism",
          "bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700",
          "p-6 shadow-sm",
          className || "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-testid={testId}
        data-component="analytics-simple"
        data-loading={loading}
      >
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Last 7 days overview
          </p>
        </div>

        {/* Content */}
        {loading ? (
          <AnalyticsLoadingSkeleton />
        ) : data ? (
          <AnalyticsContent data={data} />
        ) : (
          <AnalyticsErrorState />
        )}

        {/* Development debug info */}
        {process.env.NODE_ENV === "development" && (
          <div
            className="absolute top-2 right-2 z-50 pointer-events-none"
            style={{
              fontSize: "9px",
              fontFamily: "ui-monospace, monospace",
              background: "rgba(16, 185, 129, 0.9)",
              color: "white",
              padding: "4px 6px",
              borderRadius: "2px",
              border: "1px solid rgba(52, 211, 153, 0.3)",
            }}
          >
            📊 Analytics Simple
          </div>
        )}
      </div>
    </ClientOnly>
  );
};

// Simple content component (no over-configuration)
const AnalyticsContent: React.FC<{ data: AnalyticsData }> = ({ data }) => {
  const metrics = [
    {
      label: "Visitors",
      value: data.visitors.toLocaleString(),
      change: "+12%",
      positive: true,
    },
    {
      label: "Page Views",
      value: data.pageviews.toLocaleString(),
      change: "+8%",
      positive: true,
    },
    {
      label: "Conversion",
      value: `${data.conversion}%`,
      change: "+0.3%",
      positive: true,
    },
    {
      label: "Revenue",
      value: `$${data.revenue.toLocaleString()}`,
      change: "+15%",
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {metrics.map((metric, index) => (
        <div
          key={index}
          className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 text-center"
        >
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {metric.value}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {metric.label}
          </div>
          <div
            className={[
              "text-xs mt-2 font-medium",
              metric.positive
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400",
            ].join(" ")}
          >
            {metric.change}
          </div>
        </div>
      ))}
    </div>
  );
};

// Simple loading state (no configuration)
const AnalyticsLoadingSkeleton: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, index) => (
      <div
        key={index}
        className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 animate-pulse"
      >
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-12" />
      </div>
    ))}
  </div>
);

// Simple error state (no configuration)
const AnalyticsErrorState: React.FC = () => (
  <div className="text-center py-8">
    <div className="text-4xl mb-2">📊</div>
    <div className="text-gray-500 dark:text-gray-400">
      Analytics temporarily unavailable
    </div>
  </div>
);

export default AnalyticsSimpleOrganism;
