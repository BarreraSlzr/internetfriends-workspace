'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { PermixProvider } from 'permix/react'
import { permix, setupUserPermissions, type User } from '@/lib/permissions/schema'

// User context for session management
interface UserContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  refetch: () => Promise<void>
}

const UserContext = createContext<UserContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  refetch: async () => {},
})

export const useUser = () => useContext(UserContext)

// Combined Auth + Permissions Provider
export function InternetFriendsPermissionsProvider({ 
  children 
}: { 
  children: React.ReactNode 
}) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchUser = async () => {
    try {
      const response = await fetch('/api/auth/session')
      if (response.ok) {
        const data = await response.json()
        if (data.isAuthenticated && data.user) {
          const userData: User = {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role,
            plan: data.user.plan,
            isActive: true,
          }
          setUser(userData)
          // Setup Permix permissions based on user role
          setupUserPermissions(userData)
        } else {
          setUser(null)
          setupUserPermissions(null) // Anonymous user permissions
        }
      } else {
        setUser(null)
        setupUserPermissions(null)
      }
    } catch (error) {
      console.error('Failed to fetch user session:', error)
      setUser(null)
      setupUserPermissions(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchUser()
  }, [])

  const userContextValue: UserContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    refetch: fetchUser,
  }

  return (
    <UserContext.Provider value={userContextValue}>
      <PermixProvider permix={permix}>
        {children}
      </PermixProvider>
    </UserContext.Provider>
  )
}