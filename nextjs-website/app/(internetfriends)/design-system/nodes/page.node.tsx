import React from 'react';
import type { NodeProps } from '@xyflow/react';

export interface PageNodeData {
  label: string;
  description: string;
  route: string;
}

export const PageNode: React.FC<NodeProps<PageNodeData>> = ({ data }) => {
  return (
    <div className="px-4 py-3 shadow-md rounded-lg border border-purple-300 bg-purple-50 text-purple-800 min-w-[140px]">
      <div className="font-semibold text-sm">{data.label}</div>
      <div className="text-xs text-purple-600 mt-1">{data.route}</div>
      <div className="text-xs text-purple-500 mt-1">{data.description}</div>
    </div>
  );
};

PageNode.displayName = 'PageNode';

export default PageNode;