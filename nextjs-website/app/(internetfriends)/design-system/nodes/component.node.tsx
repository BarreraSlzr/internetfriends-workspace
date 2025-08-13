"use client";

import React, { useState } from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";
import { ButtonAtomic } from "@/components/atomic/button/button.atomic";
import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";
import {
  Eye,
  EyeOff,
  Maximize,
  TestTube,
  CheckCircle,
  AlertTriangle,
  XCircle,
} from "lucide-react";

interface ComponentNodeData {
  label: string;
  category: "atomic" | "molecular" | "organism";
  description: string;
  props?: string[];
  features?: string[];
  composition?: string[];
  liveComponent?: React.ComponentType<any>;
  liveProps?: Record<string, any>;
  testStatus?: "passing" | "warning" | "failing" | "not-tested";
  usageCount?: number;
  variants?: Array<{ name: string; props: Record<string, any> }>;
}

interface ComponentNodeProps {
  data: ComponentNodeData;
  isConnectable: boolean;
  selected?: boolean;
  onZenMode?: (componentData: ComponentNodeData) => void;
}

export const ComponentNode: React.FC<ComponentNodeProps> = ({
  data,
  isConnectable,
  selected,
  onZenMode,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "atomic":
        return "from-blue-50 to-blue-100 border-blue-200 text-blue-900";
      case "molecular":
        return "from-green-50 to-green-100 border-green-200 text-green-900";
      case "organism":
        return "from-purple-50 to-purple-100 border-purple-200 text-purple-900";
      default:
        return "from-gray-50 to-gray-100 border-gray-200 text-gray-900";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "atomic":
        return "⚛️";
      case "molecular":
        return "🧬";
      case "organism":
        return "🦠";
      default:
        return "📦";
    }
  };

  const getTestStatusIcon = (status?: string) => {
    switch (status) {
      case "passing":
        return <CheckCircle className="h-3 w-3 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-3 w-3 text-yellow-600" />;
      case "failing":
        return <XCircle className="h-3 w-3 text-red-600" />;
      default:
        return <TestTube className="h-3 w-3 text-gray-400" />;
    }
  };

  const LiveComponentPreview = () => {
    if (!data.liveComponent || !showPreview) return null;

    const Component = data.liveComponent;
    const props = data.liveProps || {};

    try {
      return (
        <div className="mt-3 p-3 bg-white/80 rounded-compact-md border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium opacity-70">Live Preview</span>
            {onZenMode && (
              <button
                onClick={() => onZenMode(data)}
                className="p-1 hover:bg-white/60 rounded transition-colors"
                title="Open in Zen Mode"
              >
                <Maximize className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="min-h-[40px] flex items-center justify-center">
            <Component {...props} />
          </div>

          {data.variants && data.variants.length > 0 && (
            <div className="mt-2 space-y-1">
              <span className="text-xs opacity-60">Variants:</span>
              <div className="grid grid-cols-2 gap-1">
                {data.variants.slice(0, 4).map((variant, index) => (
                  <div key={index} className="p-2 bg-white/60 rounded-sm">
                    <div className="text-xs font-mono mb-1">{variant.name}</div>
                    <Component {...props} {...variant.props} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      );
    } catch (error) {
      return (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-compact-md">
          <span className="text-xs text-red-600">Preview failed to render</span>
        </div>
      );
    }
  };

  const nodeHeight = showPreview && data.liveComponent ? "auto" : "auto";

  return (
    <div
      className={cn(
        "min-w-[250px] max-w-[320px] bg-gradient-to-br rounded-compact-lg border-2 shadow-glass transition-all duration-200",
        getCategoryColor(data.category),
        selected && "ring-2 ring-if-primary ring-offset-2",
        "hover:shadow-glass-hover hover:scale-[1.01]",
        showPreview && data.liveComponent && "max-w-[400px]", // Expand when showing preview
      )}
      style={{ minHeight: nodeHeight }}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-if-primary border-2 border-white"
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg">{getCategoryIcon(data.category)}</span>
            <div>
              <h3 className="font-semibold text-sm">{data.label}</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs opacity-70 capitalize">
                  {data.category}
                </span>
                {data.testStatus && getTestStatusIcon(data.testStatus)}
                {data.usageCount && (
                  <span className="text-xs opacity-60">
                    {data.usageCount} uses
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-1">
            {data.liveComponent && (
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="p-1 hover:bg-white/60 rounded transition-colors"
                title={showPreview ? "Hide preview" : "Show preview"}
              >
                {showPreview ? (
                  <EyeOff className="h-3 w-3" />
                ) : (
                  <Eye className="h-3 w-3" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs opacity-80 leading-relaxed">{data.description}</p>

        {/* Live Component Preview */}
        <LiveComponentPreview />

        {/* Props */}
        {data.props && data.props.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Props</h4>
            <div className="flex flex-wrap gap-1">
              {data.props.map((prop, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/60 rounded-compact-xs text-xs font-mono"
                >
                  {prop}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Composition */}
        {data.composition && data.composition.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Uses</h4>
            <div className="flex flex-wrap gap-1">
              {data.composition.map((comp, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/80 rounded-compact-xs text-xs"
                >
                  {comp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Features */}
        {data.features && data.features.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Features</h4>
            <ul className="space-y-0.5">
              {data.features
                .slice(0, showPreview ? 10 : 3)
                .map((feature, index) => (
                  <li
                    key={index}
                    className="text-xs opacity-80 flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-current rounded-full"></span>
                    {feature}
                  </li>
                ))}
              {!showPreview && data.features.length > 3 && (
                <li className="text-xs opacity-60 italic">
                  +{data.features.length - 3} more features...
                </li>
              )}
            </ul>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-if-primary border-2 border-white"
      />
    </div>
  );
};

ComponentNode.displayName = "ComponentNode";
