/**
 * Hero Gloo - Content Enhancement Version
 * Refactored for sophisticated engineering interface
 * Focus: Subtle background enhancement vs decorative effects
 */

"use client";

import { useEffect, useRef, useState } from "react";

interface HeroGlooProps {
  children: React.ReactNode;
  variant?: "subtle" | "reading" | "form" | "marketing";
  className?: string;
}

/**
 * Sophisticated background animation for content enhancement
 * Used strategically for:
 * - Long form reading (subtle motion to maintain engagement)
 * - Form sections (progressive visual feedback)
 * - Marketing content (ambient interest without distraction)
 * - Loading states (elegant transitions)
 */
export function HeroGloo({
  children,
  variant = "subtle",
  className = "",
}: HeroGlooProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Resize canvas to container
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      canvas.style.width = rect.width + "px";
      canvas.style.height = rect.height + "px";
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Animation parameters based on variant
    const config = getVariantConfig(variant);
    let time = 0;

    const animate = () => {
      if (!canvas || !ctx) return;

      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Clear canvas
      ctx.clearRect(0, 0, width, height);

      // Only animate if component is visible
      if (isVisible) {
        time += config.speed;

        // Create subtle gradient animation
        const gradient = ctx.createRadialGradient(
          width * 0.5 + Math.cos(time) * config.amplitude,
          height * 0.5 + Math.sin(time * 0.7) * config.amplitude,
          0,
          width * 0.5,
          height * 0.5,
          Math.max(width, height) * 0.6,
        );

        gradient.addColorStop(0, config.colors.center);
        gradient.addColorStop(0.5, config.colors.mid);
        gradient.addColorStop(1, config.colors.edge);

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);

        // Add subtle noise for texture (very minimal)
        if (config.noise > 0) {
          ctx.globalCompositeOperation = "overlay";
          ctx.fillStyle = `rgba(255, 255, 255, ${config.noise})`;
          for (let i = 0; i < width; i += 4) {
            for (let j = 0; j < height; j += 4) {
              if (Math.random() > 0.5) {
                ctx.fillRect(i, j, 1, 1);
              }
            }
          }
          ctx.globalCompositeOperation = "source-over";
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    // Intersection observer to only animate when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 },
    );

    observer.observe(canvas);
    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      observer.disconnect();
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [variant, isVisible]);

  return (
    <div className={`relative ${className}`}>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        style={{
          mixBlendMode: "multiply",
          filter: "blur(40px)",
        }}
      />
      <div className="relative z-10">{children}</div>
    </div>
  );
}

/**
 * Configuration for different content enhancement scenarios
 */
function getVariantConfig(variant: string) {
  const configs = {
    subtle: {
      speed: 0.005,
      amplitude: 20,
      noise: 0.02,
      colors: {
        center: "rgba(59, 130, 246, 0.15)",
        mid: "rgba(59, 130, 246, 0.05)",
        edge: "rgba(59, 130, 246, 0)",
      },
    },
    reading: {
      speed: 0.003,
      amplitude: 30,
      noise: 0.01,
      colors: {
        center: "rgba(59, 130, 246, 0.08)",
        mid: "rgba(59, 130, 246, 0.03)",
        edge: "rgba(59, 130, 246, 0)",
      },
    },
    form: {
      speed: 0.008,
      amplitude: 15,
      noise: 0.03,
      colors: {
        center: "rgba(59, 130, 246, 0.12)",
        mid: "rgba(59, 130, 246, 0.06)",
        edge: "rgba(59, 130, 246, 0)",
      },
    },
    marketing: {
      speed: 0.01,
      amplitude: 40,
      noise: 0.04,
      colors: {
        center: "rgba(59, 130, 246, 0.20)",
        mid: "rgba(59, 130, 246, 0.08)",
        edge: "rgba(59, 130, 246, 0)",
      },
    },
  };

  return configs[variant as keyof typeof configs] || configs.subtle;
}

/**
 * Preset components for common content enhancement scenarios
 */
export function ReadingEnhancer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <HeroGloo variant="reading" className={className}>
      {children}
    </HeroGloo>
  );
}

export function FormEnhancer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <HeroGloo variant="form" className={className}>
      {children}
    </HeroGloo>
  );
}

export function MarketingEnhancer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <HeroGloo variant="marketing" className={className}>
      {children}
    </HeroGloo>
  );
}
