import { useCallback, useEffect, useRef, useState } from 'react'
import { useFriendsCore } from './use_friends_core'

export interface FriendsGBalance {
  balance: number
  earned: number
  spent: number
  pending: number
  lastUpdated: Date
}

export interface BandwidthOffer {
  id: string
  providerId: string
  providerName: string
  availableBandwidth: number // Kbps
  pricePerMB: number // G's per MB
  qualityRating: number // 1-5 stars
  location: {
    lat: number
    lng: number
    accuracy: number
  }
  connectionType: 'wifi' | 'cellular' | 'ethernet'
  reliability: number // 0-100%
  maxDataLimit: number // MB per session
  estimatedLatency: number // ms
  isActive: boolean
  createdAt: Date
  expiresAt: Date
}

export interface BandwidthTransaction {
  id: string
  type: 'share' | 'consume'
  providerId: string
  consumerId: string
  dataTransferred: number // MB
  duration: number // seconds
  gsEarned: number
  gsSpent: number
  platformFee: number // 10% of transaction
  qualityScore: number // 1-5 based on connection performance
  startTime: Date
  endTime?: Date
  status: 'active' | 'completed' | 'failed' | 'cancelled'
  metadata: {
    avgBandwidth: number
    peakBandwidth: number
    dropouts: number
    latency: number
  }
}

export interface ConnectionRelay {
  id: string
  providerId: string
  consumerId: string
  relayPeerId: string
  isActive: boolean
  bandwidth: {
    allocated: number
    used: number
    available: number
  }
  quality: {
    latency: number
    jitter: number
    packetLoss: number
    stability: number
  }
  limits: {
    maxBandwidth: number
    maxDuration: number
    maxData: number
  }
  earnings: {
    gsPerMB: number
    totalEarned: number
    platformFee: number
  }
}

export interface BandwidthSharingOptions {
  enableSharing?: boolean
  enableConsuming?: boolean
  maxShareBandwidth?: number // Kbps
  maxSpendPerSession?: number // G's
  autoAcceptPrice?: number // auto-accept offers below this price
  minQualityRating?: number // minimum provider rating
  maxLatency?: number // ms
}

const PLATFORM_FEE_RATE = 0.1 // 10%
const G_SYMBOL = 'G' // Friends G's
const BASE_PRICE_PER_MB = 0.1 // base G price

