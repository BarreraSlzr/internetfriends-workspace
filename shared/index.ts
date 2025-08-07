// Shared Utilities Index - InternetFriends Component Flow System
// Central exports for all shared utilities, patterns, and integrations

// Component Flow System
export { ComponentPreviewNode } from './component-flow/component.preview.node';
export { ComponentFlowWorkspaceProvider, ComponentFlowWorkspace } from './component-flow/component.flow.workspace';
export { componentRegistry, registerInternetFriendsComponents, createComponentEntry } from './component-flow/component.registry';
export type {
  ComponentPreviewNodeData,
  ComponentProp,
  ValidationRule,
  ComponentDocumentation,
  ComponentExample,
  AccessibilityInfo,
  PerformanceInfo,
  ExternalLink,
  ComponentPreviewNode as ComponentPreviewNodeType,
  ComponentConnection,
  PropMapping,
  ComponentRegistryEntry,
  ComponentDependency,
  ComponentFlowWorkspace as ComponentFlowWorkspaceType,
  WorkspaceSettings,
  WorkspaceMetadata,
  ComponentFlowEvent,
  MDXComponentNode,
  MDXExport,
  MDXImport,
  MicrofrontendManifest,
  I18nComponentData,
  ThemeComponentData,
  DataPipelineNode,
  ComponentAnalytics,
  ComponentFlowEventHandler,
  PropValidator,
  ComponentTransformer,
} from './component-flow/types';

// Design System Patterns
export {
  lightTheme,
  darkTheme,
  buttonPattern,
  inputPattern,
  cardPattern,
  modalPattern,
  patterns,
  themes,
  utilities,
  PatternUtility,
  MDXPatternIntegration,
  MicrofrontendPatternIntegration,
  DataPipelinePatternIntegration,
} from './patterns/design-system.patterns';
export type {
  InternetFriendsTheme,
  ComponentPattern,
  MDXComponentConfig,
  MicrofrontendModule,
  DataPipelineSchema,
} from './patterns/design-system.patterns';

// Integration Utilities
export {
  integrationUtilities,
  MDXIntegrationUtility,
  MicrofrontendIntegrationUtility,
  I18nIntegrationUtility,
  DataPipelineIntegrationUtility,
  StreamlinedDevelopmentOrchestrator,
} from './utilities/integration.utilities';

// Utility functions for quick access
export const createComponent = createComponentEntry;
export const getTheme = (name: 'light' | 'dark') => themes[name];
export const getPattern = (name: 'button' | 'input' | 'card' | 'modal') => patterns[name];
export const registry = componentRegistry;

// Re-export commonly used types
export type Theme = InternetFriendsTheme;
export type Pattern = ComponentPattern;
export type Component = ComponentRegistryEntry;
export type NodeData = ComponentPreviewNodeData;

// Default export for convenience
export default {
  // Core systems
  componentRegistry,
  patterns,
  themes,
  utilities,
  integrationUtilities,

  // Quick access functions
  createComponent: createComponentEntry,
  getTheme: (name: 'light' | 'dark') => themes[name],
  getPattern: (name: 'button' | 'input' | 'card' | 'modal') => patterns[name],

  // Component Flow System
  ComponentFlowWorkspace: ComponentFlowWorkspaceProvider,

  // Initialization helpers
  init: {
    registerComponents: registerInternetFriendsComponents,
    setupTheme: (theme: InternetFriendsTheme) => PatternUtility.applyTheme(theme),
  },
};
