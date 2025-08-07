"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';
import { cn } from '@/lib/utils';

interface ComponentNodeData {
  label: string;
  category: 'atomic' | 'molecular' | 'organism';
  description: string;
  props?: string[];
  features?: string[];
  composition?: string[];
}

interface ComponentNodeProps {
  data: ComponentNodeData;
  isConnectable: boolean;
  selected?: boolean;
}

export const ComponentNode: React.FC<ComponentNodeProps> = ({
  data,
  isConnectable,
  selected
}) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'atomic':
        return 'from-blue-50 to-blue-100 border-blue-200 text-blue-900';
      case 'molecular':
        return 'from-green-50 to-green-100 border-green-200 text-green-900';
      case 'organism':
        return 'from-purple-50 to-purple-100 border-purple-200 text-purple-900';
      default:
        return 'from-gray-50 to-gray-100 border-gray-200 text-gray-900';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'atomic':
        return '⚛️';
      case 'molecular':
        return '🧬';
      case 'organism':
        return '🦠';
      default:
        return '📦';
    }
  };

  return (
    <div className={cn(
      'min-w-[250px] max-w-[300px] bg-gradient-to-br rounded-compact-lg border-2 shadow-glass transition-all duration-200',
      getCategoryColor(data.category),
      selected && 'ring-2 ring-if-primary ring-offset-2',
      'hover:shadow-glass-hover hover:scale-[1.02]'
    )}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-if-primary border-2 border-white"
      />

      <div className="p-4 space-y-3">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-lg">{getCategoryIcon(data.category)}</span>
          <div>
            <h3 className="font-semibold text-sm">{data.label}</h3>
            <span className="text-xs opacity-70 capitalize">{data.category}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs opacity-80 leading-relaxed">
          {data.description}
        </p>

        {/* Props */}
        {data.props && data.props.length > 0 && (
          <div>
            <h4 className="text-xs font-medium mb-1">Props</h4>
            <div className="flex flex-wrap gap-1">
              {data.props.map((prop, index) => (
                < key={index}span
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
                < key={index}span
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
              {data.features.map((feature, index) => (
                < key={index}li key={index} className="text-xs opacity-80 flex items-center gap-1">
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
        className="w-3 h-3 bg-if-primary border-2 border-white"
      />
    </div>
  );
};

ComponentNode._displayName = 'ComponentNode';
