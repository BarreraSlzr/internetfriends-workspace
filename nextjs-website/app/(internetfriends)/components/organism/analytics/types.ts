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
  x: string;
  y: number;
  label?: string;
  metadata?: Record<string, any>;
}

export interface TrendData {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
  trend: TrendDirection;
}

export interface KPICard {
  id: string;
  title: string;
  value: number;
  previousValue?: number;
  change?: number;
  trend?: TrendDirection;
  format: "number" | "percentage" | "currency" | "duration" | "bytes";
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
  severity: InsightSeverity;
  confidence?: number;
  actionable: boolean;
  suggestion?: string | null;
  timestamp?: Date;
  category?: MetricCategory;
  relatedMetrics?: string[];
  action?: {
    label: string;
    url: string;
  };
}

export interface AnalyticsFilter {
  timeRange: TimeRange;
  customRange?: {
    start: Date;
    end: Date;
  };
  categories: MetricCategory[];
  comparisonPeriod?: "previous_period" | "same_period_last_year" | "custom";
  granularity: "minute" | "hour" | "day" | "week" | "month";
}

export interface AnalyticsData {
  kpis: KPICard[];
  charts: ChartData[];
  insights: MetricInsight[];
  summary: {
    totalEvents: number;
    uniqueUsers: number;
    averageSessionDuration: number;
    bounceRate: number;
  };
  lastUpdated: Date;
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
  customMetrics?: any[];
  data?: AnalyticsData;
  loading?: boolean;
  error?: string | null;
  onTimeRangeChange?: (range: TimeRange) => void;
  onFilterChange?: (filter: Record<string, any>) => void;
  onMetricClick?: (metric: any) => void;
  onInsightAction?: (insight: MetricInsight) => void;
  onExport?: (data: any) => void;
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
  data: any;
  timestamp: Date;
  userId?: string;
}

// API response types
export interface AnalyticsApiResponse {
  data: AnalyticsData;
  status: "success" | "error";
  message?: string;
  timestamp: string;
}

// Utility types
export type MetricValue = string | number;
export type ChartDataMap = Record<string, DataPoint[]>;
export type MetricMap = Record<string, any>;

export interface AnalyticsConfig {
  refreshInterval: number;
  maxInsights: number;
  defaultTimeRange: TimeRange;
  enableRealtime: boolean;
  chartHeight: number;
  compactMode: boolean;
}
