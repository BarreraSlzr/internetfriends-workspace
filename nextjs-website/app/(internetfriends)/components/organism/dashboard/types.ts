// InternetFriends Dashboard Organism Types
// Comprehensive type definitions for the dashboard system

export type DashboardTab =
  | "overview"
  | "analytics"
  | "projects"
  | "performance"
  | "settings";

export type MetricTrend = "up" | "down" | "stable";

export type ActivitySeverity = "info" | "success" | "warning" | "error";

export type ActivityType =
  | "user_login"
  | "user_logout"
  | "system_alert"
  | "deployment"
  | "compute_job"
  | "api_call"
  | "database_query"
  | "security_event"
  | "performance_alert";

// Base Dashboard Props
export interface DashboardProps {
  userId?: string;
  sessionId?: string;
  initialTab?: DashboardTab;
  showMetrics?: boolean;
  showActivity?: boolean;
  showAnalytics?: boolean;
  className?: string;
  onTabChange?: (tab: DashboardTab) => void;
  onMetricClick?: (metric: MetricCard) => void;
  onRefresh?: () => void;
  refreshInterval?: number; // milliseconds
  maxActivities?: number;
}

// Metric Card Configuration
export interface MetricCard {
  id: string;
  title: string;
  value: string | number;
  change?: string;
  trend?: MetricTrend;
  icon?: string;
  color?: string;
  description?: string;
  unit?: string;
  target?: number;
  threshold?: {
    warning: number;
    critical: number;
  };
  sparklineData?: number[];
  lastUpdated?: Date;
  clickable?: boolean;
  loading?: boolean;
  error?: string;
}

// Activity Feed Item
export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: Date;
  severity: ActivitySeverity;
  icon?: string;
  userId?: string;
  sessionId?: string;
  metadata?: Record<string, any>;
  actions?: ActivityAction[];
  read?: boolean;
  category?: string;
  source?: string;
  correlationId?: string;
}

// Activity Actions
export interface ActivityAction {
  id: string;
  label: string;
  action: () => void;
  icon?: string;
  variant?: "primary" | "secondary" | "danger";
  disabled?: boolean;
}

// Dashboard State Management
export interface DashboardState {
  activeTab: DashboardTab;
  metrics: MetricCard[];
  activities: ActivityItem[];
  isLoading: boolean;
  error: string | null;
  lastUpdate: Date;
  filters: DashboardFilters;
  preferences: DashboardPreferences;
}

// Dashboard Filters
export interface DashboardFilters {
  timeRange: TimeRange;
  severity: ActivitySeverity[];
  activityTypes: ActivityType[];
  searchTerm?: string;
  userId?: string;
  source?: string;
}

// Time Range Options
export type TimeRange =
  | "last_hour"
  | "last_4_hours"
  | "last_24_hours"
  | "last_7_days"
  | "last_30_days"
  | "custom";

// Dashboard Preferences
export interface DashboardPreferences {
  theme: "light" | "dark" | "auto";
  density: "compact" | "normal" | "comfortable";
  autoRefresh: boolean;
  refreshInterval: number;
  defaultTab: DashboardTab;
  notifications: {
    enabled: boolean;
    sounds: boolean;
    desktop: boolean;
    email: boolean;
    severity: ActivitySeverity[];
  };
  metrics: {
    showSparklines: boolean;
    showTrends: boolean;
    showTargets: boolean;
    customOrder: string[];
  };
  activity: {
    groupByType: boolean;
    showTimestamps: boolean;
    maxItems: number;
    autoMarkAsRead: boolean;
  };
}

// Chart Data Types
export interface ChartDataPoint {
  timestamp: Date;
  value: number;
  label?: string;
  color?: string;
}

export interface ChartData {
  id: string;
  name: string;
  data: ChartDataPoint[];
  type: "line" | "bar" | "area" | "pie" | "donut";
  color?: string;
  unit?: string;
}

