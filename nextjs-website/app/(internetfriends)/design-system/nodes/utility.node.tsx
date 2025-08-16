import React from 'react';
import type { NodeProps } from '@xyflow/react';

export interface UtilityNodeData {
  label: string;
  type: 'function' | 'hook' | 'constant' | 'type';
  description: string;
}

export const UtilityNode: React.FC<NodeProps<UtilityNodeData>> = ({ data }) => {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'function':
        return 'bg-indigo-100 border-indigo-300 text-indigo-800';
      case 'hook':
        return 'bg-teal-100 border-teal-300 text-teal-800';
      case 'constant':
        return 'bg-amber-100 border-amber-300 text-amber-800';
      case 'type':
        return 'bg-violet-100 border-violet-300 text-violet-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div
      className={`px-3 py-2 shadow-sm rounded border ${getTypeColor(
        data.type
      )} min-w-[120px]`}
    >
      <div className="font-semibold text-sm">{data.label}</div>
      <div className="text-xs opacity-75 mt-1">{data.type}</div>
      <div className="text-xs mt-1">{data.description}</div>
    </div>
  );
};

UtilityNode.displayName = 'UtilityNode';

export default UtilityNode;