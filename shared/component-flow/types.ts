import { ComponentType } from "react";
import { Node, Edge } from "reactflow";

// Base component preview data
export interface ComponentPreviewNodeData {
  componentName: string;
  componentType: 'atomic' | 'molecular' | 'organism' | 'template' | 'page';
  component: ComponentType<any>;
  defaultProps?: Record<string, unknown>;
  availableProps?: ComponentProp[];
  initialWidth?: number;
  initialHeight?: number;
  theme?: 'light' | 'dark' | 'system';
  locale?: string;
  version?: string;
  documentation?: ComponentDocumentation;
  tags?: string[];
  category?: string;
  deprecated?: boolean;
  experimental?: boolean;
}

// Component property definition
export interface ComponentProp {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select' | 'object' | 'array' | 'function';
  required?: boolean;
  defaultValue?: unknown;
  description?: string;
  options?: string[]; // For select type
  validation?: ValidationRule[];
  category?: string;
}

// Validation rules for props
export interface ValidationRule {
  type: 'required' | 'minLength' | 'maxLength' | 'min' | 'max' | 'pattern' | 'custom';
  value?: unknown;
  message?: string;
  validator?: (event: Event) => boolean | string;
}

// Component documentation
export interface ComponentDocumentation {
  description?: string;
  examples?: ComponentExample[];
  notes?: string[];
  accessibility?: AccessibilityInfo;
  performance?: PerformanceInfo;
  links?: ExternalLink[];
}

// Component usage examples
export interface ComponentExample {
  title: string;
  description?: string;
  props: Record<string, unknown>;
  code?: string;
}

// Accessibility information
export interface AccessibilityInfo {
  ariaLabel?: string;
  ariaDescribedBy?: string;
  keyboardNavigation?: string[];
  screenReaderNotes?: string[];
  colorContrastCompliant?: boolean;
}

// Performance information
export interface PerformanceInfo {
  bundleSize?: string;
  renderTime?: string;
  reRenderTriggers?: string[];
  optimizations?: string[];
}

// External links
export interface ExternalLink {
  title: string;
  url: string;
  type: 'documentation' | 'design' | 'repo' | 'demo' | 'other';
}

// React Flow node types
export type ComponentPreviewNode = Node<ComponentPreviewNodeData, 'componentPreview'>;

// Flow connections for component composition
export interface ComponentConnection extends Edge {
  sourceComponent?: string;
  targetComponent?: string;
  propMapping?: PropMapping;
}

// Prop mapping for component connections
export interface PropMapping {
  sourceProp: string;
  targetProp: string;
  transform?: (event: Event) => any;
}

// Component registry entry
export interface ComponentRegistryEntry {
  id: string;
  path: string;
  component: ComponentType<any>;
  metadata: ComponentPreviewNodeData;
  exports?: string[];
  imports?: ComponentDependency[];
  lastModified?: Date;
  checksum?: string;
}

// Component dependencies
export interface ComponentDependency {
  name: string;
  version?: string;
  type: 'internal' | 'external' | 'peer';
  optional?: boolean;
}

// Flow workspace
export interface ComponentFlowWorkspace {
  id: string;
  name: string;
  description?: string;
  nodes: ComponentPreviewNode[];
  edges: ComponentConnection[];
  viewport?: { x: number; y: number; zoom: number };
  theme?: 'light' | 'dark' | 'system';
  locale?: string;
  settings?: WorkspaceSettings;
  metadata?: WorkspaceMetadata;
}

// Workspace settings
export interface WorkspaceSettings {
  autoLayout?: boolean;
  snapToGrid?: boolean;
  gridSize?: number;
  showMinimap?: boolean;
  showControls?: boolean;
  multiSelectionKeyCode?: string;
  deleteKeyCode?: string;
  panOnScroll?: boolean;
  zoomOnScroll?: boolean;
  zoomOnDoubleClick?: boolean;
  defaultNodeColor?: string;
  defaultEdgeColor?: string;
}

// Workspace metadata
export interface WorkspaceMetadata {
  created?: Date;
  modified?: Date;
  author?: string;
  version?: string;
  tags?: string[];
  category?: string;
  public?: boolean;
  collaborative?: boolean;
}

// Component flow events
export interface ComponentFlowEvent {
  type: 'node:select' | 'node:deselect' | 'node:move' | 'node:resize' | 'prop:change' | 'edge:connect' | 'edge:disconnect';
  nodeId?: string;
  edgeId?: string;
  data?: unknown;
  timestamp?: Date;
}

// MDX integration types
export interface MDXComponentNode {
  frontmatter?: Record<string, unknown>;
  content?: string;
  components?: ComponentRegistryEntry[];
  exports?: MDXExport[];
  imports?: MDXImport[];
}

// MDX exports
export interface MDXExport {
  name: string;
  type: 'component' | 'function' | 'constant' | 'type';
  description?: string;
  example?: string;
}

// MDX imports
export interface MDXImport {
  source: string;
  imports: string[];
  type: 'default' | 'named' | 'namespace';
}

// Microfrontend integration
export interface MicrofrontendManifest {
  name: string;
  version: string;
  components: ComponentRegistryEntry[];
  dependencies: ComponentDependency[];
  remoteEntry?: string;
  exposedModules?: Record<string, string>;
  sharedModules?: Record<string, unknown>;
}

// Internationalization support
export interface I18nComponentData {
  defaultLocale: string;
  supportedLocales: string[];
  translationKeys?: string[];
  rtlSupport?: boolean;
  localeSpecificProps?: Record<string, ComponentProp[]>;
}

// Theme integration
export interface ThemeComponentData {
  supportedThemes: string[];
  themeVariables?: Record<string, string>;
  themeSpecificProps?: Record<string, ComponentProp[]>;
  darkModeSupport?: boolean;
  highContrastSupport?: boolean;
}

// Data pipeline integration
export interface DataPipelineNode {
  id: string;
  type: 'source' | 'transform' | 'sink' | 'component';
  data: unknown;
  connections: string[];
  schema?: unknown;
  validation?: ValidationRule[];
}

// Component flow analytics
export interface ComponentAnalytics {
  usage: {
    totalRenders: number;
    avgRenderTime: number;
    errorRate: number;
    popularProps: Record<string, number>;
  };
  performance: {
    bundleImpact: number;
    memoryUsage: number;
    reRenderFrequency: number;
  };
  accessibility: {
    score: number;
    issues: string[];
    improvements: string[];
  };
}

// Export utility types
export type ComponentFlowEventHandler = (event: ComponentFlowEvent) => void;
export type PropValidator = (value: unknown, prop: ComponentProp) => boolean | string;
export type ComponentTransformer = (component: ComponentType<any>, metadata: ComponentPreviewNodeData) => ComponentType<any>;
