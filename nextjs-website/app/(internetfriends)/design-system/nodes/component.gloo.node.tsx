import React from 'react'
import type { NodeProps } from '@xyflow/react'
import { GlooCanvasAtomic } from '@/components/gloo/canvas.atomic'
import { generateGlooPalette } from '@/components/gloo/palette'
import styles from './component.node.styles.module.scss'

export interface ComponentNodeData {
  label: string
  category: 'atomic' | 'molecular' | 'organism' | 'template' | 'page'
  description: string
  useGloo?: boolean
}

export const ComponentNode: React.FC<NodeProps<ComponentNodeData>> = ({ data }) => {
  const getCategoryConfig = (category: string) => {
    switch (category) {
      case 'atomic':
        return { 
          colors: 'bg-green-100 border-green-300 text-green-800',
          glooEffect: 0, // default
          glooColors: [[34, 197, 94], [22, 163, 74], [21, 128, 61]] as const
        }
      case 'molecular':
        return { 
          colors: 'bg-blue-100 border-blue-300 text-blue-800',
          glooEffect: 2, // wave
          glooColors: [[59, 130, 246], [37, 99, 235], [29, 78, 216]] as const
        }
      case 'organism':
        return { 
          colors: 'bg-purple-100 border-purple-300 text-purple-800',
          glooEffect: 4, // pulse
          glooColors: [[147, 51, 234], [126, 34, 206], [107, 33, 168]] as const
        }
      case 'template':
        return { 
          colors: 'bg-orange-100 border-orange-300 text-orange-800',
          glooEffect: 6, // twist
          glooColors: [[249, 115, 22], [234, 88, 12], [194, 65, 12]] as const
        }
      case 'page':
        return { 
          colors: 'bg-red-100 border-red-300 text-red-800',
          glooEffect: 8, // fractal
          glooColors: [[239, 68, 68], [220, 38, 38], [185, 28, 28]] as const
        }
      default:
        return { 
          colors: 'bg-gray-100 border-gray-300 text-gray-800',
          glooEffect: 0,
          glooColors: [[107, 114, 128], [75, 85, 99], [55, 65, 81]] as const
        }
    }
  }

  const config = getCategoryConfig(data.category)
  
  const glooPalette = React.useMemo(() => {
    if (!data.useGloo) return null
    
    return generateGlooPalette({
      mode: 'light',
      strategy: 'category',
      color1: config.glooColors[0].map(c => c / 255) as [number, number, number],
      color2: config.glooColors[1].map(c => c / 255) as [number, number, number],
      color3: config.glooColors[2].map(c => c / 255) as [number, number, number],
    })
  }, [data.useGloo, config.glooColors])

  return (
    <div className={styles.nodeContainer}>
      {data.useGloo && glooPalette && (
        <div className={styles.glooBackground}>
          <GlooCanvasAtomic
            palette={glooPalette}
            effectIndex={config.glooEffect}
            animate={true}
            speed={0.3}
            depth={4}
            resolution={256}
            reducedMotion={false}
            className={styles.glooCanvas}
          />
        </div>
      )}
      
      <div
        className={`${styles.nodeContent} ${config.colors} ${data.useGloo ? styles.glooEnabled : ''}`}
      >
        <div className={styles.nodeHeader}>
          <div className={styles.nodeLabel}>{data.label}</div>
          <div className={styles.nodeCategory}>{data.category}</div>
        </div>
        <div className={styles.nodeDescription}>{data.description}</div>
        {data.useGloo && (
          <div className={styles.glooIndicator}>
            ✨ Gloo Enhanced
          </div>
        )}
      </div>
    </div>
  )
}

ComponentNode.displayName = 'ComponentNode'

export const nodeTypes = {
  component: ComponentNode,
}

export default ComponentNode