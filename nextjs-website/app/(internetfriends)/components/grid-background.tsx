interface GridBackgroundProps {
  size?: number;
  opacity?: number;
  className?: string;
}

export function GridBackground({ 
  size = 20, 
  opacity = 0.3, 
  className = "" 
}: GridBackgroundProps) {
  return (
    <div 
      className={`absolute inset-0 ${className}`}
      style={{
        backgroundImage: `
          linear-gradient(rgba(0,0,0,${opacity}) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0,0,0,${opacity}) 1px, transparent 1px)
        `,
        backgroundSize: `${size}px ${size}px`
      }}
    />
  );
}