'use client'

import React from 'react'
import { HeaderEngineering } from '@/components/organisms/header/header.engineering'
import { 
  PremiumContent, 
  AdminOnly, 
  AnalyticsDashboard, 
  UserStatus, 
  PermissionDebugPanel 
} from '@/lib/permissions/components'

export default function PermissionsDemo() {
  return (
    <div className="min-h-screen bg-white">
      <HeaderEngineering />
      
      <main className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Permix Permissiology Demo
          </h1>
          <p className="text-gray-600">
            Demonstrating role-based access control with different user tiers
          </p>
        </div>

        {/* User Status */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Current User Status</h2>
          <UserStatus />
          <p className="text-sm text-gray-500 mt-2">
            User changes automatically every 10 seconds for demo purposes
          </p>
        </section>

        {/* Free Content - Always Visible */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Free Content</h2>
          <div className="border border-gray-200 rounded-lg p-6 bg-green-50">
            <h3 className="font-medium text-green-800 mb-2">✅ Getting Started Guide</h3>
            <p className="text-green-700">
              This content is available to all users, including anonymous visitors. 
              Perfect for onboarding and basic documentation.
            </p>
          </div>
        </section>

        {/* Premium Content - Restricted */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Premium Content</h2>
          <PremiumContent contentData={{ tier: 'premium' }}>
            <div className="border border-blue-200 rounded-lg p-6 bg-blue-50">
              <h3 className="font-medium text-blue-800 mb-2">🎯 Advanced Tutorials</h3>
              <p className="text-blue-700 mb-3">
                Premium users get access to advanced content, detailed tutorials, 
                and exclusive features that drive revenue growth.
              </p>
              <ul className="text-sm text-blue-600 space-y-1">
                <li>• Advanced project templates</li>
                <li>• Priority support access</li>
                <li>• Extended storage limits</li>
                <li>• Analytics dashboards</li>
              </ul>
            </div>
          </PremiumContent>
        </section>

        {/* Analytics Dashboard - Premium + Admin */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Analytics Dashboard</h2>
          <AnalyticsDashboard>
            <div className="border border-purple-200 rounded-lg p-6 bg-purple-50">
              <h3 className="font-medium text-purple-800 mb-2">📊 Usage Analytics</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">847</div>
                  <div className="text-xs text-purple-500">Page Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">23</div>
                  <div className="text-xs text-purple-500">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">12.3GB</div>
                  <div className="text-xs text-purple-500">Storage Used</div>
                </div>
              </div>
              <p className="text-purple-700">
                Detailed analytics help premium users understand their usage patterns 
                and optimize their workflow.
              </p>
            </div>
          </AnalyticsDashboard>
        </section>

        {/* Admin Panel - Admin Only */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Admin Panel</h2>
          <AdminOnly>
            <div className="border border-red-200 rounded-lg p-6 bg-red-50">
              <h3 className="font-medium text-red-800 mb-2">⚙️ System Administration</h3>
              <p className="text-red-700 mb-3">
                Administrative functions for system management and user oversight.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                  Manage Users
                </button>
                <button className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                  System Settings
                </button>
                <button className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                  View Logs
                </button>
                <button className="px-3 py-2 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200">
                  Billing Overview
                </button>
              </div>
            </div>
          </AdminOnly>
        </section>

        {/* Profit-Driven Services Example */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Profit-Driven Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Basic Service - Free */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h4 className="font-medium text-gray-800 mb-2">Basic Project Storage</h4>
              <div className="text-sm text-gray-600 mb-2">5GB included</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                <div className="bg-gray-400 h-2 rounded-full" style={{ width: '40%' }}></div>
              </div>
              <p className="text-xs text-gray-500">Available to all users</p>
            </div>

            {/* Premium Service */}
            <PremiumContent contentData={{ tier: 'premium' }}>
              <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
                <h4 className="font-medium text-blue-800 mb-2">Advanced Analytics Suite</h4>
                <div className="text-sm text-blue-600 mb-2">Real-time insights</div>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Performance tracking</li>
                  <li>• User behavior analysis</li>
                  <li>• Revenue optimization</li>
                </ul>
              </div>
            </PremiumContent>
          </div>
        </section>

        {/* Debug Panel */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Developer Debug Panel</h2>
          <PermissionDebugPanel />
        </section>
      </main>
    </div>
  )
}