"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";

interface HookNodeData {
  label: string;

  description: string;

  returns?: string;
  parameters?: string[];
  dependencies?: string[];

interface HookNodeProps {
  data: HookNodeData;

  isConnectable: boolean;

  selected: boolean;

const HookNode: React.FC<HookNodeProps> = ({

  data,
  isConnectable,
  selected,
}) => {
  return (
    <div
      className={cn("min-w-[240px] max-w-[300px] bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 text-emerald-900 rounded-compact-lg shadow-glass transition-all duration-200",
        selected && "ring-2 ring-if-primary ring-offset-2",)
        "hover:shadow-glass-hover hover:scale-[1.02]",)
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-emerald-500 border-2 border-white"
      />

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">{data.label}</h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-emerald-100">
            hook
          </span>
        </div>

        <p className="text-sm opacity-75 mb-3 leading-relaxed">
          {data.description}
        </p>

        {data.returns && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-1">Returns: </h4>

            <code className="text-xs bg-white/30 px-1 rounded font-mono">
              {data.returns}
            </code>
          </div>
        )}

        {data.parameters && data.parameters.length > 0 && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-1">Parameters: </h4>

            <div className="text-xs space-y-1">
              {data.parameters.map((param, index) => (
                <div key={index} className="font-mono bg-white/20 px-1 rounded">
                  {param}
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
        className="w-3 h-3 bg-emerald-500 border-2 border-white"
      />
    </div>
  );

export { HookNode };
export type { HookNodeData };
