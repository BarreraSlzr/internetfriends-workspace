"use client";

import * as React from "react";
import { ComponentMetadata, ComponentRelationship } from "@/lib/design-system/component-discovery";
import { ComponentStateDocViewer } from "@/components/molecular/component-state-doc-viewer/component-state-doc-viewer.molecular";
import { ComponentFlowDashboard } from "@/app/(internetfriends)/design-system/components/component-flow-dashboard";
import { VisualComparisonPanel } from "@/app/(internetfriends)/design-system/components/visual-comparison-panel";
import { VirtualizedComponentList } from "@/app/(internetfriends)/design-system/components/virtualized-component-list";
import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";
import { ButtonAtomic } from "@/components/atomic/button/button.atomic";
import { Eye, EyeOff, TestTube, CheckCircle, AlertTriangle, XCircle } from "lucide-react";

interface DesignSystemMainContentProps {
  viewMode: 'grid' | 'flow' | 'audit' | 'visual-comparison' | 'tree' | 'docs';
  components: ComponentMetadata[];
  relationships: ComponentRelationship[];
  selectedComponent: ComponentMetadata | null;
  searchQuery: string;
  selectedCategory: string;
  className?: string;
}

export const DesignSystemMainContent: React.FC<DesignSystemMainContentProps> = ({
  viewMode,
  components,
  relationships,
  selectedComponent,
  searchQuery,
  selectedCategory,
  className = ""
}) => {
  const [showPreview, setShowPreview] = React.useState<Record<string, boolean>>({});

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
        return "border-blue-300 bg-blue-50";
      case "molecular":
        return "border-green-300 bg-green-50";
      case "organism":
        return "border-purple-300 bg-purple-50";
      default:
        return "border-gray-300 bg-gray-50";
    }
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

  const togglePreview = (componentId: string) => {
    setShowPreview(prev => ({
      ...prev,
      [componentId]: !prev[componentId]
    }));
  };

  const ComponentNode = ({ data }: { data: ComponentMetadata }) => (
    <GlassCardAtomic
      variant="default"
      className={`p-4 hover:shadow-md transition-all duration-200 ${getCategoryColor(data.category)}`}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-semibold text-lg">{data.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm text-gray-600 capitalize">
              {data.category}
            </span>
            {getTestStatusIcon(data.testStatus)}
            <span className="text-sm text-gray-500">
              {data.usageCount} uses
            </span>
          </div>
        </div>

        <ButtonAtomic
          variant="ghost"
          size="sm"
          onClick={() => togglePreview(data.id)}
          className="p-2"
          title={showPreview[data.id] ? "Hide preview" : "Show preview"}
        >
          {showPreview[data.id] ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </ButtonAtomic>
      </div>

      <p className="text-sm text-gray-700 mb-3">{data.description}</p>
      
      <div className="mt-2 text-xs text-gray-500">
        Path: {data.path}
      </div>

      {showPreview[data.id] && (
        <div className="mt-4 p-4 bg-white border rounded-md">
          <div className="mb-2 text-sm font-medium text-gray-700">
            Component Information:
          </div>
          <div className="space-y-2 text-xs">
            <div><strong>Exports:</strong> {data.exports.join(', ')}</div>
            <div><strong>Dependencies:</strong> {data.dependencies.join(', ') || 'None'}</div>
            <div><strong>Last Modified:</strong> {data.lastModified.toLocaleDateString()}</div>
            <div><strong>File Size:</strong> {(data.size / 1024).toFixed(1)}KB</div>
            {data.props.length > 0 && (
              <div>
                <strong>Props:</strong>
                <ul className="ml-4 mt-1">
                  {data.props.map((prop, idx) => (
                    <li key={idx}>
                      <code className="bg-gray-100 px-1 rounded text-xs">
                        {prop.name}{prop.required ? '' : '?'}: {prop.type}
                      </code>
                      {prop.description && <span className="ml-2 text-gray-600">- {prop.description}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}
    </GlassCardAtomic>
  );

  const renderContent = () => {
    switch (viewMode) {
      case 'docs':
        if (selectedComponent) {
          return (
            <div className="p-6">
              <ComponentStateDocViewer component={selectedComponent} />
            </div>
          );
        } else {
          return (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <TestTube className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">Select a Component</h3>
                <p className="text-gray-500">Choose a component from the sidebar to view its state documentation</p>
              </div>
            </div>
          );
        }

      case 'tree':
        return (
          <div className="h-full">
            <VirtualizedComponentList
              components={filteredComponents}
              relationships={relationships}
              onComponentSelect={(component) => {
                console.log('Selected component:', component);
              }}
              onCaptureScreenshot={async (component) => {
                try {
                  const response = await fetch('/api/screenshot', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      url: `http://localhost:3000/design-system?component=${component.id}`,
                      auth: 'dev-screenshot-key-2024'
                    })
                  });
                  if (response.ok) {
                    const data = await response.json();
                    window.open(data.url, '_blank');
                  }
                } catch (error) {
                  console.error('Screenshot failed:', error);
                }
              }}
              searchQuery={searchQuery}
              selectedCategory={selectedCategory}
            />
          </div>
        );

      case 'flow':
        return (
          <div className="h-[800px] w-full">
            <ComponentFlowDashboard components={filteredComponents} />
          </div>
        );

      case 'audit':
        return (
          <div className="h-[800px] w-full">
            <ComponentFlowDashboard 
              components={filteredComponents} 
              mode="audit"
              enableAI={true}
            />
          </div>
        );

      case 'visual-comparison':
        return (
          <div className="w-full">
            <VisualComparisonPanel
              onAnalysisComplete={(result) => {
                console.log('Visual analysis completed:', result);
              }}
            />
          </div>
        );

      case 'grid':
      default:
        return (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredComponents.map((component) => (
                <ComponentNode key={component.id} data={component} />
              ))}
            </div>

            {filteredComponents.length === 0 && (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No components found</h3>
                <p className="text-gray-600">
                  Try adjusting your search query or category filter
                </p>
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`flex-1 overflow-y-auto bg-gray-50 ${className}`}>
      {renderContent()}
    </div>
  );
};