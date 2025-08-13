"use client";

import React, { useRef, useEffect, PropsWithChildren } from "react";
import { motion } from "framer-motion";
import content from "../content.json";

interface HeroTextProps {
  className?: string;
  useGloo?: boolean;
}

const DefaultHero = () => (
  <div className="text-3xl md:text-4xl lg:text-5xl leading-relaxed text-foreground">
    <h1
      className="font-bold font-[family:var(--font-display)] tracking-tight"
      style={{ letterSpacing: "var(--letter-spacing-display, -0.015em)" }}
    >
      {content.hero.title}
    </h1>
    <p className="text-lg mb-6 font-mono text-muted-foreground">
      {content.hero.description}
    </p>
  </div>
);

function SimpleGlooCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const programRef = useRef<WebGLProgram | null>(null);
  const uniformsRef = useRef<{
    time: WebGLUniformLocation | null;
    resolution: WebGLUniformLocation | null;
  }>({ time: null, resolution: null });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl");
    if (!gl) return;

    // Size canvas to container
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);

      // Update resolution uniform
      if (uniformsRef.current.resolution) {
        gl.uniform2f(
          uniformsRef.current.resolution,
          canvas.width,
          canvas.height,
        );
      }
    };

    // Shaders
    const vertexSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fragmentSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = st * 2.0 - 1.0;

        float t = u_time * 0.5;

        // Animated warp
        vec2 warp = vec2(
          sin(p.x * 4.0 + t) * cos(p.y * 3.0 + t * 1.2),
          cos(p.x * 3.0 + t * 0.8) * sin(p.y * 4.0 + t)
        ) * 0.5;

        p += warp;

        // Brand colors mixed
        vec3 blue = vec3(0.23, 0.51, 0.96);
        vec3 purple = vec3(0.58, 0.20, 0.92);
        vec3 pink = vec3(0.93, 0.28, 0.60);

        vec3 color = mix(
          mix(blue, purple, 0.5 + 0.5 * sin(p.x * 2.0 + t)),
          pink,
          0.5 + 0.5 * cos(p.y * 2.0 + p.x + t * 0.7)
        );

        // Fade edges
        float d = length(p);
        color *= 1.0 - smoothstep(0.9, 1.3, d);

        gl_FragColor = vec4(color, 1.0);
      }
    `;

    // Create shader helper
    function createShader(type: number, source: string): WebGLShader | null {
      const shader = gl.createShader(type);
      if (!shader) return null;

      gl.shaderSource(shader, source);
      gl.compileShader(shader);

      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }

      return shader;
    }

    // Create shaders
    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
    if (!vertexShader || !fragmentShader) return;

    // Create program
    const program = gl.createProgram();
    if (!program) return;

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);
    programRef.current = program;

    // Geometry - full screen quad
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    // Get locations
    const posLoc = gl.getAttribLocation(program, "a_position");
    uniformsRef.current.time = gl.getUniformLocation(program, "u_time");
    uniformsRef.current.resolution = gl.getUniformLocation(
      program,
      "u_resolution",
    );

    // Set up vertex attributes
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    // Initial resize and render setup
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation loop
    const startTime = Date.now();
    function render() {
      if (!canvas || !programRef.current) return;

      const currentTime = (Date.now() - startTime) / 1000;

      // Clear and render
      gl.clearColor(0, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);

      // Update uniforms
      if (uniformsRef.current.time) {
        gl.uniform1f(uniformsRef.current.time, currentTime);
      }
      if (uniformsRef.current.resolution) {
        gl.uniform2f(
          uniformsRef.current.resolution,
          canvas.width,
          canvas.height,
        );
      }

      // Draw
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    }

    render();

    // Cleanup
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener("resize", resizeCanvas);
      if (programRef.current) {
        gl.deleteProgram(programRef.current);
        programRef.current = null;
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ background: "transparent" }}
    />
  );
}

export default function HeroText({
  className = "",
  useGloo = false,
}: HeroTextProps) {
  return (
    <div className={`relative ${className}`}>
      {useGloo && (
        <div className="absolute inset-0 w-full h-full" style={{ zIndex: 0 }}>
          <SimpleGlooCanvas />
        </div>
      )}
      <div className="relative" style={{ zIndex: 20 }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <DefaultHero />
        </motion.div>
      </div>
    </div>
  );
}
