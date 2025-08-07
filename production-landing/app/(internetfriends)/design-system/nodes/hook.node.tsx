"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface HookNodeData {
  label: string;
  description: string;
  returns: string;
  usage: string;
  parameters?: string[];
  examples?: string[];
  dependencies?: string[];
}

interface HookNodeProps {
  data: HookNodeData;
  isConnectable: boolean;
  selected?: boolean;
}

export const HookNode: React.FC<HookNodeProps> = ({
  data,
  isConnectable,
  selected
}) => {
  return (
    <div className={cn(
      'min-w-[240px] max-w-[300px] bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 text-emerald-900 rounded-compact-lg shadow-glass transition-all duration-200',
      selected && 'ring-2 ring-if-primary ring-offset-2',
      'hover:shadow-glass-hover hover:scale-[1.02]'
    )}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-emerald-500 border-2 border-white"
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-lg">🪝</span>
          <div>
            <h3 className="font-semibold text-sm">{data.label}</h3>
            <span className="text-xs opacity-70">Hook</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs opacity-80 leading-relaxed">
          {data.description}
        </p>

        {/* Parameters */}
        {data.parameters && data.parameters.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Parameters</h4>
            <div className="space-y-1">
              {data.parameters.map((param, index) => (
                <span
                  key={index}
                  className="block px-2 py-1 bg-white/60 rounded-compact-xs text-xs font-mono"
                >
                  {param}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Returns */}
        <div>
          <h4 className="text-xs font-medium mb-1">Returns</h4>
          <div className="px-2 py-1 bg-white/80 rounded-compact-xs text-xs font-mono border-l-2 border-emerald-400">
            {data.returns}
          </div>
        </div>

        {/* Usage */}
        <div>
          <h4 className="text-xs font-medium mb-1">Usage</h4>
          <p className="text-xs opacity-80 leading-relaxed bg-white/40 px-2 py-1 rounded-compact-xs">
            {data.usage}
          </p>
        </div>

        {/* Examples */}
        {data.examples && data.examples.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Examples</h4>
            <div className="space-y-1">
              {data.examples.map((example, index) => (
                <code
                  key={index}
                  className="block px-2 py-1 bg-white/60 rounded-compact-xs text-xs font-mono text-emerald-800"
                >
                  {example}
                </code>
              ))}
            </div>
          </div>
        )}

        {/* Dependencies */}
        {data.dependencies && data.dependencies.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Dependencies</h4>
            <div className="flex flex-wrap gap-1">
              {data.dependencies.map((dep, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/80 rounded-compact-xs text-xs"
                >
                  {dep}
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
        className="w-3 h-3 bg-emerald-500 border-2 border-white"
      />
    </div>
  );
};

HookNode.displayName = 'HookNode';
