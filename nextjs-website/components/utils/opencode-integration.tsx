"use client";

import React, { useEffect, useCallback } from "react";
import { useOpenCode, useVisualAnalysis, useDeployment } from "@/hooks/domain";

interface OpenCodeIntegrationProps {
  children: React.ReactNode;
}

// Invisible OpenCode integration using the new hooks system
const useOpenCodeIntegration = () => {
  const { analyze, deploy, loading: openCodeLoading, error: openCodeError } = useOpenCode();
  const { captureScreenshot, analyze: analyzeScreenshot, analyzing } = useVisualAnalysis();
  const { deployToStaging, deploying, lastDeployment } = useDeployment();

  // Combined analysis workflow
  const analyzeCurrentView = useCallback(async () => {
    try {
      // Capture screenshot
      const screenshot = await captureScreenshot();
      
      // Analyze with OpenCode
      const result = await analyze({
        screenshot: screenshot.url,
        task: 'analyze design system components and suggest improvements',
        includeCode: true
      });

      return result;
    } catch (error) {
      throw error;
    }
  }, [captureScreenshot, analyze]);

  // Combined deploy workflow
  const deployStaging = useCallback(async () => {
    try {
      const result = await deployToStaging();
      
      // Auto-open staging in 2 seconds
      setTimeout(() => {
        if (result.url) {
          window.open(result.url, '_blank');
        }
      }, 2000);
      
      return result;
    } catch (error) {
      throw error;
    }
  }, [deployToStaging]);

  // Invisible hotkey system
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Cmd/Ctrl + Shift + A = Analyze
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        analyzeCurrentView();
      }
      
      // Cmd/Ctrl + Shift + D = Deploy
      if ((event.metaKey || event.ctrlKey) && event.shiftKey && event.key === 'D') {
        event.preventDefault();
        deployStaging();
      }
    };

    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, [analyzeCurrentView, deployStaging]);

  return {
    analyzeCurrentView,
    deployStaging,
    isProcessing: openCodeLoading || analyzing || deploying,
    lastDeployment,
    error: openCodeError
  };
};

// Minimal, invisible status indicator
const OpenCodeStatusIndicator: React.FC<{ 
  isProcessing: boolean; 
  lastDeployment: any;
  error: string | null;
}> = ({ isProcessing, lastDeployment, error }) => {
  if (!isProcessing && !lastDeployment && !error) return null;

  const getStatusMessage = () => {
    if (error) return `❌ ${error}`;
    if (isProcessing) return "🤖 OpenCode processing...";
    if (lastDeployment?.status === 'success') return `✅ Deployed: ${lastDeployment.url}`;
    if (lastDeployment?.status === 'failed') return `❌ Deploy failed: ${lastDeployment.error}`;
    return "";
  };

  const message = getStatusMessage();
  if (!message) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm max-w-xs">
        <div className="flex items-center gap-2">
          {isProcessing && (
            <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent"></div>
          )}
          <span className="truncate">{message}</span>
        </div>
      </div>
    </div>
  );
};

// Invisible wrapper component
export const OpenCodeIntegration: React.FC<OpenCodeIntegrationProps> = ({ children }) => {
  const { isProcessing, lastDeployment, error } = useOpenCodeIntegration();

  return (
    <>
      {children}
      <OpenCodeStatusIndicator 
        isProcessing={isProcessing} 
        lastDeployment={lastDeployment}
        error={error} 
      />
    </>
  );
};

export default OpenCodeIntegration;