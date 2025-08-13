
"use client";

import { useEffect, useRef, useState } from "react";

import { effectFunctions } from "./gloo-effects-simple";
import { motion } from "framer-motion";

// Simple implementation of useReducedMotion
function useReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mql.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setReducedMotion(e.matches);
    };

    mql.addEventListener("change", handleChange);
    return () => {
      mql.removeEventListener("change", handleChange);
    };
  }, []);

  return reducedMotion;
}

export function BgGooSimple({
  speed = 0.4,
  resolution = 2.0,
  depth = 4,
  seed = 2.4,
  still = false,
  tint = [1.0, 1.0, 1.0],
  color1 = [235 / 255, 231 / 255, 92 / 255],
  color2 = [223 / 255, 72 / 255, 67 / 255],
  color3 = [235 / 255, 64 / 255, 240 / 255],
  parallaxIntensity = 1.0,
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 0, height: 0 });

  const mousePosRef = useRef({ x: 0, y: 0 });
  const startRef = useRef(performance.now());
  const scrollRef = useRef(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);

  const shaderProgramRef = useRef<WebGLProgram | null>(null);
  const reducedMotion = useReducedMotion();

  // Randomly select an effect function
  const [selectedEffect] = useState(() => {
    const randomIndex = Math.floor(Math.random() * effectFunctions.length);
    return effectFunctions[randomIndex];
  });

  const vertexShaderSource = `
    attribute vec2 position;
    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
  `;

  const fragmentShaderSource = `
  precision mediump float;
  uniform vec2 iResolution;
  uniform float iTime;
  uniform vec2 iMouse;
  uniform vec3 uTint;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;
  uniform vec2 uParallax;
  float speed = ${speed.toFixed(2)};

  ${selectedEffect}

  void main() {
    vec2 p = (2.0 * gl_FragCoord.xy - iResolution.xy) / max(iResolution.x, iResolution.y);

    // Parallax offset (mouse + scroll), provided via uParallax
    p += uParallax;

    // Seed-based offset
    p.x += ${seed.toFixed(1)};
    p.y += ${seed.toFixed(1)};

    // Scale and accumulate effect
    p *= ${resolution.toFixed(1)};
    for (int i = 1; i < ${depth}; i++) {
      float fi = float(i);
      p += effect(p, fi, iTime * speed);
    }

    // Color mixing and tinting
    vec3 col = mix(mix(uColor1, uColor2, 1.0 - sin(p.x)), uColor3, cos(p.y + p.x));
    col *= uTint;
    gl_FragColor = vec4(col, 1.0);
  }
`;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const resizeObserver = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      setSize({ width, height });
    });

    resizeObserver.observe(el);

    return () => {
      resizeObserver.unobserve(el);
    };
  }, [containerRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl", { preserveDrawingBuffer: still }) ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);

    if (!gl) {
      console.error(
        "Unable to initialize WebGL. Your browser may not support it.",
      );
      return;
    }

    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    if (!vertexShader) return;
    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.compileShader(vertexShader);

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (!fragmentShader) return;
    gl.shaderSource(fragmentShader, fragmentShaderSource);
    gl.compileShader(fragmentShader);

    const shaderProgram = gl.createProgram();
    if (!shaderProgram) return;

    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);
    gl.useProgram(shaderProgram);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const positions = [
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
    ];
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(shaderProgram, "position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
    glRef.current = gl;
    shaderProgramRef.current = shaderProgram;
  }, [vertexShaderSource, fragmentShaderSource, still]);

  useEffect(() => {
    const gl = glRef.current;
    const shaderProgram = shaderProgramRef.current;
    if (!gl || !shaderProgram) return;
    gl.viewport(0, 0, size.width, size.height);
    const iResolutionLocation = gl.getUniformLocation(
      shaderProgram,
      "iResolution",
    );
    gl.uniform2f(iResolutionLocation, gl.canvas.width, gl.canvas.height);
  }, [size]);

  useEffect(() => {
    const start = startRef.current;
    let rafId: number;

    const loop = () => {
      const time = performance.now() - start;
      const mousePos = mousePosRef.current;

      if ((reducedMotion || still) && time > 200) {
        return;
      }

      const gl = glRef.current;
      const shaderProgram = shaderProgramRef.current;
      if (!gl || !shaderProgram) {
        rafId = requestAnimationFrame(loop);
        return;
      }

      const iTimeLocation = gl.getUniformLocation(shaderProgram, "iTime");
      const iMouseLocation = gl.getUniformLocation(shaderProgram, "iMouse");

      gl.uniform2f(iMouseLocation, mousePos.x, mousePos.y);
      gl.uniform1f(iTimeLocation, time * 0.001);

      // Parallax uniform from mouse + scroll
      const parallaxLocation = gl.getUniformLocation(
        shaderProgram,
        "uParallax",
      );

      const px =
        (mousePos.x / (gl.canvas.width > 0.0 ? gl.canvas.width : 1.0) - 0.5) *
        0.08 *
        parallaxIntensity;
      const py =
        (mousePos.y / (gl.canvas.height > 0.0 ? gl.canvas.height : 1.0) - 0.5) *
          0.06 *
          parallaxIntensity +
        (scrollRef.current / (window.innerHeight || 1)) *
          0.05 *
          parallaxIntensity;
      gl.uniform2f(parallaxLocation, px, py);

      const tintLocation = gl.getUniformLocation(shaderProgram, "uTint");
      const color1Location = gl.getUniformLocation(shaderProgram, "uColor1");
      const color2Location = gl.getUniformLocation(shaderProgram, "uColor2");
      const color3Location = gl.getUniformLocation(shaderProgram, "uColor3");

      gl.uniform3fv(tintLocation, new Float32Array(tint));
      gl.uniform3fv(color1Location, new Float32Array(color1));
      gl.uniform3fv(color2Location, new Float32Array(color2));
      gl.uniform3fv(color3Location, new Float32Array(color3));

      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);

    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current = { x: e.clientX, y: e.clientY };
    };
    const handleScroll = () => {
      scrollRef.current = window.scrollY || window.pageYOffset || 0;
    };
    // Initialize once to current scroll position
    handleScroll();

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [reducedMotion, still, tint, color1, color2, color3, parallaxIntensity]);

  return (
    <motion.div
      ref={containerRef}
      className="w-full h-full"
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
    </motion.div>
  );
}
