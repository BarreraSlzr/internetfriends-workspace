// PWA Notification Service for go.rich Data Gateway
// Real-time market alerts with steady addressability patterns

export interface NotificationAlert {
  id: string
  type: 'price_alert' | 'volume_spike' | 'friend_update' | 'link_click'
  symbol?: string
  message: string
  threshold?: number
  timestamp: string
}

export interface NotificationSettings {
  enabled: boolean
  priceAlerts: boolean
  volumeAlerts: boolean
  friendUpdates: boolean
  linkClicks: boolean
}

class SteadyNotificationService {
  private settings: NotificationSettings = {
    enabled: false,
    priceAlerts: true,
    volumeAlerts: true,
    friendUpdates: true,
    linkClicks: false
  }
  
  private alerts: NotificationAlert[] = []
  private watchlist = new Map<string, number>() // symbol -> threshold
  
  async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Browser does not support notifications')
      return false
    }
    
    if (Notification.permission === 'granted') {
      this.settings.enabled = true
      return true
    }
    
    if (Notification.permission === 'denied') {
      return false
    }
    
    const permission = await Notification.requestPermission()
    this.settings.enabled = permission === 'granted'
    return this.settings.enabled
  }
  
  addPriceAlert(symbol: string, threshold: number): void {
    this.watchlist.set(symbol, threshold)
    console.log(`📊 Price alert set: ${symbol} at $${threshold}`)
  }
  
  removePriceAlert(symbol: string): void {
    this.watchlist.delete(symbol)
    console.log(`🔕 Price alert removed: ${symbol}`)
  }
  
  checkPriceAlerts(tickers: any[]): void {
    if (!this.settings.enabled || !this.settings.priceAlerts) return
    
    for (const ticker of tickers) {
      const threshold = this.watchlist.get(ticker.symbol)
      if (!threshold) continue
      
      const crossedThreshold = 
        (ticker.change > 0 && ticker.price >= threshold) ||
        (ticker.change < 0 && ticker.price <= threshold)
      
      if (crossedThreshold) {
        this.sendNotification({
          id: `price_${ticker.symbol}_${Date.now()}`,
          type: 'price_alert',
          symbol: ticker.symbol,
          message: `${ticker.symbol} reached $${ticker.price.toFixed(2)} (${ticker.change > 0 ? '+' : ''}${ticker.change.toFixed(2)}%)`,
          threshold,
          timestamp: new Date().toISOString()
        })
      }
    }
  }
  
  checkVolumeSpikes(tickers: any[]): void {
    if (!this.settings.enabled || !this.settings.volumeAlerts) return
    
    // Simple volume spike detection (>20B for crypto, >10B for stocks)
    for (const ticker of tickers) {
      const isHighVolume = 
        (ticker.symbol.includes('BTC') || ticker.symbol.includes('ETH')) && ticker.volume > 20000000000 ||
        ticker.volume > 10000000000
      
      if (isHighVolume && Math.random() > 0.95) { // Simulate spike detection
        this.sendNotification({
          id: `volume_${ticker.symbol}_${Date.now()}`,
          type: 'volume_spike',
          symbol: ticker.symbol,
          message: `🚀 Volume spike: ${ticker.symbol} - $${(ticker.volume / 1000000000).toFixed(1)}B`,
          timestamp: new Date().toISOString()
        })
      }
    }
  }
  
  notifyFriendUpdate(friendId: string, activity: string): void {
    if (!this.settings.enabled || !this.settings.friendUpdates) return
    
    this.sendNotification({
      id: `friend_${friendId}_${Date.now()}`,
      type: 'friend_update',
      message: `👥 Friend update: ${activity}`,
      timestamp: new Date().toISOString()
    })
  }
  
  notifyLinkClick(code: string, destination: string): void {
    if (!this.settings.enabled || !this.settings.linkClicks) return
    
    this.sendNotification({
      id: `link_${code}_${Date.now()}`,
      type: 'link_click',
      message: `🔗 Link clicked: go.rich/${code}`,
      timestamp: new Date().toISOString()
    })
  }
  
  private sendNotification(alert: NotificationAlert): void {
    this.alerts.unshift(alert)
    if (this.alerts.length > 50) this.alerts.pop() // Keep last 50
    
    if (this.settings.enabled && 'Notification' in window) {
      new Notification('go.rich Alert', {
        body: alert.message,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: alert.type,
        timestamp: new Date(alert.timestamp).getTime()
      })
    }
    
    // Also dispatch custom event for UI updates
    window.dispatchEvent(new CustomEvent('go-rich-alert', { detail: alert }))
  }
  
  getSettings(): NotificationSettings {
    return { ...this.settings }
  }
  
  updateSettings(updates: Partial<NotificationSettings>): void {
    this.settings = { ...this.settings, ...updates }
    console.log('📱 Notification settings updated:', this.settings)
  }
  
  getRecentAlerts(limit = 10): NotificationAlert[] {
    return this.alerts.slice(0, limit)
  }
  
  getWatchlist(): Array<{ symbol: string; threshold: number }> {
    return Array.from(this.watchlist.entries()).map(([symbol, threshold]) => ({
      symbol,
      threshold
    }))
  }
}

// Singleton instance following steady patterns
export const notificationService = new SteadyNotificationService()

// Utility hook for React components
export function useNotifications() {
  return {
    service: notificationService,
    requestPermission: () => notificationService.requestPermission(),
    addAlert: (symbol: string, threshold: number) => notificationService.addPriceAlert(symbol, threshold),
    removeAlert: (symbol: string) => notificationService.removePriceAlert(symbol),
    getSettings: () => notificationService.getSettings(),
    updateSettings: (updates: Partial<NotificationSettings>) => notificationService.updateSettings(updates),
    getRecent: (limit?: number) => notificationService.getRecentAlerts(limit),
    getWatchlist: () => notificationService.getWatchlist()
  }
}