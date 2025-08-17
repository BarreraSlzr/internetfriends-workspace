'use client'

import { useEffect, useState } from 'react'
import { AuthProvider, useAuth, usePermissions, withAuth } from '@/lib/auth/go-rich-auth'
import GoRichDataDashboard from '@/components/steady/data-dashboard'
import SteadyDashboard from '@/components/steady/dashboard'
import FriendNetworkDashboard from '@/components/steady/friend-network-dashboard'
import MobileGoRich from '@/components/steady/mobile-go-rich'

// Protected Go.Rich Dashboard with Authentication
// Features unlock based on user role and permissions

function AuthenticatedGoRichPage() {
  const [isMobile, setIsMobile] = useState(false)
  const { user, logout, updatePreferences } = useAuth()
  const permissions = usePermissions()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Mobile interface with authentication
  if (isMobile) {
    return (
      <div className="relative">
        {/* Mobile Auth Header */}
        <div className="absolute top-4 right-4 z-20">
          <UserMenu compact />
        </div>
        <MobileGoRich />
      </div>
    )
  }

  // Desktop dashboard interface
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Header with User Info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-6">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold mb-2">go.rich</h1>
              <p className="text-xl opacity-90">
                Welcome back, {user?.name} • {user?.plan} Plan
              </p>
              <div className="flex items-center space-x-4 mt-2">
                <PlanBadge plan={user?.plan || 'Free'} role={user?.role || 'free'} />
                <PermissionsSummary permissions={permissions} />
              </div>
            </div>
            
            <UserMenu />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8 space-y-12">
        {/* Data Gateway Dashboard */}
        <section id="data-gateway">
          <GoRichDataDashboard 
            title={`Real-time Data Gateway (${permissions.realTimeUpdates ? 'Live' : 'Limited'})`}
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

        {/* Friends Network - Premium Feature */}
        {permissions.canShareData && (
          <section id="friends-network">
            <FriendNetworkDashboard 
              title="Friend-to-Friend Data Sharing"
              className="mb-8"
              autoSync={permissions.realTimeUpdates}
              maxFriends={permissions.maxFriends}
              onDataReceived={(data) => {
                console.log('📡 Data from friend:', data)
              }}
            />
          </section>
        )}

        {/* Upgrade Prompt for Free Users */}
        {permissions.isFree && (
          <section className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Unlock Premium Features</h2>
            <p className="text-lg opacity-90 mb-6">
              Get real-time updates, friend data sharing, unlimited watchlists, and more
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">⚡</div>
                <div className="font-semibold">Real-time Updates</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold">Friend Data Sharing</div>
              </div>
              <div className="bg-white bg-opacity-20 rounded-lg p-4">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold">Advanced Analytics</div>
              </div>
            </div>
            <button className="bg-white text-purple-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100">
              Upgrade to Premium
            </button>
          </section>
        )}

        {/* Features Overview */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <FeatureCard
            icon="📊"
            title="Market Data"
            description={`Live ${permissions.realTimeUpdates ? 'real-time' : 'periodic'} market tickers`}
            enabled={true}
          />
          
          <FeatureCard
            icon="🔗"
            title="URL Shortener"
            description={`Up to ${permissions.isPremium ? '50' : '10'} branded links`}
            enabled={true}
          />
          
          <FeatureCard
            icon="🌐"
            title="Friends Network"
            description="Peer-to-peer data sharing"
            enabled={permissions.canShareData}
          />
        </section>
      </div>
    </div>
  )
}

// User menu component
function UserMenu({ compact = false }: { compact?: boolean }) {
  const { user, logout, updatePreferences } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  
  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className={`flex items-center space-x-3 bg-white bg-opacity-20 rounded-lg p-3 hover:bg-opacity-30 ${
          compact ? 'text-sm' : ''
        }`}
      >
        <div className={`${compact ? 'w-6 h-6' : 'w-8 h-8'} bg-white rounded-full flex items-center justify-center text-blue-600 font-bold`}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        {!compact && (
          <div className="text-left">
            <div className="font-medium">{user.name}</div>
            <div className="text-sm opacity-75">@{user.handle}</div>
          </div>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl border py-2 z-30">
          <div className="px-4 py-3 border-b">
            <div className="font-medium text-gray-900">{user.name}</div>
            <div className="text-sm text-gray-600">{user.email}</div>
            <div className="text-xs text-gray-500 mt-1">{user.plan} Plan</div>
          </div>
          
          <div className="py-2">
            <ThemeSelector />
            <NotificationToggle />
          </div>
          
          <div className="border-t py-2">
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Theme selector component
function ThemeSelector() {
  const { user, updatePreferences } = useAuth()
  
  return (
    <div className="px-4 py-2">
      <div className="text-sm font-medium text-gray-700 mb-2">Theme</div>
      <div className="flex space-x-2">
        {(['system', 'light', 'dark'] as const).map((theme) => (
          <button
            key={theme}
            onClick={() => updatePreferences({ theme })}
            className={`px-3 py-1 rounded text-xs ${
              user?.preferences.theme === theme
                ? 'bg-blue-100 text-blue-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {theme}
          </button>
        ))}
      </div>
    </div>
  )
}

// Notification toggle
function NotificationToggle() {
  const { user, updatePreferences } = useAuth()
  
  return (
    <div className="px-4 py-2">
      <label className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700">Notifications</span>
        <input
          type="checkbox"
          checked={user?.preferences.notifications || false}
          onChange={(e) => updatePreferences({ notifications: e.target.checked })}
          className="rounded"
        />
      </label>
    </div>
  )
}

// Plan badge component
function PlanBadge({ plan, role }: { plan: string; role: string }) {
  const colors = {
    admin: 'bg-red-500',
    premium: 'bg-purple-500',
    free: 'bg-gray-500'
  }
  
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${colors[role as keyof typeof colors]} text-white`}>
      {plan}
    </span>
  )
}

// Permissions summary
function PermissionsSummary({ permissions }: { permissions: any }) {
  return (
    <div className="text-sm opacity-75">
      {permissions.realTimeUpdates && '⚡ Real-time'} 
      {permissions.canShareData && ' 👥 Data Sharing'}
      {permissions.maxWatchlists > 5 && ' 📊 Unlimited Lists'}
    </div>
  )
}

// Feature card component
function FeatureCard({ icon, title, description, enabled }: {
  icon: string
  title: string
  description: string
  enabled: boolean
}) {
  return (
    <div className={`bg-white rounded-lg shadow p-6 text-center ${!enabled ? 'opacity-50' : ''}`}>
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
      {!enabled && (
        <div className="mt-3 text-xs text-orange-600 font-medium">Premium Feature</div>
      )}
    </div>
  )
}

// Main export with authentication wrapper
const ProtectedGoRichPage = withAuth(AuthenticatedGoRichPage)

export default function GoRichPage() {
  return (
    <AuthProvider>
      <ProtectedGoRichPage />
    </AuthProvider>
  )
}