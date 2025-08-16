"use client";

import * as React from "react";
const { useState } = React;
import { ComponentSnapshot } from "@/lib/design-system/component-snapshot-generator";
import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";
import { ButtonAtomic } from "@/components/atomic/button/button.atomic";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  TestTube,
  Code,
  Eye,
  Zap,
  Clock,
  Users,
  FileText,
  ExternalLink
} from "lucide-react";

interface ComponentCardProps {
  component: ComponentSnapshot;
  onOpenDetails: (component: ComponentSnapshot) => void;
  className?: string;
}

export const ComponentCard: React.FC<ComponentCardProps> = ({
  component,
  onOpenDetails,
  className = ""
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case "passing":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "failing":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <TestTube className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "atomic":
        return {
          border: "border-blue-200",
          bg: "bg-blue-50",
          accent: "bg-blue-500",
          text: "text-blue-700"
        };
      case "molecular":
        return {
          border: "border-green-200", 
          bg: "bg-green-50",
          accent: "bg-green-500",
          text: "text-green-700"
        };
      case "organism":
        return {
          border: "border-purple-200",
          bg: "bg-purple-50", 
          accent: "bg-purple-500",
          text: "text-purple-700"
        };
      default:
        return {
          border: "border-gray-200",
          bg: "bg-gray-50",
          accent: "bg-gray-500", 
          text: "text-gray-700"
        };
    }
  };

  const colors = getCategoryColor(component.metadata.category);
  const analysisTime = component.performance.analysisTime;
  const stateCount = component.stateMachine.states.length;

  return (
    <div 
      className={`
        group relative cursor-pointer transition-all duration-300 
        ${isHovered ? 'scale-105 z-10' : 'scale-100'}
        ${className}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpenDetails(component)}
    >
      {/* Main Card */}
      <GlassCardAtomic
        variant="default"
        className={`
          p-6 h-full border-2 transition-all duration-300
          ${colors.border} ${colors.bg}
          ${isHovered ? 'border-blue-400 shadow-lg border-dashed' : 'border-solid'}
          hover:shadow-xl
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Category Indicator */}
            <div className={`w-3 h-3 rounded-full ${colors.accent}`} />
            
            <div>
              <h3 className="font-semibold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                {component.metadata.name}
              </h3>
              <span className={`text-sm font-medium ${colors.text} capitalize`}>
                {component.metadata.category}
              </span>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-2">
            {getTestStatusIcon(component.metadata.testStatus)}
            
            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
              <ButtonAtomic
                variant="ghost"
                size="sm"
                className="p-1 h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  onOpenDetails(component);
                }}
              >
                <ExternalLink className="h-4 w-4" />
              </ButtonAtomic>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {component.metadata.description}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {component.metadata.usageCount} uses
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {stateCount} states
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Code className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {component.metadata.exports.length} exports
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <span className="text-sm text-gray-600">
              {analysisTime}ms
            </span>
          </div>
        </div>

        {/* Props Preview */}
        {component.metadata.props.length > 0 && (
          <div className="mb-4">
            <div className="text-xs font-medium text-gray-700 mb-2">Props:</div>
            <div className="flex flex-wrap gap-1">
              {component.metadata.props.slice(0, 3).map((prop, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 bg-white border border-gray-200 rounded text-xs font-mono"
                >
                  {prop.name}
                </span>
              ))}
              {component.metadata.props.length > 3 && (
                <span className="px-2 py-1 text-xs text-gray-500">
                  +{component.metadata.props.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          <div className="text-xs text-gray-500">
            Updated {new Date(component.metadata.lastModified).toLocaleDateString()}
          </div>
          
          <div className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${
              component.metadata.hasTests ? 'bg-green-400' : 'bg-gray-300'
            }`} />
            <div className={`w-2 h-2 rounded-full ${
              component.metadata.hasTypes ? 'bg-blue-400' : 'bg-gray-300'
            }`} />
            <div className={`w-2 h-2 rounded-full ${
              component.metadata.hasStories ? 'bg-purple-400' : 'bg-gray-300'
            }`} />
          </div>
        </div>

        {/* Hover Overlay */}
        <div className={`
          absolute inset-0 bg-gradient-to-t from-blue-500/10 to-transparent 
          opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg
          pointer-events-none
        `} />
      </GlassCardAtomic>

      {/* Quick Actions Popup */}
      <div className={`
        absolute -top-2 -right-2 bg-white border border-gray-200 rounded-lg shadow-lg p-2
        opacity-0 group-hover:opacity-100 transition-all duration-200 transform
        ${isHovered ? 'translate-y-0' : '-translate-y-2'}
        pointer-events-none group-hover:pointer-events-auto
      `}>
        <div className="flex items-center gap-1">
          <ButtonAtomic
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              // Quick action: View code
              window.open(`/api/design-system/snapshots/${component.id}`, '_blank');
            }}
          >
            <Code className="h-3 w-3" />
          </ButtonAtomic>
          
          <ButtonAtomic
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetails(component);
            }}
          >
            <Eye className="h-3 w-3" />
          </ButtonAtomic>
          
          <ButtonAtomic
            variant="ghost"
            size="sm"
            className="p-2 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              // Quick action: View docs
              console.log('View docs for', component.metadata.name);
            }}
          >
            <FileText className="h-3 w-3" />
          </ButtonAtomic>
        </div>
      </div>
    </div>
  );
};