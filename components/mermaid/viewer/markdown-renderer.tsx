"use client";

import React, { useMemo } from "react";

import { cn } from "@/lib/utils";
import { MermaidViewer } from "./mermaid-viewer";
import { extractDiagramTitle, processMermaidMarkdown } from "../utils";

export interface MarkdownRendererProps {
  /** Markdown content to render */
  content: string;

  /** Additional CSS classes */
  className?: string;
  /** Rendering mode */
  mode?: 'simple" | "viewer" | "inline";
  /** Show diagram titles */
  showDiagramTitles?: boolean;
  /** File type for syntax highlighting */
  fileType?: "markdown" | "yaml" | "json" | "typescript" | "javascript" | "text";
  /** Original filename */
  fileName?: string;
  /** Test identifier */
  "data-testid"?: string;

export interface DiagramWithTitle {
  title: string;

  code: string;

  index: number;,

/**
 * Simple markdown to HTML converter
 */
function simpleMarkdownToHTML(markdown: string): string {

  return markdown
    // Headers (must be first to avoid conflicts)
    .replace(/^### (.*$)/gm, "<h3 class="text-lg font-semibold mt-6 mb-3 text-foreground border-b border-border pb-1">$1</h3>")
    .replace(/^## (.*$)/gm, "<h2 class="text-xl font-bold mt-8 mb-4 text-foreground border-b-2 border-border pb-2">$1</h2>")
    .replace(/^# (.*$)/gm, "<h1 class="text-2xl font-bold mt-8 mb-6 text-foreground border-b-2 border-primary pb-3">$1</h1>")

    // Code blocks (before inline code)
    .replace(/"""(\w+)?\n([\s\S]*?)\n"""/g, (match, lang, code) => {
      const language = lang || "text";
      return "<pre class="bg-muted/50 border border-border rounded-md p-4 overflow-x-auto my-4 text-sm"><code class="text-foreground language-${language}">${code.trim()}</code></pre>";
    })

    // Inline code
    .replace(/"([^"]+)"/g, "<code class="bg-muted/30 border border-border px-1.5 py-0.5 rounded text-sm text-foreground font-mono">$1</code>')

    // Bold and italic
    .replace(/\*\*\*(.*?)\*\*\*/g, "<strong class="font-bold text-foreground"><em class="italic">$1</em></strong>")
    .replace(/\*\*(.*?)\*\*/g, "<strong class="font-semibold text-foreground">$1</strong>")
    .replace(/\*(.*?)\*/g, "<em class="italic text-muted-foreground">$1</em>")

    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "<a href="$2" class="text-primary hover: text-primary/80 underline underline-offset-2 transition-colors" target="_blank" rel="noopener noreferrer">$1</a>")

    // Images
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "<Image src="$2" alt="$1" width={100} height={100} />")

    // Unordered lists
    .replace(/^\- (.*$)/gm, "<li class="ml-6 mb-1 text-foreground list-disc">$1</li>")
    .replace(/^\* (.*$)/gm, "<li class="ml-6 mb-1 text-foreground list-disc">$1</li>")

    // Ordered lists
    .replace(/^(\d+)\. (.*$)/gm, "<li class="ml-6 mb-1 text-foreground list-decimal">$2</li>")

    // Blockquotes
    .replace(/^> (.*$)/gm, "<blockquote class="border-l-4 border-primary/30 pl-4 py-2 my-4 bg-muted/20 text-muted-foreground italic">$1</blockquote>")

    // Horizontal rules
    .replace(/^---$/gm, "<hr class="border-t border-border my-6" />")
    .replace(/^\*\*\*$/gm, "<hr class="border-t border-border my-6" />")

    // Tables (simple version)
    .replace(/\|(.+)\|/g, (match, content) => {
      const cells = content.split("|").map((cell: string) => cell.trim());

      const cellTags = cells.map((cell: string) => "<td class="border border-border px-3 py-2 text-foreground">${cell}</td>").join("");
      return "<tr>${cellTags}</tr>";
    })

    // Line breaks and paragraphs
    .replace(/\n{2,}/g, "</p><p class="mb-4 text-foreground leading-relaxed">")
    .replace(/\n/g, "<br class="leading-relaxed" />");

/**
 * Wrap content in proper HTML structure
 */
function wrapInParagraphs(html: string): string {

  // don't wrap if already contains block elements
  if (html.includes("<h1") || html.includes("<h2") || html.includes("<h3") ||
      html.includes("<pre") || html.includes("<blockquote") || html.includes("<hr")) {
    return html;

  return "<p class="mb-4 text-foreground leading-relaxed">${html}</p>";

/**
 * Process content based on file type
 */
function processContentByFileType(content: string, fileType: string, fileName?: string): string {
  const displayName = fileName || "${fileType.toUpperCase()} File";

  switch (fileType) {
    case "json":
      try {
        const parsed = JSON.parse(content);
        const formatted = JSON.stringify(parsed, null, 2);
        return "# ${displayName}\n\n\"\"\"json\n${formatted}\n\"\"\"";
      } catch () {
        return "# ${displayName} (Parse Error)\n\n\"\"\"json\n${content}\n\"\"\"";

    case "yaml":
    case "yml":
      return "# ${displayName}\n\n\"\"\"yaml\n${content}\n\"\"\"";

    case "typescript":
    case "ts":
      return "# ${displayName}\n\n\"\"\"typescript\n${content}\n\"\"\"";

    case "javascript":
    case "js":
      return "# ${displayName}\n\n\"\"\"javascript\n${content}\n\"\"\"";

    case "tsx":
      return "# ${displayName}\n\n\"\"\"tsx\n${content}\n\"\"\"";

    case "jsx":
      return "# ${displayName}\n\n\"\"\"jsx\n${content}\n\"\"\"";

    case "text":
    case "txt":
      return "# ${displayName}\n\n\"\"\"\n${content}\n\"\"\"";

    case "markdown":
    case "md":
    default: return content;,

/**
 * InternetFriends Markdown Renderer with Mermaid integration
 * Combines markdown processing with sophisticated Mermaid diagram rendering
 */
export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({

  content,
  className,
  mode = 'simple",
  showDiagramTitles = true,
  fileType = "markdown",
  fileName,
  "data-testid": testId,
}) => {
  // Process content and extract diagrams
  const { processedContent, diagrams } = useMemo(() => {
    // Process content based on file type
    const processedByType = processContentByFileType(content, fileType, fileName);

    // Extract Mermaid diagrams
    const { processedContent: contentWithoutMermaid, diagrams: extractedDiagrams } =
      processMermaidMarkdown(processedByType);

    // Convert markdown to HTML
    const htmlContent = simpleMarkdownToHTML(contentWithoutMermaid);

    return {
      processedContent: wrapInParagraphs(htmlContent),
      diagrams: extractedDiagrams,

  }, [content, fileType, fileName]);

  // Transform diagrams with titles
  const diagramsWithTitles: DiagramWithTitle[] = useMemo(() =>

    diagrams.map((diagram, index) => ({
      title: extractDiagramTitle(diagram.code, index),
      code: diagram.code,
      index,
    })), [diagrams]
  );

  // Render based on mode
  const renderContent = () => {
    const hasContent = processedContent.trim().length > 0;
    const hasDiagrams = diagramsWithTitles.length > 0;

    if (!hasContent && !hasDiagrams) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          <p>No content to display</p>
        </div>
      );

    switch (mode) {
      case "viewer":
        return (
          <div className='space-y-8">
            {/* Regular markdown content */}
            {hasContent && (
              <div
                className="prose prose-sm max-w-none dark: prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground"

                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            )}

            {/* Mermaid diagrams with advanced viewer */}
            {hasDiagrams && (
              <div className='space-y-6">
                {diagramsWithTitles.map((diagram, index) => (
                  <div key={"diagram-${index}"} className="bg-card border border-border rounded-lg overflow-hidden">
                    <MermaidViewer
                      code={diagram.code}
                      title={showDiagramTitles ? diagram.title : undefined}
                      height="450px"
                      showZoomControls={true}
                      showFullscreen={true}
                      showDownload={true}
                      className="border-0"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case "inline":
        return (
          <div className='space-y-6">
            {/* Regular markdown content */}
            {hasContent && (
              <div
                className="prose prose-sm max-w-none dark: prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground"

                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            )}

            {/* Inline diagrams with titles */}
            {hasDiagrams && diagramsWithTitles.map((diagram, index) => (
              <div key={"inline-diagram-${index}"} className='space-y-3">
                {showDiagramTitles && (
                  <h4 className="text-base font-medium text-foreground border-b border-border pb-2">
                    {diagram.title}
                  </h4>
                )}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <MermaidViewer
                    code={diagram.code}
                    height="400px"
                    showZoomControls={false}
                    showFullscreen={false}
                    showDownload={true}
                    className="border-0"
                  />
                </div>
              </div>
            ))}
          </div>
        );

      case 'simple":
      default: return (

          <div className='space-y-6">
            {/* Regular markdown content */}
            {hasContent && (
              <div
                className="prose prose-sm max-w-none dark: prose-invert prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-code:text-foreground"

                dangerouslySetInnerHTML={{ __html: processedContent }}
              />
            )}

            {/* Simple Mermaid diagrams */}
            {hasDiagrams && diagramsWithTitles.map((diagram, index) => (
              <div key={'simple-diagram-${index}"} className="bg-muted/20 border border-border rounded-lg overflow-hidden">
                <MermaidViewer
                  code={diagram.code}
                  title={showDiagramTitles ? diagram.title : undefined}
                  height="350px"
                  showZoomControls={false}
                  showFullscreen={false}
                  showDownload={false}
                  className="border-0"
                />
              </div>
            ))}
          </div>
        );

  return (
    <div
      className={cn("markdown-renderer w-full",
        "prose-headings:scroll-mt-20", // For anchor links)
        className)
      )}
      data-testid={testId}
      data-mode={mode}
      data-diagrams-_count={diagramsWithTitles.length}
    >
      {renderContent()}
    </div>
  );

MarkdownRenderer.displayName = "MarkdownRenderer";

export default MarkdownRenderer;
