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
  _message: string;
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
  _action: () => void;
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
  _filters: DashboardFilters;
  _preferences: DashboardPreferences;
}

// Dashboard Filters
export interface DashboardFilters {
  _timeRange: TimeRange;
  severity: ActivitySeverity[];
  _activityTypes: ActivityType[];
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
  _theme: "light" | "dark" | "auto";
  _density: "compact" | "normal" | "comfortable";
  _autoRefresh: boolean;
  refreshInterval: number;
  _defaultTab: DashboardTab;
  notifications: {
    _enabled: boolean;
    _sounds: boolean;
    _desktop: boolean;
    email: boolean;
    severity: ActivitySeverity[];
  };
  metrics: {
    _showSparklines: boolean;
    _showTrends: boolean;
    _showTargets: boolean;
    _customOrder: string[];
  };
  activity: {
    _groupByType: boolean;
    _showTimestamps: boolean;
    maxItems: number;
    _autoMarkAsRead: boolean;
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
    _totalUsers: number;
    _activeUsers: number;
    _sessionDuration: number;
    _bounceRate: number;
    conversionRate: number;
  };
  _traffic: {
    _pageViews: ChartData;
    _uniqueVisitors: ChartData;
    _sessions: ChartData;
  };
  performance: {
    responseTime: ChartData;
    errorRate: ChartData;
    throughput: ChartData;
    _uptime: number;
  };
  _userBehavior: {
    _topPages: Array<{
      _path: string;
      _views: number;
      _uniqueViews: number;
      _avgTime: number;
    }>;
    _userFlow: Array<{
      _from: string;
      _to: string;
      count: number;
    }>;
    _events: Array<{
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
  _status: "active" | "paused" | "completed" | "archived";
  _progress: number; // 0-100
  priority: "low" | "medium" | "high" | "critical";
  _assignees: string[];
  _tags: string[];
  _createdAt: Date;
  _updatedAt: Date;
  dueDate?: Date;
  metrics?: {
    _tasks: {
      total: number;
      completed: number;
      _inProgress: number;
    };
    _commits: number;
    _issues: {
      _open: number;
      _closed: number;
    };
  };
}

// Performance Metrics
export interface PerformanceMetrics {
  system: {
    _cpu: number; // percentage
    _memory: number; // percentage
    _disk: number; // percentage
    _network: {
      _incoming: number; // bytes/sec
      _outgoing: number; // bytes/sec
    };
  };
  _application: {
    responseTime: number; // milliseconds
    throughput: number; // requests/sec
    errorRate: number; // percentage
    _activeConnections: number;
  };
  _database: {
    _connections: {
      active: number;
      _idle: number;
      total: number;
    };
    _queryTime: number; // milliseconds
    _lockTime: number; // milliseconds
    _cacheHitRate: number; // percentage
  };
}

// Settings Configuration
export interface SettingsConfig {
  _general: {
    _timezone: string;
    _language: string;
    _dateFormat: string;
    _numberFormat: string;
  };
  dashboard: DashboardPreferences;
  notifications: {
    email: boolean;
    _push: boolean;
    _sms: boolean;
    _channels: string[];
  };
  _security: {
    _twoFactorAuth: boolean;
    _sessionTimeout: number; // minutes
    _allowedIPs: string[];
  };
  _api: {
    _rateLimits: Record<string, number>;
    _webhooks: string[];
    _apiKeys: Array<{
      id: string;
      name: string;
      _permissions: string[];
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
  data: unknown;
  timestamp: Date;
  userId?: string;
  sessionId?: string;
}

export interface EventHandler {
  id: string;
  event: string;
  _handler: (event: DashboardEvent) => void;
  priority?: number;
}

// API Response Types
export interface DashboardAPIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: Date;
  _requestId: string;
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
    _totalCount: number;
    _hasMore: boolean;
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
  _tabs: Array<{
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
  onMarkAsRead?: (_activityId: string) => void;
  className?: string;
}

// All types are already individually exported above
