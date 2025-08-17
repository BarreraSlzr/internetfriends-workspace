'use client'

import type { ComponentMetadata } from '@/lib/design-system/component-discovery'

interface ComponentFlowDashboardProps {
  components: ComponentMetadata[]
  mode?: 'flow' | 'audit'
  enableAI?: boolean
}

export function ComponentFlowDashboard({ 
  components, 
  mode = 'flow',
  enableAI = false 
}: ComponentFlowDashboardProps) {
  return (
    <div className="w-full h-full bg-gray-50 rounded-lg border">
      <div className="p-4 border-b bg-white">
        <h2 className="text-lg font-semibold">
          {mode === 'audit' ? 'Component Audit' : 'Component Flow'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          {components.length} components • {enableAI ? 'AI Enhanced' : 'Standard View'}
        </p>
      </div>
      
      <div className="p-6 flex items-center justify-center h-96">
        <div className="text-center">
          <div className="text-4xl mb-4">🚧</div>
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            {mode === 'audit' ? 'Component Audit Dashboard' : 'Flow Visualization'}
          </h3>
          <p className="text-gray-500">
            {mode === 'audit' 
              ? 'Automated component analysis and recommendations' 
              : 'Interactive component relationship visualization'
            }
          </p>
          <p className="text-sm text-gray-400 mt-2">
            Coming soon with ReactFlow integration
          </p>
        </div>
      </div>
    </div>
  )
}