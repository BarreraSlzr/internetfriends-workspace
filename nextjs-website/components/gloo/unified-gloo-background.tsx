'use client'

import { useEffect, useRef, useState } from 'react'
import { BgGooRotating } from './rotating-gloo'
import { useTheme } from '@/hooks/use-theme'

interface GlooBackgroundProps {
  children: React.ReactNode
  intensity?: 'subtle' | 'normal' | 'vibrant'
  context?: 'design-system' | 'component-preview' | 'documentation' | 'testing'
  className?: string
  holographic?: boolean
  staticMode?: boolean // For testing/screenshots
}

// Adaptive color palettes for different contexts and themes
const CONTEXT_PALETTES = {
  'design-system': {
    light: {
      color1: [0.98, 0.96, 0.94], // Warm white
      color2: [0.94, 0.96, 0.98], // Cool white  
      color3: [0.96, 0.97, 0.98], // Neutral white
    },
    dark: {
      color1: [0.08, 0.12, 0.18], // Deep blue-grey
      color2: [0.12, 0.08, 0.16], // Deep purple-grey
      color3: [0.10, 0.14, 0.12], // Deep green-grey
    }
  },
  'component-preview': {
    light: {
      color1: [0.92, 0.94, 0.98], // Subtle blue-white
      color2: [0.98, 0.94, 0.92], // Subtle warm-white
      color3: [0.94, 0.98, 0.96], // Subtle green-white
    },
    dark: {
      color1: [0.14, 0.16, 0.22], // Muted blue-grey
      color2: [0.18, 0.14, 0.20], // Muted purple-grey
      color3: [0.16, 0.20, 0.18], // Muted green-grey
    }
  },
  'documentation': {
    light: {
      color1: [0.96, 0.97, 0.99], // Pure subtle
      color2: [0.99, 0.97, 0.96], // Warm subtle
      color3: [0.97, 0.99, 0.98], // Cool subtle
    },
    dark: {
      color1: [0.06, 0.08, 0.12], // Very dark blue
      color2: [0.10, 0.06, 0.12], // Very dark purple
      color3: [0.08, 0.12, 0.10], // Very dark green
    }
  },
  'testing': {
    light: {
      color1: [0.95, 0.95, 0.95], // Neutral grey
      color2: [0.97, 0.95, 0.95], // Slightly warm grey
      color3: [0.95, 0.95, 0.97], // Slightly cool grey
    },
    dark: {
      color1: [0.12, 0.12, 0.12], // Neutral dark grey
      color2: [0.14, 0.12, 0.12], // Slightly warm dark grey
      color3: [0.12, 0.12, 0.14], // Slightly cool dark grey
    }
  }
}

const INTENSITY_CONFIGS = {
  subtle: {
    speed: 0.15,
    resolution: 1.5,
    depth: 1,
    colorRotation: 'subtle' as const
  },
  normal: {
    speed: 0.3,
    resolution: 2.0,
    depth: 2,
    colorRotation: 'normal' as const
  },
  vibrant: {
    speed: 0.5,
    resolution: 2.5,
    depth: 3,
    colorRotation: 'dynamic' as const
  }
}

export function GlooBackground({
  children,
  intensity = 'normal',
  context = 'component-preview',
  className = '',
  holographic = true,
  staticMode = false
}: GlooBackgroundProps) {
  const { isDark } = useTheme()
  const containerRef = useRef<HTMLDivElement>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Get adaptive colors based on theme and context
  const palette = CONTEXT_PALETTES[context][isDark ? 'dark' : 'light']
  const config = INTENSITY_CONFIGS[intensity]

  // Enhanced config for holographic mode
  const holoConfig = holographic ? {
    ...config,
    colorRotation: 'realtime' as const,
    speed: config.speed * 1.2
  } : config

  if (!isClient) {
    // Server-side render with neutral background
    return (
      <div className={`relative w-full h-full ${className}`}>
        <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800" />
        <div className="relative z-10">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div ref={containerRef} className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Gloo Background Layer */}
      <div className="absolute inset-0 z-0">
        <BgGooRotating
          {...holoConfig}
          color1={palette.color1}
          color2={palette.color2}
          color3={palette.color3}
          still={staticMode}
          tint={[1.0, 1.0, 1.0]}
          seed={Math.random() * 2.0} // Randomize each instance
        />
      </div>

      {/* Content Layer with Glass Enhancement */}
      <div className="relative z-10 w-full h-full">
        {/* Subtle glass overlay for content readability */}
        <div className="absolute inset-0 glass-noise-overlay pointer-events-none" />
        
        {/* Component Content */}
        <div className="relative z-20 w-full h-full">
          {children}
        </div>
      </div>

      {/* Context Indicator (for development/debugging) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="absolute top-2 left-2 z-30 text-xs bg-black/20 text-white/70 px-2 py-1 rounded">
          {context} • {intensity} • {holographic ? 'holo' : 'standard'}
        </div>
      )}
    </div>
  )
}

// Specialized variants for common use cases
export function DesignSystemGloo({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <GlooBackground
      context="design-system"
      intensity="subtle"
      holographic={false}
      className={className}
    >
      {children}
    </GlooBackground>
  )
}

export function ComponentPreviewGloo({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <GlooBackground
      context="component-preview"
      intensity="normal"
      holographic={true}
      className={className}
    >
      {children}
    </GlooBackground>
  )
}

export function DocumentationGloo({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <GlooBackground
      context="documentation"
      intensity="subtle"
      holographic={false}
      className={className}
    >
      {children}
    </GlooBackground>
  )
}

export function TestingGloo({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <GlooBackground
      context="testing"
      intensity="subtle"
      holographic={false}
      staticMode={true}
      className={className}
    >
      {children}
    </GlooBackground>
  )
}