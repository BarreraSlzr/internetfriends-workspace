'use client'

import React from 'react'
import { createComponents, usePermix } from 'permix/react'
import { permix } from '@/lib/permissions/schema'
import { useUser } from '@/lib/permissions/provider'

// Create Permix components
export const { Check } = createComponents(permix)

// Wrapper components for common permission checks

export function PremiumContent({ 
  children, 
  fallback,
  contentData 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
  contentData?: { id: string; title: string; type: 'premium-content'; tier: 'premium'; authorId: string }
}) {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded-lg"></div>
  }

  const mockContent = contentData || {
    id: 'premium-feature',
    title: 'Premium Content',
    type: 'premium-content' as const,
    tier: 'premium' as const,
    authorId: 'system',
  }

  return (
    <Check
      entity="content"
      action="view"
      data={mockContent}
      otherwise={fallback || (
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <div className="text-gray-600 mb-2">🔒 Premium Content</div>
          <p className="text-sm text-gray-500">
            {!user ? 'Sign in to access premium features' : 'Upgrade to Premium to view this content'}
          </p>
        </div>
      )}
    >
      {children}
    </Check>
  )
}

export function AdminOnly({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode
}) {
  return (
    <Check
      entity="system"
      action="admin-panel"
      otherwise={fallback || (
        <div className="border-2 border-dashed border-red-300 rounded-lg p-4 text-center">
          <div className="text-red-600 text-sm">⚠️ Admin Access Required</div>
        </div>
      )}
    >
      {children}
    </Check>
  )
}

export function AnalyticsDashboard({ children }: { children: React.ReactNode }) {
  const { user } = useUser()

  return (
    <Check
      entity="system"
      action="analytics-dashboard"
      otherwise={
        <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
          <div className="text-blue-600 mb-2">📊 Analytics Dashboard</div>
          <p className="text-sm text-gray-500">
            {!user ? 'Sign in to access analytics' : 
             user.role === 'free' ? 'Upgrade to Premium to view analytics' : 
             'Access denied'}
          </p>
        </div>
      }
    >
      {children}
    </Check>
  )
}

// Role Badge Component
export function RoleBadge() {
  const { user, isLoading } = useUser()

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 w-16 h-6 rounded"></div>
  }

  if (!user) {
    return (
      <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
        Anonymous
      </span>
    )
  }

  const roleColors = {
    admin: 'bg-red-100 text-red-800',
    premium: 'bg-blue-100 text-blue-800',
    free: 'bg-green-100 text-green-800',
  }

  return (
    <span className={`px-2 py-1 text-xs rounded ${roleColors[user.role]}`}>
      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
    </span>
  )
}

// User Status Component
export function UserStatus() {
  const { user, isLoading, isAuthenticated } = useUser()

  if (isLoading) {
    return <div className="animate-pulse bg-gray-200 w-32 h-8 rounded"></div>
  }

  return (
    <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
      <div className="flex flex-col">
        <div className="text-sm font-medium">
          {user ? user.email : 'Not signed in'}
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isAuthenticated ? 'bg-green-500' : 'bg-gray-400'}`}></div>
          <RoleBadge />
        </div>
      </div>
    </div>
  )
}

// Permission Debug Panel (for development)
export function PermissionDebugPanel() {
  const { check, isReady } = usePermix(permix)
  const { user } = useUser()

  if (!isReady) return null

  const testPermissions = [
    { entity: 'content' as const, action: 'view' as const, data: { tier: 'premium', type: 'premium-content', id: '1', title: 'Test', authorId: 'test' } },
    { entity: 'service' as const, action: 'access' as const, data: { tier: 'premium', type: 'analytics', id: '1', name: 'Analytics' } },
    { entity: 'system' as const, action: 'admin-panel' as const },
    { entity: 'system' as const, action: 'analytics-dashboard' as const },
  ]

  return (
    <div className="border border-gray-200 rounded-lg p-4 bg-white">
      <h3 className="font-semibold mb-3">Permission Debug Panel</h3>
      <div className="text-sm text-gray-600 mb-2">Current User: {user?.role || 'anonymous'}</div>
      <div className="space-y-2">
        {testPermissions.map((perm, idx) => {
          const hasPermission = 'data' in perm ? 
            check(perm.entity, perm.action, perm.data as any) :
            check(perm.entity, perm.action)
          return (
            <div key={idx} className="flex items-center justify-between">
              <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                {perm.entity}.{perm.action}
              </code>
              <span className={`text-xs ${hasPermission ? 'text-green-600' : 'text-red-600'}`}>
                {hasPermission ? '✅ Allow' : '❌ Deny'}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}