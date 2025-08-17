'use client'

import { useState, useEffect, useCallback } from 'react'

// =================================================================
// G's TRADING MONITOR TYPES
// =================================================================

export interface GSMarketData {
  // Current Market State
  current_price_usd: number
  gs_per_dollar: number
  market_cap_gs: number
  circulating_supply: number
  
  // Trading Metrics
  volume_24h: number
  price_change_24h: number
  price_change_7d: number
  volatility_index: number
  
  // Supply & Demand
  buy_pressure: number
  sell_pressure: number
  demand_ratio: number
  supply_velocity: number
  
  // Timestamp
  timestamp: string
  block_height: number
}

export interface GSVolatilityAlert {
  id: string
  type: 'price_spike' | 'volume_surge' | 'demand_anomaly' | 'supply_shock'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  value: number
  threshold: number
  timestamp: string
  auto_trade_triggered: boolean
}

export interface GSTradingSignal {
  signal: 'strong_buy' | 'buy' | 'hold' | 'sell' | 'strong_sell'
  confidence: number
  factors: {
    price_momentum: number
    volume_analysis: number
    market_sentiment: number
    technical_indicators: number
  }
  recommendation: string
  target_price: number
  stop_loss: number
}

export interface GSEconomyHealth {
  overall_score: number
  liquidity_health: number
  user_growth_rate: number
  transaction_velocity: number
  market_stability: number
  network_effect_strength: number
  revenue_sustainability: number
}

// =================================================================
// G's TRADING MONITOR HOOK
// =================================================================

