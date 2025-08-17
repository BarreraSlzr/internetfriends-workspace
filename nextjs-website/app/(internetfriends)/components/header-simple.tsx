'use client'

import Image from 'next/image'
import { useTheme } from '@/hooks/use-theme'

export default function HeaderSimple() {
  const { isDark } = useTheme()

  return (
    <header className={`border-b transition-colors duration-200 ${
      isDark 
        ? 'glass-layer-1 border-gray-700/50' 
        : 'glass-layer-1 border-gray-200/50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-6">
          <div className="flex items-center gap-3">
            <Image
              src="/globe.svg"
              alt="InternetFriends"
              width={32}
              height={32}
              className={`transition-colors duration-200 ${
                isDark ? 'brightness-0 invert' : ''
              }`}
            />
            <div className={`text-xl font-bold transition-colors duration-200 ${
              isDark ? 'text-white' : 'text-gray-900'
            }`}>
              InternetFriends
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}