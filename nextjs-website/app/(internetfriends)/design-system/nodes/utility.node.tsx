"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";

interface UtilityNodeData {
  label: string;
  category: "tokens" | "utilities" | "functions" | "constants";
  description: string;
  tokens?: string[];
  classes?: string[];
  functions?: string[];
  features?: string[];
}

interface UtilityNodeProps {
  data: UtilityNodeData;
  isConnectable: boolean;
  selected?: boolean;
}

export const UtilityNode: React.FC<UtilityNodeProps> = ({
  data,
  isConnectable,
  selected,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "tokens":
        return "from-amber-50 to-amber-100 border-amber-200 text-amber-900";
      case "utilities":
        return "from-orange-50 to-orange-100 border-orange-200 text-orange-900";
      case "functions":
        return "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900";
      case "constants":
        return "from-red-50 to-red-100 border-red-200 text-red-900";
      default:
        return "from-gray-50 to-gray-100 border-gray-200 text-gray-900";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "tokens":
        return "🎨";
      case "utilities":
        return "🛠️";
      case "functions":
        return "⚙️";
      case "constants":
        return "📌";
      default:
        return "📦";
    }
  };

  return (
    <div
      className={cn(
        "min-w-[220px] max-w-[280px] bg-gradient-to-br rounded-compact-lg border-2 shadow-glass transition-all duration-200",
        getCategoryColor(data.category),
        selected && "ring-2 ring-if-primary ring-offset-2",
        "hover:shadow-glass-hover hover:scale-[1.02]",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(data.category)}</span>
          <div>
            <h3 className="font-semibold text-sm">{data.label}</h3>
            <span className="text-xs opacity-70 capitalize">
              {data.category}
            </span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs opacity-80 leading-relaxed">{data.description}</p>

        {/* Design Tokens */}
        {data.tokens && data.tokens.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Tokens</h4>
            <div className="space-y-1">
              {data.tokens.map((token, index) => (
                <div
                  key={index}
                  className="px-2 py-1 bg-white/60 rounded-compact-xs text-xs font-mono flex items-center gap-2"
                >
                  <div className="w-2 h-2 rounded-full bg-if-primary"></div>
                  {token}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CSS Classes */}
        {data.classes && data.classes.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Classes</h4>
            <div className="space-y-1">
              {data.classes.map((cls, index) => (
                <span
                  key={index}
                  className="block px-2 py-1 bg-white/60 rounded-compact-xs text-xs font-mono"
                >
                  {cls}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Functions */}
        {data.functions && data.functions.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Functions</h4>
            <div className="space-y-1">
              {data.functions.map((func, index) => (
                <span
                  key={index}
                  className="block px-2 py-1 bg-white/60 rounded-compact-xs text-xs font-mono"
                >
                  {func}
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
              {data.features.map((feature, index) => (
                <li
                  key={index}
                  className="text-xs opacity-80 flex items-center gap-1"
                >
                  <span className="w-1 h-1 bg-current rounded-full"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-orange-500 border-2 border-white"
      />
    </div>
  );
};

UtilityNode._displayName = "UtilityNode";
