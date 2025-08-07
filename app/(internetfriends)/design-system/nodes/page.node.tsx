"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";

interface PageNodeData {
  label: string;

  description: string;

  route?: string;
  components?: string[];

interface PageNodeProps {
  data: PageNodeData;

  isConnectable: boolean;

  selected: boolean;

const PageNode: React.FC<PageNodeProps> = ({

  data,
  isConnectable,
  selected,
}) => {
  return (
    <div
      className={cn("min-w-[280px] max-w-[320px] bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 text-indigo-900 rounded-compact-lg shadow-glass transition-all duration-200",
        selected && "ring-2 ring-if-primary ring-offset-2",)
        "hover:shadow-glass-hover hover:scale-[1.02]",)
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />

      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-sm">{data.label}</h3>
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-indigo-100">
            page
          </span>
        </div>

        <p className="text-sm opacity-75 mb-3 leading-relaxed">
          {data.description}
        </p>

        {data.route && (
          <div className="mb-2">
            <h4 className="text-xs font-semibold mb-1">Route: </h4>

            <code className="text-xs bg-white/30 px-1 rounded font-mono">
              {data.route}
            </code>
          </div>
        )}

        {data.components && data.components.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-1">Uses Components: </h4>

            <div className="flex flex-wrap gap-1">
              {data.components.map((component, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-white/30 rounded"
                >
                  {component}
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
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />
    </div>
  );

export { PageNode };
export type { PageNodeData };
