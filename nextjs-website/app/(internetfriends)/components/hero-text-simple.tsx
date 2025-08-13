"use client";

import { generateStamp } from "@/lib/utils/timestamp";
import { getWebGLContext } from "@/lib/utils";

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

// Direct WebGL that actually works - no abstractions
function SimpleGlooCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = getWebGLContext(canvas);
    if (!gl) return;

    // Vertex shader (fullscreen quad)
    const vertexShaderSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    // Fragment shader with animated effect
    const fragmentShaderSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform float u_time;

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = st * 2.0 - 1.0;

        float t = u_time * 0.35;

        // Simple flowing effect
        vec2 warp = vec2(
          sin(p.x * 3.0 + t) * cos(p.y * 2.0 + t * 1.3),
          cos(p.x * 2.5 + t * 0.8) * sin(p.y * 3.5 + t)
        ) * 0.4;

        p += warp;

        // Brand colors
        vec3 color1 = vec3(0.23, 0.51, 0.96); // #3b82f6 blue
        vec3 color2 = vec3(0.58, 0.20, 0.92); // #9333ea purple
        vec3 color3 = vec3(0.93, 0.28, 0.60); // #ec4899 pink

        vec3 color = mix(
          mix(color1, color2, 0.5 + 0.5 * sin(p.x * 2.0 + t)),
          color3,
          0.5 + 0.5 * cos(p.y * 2.0 + p.x + t * 0.7)
        );

        // Vignette
        float d = length(p);
        color *= 1.0 - smoothstep(0.8, 1.2, d);

        gl_FragColor = vec4(color, 0.95);
      }
    `;

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

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl.FRAGMENT_SHADER,
      fragmentShaderSource,
    );
    if (!vertexShader || !fragmentShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.useProgram(program);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]),
      gl.STATIC_DRAW,
    );

    const posLoc = gl.getAttribLocation(program, "a_position");
    const timeLoc = gl.getUniformLocation(program, "u_time");
    const resolutionLoc = gl.getUniformLocation(program, "u_resolution");

    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const startTime = Date.now();
    function render() {
      const time = (Date.now() - startTime) / 1000;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (timeLoc) gl.uniform1f(timeLoc, time);
      if (resolutionLoc)
        gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      rafRef.current = requestAnimationFrame(render);
    }
    render();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function HeroTextSimple({
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
