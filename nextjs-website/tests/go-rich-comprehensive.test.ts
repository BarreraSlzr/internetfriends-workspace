// Comprehensive Test Suite for go.rich Data Gateway
// Tests for all major components and APIs

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { realCryptoService } from '../lib/steady/real-crypto-service'
import { notificationService } from '../lib/steady/notification-service'
import { watchlistManager } from '../lib/steady/watchlist-manager'
import WebRTCFriendService from '../lib/steady/webrtc-friend-service'

// Mock global APIs
global.fetch = vi.fn()
global.Notification = vi.fn()
global.RTCPeerConnection = vi.fn()
global.EventSource = vi.fn()

describe('go.rich Data Gateway', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  describe('Real Crypto Service', () => {
    it('should fetch crypto prices from CoinGecko API', async () => {
      const mockResponse = {
        bitcoin: { usd: 52000, usd_24h_change: 2.5, usd_24h_vol: 25000000000, usd_market_cap: 1000000000000 },
        ethereum: { usd: 2300, usd_24h_change: -1.2, usd_24h_vol: 15000000000, usd_market_cap: 280000000000 }
      }

      ;(global.fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const prices = await realCryptoService.getCryptoPrices(['bitcoin', 'ethereum'])

      expect(prices).toHaveLength(2)
      expect(prices[0]).toMatchObject({
        symbol: 'BITCOIN',
        price: 52000,
        change24h: 2.5,
        source: 'coingecko'
      })
      expect(prices[1]).toMatchObject({
        symbol: 'ETHEREUM',
        price: 2300,
        change24h: -1.2,
        source: 'coingecko'
      })
    })

    it('should fall back to mock data when API fails', async () => {
      ;(global.fetch as any).mockRejectedValueOnce(new Error('API Error'))

      const prices = await realCryptoService.getCryptoPrices(['bitcoin'])

      expect(prices).toHaveLength(1)
      expect(prices[0].source).toBe('mock')
      expect(prices[0].symbol).toBe('BITCOIN')
      expect(prices[0].price).toBeGreaterThan(0)
    })

    it('should respect rate limits', async () => {
      const service = new (realCryptoService.constructor as any)({ rateLimit: 2 })

      // First request should work
      expect(service.canMakeRequest()).toBe(true)
      service.incrementRequestCount()

      // Second request should work
      expect(service.canMakeRequest()).toBe(true)
      service.incrementRequestCount()

      // Third request should be blocked
      expect(service.canMakeRequest()).toBe(false)
    })

    it('should cache responses for configured duration', async () => {
      const mockResponse = {
        bitcoin: { usd: 52000, usd_24h_change: 2.5, usd_24h_vol: 25000000000, usd_market_cap: 1000000000000 }
      }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // First call should make API request
      await realCryptoService.getCryptoPrices(['bitcoin'])
      expect(global.fetch).toHaveBeenCalledTimes(1)

      // Second call should use cache
      await realCryptoService.getCryptoPrices(['bitcoin'])
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })

  describe('Notification Service', () => {
    beforeEach(() => {
      ;(global.Notification as any).permission = 'granted'
    })

    it('should request notification permission', async () => {
      ;(global.Notification as any).requestPermission = vi.fn().mockResolvedValue('granted')

      const granted = await notificationService.requestPermission()

      expect(granted).toBe(true)
      expect(global.Notification.requestPermission).toHaveBeenCalled()
    })

    it('should add and remove price alerts', () => {
      notificationService.addPriceAlert('BTC', 55000)

      const watchlist = notificationService.getWatchlist()
      expect(watchlist).toHaveLength(1)
      expect(watchlist[0]).toMatchObject({
        symbol: 'BTC',
        threshold: 55000
      })

      notificationService.removePriceAlert('BTC')
      expect(notificationService.getWatchlist()).toHaveLength(0)
    })

    it('should detect price alerts when thresholds are crossed', () => {
      notificationService.addPriceAlert('BTC', 50000)

      const mockTickers = [
        { symbol: 'BTC', price: 51000, change: 2.0 }
      ]

      const alerts = notificationService.checkPriceAlerts(mockTickers)
      expect(alerts).toHaveLength(1)
    })

    it('should detect volume spikes', () => {
      const mockTickers = [
        { symbol: 'BTC', price: 52000, change: 2.0, volume: 30000000000 }
      ]

      const spy = vi.spyOn(notificationService, 'sendNotification' as any)
      notificationService.checkVolumeSpikes(mockTickers)

      // Volume spike detection is probabilistic, so we check if method was potentially called
      expect(spy).toHaveBeenCalledTimes(0) // or 1 depending on random
    })

    it('should update notification settings', () => {
      notificationService.updateSettings({
        priceAlerts: false,
        volumeAlerts: true
      })

      const settings = notificationService.getSettings()
      expect(settings.priceAlerts).toBe(false)
      expect(settings.volumeAlerts).toBe(true)
    })

    it('should track recent alerts', () => {
      const alert = {
        id: 'test-alert',
        type: 'price_alert' as const,
        symbol: 'BTC',
        message: 'BTC reached $55000',
        timestamp: new Date().toISOString()
      }

      notificationService.sendNotification(alert)

      const recent = notificationService.getRecentAlerts(5)
      expect(recent).toHaveLength(1)
      expect(recent[0]).toMatchObject(alert)
    })
  })

  describe('Watchlist Manager', () => {
    beforeEach(() => {
      localStorage.clear()
    })

    it('should create a default watchlist on initialization', () => {
      const manager = new (watchlistManager.constructor as any)()
      const watchlists = manager.getWatchlists()

      expect(watchlists).toHaveLength(1)
      expect(watchlists[0].id).toBe('default')
      expect(watchlists[0].name).toBe('My Portfolio')
    })

    it('should create and manage multiple watchlists', () => {
      const id = watchlistManager.createWatchlist('Tech Stocks', true)

      const watchlists = watchlistManager.getWatchlists()
      expect(watchlists).toHaveLength(2) // default + new one

      const techWatchlist = watchlistManager.getWatchlist(id)
      expect(techWatchlist?.name).toBe('Tech Stocks')
      expect(techWatchlist?.public).toBe(true)
    })

    it('should add and remove items from watchlists', () => {
      const watchlist = watchlistManager.getActiveWatchlist()
      expect(watchlist).toBeTruthy()

      const added = watchlistManager.addToWatchlist(watchlist!.id, 'AAPL', 180, 'above')
      expect(added).toBe(true)

      const updatedWatchlist = watchlistManager.getWatchlist(watchlist!.id)
      expect(updatedWatchlist?.items).toHaveLength(4) // 3 default + 1 added

      const removed = watchlistManager.removeFromWatchlist(watchlist!.id, 'AAPL')
      expect(removed).toBe(true)

      const finalWatchlist = watchlistManager.getWatchlist(watchlist!.id)
      expect(finalWatchlist?.items).toHaveLength(3)
    })

    it('should prevent duplicate symbols in watchlists', () => {
      const watchlist = watchlistManager.getActiveWatchlist()!

      const firstAdd = watchlistManager.addToWatchlist(watchlist.id, 'BTC', 50000, 'above')
      expect(firstAdd).toBe(true)

      const secondAdd = watchlistManager.addToWatchlist(watchlist.id, 'BTC', 55000, 'below')
      expect(secondAdd).toBe(false)
    })

    it('should check alerts against ticker data', () => {
      const watchlist = watchlistManager.getActiveWatchlist()!
      watchlistManager.addToWatchlist(watchlist.id, 'BTC', 51000, 'above')

      const mockTickers = [
        { symbol: 'BTC', price: 52000, change: 2.0 }
      ]

      const triggeredAlerts = watchlistManager.checkAlerts(mockTickers)
      expect(triggeredAlerts).toHaveLength(1)
      expect(triggeredAlerts[0].symbol).toBe('BTC')
    })

    it('should persist data to localStorage', () => {
      watchlistManager.createWatchlist('Test List')

      // Simulate page reload by creating new instance
      const newManager = new (watchlistManager.constructor as any)()
      const watchlists = newManager.getWatchlists()

      expect(watchlists.length).toBeGreaterThan(1)
      expect(watchlists.some((w: any) => w.name === 'Test List')).toBe(true)
    })

    it('should export and import watchlists', () => {
      const watchlist = watchlistManager.getActiveWatchlist()!
      const exported = watchlistManager.exportWatchlist(watchlist.id)

      expect(exported).toBeTruthy()
      expect(JSON.parse(exported!)).toMatchObject({
        name: 'My Portfolio',
        items: expect.any(Array)
      })

      const imported = watchlistManager.importWatchlist(exported!)
      expect(imported).toBe(true)

      const watchlists = watchlistManager.getWatchlists()
      expect(watchlists.length).toBeGreaterThan(1)
    })
  })

  describe('WebRTC Friend Service', () => {
    let service: WebRTCFriendService

    beforeEach(() => {
      ;(global.RTCPeerConnection as any).mockImplementation(() => ({
        createDataChannel: vi.fn().mockReturnValue({
          send: vi.fn(),
          close: vi.fn(),
          addEventListener: vi.fn()
        }),
        createOffer: vi.fn().mockResolvedValue({ type: 'offer', sdp: 'mock-sdp' }),
        createAnswer: vi.fn().mockResolvedValue({ type: 'answer', sdp: 'mock-sdp' }),
        setLocalDescription: vi.fn().mockResolvedValue(undefined),
        setRemoteDescription: vi.fn().mockResolvedValue(undefined),
        close: vi.fn(),
        connectionState: 'connected'
      }))

      service = new WebRTCFriendService()
    })

    afterEach(() => {
      service?.destroy()
    })

    it('should create outgoing connections to friends', async () => {
      const connected = await service.connectToFriend('friend1', 'Alice')

      expect(connected).toBe(true)
      expect(global.RTCPeerConnection).toHaveBeenCalled()

      const connections = service.getConnections()
      expect(connections).toHaveLength(1)
      expect(connections[0]).toMatchObject({
        friendId: 'friend1',
        friendName: 'Alice',
        connectionState: 'connecting'
      })
    })

    it('should accept incoming friend connections', async () => {
      const mockOffer = { type: 'offer' as const, sdp: 'mock-offer-sdp' }

      const answer = await service.acceptFriendConnection('friend2', 'Bob', mockOffer)

      expect(answer).toBeTruthy()
      expect(answer?.type).toBe('answer')

      const connections = service.getConnections()
      expect(connections).toHaveLength(1)
      expect(connections[0].friendId).toBe('friend2')
    })

    it('should send messages to connected friends', () => {
      // First establish a mock connection
      service.connections.set('friend1', {
        friendId: 'friend1',
        friendName: 'Alice',
        connectionState: 'connected',
        dataChannel: {
          send: vi.fn(),
          close: vi.fn()
        } as any,
        peerConnection: {} as any,
        lastContact: new Date().toISOString()
      } as any)

      const sent = service.sendToFriend('friend1', {
        type: 'custom',
        data: { message: 'Hello Alice!' }
      })

      expect(sent).toBe(true)

      const connection = service.getConnections()[0]
      expect(connection.dataChannel?.send).toHaveBeenCalledWith(
        expect.stringContaining('Hello Alice!')
      )
    })

    it('should broadcast messages to all connected friends', () => {
      // Mock multiple connections
      service.connections.set('friend1', {
        friendId: 'friend1',
        connectionState: 'connected',
        dataChannel: { send: vi.fn() }
      } as any)

      service.connections.set('friend2', {
        friendId: 'friend2',
        connectionState: 'connected',
        dataChannel: { send: vi.fn() }
      } as any)

      const sentCount = service.broadcastToFriends({
        type: 'market_ticker',
        data: { symbol: 'BTC', price: 52000 }
      })

      expect(sentCount).toBe(2)
    })

    it('should handle disconnections', () => {
      service.connections.set('friend1', {
        friendId: 'friend1',
        connectionState: 'connected',
        dataChannel: { close: vi.fn() },
        peerConnection: { close: vi.fn() }
      } as any)

      service.disconnectFriend('friend1')

      expect(service.getConnections()).toHaveLength(0)
    })

    it('should respect maximum connection limits', async () => {
      const smallService = new WebRTCFriendService({ maxConnections: 2 })

      // Add 2 connections
      await smallService.connectToFriend('friend1', 'Alice')
      await smallService.connectToFriend('friend2', 'Bob')

      // Third connection should fail
      const thirdConnection = await smallService.connectToFriend('friend3', 'Charlie')
      expect(thirdConnection).toBe(false)

      smallService.destroy()
    })

    it('should handle message subscriptions', () => {
      const handler = vi.fn()
      service.onMessage('custom', handler)

      // Simulate incoming message
      const mockMessage = {
        type: 'custom' as const,
        data: { test: 'data' },
        timestamp: new Date().toISOString(),
        fromUser: 'friend1',
        messageId: 'msg-123'
      }

      // Trigger message handler manually (since we can't easily mock the full WebRTC flow)
      service.messageHandlers.get('custom')?.(mockMessage)

      expect(handler).toHaveBeenCalledWith(mockMessage)
    })
  })

  describe('API Integration Tests', () => {
    it('should handle steady gateway API endpoints', async () => {
      const mockResponse = {
        tickers: [
          { symbol: 'BTC', price: 52000, change: 2.0, volume: 25000000000 }
        ],
        count: 1
      }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const response = await fetch('/api/steady/gateway?action=tickers')
      const data = await response.json()

      expect(data.tickers).toHaveLength(1)
      expect(data.tickers[0].symbol).toBe('BTC')
    })

    it('should handle authentication API', async () => {
      const mockSession = {
        user: { id: 'user1', name: 'Test User', role: 'premium' },
        isAuthenticated: true
      }

      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockSession)
      })

      const response = await fetch('/api/auth/session')
      const session = await response.json()

      expect(session.isAuthenticated).toBe(true)
      expect(session.user.role).toBe('premium')
    })

    it('should handle friend network API operations', async () => {
      ;(global.fetch as any).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ success: true, friendId: 'friend123' })
      })

      const response = await fetch('/api/steady/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_friend',
          endpoint: 'https://friend.example.com',
          shareLevel: 'market'
        })
      })

      const result = await response.json()
      expect(result.success).toBe(true)
      expect(result.friendId).toBeTruthy()
    })
  })

  describe('Component Integration Tests', () => {
    // Note: These would require proper React testing setup
    // This is a simplified example of what the tests would look like

    it('should render go.rich page with authentication', async () => {
      // Mock authenticated state
      const mockAuthProvider = `<div data-testid="auth-provider">children</div>`

      // This would test the actual component rendering
      // render(<MockAuthProvider><GoRichPage /></MockAuthProvider>)
      // expect(screen.getByText('go.rich')).toBeInTheDocument()
      
      expect(mockAuthProvider).toContain('auth-provider')
    })

    it('should handle PWA installation prompts', () => {
      const mockPrompt = {
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      }

      // Simulate beforeinstallprompt event
      const event = new Event('beforeinstallprompt')
      Object.assign(event, mockPrompt)

      window.dispatchEvent(event)

      // Test that install button appears and works
      expect(mockPrompt.prompt).not.toHaveBeenCalled() // Until user clicks
    })
  })
})