export const useFriendsBandwidthEconomy = (options: BandwidthSharingOptions = {}) => {
  const {
    enableSharing = false,
    enableConsuming = true,
    maxShareBandwidth = 1000, // 1 Mbps default
    maxSpendPerSession = 50,
    autoAcceptPrice = 0.05,
    minQualityRating = 3.0,
    maxLatency = 200
  } = options

  const { emit, subscribe } = useFriendsCore('FriendsBandwidthEconomy')
  
  const [gBalance, setGBalance] = useState<FriendsGBalance>({
    balance: 0,
    earned: 0,
    spent: 0,
    pending: 0,
    lastUpdated: new Date()
  })

  const [availableOffers, setAvailableOffers] = useState<BandwidthOffer[]>([])
  const [activeTransactions, setActiveTransactions] = useState<BandwidthTransaction[]>([])
  const [connectionRelays, setConnectionRelays] = useState<ConnectionRelay[]>([])
  const [myOffers, setMyOffers] = useState<BandwidthOffer[]>([])

  const bandwidthMonitor = useRef<{
    used: number
    shared: number
    startTime: Date
  }>({
    used: 0,
    shared: 0,
    startTime: new Date()
  })

  const createBandwidthOffer = useCallback(async (
    availableBandwidth: number,
    pricePerMB: number,
    maxDataLimit: number,
    duration: number // minutes
  ) => {
    try {
      // Get current location
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000
        })
      })

      // Test connection quality
      const connectionTest = await testConnectionQuality()
      
      const offer: BandwidthOffer = {
        id: `offer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        providerId: 'self',
        providerName: 'You',
        availableBandwidth,
        pricePerMB,
        qualityRating: 5.0, // New providers start with 5 stars
        location: {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy
        },
        connectionType: connectionTest.type,
        reliability: connectionTest.reliability,
        maxDataLimit,
        estimatedLatency: connectionTest.latency,
        isActive: true,
        createdAt: new Date(),
        expiresAt: new Date(Date.now() + duration * 60 * 1000)
      }

      setMyOffers(prev => [...prev, offer])
      emit('bandwidth:offer:created', offer)

      return offer
    } catch (error) {
      emit('bandwidth:offer:error', { error: error.message })
      throw error
    }
  }, [emit])

  const purchaseBandwidth = useCallback(async (
    offerId: string,
    requiredBandwidth: number,
    estimatedDataUsage: number
  ) => {
    const offer = availableOffers.find(o => o.id === offerId)
    if (!offer) throw new Error('Offer not found')

    const estimatedCost = estimatedDataUsage * offer.pricePerMB
    const platformFee = estimatedCost * PLATFORM_FEE_RATE
    const totalCost = estimatedCost + platformFee

    if (gBalance.balance < totalCost) {
      throw new Error('Insufficient G balance')
    }

    const transaction: BandwidthTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'consume',
      providerId: offer.providerId,
      consumerId: 'self',
      dataTransferred: 0,
      duration: 0,
      gsEarned: 0,
      gsSpent: totalCost,
      platformFee,
      qualityScore: 0,
      startTime: new Date(),
      status: 'active',
      metadata: {
        avgBandwidth: 0,
        peakBandwidth: 0,
        dropouts: 0,
        latency: offer.estimatedLatency
      }
    }

    setActiveTransactions(prev => [...prev, transaction])
    setGBalance(prev => ({
      ...prev,
      balance: prev.balance - totalCost,
      pending: prev.pending + totalCost
    }))

    emit('bandwidth:purchase:started', { transaction, offer })
    return transaction
  }, [availableOffers, gBalance, emit])

  const acceptBandwidthRequest = useCallback(async (requestId: string) => {
    // Accept incoming bandwidth sharing request
    const relay: ConnectionRelay = {
      id: `relay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      providerId: 'self',
      consumerId: requestId,
      relayPeerId: requestId,
      isActive: true,
      bandwidth: {
        allocated: maxShareBandwidth,
        used: 0,
        available: maxShareBandwidth
      },
      quality: {
        latency: 0,
        jitter: 0,
        packetLoss: 0,
        stability: 100
      },
      limits: {
        maxBandwidth: maxShareBandwidth,
        maxDuration: 3600, // 1 hour
        maxData: 1000 // 1GB
      },
      earnings: {
        gsPerMB: BASE_PRICE_PER_MB,
        totalEarned: 0,
        platformFee: 0
      }
    }

    setConnectionRelays(prev => [...prev, relay])
    emit('bandwidth:sharing:started', relay)

    return relay
  }, [maxShareBandwidth, emit])

  const calculateEarnings = useCallback((
    dataTransferred: number,
    pricePerMB: number,
    qualityBonus = 0
  ) => {
    const baseEarnings = dataTransferred * pricePerMB
    const bonusEarnings = baseEarnings * qualityBonus
    const totalEarnings = baseEarnings + bonusEarnings
    const platformFee = totalEarnings * PLATFORM_FEE_RATE
    const netEarnings = totalEarnings - platformFee

    return {
      baseEarnings,
      bonusEarnings,
      totalEarnings,
      platformFee,
      netEarnings
    }
  }, [])

  const updateBandwidthUsage = useCallback((
    relayId: string,
    bytesTransferred: number,
    currentBandwidth: number,
    latency: number
  ) => {
    setConnectionRelays(prev => prev.map(relay => {
      if (relay.id !== relayId) return relay

      const dataInMB = bytesTransferred / (1024 * 1024)
      const earnings = calculateEarnings(dataInMB, relay.earnings.gsPerMB)

      return {
        ...relay,
        bandwidth: {
          ...relay.bandwidth,
          used: relay.bandwidth.used + bytesTransferred,
          available: Math.max(0, relay.bandwidth.allocated - currentBandwidth)
        },
        quality: {
          ...relay.quality,
          latency: (relay.quality.latency + latency) / 2
        },
        earnings: {
          ...relay.earnings,
          totalEarned: relay.earnings.totalEarned + earnings.netEarnings,
          platformFee: relay.earnings.platformFee + earnings.platformFee
        }
      }
    }))

    // Update G balance
    setGBalance(prev => {
      const dataInMB = bytesTransferred / (1024 * 1024)
      const earnings = calculateEarnings(dataInMB, BASE_PRICE_PER_MB)
      
      return {
        ...prev,
        balance: prev.balance + earnings.netEarnings,
        earned: prev.earned + earnings.netEarnings,
        lastUpdated: new Date()
      }
    })

    emit('bandwidth:usage:updated', {
      relayId,
      bytesTransferred,
      currentBandwidth,
      latency
    })
  }, [calculateEarnings, emit])

  const testConnectionQuality = useCallback(async () => {
    const startTime = performance.now()
    
    try {
      // Test connection speed and quality
      const testData = new Uint8Array(1024 * 100) // 100KB test
      const testBlob = new Blob([testData])
      
      const response = await fetch('/api/speed-test', {
        method: 'POST',
        body: testBlob
      })

      const endTime = performance.now()
      const latency = endTime - startTime

      // Determine connection type
      const connection = (navigator as any).connection
      const connectionType = connection?.effectiveType || 'unknown'

      return {
        latency,
        type: connectionType.includes('wifi') ? 'wifi' as const : 'cellular' as const,
        reliability: Math.min(100, Math.max(0, 100 - (latency / 10))),
        bandwidth: connection?.downlink || 1000
      }
    } catch (error) {
      return {
        latency: 999,
        type: 'cellular' as const,
        reliability: 50,
        bandwidth: 100
      }
    }
  }, [])

  const getMarketplaceOffers = useCallback((
    maxPrice?: number,
    minBandwidth?: number,
    maxDistance?: number // km
  ) => {
    return availableOffers.filter(offer => {
      if (!offer.isActive) return false
      if (maxPrice && offer.pricePerMB > maxPrice) return false
      if (minBandwidth && offer.availableBandwidth < minBandwidth) return false
      if (offer.qualityRating < minQualityRating) return false
      
      // Distance filtering would require current location
      return true
    }).sort((a, b) => {
      // Sort by best value (quality/price ratio)
      const aValue = a.qualityRating / a.pricePerMB
      const bValue = b.qualityRating / b.pricePerMB
      return bValue - aValue
    })
  }, [availableOffers, minQualityRating])

  const getEarningsReport = useCallback(() => {
    const totalSharedMB = connectionRelays.reduce((sum, relay) => 
      sum + (relay.bandwidth.used / (1024 * 1024)), 0
    )
    
    const totalEarned = connectionRelays.reduce((sum, relay) => 
      sum + relay.earnings.totalEarned, 0
    )
    
    const totalPlatformFees = connectionRelays.reduce((sum, relay) => 
      sum + relay.earnings.platformFee, 0
    )

    return {
      totalSharedMB,
      totalEarned,
      totalPlatformFees,
      averagePricePerMB: totalSharedMB > 0 ? totalEarned / totalSharedMB : 0,
      activeConnections: connectionRelays.filter(r => r.isActive).length,
      qualityRating: calculateAverageQuality()
    }
  }, [connectionRelays])

  const calculateAverageQuality = useCallback(() => {
    const activeRelays = connectionRelays.filter(r => r.isActive)
    if (activeRelays.length === 0) return 5.0

    const avgLatency = activeRelays.reduce((sum, r) => sum + r.quality.latency, 0) / activeRelays.length
    const avgStability = activeRelays.reduce((sum, r) => sum + r.quality.stability, 0) / activeRelays.length
    
    // Quality score based on latency and stability
    const latencyScore = Math.max(1, 5 - (avgLatency / 50))
    const stabilityScore = avgStability / 20
    
    return Math.min(5, (latencyScore + stabilityScore) / 2)
  }, [connectionRelays])

  useEffect(() => {
    // Subscribe to bandwidth sharing events
    const unsubscribeBandwidthRequest = subscribe('bandwidth:request:received', (event) => {
      const { requesterId, requiredBandwidth, maxPrice } = event.data
      
      if (enableSharing && requiredBandwidth <= maxShareBandwidth && maxPrice >= BASE_PRICE_PER_MB) {
        // Auto-accept if within limits
        acceptBandwidthRequest(requesterId)
      }
    })

    const unsubscribeOfferUpdate = subscribe('bandwidth:offer:updated', (event) => {
      setAvailableOffers(prev => {
        const updated = prev.map(offer => 
          offer.id === event.data.id ? { ...offer, ...event.data } : offer
        )
        return updated
      })
    })

    return () => {
      unsubscribeBandwidthRequest()
      unsubscribeOfferUpdate()
    }
  }, [subscribe, enableSharing, maxShareBandwidth, acceptBandwidthRequest])

  return {
    // G Balance & Economy
    gBalance,
    
    // Marketplace
    availableOffers: getMarketplaceOffers(),
    myOffers,
    createBandwidthOffer,
    purchaseBandwidth,
    
    // Sharing & Relaying
    connectionRelays,
    acceptBandwidthRequest,
    updateBandwidthUsage,
    
    // Analytics
    getEarningsReport,
    calculateAverageQuality,
    testConnectionQuality,
    
    // Transactions
    activeTransactions,
    calculateEarnings
  }
}

