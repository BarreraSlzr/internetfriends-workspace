'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import { useInView } from 'react-intersection-observer'
import { effectFunctions } from './effects'
import useRafInterval from '../../hooks/use-rafaga-interval'
import { motion } from 'framer-motion'
import { getRandomColors } from './production-palette'
import { GlooControls } from './gloo-controls'

// Simple implementation of useReducedMotion
function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(mql.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches)
    }

    mql.addEventListener('change', handleChange)
    return () => {
      mql.removeEventListener('change', handleChange)
    }
  }, [])

  return reducedMotion
}

interface BgGooProps {
  speed?: number;
  resolution?: number;
  depth?: number;
  seed?: number;
  still?: boolean;
  tint?: number[];
  color1?: number[];
  color2?: number[];
  color3?: number[];
  showControls?: boolean;
  context?: 'hero' | 'card' | 'background' | 'accent';
  onParamsChange?: (params: any) => void;
}

export function BgGooEnhanced({
  speed: initialSpeed = 0.3,
  resolution: initialResolution = 2.0,
  depth: initialDepth = 2,
  seed: initialSeed = 0.4,
  still = false,
  tint = [1.0, 1.0, 1.0],
  color1: initialColor1,
  color2: initialColor2,
  color3: initialColor3,
  showControls = false,
  context = 'background',
  onParamsChange
}: BgGooProps) {
  const [, inView] = useInView({
    triggerOnce: true,
    rootMargin: '200px 0px',
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  const mousePosRef = useRef({ x: 0, y: 0 })
  const startRef = useRef(performance.now())
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const glRef = useRef<WebGLRenderingContext | null>(null)
  const shaderProgramRef = useRef<WebGLProgram | null>(null)
  const reducedMotion = useReducedMotion()

  // Current parameters state
  const [currentParams, setCurrentParams] = useState(() => {
    const randomColors = getRandomColors();
    return {
      speed: initialSpeed,
      resolution: initialResolution,
      depth: initialDepth,
      seed: initialSeed,
      color1: initialColor1 || randomColors[0],
      color2: initialColor2 || randomColors[1],
      color3: initialColor3 || randomColors[2],
      effectIndex: Math.floor(Math.random() * effectFunctions.length),
      effectName: 'random'
    };
  });

  // Selected effect based on current index
  const selectedEffect = effectFunctions[currentParams.effectIndex];

  // Regenerate random parameters
  const regenerateParams = useCallback(() => {
    const randomColors = getRandomColors();
    const newParams = {
      speed: Math.random() * 0.4 + 0.1, // 0.1 - 0.5
      resolution: Math.random() * 1.5 + 0.8, // 0.8 - 2.3
      depth: Math.floor(Math.random() * 3) + 1, // 1 - 3
      seed: Math.random() * 5, // 0 - 5
      color1: randomColors[0],
      color2: randomColors[1],
      color3: randomColors[2],
      effectIndex: Math.floor(Math.random() * effectFunctions.length),
      effectName: 'random'
    };
    
    setCurrentParams(newParams);
    onParamsChange?.(newParams);
    
    // Reset start time for new effect
    startRef.current = performance.now();
  }, [onParamsChange]);

  // Shader source with current parameters
  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
  `

  const fragmentShaderSource = useMemo(() => `
  precision mediump float;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;
  uniform vec3 uTint;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  float speed = ${currentParams.speed.toFixed(2)};

  ${selectedEffect}

  void main() {
    vec2 p = (2.0 * gl_FragCoord.xy - iResolution.xy) / max(iResolution.x, iResolution.y);
    p.x += ${currentParams.seed.toFixed(1)};
    p.y += ${currentParams.seed.toFixed(1)};

    p *= ${currentParams.resolution.toFixed(1)};
    for (int i = 1; i < ${currentParams.depth}; i++) {
      float fi = float(i);
      p += effect(p, fi, iTime * speed);
    }
    vec3 col = mix(mix(uColor1, uColor2, 1.0-sin(p.x)), uColor3, cos(p.y+p.x));
    col *= uTint;
    gl_FragColor = vec4(col, 1.0);
  }
`, [currentParams, selectedEffect]);

  // Initialize WebGL when fragment shader changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const gl = canvas.getContext("webgl", { preserveDrawingBuffer: still }) ||
               (canvas.getContext("experimental-webgl") as WebGLRenderingContext)

    if (!gl) {
      console.error("Unable to initialize WebGL. Your browser may not support it.")
      return
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)
    if (!vertexShader) return

    gl.shaderSource(vertexShader, vertexShaderSource)
    gl.compileShader(vertexShader)

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)
    if (!fragmentShader) return

    gl.shaderSource(fragmentShader, fragmentShaderSource)
    gl.compileShader(fragmentShader)

    // Check for shader compilation errors
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error('Fragment shader compilation error:', gl.getShaderInfoLog(fragmentShader));
      return;
    }

    const shaderProgram = gl.createProgram()
    if (!shaderProgram) return

    gl.attachShader(shaderProgram, vertexShader)
    gl.attachShader(shaderProgram, fragmentShader)
    gl.linkProgram(shaderProgram)
    gl.useProgram(shaderProgram)

    const positionBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer)
    const positions = [
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    ]
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW)

    const positionLocation = gl.getAttribLocation(shaderProgram, "position")
    gl.enableVertexAttribArray(positionLocation)
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0)

    glRef.current = gl
    shaderProgramRef.current = shaderProgram
  }, [fragmentShaderSource, vertexShaderSource, still])

  // Resize handling
  useEffect(() => {
    if (!containerRef.current) return

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect()
        setSize({ width, height })
      }
    })

    resizeObserver.observe(containerRef.current)

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current)
      }
    }
  }, [containerRef])

  // Update resolution uniform when size changes
  useEffect(() => {
    const gl = glRef.current
    const shaderProgram = shaderProgramRef.current
    if (!gl || !shaderProgram) return
    gl.viewport(0, 0, size.width, size.height)
    const iResolutionLocation = gl.getUniformLocation(shaderProgram, "iResolution")
    gl.uniform2f(iResolutionLocation, gl.canvas.width, gl.canvas.height)
  }, [size])

  // Animation loop
  useRafInterval(() => {
    const start = startRef.current;
    const time = performance.now() - start;
    const mousePos = mousePosRef.current;

    if ((reducedMotion || still) && time > 200) {
      return;
    }

    const gl = glRef.current;
    const shaderProgram = shaderProgramRef.current;
    if (!gl || !shaderProgram) return;

    const iTimeLocation = gl.getUniformLocation(shaderProgram, "iTime");
    const iMouseLocation = gl.getUniformLocation(shaderProgram, "iMouse");

    gl.uniform2f(iMouseLocation, mousePos.x, mousePos.y);
    gl.uniform1f(iTimeLocation, time * 0.001);

    const tintLocation = gl.getUniformLocation(shaderProgram, "uTint");
    const color1Location = gl.getUniformLocation(shaderProgram, "uColor1");
    const color2Location = gl.getUniformLocation(shaderProgram, "uColor2");
    const color3Location = gl.getUniformLocation(shaderProgram, "uColor3");

    gl.uniform3fv(tintLocation, new Float32Array(tint));
    gl.uniform3fv(color1Location, new Float32Array(currentParams.color1));
    gl.uniform3fv(color2Location, new Float32Array(currentParams.color2));
    gl.uniform3fv(color3Location, new Float32Array(currentParams.color3));

    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }, inView ? 1000 / 60 : undefined);

  return (
    <motion.div
      ref={containerRef}
      className="w-full h-full relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, ease: "easeOut" }}
    >
      <canvas
        ref={canvasRef}
        width={size.width}
        height={size.height}
        className="w-full h-full"
      />
      
      {/* Design Controls */}
      {showControls && (
        <GlooControls
          currentParams={currentParams}
          onRegenerate={regenerateParams}
          context={context}
        />
      )}
    </motion.div>
  )
}