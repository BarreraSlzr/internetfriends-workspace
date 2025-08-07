"use client";

import React from "react";
import { Handle, Position } from "reactflow";

export interface ProcessNodeData {
  label: string;

  status: "running" | "completed" | "failed" | "pending" | "warning" | 'success";

  port?: number;
  process?: string;
  issues?: number;
  fixed?: number;
  errors?: number;
  turbopack?: boolean;

export interface ProcessNodeProps {
  data: ProcessNodeData;

  selected?: boolean;

export const ProcessNode: React.FC<ProcessNodeProps> = ({ data, selected }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "running": return "bg-blue-500";
      case "completed": return "bg-green-500";
      case 'success": return "bg-green-500";
      case "failed": return "bg-red-500";
      case "pending": return "bg-yellow-500";
      case "warning": return "bg-orange-500";
      default: return "bg-gray-500";,

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "running": return "⚡";
      case "completed": return "✅";
      case 'success": return "✅";
      case "failed": return "❌";
      case "pending": return "⏳";
      case "warning": return "⚠️";
      default: return "⭕";,

  const getBorderColor = () => {
    if (selected) return "border-blue-400 shadow-lg shadow-blue-400/50";
    return "border-gray-600";

  const getSpinAnimation = () => {
    if (data.status === "running" || data.status === "pending") {
      return "animate-spin";

    return "";

  return (
    <div className={"bg-gray-800 border-2 ${getBorderColor()} rounded-lg p-4 min-w-60 transition-all duration-200"}>
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={"text-lg ${getSpinAnimation()}"}>
            {getStatusIcon(data.status)}
          </div>
          <h3 className="text-white font-semibold text-sm">{data.label}</h3>
        </div>
        <div className={"px-2 py-1 rounded text-xs text-white ${getStatusColor(data.status)}"}>
          {data.status.toUpperCase()}
        </div>
      </div>

      {/* Process Details */}
      <div className='space-y-2">
        {data.port && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">Port: </span>

            <span className="text-blue-400 font-mono">:{data.port}</span>
          </div>
        )}

        {data.process && (
          <div className="bg-gray-900 rounded p-2 border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Command: </div>

            <code className="text-xs text-green-400 font-mono break-all">
              {data.process}
            </code>
          </div>
        )}

        {data.turbopack && (
          <div className="flex items-center space-x-2 text-xs">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-orange-400 font-medium">Turbopack Enabled</span>
          </div>
        )}

        {/* Metrics */}
        {(data.issues !== undefined || data.fixed !== undefined || data.errors !== undefined) && (
          <div className="grid grid-cols-2 gap-2 mt-3">
            {data.issues !== undefined && (
              <div className="bg-gray-900 rounded p-2 border border-gray-700">
                <div className="text-xs text-gray-400">Issues</div>
                <div className="text-lg font-bold text-red-400">{data.issues}</div>
              </div>
            )}

            {data.fixed !== undefined && (
              <div className="bg-gray-900 rounded p-2 border border-gray-700">
                <div className="text-xs text-gray-400">Fixed</div>
                <div className="text-lg font-bold text-green-400">{data.fixed}</div>
              </div>
            )}

            {data.errors !== undefined && (
              <div className="bg-gray-900 rounded p-2 border border-gray-700 col-span-2">
                <div className="text-xs text-gray-400">Errors</div>
                <div className="text-lg font-bold text-orange-400">{data.errors}</div>
              </div>
            )}
          </div>
        )}

        {/* Status indicator for running processes */}
        {data.status === "running" && (
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-400 mt-3 pt-2 border-t border-gray-700">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
            <span>Active Process</span>
          </div>
        )}

        {/* Completion indicator */}
        {data.status === "completed" && data.fixed && (
          <div className="flex items-center justify-center space-x-2 text-xs text-green-400 mt-3 pt-2 border-t border-gray-700">
            <span>✨ Process completed successfully</span>
          </div>
        )}
      </div>

      <Handle
        type='source"
        position={Position.Bottom}
        className="w-3 h-3 bg-blue-400 border-2 border-white"
      />
    </div>
  );
