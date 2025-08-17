import React from "react";

export interface DarkVignetteProps {
  intensity?: number;
  className?: string;
  children?: React.ReactNode;
}

export const DarkVignette: React.FC<DarkVignetteProps> = ({
  intensity = 0.3,
  className = "",
  children
}) => {
  const vignetteStyle = {
    position: "relative" as const,
    overflow: "hidden" as const,
  };

  const overlayStyle = {
    position: "absolute" as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `radial-gradient(circle at center, transparent 0%, rgba(0, 0, 0, ${intensity}) 100%)`,
    pointerEvents: "none" as const,
    zIndex: 1,
  };

  return (
    <div style={vignetteStyle} className={className}>
      {children}
      <div style={overlayStyle} />
    </div>
  );
};

export default DarkVignette;