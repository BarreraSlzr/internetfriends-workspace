'use client'

import { useEffect, useRef, useState, useMemo } from 'react'
import { useInView } from 'react-intersection-observer'
import { glassAberrationEffects, glassAberrationNames } from './glass-aberration-shader'
import { cn } from '@/lib/utils'

interface GlassAberrationProps {
  /** Aberration effect variant */
  variant?: 'chromatic' | 'edge' | 'liquid' | 'frosted' | 'crystal'
  /** Effect intensity */
  intensity?: number
  /** Animation speed */
  speed?: number
  /** Border thickness */
  borderThickness?: number
  /** Blue tint strength for brand consistency */
  blueTint?: number
  /** Custom className */
  className?: string
  /** Apply to element borders */
  borderOnly?: boolean
  /** Children content */
  children?: React.ReactNode
}

// Map variant names to effect indices
const variantMap = {
  chromatic: 0,
  edge: 1,
  liquid: 2,
  frosted: 3,
  crystal: 4,
}

export function GlassAberrationGL({
  variant = 'chromatic',
  intensity = 0.6,
  speed = 0.5,
  borderThickness = 4,
  blueTint = 0.8,
  className,
  borderOnly = false,
  children,
}: GlassAberrationProps) {
  const [, inView] = useInView({
    triggerOnce: true,
    rootMargin: '100px 0px',
  })
  
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const shaderProgramRef = useRef<WebGLProgram | null>(null)
  const animationRef = useRef<number>()
  
  const [size, setSize] = useState({ width: 0, height: 0 })
  const startTime = useRef(performance.now())
  
  // Get the selected effect
  const effectIndex = variantMap[variant]
  const selectedEffect = glassAberrationEffects[effectIndex]
  
  // Vertex shader for glass aberration
  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
      gl_Position = vec4(position, 0.0, 1.0);
    }
  `
  
  // Fragment shader with glass aberration effects
  const fragmentShaderSource = useMemo(() => `
    precision highp float;
    uniform vec2 iResolution;
    uniform float iTime;
    uniform float uIntensity;
    uniform float uBlueTint;
    uniform float uBorderThickness;
    
    float speed = ${speed.toFixed(2)};
    
    ${selectedEffect}
    
    void main() {
      vec2 fragCoord = gl_FragCoord.xy;
      vec2 p = (2.0 * fragCoord - iResolution) / max(iResolution.x, iResolution.y);
      
      // Calculate distance from edge for border effect
      vec2 edgeDist = abs(p);
      float maxEdgeDist = max(edgeDist.x, edgeDist.y);
      float borderMask = smoothstep(1.0 - uBorderThickness * 0.1, 1.0, maxEdgeDist);
      
      // Apply glass aberration effect
      vec2 aberration = effect(p, 1.0, iTime) * uIntensity;
      
      // Create glass-like color with blue tint
      vec3 baseColor = mix(
        vec3(0.95, 0.97, 1.0),  // Slight blue-white
        vec3(0.7, 0.85, 1.0),   // More blue
        uBlueTint
      );
      
      // Apply chromatic aberration to color channels
      float r = baseColor.r + sin(p.x + aberration.x * 5.0 + iTime) * 0.1;
      float g = baseColor.g + sin(p.y + aberration.y * 4.0 + iTime * 1.1) * 0.08;
      float b = baseColor.b + sin(length(p) + aberration.x * 3.0 + iTime * 0.9) * 0.12;
      
      vec3 color = vec3(r, g, b);
      
      // Apply border mask if border-only mode
      float alpha = ${borderOnly ? 'borderMask' : '1.0'};
      
      // Add glass-like transparency and refraction
      alpha *= 0.15 + sin(length(aberration) * 10.0 + iTime) * 0.05;
      
      gl_FragColor = vec4(color, alpha);
    }
  `, [selectedEffect, speed, borderOnly])
  
  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !inView) return
    
    const gl = canvas.getContext('webgl', { 
      premultipliedAlpha: false,
      alpha: true,
      antialias: true
    }) || canvas.getContext('experimental-webgl') as WebGLRenderingContext
    
    if (!gl) {
      console.warn('WebGL not supported for glass aberration')
      return
    }
    
    // Create shaders
    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    if (!vertexShader) return
    
    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)
    
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    if (!fragmentShader) return
    
    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)
    
    // Check for compilation errors
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Glass aberration shader compilation error:', gl.getShaderInfoLog(fragmentShader))
      return
    }
    
    // Create program
    const shaderProgram = gl.createProgram()
    if (!shaderProgram) return
    
    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)
    
    // Create buffer
    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = [-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)
    
    // Set up position attribute
    const positionLocation = gl.getAttribLocation(shaderProgram, 'position')
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)
    
    // Enable blending for transparency
    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    
    glRef.current = gl
    shaderProgramRef.current = shaderProgram
    startTime.current = performance.now()
    
  }, [fragmentShaderSource, vertexShaderSource, inView])
  
  // Handle resize
  useEffect(() => {
    if (!containerRef.current) return
    
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setSize({ width, height })
      }
    })
    
    resizeObserver.observe(containerRef.current)
    return () => resizeObserver.disconnect()
  }, [])
  
  // Update canvas size and viewport
  useEffect(() => {
    const canvas = canvasRef.current
    const gl = glRef.current
    if (!canvas || !gl || size.width === 0) return
    
    canvas.width = size.width
    canvas.height = size.height
    gl.viewport(0, 0, size.width, size.height)
    
    // Update resolution uniform
    const shaderProgram = shaderProgramRef.current
    if (shaderProgram) {
      const iResolutionLocation = gl.getUniformLocation(shaderProgram, 'iResolution')
      gl.uniform2f(iResolutionLocation, size.width, size.height)
    }
  }, [size])
  
  // Animation loop
  useEffect(() => {
    if (!inView) return
    
    const animate = () => {
      const gl = glRef.current
      const shaderProgram = shaderProgramRef.current
      if (!gl || !shaderProgram) {
        animationRef.current = requestAnimationFrame(animate)
        return
      }
      
      const currentTime = performance.now()
      const elapsed = (currentTime - startTime.current) * 0.001
      
      // Update uniforms
      const iTimeLocation = gl.getUniformLocation(shaderProgram, 'iTime')
      const uIntensityLocation = gl.getUniformLocation(shaderProgram, 'uIntensity')
      const uBlueTintLocation = gl.getUniformLocation(shaderProgram, 'uBlueTint')
      const uBorderThicknessLocation = gl.getUniformLocation(shaderProgram, 'uBorderThickness')
      
      gl.uniform1f(iTimeLocation, elapsed)
      gl.uniform1f(uIntensityLocation, intensity)
      gl.uniform1f(uBlueTintLocation, blueTint)
      gl.uniform1f(uBorderThicknessLocation, borderThickness)
      
      // Clear and draw
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animationRef.current = requestAnimationFrame(animate)
    
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [inView, intensity, blueTint, borderThickness])
  
  return (
    <div
      ref={containerRef}
      className={cn(
        'relative overflow-hidden',
        borderOnly ? 'pointer-events-none' : '',
        className
      )}
    >
      {/* WebGL Canvas for glass aberration */}
      <canvas
        ref={canvasRef}
        className={cn(
          'absolute inset-0 w-full h-full',
          borderOnly ? 'pointer-events-none' : ''
        )}
        style={{ 
          mixBlendMode: 'screen',
          opacity: 0.8
        }}
      />
      
      {/* Content */}
      {children && (
        <div className="relative z-10">
          {children}
        </div>
      )}
    </div>
  )
}

// Higher-level wrapper for easy integration with existing glass components
export function GlassAberrationBorder({
  children,
  variant = 'edge',
  intensity = 0.4,
  className,
}: Omit<GlassAberrationProps, 'borderOnly'> & { children: React.ReactNode }) {
  return (
    <GlassAberrationGL
      variant={variant}
      intensity={intensity}
      borderOnly={true}
      className={cn('rounded-lg', className)}
    >
      {children}
    </GlassAberrationGL>
  )
}