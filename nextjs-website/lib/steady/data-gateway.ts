// Go.Rich Data Gateway - Steady approach to market data, analytics, and friend network feeds
// Core service for: tickers, analytics, notifications, friend network data sharing

export interface MarketTicker {
  symbol: string        // BTC, ETH, AAPL, etc.
  price: number        // Current price
  change: number       // 24h change %
  volume: number       // 24h volume
  updated: string      // ISO timestamp
}

export interface AnalyticsEvent {
  type: string         // click, view, purchase, etc.
  domain: string       // go.rich, internetfriends.xyz
  data: any           // Event payload
  timestamp: string   // ISO timestamp
  userId?: string     // Optional user ID
}

export interface FriendNetworkData {
  friendId: string    // Friend identifier
  endpoint: string    // Their data endpoint
  lastSync: string    // Last sync time
  status: 'online' | 'offline' | 'syncing'
}

export interface NotificationPayload {
  title: string       // Notification title
  body: string       // Notification body
  icon?: string      // Icon URL
  data?: any         // Custom data
}

// Core steady data gateway
class GoRichDataGateway {
  private tickers: Map<string, MarketTicker> = new Map()
  private events: AnalyticsEvent[] = []
  private friends: Map<string, FriendNetworkData> = new Map()
  private subscribers: Set<(data: any) => void> = new Set()

  constructor() {
    this.initializeMockData()
    this.startTickers()
  }

  // ===== MARKET DATA (≤4 parameters) =====
  
  async getTicker(
    symbol: string,
    includeHistory = false,
    currency = 'USD'
  ): Promise<MarketTicker | null> {
    return this.tickers.get(symbol.toUpperCase()) || null
  }

  async getTickerList(
    symbols?: string[],
    limit = 10,
    sortBy: 'volume' | 'change' | 'price' = 'volume'
  ): Promise<MarketTicker[]> {
    let results = Array.from(this.tickers.values())
    
    if (symbols) {
      results = results.filter(t => symbols.includes(t.symbol))
    }
    
    results.sort((a, b) => {
      switch (sortBy) {
        case 'change': return Math.abs(b.change) - Math.abs(a.change)
        case 'price': return b.price - a.price
        default: return b.volume - a.volume
      }
    })
    
    return results.slice(0, limit)
  }

  async updateTicker(symbol: string, price: number): Promise<void> {
    const ticker = this.tickers.get(symbol)
    if (ticker) {
      const oldPrice = ticker.price
      ticker.price = price
      ticker.change = ((price - oldPrice) / oldPrice) * 100
      ticker.updated = new Date().toISOString()
      
      // Notify subscribers
      this.notifySubscribers({
        type: 'ticker_update',
        symbol,
        price,
        change: ticker.change
      })
    }
  }

  // ===== ANALYTICS (≤4 parameters) =====
  
  async trackEvent(
    type: string,
    domain: string,
    data: any = {},
    userId?: string
  ): Promise<void> {
    const event: AnalyticsEvent = {
      type,
      domain,
      data,
      timestamp: new Date().toISOString(),
      userId
    }
    
    this.events.push(event)
    
    // Keep only last 1000 events (steady memory management)
    if (this.events.length > 1000) {
      this.events = this.events.slice(-1000)
    }
    
    // Notify subscribers
    this.notifySubscribers({
      type: 'analytics_event',
      event
    })
  }

  async getAnalytics(
    domain?: string,
    eventType?: string,
    limit = 100
  ): Promise<AnalyticsEvent[]> {
    let results = this.events
    
    if (domain) {
      results = results.filter(e => e.domain === domain)
    }
    
    if (eventType) {
      results = results.filter(e => e.type === eventType)
    }
    
    return results.slice(-limit).reverse()
  }

  // ===== FRIEND NETWORK (≤4 parameters) =====
  