// Analytics Data
export interface AnalyticsData {
  overview: {
    totalUsers: number;
    activeUsers: number;
    sessionDuration: number;
    bounceRate: number;
    conversionRate: number;
  };
  traffic: {
    pageViews: ChartData;
    uniqueVisitors: ChartData;
    sessions: ChartData;
  };
  performance: {
    responseTime: ChartData;
    errorRate: ChartData;
    throughput: ChartData;
    uptime: number;
  };
  userBehavior: {
    topPages: Array<{
      path: string;
      views: number;
      uniqueViews: number;
      avgTime: number;
    }>;
    userFlow: Array<{
      from: string;
      to: string;
      count: number;
    }>;
    events: Array<{
      name: string;
      count: number;
      conversionRate: number;
    }>;
  };
}

// Project Data Types
export interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  status: "active" | "paused" | "completed" | "archived";
  progress: number; // 0-100
  priority: "low" | "medium" | "high" | "critical";
  assignees: string[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  dueDate?: Date;
  metrics?: {
    tasks: {
      total: number;
      completed: number;
      inProgress: number;
    };
    commits: number;
    issues: {
      open: number;
      closed: number;
    };
  };
}

// Performance Metrics
export interface PerformanceMetrics {
  system: {
    cpu: number; // percentage
    memory: number; // percentage
    disk: number; // percentage
    network: {
      incoming: number; // bytes/sec
      outgoing: number; // bytes/sec
    };
  };
  application: {
    responseTime: number; // milliseconds
    throughput: number; // requests/sec
    errorRate: number; // percentage
    activeConnections: number;
  };
  database: {
    connections: {
      active: number;
      idle: number;
      total: number;
    };
    queryTime: number; // milliseconds
    lockTime: number; // milliseconds
    cacheHitRate: number; // percentage
  };
}

// Settings Configuration
export interface SettingsConfig {
  general: {
    timezone: string;
    language: string;
    dateFormat: string;
    numberFormat: string;
  };
  dashboard: DashboardPreferences;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    channels: string[];
  };
  security: {
    twoFactorAuth: boolean;
    sessionTimeout: number; // minutes
    allowedIPs: string[];
  };
  api: {
    rateLimits: Record<string, number>;
    webhooks: string[];
    apiKeys: Array<{
      id: string;
      name: string;
      permissions: string[];
      expiresAt?: Date;
    }>;
  };
}

// Event System Integration Types
export interface DashboardEvent {
  type:
    | "tab_change"
    | "metric_click"
    | "activity_click"
    | "refresh"
    | "settings_change";
  data: any;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface EventHandler {
  id: string;
  event: string;
  handler: (event: DashboardEvent) => void;
  priority?: number;
}

// API Response Types
export interface DashboardAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  requestId: string;
}

export interface MetricsAPIResponse extends DashboardAPIResponse {
  data: {
    metrics: MetricCard[];
    lastUpdate: Date;
  };
}

export interface ActivitiesAPIResponse extends DashboardAPIResponse {
  data: {
    activities: ActivityItem[];
    totalCount: number;
    hasMore: boolean;
  };
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

// Component Prop Types
export interface DashboardHeaderProps {
  title?: string;
  subtitle?: string;
  onRefresh?: () => void;
  isLoading?: boolean;
  lastUpdate?: Date;
  actions?: React.ReactNode;
  className?: string;
}

export interface DashboardNavigationProps {
  tabs: Array<{
    id: DashboardTab;
    label: string;
    icon?: string;
  }>;
  activeTab: DashboardTab;
  onTabChange: (tab: DashboardTab) => void;
  className?: string;
}

export interface MetricsGridProps {
  metrics: MetricCard[];
  columns?: number;
  onMetricClick?: (metric: MetricCard) => void;
  loading?: boolean;
  className?: string;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  maxItems?: number;
  showFilters?: boolean;
  onActivityClick?: (activity: ActivityItem) => void;
  onMarkAsRead?: (activityId: string) => void;
  className?: string;
}

// All types are already individually exported above
