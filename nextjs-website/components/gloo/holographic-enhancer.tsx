'use client'

import { useEffect, useRef, useState } from 'react'

interface HolographicProps {
  children: React.ReactNode
  effect?: 'pokemon' | 'iridescent' | 'prism' | 'pearl' | 'metallic' | 'retina' | 'fragment' | 'auto'
  intensity?: 'subtle' | 'normal' | 'intense'
  className?: string
  enableRetina?: boolean
  pauseOnHover?: boolean
}

const EFFECT_CLASSES = {
  pokemon: 'gloo-pokemon',
  iridescent: 'gloo-iridescent', 
  prism: 'gloo-prism',
  pearl: 'gloo-pearl',
  metallic: 'gloo-metallic',
  retina: 'gloo-retina',
  fragment: 'gloo-fragment'
}

export function Holographic({
  children,
  effect = 'auto',
  intensity = 'normal',
  className = '',
  enableRetina = true,
  pauseOnHover = false
}: HolographicProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedEffect, setSelectedEffect] = useState<keyof typeof EFFECT_CLASSES>('pokemon')
  const [isHovered, setIsHovered] = useState(false)
  const [isRetina, setIsRetina] = useState(false)

  // Auto-select effect if set to 'auto'
  useEffect(() => {
    if (effect === 'auto') {
      const effects = Object.keys(EFFECT_CLASSES) as Array<keyof typeof EFFECT_CLASSES>
      const randomEffect = effects[Math.floor(Math.random() * effects.length)]
      setSelectedEffect(randomEffect)
    } else {
      setSelectedEffect(effect)
    }
  }, [effect])

  // Detect retina display
  useEffect(() => {
    if (enableRetina && typeof window !== 'undefined') {
      const isRetinaDisplay = window.devicePixelRatio > 1
      setIsRetina(isRetinaDisplay)
    }
  }, [enableRetina])

  // Build class names
  const effectClass = EFFECT_CLASSES[selectedEffect]
  const retinaClass = isRetina && enableRetina ? 'holo-retina' : ''
  const pauseClass = pauseOnHover && isHovered ? '[&>*]:animate-pause' : ''
  
  const combinedClassName = [
    'relative',
    effectClass,
    retinaClass,
    pauseClass,
    className
  ].filter(Boolean).join(' ')

  return (
    <div
      ref={containerRef}
      className={combinedClassName}
      onMouseEnter={pauseOnHover ? () => setIsHovered(true) : undefined}
      onMouseLeave={pauseOnHover ? () => setIsHovered(false) : undefined}
    >
      {children}
    </div>
  )
}

// Specialized holographic variants for common use cases
export function Pokemon({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <Holographic effect="pokemon" className={className}>
      {children}
    </Holographic>
  )
}

export function Iridescent({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <Holographic effect="iridescent" className={className}>
      {children}
    </Holographic>
  )
}

export function Prismatic({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <Holographic effect="prism" className={className}>
      {children}
    </Holographic>
  )
}

export function Pearl({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <Holographic effect="pearl" className={className}>
      {children}
    </Holographic>
  )
}

export function Retina({ children, className = '' }: { children: React.ReactNode, className?: string }) {
  return (
    <Holographic 
      effect="retina" 
      enableRetina={true}
      className={className}
    >
      {children}
    </Holographic>
  )
}

// Auto-rotating holographic effect that changes over time
export function Auto({ 
  children, 
  className = '', 
  rotationInterval = 5000
}: { 
  children: React.ReactNode, 
  className?: string,
  rotationInterval?: number
}) {
  const [currentEffect, setCurrentEffect] = useState<keyof typeof EFFECT_CLASSES>('pokemon')

  useEffect(() => {
    const effects = Object.keys(EFFECT_CLASSES) as Array<keyof typeof EFFECT_CLASSES>
    
    const interval = setInterval(() => {
      setCurrentEffect(prev => {
        const currentIndex = effects.indexOf(prev)
        const nextIndex = (currentIndex + 1) % effects.length
        return effects[nextIndex]
      })
    }, rotationInterval)

    return () => clearInterval(interval)
  }, [rotationInterval])

  return (
    <Holographic 
      effect={currentEffect} 
      className={className}
    >
      {children}
    </Holographic>
  )
}