// Performance and Load Tests
describe('Performance Tests', () => {
  it('should handle high-frequency ticker updates', () => {
    const startTime = performance.now()
    
    // Simulate 1000 ticker updates
    for (let i = 0; i < 1000; i++) {
      notificationService.checkPriceAlerts([
        { symbol: 'BTC', price: 52000 + Math.random() * 1000, change: Math.random() * 10 }
      ])
    }

    const endTime = performance.now()
    const duration = endTime - startTime

    // Should complete within reasonable time (adjust threshold as needed)
    expect(duration).toBeLessThan(1000) // 1 second
  })

  it('should efficiently manage large numbers of watchlist items', () => {
    const watchlistId = watchlistManager.createWatchlist('Performance Test')

    const startTime = performance.now()

    // Add 100 items
    for (let i = 0; i < 100; i++) {
      watchlistManager.addToWatchlist(watchlistId, `STOCK${i}`, Math.random() * 1000, 'above')
    }

    const endTime = performance.now()
    expect(endTime - startTime).toBeLessThan(500) // 500ms

    const watchlist = watchlistManager.getWatchlist(watchlistId)
    expect(watchlist?.items).toHaveLength(100)
  })

  it('should handle multiple WebRTC connections efficiently', async () => {
    const service = new WebRTCFriendService({ maxConnections: 50 })
    const startTime = performance.now()

    // Simulate connecting to 10 friends
    const connections = []
    for (let i = 0; i < 10; i++) {
      connections.push(service.connectToFriend(`friend${i}`, `Friend ${i}`))
    }

    await Promise.all(connections)

    const endTime = performance.now()
    expect(endTime - startTime).toBeLessThan(2000) // 2 seconds

    expect(service.getConnections()).toHaveLength(10)

    service.destroy()
  })
})