export function useFriendsGsTradingMonitor() {
  const [marketData, setMarketData] = useState<GSMarketData | null>(null)
  const [priceHistory, setPriceHistory] = useState<GSMarketData[]>([])
  const [alerts, setAlerts] = useState<GSVolatilityAlert[]>([])
  const [tradingSignal, setTradingSignal] = useState<GSTradingSignal | null>(null)
  const [economyHealth, setEconomyHealth] = useState<GSEconomyHealth | null>(null)
  const [isMonitoring, setIsMonitoring] = useState(false)

  // =================================================================
  // MARKET DATA SIMULATION
  // =================================================================

  const generateMarketData = useCallback((): GSMarketData => {
    const now = new Date()
    const basePrice = 0.025 // Base price: $0.025 per G (40 G's per dollar)
    
    // Add realistic volatility
    const volatility = 0.15 // 15% volatility
    const priceNoise = (Math.random() - 0.5) * volatility * basePrice
    const currentPrice = Math.max(0.001, basePrice + priceNoise)
    
    // Calculate derived metrics
    const gsPerDollar = 1 / currentPrice
    const circulatingSupply = 2850000 + Math.floor(Math.random() * 150000) // ~2.85M G's in circulation
    const marketCap = circulatingSupply * currentPrice
    
    // Trading volumes
    const volume24h = 25000 + Math.floor(Math.random() * 50000) // 25k-75k G's daily volume
    
    // Market pressures
    const buyPressure = 45 + Math.random() * 30 // 45-75%
    const sellPressure = 100 - buyPressure
    const demandRatio = buyPressure / sellPressure
    
    // Price changes (simulated)
    const priceChange24h = (Math.random() - 0.5) * 20 // ±20%
    const priceChange7d = (Math.random() - 0.4) * 35 // Slight upward bias
    
    // Volatility index (0-100)
    const volatilityIndex = Math.min(100, Math.abs(priceChange24h) * 3 + Math.random() * 20)
    
    return {
      current_price_usd: currentPrice,
      gs_per_dollar: gsPerDollar,
      market_cap_gs: marketCap,
      circulating_supply: circulatingSupply,
      volume_24h: volume24h,
      price_change_24h: priceChange24h,
      price_change_7d: priceChange7d,
      volatility_index: volatilityIndex,
      buy_pressure: buyPressure,
      sell_pressure: sellPressure,
      demand_ratio: demandRatio,
      supply_velocity: 2.5 + Math.random() * 2, // G's velocity
      timestamp: now.toISOString(),
      block_height: 847392 + Math.floor((now.getTime() - new Date('2025-01-01').getTime()) / 60000) // Block every minute
    }
  }, [])

  // =================================================================
  // TRADING SIGNAL ANALYSIS
  // =================================================================

  const analyzeTradingSignal = useCallback((data: GSMarketData, history: GSMarketData[]): GSTradingSignal => {
    if (history.length < 10) {
      return {
        signal: 'hold',
        confidence: 0.1,
        factors: { price_momentum: 0, volume_analysis: 0, market_sentiment: 0, technical_indicators: 0 },
        recommendation: 'Insufficient data for trading signal',
        target_price: data.current_price_usd,
        stop_loss: data.current_price_usd * 0.95
      }
    }

    // Price momentum analysis
    const recentPrices = history.slice(-10).map(d => d.current_price_usd)
    const priceTrend = recentPrices[recentPrices.length - 1] - recentPrices[0]
    const priceMomentum = Math.min(1, Math.abs(priceTrend) / (recentPrices[0] * 0.1)) * Math.sign(priceTrend)

    // Volume analysis
    const avgVolume = history.slice(-10).reduce((sum, d) => sum + d.volume_24h, 0) / 10
    const volumeRatio = data.volume_24h / avgVolume
    const volumeAnalysis = Math.min(1, (volumeRatio - 1) * 2) // Normalize volume surge

    // Market sentiment (demand ratio + volatility)
    const sentimentScore = (data.demand_ratio - 1) * 0.5 - (data.volatility_index / 100) * 0.3
    const marketSentiment = Math.max(-1, Math.min(1, sentimentScore))

    // Technical indicators (simplified RSI-like)
    const rsiValue = 50 + (data.price_change_24h * 2) // Simplified RSI
    const technicalIndicators = (rsiValue > 70) ? -0.5 : (rsiValue < 30) ? 0.5 : 0

    // Combine factors
    const overallScore = (priceMomentum * 0.3 + volumeAnalysis * 0.2 + marketSentiment * 0.3 + technicalIndicators * 0.2)
    const confidence = Math.min(0.95, Math.abs(overallScore) + 0.1)

    // Determine signal
    let signal: GSTradingSignal['signal']
    if (overallScore > 0.6) signal = 'strong_buy'
    else if (overallScore > 0.2) signal = 'buy'
    else if (overallScore < -0.6) signal = 'strong_sell'
    else if (overallScore < -0.2) signal = 'sell'
    else signal = 'hold'

    return {
      signal,
      confidence,
      factors: {
        price_momentum: priceMomentum,
        volume_analysis: volumeAnalysis,
        market_sentiment: marketSentiment,
        technical_indicators: technicalIndicators
      },
      recommendation: generateRecommendation(signal, confidence, data),
      target_price: data.current_price_usd * (1 + overallScore * 0.1),
      stop_loss: data.current_price_usd * 0.95
    }
  }, [])

  // =================================================================
  // VOLATILITY ALERTS
  // =================================================================

  const checkVolatilityAlerts = useCallback((data: GSMarketData, history: GSMarketData[]): GSVolatilityAlert[] => {
    const newAlerts: GSVolatilityAlert[] = []

    // Price spike detection
    if (Math.abs(data.price_change_24h) > 15) {
      newAlerts.push({
        id: `price_spike_${Date.now()}`,
        type: 'price_spike',
        severity: Math.abs(data.price_change_24h) > 25 ? 'critical' : 'high',
        message: `G's price ${data.price_change_24h > 0 ? 'surged' : 'crashed'} ${Math.abs(data.price_change_24h).toFixed(1)}% in 24h`,
        value: data.price_change_24h,
        threshold: 15,
        timestamp: data.timestamp,
        auto_trade_triggered: Math.abs(data.price_change_24h) > 20
      })
    }

    // Volume surge detection
    if (history.length > 5) {
      const avgVolume = history.slice(-5).reduce((sum, d) => sum + d.volume_24h, 0) / 5
      const volumeIncrease = ((data.volume_24h - avgVolume) / avgVolume) * 100
      
      if (volumeIncrease > 50) {
        newAlerts.push({
          id: `volume_surge_${Date.now()}`,
          type: 'volume_surge',
          severity: volumeIncrease > 100 ? 'high' : 'medium',
          message: `Trading volume surged ${volumeIncrease.toFixed(1)}% above 5-day average`,
          value: volumeIncrease,
          threshold: 50,
          timestamp: data.timestamp,
          auto_trade_triggered: false
        })
      }
    }

    // Demand anomaly detection
    if (data.demand_ratio > 2.5 || data.demand_ratio < 0.4) {
      newAlerts.push({
        id: `demand_anomaly_${Date.now()}`,
        type: 'demand_anomaly',
        severity: 'medium',
        message: `Extreme ${data.demand_ratio > 2.5 ? 'buy' : 'sell'} pressure detected (${(data.demand_ratio * 100).toFixed(0)}% demand ratio)`,
        value: data.demand_ratio,
        threshold: data.demand_ratio > 2.5 ? 2.5 : 0.4,
        timestamp: data.timestamp,
        auto_trade_triggered: false
      })
    }

    // Volatility index alerts
    if (data.volatility_index > 80) {
      newAlerts.push({
        id: `volatility_${Date.now()}`,
        type: 'supply_shock',
        severity: data.volatility_index > 90 ? 'critical' : 'high',
        message: `Market volatility reached ${data.volatility_index.toFixed(0)}% - extreme turbulence detected`,
        value: data.volatility_index,
        threshold: 80,
        timestamp: data.timestamp,
        auto_trade_triggered: data.volatility_index > 90
      })
    }

    return newAlerts
  }, [])

  // =================================================================
  // ECONOMY HEALTH CALCULATION
  // =================================================================

  const calculateEconomyHealth = useCallback((data: GSMarketData, history: GSMarketData[]): GSEconomyHealth => {
    // Liquidity health (based on volume and spread)
    const liquidityHealth = Math.min(100, (data.volume_24h / 50000) * 100) // Target: 50k daily volume

    // User growth rate (simulated based on volume trends)
    const userGrowthRate = history.length > 7 
      ? Math.max(0, ((data.volume_24h / history[history.length - 7].volume_24h) - 1) * 100 + 5)
      : 5

    // Transaction velocity
    const transactionVelocity = Math.min(100, data.supply_velocity * 20) // Target: 5x velocity

    // Market stability (inverse of volatility)
    const marketStability = Math.max(0, 100 - data.volatility_index)

    // Network effect strength (based on demand ratio and volume)
    const networkEffect = Math.min(100, (data.demand_ratio * 30) + (data.volume_24h / 1000))

    // Revenue sustainability (based on transaction fees and growth)
    const revenueSustainability = Math.min(100, (data.volume_24h * 0.1 * data.current_price_usd * 365 / 1000) * 10) // Annual revenue projection

    // Overall health score
    const overallScore = (liquidityHealth * 0.2 + userGrowthRate * 0.15 + transactionVelocity * 0.15 + 
                         marketStability * 0.2 + networkEffect * 0.15 + revenueSustainability * 0.15)

    return {
      overall_score: overallScore,
      liquidity_health: liquidityHealth,
      user_growth_rate: userGrowthRate,
      transaction_velocity: transactionVelocity,
      market_stability: marketStability,
      network_effect_strength: networkEffect,
      revenue_sustainability: revenueSustainability
    }
  }, [])

  // =================================================================
  // MONITORING LOOP
  // =================================================================

  const startMonitoring = useCallback(() => {
    setIsMonitoring(true)
    
    const updateData = () => {
      const newData = generateMarketData()
      setMarketData(newData)
      
      setPriceHistory(prev => {
        const updated = [...prev, newData]
        // Keep last 100 data points
        return updated.slice(-100)
      })
      
      // Update alerts
      const newAlerts = checkVolatilityAlerts(newData, priceHistory)
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)) // Keep last 50 alerts
      }
      
      // Update trading signal
      const signal = analyzeTradingSignal(newData, priceHistory)
      setTradingSignal(signal)
      
      // Update economy health
      const health = calculateEconomyHealth(newData, priceHistory)
      setEconomyHealth(health)
    }
    
    // Initial update
    updateData()
    
    // Set up interval for real-time updates
    const interval = setInterval(updateData, 5000) // Update every 5 seconds
    
    return () => {
      clearInterval(interval)
      setIsMonitoring(false)
    }
  }, [generateMarketData, checkVolatilityAlerts, analyzeTradingSignal, calculateEconomyHealth, priceHistory])

  const stopMonitoring = useCallback(() => {
    setIsMonitoring(false)
  }, [])

  // =================================================================
  // HELPER FUNCTIONS
  // =================================================================

  const getMarketTrend = useCallback(() => {
    if (!marketData) return 'neutral'
    
    if (marketData.price_change_24h > 5) return 'strong_bullish'
    if (marketData.price_change_24h > 1) return 'bullish'
    if (marketData.price_change_24h < -5) return 'strong_bearish'
    if (marketData.price_change_24h < -1) return 'bearish'
    return 'neutral'
  }, [marketData])

  const formatPrice = useCallback((price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 4,
      maximumFractionDigits: 6
    }).format(price)
  }, [])

  const formatGs = useCallback((gs: number) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(gs) + ' G'
  }, [])

  return {
    // Data
    marketData,
    priceHistory,
    alerts,
    tradingSignal,
    economyHealth,
    
    // Status
    isMonitoring,
    
    // Controls
    startMonitoring,
    stopMonitoring,
    
    // Helpers
    getMarketTrend,
    formatPrice,
    formatGs
  }
}

// =================================================================
// HELPER FUNCTIONS
// =================================================================

function generateRecommendation(signal: GSTradingSignal['signal'], confidence: number, data: GSMarketData): string {
  const confidenceLevel = confidence > 0.8 ? 'High' : confidence > 0.5 ? 'Medium' : 'Low'
  
  switch (signal) {
    case 'strong_buy':
      return `${confidenceLevel} confidence STRONG BUY. Market showing strong bullish signals with ${data.gs_per_dollar.toFixed(1)} G's per dollar.`
    case 'buy':
      return `${confidenceLevel} confidence BUY. Positive momentum detected, consider accumulating G's.`
    case 'strong_sell':
      return `${confidenceLevel} confidence STRONG SELL. Market showing bearish signals, consider taking profits.`
    case 'sell':
      return `${confidenceLevel} confidence SELL. Negative momentum, consider reducing G's exposure.`
    default:
      return `${confidenceLevel} confidence HOLD. Market in consolidation phase, wait for clearer signals.`
  }
}

export type { GSMarketData, GSVolatilityAlert, GSTradingSignal, GSEconomyHealth }