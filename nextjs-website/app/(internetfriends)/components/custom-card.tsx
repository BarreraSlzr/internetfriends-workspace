"use client";

import { cn } from "@/lib/utils";
import { CardDescriptionToggle } from "./card-description-toggle";
import { GridBackground } from "./grid-background";
import { BgGooRotating } from '@/components/gloo/rotating-gloo';
import { getRandomColors } from '@/components/gloo/production-palette';
import { COLOR_ROTATION_PRESETS } from '@/components/gloo/color-rotation';
import { useMemo } from 'react';

interface CustomCardProps {
  subtitle: string;
  title: string;
  description?: string;
  className?: string;
  gridSize?: number;
  showGrid?: boolean;
  children?: React.ReactNode;
  cta?: React.ReactNode;
  useGloo?: boolean;
  glooIntensity?: number;
  colorRotation?: keyof typeof COLOR_ROTATION_PRESETS;
}

export function CustomCard({
  subtitle,
  title,
  description,
  className,
  gridSize = 20,
  showGrid = true,
  children,
  cta,
  useGloo = false,
  colorRotation = 'subtle',
}: CustomCardProps) {
  // Random Gloo parameters for variety across cards
  const randomColors = useMemo(() => getRandomColors(), []);
  const randomSeed = useMemo(() => Math.random() * 3, []);

  // Determine if this card needs high contrast text
  const needsHighContrast = useGloo || className?.includes('gradient');

  return (
    <div
      className={cn(
        "octopus-card relative overflow-hidden transition-all duration-300 border-secondary glass-layer-1",
        className,
      )}
      data-active="false"
    >
      {/* Production Gloo WebGL Background with Color Rotation - VERY SUBTLE ACCENT */}
      {useGloo && (
        <div 
          className="absolute inset-0 pointer-events-none"
          style={{ opacity: 0.5 }} // Visible accent effect
        >
          <BgGooRotating
            speed={0.15}
            resolution={1.2}
            depth={1}
            seed={randomSeed}
            color1={randomColors[0]}
            color2={randomColors[1]}
            color3={randomColors[2]}
            colorRotation={colorRotation}
            context="card"
          />
        </div>
      )}
      
      {/* Grid Background (layered over Gloo if both enabled) */}
      {showGrid && <GridBackground size={gridSize} />}
      
      <div className="space-y-2 sm:space-y-4 relative z-10">
        <p className={cn(
          "text-sm font-medium text-muted-foreground",
          needsHighContrast ? "text-white font-semibold" : "text-inherit",
          needsHighContrast && { textShadow: '0 1px 2px rgba(0,0,0,0.8)' }
        )}>
          {subtitle}
        </p>
        <h2 className={cn(
          "text-3xl font-bold leading-tight",
          needsHighContrast ? "text-white font-extrabold" : "text-inherit",
          needsHighContrast && { textShadow: '0 2px 4px rgba(0,0,0,0.8), 0 4px 8px rgba(0,0,0,0.6)' }
        )}>
          {title}
        </h2>
        {description && <CardDescriptionToggle description={description} />}
        {children}
        {cta && <div className="mt-6">{cta}</div>}
      </div>
    </div>
  );
}

