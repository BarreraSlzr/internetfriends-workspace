"use client";

import * as React from "react";
const { useState } = React;
import { ComponentMetadata } from "@/lib/design-system/component-discovery";
import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";
import { ButtonAtomic } from "@/components/atomic/button/button.atomic";
import {
  Search,
  Grid,
  Database,
  Zap,
  Camera,
  Layout,
  ChevronRight,
  ChevronDown,
  Component,
  TestTube,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Eye
} from "lucide-react";

interface DesignSystemSidebarProps {
  components: ComponentMetadata[];
  selectedComponent: ComponentMetadata | null;
  viewMode: 'grid' | 'flow' | 'audit' | 'visual-comparison' | 'tree' | 'docs';
  searchQuery: string;
  selectedCategory: string;
  onComponentSelect: (component: ComponentMetadata) => void;
  onViewModeChange: (mode: 'grid' | 'flow' | 'audit' | 'visual-comparison' | 'tree' | 'docs') => void;
  onSearchChange: (query: string) => void;
  onCategoryChange: (category: string) => void;
  className?: string;
}

export const DesignSystemSidebar: React.FC<DesignSystemSidebarProps> = ({
  components,
  selectedComponent,
  viewMode,
  searchQuery,
  selectedCategory,
  onComponentSelect,
  onViewModeChange,
  onSearchChange,
  onCategoryChange,
  className = ""
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    atomic: true,
    molecular: true,
    organism: true
  });

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

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [category]: !prev[category]
    }));
  };

  const filteredComponents = components.filter((comp) => {
    const matchesSearch = searchQuery
      ? comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesCategory =
      selectedCategory === "all" || comp.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const componentsByCategory = filteredComponents.reduce((acc, comp) => {
    if (!acc[comp.category]) {
      acc[comp.category] = [];
    }
    acc[comp.category].push(comp);
    return acc;
  }, {} as Record<string, ComponentMetadata[]>);

  const viewModeButtons = [
    { key: 'grid', label: 'Grid', icon: Grid },
    { key: 'tree', label: 'Tree', icon: Database },
    { key: 'flow', label: 'Flow', icon: Layout },
    { key: 'audit', label: 'AI Audit', icon: Zap },
    { key: 'visual-comparison', label: 'Visual', icon: Camera },
    { key: 'docs', label: 'State Docs', icon: Eye }
  ] as const;

  return (
    <div className={`w-80 border-r border-gray-200 bg-white flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Design System</h2>
        
        {/* Search */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-dashed"
          />
        </div>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => onCategoryChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-dashed"
        >
          <option value="all">All Categories</option>
          <option value="atomic">Atomic</option>
          <option value="molecular">Molecular</option>
          <option value="organism">Organism</option>
        </select>
      </div>

      {/* View Mode Selection */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">View Mode</h3>
        <div className="grid grid-cols-2 gap-2">
          {viewModeButtons.map(({ key, label, icon: Icon }) => (
            <ButtonAtomic
              key={key}
              variant={viewMode === key ? "primary" : "ghost"}
              size="sm"
              onClick={() => onViewModeChange(key)}
              className="flex items-center gap-2 text-xs justify-start"
            >
              <Icon className="w-3 h-3" />
              {label}
            </ButtonAtomic>
          ))}
        </div>
      </div>

      {/* Component List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Components ({filteredComponents.length})
          </h3>
          
          {Object.entries(componentsByCategory).map(([category, categoryComponents]) => (
            <div key={category} className="mb-4">
              <button
                onClick={() => toggleCategory(category)}
                className="flex items-center justify-between w-full p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Component className="w-4 h-4" />
                  <span className="capitalize">{category}</span>
                  <span className="text-xs text-gray-500">({categoryComponents.length})</span>
                </div>
                {expandedCategories[category] ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>

              {expandedCategories[category] && (
                <div className="ml-6 mt-2 space-y-1">
                  {categoryComponents.map((component) => (
                    <button
                      key={component.id}
                      onClick={() => onComponentSelect(component)}
                      className={`
                        w-full p-3 text-left rounded-lg border transition-all
                        ${selectedComponent?.id === component.id
                          ? 'border-blue-500 bg-blue-50 border-dashed border-2'
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }
                      `}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-800">
                          {component.name}
                        </span>
                        {getTestStatusIcon(component.testStatus)}
                      </div>
                      
                      <div className="text-xs text-gray-600 mb-1">
                        {component.usageCount} uses
                      </div>
                      
                      <div className="text-xs text-gray-500 line-clamp-2">
                        {component.description}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {filteredComponents.length === 0 && (
            <div className="text-center py-8">
              <Component className="w-8 h-8 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500">No components found</p>
              <p className="text-xs text-gray-400 mt-1">Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-lg font-bold text-blue-600">{components.length}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
          <div>
            <div className="text-lg font-bold text-green-600">
              {Math.round((components.filter(c => c.testStatus === 'passing').length / components.length) * 100) || 0}%
            </div>
            <div className="text-xs text-gray-600">Tested</div>
          </div>
        </div>
      </div>
    </div>
  );
};