'use client'

import React, { useState, useEffect } from 'react'

// Steady component - ≤8 props, productive defaults
interface SteadyDashboardProps {
  domain?: string          // Default: 'go.rich'
  title?: string          // Default: 'Domain Dashboard'
  className?: string      // Styling
  disabled?: boolean      // Standard prop
  showStats?: boolean     // Default: true
  showCreate?: boolean    // Default: true
  maxLinks?: number       // Default: 50
  onLinkCreate?: (link: { code: string; url: string }) => void
}

interface SteadyLink {
  code: string
  url: string
  clicks: number
  active: boolean
}

interface SteadyDomain {
  domain: string
  price: number
  available: boolean
  category: string
  score: number
  owned?: boolean
}

const SteadyDashboard: React.FC<SteadyDashboardProps> = ({
  domain = 'go.rich',
  title = 'Domain Dashboard',
  className = '',
  disabled = false,
  showStats = true,
  showCreate = true,
  maxLinks = 50,
  onLinkCreate
}) => {
  const [links, setLinks] = useState<SteadyLink[]>([])
  const [stats, setStats] = useState({ totalLinks: 0, totalClicks: 0, activeLinks: 0 })
  const [newUrl, setNewUrl] = useState('')
  const [newCode, setNewCode] = useState('')

  useEffect(() => {
    loadData()
  }, [domain])

  const loadData = async () => {
    try {
      // Get links
      const linksRes = await fetch(`/api/steady/domains?action=links&domain=${domain}`)
      if (linksRes.ok) {
        const data = await linksRes.json()
        setLinks(data.links || [])
      }

      // Get stats
      const statsRes = await fetch('/api/steady/domains?action=stats')
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Load failed:', error)
    }
  }

  const createLink = async () => {
    if (!newUrl || disabled) return

    try {
      const response = await fetch('/api/steady/domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_link',
          url: newUrl,
          code: newCode || undefined,
          domain
        })
      })

      if (response.ok) {
        const data = await response.json()
        setNewUrl('')
        setNewCode('')
        onLinkCreate?.(data.link)
        loadData()
      }
    } catch (error) {
      console.error('Create failed:', error)
    }
  }

  if (disabled) {
    return <div className={`opacity-50 ${className}`}>Dashboard disabled</div>
  }

  return (
    <div className={`steady-dashboard ${className}`}>
      {/* Header */}
      <div className="glass-layer-2 glass-elevation-1 rounded-lg p-6 mb-6">
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        <p className="text-white/70">{domain}</p>
      </div>

      {/* Stats */}
      {showStats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="glass-layer-2 glass-elevation-1 rounded-lg p-4">
            <div className="text-xl font-bold text-white">{stats.totalLinks}</div>
            <div className="text-sm text-white/70">Links</div>
          </div>
          <div className="glass-layer-2 glass-elevation-1 rounded-lg p-4">
            <div className="text-xl font-bold text-green-400">{stats.totalClicks}</div>
            <div className="text-sm text-white/70">Clicks</div>
          </div>
          <div className="glass-layer-2 glass-elevation-1 rounded-lg p-4">
            <div className="text-xl font-bold text-blue-400">{stats.activeLinks}</div>
            <div className="text-sm text-white/70">Active</div>
          </div>
        </div>
      )}

      {/* Create Link */}
      {showCreate && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Create Link</h2>
          <div className="flex gap-4">
            <input
              type="url"
              placeholder="https://example.com"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2"
            />
            <input
              type="text"
              placeholder="custom-code"
              value={newCode}
              onChange={(e) => setNewCode(e.target.value)}
              className="w-32 border rounded-lg px-3 py-2"
            />
            <button
              onClick={createLink}
              disabled={!newUrl}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Create
            </button>
          </div>
        </div>
      )}

      {/* Links List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">Links</h2>
        </div>
        <div className="divide-y">
          {links.slice(0, maxLinks).map((link) => (
            <div key={link.code} className="p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{domain}/{link.code}</div>
                <div className="text-sm text-gray-600 truncate max-w-md">{link.url}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold text-green-600">{link.clicks} clicks</div>
                <div className={`text-xs ${link.active ? 'text-green-600' : 'text-red-600'}`}>
                  {link.active ? 'Active' : 'Inactive'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default SteadyDashboard