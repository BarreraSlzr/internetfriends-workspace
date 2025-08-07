"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";

interface ComponentNodeData {
  label: string;
  category: "atomic" | "molecular" | "organism";
  description: string;
  props?: string[];
  features?: string[];
  composition?: string[];
}

interface ComponentNodeProps {
  data: ComponentNodeData;
  isConnectable: boolean;
  selected: boolean;
}

const ComponentNode: React.FC<ComponentNodeProps> = ({
  data,
  isConnectable,
  selected,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "atomic":
        return "from-blue-50 to-blue-100 border-blue-200 text-blue-900";
      case "molecular":
        return "from-purple-50 to-purple-100 border-purple-200 text-purple-900";
      case "organism":
        return "from-green-50 to-green-100 border-green-200 text-green-900";
      default:
        return "from-gray-50 to-gray-100 border-gray-200 text-gray-900";
    }
  };

  return (
    <div
      className={cn(
        "min-w-[250px] max-w-[300px] bg-gradient-to-br rounded-compact-lg border-2 shadow-glass transition-all duration-200",
        getCategoryColor(data.category),
        selected && "ring-2 ring-if-primary ring-offset-2",
        "hover:shadow-glass-hover hover:scale-[1.02]",
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm uppercase tracking-wide">
            {data.label}
          </h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
            {data.category}
          </span>
        </div>

        <p className="text-sm opacity-75 mb-3 leading-relaxed">
          {data.description}
        </p>

        {data.features && data.features.length > 0 && (
          <div className="mb-3">
            <h4 className="text-xs font-semibold mb-1">Features:</h4>
            <div className="flex flex-wrap gap-1">
              {data.features.map((feature, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-white/30 rounded"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        )}

        {data.props && data.props.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-1">Props:</h4>
            <div className="text-xs space-y-1">
              {data.props.map((prop, index) => (
                <div key={index} className="font-mono bg-white/20 px-1 rounded">
                  {prop}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );
};

export { ComponentNode };
export type { ComponentNodeData };
