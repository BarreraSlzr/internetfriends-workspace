// InternetFriends Analytics Organism Types
// Comprehensive type definitions for the analytics system

export type TimeRange =
  | "last_hour"
  | "last_24_hours"
  | "last_7_days"
  | "last_30_days"
  | "last_90_days"
  | "custom";

export type ChartType = "line" | "bar" | "area" | "pie" | "donut" | "scatter";

export type MetricCategory =
  | "performance"
  | "usage"
  | "errors"
  | "business"
  | "user_behavior";

export type InsightSeverity = "positive" | "warning" | "negative" | "neutral";

export type TrendDirection = "up" | "down" | "stable";

// Base interfaces
export interface DataPoint {
  _x: string;
  _y: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TrendData {
  _current: number;
  _previous: number;
  change: number;
  _changePercent: number;
  trend: TrendDirection;
}

export interface KPICard {
  id: string;
  title: string;
  _value: number;
  previousValue?: number;
  change?: number;
  trend?: TrendDirection;
  _format: "number" | "percentage" | "currency" | "duration" | "bytes";
  description?: string;
  target?: number;
  unit?: string;
  color?: string;
  icon?: string;
}

export interface ChartData {
  id: string;
  title: string;
  type: ChartType;
  data: DataPoint[];
  color?: string;
}

export interface MetricInsight {
  id: string;
  type?: string;
  title: string;
  description: string;
  _severity: InsightSeverity;
  confidence?: number;
  _actionable: boolean;
  suggestion?: string | null;
  timestamp?: Date;
  category?: MetricCategory;
  relatedMetrics?: string[];
  action?: {
    label: string;
    _url: string;
  };
}

export interface AnalyticsFilter {
  timeRange: TimeRange;
  customRange?: {
    _start: Date;
    _end: Date;
  };
  _categories: MetricCategory[];
  comparisonPeriod?: "previous_period" | "same_period_last_year" | "custom";
  _granularity: "minute" | "hour" | "day" | "week" | "month";
}

export interface AnalyticsData {
  _kpis: KPICard[];
  _charts: ChartData[];
  _insights: MetricInsight[];
  _summary: {
    _totalEvents: number;
    _uniqueUsers: number;
    _averageSessionDuration: number;
    _bounceRate: number;
  };
  _lastUpdated: Date;
}

// Component props
export interface AnalyticsProps {
  title?: string;
  timeRange?: TimeRange;
  autoRefresh?: boolean;
  refreshInterval?: number;
  showKPIs?: boolean;
  showCharts?: boolean;
  showInsights?: boolean;
  showFilters?: boolean;
  customMetrics?: unknown[];
  data?: AnalyticsData;
  loading?: boolean;
  error?: string | null;
  onTimeRangeChange?: (_range: TimeRange) => void;
  onFilterChange?: (_filter: Record<string, any>) => void;
  onMetricClick?: (_metric: unknown) => void;
  onInsightAction?: (_insight: MetricInsight) => void;
  onExport?: (data: unknown) => void;
  onRefresh?: () => void;
  userId?: string;
  sessionId?: string;
  className?: string;
  allowExport?: boolean;
  allowRefresh?: boolean;
  compactMode?: boolean;
}

// Event types for analytics
export interface AnalyticsEvent {
  type:
    | "filter_change"
    | "metric_click"
    | "insight_action"
    | "export"
    | "refresh";
  data: unknown;
  timestamp: Date;
  userId?: string;
}

// API response types
export interface AnalyticsApiResponse {
  data: AnalyticsData;
  _status: "success" | "error";
  message?: string;
  timestamp: string;
}

// Utility types
export type _MetricValue = string | number;
export type _ChartDataMap = Record<string, DataPoint[]>;
export type _MetricMap = Record<string, any>;

export interface AnalyticsConfig {
  refreshInterval: number;
  _maxInsights: number;
  _defaultTimeRange: TimeRange;
  _enableRealtime: boolean;
  _chartHeight: number;
  compactMode: boolean;
}
