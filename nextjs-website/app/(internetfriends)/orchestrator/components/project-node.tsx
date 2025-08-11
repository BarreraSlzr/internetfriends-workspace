"use client";

import React from 'react';
import { Handle, Position } from 'reactflow';

export interface ProjectNodeData {
  label: string;
  status: 'completed' | 'active' | 'planned' | 'error';
  features: string[];
  progress: number;
}

export interface ProjectNodeProps {
  data: ProjectNodeData;
  selected?: boolean;
}

export const ProjectNode: React.FC<ProjectNodeProps> = ({ data, selected }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-600';
      case 'active': return 'bg-blue-600';
      case 'planned': return 'bg-gray-600';
      case 'error': return 'bg-red-600';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'active': return '⚡';
      case 'planned': return '📋';
      case 'error': return '❌';
      default: return '⭕';
    }
  };

  const getBorderColor = () => {
    if (selected) return 'border-blue-400 shadow-lg shadow-blue-400/50';
    return 'border-gray-600';
  };

  return (
    <div className={`bg-gray-800 border-2 ${getBorderColor()} rounded-lg p-4 min-w-64 transition-all duration-200`}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-green-400 border-2 border-white"
      />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{getStatusIcon(data.status)}</span>
          <h3 className="text-white font-semibold text-sm">{data.label}</h3>
        </div>
        <div className={`px-2 py-1 rounded text-xs text-white ${getStatusColor(data.status)}`}>
          {data.status.toUpperCase()}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span>{data.progress}%</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-green-500 to-blue-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${data.progress}%` }}
          />
        </div>
      </div>

      {/* Features List */}
      <div className="space-y-1">
        <div className="text-xs text-gray-400 font-medium">Features:</div>
        {data.features.map((feature, index) => (
          <div key={index} className="flex items-center space-x-2 text-xs">
            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
            <span className="text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
    </div>
  );
};
