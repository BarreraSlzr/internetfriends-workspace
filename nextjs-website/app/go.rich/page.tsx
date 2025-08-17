'use client'

import { useEffect, useState } from 'react'
import { AuthProvider, useAuth, usePermissions } from '@/lib/auth/go-rich-auth'
import GoRichDataDashboard from '@/components/steady/data-dashboard'
import SteadyDashboard from '@/components/steady/dashboard'
import FriendNetworkDashboard from '@/components/steady/friend-network-dashboard'
import WebRTCFriendDashboard from '@/components/steady/webrtc-friend-dashboard'
import MobileGoRich from '@/components/steady/mobile-go-rich'

// Go.Rich - The Complete Data Gateway for Friends Network
// Authentication + WebRTC P2P + Mobile PWA + Real-time Data
// PWA Manifest: /go.rich-manifest.json

// Add PWA install handler
function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [isInstallable, setIsInstallable] = useState(false)

  useEffect(() => {
    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const installPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      console.log('PWA install outcome:', outcome)
      setDeferredPrompt(null)
      setIsInstallable(false)
    }
  }

  return { isInstallable, installPWA }
}

function GoRichContent() {
  const [isMobile, setIsMobile] = useState(false)
  const { user, isAuthenticated, logout } = useAuth()
  const permissions = usePermissions()
  const { isInstallable, installPWA } = usePWAInstall()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Public demo page for unauthenticated users
  if (!isAuthenticated) {
    return <PublicGoRichPage />
  }

  // Mobile authenticated interface
  if (isMobile) {
    return (
      <div className="relative">
        <div className="absolute top-4 right-4 z-20">
          <button
            onClick={logout}
            className="bg-white bg-opacity-20 backdrop-blur text-white p-2 rounded-lg"
          >
            👤
          </button>
        </div>
        <MobileGoRich />
      </div>
    )
  }

  // Desktop authenticated dashboard
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-8">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">go.rich</h1>
              <p className="text-xl opacity-90 mb-2">
                Welcome back, {user?.name} • {user?.plan} Plan
              </p>
              <div className="flex items-center space-x-4">
                <span className={`px-3 py-1 rounded-full text-sm ${
                  user?.role === 'admin' ? 'bg-red-500' :
                  user?.role === 'premium' ? 'bg-purple-500' : 'bg-gray-500'
                }`}>
                  {user?.plan}
                </span>
                {permissions.realTimeUpdates && <span className="text-sm">⚡ Real-time</span>}
                {permissions.canShareData && <span className="text-sm">👥 Data Sharing</span>}
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="font-medium">{user?.name}</div>
                <div className="text-sm opacity-75">@{user?.handle}</div>
              </div>
              {isInstallable && (
                <button
                  onClick={installPWA}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                >
                  📱 Install App
                </button>
              )}
              <button
                onClick={logout}
                className="bg-white bg-opacity-20 px-4 py-2 rounded-lg hover:bg-opacity-30"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* Data Gateway Dashboard */}
        <section id="data-gateway">
          <GoRichDataDashboard 
            title={`Real-time Data Gateway ${permissions.realTimeUpdates ? '(Live)' : '(Limited)'}`}
            className="mb-8"
            autoRefresh={permissions.realTimeUpdates}
            showTickers={true}
            showAnalytics={permissions.isPremium}
            maxItems={permissions.isPremium ? 20 : 10}
          />
        </section>

        {/* URL Shortener */}
        <section id="url-shortener">
          <SteadyDashboard 
            domain="go.rich"
            title="URL Shortener"
            className="mb-8"
            showStats={true}
            showCreate={true}
            maxLinks={permissions.isPremium ? 50 : 10}
            onLinkCreate={(link) => {
              console.log('🔗 New go.rich link:', link)
            }}
          />
        </section>

        {/* Friends Network - Premium Features */}
        {permissions.canShareData ? (
          <>
            <section id="friends-network">
              <FriendNetworkDashboard 
                title="Friend Network (Server-based)"
                className="mb-8"
                autoSync={permissions.realTimeUpdates}
                maxFriends={permissions.maxFriends}
                onDataReceived={(data) => {
                  console.log('📡 Data from friend:', data)
                }}
              />
            </section>

            <section id="webrtc-friends">
              <WebRTCFriendDashboard 
                title="P2P Friends (Direct Connection)"
                className="mb-8"
                maxConnections={permissions.maxFriends}
                onDataReceived={(data) => {
                  console.log('🔗 P2P data from friend:', data)
                }}
              />
            </section>
          </>
        ) : (
          <section className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">🚀 Unlock Friend Data Sharing</h2>
            <p className="text-lg opacity-90 mb-6">
              Connect with friends, share market data, and build your network with WebRTC P2P connections
            </p>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Upgrade to Premium
            </button>
          </section>
        )}
      </div>
    </div>
  )
}

// Public demo page for unauthenticated users
function PublicGoRichPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="max-w-6xl mx-auto px-6">
          <h1 className="text-4xl font-bold mb-4">go.rich</h1>
          <p className="text-xl opacity-90 mb-6">
            Data Gateway for Friends Network • Market Tickers • URL Shortener • P2P Sharing
          </p>
          <div className="flex space-x-4">
            <button 
              onClick={() => window.location.reload()}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100"
            >
              Try Demo
            </button>
            <a 
              href="#features" 
              className="border border-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        <section id="features" className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-4">📊</div>
            <h3 className="text-lg font-semibold mb-2">Real-time Market Data</h3>
            <p className="text-gray-600">Live crypto & stock tickers with notifications</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-4">🔗</div>
            <h3 className="text-lg font-semibold mb-2">URL Shortener</h3>
            <p className="text-gray-600">Branded go.rich links with analytics</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="text-3xl mb-4">🌐</div>
            <h3 className="text-lg font-semibold mb-2">P2P Friend Network</h3>
            <p className="text-gray-600">Direct WebRTC data sharing</p>
          </div>
        </section>

        <section className="bg-white rounded-lg shadow p-8">
          <h2 className="text-2xl font-bold mb-6">🎯 New Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-green-600">✅ Authentication System</h3>
              <ul className="space-y-2 text-sm">
                <li>• Role-based permissions (Free, Premium, Admin)</li>
                <li>• Secure user sessions</li>
                <li>• Personalized dashboards</li>
                <li>• Demo access available</li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-blue-600">🔗 WebRTC P2P Connections</h3>
              <ul className="space-y-2 text-sm">
                <li>• Direct peer-to-peer data sharing</li>
                <li>• Real-time market data broadcasting</li>
                <li>• No server dependencies</li>
                <li>• Secure encrypted connections</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default function GoRichPage() {
  return (
    <AuthProvider>
      <GoRichContent />
    </AuthProvider>
  )
}