import React from 'react';
import type { NodeProps } from '@xyflow/react';

export interface ComponentNodeData {
  label: string;
  category: 'atomic' | 'molecular' | 'organism' | 'template' | 'page';
  description: string;
}

export const ComponentNode: React.FC<NodeProps<ComponentNodeData>> = ({ data }) => {
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'atomic':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'molecular':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'organism':
        return 'bg-purple-100 border-purple-300 text-purple-800';
      case 'template':
        return 'bg-orange-100 border-orange-300 text-orange-800';
      case 'page':
        return 'bg-red-100 border-red-300 text-red-800';
      default:
        return 'bg-gray-100 border-gray-300 text-gray-800';
    }
  };

  return (
    <div
      className={`px-4 py-3 shadow-md rounded-lg border ${getCategoryColor(
        data.category
      )} min-w-[150px]`}
    >
      <div className="font-semibold text-sm">{data.label}</div>
      <div className="text-xs opacity-75 mt-1 capitalize">{data.category}</div>
      <div className="text-xs mt-2">{data.description}</div>
    </div>
  );
};

ComponentNode.displayName = 'ComponentNode';

export const nodeTypes = {
  component: ComponentNode,
};

export default ComponentNode;