  async addFriend(
    friendId: string,
    endpoint: string,
    autoSync = true
  ): Promise<void> {
    this.friends.set(friendId, {
      friendId,
      endpoint,
      lastSync: new Date().toISOString(),
      status: 'online'
    })
    
    if (autoSync) {
      this.syncWithFriend(friendId)
    }
  }

  async getFriends(status?: 'online' | 'offline' | 'syncing'): Promise<FriendNetworkData[]> {
    const results = Array.from(this.friends.values())
    return status ? results.filter(f => f.status === status) : results
  }

  async syncWithFriend(friendId: string): Promise<boolean> {
    const friend = this.friends.get(friendId)
    if (!friend) return false
    
    try {
      friend.status = 'syncing'
      
      // Mock sync - in production would call friend.endpoint
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      friend.lastSync = new Date().toISOString()
      friend.status = 'online'
      
      this.notifySubscribers({
        type: 'friend_sync',
        friendId,
        status: 'completed'
      })
      
      return true
    } catch (error) {
      friend.status = 'offline'
      return false
    }
  }

  // ===== REAL-TIME SUBSCRIPTIONS =====
  
  subscribe(callback: (data: any) => void): () => void {
    this.subscribers.add(callback)
    return () => this.subscribers.delete(callback)
  }

  private notifySubscribers(data: any): void {
    this.subscribers.forEach(callback => {
      try {
        callback(data)
      } catch (error) {
        console.error('Subscriber notification failed:', error)
      }
    })
  }

  // ===== NOTIFICATIONS =====
  
  async sendNotification(
    payload: NotificationPayload,
    target?: 'all' | string[]
  ): Promise<void> {
    // Notify subscribers (PWA notifications)
    this.notifySubscribers({
      type: 'notification',
      payload,
      target
    })
  }

  // ===== PRIVATE HELPERS =====
  
  private initializeMockData(): void {
    // Initialize popular tickers
    const symbols = [
      { symbol: 'BTC', price: 43250, volume: 25000000000 },
      { symbol: 'ETH', price: 2680, volume: 15000000000 },
      { symbol: 'AAPL', price: 195.50, volume: 8000000000 },
      { symbol: 'TSLA', price: 248.75, volume: 12000000000 },
      { symbol: 'NVDA', price: 875.25, volume: 18000000000 }
    ]
    
    symbols.forEach(({ symbol, price, volume }) => {
      this.tickers.set(symbol, {
        symbol,
        price,
        change: (Math.random() - 0.5) * 10, // Random ±5% change
        volume,
        updated: new Date().toISOString()
      })
    })
    
    // Add demo friends
    this.friends.set('alice', {
      friendId: 'alice',
      endpoint: 'https://alice.internetfriends.xyz/api/data',
      lastSync: new Date().toISOString(),
      status: 'online'
    })
    
    this.friends.set('bob', {
      friendId: 'bob', 
      endpoint: 'https://bob.rich/api/feed',
      lastSync: new Date().toISOString(),
      status: 'online'
    })
  }

  private startTickers(): void {
    // Update tickers every 5 seconds (steady interval)
    setInterval(() => {
      this.tickers.forEach((ticker, symbol) => {
        // Random price movement ±2%
        const change = (Math.random() - 0.5) * 0.04
        const newPrice = ticker.price * (1 + change)
        this.updateTicker(symbol, newPrice)
      })
    }, 5000)
  }

  // ===== DASHBOARD STATS =====
  
  getDashboardStats() {
    return {
      activeTickers: this.tickers.size,
      totalEvents: this.events.length,
      onlineFriends: Array.from(this.friends.values()).filter(f => f.status === 'online').length,
      topTickers: Array.from(this.tickers.values())
        .sort((a, b) => Math.abs(b.change) - Math.abs(a.change))
        .slice(0, 3)
        .map(t => ({ symbol: t.symbol, change: t.change }))
    }
  }
}

// Singleton instance
export const goRichGateway = new GoRichDataGateway()

// Export types for external use
export type { MarketTicker, AnalyticsEvent, FriendNetworkData, NotificationPayload }