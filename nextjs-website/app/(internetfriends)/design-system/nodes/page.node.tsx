"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface PageNodeData {
  label: string;
  description: string;
  route: string;
  components?: string[];
  features?: string[];
  layout?: string;
}

interface PageNodeProps {
  data: PageNodeData;
  isConnectable: boolean;
  selected?: boolean;
}

export const PageNode: React.FC<PageNodeProps> = ({
  data,
  isConnectable,
  selected
}) => {
  return (
    <div className={cn(
      'min-w-[280px] max-w-[320px] bg-gradient-to-br from-indigo-50 to-indigo-100 border-2 border-indigo-200 text-indigo-900 rounded-compact-lg shadow-glass transition-all duration-200',
      selected && 'ring-2 ring-if-primary ring-offset-2',
      'hover:shadow-glass-hover hover:scale-[1.02]'
    )}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-lg">📄</span>
          <div>
            <h3 className="font-semibold text-sm">{data.label}</h3>
            <div className="flex items-center gap-1">
              <span className="text-xs opacity-70">Page</span>
              <span className="text-xs font-mono bg-white/60 px-1 rounded">{data.route}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs opacity-80 leading-relaxed">
          {data.description}
        </p>

        {/* Layout */}
        {data.layout && (
          <div>
            <h4 className="text-xs font-medium mb-1">Layout</h4>
            <span className="px-2 py-0.5 bg-white/80 rounded-compact-xs text-xs">
              {data.layout}
            </span>
          </div>
        )}

        {/* Components Used */}
        {data.components && data.components.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Components</h4>
            <div className="flex flex-wrap gap-1">
              {data.components.map((component, index) => (
                <span
                  key={index}
                  className="px-2 py-0.5 bg-white/80 rounded-compact-xs text-xs"
                >
                  {component}
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
                <li key={index} className="text-xs opacity-80 flex items-center gap-1">
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
        className="w-3 h-3 bg-indigo-500 border-2 border-white"
      />
    </div>
  );
};

PageNode.displayName = 'PageNode';
