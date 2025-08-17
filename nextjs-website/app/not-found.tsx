'use client'

import Link from 'next/link'
import { BgGooRotating } from '@/components/gloo/rotating-gloo'
import { motion } from 'framer-motion'

// Force dynamic rendering to avoid SSR hook issues
export const dynamic = "force-dynamic";

export default function NotFoundPage() {
  // Error page with dramatic Gloo effect
  const errorColors: [number[], number[], number[]] = [
    [0.9, 0.3, 0.3], // Red
    [0.7, 0.2, 0.2], // Dark red
    [0.95, 0.4, 0.2] // Orange-red
  ];

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden">
      {/* Dramatic Gloo Background for Error Context */}
      <div className="absolute inset-0 z-0">
        <BgGooRotating
          speed={0.1}          // Slow, contemplative
          resolution={2.5}     // High detail
          depth={3}            // More layers for complexity
          seed={1.5}           // Unique seed for errors
          color1={errorColors[0]}
          color2={errorColors[1]}
          color3={errorColors[2]}
          colorRotation="static" // No color rotation for errors
          showControls={false}
          context="error"
        />
      </div>

      {/* Error Content */}
      <motion.div 
        className="relative z-10 text-center space-y-8 max-w-2xl mx-auto px-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        {/* Large 404 */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <h1 className="text-9xl md:text-[12rem] font-bold text-white/20 leading-none">
            404
          </h1>
        </motion.div>

        {/* Error Message */}
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Page Not Found
          </h2>
          <p className="text-lg text-white/80 max-w-md mx-auto">
            This page seems to have wandered off into the digital void. 
            Let's get you back to somewhere familiar.
          </p>
        </div>

        {/* Action Buttons */}
        <motion.div 
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <Link 
            href="/"
            className="px-8 py-3 bg-white text-black rounded-lg font-semibold hover:bg-white/90 transition-colors"
          >
            Return Home
          </Link>
          <Link 
            href="/contact"
            className="px-8 py-3 border border-white/30 text-white rounded-lg font-semibold hover:bg-white/10 transition-colors"
          >
            Get Help
          </Link>
        </motion.div>

        {/* Contextual Help */}
        <motion.div 
          className="text-sm text-white/60 max-w-sm mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          If you believe this is an error, please let us know and we'll investigate.
        </motion.div>
      </motion.div>

      {/* Ambient lighting effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20 pointer-events-none z-5" />
    </div>
  )
}