export const useFriendsBandwidthBroker = () => {
  const { emit, subscribe } = useFriendsCore('FriendsBandwidthBroker')
  
  const [marketStats, setMarketStats] = useState({
    totalVolume: 0, // MB traded
    averagePrice: BASE_PRICE_PER_MB,
    activeProviders: 0,
    totalEarnings: 0,
    platformRevenue: 0
  })

  const discoverNearbyProviders = useCallback(async (radius = 5000) => {
    // Discover bandwidth providers within radius (meters)
    emit('bandwidth:discovery:started', { radius })
    
    // Mock discovery - in real implementation would use P2P discovery
    return new Promise<BandwidthOffer[]>((resolve) => {
      setTimeout(() => {
        const mockOffers: BandwidthOffer[] = [
          {
            id: 'provider_1',
            providerId: 'peer_alice',
            providerName: 'Alice',
            availableBandwidth: 2000,
            pricePerMB: 0.08,
            qualityRating: 4.2,
            location: { lat: 0, lng: 0, accuracy: 100 },
            connectionType: 'wifi',
            reliability: 95,
            maxDataLimit: 500,
            estimatedLatency: 45,
            isActive: true,
            createdAt: new Date(Date.now() - 5 * 60 * 1000),
            expiresAt: new Date(Date.now() + 55 * 60 * 1000)
          }
        ]
        
        resolve(mockOffers)
      }, 2000)
    })
  }, [emit])

  const processTransaction = useCallback((transaction: BandwidthTransaction) => {
    // Process completed transaction and distribute G's
    const platformFee = transaction.gsSpent * PLATFORM_FEE_RATE
    const providerEarnings = transaction.gsSpent - platformFee

    setMarketStats(prev => ({
      ...prev,
      totalVolume: prev.totalVolume + transaction.dataTransferred,
      platformRevenue: prev.platformRevenue + platformFee,
      totalEarnings: prev.totalEarnings + providerEarnings
    }))

    emit('bandwidth:transaction:processed', {
      transactionId: transaction.id,
      platformFee,
      providerEarnings
    })
  }, [emit])

  return {
    marketStats,
    discoverNearbyProviders,
    processTransaction
  }
}