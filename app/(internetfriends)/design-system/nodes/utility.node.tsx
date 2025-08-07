"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";

interface UtilityNodeData {
  label: string;
  category: "helper" | "hook" | "constant" | "type" | "config";
  description: string;
  exports?: string[];
  usedBy?: string[];
}

interface UtilityNodeProps {
  data: UtilityNodeData;
  isConnectable: boolean;
  selected: boolean;
}

const UtilityNode: React.FC<UtilityNodeProps> = ({
  data,
  isConnectable,
  selected,
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case "helper": return "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-900";
      case "hook": return "from-emerald-50 to-emerald-100 border-emerald-200 text-emerald-900";
      case "constant": return "from-orange-50 to-orange-100 border-orange-200 text-orange-900";
      case "type": return "from-pink-50 to-pink-100 border-pink-200 text-pink-900";
      case "config": return "from-cyan-50 to-cyan-100 border-cyan-200 text-cyan-900";
      default:
        return "from-gray-50 to-gray-100 border-gray-200 text-gray-900";
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
        className="w-3 h-3 bg-gray-500 border-2 border-white"
      />

      <div className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">{data.label}</h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-white/50">
            {data.category}
          </span>
        </div>

        <p className="text-sm opacity-75 mb-2 leading-relaxed">
          {data.description}
        </p>

        {data.exports && data.exports.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-1">Exports:</h4>
            <div className="flex flex-wrap gap-1">
              {data.exports.map((exportItem, index) => (
                <span
                  key={index}
                  className="text-xs px-1 py-0.5 bg-white/30 rounded font-mono"
                >
                  {exportItem}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-gray-500 border-2 border-white"
      />
    </div>
  );
};

export { UtilityNode };
export type { UtilityNodeData };
