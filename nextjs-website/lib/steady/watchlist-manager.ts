// Custom Market Watchlist Manager
// Personalized ticker tracking with steady patterns

export interface WatchlistItem {
  symbol: string
  alertPrice?: number
  alertType: 'above' | 'below' | 'change'
  added: string
  triggered: boolean
}

export interface Watchlist {
  id: string
  name: string
  items: WatchlistItem[]
  created: string
  public: boolean
}

class WatchlistManager {
  private watchlists: Watchlist[] = []
  private activeWatchlist: string | null = null

  constructor() {
    this.loadFromStorage()
    this.createDefaultWatchlist()
  }

  private loadFromStorage(): void {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('go_rich_watchlists')
      if (stored) {
        try {
          this.watchlists = JSON.parse(stored)
        } catch (error) {
          console.error('Failed to load watchlists:', error)
        }
      }
    }
  }

  private saveToStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('go_rich_watchlists', JSON.stringify(this.watchlists))
    }
  }

  private createDefaultWatchlist(): void {
    if (this.watchlists.length === 0) {
      const defaultWatchlist: Watchlist = {
        id: 'default',
        name: 'My Portfolio',
        items: [
          { symbol: 'BTC', alertType: 'above', added: new Date().toISOString(), triggered: false },
          { symbol: 'ETH', alertType: 'above', added: new Date().toISOString(), triggered: false },
          { symbol: 'AAPL', alertType: 'change', added: new Date().toISOString(), triggered: false }
        ],
        created: new Date().toISOString(),
        public: false
      }
      
      this.watchlists.push(defaultWatchlist)
      this.activeWatchlist = 'default'
      this.saveToStorage()
    }
  }

  createWatchlist(name: string, isPublic = false): string {
    const id = `watchlist_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
    
    const newWatchlist: Watchlist = {
      id,
      name,
      items: [],
      created: new Date().toISOString(),
      public: isPublic
    }
    
    this.watchlists.push(newWatchlist)
    this.saveToStorage()
    
    return id
  }

  deleteWatchlist(id: string): boolean {
    if (id === 'default') return false // Can't delete default
    
    const index = this.watchlists.findIndex(w => w.id === id)
    if (index === -1) return false
    
    this.watchlists.splice(index, 1)
    
    if (this.activeWatchlist === id) {
      this.activeWatchlist = this.watchlists[0]?.id || null
    }
    
    this.saveToStorage()
    return true
  }

  addToWatchlist(watchlistId: string, symbol: string, alertPrice?: number, alertType: 'above' | 'below' | 'change' = 'change'): boolean {
    const watchlist = this.watchlists.find(w => w.id === watchlistId)
    if (!watchlist) return false
    
    // Check if symbol already exists
    if (watchlist.items.some(item => item.symbol === symbol)) {
      return false
    }
    
    const newItem: WatchlistItem = {
      symbol,
      alertPrice,
      alertType,
      added: new Date().toISOString(),
      triggered: false
    }
    
    watchlist.items.push(newItem)
    this.saveToStorage()
    
    return true
  }

  removeFromWatchlist(watchlistId: string, symbol: string): boolean {
    const watchlist = this.watchlists.find(w => w.id === watchlistId)
    if (!watchlist) return false
    
    const index = watchlist.items.findIndex(item => item.symbol === symbol)
    if (index === -1) return false
    
    watchlist.items.splice(index, 1)
    this.saveToStorage()
    
    return true
  }

  updateAlert(watchlistId: string, symbol: string, alertPrice: number, alertType: 'above' | 'below' | 'change'): boolean {
    const watchlist = this.watchlists.find(w => w.id === watchlistId)
    if (!watchlist) return false
    
    const item = watchlist.items.find(i => i.symbol === symbol)
    if (!item) return false
    
    item.alertPrice = alertPrice
    item.alertType = alertType
    item.triggered = false
    
    this.saveToStorage()
    return true
  }

  checkAlerts(tickers: any[]): WatchlistItem[] {
    const triggeredAlerts: WatchlistItem[] = []
    
    for (const watchlist of this.watchlists) {
      for (const item of watchlist.items) {
        if (item.triggered) continue
        
        const ticker = tickers.find(t => t.symbol === item.symbol)
        if (!ticker || !item.alertPrice) continue
        
        let shouldAlert = false
        
        switch (item.alertType) {
          case 'above':
            shouldAlert = ticker.price >= item.alertPrice
            break
          case 'below':
            shouldAlert = ticker.price <= item.alertPrice
            break
          case 'change':
            shouldAlert = Math.abs(ticker.change) >= (item.alertPrice || 5) // Default 5% change
            break
        }
        
        if (shouldAlert) {
          item.triggered = true
          triggeredAlerts.push(item)
        }
      }
    }
    
    if (triggeredAlerts.length > 0) {
      this.saveToStorage()
    }
    
    return triggeredAlerts
  }

  getWatchlists(): Watchlist[] {
    return [...this.watchlists]
  }

  getWatchlist(id: string): Watchlist | null {
    return this.watchlists.find(w => w.id === id) || null
  }

  getActiveWatchlist(): Watchlist | null {
    if (!this.activeWatchlist) return null
    return this.getWatchlist(this.activeWatchlist)
  }

  setActiveWatchlist(id: string): boolean {
    if (!this.watchlists.find(w => w.id === id)) return false
    
    this.activeWatchlist = id
    this.saveToStorage()
    
    return true
  }

  exportWatchlist(id: string): string | null {
    const watchlist = this.getWatchlist(id)
    if (!watchlist) return null
    
    return JSON.stringify(watchlist, null, 2)
  }

  importWatchlist(data: string): boolean {
    try {
      const watchlist: Watchlist = JSON.parse(data)
      
      // Validate structure
      if (!watchlist.id || !watchlist.name || !Array.isArray(watchlist.items)) {
        return false
      }
      
      // Generate new ID to avoid conflicts
      watchlist.id = `imported_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
      watchlist.created = new Date().toISOString()
      
      this.watchlists.push(watchlist)
      this.saveToStorage()
      
      return true
    } catch (error) {
      console.error('Failed to import watchlist:', error)
      return false
    }
  }
}

// Singleton instance
export const watchlistManager = new WatchlistManager()

// React hook for components
export function useWatchlist() {
  return {
    manager: watchlistManager,
    create: (name: string, isPublic?: boolean) => watchlistManager.createWatchlist(name, isPublic),
    delete: (id: string) => watchlistManager.deleteWatchlist(id),
    add: (watchlistId: string, symbol: string, alertPrice?: number, alertType?: 'above' | 'below' | 'change') => 
      watchlistManager.addToWatchlist(watchlistId, symbol, alertPrice, alertType),
    remove: (watchlistId: string, symbol: string) => watchlistManager.removeFromWatchlist(watchlistId, symbol),
    getAll: () => watchlistManager.getWatchlists(),
    getActive: () => watchlistManager.getActiveWatchlist(),
    setActive: (id: string) => watchlistManager.setActiveWatchlist(id),
    checkAlerts: (tickers: any[]) => watchlistManager.checkAlerts(tickers),
    export: (id: string) => watchlistManager.exportWatchlist(id),
    import: (data: string) => watchlistManager.importWatchlist(data)
  }
}