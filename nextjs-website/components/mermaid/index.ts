// InternetFriends Mermaid Components
// Main export file for all Mermaid-related functionality

// Viewer components
export { MermaidViewer } from './viewer/mermaid-viewer';
export { MarkdownRenderer } from './viewer/markdown-renderer';

// Utilities
export {
  extractMermaidDiagrams,
  extractDiagramTitle,
  processMermaidMarkdown,
  validateMermaidSyntax,
  getMermaidConfig,
  sanitizeMermaidCode,
  getFileTypeDisplayName,
  debounce,
  generateDiagramId,
  isMermaidSupported,
} from './utils';

// Types
export type {
  MermaidDiagram,
} from './utils';

export type {
  MermaidViewerProps,
  ZoomState,
} from './viewer/mermaid-viewer';

export type {
  MarkdownRendererProps,
  DiagramWithTitle,
} from './viewer/markdown-renderer';

// Re-export for convenience
export { MermaidViewer as Mermaid } from './viewer/mermaid-viewer';
export { MarkdownRenderer as Markdown } from './viewer/markdown-renderer';

// Default exports
export { MermaidViewer as default } from './viewer/mermaid-viewer';
