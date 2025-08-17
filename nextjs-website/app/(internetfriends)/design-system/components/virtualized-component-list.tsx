'use client'

import { FixedSizeList as List } from 'react-window'
import type { ComponentMetadata, ComponentRelationship } from '@/lib/design-system/component-discovery'

interface VirtualizedComponentListProps {
  components: ComponentMetadata[]
  relationships: ComponentRelationship[]
  onComponentSelect: (component: ComponentMetadata) => void
  onCaptureScreenshot: (component: ComponentMetadata) => Promise<void>
  searchQuery: string
  selectedCategory: string
}

export function VirtualizedComponentList({
  components,
  relationships,
  onComponentSelect,
  onCaptureScreenshot,
  searchQuery,
  selectedCategory
}: VirtualizedComponentListProps) {
  const ItemRenderer = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const component = components[index]
    
    return (
      <div style={style} className="px-4 py-2">
        <div className="border border-gray-200 rounded-lg p-4 bg-white hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="font-medium text-gray-900">{component.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{component.description}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                  {component.category}
                </span>
                <span className="text-xs text-gray-500">
                  {component.usageCount} uses
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => onComponentSelect(component)}
                className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Select
              </button>
              <button
                onClick={() => onCaptureScreenshot(component)}
                className="text-sm px-3 py-1 bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Screenshot
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="mb-4 px-4">
        <h2 className="text-lg font-semibold text-gray-900">
          Components ({components.length})
        </h2>
        {searchQuery && (
          <p className="text-sm text-gray-600 mt-1">
            Filtered by: "{searchQuery}"
          </p>
        )}
      </div>
      
      <List
        height={600}
        width="100%"
        itemCount={components.length}
        itemSize={120}
        className="w-full"
      >
        {ItemRenderer}
      </List>
    </div>
  )
}