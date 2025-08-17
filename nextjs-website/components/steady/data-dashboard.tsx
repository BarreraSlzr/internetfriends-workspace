'use client'

import React, { useState, useEffect } from 'react'
import type { MarketTicker, AnalyticsEvent, FriendNetworkData } from '@/lib/steady/data-gateway'
import { useNotifications, type NotificationAlert } from '@/lib/steady/notification-service'

// Steady Data Gateway Dashboard - Bloomberg Terminal for Friends Network
// ≤8 props, real-time updates, PWA ready

interface GoRichDataDashboardProps {
  title?: string          // Default: 'go.rich Data Gateway'
  className?: string      // Styling
  disabled?: boolean      // Standard prop
  autoRefresh?: boolean   // Default: true
  refreshInterval?: number // Default: 5000ms
  showTickers?: boolean   // Default: true
  showAnalytics?: boolean // Default: true
  maxItems?: number       // Default: 20
}

interface DashboardStats {
  activeTickers: number
  totalEvents: number
  onlineFriends: number
  topTickers: Array<{ symbol: string; change: number }>
}

const GoRichDataDashboard: React.FC<GoRichDataDashboardProps> = ({
  title = 'go.rich Data Gateway',
  className = '',
  disabled = false,
  autoRefresh = true,
  refreshInterval = 5000,
  showTickers = true,
  showAnalytics = true,
  maxItems = 20
}) => {
  const [tickers, setTickers] = useState<MarketTicker[]>([])
  const [events, setEvents] = useState<AnalyticsEvent[]>([])
  const [friends, setFriends] = useState<FriendNetworkData[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    activeTickers: 0,
    totalEvents: 0,
    onlineFriends: 0,
    topTickers: []
  })
  const [connected, setConnected] = useState(false)
  const [alerts, setAlerts] = useState<NotificationAlert[]>([])
  const [showNotificationPanel, setShowNotificationPanel] = useState(false)
  
  const notifications = useNotifications()

  useEffect(() => {
    if (disabled) return

    loadInitialData()
    
    if (autoRefresh) {
      connectToStream()
    }

    // Listen for notification alerts
    const handleAlert = (event: CustomEvent<NotificationAlert>) => {
      setAlerts(prev => [event.detail, ...prev.slice(0, 9)]) // Keep last 10
    }
    
    window.addEventListener('go-rich-alert', handleAlert as EventListener)

    return () => {
      window.removeEventListener('go-rich-alert', handleAlert as EventListener)
    }
  }, [disabled, autoRefresh])

  const loadInitialData = async () => {
    try {
      // Load tickers
      if (showTickers) {
        const tickersRes = await fetch('/api/steady/gateway?action=tickers&limit=10')
        if (tickersRes.ok) {
          const data = await tickersRes.json()
          setTickers(data.tickers)
        }
      }

      // Load analytics
      if (showAnalytics) {
        const analyticsRes = await fetch('/api/steady/gateway?action=analytics&limit=50')
        if (analyticsRes.ok) {
          const data = await analyticsRes.json()
          setEvents(data.events)
        }
      }

      // Load friends
      const friendsRes = await fetch('/api/steady/gateway?action=friends')
      if (friendsRes.ok) {
        const data = await friendsRes.json()
        setFriends(data.friends)
      }

      // Load stats
      const statsRes = await fetch('/api/steady/gateway?action=stats')
      if (statsRes.ok) {
        const data = await statsRes.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load data:', error)
    }
  }

  const connectToStream = () => {
    const eventSource = new EventSource('/api/steady/stream?feed=all')
    
    eventSource.onopen = () => {
      setConnected(true)
      console.log('📡 Connected to go.rich data stream')
    }
    
    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        handleStreamEvent(data)
      } catch (error) {
        console.error('Stream parsing error:', error)
      }
    }
    
    eventSource.onerror = () => {
      setConnected(false)
      console.error('📡 Stream connection lost')
    }

    return eventSource
  }

  const handleStreamEvent = (data: any) => {
    switch (data.type) {
      case 'ticker_update':
        const updatedTickers = tickers.map(ticker => 
          ticker.symbol === data.symbol 
            ? { ...ticker, price: data.price, change: data.change, updated: new Date().toISOString() }
            : ticker
        )
        setTickers(updatedTickers)
        
        // Check for price alerts
        notifications.service.checkPriceAlerts(updatedTickers)
        notifications.service.checkVolumeSpikes(updatedTickers)
        break

      case 'analytics_event':
        setEvents(prev => [data.event, ...prev.slice(0, maxItems - 1)])
        break

      case 'friend_sync':
        setFriends(prev => prev.map(friend =>
          friend.friendId === data.friendId
            ? { ...friend, status: data.status === 'completed' ? 'online' : 'syncing' }
            : friend
        ))
        
        // Notify friend updates
        if (data.status === 'completed') {
          notifications.service.notifyFriendUpdate(data.friendId, 'came online')
        }
        break

      case 'notification':
        // Handle PWA notifications
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(data.payload.title, {
            body: data.payload.body,
            icon: data.payload.icon || '/favicon.ico'
          })
        }
        break
    }
  }

  const trackEvent = async (type: string, data: any = {}) => {
    try {
      await fetch('/api/steady/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'track_event',
          type,
          domain: 'go.rich',
          data
        })
      })
    } catch (error) {
      console.error('Track event failed:', error)
    }
  }

  const requestNotificationPermission = async () => {
    const granted = await notifications.requestPermission()
    if (granted) {
      trackEvent('notification_enabled')
      // Add some default price alerts
      notifications.addAlert('BTC', 52000)
      notifications.addAlert('ETH', 2300)
      setAlerts([])
    }
  }

  const addPriceAlert = (symbol: string) => {
    const ticker = tickers.find(t => t.symbol === symbol)
    if (ticker) {
      const threshold = ticker.price * (Math.random() > 0.5 ? 1.05 : 0.95) // ±5%
      notifications.addAlert(symbol, threshold)
      trackEvent('price_alert_added', { symbol, threshold })
    }
  }

  if (disabled) {
    return <div className={`opacity-50 ${className}`}>Data gateway disabled</div>
  }

  return (
    <div className={`go-rich-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <div className="flex items-center space-x-4 mt-2">
              <div className={`flex items-center space-x-2 ${connected ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="text-sm">{connected ? 'Live' : 'Disconnected'}</span>
              </div>
              <button
                onClick={requestNotificationPermission}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                Enable Notifications
              </button>
              <button
                onClick={() => setShowNotificationPanel(!showNotificationPanel)}
                className="text-sm text-purple-600 hover:text-purple-700 relative"
              >
                Alerts ({alerts.length})
                {alerts.length > 0 && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
              </button>
            </div>
          </div>
          <button
            onClick={loadInitialData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Refresh
          </button>
        </div>
        
        {/* Notification Panel */}
        {showNotificationPanel && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">Recent Alerts</h3>
              <button
                onClick={() => setAlerts([])}
                className="text-sm text-gray-600 hover:text-gray-700"
              >
                Clear All
              </button>
            </div>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-sm text-gray-500">No alerts yet</div>
              ) : (
                alerts.map((alert) => (
                  <div key={alert.id} className="flex items-center justify-between p-2 bg-white rounded text-sm">
                    <div>
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-gray-500">{new Date(alert.timestamp).toLocaleTimeString()}</div>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs ${
                      alert.type === 'price_alert' ? 'bg-blue-100 text-blue-800' :
                      alert.type === 'volume_spike' ? 'bg-orange-100 text-orange-800' :
                      alert.type === 'friend_update' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {alert.type.replace('_', ' ')}
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {/* Watchlist */}
            <div className="mt-4 pt-3 border-t">
              <h4 className="font-medium mb-2">Price Watchlist</h4>
              <div className="space-y-1">
                {notifications.getWatchlist().map((item) => (
                  <div key={item.symbol} className="flex items-center justify-between text-sm">
                    <span>{item.symbol} → ${item.threshold.toFixed(2)}</span>
                    <button
                      onClick={() => notifications.removeAlert(item.symbol)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xl font-bold text-blue-600">{stats.activeTickers}</div>
          <div className="text-sm text-gray-600">Active Tickers</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xl font-bold text-green-600">{stats.totalEvents}</div>
          <div className="text-sm text-gray-600">Total Events</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xl font-bold text-purple-600">{stats.onlineFriends}</div>
          <div className="text-sm text-gray-600">Online Friends</div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-xl font-bold text-orange-600">{friends.length}</div>
          <div className="text-sm text-gray-600">Network Size</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Market Tickers */}
        {showTickers && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">Market Tickers</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {tickers.slice(0, maxItems).map((ticker) => (
                <div key={ticker.symbol} className="p-4 flex items-center justify-between hover:bg-gray-50">
                  <div>
                    <div className="font-bold">{ticker.symbol}</div>
                    <div className="text-sm text-gray-600">
                      Vol: {(ticker.volume / 1000000000).toFixed(1)}B
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="font-bold">${ticker.price.toLocaleString()}</div>
                      <div className={`text-sm ${ticker.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {ticker.change >= 0 ? '+' : ''}{ticker.change.toFixed(2)}%
                      </div>
                    </div>
                    <button
                      onClick={() => addPriceAlert(ticker.symbol)}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                      title="Add price alert"
                    >
                      📊
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Analytics Events */}
        {showAnalytics && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b bg-gray-50">
              <h2 className="text-lg font-semibold">Live Analytics</h2>
            </div>
            <div className="divide-y max-h-96 overflow-y-auto">
              {events.slice(0, maxItems).map((event, index) => (
                <div key={index} className="p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{event.type}</span>
                    <span className="text-gray-500">
                      {new Date(event.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <div className="text-gray-600 mt-1">
                    {event.domain} {event.userId && `• ${event.userId}`}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends Network */}
        <div className="bg-white rounded-lg shadow overflow-hidden lg:col-span-2">
          <div className="p-4 border-b bg-gray-50">
            <h2 className="text-lg font-semibold">Friends Network</h2>
          </div>
          <div className="divide-y">
            {friends.map((friend) => (
              <div key={friend.friendId} className="p-4 flex items-center justify-between">
                <div>
                  <div className="font-medium">{friend.friendId}</div>
                  <div className="text-sm text-gray-600">{friend.endpoint}</div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className={`px-2 py-1 rounded-full text-xs ${
                    friend.status === 'online' ? 'bg-green-100 text-green-800' :
                    friend.status === 'syncing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {friend.status}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(friend.lastSync).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default GoRichDataDashboard