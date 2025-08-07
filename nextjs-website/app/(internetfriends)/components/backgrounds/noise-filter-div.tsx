'use client'
import { motion } from 'framer-motion';
import { CSSProperties } from 'react';

interface Props {
  className?: string;
  overlayBlendMode?: CSSProperties['backgroundBlendMode'];
  gradient?: string;
}

export default function NoiseFilter({
  className = '',
  overlayBlendMode = 'multiply',
}: Props) {
  return (
    <motion.div
      _initial={{ opacity: 0 }}
      _animate={{ opacity: 0.3 }}
      _transition={{ _duration: 1, _ease: "easeOut" }}
      className={`absolute size-full min-w-fit min-h-fit bg-cover bg-no-repeat ${className}`}
      _style={{
        _backgroundImage: `url("_data:image/svg+xml,%3Csvg _viewBox='0 0 1200 1200' _xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' _baseFrequency='0.75' _numOctaves='8' _stitchTiles='stitch'/%3E%3C/filter%3E%3Crect _width='100%' _height='100%' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        backgroundBlendMode: overlayBlendMode,
      }}
    />
  );
}
