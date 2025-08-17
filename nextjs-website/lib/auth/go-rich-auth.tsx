// Go.Rich Authentication Service
// Secure auth integration for private dashboards

'use client'

import { useState, useEffect, createContext, useContext } from 'react'

export interface GoRichUser {
  id: string
  email: string
  name: string
  handle: string
  role: 'admin' | 'premium' | 'free'
  plan: string
  avatar?: string
  preferences: {
    theme: 'light' | 'dark' | 'system'
    notifications: boolean
    shareLevel: 'private' | 'friends' | 'public'
    defaultWatchlist?: string
  }
  permissions: {
    canCreateWatchlists: boolean
    canShareData: boolean
    canAddFriends: boolean
    maxWatchlists: number
    maxFriends: number
    realTimeUpdates: boolean
  }
}

export interface AuthState {
  user: GoRichUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthContextType extends AuthState {
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => Promise<void>
  updatePreferences: (preferences: Partial<GoRichUser['preferences']>) => Promise<void>
  refreshUser: () => Promise<void>
}

interface LoginCredentials {
  email?: string
  token?: string
  provider?: 'email' | 'magic-link' | 'demo'
}

const AuthContext = createContext<AuthContextType | null>(null)

// Permission mappings based on user role
const getRolePermissions = (role: GoRichUser['role']) => {
  switch (role) {
    case 'admin':
      return {
        canCreateWatchlists: true,
        canShareData: true,
        canAddFriends: true,
        maxWatchlists: -1, // unlimited
        maxFriends: -1,
        realTimeUpdates: true
      }
    case 'premium':
      return {
        canCreateWatchlists: true,
        canShareData: true,
        canAddFriends: true,
        maxWatchlists: 10,
        maxFriends: 50,
        realTimeUpdates: true
      }
    case 'free':
      return {
        canCreateWatchlists: true,
        canShareData: false,
        canAddFriends: true,
        maxWatchlists: 3,
        maxFriends: 10,
        realTimeUpdates: false
      }
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    initializeAuth()
  }, [])

