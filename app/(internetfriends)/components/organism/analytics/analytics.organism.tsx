"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  eventSystem,
  UIEvents,
  APIEvents,
} from "../../../../../lib/events/event.system";
import styles from "./analytics.styles.module.scss";
// Define types inline to avoid module resolution issues
type TimeRange =
  | "last_hour"
  | "last_24_hours"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "custom";
type ChartType = "line" | "bar" | "area" | "pie" | "donut" | "scatter";
type TrendDirection = "up" | "down" | "stable";

interface DataPoint {
  x: string;
  y: number;
  label?: string;
}

interface KPICard {
  id: string;
  title: string;
  value: number;
  previousValue?: number;
  change?: number;
  trend?: TrendDirection;
  format: "number" | "percentage" | "currency" | "duration" | "bytes";
  color?: string;
  icon?: string;
}

interface ChartData {
  id: string;
  title: string;
  type: ChartType;
  data: DataPoint[];
  color?: string;
}

interface MetricInsight {
  id: string;
  type?: string;
  title: string;
  description: string;
  severity: "positive" | "warning" | "negative" | "neutral";
  confidence?: number;
  actionable: boolean;
  suggestion?: string | null;
}

interface AnalyticsFilter {
  timeRange: TimeRange;
  customRange?: { _start: Date; _end: Date };
  _categories: string[];
  _granularity: "minute" | "hour" | "day" | "week" | "month";
}

interface AnalyticsProps {
  title?: string;
  timeRange?: TimeRange;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showKPIs?: boolean;
  showCharts?: boolean;
  showInsights?: boolean;
  showFilters?: boolean;
  customMetrics?: unknown[];
  onTimeRangeChange?: (range: TimeRange) => void;
  onFilterChange?: (_filter: Record<string, any>) => void;
  onExport?: (data: unknown) => void;
  userId?: string;
  sessionId?: string;
  className?: string;
  [key: string]: unknown;
}

