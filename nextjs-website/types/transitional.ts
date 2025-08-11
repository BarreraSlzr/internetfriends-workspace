/**
 * Transitional Types - InternetFriends Design System
 *
 * Lightweight type definitions to replace 'any' usage during incremental
 * type safety improvements. These provide better semantic meaning than 'any'
 * while avoiding over-engineering during rapid development phases.
 */

// Basic JSON-compatible types
export type JsonPrimitive = string | number | boolean | null;

export interface JsonObject {
  [key: string]: JsonValue;
}

export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];

// Generic record types for structured data
export type UnknownRecord = Record<string, unknown>;
export type StringRecord = Record<string, string>;
export type AnyRecord = Record<string, JsonValue>;

// Event and callback types
export type EventCallback<T = unknown> = (event: T) => void;
export type AsyncEventCallback<T = unknown> = (event: T) => Promise<void>;

// Component prop helpers
export type ComponentChildren = React.ReactNode;
export type OptionalChildren = React.ReactNode | undefined;

// Data table and analytics types
export interface AnalyticsFilter {
  key: string;
  label: string;
  values: string[];
  type?: 'select' | 'range' | 'date' | 'boolean';
}

export interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  filterable?: boolean;
  type?: 'string' | 'number' | 'date' | 'boolean';
}

export interface TableRow extends UnknownRecord {
  id: string | number;
}

// API response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = unknown> extends ApiResponse<T[]> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Dashboard and metrics types
export interface MetricValue {
  value: number | string;
  label: string;
  change?: number;
  changeType?: 'increase' | 'decrease' | 'neutral';
  unit?: string;
}

export interface DashboardWidget {
  id: string;
  title: string;
  type: 'metric' | 'chart' | 'table' | 'custom';
  data: unknown;
  config?: UnknownRecord;
}

// Event system types
export interface SystemEvent {
  id: string;
  type: string;
  timestamp: string;
  source: string;
  data: UnknownRecord;
  metadata?: UnknownRecord;
}

// Form and input types
export type FormFieldValue = string | number | boolean | Date | null;

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'number' | 'date' | 'select' | 'textarea' | 'checkbox';
  value: FormFieldValue;
  required?: boolean;
  options?: Array<{ value: FormFieldValue; label: string }>;
  validation?: UnknownRecord;
}

// File and media types
export interface FileInfo {
  name: string;
  size: number;
  type: string;
  url?: string;
  path?: string;
  metadata?: UnknownRecord;
}

// Navigation and routing types
export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: string;
  children?: NavigationItem[];
  metadata?: UnknownRecord;
}

// Theme and styling types
export type ColorScheme = 'light' | 'dark' | 'auto';
export type ThemeSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ThemeConfig {
  colorScheme: ColorScheme;
  primaryColor: string;
  fontSize: ThemeSize;
  borderRadius: ThemeSize;
  customProperties?: StringRecord;
}

// Utility type helpers
export type Awaitable<T> = T | Promise<T>;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Legacy migration helpers (for gradual any replacement)
export type LegacyData = UnknownRecord; // Use instead of 'any' for data objects
export type LegacyCallback = (...args: unknown[]) => unknown; // Use instead of 'any' for callbacks
export type LegacyComponent = React.ComponentType<UnknownRecord>; // Use instead of 'any' for components

// Type guards for runtime validation
export const isJsonValue = (value: unknown): value is JsonValue => {
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return true;
  }
  if (Array.isArray(value)) {
    return value.every(isJsonValue);
  }
  if (typeof value === 'object' && value !== null) {
    return Object.values(value).every(isJsonValue);
  }
  return false;
};

export const isUnknownRecord = (value: unknown): value is UnknownRecord => {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
};
