import { generateStamp, getTimestamp } from "@/lib/utils/timestamp";
import { getWebGLContext } from "@/lib/utils";
("use client");

import React, { PropsWithChildren, useRef, useEffect } from "react";
import { motion } from "motion/react";
import content from "../content.json";

interface HeroTextProps {
  className?: string;
  useGloo?: boolean;
  backgroundStrategy?: string;
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

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = getWebGLContext(canvas);
    if (!gl) return;

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
        p.x *= u_resolution.x / u_resolution.y;
        float t = u_time * 0.3;

        vec2 warp = vec2(
          sin(p.x * 3.0 + t) * cos(p.y * 2.0 + t),
          cos(p.x * 2.5 + t) * sin(p.y * 3.5 + t)
        ) * 0.4;
        p += warp;

        vec3 blue = vec3(0.23, 0.51, 0.96);
        vec3 purple = vec3(0.58, 0.20, 0.92);
        vec3 pink = vec3(0.93, 0.28, 0.60);

        float mixer1 = 0.5 + 0.5 * sin(p.x * 2.0 + t);
        float mixer2 = 0.5 + 0.5 * cos(p.y * 1.8 + t);

        vec3 color1 = mix(blue, purple, mixer1);
        vec3 finalColor = mix(color1, pink, mixer2);

        float dist = length(p);
        float vignette = 1.0 - smoothstep(0.7, 1.4, dist);
        finalColor *= vignette;

        gl_FragColor = vec4(finalColor, 0.8);
      }
    `;

    // Create shader helper
    function createShader(type: number, source: string) {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      return shader;
    }

    const vertexShader = createShader(gl.VERTEX_SHADER, vertexSource);
    const fragmentShader = createShader(gl.FRAGMENT_SHADER, fragmentSource);
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
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const startTime = getTimestamp();
    function render() {
      const time = (getTimestamp() - startTime) / 1000;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      if (timeLoc) gl.uniform1f(timeLoc, time);
      if (resolutionLoc)
        gl.uniform2f(resolutionLoc, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      animationRef.current = requestAnimationFrame(render);
    }
    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />;
}

export default function HeroText({
  className = "",
  useGloo = false,
  backgroundStrategy,
  children,
}: PropsWithChildren<HeroTextProps>) {
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
          {children || <DefaultHero />}
        </motion.div>
      </div>
    </div>
  );
}
