// Mermaid Utility Functions
// Extracted and adapted from the existing InternetFriends portfolio project

export interface MermaidDiagram {
  code: string;
  index: number;
  title?: string;
}

/**
 * Extract Mermaid diagrams from markdown content
 */
export function extractMermaidDiagrams(content: string): MermaidDiagram[] {
  const diagrams: MermaidDiagram[] = [];
  const mermaidRegex = /```mermaid\n([\s\S]*?)\n```/g;
  let match;
  let index = 0;

  while ((match = mermaidRegex.exec(content)) !== null) {
    const code = match[1].trim();
    if (code) {
      diagrams.push({
        code,
        index,
        title: extractDiagramTitle(code, index),
      });
      index++;
    }
  }

  return diagrams;
}

/**
 * Extract title from mermaid code or generate a meaningful one
 */
export function extractDiagramTitle(code: string, index: number): string {
  // Try to extract title from mermaid code
  const titleMatch = code.match(/title\s+(.+)/i);
  if (titleMatch) {
    return titleMatch[1].trim();
  }

  // Try to get diagram type from first line
  const firstLine = code.split("\n")[0].trim();
  const typeMatch = firstLine.match(
    /^(graph|flowchart|sequenceDiagram|classDiagram|stateDiagram|gantt|pie|journey|erDiagram|gitgraph|requirement)/i,
  );

  if (typeMatch) {
    const type = typeMatch[1];
    switch (type.toLowerCase()) {
      case "graph":
      case "flowchart":
        return `Flowchart ${index + 1}`;
      case "sequencediagram":
        return `Sequence Diagram ${index + 1}`;
      case "classdiagram":
        return `Class Diagram ${index + 1}`;
      case "statediagram":
        return `State Diagram ${index + 1}`;
      case "gantt":
        return `Gantt Chart ${index + 1}`;
      case "pie":
        return `Pie Chart ${index + 1}`;
      case "journey":
        return `User Journey ${index + 1}`;
      case "erdiagram":
        return `ER Diagram ${index + 1}`;
      case "gitgraph":
        return `Git Graph ${index + 1}`;
      case "requirement":
        return `Requirement Diagram ${index + 1}`;
      default:
        return `${type} Diagram ${index + 1}`;
    }
  }

  return `Diagram ${index + 1}`;
}

/**
 * Process markdown content and remove Mermaid blocks for regular rendering
 */
export function processMermaidMarkdown(content: string): {
  processedContent: string;
  diagrams: MermaidDiagram[];
} {
  const diagrams = extractMermaidDiagrams(content);

  // Remove Mermaid blocks from content
  const processedContent = content.replace(/```mermaid\n[\s\S]*?\n```/g, "");

  return {
    processedContent,
    diagrams,
  };
}

/**
 * Validate Mermaid diagram syntax (basic validation)
 */
export function validateMermaidSyntax(content: string): {
  isValid: boolean;
  error?: string;
  suggestion?: string;
} {
  if (!content || content.trim().length === 0) {
    return {
      isValid: false,
      error: "Diagram code is empty",
      suggestion: "Please provide diagram content",
    };
  }

  const lines = content
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  if (lines.length === 0) {
    return {
      isValid: false,
      error: "No valid diagram content found",
      suggestion: "Add diagram content with proper syntax",
    };
  }

  const firstLine = lines[0];
  const supportedTypes = [
    "graph",
    "flowchart",
    "sequenceDiagram",
    "classDiagram",
    "stateDiagram",
    "gantt",
    "pie",
    "journey",
    "erDiagram",
    "gitgraph",
    "requirement",
    "mindmap",
    "timeline",
  ];

  const hasValidType = supportedTypes.some((type) =>
    firstLine.toLowerCase().startsWith(type.toLowerCase()),
  );

  if (!hasValidType) {
    return {
      isValid: false,
      error: `Unsupported diagram type. First line: "${firstLine}"`,
      suggestion: `Try starting with one of: ${supportedTypes.join(", ")}`,
    };
  }

  return {
    isValid: true,
  };
}

/**
 * Generate Mermaid configuration based on theme
 */
export function getMermaidConfig(
  theme: "light" | "dark" = "light",
): Record<string, unknown> {
  const baseConfig = {
    startOnLoad: false,
    theme: (theme === "dark" ? "dark" : "default") as "dark" | "default",
    themeVariables: {
      fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif",
      fontSize: "14px",
    },
    flowchart: {
      htmlLabels: true,
      curve: "basis",
      padding: 10,
    },
    sequence: {
      actorMargin: 50,
      width: 150,
      height: 65,
      boxMargin: 10,
      boxTextMargin: 5,
      noteMargin: 10,
      messageMargin: 35,
    },
    gantt: {
      leftPadding: 75,
      gridLineStartPadding: 35,
      fontSize: 11,
      sectionFontSize: 11,
    },
  };

  // Theme-specific customizations
  if (theme === "dark") {
    (baseConfig.themeVariables as Record<string, unknown>) = {
      ...baseConfig.themeVariables,
      primaryTextColor: "#ffffff",
      primaryBorderColor: "#1e40af",
      lineColor: "#6b7280",
      secondaryColor: "#1f2937",
      tertiaryColor: "#374151",
      background: "#111827",
      mainBkg: "#1f2937",
      secondBkg: "#374151",
      tertiaryBkg: "#4b5563",
    };
  } else {
    (baseConfig.themeVariables as Record<string, unknown>) = {
      ...baseConfig.themeVariables,
      primaryTextColor: "#ffffff",
      primaryBorderColor: "#1e40af",
      lineColor: "#d1d5db",
      secondaryColor: "#f9fafb",
      tertiaryColor: "#f3f4f6",
      background: "#ffffff",
      mainBkg: "#ffffff",
      secondBkg: "#f9fafb",
      tertiaryBkg: "#f3f4f6",
    };
  }

  return baseConfig as Record<string, unknown>;
}

// Keep the old name for backward compatibility
export const generateMermaidConfig = getMermaidConfig;

/**
 * Clean and sanitize Mermaid code
 */
export function sanitizeMermaidCode(code: string): string {
  if (!code) return "";

  // Remove potentially dangerous HTML/JS content
  const cleaned = code
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<iframe[^>]*>[\s\S]*?<\/iframe>/gi, "")
    .replace(/javascript:/gi, "")
    .replace(/on\w+\s*=/gi, "");

  return cleaned.trim();
}

/**
 * Convert file type to display name
 */
export function getFileTypeDisplayName(fileType: string): string {
  const typeMap: Record<string, string> = {
    markdown: "Markdown",
    md: "Markdown",
    json: "JSON",
    yaml: "YAML",
    yml: "YAML",
    typescript: "TypeScript",
    ts: "TypeScript",
    tsx: "TSX",
    javascript: "JavaScript",
    js: "JavaScript",
    jsx: "JSX",
    text: "Text",
    txt: "Text",
    mermaid: "Mermaid",
    mmd: "Mermaid",
  };

  return typeMap[fileType.toLowerCase()] || fileType;
}

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };

    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Generate a unique ID for diagram instances
 */
export function generateDiagramId(prefix: string = "mermaid"): string {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}-${Date.now()}`;
}

/**
 * Check if the current environment supports Mermaid
 */
export function isMermaidSupported(): boolean {
  if (typeof window === "undefined") {
    return false; // Server-side rendering
  }

  // Check if the browser supports the features we need
  return !!(
    typeof window.requestAnimationFrame === "function" &&
    typeof document.querySelector === "function" &&
    typeof document.createElement === "function"
  );
}