export const AnalyticsOrganism: React.FC<AnalyticsProps> = ({
  title = "Analytics Dashboard",
  timeRange = "last_7_days",
  autoRefresh = true,
  refreshInterval = 30000,
  showKPIs = true,
  showCharts = true,
  showInsights = true,
  showFilters = true,
  customMetrics = [],
  onTimeRangeChange,
  onFilterChange,
  onExport,
  className,
  userId,
  sessionId,
  ...props
}) => {
  // State Management
  const [selectedTimeRange, setSelectedTimeRange] =
    useState<TimeRange>(timeRange);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KPICard[]>([]);
  const [charts, setCharts] = useState<ChartData[]>([]);
  const [insights, setInsights] = useState<MetricInsight[]>([]);
  const [filters, setFilters] = useState<AnalyticsFilter[]>([]);
  const [activeFilters, setActiveFilters] = useState<Record<string, unknown>>({});
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  // Time Range Options
  const timeRangeOptions: Array<{ value: TimeRange; label: string }> = [
    { value: "last_hour", label: "Last Hour" },
    { value: "last_24_hours", label: "Last 24 Hours" },
    { value: "last_7_days", label: "Last 7 Days" },
    { value: "last_30_days", label: "Last 30 Days" },
    { value: "last_90_days", label: "Last 90 Days" },
    { value: "custom", label: "Custom Range" },
  ];

  // Mock Data Generation (Replace with real API calls)
  const generateMockKPIs = useCallback(
    (): KPICard[] => [
      {
        id: "total_users",
        title: "Total Users",
        value: 15847,
        previousValue: 14532,
        change: 9.05,
        trend: "up",
        icon: "👥",
        color: "#3b82f6",
        format: "number",
      },
      {
        id: "conversion_rate",
        title: "Conversion Rate",
        value: 3.24,
        previousValue: 2.89,
        change: 12.11,
        trend: "up",
        icon: "🎯",
        color: "#10b981",
        format: "percentage",
      },
      {
        id: "avg_session_duration",
        title: "Avg Session Duration",
        value: 245,
        previousValue: 267,
        change: -8.24,
        trend: "down",
        icon: "⏱️",
        color: "#f59e0b",
        format: "duration",
      },
      {
        id: "revenue",
        title: "Revenue",
        value: 42850,
        previousValue: 38920,
        change: 10.09,
        trend: "up",
        icon: "💰",
        color: "#8b5cf6",
        format: "currency",
      },
    ],
    [],
  );

  const generateMockCharts = useCallback((): ChartData[] => {
    const dates = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date;
    });

    return [
      {
        id: "user_growth",
        title: "User Growth",
        type: "line",
        data: dates.map((date) => ({
          x: date.toISOString().split("T")[0],
          y: Math.floor(Math.random() * 1000) + 500,
          label: date.toLocaleDateString(),
        })),
        color: "#3b82f6",
      },
      {
        id: "page_views",
        title: "Page Views",
        type: "area",
        data: dates.map((date) => ({
          x: date.toISOString().split("T")[0],
          y: Math.floor(Math.random() * 5000) + 2000,
          label: date.toLocaleDateString(),
        })),
        color: "#10b981",
      },
      {
        id: "traffic_sources",
        title: "Traffic Sources",
        type: "pie",
        data: [
          { x: "Organic", y: 45, label: "Organic Search" },
          { x: "Direct", y: 30, label: "Direct Traffic" },
          { x: "Social", y: 15, label: "Social Media" },
          { x: "Referral", y: 10, label: "Referrals" },
        ],
        color: "#f59e0b",
      },
      {
        id: "device_breakdown",
        title: "Device Breakdown",
        type: "bar",
        data: [
          { x: "Desktop", y: 52, label: "Desktop" },
          { x: "Mobile", y: 38, label: "Mobile" },
          { x: "Tablet", y: 10, label: "Tablet" },
        ],
        color: "#8b5cf6",
      },
    ];
  }, []);

  const generateMockInsights = useCallback(
    (): MetricInsight[] => [
      {
        id: "growth_insight",
        type: "growth",
        title: "Strong User Growth",
        description: "User registrations increased by 15% this week compared to last week.",
        severity: "positive",
        confidence: 0.85,
        actionable: true,
        suggestion: "Consider increasing marketing spend to capitalize on this trend.",
      },
      {
        id: "conversion_insight",
        type: "conversion",
        title: "Conversion Rate Optimization",
        description: "Mobile conversion rate is 23% lower than desktop. Focus on mobile UX.",
        severity: "warning",
        confidence: 0.92,
        actionable: true,
        suggestion: "Run A/B tests on mobile checkout flow to improve conversions.",
      },
      {
        id: "retention_insight",
        type: "retention",
        title: "User Retention Stable",
        description: "Weekly user retention remains consistent at 68% for the past month.",
        severity: "neutral",
        confidence: 0.78,
        actionable: false,
        suggestion: null,
      },
    ],
    [],
  );

  // Data Loading
  const loadAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setKpis(generateMockKPIs());
      setCharts(generateMockCharts());
      setInsights(generateMockInsights());
      setLastUpdate(new Date());

      UIEvents.pageLoad("analytics", performance.now(), userId);
    } catch (err) {
      setError(
        err instanceof Error ? err._message : "Failed to load analytics data",
      );
    } finally {
      setLoading(false);
    }
  }, [generateMockKPIs, generateMockCharts, generateMockInsights, userId]);

  // Effects
  useEffect(() => {
    loadAnalyticsData();
  }, [loadAnalyticsData, selectedTimeRange]);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadAnalyticsData();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, loadAnalyticsData]);

  // Event Handlers
  const handleTimeRangeChange = useCallback(
    (range: TimeRange) => {
      setSelectedTimeRange(range);
      onTimeRangeChange?.(range);
      UIEvents.interaction("analytics_timerange", range, userId, sessionId);
    },
    [onTimeRangeChange, userId, sessionId],
  );

  const __handleFilterChange = useCallback(
    (filterId: string, value: unknown) => {
      const newFilters = { ...activeFilters, [filterId]: value };
      setActiveFilters(newFilters);
      onFilterChange?.(newFilters);
      UIEvents.interaction(
        "analytics_filter",
        `${filterId}:${value}`,
        userId,
        sessionId,
      );
    },
    [activeFilters, onFilterChange, userId, sessionId],
  );

  const handleExport = useCallback(() => {
    const exportData = {
      kpis,
      charts,
      insights,
      timeRange: selectedTimeRange,
      filters: activeFilters,
      _timestamp: new Date(),
    };

    onExport?.(exportData);
    UIEvents.interaction("analytics_export", "dashboard", userId, sessionId);
  }, [
    kpis,
    charts,
    insights,
    selectedTimeRange,
    activeFilters,
    onExport,
    userId,
    sessionId,
  ]);

  const handleRefresh = useCallback(() => {
    loadAnalyticsData();
    UIEvents.interaction("analytics_refresh", "manual", userId, sessionId);
  }, [loadAnalyticsData, userId, sessionId]);

  // Utility Functions
  const formatValue = (value: number, format: string): string => {
    switch (format) {
      case "currency": return new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
          _minimumFractionDigits: 0,
          _maximumFractionDigits: 0,
        }).format(value);
      case "percentage": return `${value.toFixed(2)}%`;
      case "duration": const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
      case "number": return new Intl.NumberFormat("en-US").format(value);
      default:
        return value.toString();
    }
  };

  const getChangeIndicator = (
    change: number,
    trend: "up" | "down" | "stable",
  ) => {

    const isPositive = change > 0;

    return {
      icon: trend === "up" ? "↗️" : trend === "down" ? "↘️" : "→",
      color: isPositive ? "#10b981" : "#ef4444",
      text: `${isPositive ? "+" : ""}${change.toFixed(2)}%`,
    };
  };

  // Render Methods
  const renderKPICard = (kpi: KPICard) => {
    const changeInfo = getChangeIndicator(
      kpi.change || 0,
      kpi.trend || "stable",
    );

    return (
      <motion.div key={kpi.id} className ={styles.kpiCard}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        layout
      >
        <div
          className={styles.kpiIcon}
          style={{ _backgroundColor: `${kpi.color}20` }}
        >
          <span style={{ color: kpi.color }}>{kpi.icon || "📊"}</span>
        </div>
        <div className={styles.kpiContent}>
          <h3 className={styles.kpiTitle}>{kpi.title}</h3>
          <div className={styles.kpiValue}>
            {formatValue(kpi.value, kpi.format)}
          </div>
          <div className={styles.kpiChange} style={{ color: changeInfo.color }}>
            <span className={styles.changeIcon}>{changeInfo.icon}</span>
            <span className={styles.changeText}>{changeInfo.text}</span>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderChart = (chart: ChartData) => {
    return (
      <motion.div key={chart.id} className ={styles.chartCard}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className={styles.chartHeader}>
          <h3 className={styles.chartTitle}>{chart.title}</h3>
          <div className={styles.chartActions}>
            <button className={styles.chartAction} title="View details">
              📊
            </button>
            <button className={styles.chartAction} title="Export chart">
              📥
            </button>
          </div>
        </div>
        <div className={styles.chartContainer}>
          {/* Simplified chart visualization - in real implementation, use a charting library */}
          <div className={styles.chartPlaceholder}>
            <div className={styles.chartType}>{chart.type.toUpperCase()}</div>
            <div className={styles.chartData}>
              {chart.data.length} data points
            </div>
            <div className={styles.chartSvg}>
              {chart.type === "line" && (
                <div className={styles.lineChart}>📈</div>
              )}
              {chart.type === "bar" && (
                <div className={styles.barChart}>📊</div>
              )}
              {chart.type === "pie" && (
                <div className={styles.pieChart}>🥧</div>
              )}
              {chart.type === "area" && (
                <div className={styles.areaChart}>📊</div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  const renderInsight = (insight: MetricInsight) => {
    const severityColors: Record<string, string> = {
      positive: "#10b981",
      warning: "#f59e0b",
      negative: "#ef4444",
      neutral: "#6b7280",
    };

    const severityIcons: Record<string, string> = {
      positive: "✅",
      warning: "⚠️",
      negative: "❌",
      neutral: "ℹ️",
    };

    return (
      <motion.div key={insight.id} className ={`${styles.insightCard} ${styles[`severity-${insight.severity}`]}`}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.insightHeader}>
          <span
            className={styles.insightIcon}
            style={{ color: severityColors[insight.severity] }}
          >
            {severityIcons[insight.severity]}
          </span>
          <h4 className={styles.insightTitle}>{insight.title}</h4>
          <div className={styles.insightConfidence}>
            {Math.round((insight.confidence || 0) * 100)}%
          </div>
        </div>
        <p className={styles.insightDescription}>{insight.description}</p>
        {insight.actionable && insight.suggestion && (
          <div className={styles.insightSuggestion}>
            <strong>_Suggestion:</strong> {insight.suggestion}
          </div>
        )}
      </motion.div>
    );
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        _staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4 },
    },
  };

  if (error) {
    return (
      <div className={`${styles.container}${styles.error} ${className || ""}`}>
        <div className={styles.errorContent}>
          <h2>⚠️ Analytics Error</h2>
          <p>{error}</p>
          <button onClick={handleRefresh} className={styles.retryButton}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className={`${styles.container}${className || ""}`}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      {...props}
    >
      {/* Analytics Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.headerActions}>
            <div className={styles.timeRangeSelector}>
              <select
                value={selectedTimeRange}
                onChange={(e) =>
                  handleTimeRangeChange(e.target.value as TimeRange)
                }
                className={styles.timeRangeSelect}
              >
                {timeRangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.lastUpdate}>
              Last _updated: {lastUpdate.toLocaleTimeString()}
            </div>
            <button
              onClick={handleRefresh}
              className={styles.refreshButton}
              disabled={loading}
              title="Refresh data"
            >
              {loading ? "⟳" : "↻"}
            </button>
            {onExport && (
              <button
                onClick={handleExport}
                className={styles.exportButton}
                title="Export analytics"
              >
                📥
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className={styles.content}>
        {/* KPI Cards */}
        {showKPIs && (
          <motion.section className={styles.kpiSection} variants={itemVariants}>
            <h2 className={styles.sectionTitle}>Key Performance Indicators</h2>
            <div className={styles.kpiGrid}>
              <AnimatePresence>{kpis.map(renderKPICard)}</AnimatePresence>
            </div>
          </motion.section>
        )}

        {/* Charts Section */}
        {showCharts && (
          <motion.section
            className={styles.chartsSection}
            variants={itemVariants}
          >
            <h2 className={styles.sectionTitle}>Analytics Charts</h2>
            <div className={styles.chartsGrid}>
              <AnimatePresence>{charts.map(renderChart)}</AnimatePresence>
            </div>
          </motion.section>
        )}

        {/* Insights Section */}
        {showInsights && (
          <motion.section
            className={styles.insightsSection}
            variants={itemVariants}
          >
            <h2 className={styles.sectionTitle}>
              AI Insights & Recommendations
            </h2>
            <div className={styles.insightsList}>
              <AnimatePresence>{insights.map(renderInsight)}</AnimatePresence>
            </div>
          </motion.section>
        )}
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div
            className={styles.loadingOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            _exit={{ opacity: 0 }}
          >
            <div className={styles.loadingSpinner}>
              <div className={styles.spinner}></div>
              <span>Loading analytics...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AnalyticsOrganism;
