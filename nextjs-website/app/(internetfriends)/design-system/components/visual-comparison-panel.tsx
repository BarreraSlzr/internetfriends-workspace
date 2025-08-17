'use client'

import { useState } from 'react'

interface VisualComparisonPanelProps {
  onAnalysisComplete: (result: any) => void
}

export function VisualComparisonPanel({ onAnalysisComplete }: VisualComparisonPanelProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const runAnalysis = async () => {
    setIsAnalyzing(true)
    
    try {
      // Simulate analysis
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const result = {
        status: 'completed',
        differences: [],
        score: 95
      }
      
      onAnalysisComplete(result)
    } catch (error) {
      console.error('Analysis failed:', error)
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">Visual Comparison</h2>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Upload baseline image</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Choose File
          </button>
        </div>
        
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <p className="text-gray-600 mb-4">Upload comparison image</p>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Choose File
          </button>
        </div>
      </div>
      
      <div className="mt-6 text-center">
        <button
          onClick={runAnalysis}
          disabled={isAnalyzing}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {isAnalyzing ? 'Analyzing...' : 'Run Visual Analysis'}
        </button>
      </div>
    </div>
  )
}