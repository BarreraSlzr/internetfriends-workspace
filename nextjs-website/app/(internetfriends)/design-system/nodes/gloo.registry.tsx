/**
 * Gloo Node Registry - Enhanced Design System with Gloo Integration
 * Combines Octopus.do flat design with InternetFriends glass morphism
 */

import React from 'react'
import { ComponentNode } from './component.gloo.node'
import { HookNode } from './hook.gloo.node'

// Enhanced node types with Gloo support
export const glooNodeTypes = {
  component: ComponentNode,
  hook: HookNode,
  // TODO: Add more node types (page, utility, etc.)
}

// Gloo effect mapping for different node categories
export const glooEffectMap = {
  // Component hierarchy effects
  atomic: 0,     // default - stable foundation
  molecular: 2,  // wave - flowing connections  
  organism: 4,   // pulse - living organisms
  template: 6,   // twist - flexible structure
  page: 8,       // fractal - complex patterns
  
  // Hook type effects
  state: 1,      // spiral - state flow
  effect: 5,     // ripple - side effects
  custom: 7,     // oscillate - custom logic
  context: 9,    // swirl - shared context
  
  // Utility effects
  utility: 3,    // vortex - data processing
  helper: 10,    // bounce - utility functions
} as const

// Color palettes for different categories
export const glooCategoryPalettes = {
  atomic: {
    primary: [34, 197, 94],   // green-500
    secondary: [22, 163, 74], // green-600
    accent: [21, 128, 61],    // green-700
  },
  molecular: {
    primary: [59, 130, 246],  // blue-500
    secondary: [37, 99, 235], // blue-600
    accent: [29, 78, 216],    // blue-700
  },
  organism: {
    primary: [147, 51, 234],  // purple-500
    secondary: [126, 34, 206], // purple-600
    accent: [107, 33, 168],   // purple-700
  },
  template: {
    primary: [249, 115, 22],  // orange-500
    secondary: [234, 88, 12], // orange-600
    accent: [194, 65, 12],    // orange-700
  },
  page: {
    primary: [239, 68, 68],   // red-500
    secondary: [220, 38, 38], // red-600
    accent: [185, 28, 28],    // red-700
  },
  hook: {
    primary: [168, 85, 247],  // purple-500 (distinct from organism)
    secondary: [147, 51, 234], // purple-600
    accent: [126, 34, 206],   // purple-700
  },
  utility: {
    primary: [107, 114, 128], // gray-500
    secondary: [75, 85, 99],  // gray-600
    accent: [55, 65, 81],     // gray-700
  },
} as const

// Node configuration factory
export const createGlooNodeConfig = (
  category: keyof typeof glooCategoryPalettes,
  useGloo: boolean = false
) => {
  const palette = glooCategoryPalettes[category]
  const effectIndex = glooEffectMap[category] ?? 0
  
  return {
    useGloo,
    glooEffect: effectIndex,
    glooColors: [
      palette.primary,
      palette.secondary,
      palette.accent,
    ] as const,
    category,
  }
}

// Enhanced data interfaces
export interface GlooNodeBaseData {
  label: string
  description: string
  useGloo?: boolean
  glooIntensity?: number // 0.1 to 1.0
  glooSpeed?: number     // 0.1 to 2.0
}

export interface GlooComponentNodeData extends GlooNodeBaseData {
  category: 'atomic' | 'molecular' | 'organism' | 'template' | 'page'
}

export interface GlooHookNodeData extends GlooNodeBaseData {
  hookType: 'state' | 'effect' | 'custom' | 'context'
}

// Gloo settings provider
export const useGlooNodeSettings = (nodeType: string, data: GlooNodeBaseData) => {
  return React.useMemo(() => {
    if (!data.useGloo) return null
    
    const category = (data as any).category || (data as any).hookType || 'utility'
    const config = createGlooNodeConfig(category, true)
    
    return {
      ...config,
      speed: data.glooSpeed ?? 0.4,
      intensity: data.glooIntensity ?? 0.6,
      resolution: 128, // Optimized for node size
      depth: 3,        // Balanced performance
    }
  }, [nodeType, data])
}

export default glooNodeTypes