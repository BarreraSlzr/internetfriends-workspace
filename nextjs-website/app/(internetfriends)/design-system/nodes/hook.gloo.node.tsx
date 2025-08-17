import React from 'react'
import type { NodeProps } from '@xyflow/react'
import { GlooCanvasAtomic } from '@/components/gloo/canvas.atomic'
import { generateGlooPalette } from '@/components/gloo/palette'
import styles from './hook.node.styles.module.scss'

export interface HookNodeData {
  label: string
  description: string
  hookType: 'state' | 'effect' | 'custom' | 'context'
  useGloo?: boolean
}

export const HookNode: React.FC<NodeProps<HookNodeData>> = ({ data }) => {
  const getHookTypeConfig = (type: string) => {
    switch (type) {
      case 'state':
        return { 
          colors: 'bg-green-100 border-green-300 text-green-800',
          glooEffect: 1, // spiral - represents state flow
          glooColors: [[34, 197, 94], [22, 163, 74], [21, 128, 61]] as const,
          icon: '🔄'
        }
      case 'effect':
        return { 
          colors: 'bg-orange-100 border-orange-300 text-orange-800',
          glooEffect: 5, // ripple - represents side effects
          glooColors: [[249, 115, 22], [234, 88, 12], [194, 65, 12]] as const,
          icon: '⚡'
        }
      case 'custom':
        return { 
          colors: 'bg-blue-100 border-blue-300 text-blue-800',
          glooEffect: 7, // oscillate - represents custom logic
          glooColors: [[59, 130, 246], [37, 99, 235], [29, 78, 216]] as const,
          icon: '🔧'
        }
      case 'context':
        return { 
          colors: 'bg-purple-100 border-purple-300 text-purple-800',
          glooEffect: 9, // swirl - represents shared context
          glooColors: [[147, 51, 234], [126, 34, 206], [107, 33, 168]] as const,
          icon: '🌐'
        }
      default:
        return { 
          colors: 'bg-gray-100 border-gray-300 text-gray-800',
          glooEffect: 0,
          glooColors: [[107, 114, 128], [75, 85, 99], [55, 65, 81]] as const,
          icon: '🪝'
        }
    }
  }

  const config = getHookTypeConfig(data.hookType)
  
  const glooPalette = React.useMemo(() => {
    if (!data.useGloo) return null
    
    return generateGlooPalette({
      mode: 'light',
      strategy: 'hook',
      anchorColor: '#8b5cf6', // Purple for hooks
      seed: 42
    })
  }, [data.useGloo, config.glooColors])

  return (
    <div className={styles.hookContainer}>
      {data.useGloo && glooPalette && (
        <div className={styles.glooBackground}>
          <GlooCanvasAtomic
            palette={glooPalette}
            effectIndex={config.glooEffect}
            animate={true}
            speed={0.5}
            depth={3}
            resolution={128}
            reducedMotion={false}
            className={styles.glooCanvas}
          />
        </div>
      )}
      
      <div
        className={`${styles.hookContent} ${config.colors} ${data.useGloo ? styles.glooEnabled : ''}`}
      >
        <div className={styles.hookHeader}>
          <div className={styles.hookIcon}>{config.icon}</div>
          <div className={styles.hookLabel}>{data.label}</div>
        </div>
        <div className={styles.hookType}>{data.hookType}</div>
        <div className={styles.hookDescription}>{data.description}</div>
        {data.useGloo && (
          <div className={styles.glooIndicator}>
            ✨ Gloo Hook
          </div>
        )}
      </div>
    </div>
  )
}

HookNode.displayName = 'HookNode'

export default HookNode