"use client";

import * as React from "react";
const { useEffect, useRef, useState } = React;
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import mermaid from "mermaid";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  enableMermaid?: boolean;
  theme?: "light" | "dark";
}

export const MarkdownRendererAtomic: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
  enableMermaid = true,
  theme = "light"
}) => {
  const [renderedContent, setRenderedContent] = useState(content);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (enableMermaid) {
      mermaid.initialize({
        startOnLoad: false,
        theme: theme === "dark" ? "dark" : "default",
        securityLevel: "loose",
        fontFamily: "Inter, system-ui, sans-serif",
        flowchart: {
          useMaxWidth: true,
          htmlLabels: true,
        },
        sequence: {
          useMaxWidth: true,
        },
        themeVariables: {
          primaryColor: "#3b82f6",
          primaryTextColor: "#111827",
          primaryBorderColor: "#e5e7eb",
          lineColor: "#6b7280",
          sectionBkColor: "#f9fafb",
          altSectionBkColor: "#ffffff",
          gridColor: "#e5e7eb",
          secondaryColor: "#f3f4f6",
          tertiaryColor: "#fafafa",
        },
      });
    }
  }, [enableMermaid, theme]);

  useEffect(() => {
    const processMermaidDiagrams = async () => {
      if (!enableMermaid || !containerRef.current) return;

      const mermaidBlocks = containerRef.current.querySelectorAll("code.language-mermaid");
      
      for (let i = 0; i < mermaidBlocks.length; i++) {
        const block = mermaidBlocks[i];
        const parent = block.parentElement;
        
        if (parent && block.textContent) {
          try {
            const { svg } = await mermaid.render(`mermaid-${Date.now()}-${i}`, block.textContent);
            
            const wrapper = document.createElement("div");
            wrapper.className = "mermaid-diagram border rounded-lg p-4 bg-white my-4";
            wrapper.innerHTML = svg;
            
            parent.replaceWith(wrapper);
          } catch (error) {
            console.error("Mermaid rendering error:", error);
            
            const errorWrapper = document.createElement("div");
            errorWrapper.className = "mermaid-error border border-red-200 rounded-lg p-4 bg-red-50 my-4";
            errorWrapper.innerHTML = `
              <div class="text-red-600 text-sm font-medium mb-2">Mermaid Diagram Error</div>
              <pre class="text-red-500 text-xs overflow-x-auto">${block.textContent}</pre>
            `;
            parent.replaceWith(errorWrapper);
          }
        }
      }
    };

    processMermaidDiagrams();
  }, [renderedContent, enableMermaid]);

  const customComponents = {
    pre: ({ children, ...props }: any) => (
      <pre
        {...props}
        className="bg-gray-50 border rounded-lg p-4 overflow-x-auto text-sm font-mono my-4"
      >
        {children}
      </pre>
    ),
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || "");
      const language = match ? match[1] : "";

      if (!inline && language === "mermaid") {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      return inline ? (
        <code
          className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800"
          {...props}
        >
          {children}
        </code>
      ) : (
        <code className={className} {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children, ...props }: any) => (
      <h1
        className="text-2xl font-bold mb-4 text-gray-900 border-b border-gray-200 pb-2"
        {...props}
      >
        {children}
      </h1>
    ),
    h2: ({ children, ...props }: any) => (
      <h2 className="text-xl font-semibold mb-3 text-gray-800 mt-6" {...props}>
        {children}
      </h2>
    ),
    h3: ({ children, ...props }: any) => (
      <h3 className="text-lg font-medium mb-2 text-gray-700 mt-4" {...props}>
        {children}
      </h3>
    ),
    h4: ({ children, ...props }: any) => (
      <h4 className="text-base font-medium mb-2 text-gray-700 mt-3" {...props}>
        {children}
      </h4>
    ),
    p: ({ children, ...props }: any) => (
      <p className="mb-4 text-gray-600 leading-relaxed" {...props}>
        {children}
      </p>
    ),
    ul: ({ children, ...props }: any) => (
      <ul className="list-disc list-inside mb-4 space-y-1 text-gray-600" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="list-decimal list-inside mb-4 space-y-1 text-gray-600" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="ml-4" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }: any) => (
      <blockquote
        className="border-l-4 border-blue-500 pl-4 py-2 mb-4 bg-blue-50 text-gray-700 italic"
        {...props}
      >
        {children}
      </blockquote>
    ),
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border border-gray-200 rounded-lg" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }: any) => (
      <th
        className="border-b border-gray-200 bg-gray-50 px-4 py-2 text-left text-sm font-medium text-gray-700"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border-b border-gray-100 px-4 py-2 text-sm text-gray-600" {...props}>
        {children}
      </td>
    ),
    a: ({ children, href, ...props }: any) => (
      <a
        href={href}
        className="text-blue-600 hover:text-blue-800 underline focus:border-dashed focus:border-2 focus:border-blue-500 focus:outline-none"
        {...props}
      >
        {children}
      </a>
    ),
    strong: ({ children, ...props }: any) => (
      <strong className="font-semibold text-gray-800" {...props}>
        {children}
      </strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className="italic text-gray-700" {...props}>
        {children}
      </em>
    ),
  };

  return (
    <div
      ref={containerRef}
      className={`markdown-content prose max-w-none ${className}`}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={customComponents}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};