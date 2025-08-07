// InternetFriends Global Type Definitions
// Centralized type system for the entire application

// Re-export all specific type modules
export * from "./components";
export * from "./theme";

export * from "./forms";

// Explicit imports for types used in this file
import { ContactFormData, NewsletterFormData } from "./forms";

// Global utility types
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalKeys<T, K extends keyof T> = Omit<T, K> &
  Partial<Pick<T, K>>;

export type NonEmptyArray<T> = [T, ...T[]];

export type ValueOf<T> = T[keyof T];

export type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Brand types for type safety
export type Brand<T, B> = T & { readonly __brand: B };

export type UserId = Brand<string, "UserId">;
export type ProjectId = Brand<string, "ProjectId">;
export type PostId = Brand<string, "PostId">;
export type Email = Brand<string, "Email">;
export type Url = Brand<string, "Url">;

// Common data structures
export interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface User extends BaseEntity {
  email: Email;
  name: string;
  avatar?: Url;
  role: "admin" | "user" | "guest";
  preferences: UserPreferences;
}

export interface UserPreferences {
  theme: "light" | "dark" | "system";
  language: string;
  timezone: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
}

export interface Project extends BaseEntity {
  title: string;
  description: string;
  slug: string;
  status: "draft" | "published" | "archived";
  tags: string[];
  technologies: string[];
  featured: boolean;
  images: ProjectImage[];
  links: ProjectLink[];
  content?: string;
}

export interface ProjectImage {
  id: string;
  url: Url;
  alt: string;
  caption?: string;
  width: number;
  height: number;
  placeholder?: string;
}

export interface ProjectLink {
  id: string;
  label: string;
  url: Url;
  type: "demo" | "source" | "case-study" | "documentation";
}

export interface BlogPost extends BaseEntity {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  published: boolean;
  publishedAt?: Date;
  author: User;
  tags: string[];
  categories: string[];
  featured: boolean;
  readingTime: number;
  seo: SEOMetadata;
}

export interface SEOMetadata {
  title: string;
  description: string;
  keywords: string[];
  ogImage?: Url;
  ogTitle?: string;
  ogDescription?: string;
  twitterCard?: "summary" | "summary_large_image";
  canonical?: Url;
  noindex?: boolean;
  nofollow?: boolean;
}

// Error types
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp: Date;
  path?: string;
}

// Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: ApiError;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Event types for analytics
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, string | number | boolean>;
  timestamp?: Date;
  userId?: UserId;
  sessionId?: string;
}

