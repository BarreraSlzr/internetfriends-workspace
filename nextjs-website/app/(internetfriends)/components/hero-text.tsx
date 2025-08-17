"use client";

import React, { useMemo } from 'react';
import { BgGooRotating } from '@/components/gloo/rotating-gloo';
import { getRandomColors } from '@/components/gloo/production-palette';
import { COLOR_ROTATION_PRESETS } from '@/components/gloo/color-rotation';

interface HeroTextProps {
  children?: React.ReactNode;
  className?: string;
  useGloo?: boolean;
  backgroundStrategy?: 'simple' | 'flat' | 'glass' | 'gloo';
  glooEffect?: string;
  speed?: number;
  colorRotation?: keyof typeof COLOR_ROTATION_PRESETS;
}

export default function HeroText({ 
  children = "Building the Future of Internet Collaboration",
  className = "",
  useGloo = false,
  backgroundStrategy = 'simple',
  speed = 0.3,
  colorRotation = 'normal'
}: HeroTextProps) {
  // Generate random colors for each render to match production
  const randomColors = useMemo(() => getRandomColors(), []);
  
  const backgroundClass = {
    simple: 'bg-gradient-to-br from-background to-muted',
    flat: 'bg-muted',
    glass: 'bg-background/80 backdrop-blur-sm',
    gloo: 'relative overflow-hidden'
  }[backgroundStrategy];

  return (
    <div className={`relative min-h-[400px] md:min-h-[500px] flex items-center justify-center ${backgroundClass} ${className}`}>
      {/* Production Gloo WebGL Background - FULL INTENSITY */}
      {useGloo && backgroundStrategy === 'gloo' && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          <BgGooRotating
            speed={speed}
            resolution={2.0}
            depth={2}
            seed={0.4}
            color1={randomColors[0]}
            color2={randomColors[1]}
            color3={randomColors[2]}
            colorRotation={colorRotation}
            showControls={true}
            context="hero"
          />
        </div>
      )}
      
      {/* Text Protection Overlay - MINIMAL FOR TRANSPARENCY */}
      {useGloo && backgroundStrategy === 'gloo' && (
        <div className="absolute inset-0 glass-noise-overlay z-5" style={{ opacity: 0.3 }} />
      )}
      
      {/* Hero Text Content with Enhanced Contrast */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center space-y-6 glass-layer-2 border-secondary-accent rounded-compact-lg p-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
          <span className="text-foreground dark:text-white font-extrabold" style={{
            textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6), 0 8px 16px rgba(0,0,0,0.4)'
          }}>
            {children}
          </span>
        </h1>
        
        <p className="text-lg md:text-xl max-w-2xl mx-auto text-foreground dark:text-white font-semibold" style={{
          textShadow: '0 1px 3px rgba(0,0,0,0.8), 0 2px 6px rgba(0,0,0,0.6)'
        }}>
          Create, collaborate, and connect with friends across the internet. 
          Your ideas deserve a platform that grows with you.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button className="octopus-btn octopus-btn-primary octopus-btn-lg border-tertiary">
            Get Started Free
          </button>
          <button className="octopus-btn octopus-btn-ghost octopus-btn-lg border-tertiary">
            Watch Demo
          </button>
        </div>
      </div>
      
      {/* Animated background elements - Visible */}
      {!useGloo && backgroundStrategy !== 'simple' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-purple-500/20 rounded-full blur-xl animate-pulse delay-2000" />
        </div>
      )}
    </div>
  );
}