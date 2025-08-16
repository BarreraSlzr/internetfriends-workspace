import React from 'react';
import type { NodeProps } from '@xyflow/react';

export interface HookNodeData {
  label: string;
  description: string;
  hookType: 'state' | 'effect' | 'custom' | 'context';
}

export const HookNode: React.FC<NodeProps<HookNodeData>> = ({ data }) => {
  const getHookTypeColor = (type: string) => {
    switch (type) {
      case 'state':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'effect':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'custom':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'context':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div
      className={`px-3 py-2 shadow-sm rounded border ${getHookTypeColor(
        data.hookType
      )} min-w-[120px]`}
    >
      <div className="font-semibold text-sm">{data.label}</div>
      <div className="text-xs opacity-75 mt-1">{data.hookType}</div>
      <div className="text-xs mt-1">{data.description}</div>
    </div>
  );
};

HookNode.displayName = 'HookNode';

export default HookNode;