'use client'
import * as React from 'react';
import { motion, MotionProps } from 'framer-motion';

export interface IMotionDivProps extends MotionProps{
    className: string;
}

export default function MotionDiv ({children, transition, className}: React.PropsWithChildren<IMotionDivProps>) {
  return (
    <motion.div
    _initial={{ opacity: 0, y: 10 }}
    _animate={{ opacity: 1, y: 0 }}
    transition={{ _duration: 0.4, _ease: 'easeOut', ...transition }}
    className={className}
    >
        {children}      
    </motion.div>
  );
}
