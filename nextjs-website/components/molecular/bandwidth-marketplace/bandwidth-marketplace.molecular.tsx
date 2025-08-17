"use client"

import React, { useEffect, useState } from 'react'
import { useFriendsBandwidthEconomy, useFriendsBandwidthBroker } from '@/hooks/perf/use_friends_bandwidth_economy'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export interface BandwidthMarketplaceProps {
  className?: string
  maxOffers?: number
  autoRefresh?: boolean
}

export const BandwidthMarketplace: React.FC<BandwidthMarketplaceProps> = ({
  className = '',
  maxOffers = 10,
  autoRefresh = true
}) => {
  const {
    tokenBalance,
    availableOffers,
    createBandwidthOffer,
    purchaseBandwidth,
    connectionRelays,
    getEarningsReport
  } = useFriendsBandwidthEconomy({
    enableSharing: true,
    enableConsuming: true,
    maxShareBandwidth: 2000,
    autoAcceptPrice: 0.05
  })

  const {
    marketStats,
    discoverNearbyProviders
  } = useFriendsBandwidthBroker()

  const [isCreatingOffer, setIsCreatingOffer] = useState(false)
  const [selectedOffer, setSelectedOffer] = useState<string | null>(null)
  const [newOfferData, setNewOfferData] = useState({
    bandwidth: 1000,
    pricePerMB: 0.08,
    maxData: 500,
    duration: 60
  })

  const earningsReport = getEarningsReport()

  const handleCreateOffer = async () => {
    setIsCreatingOffer(true)
    try {
      await createBandwidthOffer(
        newOfferData.bandwidth,
        newOfferData.pricePerMB,
        newOfferData.maxData,
        newOfferData.duration
      )
      setNewOfferData({ bandwidth: 1000, pricePerMB: 0.08, maxData: 500, duration: 60 })
    } catch (error) {
      console.error('Failed to create offer:', error)
    } finally {
      setIsCreatingOffer(false)
    }
  }

  const handlePurchase = async (offerId: string) => {
    setSelectedOffer(offerId)
    try {
      await purchaseBandwidth(offerId, 500, 100) // 500 Kbps, 100MB estimated
    } catch (error) {
      console.error('Failed to purchase bandwidth:', error)
    } finally {
      setSelectedOffer(null)
    }
  }

  const getQualityBadgeVariant = (rating: number) => {
    if (rating >= 4.5) return 'default'
    if (rating >= 3.5) return 'secondary'
    if (rating >= 2.5) return 'outline'
    return 'destructive'
  }

  const getConnectionTypeBadge = (type: string) => {
    const variants = {
      wifi: 'default',
      ethernet: 'default', 
      cellular: 'secondary'
    }
    return variants[type as keyof typeof variants] || 'outline'
  }

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        discoverNearbyProviders(5000)
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [autoRefresh, discoverNearbyProviders])

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="glass-card-subtle">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl">🪙</div>
              <div>
                <div className="text-sm text-gray-600">Token Balance</div>
                <div className="text-lg font-semibold">{tokenBalance.balance.toFixed(2)} FRT</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-subtle">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl">📈</div>
              <div>
                <div className="text-sm text-gray-600">Total Earned</div>
                <div className="text-lg font-semibold text-green-600">
                  +{earningsReport.totalEarned.toFixed(2)} FRT
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-subtle">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl">🔗</div>
              <div>
                <div className="text-sm text-gray-600">Active Connections</div>
                <div className="text-lg font-semibold">{earningsReport.activeConnections}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card-subtle">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <div className="text-2xl">⭐</div>
              <div>
                <div className="text-sm text-gray-600">Quality Rating</div>
                <div className="text-lg font-semibold">{earningsReport.qualityRating.toFixed(1)}/5.0</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Bandwidth Offer */}
      <Card className="glass-card-default">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            📡 Share Your Connection
            <Badge variant="outline">Earn FRT Tokens</Badge>
          </CardTitle>
          <CardDescription>
            Share your internet connection and earn tokens from nearby friends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="text-sm font-medium">Bandwidth (Kbps)</label>
              <input
                type="number"
                value={newOfferData.bandwidth}
                onChange={(e) => setNewOfferData(prev => ({ ...prev, bandwidth: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                min="100"
                max="10000"
                step="100"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Price per MB</label>
              <input
                type="number"
                value={newOfferData.pricePerMB}
                onChange={(e) => setNewOfferData(prev => ({ ...prev, pricePerMB: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                min="0.01"
                max="1.0"
                step="0.01"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Max Data (MB)</label>
              <input
                type="number"
                value={newOfferData.maxData}
                onChange={(e) => setNewOfferData(prev => ({ ...prev, maxData: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                min="50"
                max="5000"
                step="50"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Duration (min)</label>
              <input
                type="number"
                value={newOfferData.duration}
                onChange={(e) => setNewOfferData(prev => ({ ...prev, duration: Number(e.target.value) }))}
                className="w-full mt-1 px-3 py-2 border rounded-lg"
                min="15"
                max="240"
                step="15"
              />
            </div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg mb-4">
            <div className="text-sm text-blue-800">
              <strong>Estimated earnings:</strong> ~{(newOfferData.maxData * newOfferData.pricePerMB * 0.9).toFixed(2)} FRT 
              <span className="text-xs ml-2">(10% platform fee included)</span>
            </div>
          </div>

          <Button 
            onClick={handleCreateOffer}
            disabled={isCreatingOffer}
            className="w-full"
          >
            {isCreatingOffer ? 'Creating Offer...' : 'Share Connection & Earn'}
          </Button>
        </CardContent>
      </Card>

      {/* Available Bandwidth Offers */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Available Connections</h2>
          <Badge variant="outline">{availableOffers.length} offers nearby</Badge>
        </div>

        {availableOffers.length === 0 ? (
          <Card className="glass-card-subtle">
            <CardContent className="p-8 text-center">
              <div className="text-4xl mb-4">🔍</div>
              <div className="text-gray-600">No bandwidth offers available nearby</div>
              <div className="text-sm text-gray-500 mt-2">
                Check back later or enable location sharing to find more providers
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableOffers.slice(0, maxOffers).map((offer) => (
              <Card key={offer.id} className="glass-card-default hover:glass-card-elevated transition-all">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{offer.providerName}</CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Badge variant={getQualityBadgeVariant(offer.qualityRating)}>
                          ⭐ {offer.qualityRating.toFixed(1)}
                        </Badge>
                        <Badge variant={getConnectionTypeBadge(offer.connectionType)}>
                          {offer.connectionType}
                        </Badge>
                      </CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{offer.pricePerMB.toFixed(3)} FRT</div>
                      <div className="text-xs text-gray-500">per MB</div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Bandwidth:</span>
                    <span className="font-medium">{offer.availableBandwidth} Kbps</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Max Data:</span>
                    <span className="font-medium">{offer.maxDataLimit} MB</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Latency:</span>
                    <span className="font-medium">{offer.estimatedLatency}ms</span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Reliability:</span>
                    <div className="flex items-center gap-2">
                      <Progress value={offer.reliability} className="w-16 h-2" />
                      <span className="text-xs">{offer.reliability}%</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <Button
                      onClick={() => handlePurchase(offer.id)}
                      disabled={selectedOffer === offer.id || tokenBalance.balance < 10}
                      className="w-full"
                      size="sm"
                    >
                      {selectedOffer === offer.id ? 'Connecting...' : 'Connect & Pay'}
                    </Button>
                    
                    {tokenBalance.balance < 10 && (
                      <div className="text-xs text-red-500 mt-1 text-center">
                        Insufficient token balance
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Active Connections */}
      {connectionRelays.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-4">Active Connections</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {connectionRelays.map((relay) => (
              <Card key={relay.id} className="glass-card-elevated">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    🔗 Connection Relay
                    <Badge variant="default" className="animate-pulse">
                      Active
                    </Badge>
                  </CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Data Shared:</span>
                    <span className="font-medium">
                      {(relay.bandwidth.used / (1024 * 1024)).toFixed(1)} MB
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Bandwidth Usage:</span>
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(relay.bandwidth.used / relay.bandwidth.allocated) * 100} 
                        className="w-20 h-2" 
                      />
                      <span className="text-xs">
                        {((relay.bandwidth.used / relay.bandwidth.allocated) * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Earned:</span>
                    <span className="font-medium text-green-600">
                      +{relay.earnings.totalEarned.toFixed(3)} FRT
                    </span>
                  </div>
                  
                  <div className="flex justify-between text-sm">
                    <span>Quality:</span>
                    <span className="font-medium">{relay.quality.latency.toFixed(0)}ms latency</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}