'use client'

import SteadyDashboard from '@/components/steady/dashboard'

// Steady page - Simple, productive defaults
export default function SteadyGoRichPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <SteadyDashboard 
        domain="go.rich"
        title="go.rich"
        className="max-w-4xl mx-auto"
        onLinkCreate={(link) => {
          console.log('Link created:', link)
        }}
      />
    </div>
  )
}