'use client'

import Image from 'next/image'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/hooks/use-theme'
import { useEffect, useState } from 'react'

export default function HeaderSimple() {
  const { isDark, toggleTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrolled = window.scrollY >= 16 // 1rem = 16px
      setIsScrolled(scrolled)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header 
      className={`sticky z-50 transition-all duration-300 ${
        isScrolled 
          ? `top-4 mx-4 lg:mx-3 md:mx-2 shadow-sm ${
              isDark 
                ? 'bg-background/95 border-border/40 glass-header' 
                : 'bg-background/98 border-border/25 glass-header'
            }`
          : `top-0 border-b ${
              isDark 
                ? 'bg-background/85 border-border/25 glass-header' 
                : 'bg-background/90 border-border/15 glass-header'
            }`
      } backdrop-blur-sm`}
      data-scrolled={isScrolled}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <div className="flex items-center gap-3">
            {/* Logo - Production approach with fallback */}
            <div className="w-8 h-8 bg-if-primary rounded-sm flex items-center justify-center">
              <span className="text-white font-bold text-sm">IF</span>
            </div>
            <div className={`text-xl font-semibold transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              InternetFriends
            </div>
          </div>
          
          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isDark 
                ? 'hover:bg-gray-700/50 text-gray-300 hover:text-white' 
                : 'hover:bg-gray-100/50 text-gray-600 hover:text-gray-900'
            }`}
            title="Toggle theme"
          >
            {isDark ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}