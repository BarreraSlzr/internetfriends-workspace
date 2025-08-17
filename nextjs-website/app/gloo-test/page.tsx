'use client'

import React, { useState } from 'react'
import { GlooCanvasAtomic } from '@/components/gloo/canvas.atomic'
import { generateGlooPalette } from '@/components/gloo/palette'

export default function GlooTestPage() {
  const [effectIndex, setEffectIndex] = useState(0)
  const [isVisible, setIsVisible] = useState(true)
  
  const palette = generateGlooPalette({
    mode: 'light',
    strategy: 'test',
    anchorColor: '#ff0000', // Red
    seed: 42
  })

  const effects = [
    { name: 'default', index: 0 },
    { name: 'spiral', index: 1 },
    { name: 'wave', index: 2 },
    { name: 'vortex', index: 3 },
    { name: 'pulse', index: 4 },
    { name: 'ripple', index: 5 },
    { name: 'twist', index: 6 },
    { name: 'oscillate', index: 7 },
    { name: 'fractal', index: 8 },
    { name: 'swirl', index: 9 },
    { name: 'bounce', index: 10 },
  ]

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#000',
      color: '#fff',
      padding: '2rem'
    }}>
      <h1>Gloo WebGL Test</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button 
          onClick={() => setIsVisible(!isVisible)}
          style={{ 
            padding: '0.5rem 1rem', 
            marginRight: '1rem',
            background: isVisible ? '#22c55e' : '#ef4444',
            color: 'white',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          {isVisible ? 'Hide Gloo' : 'Show Gloo'}
        </button>
        
        <select 
          value={effectIndex}
          onChange={(e) => setEffectIndex(Number(e.target.value))}
          style={{ 
            padding: '0.5rem', 
            background: '#333',
            color: 'white',
            border: '1px solid #666'
          }}
        >
          {effects.map(effect => (
            <option key={effect.index} value={effect.index}>
              {effect.name} ({effect.index})
            </option>
          ))}
        </select>
      </div>

      <div style={{ 
        width: '400px', 
        height: '400px', 
        border: '2px solid #666',
        position: 'relative',
        background: '#222'
      }}>
        {isVisible && (
          <GlooCanvasAtomic
            palette={palette}
            effectIndex={effectIndex}
            animate={true}
            speed={1.0}
            depth={6}
            resolution={512}
            reducedMotion={false}
            style={{ 
              width: '100%', 
              height: '100%',
              opacity: 1
            }}
          />
        )}
        
        <div style={{
          position: 'absolute',
          bottom: '10px',
          left: '10px',
          background: 'rgba(0,0,0,0.8)',
          padding: '0.5rem',
          fontSize: '0.75rem'
        }}>
          Effect: {effects[effectIndex]?.name || 'unknown'}
        </div>
      </div>
      
      <div style={{ marginTop: '2rem' }}>
        <h2>Debug Info:</h2>
        <pre style={{ 
          background: '#111', 
          padding: '1rem',
          fontSize: '0.75rem',
          overflow: 'auto'
        }}>
          {JSON.stringify({
            effectIndex,
            effectName: effects[effectIndex]?.name,
            paletteStrategy: palette?.strategy,
            paletteMode: palette?.mode,
            isVisible
          }, null, 2)}
        </pre>
      </div>
    </div>
  )
}