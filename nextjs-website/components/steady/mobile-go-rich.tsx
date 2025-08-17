// Mobile-first go.rich Gateway Component
// Touch-optimized with steady patterns

'use client'

import React, { useState, useEffect } from 'react'
import type { MarketTicker } from '@/lib/steady/data-gateway'
import { useNotifications, type NotificationAlert } from '@/lib/steady/notification-service'

interface MobileGoRichProps {
  title?: string
  className?: string
  disabled?: boolean
  defaultTab?: 'tickers' | 'links' | 'friends' | 'alerts'
}

const MobileGoRich: React.FC<MobileGoRichProps> = ({
  title = 'go.rich',
  className = '',
  disabled = false,
  defaultTab = 'tickers'
}) => {
  const [activeTab, setActiveTab] = useState(defaultTab)
  const [tickers, setTickers] = useState<MarketTicker[]>([])
  const [links, setLinks] = useState<any[]>([])
  const [friends, setFriends] = useState<any[]>([])
  const [connected, setConnected] = useState(false)
  const [alerts, setAlerts] = useState<NotificationAlert[]>([])
  
  const notifications = useNotifications()

  useEffect(() => {
    if (disabled) return
    
    loadData()
    
    // Connect to real-time stream
    const eventSource = new EventSource('/api/steady/stream?feed=all')
    
    eventSource.onopen = () => setConnected(true)
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleStreamUpdate(data)
      } catch (error) {
        console.error('Stream error:', error)
      }
    }
    eventSource.onerror = () => setConnected(false)

    // Listen for alerts
    const handleAlert = (event: CustomEvent<NotificationAlert>) => {
      setAlerts(prev => [event.detail, ...prev.slice(0, 19)]) // Keep last 20
    }
    
    window.addEventListener('go-rich-alert', handleAlert as EventListener)

    return () => {
      eventSource.close()
      window.removeEventListener('go-rich-alert', handleAlert as EventListener)
    }
  }, [disabled])

  const loadData = async () => {
    try {
      // Load tickers
      const tickersRes = await fetch('/api/steady/gateway?action=tickers&limit=8')
      if (tickersRes.ok) {
        const data = await tickersRes.json()
        setTickers(data.tickers)
      }

      // Load links
      const linksRes = await fetch('/api/steady/domains?action=links&limit=10')
      if (linksRes.ok) {
        const data = await linksRes.json()
        setLinks(data.links || [])
      }

      // Load friends
      const friendsRes = await fetch('/api/steady/gateway?action=friends')
      if (friendsRes.ok) {
        const data = await friendsRes.json()
        setFriends(data.friends || [])
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const handleStreamUpdate = (data: any) => {
    switch (data.type) {
      case 'ticker_update':
        setTickers(prev => prev.map(ticker => 
          ticker.symbol === data.symbol 
            ? { ...ticker, price: data.price, change: data.change }
            : ticker
        ))
        break
      case 'friend_sync':
        setFriends(prev => prev.map(friend =>
          friend.friendId === data.friendId
            ? { ...friend, status: data.status === 'completed' ? 'online' : 'syncing' }
            : friend
        ))
        break
    }
  }

  const addPriceAlert = async (symbol: string) => {
    const ticker = tickers.find(t => t.symbol === symbol)
    if (ticker) {
      const threshold = ticker.price * (Math.random() > 0.5 ? 1.05 : 0.95)
      notifications.addAlert(symbol, threshold)
      
      // Haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50)
      }
    }
  }

  const requestNotifications = async () => {
    const granted = await notifications.requestPermission()
    if (granted && 'vibrate' in navigator) {
      navigator.vibrate([100, 50, 100])
    }
  }

  if (disabled) {
    return <div className={`text-center p-8 opacity-50 ${className}`}>go.rich disabled</div>
  }

  return (
    <div className={`mobile-go-rich ${className} min-h-screen bg-gray-50`}>
      {/* Mobile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold">{title}</h1>
          <div className="flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-400' : 'bg-red-400'}`}></div>
            <button
              onClick={requestNotifications}
              className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full"
            >
              🔔
            </button>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex mt-4 bg-white bg-opacity-10 rounded-lg p-1">
          {[
            { id: 'tickers', label: '📊', name: 'Markets' },
            { id: 'links', label: '🔗', name: 'Links' },
            { id: 'friends', label: '👥', name: 'Friends' },
            { id: 'alerts', label: '🔔', name: 'Alerts', badge: alerts.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2 px-3 rounded text-sm font-medium relative ${
                activeTab === tab.id 
                  ? 'bg-white text-blue-600' 
                  : 'text-white hover:bg-white hover:bg-opacity-20'
              }`}
            >
              <div className="flex flex-col items-center">
                <span className="text-lg">{tab.label}</span>
                <span className="text-xs">{tab.name}</span>
                {tab.badge && tab.badge > 0 && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {tab.badge}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-4">
        {/* Market Tickers */}
        {activeTab === 'tickers' && (
          <div className="space-y-3">
            {tickers.map((ticker) => (
              <div key={ticker.symbol} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-bold text-lg">{ticker.symbol}</div>
                    <div className="text-sm text-gray-600">
                      Vol: {(ticker.volume / 1000000000).toFixed(1)}B
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">${ticker.price.toLocaleString()}</div>
                    <div className={`text-sm font-medium ${
                      ticker.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)}%
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => addPriceAlert(ticker.symbol)}
                  className="mt-3 w-full bg-blue-50 text-blue-700 py-2 rounded-lg text-sm font-medium"
                >
                  Add Price Alert
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Links */}
        {activeTab === 'links' && (
          <div className="space-y-3">
            <div className="bg-white rounded-lg shadow p-4">
              <h3 className="font-semibold mb-3">Quick Links</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { code: 'ig', label: 'Instagram', color: 'bg-pink-100 text-pink-700' },
                  { code: 'gh', label: 'GitHub', color: 'bg-gray-100 text-gray-700' },
                  { code: 'tw', label: 'Twitter', color: 'bg-blue-100 text-blue-700' },
                  { code: 'ln', label: 'LinkedIn', color: 'bg-indigo-100 text-indigo-700' }
                ].map((link) => (
                  <a
                    key={link.code}
                    href={`/api/steady/go/${link.code}`}
                    className={`${link.color} p-3 rounded-lg text-center font-medium`}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
            
            {links.map((link) => (
              <div key={link.code} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">go.rich/{link.code}</div>
                    <div className="text-sm text-gray-600 truncate">{link.destination}</div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {link.clicks || 0} clicks
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Friends */}
        {activeTab === 'friends' && (
          <div className="space-y-3">
            {friends.map((friend) => (
              <div key={friend.friendId} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{friend.friendId}</div>
                    <div className="text-sm text-gray-600 truncate">{friend.endpoint}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last sync: {new Date(friend.lastSync).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm ${
                    friend.status === 'online' ? 'bg-green-100 text-green-800' :
                    friend.status === 'syncing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {friend.status}
                  </div>
                </div>
              </div>
            ))}
            
            {friends.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-4xl mb-4">👥</div>
                <div className="text-gray-600">No friends connected yet</div>
                <button className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg">
                  Add Friend
                </button>
              </div>
            )}
          </div>
        )}

        {/* Alerts */}
        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="bg-white rounded-lg shadow p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{alert.message}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      {new Date(alert.timestamp).toLocaleString()}
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs ml-3 ${
                    alert.type === 'price_alert' ? 'bg-blue-100 text-blue-800' :
                    alert.type === 'volume_spike' ? 'bg-orange-100 text-orange-800' :
                    alert.type === 'friend_update' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {alert.type.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}
            
            {alerts.length === 0 && (
              <div className="bg-white rounded-lg shadow p-8 text-center">
                <div className="text-4xl mb-4">🔔</div>
                <div className="text-gray-600">No alerts yet</div>
                <button 
                  onClick={requestNotifications}
                  className="mt-4 bg-purple-600 text-white px-6 py-2 rounded-lg"
                >
                  Enable Notifications
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <button 
        onClick={loadData}
        className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg flex items-center justify-center text-xl"
      >
        🔄
      </button>
    </div>
  )
}

export default MobileGoRich