"use client";

import * as React from "react";
const { useEffect, useRef } = React;
import { ComponentSnapshot } from "@/lib/design-system/component-snapshot-generator";
import { MarkdownRendererAtomic } from "@/components/atomic/markdown-renderer/markdown-renderer.atomic";
import { GlassCardAtomic } from "@/components/atomic/glass-card/glass-card.atomic";
import { ButtonAtomic } from "@/components/atomic/button/button.atomic";
import {
  X,
  ExternalLink,
  Code,
  FileText,
  Zap,
  Clock,
  Users,
  CheckCircle,
  AlertTriangle,
  XCircle,
  TestTube,
  Copy,
  Download
} from "lucide-react";

interface ComponentDetailModalProps {
  component: ComponentSnapshot | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ComponentDetailModal: React.FC<ComponentDetailModalProps> = ({
  component,
  isOpen,
  onClose
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Handle escape key and click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    document.addEventListener('mousedown', handleClickOutside);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen || !component) return null;

  const getTestStatusIcon = (status: string) => {
    switch (status) {
      case "passing":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case "failing":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <TestTube className="h-5 w-5 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "atomic":
        return "text-blue-600 bg-blue-100";
      case "molecular":
        return "text-green-600 bg-green-100";
      case "organism":
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(component, null, 2));
      // Could add toast notification here
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleDownloadSnapshot = () => {
    const dataStr = JSON.stringify(component, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${component.metadata.name}-snapshot.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div
        ref={modalRef}
        className="glass-layer-2 glass-elevation-2 rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center gap-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {component.metadata.name}
              </h2>
              <div className="flex items-center gap-3 mt-1">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(component.metadata.category)}`}>
                  {component.metadata.category}
                </span>
                {getTestStatusIcon(component.metadata.testStatus)}
                <span className="text-sm text-gray-500">
                  Last updated {new Date(component.metadata.lastModified).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ButtonAtomic
              variant="ghost"
              size="sm"
              onClick={handleCopyCode}
              className="flex items-center gap-2"
            >
              <Copy className="h-4 w-4" />
              Copy
            </ButtonAtomic>
            
            <ButtonAtomic
              variant="ghost"
              size="sm"
              onClick={handleDownloadSnapshot}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </ButtonAtomic>
            
            <ButtonAtomic
              variant="ghost"
              size="sm"
              onClick={() => window.open(component.metadata.filePath, '_blank')}
              className="flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              View File
            </ButtonAtomic>
            
            <ButtonAtomic
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <X className="h-5 w-5" />
            </ButtonAtomic>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-6">
            {/* Description */}
            <div>
              <p className="text-gray-700 text-lg leading-relaxed">
                {component.metadata.description}
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <GlassCardAtomic variant="subtle" className="p-4 text-center">
                <Users className="h-6 w-6 mx-auto mb-2 text-blue-500" />
                <div className="text-2xl font-bold text-gray-900">
                  {component.metadata.usageCount}
                </div>
                <div className="text-sm text-gray-600">Uses</div>
              </GlassCardAtomic>

              <GlassCardAtomic variant="subtle" className="p-4 text-center">
                <Zap className="h-6 w-6 mx-auto mb-2 text-green-500" />
                <div className="text-2xl font-bold text-gray-900">
                  {component.stateMachine.states.length}
                </div>
                <div className="text-sm text-gray-600">States</div>
              </GlassCardAtomic>

              <GlassCardAtomic variant="subtle" className="p-4 text-center">
                <Code className="h-6 w-6 mx-auto mb-2 text-purple-500" />
                <div className="text-2xl font-bold text-gray-900">
                  {component.metadata.exports.length}
                </div>
                <div className="text-sm text-gray-600">Exports</div>
              </GlassCardAtomic>

              <GlassCardAtomic variant="subtle" className="p-4 text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-orange-500" />
                <div className="text-2xl font-bold text-gray-900">
                  {component.performance.analysisTime}ms
                </div>
                <div className="text-sm text-gray-600">Analysis</div>
              </GlassCardAtomic>
            </div>

            {/* Props Table */}
            {component.metadata.props.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Props
                </h3>
                <GlassCardAtomic variant="default" className="overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Type</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Required</th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Description</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {component.metadata.props.map((prop, idx) => (
                          <tr key={idx} className="hover:bg-gray-50">
                            <td className="px-4 py-3 font-mono text-sm text-gray-900">
                              {prop.name}
                            </td>
                            <td className="px-4 py-3 font-mono text-sm text-blue-600">
                              {prop.type}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {prop.required ? (
                                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                                  Required
                                </span>
                              ) : (
                                <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                  Optional
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-gray-600">
                              {prop.description || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </GlassCardAtomic>
              </div>
            )}

            {/* Dependencies */}
            {component.metadata.dependencies.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Dependencies</h3>
                <div className="flex flex-wrap gap-2">
                  {component.metadata.dependencies.map((dep, idx) => (
                    <span 
                      key={idx}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-mono"
                    >
                      {dep}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* State Machine Documentation */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <FileText className="h-5 w-5" />
                State Machine Documentation
              </h3>
              <GlassCardAtomic variant="default" className="p-6">
                <MarkdownRendererAtomic
                  content={component.stateMachine.documentation}
                  enableMermaid={true}
                />
              </GlassCardAtomic>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};