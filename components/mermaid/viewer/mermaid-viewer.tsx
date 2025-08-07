"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useTheme } from "@/hooks/use-theme";
import { ButtonAtomic } from "@/components/atomic/button";
import {
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  Download,
} from "lucide-react";
import {
  sanitizeMermaidCode,
  validateMermaidSyntax,
  getMermaidConfig,
  generateDiagramId,
  debounce,
} from "../utils";

export interface MermaidViewerProps {
  /** Mermaid diagram code */
  code: string;
  /** Optional title for the diagram */
  title?: string;
  /** Container height */
  height?: string | number;
  /** Container width */
  width?: string | number;
  /** Additional CSS classes */
  className?: string;
  /** Show zoom controls */
  showZoomControls?: boolean;
  /** Show fullscreen toggle */
  showFullscreen?: boolean;
  /** Show download button */
  showDownload?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Error callback */
  onError?: (error: string) => void;
  /** Success callback */
  onRender?: () => void;
  /** Test identifier */
  "data-testid"?: string;
}

export interface ZoomState {
  scale: number;
  translateX: number;
  translateY: number;
}

export const MermaidViewer: React.FC<MermaidViewerProps> = ({
  code,
  title,
  height = "400px",
  width = "100%",
  className,
  showZoomControls = true,
  showFullscreen = true,
  showDownload = true,
  loading = false,
  onError,
  onRender,
  "data-testid": testId,
}) => {
  const { theme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(loading);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [diagramId] = useState(() => generateDiagramId());
  const [zoomState, setZoomState] = useState<ZoomState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });
  const [isDragging, setIsDragging] = useState(false);
  const [lastMousePos, setLastMousePos] = useState({ x: 0, y: 0 });

  // Mermaid instance
  const [mermaid, setMermaid] = useState<any>(null);

  // Initialize Mermaid
  useEffect(() => {
    let isMounted = true;

    const initMermaid = async () => {
      try {
        const mermaidModule = await import("mermaid");
        if (!isMounted) return;

        const mermaidInstance = mermaidModule.default;
        const config = getMermaidConfig(theme.colorScheme);

        mermaidInstance.initialize(config);
        setMermaid(mermaidInstance);
      } catch (err) {
        console.error("Failed to initialize Mermaid:", err);
        if (isMounted) {
          setError("Failed to initialize diagram renderer");
          onError?.("Failed to initialize diagram renderer");
        }
      }
    };

    initMermaid();

    return () => {
      isMounted = false;
    };
  }, [theme.colorScheme, onError]);

  // Render diagram
  const renderDiagram = useCallback(async () => {
    if (!mermaid || !code || !svgRef.current) return;

    setIsLoading(true);
    setError(null);

    try {
      // Validate syntax
      const validation = validateMermaidSyntax(code);
      if (!validation.isValid) {
        throw new Error(
          `Invalid diagram syntax: ${validation.errors.join(", ")}`,
        );
      }

      // Sanitize code
      const sanitizedCode = sanitizeMermaidCode(code);

      // Clear previous content
      svgRef.current.innerHTML = "";

      // Render the diagram
      const { svg, bindFunctions } = await mermaid.render(
        diagramId,
        sanitizedCode,
      );

      if (svg) {
        svgRef.current.innerHTML = svg;

        // Bind any interactive functions if present
        if (bindFunctions) {
          bindFunctions(svgRef.current);
        }

        // Apply zoom transform
        const svgElement = svgRef.current.querySelector("svg");
        if (svgElement) {
          svgElement.style.transform = `translate(${zoomState.translateX}px, ${zoomState.translateY}px) scale(${zoomState.scale})`;
          svgElement.style.transformOrigin = "center center";
          svgElement.style.transition = isDragging
            ? "none"
            : "transform 0.3s ease";
        }

        onRender?.();
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to render diagram";
      console.error("Mermaid render error:", err);
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [mermaid, code, diagramId, zoomState, isDragging, onRender, onError]);

  // Debounced render function
  const debouncedRender = useCallback(debounce(renderDiagram, 300), [
    renderDiagram,
  ]);

  // Re-render when code or theme changes
  useEffect(() => {
    debouncedRender();
  }, [debouncedRender]);

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoomState((prev) => ({
      ...prev,
      scale: Math.min(prev.scale * 1.2, 3),
    }));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoomState((prev) => ({
      ...prev,
      scale: Math.max(prev.scale / 1.2, 0.3),
    }));
  }, []);

  const handleZoomReset = useCallback(() => {
    setZoomState({
      scale: 1,
      translateX: 0,
      translateY: 0,
    });
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!isFullscreen && containerRef.current.requestFullscreen) {
        await containerRef.current.requestFullscreen();
        setIsFullscreen(true);
      } else if (isFullscreen && document.exitFullscreen) {
        await document.exitFullscreen();
        setIsFullscreen(false);
      }
    } catch (err) {
      console.error("Fullscreen toggle failed:", err);
    }
  }, [isFullscreen]);

  // Download as SVG
  const handleDownload = useCallback(() => {
    const svgElement = svgRef.current?.querySelector("svg");
    if (!svgElement) return;

    try {
      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgElement);
      const blob = new Blob([svgString], { type: "image/svg+xml" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `${title || "mermaid-diagram"}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download failed:", err);
    }
  }, [title]);

  // Mouse handlers for panning
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setIsDragging(true);
    setLastMousePos({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastMousePos.x;
      const deltaY = e.clientY - lastMousePos.y;

      setZoomState((prev) => ({
        ...prev,
        translateX: prev.translateX + deltaX,
        translateY: prev.translateY + deltaY,
      }));

      setLastMousePos({ x: e.clientX, y: e.clientY });
    },
    [isDragging, lastMousePos],
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // Mouse event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();

      const delta = e.deltaY * -0.01;
      const newScale = Math.min(Math.max(zoomState.scale + delta, 0.3), 3);

      setZoomState((prev) => ({
        ...prev,
        scale: newScale,
      }));
    },
    [zoomState.scale],
  );

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case "+":
        case "=":
          e.preventDefault();
          handleZoomIn();
          break;
        case "-":
          e.preventDefault();
          handleZoomOut();
          break;
        case "0":
          e.preventDefault();
          handleZoomReset();
          break;
        case "f":
        case "F11":
          e.preventDefault();
          toggleFullscreen();
          break;
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleZoomIn, handleZoomOut, handleZoomReset, toggleFullscreen]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative border border-border rounded-lg overflow-hidden bg-background",
        isFullscreen && "fixed inset-0 z-50 rounded-none",
        className,
      )}
      style={{
        width: isFullscreen ? "100vw" : width,
        height: isFullscreen ? "100vh" : height,
      }}
      data-testid={testId}
      tabIndex={0}
    >
      {/* Header */}
      {title && (
        <div className="flex items-center justify-between p-3 border-b border-border bg-muted/50">
          <h3 className="text-sm font-medium text-foreground truncate">
            {title}
          </h3>
          <div className="flex items-center gap-1">
            {showZoomControls && (
              <>
                <ButtonAtomic
                  variant="ghost"
                  size="xs"
                  onClick={handleZoomOut}
                  disabled={zoomState.scale <= 0.3}
                  aria-label="Zoom out"
                >
                  <ZoomOut size={14} />
                </ButtonAtomic>
                <span className="text-xs text-muted-foreground min-w-[3rem] text-center">
                  {Math.round(zoomState.scale * 100)}%
                </span>
                <ButtonAtomic
                  variant="ghost"
                  size="xs"
                  onClick={handleZoomIn}
                  disabled={zoomState.scale >= 3}
                  aria-label="Zoom in"
                >
                  <ZoomIn size={14} />
                </ButtonAtomic>
                <ButtonAtomic
                  variant="ghost"
                  size="xs"
                  onClick={handleZoomReset}
                  aria-label="Reset zoom"
                >
                  <RotateCcw size={14} />
                </ButtonAtomic>
              </>
            )}
            {showDownload && (
              <ButtonAtomic
                variant="ghost"
                size="xs"
                onClick={handleDownload}
                disabled={!!error || isLoading}
                aria-label="Download SVG"
              >
                <Download size={14} />
              </ButtonAtomic>
            )}
            {showFullscreen && (
              <ButtonAtomic
                variant="ghost"
                size="xs"
                onClick={toggleFullscreen}
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
              >
                {isFullscreen ? (
                  <Minimize2 size={14} />
                ) : (
                  <Maximize2 size={14} />
                )}
              </ButtonAtomic>
            )}
          </div>
        </div>
      )}

      {/* Diagram Container */}
      <div
        className="relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing"
        style={{
          height: title ? "calc(100% - 3.5rem)" : "100%",
        }}
        onMouseDown={handleMouseDown}
        onWheel={handleWheel}
      >
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="flex flex-col items-center gap-2">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-muted-foreground">
                Rendering diagram...
              </span>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background">
            <div className="text-center p-6">
              <div className="text-red-500 mb-2">⚠️</div>
              <h4 className="text-sm font-medium text-foreground mb-1">
                Failed to render diagram
              </h4>
              <p className="text-xs text-muted-foreground">{error}</p>
            </div>
          </div>
        )}

        {/* SVG Container */}
        <div
          ref={svgRef}
          className="w-full h-full flex items-center justify-center"
          style={{
            minHeight: "100%",
            overflow: "visible",
          }}
        />
      </div>

      {/* Fullscreen hint */}
      {isFullscreen && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/75 text-white text-xs px-3 py-1 rounded-full">
          Press F or ESC to exit fullscreen
        </div>
      )}
    </div>
  );
};

MermaidViewer.displayName = "MermaidViewer";
