'use client'

import React, { useState } from 'react'
import { AuthProvider } from '@/lib/auth/go-rich-auth'
import { AuthPage } from '@/components/pages/auth.page'

export default function TestAuthPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'reset'>('login')

  return (
    <AuthProvider>
      <div style={{ 
        minHeight: '100vh', 
        background: 'var(--color-background-primary, #f8fafc)',
        padding: '2rem'
      }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h1 style={{ 
            textAlign: 'center', 
            marginBottom: '2rem',
            color: 'var(--color-text-primary, #1e293b)'
          }}>
            Auth Component Test
          </h1>
          
          <AuthPage 
            mode={mode} 
            onModeChange={setMode} 
          />
          
          <div style={{ 
            marginTop: '2rem', 
            textAlign: 'center',
            fontSize: '0.875rem',
            color: 'var(--color-text-secondary, #64748b)'
          }}>
            Test URL: <code>/test-auth</code>
          </div>
        </div>
      </div>
    </AuthProvider>
  )
}