'use client'

import React, { useState, useEffect } from 'react'
import { LinkManager } from '@/lib/links/manager'
import type { ShortLink, LinkAnalytics } from '@/lib/links/manager'

interface LinkWithAnalytics extends ShortLink {
  shortUrl: string
  analytics?: LinkAnalytics
}

const GoRichDashboard: React.FC = () => {
  const [links, setLinks] = useState<LinkWithAnalytics[]>([])
  const [stats, setStats] = useState({
    totalLinks: 0,
    totalClicks: 0,
    activeLinks: 0,
    topLinks: [] as Array<{ shortCode: string; clicks: number; destination: string }>
  })
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newLink, setNewLink] = useState({
    destination: '',
    shortCode: '',
    title: '',
    description: '',
    tags: ''
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = () => {
    const allLinks = LinkManager.getAllLinks('go.rich')
    const linksWithUrls = allLinks.map(link => ({
      ...link,
      shortUrl: `https://go.rich/${link.shortCode}`,
      analytics: LinkManager.getAnalytics(link.id)
    }))
    
    setLinks(linksWithUrls)
    setStats(LinkManager.getDashboardStats('go.rich'))
  }

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const response = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          destination: newLink.destination,
          shortCode: newLink.shortCode || undefined,
          domain: 'go.rich',
          title: newLink.title || undefined,
          description: newLink.description || undefined,
          tags: newLink.tags.split(',').map(t => t.trim()).filter(Boolean),
          createdBy: 'admin'
        })
      })

      if (response.ok) {
        setNewLink({ destination: '', shortCode: '', title: '', description: '', tags: '' })
        setShowCreateForm(false)
        loadData()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      alert('Failed to create link')
    }
  }

  const toggleLinkStatus = async (shortCode: string, isActive: boolean) => {
    try {
      const response = await fetch(`/api/links?shortCode=${shortCode}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !isActive })
      })

      if (response.ok) {
        loadData()
      }
    } catch (error) {
      alert('Failed to update link')
    }
  }

  const deleteLink = async (shortCode: string) => {
    if (!confirm('Are you sure you want to delete this link?')) return

    try {
      const response = await fetch(`/api/links?shortCode=${shortCode}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        loadData()
      }
    } catch (error) {
      alert('Failed to delete link')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white shadow rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">go.rich</h1>
              <p className="text-gray-600 mt-1">Link Management Dashboard</p>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Link
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-gray-900">{stats.totalLinks}</div>
            <div className="text-gray-600">Total Links</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-green-600">{stats.totalClicks}</div>
            <div className="text-gray-600">Total Clicks</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-blue-600">{stats.activeLinks}</div>
            <div className="text-gray-600">Active Links</div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-2xl font-bold text-purple-600">
              {stats.totalClicks > 0 ? (stats.totalClicks / stats.totalLinks).toFixed(1) : '0'}
            </div>
            <div className="text-gray-600">Avg Clicks/Link</div>
          </div>
        </div>

        {/* Top Links */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Top Performing Links</h2>
          <div className="space-y-3">
            {stats.topLinks.map((link, index) => (
              <div key={link.shortCode} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-gray-500">#{index + 1}</div>
                  <div>
                    <div className="font-medium">go.rich/{link.shortCode}</div>
                    <div className="text-sm text-gray-600 truncate max-w-md">{link.destination}</div>
                  </div>
                </div>
                <div className="text-sm font-semibold text-green-600">{link.clicks} clicks</div>
              </div>
            ))}
          </div>
        </div>

        {/* Links Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">All Links</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Short Link</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Destination</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Clicks</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {links.map((link) => (
                  <tr key={link.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            go.rich/{link.shortCode}
                          </div>
                          {link.title && (
                            <div className="text-sm text-gray-500">{link.title}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 truncate max-w-xs">{link.destination}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">{link.clickCount}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        link.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {link.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(link.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                      <button
                        onClick={() => toggleLinkStatus(link.shortCode, link.isActive)}
                        className={`px-3 py-1 rounded text-xs font-medium ${
                          link.isActive
                            ? 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {link.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button
                        onClick={() => deleteLink(link.shortCode)}
                        className="px-3 py-1 rounded text-xs font-medium bg-red-100 text-red-800 hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Create Link Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Create New Link</h3>
              <form onSubmit={handleCreateLink} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Destination URL *
                  </label>
                  <input
                    type="url"
                    required
                    value={newLink.destination}
                    onChange={(e) => setNewLink({ ...newLink, destination: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Custom Short Code (optional)
                  </label>
                  <input
                    type="text"
                    value={newLink.shortCode}
                    onChange={(e) => setNewLink({ ...newLink, shortCode: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="custom-code"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title (optional)
                  </label>
                  <input
                    type="text"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Link title"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma-separated)
                  </label>
                  <input
                    type="text"
                    value={newLink.tags}
                    onChange={(e) => setNewLink({ ...newLink, tags: e.target.value })}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="social, marketing, demo"
                  />
                </div>
                <div className="flex space-x-3 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create Link
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default GoRichDashboard