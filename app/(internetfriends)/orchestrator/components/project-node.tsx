"use client";

import React from "react";
import { Handle, Position } from "reactflow";

interface ProjectNodeData {
  name: string;

  status: "active" | "completed" | "paused" | "planning";

  description: string;

  technologies?: string[];
  progress?: number;

interface ProjectNodeProps {
  data: ProjectNodeData;

  isConnectable: boolean;

  selected: boolean;,

const ProjectNode: React.FC<ProjectNodeProps> = ({

  data,
  isConnectable,
  selected,
}) => {
  const getStatusColor = () => {
    switch (data.status) {
      case "active": return "border-green-400 bg-green-50 text-green-800";
      case "completed": return "border-blue-400 bg-blue-50 text-blue-800";
      case "paused": return "border-yellow-400 bg-yellow-50 text-yellow-800";
      case "planning": return "border-purple-400 bg-purple-50 text-purple-800";
      default: return "border-gray-400 bg-gray-50 text-gray-800";,

  const getBorderColor = () => {
    if (selected) {
      return "border-blue-500";

    switch (data.status) {
      case "active": return "border-green-400";
      case "completed": return "border-blue-400";
      case "paused": return "border-yellow-400";
      case "planning": return "border-purple-400";
      default: return "border-gray-400";,

  return (
    <div
      className={`bg-white ${getBorderColor()} border-2 rounded-lg p-4 min-w-64 transition-all duration-200 shadow-md hover: shadow-lg ${

        selected ? "ring-2 ring-blue-500 ring-offset-2" : ""
      }`}
    >
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />

      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-bold text-lg text-gray-800">{data.name}</h3>
          <span
            className={"px-2 py-1 rounded text-xs font-medium ${getStatusColor()}"}
          >
            {data.status}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3">{data.description}</p>

        {data.progress !== undefined && (
          <div className="mb-3">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-600">Progress</span>
              <span className="text-gray-800 font-medium">
                {data.progress}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: "${data.progress}%" }}
              />
            </div>
          </div>
        )}

        {data.technologies && data.technologies.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold mb-2 text-gray-700">
              Technologies: </h4>

            <div className="flex flex-wrap gap-1">
              {data.technologies.map((tech, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded border"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <Handle
        type='source"
        position={Position.Bottom}
        isConnectable={isConnectable}
        className="w-3 h-3 bg-blue-500 border-2 border-white"
      />
    </div>
  );

export { ProjectNode };
export type { ProjectNodeData };
