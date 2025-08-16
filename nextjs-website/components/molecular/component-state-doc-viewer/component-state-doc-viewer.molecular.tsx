"use client";

import * as React from "react";
const { useState, useEffect } = React;
import { MarkdownRendererAtomic } from "@/components/atomic/markdown-renderer/markdown-renderer.atomic";
import { ComponentStateAnalyzer, ComponentStateMachine } from "@/lib/design-system/component-state-analyzer";
import { ComponentMetadata } from "@/lib/design-system/component-discovery";
import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";
import { ButtonAtomic } from "@/components/atomic/button/button.atomic";
import { Zap, FileText, Code, Eye, EyeOff } from "lucide-react";

interface ComponentStateDocViewerProps {
  component: ComponentMetadata;
  className?: string;
}

export const ComponentStateDocViewer: React.FC<ComponentStateDocViewerProps> = ({
  component,
  className = ""
}) => {
  const [stateMachine, setStateMachine] = useState<ComponentStateMachine | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showRawData, setShowRawData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const analyzeComponent = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await ComponentStateAnalyzer.analyzeComponent(component);
      setStateMachine(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to analyze component");
      console.error("Component analysis error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    analyzeComponent();
  }, [component.id]);

  if (isLoading) {
    return (
      <GlassCardAtomic className={`p-6 ${className}`}>
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-blue-500 animate-pulse" />
          <span className="text-sm text-gray-600">Analyzing component state machine...</span>
        </div>
      </GlassCardAtomic>
    );
  }

  if (error) {
    return (
      <GlassCardAtomic variant="subtle" className={`p-6 ${className}`}>
        <div className="flex items-center gap-3 text-red-600">
          <Zap className="w-5 h-5" />
          <span className="text-sm">Analysis Error: {error}</span>
        </div>
        <ButtonAtomic
          variant="outline"
          size="sm"
          onClick={analyzeComponent}
          className="mt-3"
        >
          Retry Analysis
        </ButtonAtomic>
      </GlassCardAtomic>
    );
  }

  if (!stateMachine) {
    return (
      <GlassCardAtomic variant="subtle" className={`p-6 ${className}`}>
        <div className="text-center text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No state machine data available</p>
        </div>
      </GlassCardAtomic>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="w-5 h-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-800">
            {stateMachine.componentName} State Documentation
          </h3>
        </div>
        
        <div className="flex items-center gap-2">
          <ButtonAtomic
            variant="ghost"
            size="sm"
            onClick={() => setShowRawData(!showRawData)}
            className="flex items-center gap-2"
          >
            {showRawData ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showRawData ? "Hide Raw" : "Show Raw"}
          </ButtonAtomic>
          
          <ButtonAtomic
            variant="outline"
            size="sm"
            onClick={analyzeComponent}
            className="flex items-center gap-2"
          >
            <Zap className="w-4 h-4" />
            Re-analyze
          </ButtonAtomic>
        </div>
      </div>

      {/* State Machine Documentation */}
      <GlassCardAtomic variant="default" className="p-6">
        <MarkdownRendererAtomic
          content={stateMachine.documentation}
          enableMermaid={true}
          className="min-h-[200px]"
        />
      </GlassCardAtomic>

      {/* State Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <GlassCardAtomic variant="subtle" className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {stateMachine.states.length}
            </div>
            <div className="text-sm text-gray-600">Total States</div>
          </div>
        </GlassCardAtomic>

        <GlassCardAtomic variant="subtle" className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {stateMachine.transitions.length}
            </div>
            <div className="text-sm text-gray-600">Transitions</div>
          </div>
        </GlassCardAtomic>

        <GlassCardAtomic variant="subtle" className="p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {stateMachine.cssStates.length}
            </div>
            <div className="text-sm text-gray-600">CSS States</div>
          </div>
        </GlassCardAtomic>
      </div>

      {/* Raw Data View */}
      {showRawData && (
        <GlassCardAtomic variant="elevated" className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Code className="w-4 h-4 text-gray-600" />
            <h4 className="font-medium text-gray-800">Raw State Machine Data</h4>
          </div>
          
          <pre className="bg-gray-50 border rounded-lg p-4 overflow-x-auto text-xs font-mono">
            {JSON.stringify(stateMachine, null, 2)}
          </pre>
        </GlassCardAtomic>
      )}
    </div>
  );
};