  const initializeAuth = async () => {
    try {
      // Check for existing session
      const response = await fetch('/api/auth/session')
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.isAuthenticated && data.user) {
          const goRichUser = mapToGoRichUser(data.user)
          setAuthState({
            user: goRichUser,
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          return
        }
      }
      
      // No valid session, check localStorage for demo user
      const demoUser = localStorage.getItem('go_rich_demo_user')
      if (demoUser) {
        try {
          const user = JSON.parse(demoUser)
          setAuthState({
            user: mapToGoRichUser(user),
            isAuthenticated: true,
            isLoading: false,
            error: null
          })
          return
        } catch (error) {
          localStorage.removeItem('go_rich_demo_user')
        }
      }
      
      // No authentication
      setAuthState(prev => ({ ...prev, isLoading: false }))
      
    } catch (error) {
      console.error('Auth initialization failed:', error)
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Authentication failed'
      })
    }
  }

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }))
      
      if (credentials.provider === 'demo') {
        // Demo login for development
        const demoUser = {
          id: 'demo-user',
          email: 'demo@go.rich',
          name: 'Demo User',
          handle: 'demo',
          role: 'premium' as const,
          plan: 'Pro Demo'
        }
        
        const goRichUser = mapToGoRichUser(demoUser)
        localStorage.setItem('go_rich_demo_user', JSON.stringify(demoUser))
        
        setAuthState({
          user: goRichUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
        
        return true
      }
      
      // Magic link or email login
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      })
      
      if (response.ok) {
        const data = await response.json()
        const goRichUser = mapToGoRichUser(data.user)
        
        setAuthState({
          user: goRichUser,
          isAuthenticated: true,
          isLoading: false,
          error: null
        })
        
        return true
      } else {
        const error = await response.json()
        setAuthState(prev => ({
          ...prev,
          isLoading: false,
          error: error.message || 'Login failed'
        }))
        return false
      }
      
    } catch (error) {
      console.error('Login failed:', error)
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: 'Login failed'
      }))
      return false
    }
  }

  const logout = async () => {
    try {
      // Call logout API if it exists
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch (error) {
      console.error('Logout API failed:', error)
    }
    
    // Clear local storage
    localStorage.removeItem('go_rich_demo_user')
    localStorage.removeItem('go_rich_preferences')
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null
    })
  }

  const updatePreferences = async (newPreferences: Partial<GoRichUser['preferences']>) => {
    if (!authState.user) return
    
    const updatedUser = {
      ...authState.user,
      preferences: { ...authState.user.preferences, ...newPreferences }
    }
    
    setAuthState(prev => ({ ...prev, user: updatedUser }))
    
    // Save to localStorage for persistence
    localStorage.setItem('go_rich_preferences', JSON.stringify(updatedUser.preferences))
    
    // TODO: Save to backend if user is not demo
    if (authState.user.id !== 'demo-user') {
      try {
        await fetch('/api/auth/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newPreferences)
        })
      } catch (error) {
        console.error('Failed to save preferences:', error)
      }
    }
  }

  const refreshUser = async () => {
    await initializeAuth()
  }

  const mapToGoRichUser = (userData: any): GoRichUser => {
    const role = userData.role || 'free'
    const permissions = getRolePermissions(role)
    
    // Load preferences from localStorage if available
    let preferences = {
      theme: 'system' as const,
      notifications: true,
      shareLevel: 'friends' as const,
      defaultWatchlist: undefined
    }
    
    try {
      const savedPrefs = localStorage.getItem('go_rich_preferences')
      if (savedPrefs) {
        preferences = { ...preferences, ...JSON.parse(savedPrefs) }
      }
    } catch (error) {
      console.error('Failed to load preferences:', error)
    }
    
    return {
      id: userData.id,
      email: userData.email,
      name: userData.name,
      handle: userData.handle,
      role,
      plan: userData.plan || 'Free',
      avatar: userData.avatar,
      preferences,
      permissions
    }
  }

  const contextValue: AuthContextType = {
    ...authState,
    login,
    logout,
    updatePreferences,
    refreshUser
  }

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Hook for checking specific permissions
export function usePermissions() {
  const { user } = useAuth()
  
  return {
    canCreateWatchlists: user?.permissions.canCreateWatchlists || false,
    canShareData: user?.permissions.canShareData || false,
    canAddFriends: user?.permissions.canAddFriends || false,
    maxWatchlists: user?.permissions.maxWatchlists || 1,
    maxFriends: user?.permissions.maxFriends || 5,
    realTimeUpdates: user?.permissions.realTimeUpdates || false,
    isAdmin: user?.role === 'admin',
    isPremium: user?.role === 'premium' || user?.role === 'admin',
    isFree: user?.role === 'free'
  }
}

// Utility for protected routes
export function withAuth<T extends {}>(Component: React.ComponentType<T>) {
  return function AuthenticatedComponent(props: T) {
    const { isAuthenticated, isLoading } = useAuth()
    
    if (isLoading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <div className="text-gray-600">Loading...</div>
          </div>
        </div>
      )
    }
    
    if (!isAuthenticated) {
      return <GoRichLoginPage />
    }
    
    return <Component {...props} />
  }
}

// Simple login page component
function GoRichLoginPage() {
  const { login, isLoading, error } = useAuth()
  const [email, setEmail] = useState('')
  
  const handleDemoLogin = () => {
    login({ provider: 'demo' })
  }
  
  const handleEmailLogin = () => {
    if (email) {
      login({ email, provider: 'magic-link' })
    }
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">go.rich</h1>
          <p className="text-gray-600 mt-2">Your Personal Data Gateway</p>
        </div>
        
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@email.com"
            />
          </div>
          
          <button
            onClick={handleEmailLogin}
            disabled={isLoading || !email}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? 'Sending...' : 'Send Magic Link'}
          </button>
          
          <div className="text-center text-gray-500">or</div>
          
          <button
            onClick={handleDemoLogin}
            disabled={isLoading}
            className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Demo Access
          </button>
        </div>
        
        <div className="mt-6 text-xs text-gray-500 text-center">
          Demo access provides full premium features for testing
        </div>
      </div>
    </div>
  )
}