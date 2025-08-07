"use client";

import React from "react";
import { Handle, Position } from "reactflow";
import { cn } from "@/lib/utils";

export interface StateNodeData {
  label: string;
  status: "healthy" | "warning" | "error" | "active";
  metrics: {
    [key: string]: unknown;
  };
}

export interface StateNodeProps {
  data: StateNodeData;
  selected?: boolean;
}

export const StateNode: React.FC<StateNodeProps> = ({ data, selected }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-500";
      case "active": return "bg-blue-500";
      case "warning": return "bg-yellow-500";
      case "error": return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return "🟢";
      case "active": return "🔵";
      case "warning": return "🟡";
      case "error": return "🔴";
      default:
        return "⚪";
    }
  };

  const getBorderColor = () => {
    if (selected) return "border-purple-400 shadow-lg shadow-purple-400/50";
    return "border-gray-600";
  };

  const getPulseAnimation = () => {
    if (data.status === "active") {
      return "animate-pulse";
    }
    return "";
  };

  return (
    <div
      className={cn(
        "bg-gray-800 border-2 rounded-xl p-4 min-w-72 transition-all duration-200",
        getBorderColor(),
        getPulseAnimation(),
      )}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-4 h-4 bg-purple-400 border-2 border-white rounded-full"
      />

      {/* Header with status indicator */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-3 h-3 ${getStatusColor(data.status)} rounded-full animate-pulse`}
          ></div>
          <h3 className="text-white font-bold text-base">{data.label}</h3>
        </div>
        <div className="text-xl">{getStatusIcon(data.status)}</div>
      </div>

      {/* Status Badge */}
      <div
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white mb-4 ${getStatusColor(data.status)}`}
      >
        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
        {data.status.toUpperCase()}
      </div>

      {/* Metrics Display */}
      <div className="grid grid-cols-2 gap-3">
        {Object.entries(data.metrics).map(([key, value]) => (
          <div
            key={key}
            className="bg-gray-900 rounded-lg p-3 border border-gray-700"
          >
            <div className="text-xs text-gray-400 font-medium capitalize mb-1">
              {key.replace(/([A-Z])/g, " $1").trim()}
            </div>
            <div className="text-lg font-bold text-white">
              {typeof value === "boolean"
                ? value
                  ? "✅"
                  : "❌"
                : String(value)}
            </div>
          </div>
        ))}
      </div>

      {/* Real-time indicator */}
      {data.status === "active" && (
        <div className="mt-3 flex items-center justify-center space-x-2 text-xs text-gray-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-ping"></div>
          <span>Real-time monitoring</span>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Bottom}
        className="w-4 h-4 bg-purple-400 border-2 border-white rounded-full"
      />
    </div>
  );
};