export interface PageViewEvent extends AnalyticsEvent {
  name: "page_view";
  properties: {
    page: string;
    referrer?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

export interface ContactFormEvent extends AnalyticsEvent {
  name: "contact_form_submit";
  properties: {
    form_type: string;
    success: boolean;
    error_count?: number;
    error_messages?: string;
  };
}

// Configuration types
export interface AppConfig {
  env: "development" | "staging" | "production";
  version: string;
  apiUrl: string;
  cdnUrl?: string;
  analytics: {
    google?: string;
    vercel?: boolean;
  };
  features: {
    blog: boolean;
    portfolio: boolean;
    contact: boolean;
    newsletter: boolean;
    comments: boolean;
  };
  limits: {
    fileUpload: number;
    requestTimeout: number;
    rateLimit: number;
  };
}

// Database types (for future use)
export interface DatabaseSchema {
  users: User;
  projects: Project;
  posts: BlogPost;
  contacts: ContactFormData;
  subscribers: NewsletterFormData;
}

// Search types
export interface SearchResult<T = unknown> {
  item: T;
  score: number;
  highlights?: string[];
}

export interface SearchQuery {
  q: string;
  filters?: Record<string, string | string[]>;
  sort?: string;
  order?: "asc" | "desc";
  page?: number;
  limit?: number;
}

// Content Management types
export interface ContentBlock {
  id: string;
  type: "text" | "image" | "video" | "code" | "quote" | "gallery";
  data: Record<string, unknown>;
  order: number;
}

export interface RichTextContent {
  blocks: ContentBlock[];
  version: string;
}

// Image optimization types
export interface ImageTransform {
  width?: number;
  height?: number;
  quality?: number;
  format?: "webp" | "avif" | "jpg" | "png";
  fit?: "cover" | "contain" | "fill";
  position?: "center" | "top" | "bottom" | "left" | "right";
}

// Internationalization types
export interface LocaleConfig {
  code: string;
  name: string;
  dir: "ltr" | "rtl";
  default?: boolean;
}

export interface TranslationKeys {
  common: {
    loading: string;
    error: string;
    success: string;
    cancel: string;
    submit: string;
    save: string;
    delete: string;
    edit: string;
    view: string;
    close: string;
  };
  navigation: {
    home: string;
    about: string;
    portfolio: string;
    contact: string;
    blog: string;
  };
  forms: {
    required: string;
    invalid: string;
    email: string;
    name: string;
    message: string;
  };
}

// Conditional types for advanced type manipulation
export type If<C extends boolean, T, F> = C extends true ? T : F;

export type IsNever<T> = [T] extends [never] ? true : false;

export type IsUnknown<T> = unknown extends T
  ? IsNever<T> extends false
    ? true
    : false
  : false;

// Recursive types
export type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object ? DeepReadonly<T[P]> : T[P];
};

export type DeepMutable<T> = {
  -readonly [P in keyof T]: T[P] extends object ? DeepMutable<T[P]> : T[P];
};

// Function types
export type AsyncFunction<T = void> = () => Promise<T>;
export type EventHandler<T = unknown> = (event: T) => void;

// Component prop types (basic)
export interface WithChildren {
  children?: React.ReactNode;
}

export interface WithClassName {
  className?: string;
}

export interface WithTestId {
  "data-testid"?: string;
}

export interface BaseProps extends WithChildren, WithClassName, WithTestId {
  id?: string;
}

// Animation types
export type AnimationDirection = "up" | "down" | "left" | "right";
export type AnimationDuration = "fast" | "normal" | "slow";
export type AnimationEasing = "linear" | "easeIn" | "easeOut" | "easeInOut";

// Layout types
export type LayoutVariant = "fixed" | "fluid" | "contained";
export type Alignment = "start" | "center" | "end" | "stretch";
export type Justification =
  | "start"
  | "center"
  | "end"
  | "between"
  | "around"
  | "evenly";

// Responsive types
export type Breakpoint = "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
export type ResponsiveValue<T> = T | Partial<Record<Breakpoint, T>>;

// Color types
export type ColorScheme = "light" | "dark";
export type ColorVariant =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "error"
  | "info";
export type ColorIntensity =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900;

// Size types
export type Size = "xs" | "sm" | "md" | "lg" | "xl";
export type Spacing =
  | 0
  | 1
  | 2
  | 3
  | 4
  | 5
  | 6
  | 8
  | 10
  | 12
  | 16
  | 20
  | 24
  | 32
  | 40
  | 48
  | 56
  | 64;

// Status types
export type LoadingState = "idle" | "loading" | "success" | "error";

// File types
export interface FileUpload {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "success" | "error";
  url?: string;
  error?: string;
}

// Environment types
export type Environment = "development" | "staging" | "production";

// Feature flag types
export type FeatureFlag =
  | "blog_enabled"
  | "contact_form_enabled"
  | "newsletter_enabled"
  | "dark_mode_enabled"
  | "analytics_enabled";

export interface FeatureFlags {
  [key: string]: boolean;
}

// Performance types
export interface PerformanceMetric {
  name: string;
  value: number;
  unit: "ms" | "bytes" | "count";
  timestamp: Date;
}

export interface WebVitals {
  fcp?: number; // First Contentful Paint
  lcp?: number; // Largest Contentful Paint
  fid?: number; // First Input Delay
  cls?: number; // Cumulative Layout Shift
  ttfb?: number; // Time to First Byte
}

// Security types
export interface CSPConfig {
  defaultSrc: string[];
  scriptSrc: string[];
  styleSrc: string[];
  imgSrc: string[];
  connectSrc: string[];
  fontSrc: string[];
  objectSrc: string[];
  mediaSrc: string[];
  frameSrc: string[];
}

// Export utility type for getting all keys of a type
export type AllKeys<T> = T extends any ? keyof T : never;

// Export conditional rendering types
export type RenderProp<T> = (props: T) => React.ReactNode;
export type ConditionalRender<T> = T extends true ? React.ReactNode : never;
