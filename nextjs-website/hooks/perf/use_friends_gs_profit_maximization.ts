'use client'

import { useState, useEffect, useCallback } from 'react'

// =================================================================
// G's PROFIT MAXIMIZATION TYPES
// =================================================================

export interface GSHashrateMetrics {
  // Core Performance (like mining h/s)
  gs_per_second: number          // G's earning rate per second
  gs_per_hour: number           // G's earning rate per hour
  gs_per_day: number            // G's earning rate per day
  bandwidth_hashrate_mbps: number // MB/s bandwidth capacity
  effective_hashrate: number     // Efficiency-adjusted earning rate
  
  // Efficiency Metrics
  power_efficiency: number       // G's per watt equivalent
  cost_efficiency: number        // G's per dollar invested
  time_efficiency: number        // G's per minute active
  network_efficiency: number     // Share of total network capacity
  
  // Performance Indicators
  uptime_percentage: number      // System availability
  latency_ms: number            // Response time
  quality_score: number         // Connection quality (0-100)
  reliability_index: number     // Consistency rating
}

export interface GSMiningModel {
  model_name: string
  model_type: 'basic' | 'premium' | 'enterprise' | 'legendary'
  
  // Investment Requirements
  initial_investment_gs: number
  monthly_cost_gs: number
  setup_time_hours: number
  
  // Performance Specs
  base_hashrate: GSHashrateMetrics
  boosted_hashrate: GSHashrateMetrics
  max_theoretical_hashrate: GSHashrateMetrics
  
  // Economic Projections
  daily_profit_estimate: number
  monthly_profit_estimate: number
  break_even_days: number
  roi_percentage_30d: number
  roi_percentage_90d: number
  roi_percentage_365d: number
  
  // Operational Stats
  maintenance_required: boolean
  upgrade_compatibility: string[]
  exclusive_features: string[]
  user_level_required: number
}

export interface GSProfitProjection {
  timeframe: '24h' | '7d' | '30d' | '90d' | '365d'
  
  // Revenue Projections
  gross_earnings_gs: number
  net_earnings_gs: number
  platform_fees_gs: number
  operational_costs_gs: number
  
  // Growth Scenarios
  conservative_projection: number
  realistic_projection: number
  optimistic_projection: number
  bull_market_projection: number
  
  // Risk Assessment
  risk_level: 'low' | 'medium' | 'high'
  volatility_impact: number
  market_dependency: number
  confidence_score: number
}

export interface GSOptimizationRecommendation {
  type: 'upgrade' | 'strategy' | 'timing' | 'diversification'
  priority: 'low' | 'medium' | 'high' | 'critical'
  
  title: string
  description: string
  estimated_impact: string
  
  // Financial Impact
  cost_gs: number
  expected_roi: number
  payback_period_days: number
  annual_profit_increase: number
  
  // Implementation
  difficulty: 'easy' | 'medium' | 'hard'
  time_to_implement: string
  prerequisites: string[]
  
  action_items: string[]
}

export interface GSPerformanceComparison {
  models: GSMiningModel[]
  current_model: string
  
  // Comparison Metrics
  performance_rankings: {
    model_name: string
    overall_score: number
    hashrate_score: number
    efficiency_score: number
    roi_score: number
    cost_score: number
  }[]
  
  // Upgrade Recommendations
  best_upgrade_path: {
    from: string
    to: string
    investment_required: number
    expected_improvement: string
    recommended_timing: string
  }[]
}

// =================================================================
// G's PROFIT MAXIMIZATION HOOK
// =================================================================

export function useFriendsGsProfitMaximization() {
  const [currentHashrate, setCurrentHashrate] = useState<GSHashrateMetrics | null>(null)
  const [availableModels, setAvailableModels] = useState<GSMiningModel[]>([])
  const [profitProjections, setProfitProjections] = useState<GSProfitProjection[]>([])
  const [optimizationRecs, setOptimizationRecs] = useState<GSOptimizationRecommendation[]>([])
  const [performanceComparison, setPerformanceComparison] = useState<GSPerformanceComparison | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  // =================================================================
  // HASHRATE CALCULATION
  // =================================================================

  const calculateCurrentHashrate = useCallback((userLevel: number, gsBalance: number, equipmentLevel: number = 1): GSHashrateMetrics => {
    // Base performance metrics
    const baseGsPerHour = 0.5 * userLevel * equipmentLevel
    const bandwidthCapacity = 50 + (userLevel * 25) + (equipmentLevel * 30) // MB/s
    
    // Apply multipliers based on level and equipment
    const levelMultiplier = 1 + (userLevel - 1) * 0.15 // 15% increase per level
    const equipmentMultiplier = 1 + (equipmentLevel - 1) * 0.25 // 25% increase per equipment level
    const balanceBonus = Math.min(1.5, 1 + (gsBalance / 10000) * 0.2) // Up to 50% bonus for high balance
    
    const effectiveMultiplier = levelMultiplier * equipmentMultiplier * balanceBonus
    
    // Calculate performance metrics
    const gsPerHour = baseGsPerHour * effectiveMultiplier
    const gsPerSecond = gsPerHour / 3600
    const gsPerDay = gsPerHour * 24
    const effectiveHashrate = gsPerHour * (0.8 + Math.random() * 0.4) // Add realistic variance
    
    // Efficiency metrics
    const powerEfficiency = gsPerHour / (50 + equipmentLevel * 25) // G's per "watt"
    const costEfficiency = gsPerHour / (10 + equipmentLevel * 15) // G's per dollar operating cost
    const timeEfficiency = gsPerHour / 60 // G's per minute
    const networkEfficiency = Math.min(15, (gsPerHour / 50) * 100) // Percentage of network capacity
    
    // Performance indicators
    const uptimePercentage = 95 + Math.random() * 4.5 // 95-99.5%
    const latencyMs = 50 + Math.random() * 100 // 50-150ms
    const qualityScore = 70 + (userLevel * 5) + Math.random() * 15 // 70-100
    const reliabilityIndex = Math.min(100, qualityScore * uptimePercentage / 100)
    
    return {
      gs_per_second: gsPerSecond,
      gs_per_hour: gsPerHour,
      gs_per_day: gsPerDay,
      bandwidth_hashrate_mbps: bandwidthCapacity,
      effective_hashrate: effectiveHashrate,
      power_efficiency: powerEfficiency,
      cost_efficiency: costEfficiency,
      time_efficiency: timeEfficiency,
      network_efficiency: networkEfficiency,
      uptime_percentage: uptimePercentage,
      latency_ms: latencyMs,
      quality_score: qualityScore,
      reliability_index: reliabilityIndex
    }
  }, [])

  // =================================================================
  // MINING MODELS GENERATION
  // =================================================================

  const generateMiningModels = useCallback((): GSMiningModel[] => {
    const models: GSMiningModel[] = []
    
    // Basic Bandwidth Miner
    const basicHashrate = calculateCurrentHashrate(1, 0, 1)
    models.push({
      model_name: "Basic Bandwidth Miner",
      model_type: "basic",
      initial_investment_gs: 0,
      monthly_cost_gs: 0,
      setup_time_hours: 0.5,
      base_hashrate: basicHashrate,
      boosted_hashrate: {
        ...basicHashrate,
        gs_per_hour: basicHashrate.gs_per_hour * 1.2,
        gs_per_day: basicHashrate.gs_per_day * 1.2
      },
      max_theoretical_hashrate: {
        ...basicHashrate,
        gs_per_hour: basicHashrate.gs_per_hour * 1.5,
        gs_per_day: basicHashrate.gs_per_day * 1.5
      },
      daily_profit_estimate: basicHashrate.gs_per_day * 0.025, // Convert to USD
      monthly_profit_estimate: basicHashrate.gs_per_day * 30 * 0.025,
      break_even_days: 0,
      roi_percentage_30d: 0,
      roi_percentage_90d: 0,
      roi_percentage_365d: 0,
      maintenance_required: false,
      upgrade_compatibility: ["premium", "enterprise"],
      exclusive_features: ["Basic bandwidth sharing"],
      user_level_required: 1
    })
    
    // Premium Connection Hub
    const premiumHashrate = calculateCurrentHashrate(3, 500, 3)
    models.push({
      model_name: "Premium Connection Hub",
      model_type: "premium",
      initial_investment_gs: 500,
      monthly_cost_gs: 25,
      setup_time_hours: 2,
      base_hashrate: premiumHashrate,
      boosted_hashrate: {
        ...premiumHashrate,
        gs_per_hour: premiumHashrate.gs_per_hour * 1.4,
        gs_per_day: premiumHashrate.gs_per_day * 1.4
      },
      max_theoretical_hashrate: {
        ...premiumHashrate,
        gs_per_hour: premiumHashrate.gs_per_hour * 2.0,
        gs_per_day: premiumHashrate.gs_per_day * 2.0
      },
      daily_profit_estimate: premiumHashrate.gs_per_day * 0.025,
      monthly_profit_estimate: premiumHashrate.gs_per_day * 30 * 0.025,
      break_even_days: Math.ceil(500 / (premiumHashrate.gs_per_day * 0.025)),
      roi_percentage_30d: ((premiumHashrate.gs_per_day * 30 * 0.025) / (500 * 0.025) - 1) * 100,
      roi_percentage_90d: ((premiumHashrate.gs_per_day * 90 * 0.025) / (500 * 0.025) - 1) * 100,
      roi_percentage_365d: ((premiumHashrate.gs_per_day * 365 * 0.025) / (500 * 0.025) - 1) * 100,
      maintenance_required: true,
      upgrade_compatibility: ["enterprise", "legendary"],
      exclusive_features: ["Priority routing", "Quality boost", "Extended uptime"],
      user_level_required: 3
    })
    
    // Enterprise Network Node
    const enterpriseHashrate = calculateCurrentHashrate(5, 2000, 5)
    models.push({
      model_name: "Enterprise Network Node",
      model_type: "enterprise",
      initial_investment_gs: 2000,
      monthly_cost_gs: 100,
      setup_time_hours: 8,
      base_hashrate: enterpriseHashrate,
      boosted_hashrate: {
        ...enterpriseHashrate,
        gs_per_hour: enterpriseHashrate.gs_per_hour * 1.6,
        gs_per_day: enterpriseHashrate.gs_per_day * 1.6
      },
      max_theoretical_hashrate: {
        ...enterpriseHashrate,
        gs_per_hour: enterpriseHashrate.gs_per_hour * 2.5,
        gs_per_day: enterpriseHashrate.gs_per_day * 2.5
      },
      daily_profit_estimate: enterpriseHashrate.gs_per_day * 0.025,
      monthly_profit_estimate: enterpriseHashrate.gs_per_day * 30 * 0.025,
      break_even_days: Math.ceil(2000 / (enterpriseHashrate.gs_per_day * 0.025)),
      roi_percentage_30d: ((enterpriseHashrate.gs_per_day * 30 * 0.025) / (2000 * 0.025) - 1) * 100,
      roi_percentage_90d: ((enterpriseHashrate.gs_per_day * 90 * 0.025) / (2000 * 0.025) - 1) * 100,
      roi_percentage_365d: ((enterpriseHashrate.gs_per_day * 365 * 0.025) / (2000 * 0.025) - 1) * 100,
      maintenance_required: true,
      upgrade_compatibility: ["legendary"],
      exclusive_features: ["Multi-path routing", "Load balancing", "Auto-optimization", "24/7 monitoring"],
      user_level_required: 5
    })
    
    // Legendary Master Node
    const legendaryHashrate = calculateCurrentHashrate(6, 10000, 8)
    models.push({
      model_name: "Legendary Master Node",
      model_type: "legendary",
      initial_investment_gs: 10000,
      monthly_cost_gs: 500,
      setup_time_hours: 24,
      base_hashrate: legendaryHashrate,
      boosted_hashrate: {
        ...legendaryHashrate,
        gs_per_hour: legendaryHashrate.gs_per_hour * 2.0,
        gs_per_day: legendaryHashrate.gs_per_day * 2.0
      },
      max_theoretical_hashrate: {
        ...legendaryHashrate,
        gs_per_hour: legendaryHashrate.gs_per_hour * 3.5,
        gs_per_day: legendaryHashrate.gs_per_day * 3.5
      },
      daily_profit_estimate: legendaryHashrate.gs_per_day * 0.025,
      monthly_profit_estimate: legendaryHashrate.gs_per_day * 30 * 0.025,
      break_even_days: Math.ceil(10000 / (legendaryHashrate.gs_per_day * 0.025)),
      roi_percentage_30d: ((legendaryHashrate.gs_per_day * 30 * 0.025) / (10000 * 0.025) - 1) * 100,
      roi_percentage_90d: ((legendaryHashrate.gs_per_day * 90 * 0.025) / (10000 * 0.025) - 1) * 100,
      roi_percentage_365d: ((legendaryHashrate.gs_per_day * 365 * 0.025) / (10000 * 0.025) - 1) * 100,
      maintenance_required: true,
      upgrade_compatibility: [],
      exclusive_features: ["Global routing", "AI optimization", "Predictive scaling", "Revenue sharing", "Network governance"],
      user_level_required: 6
    })
    
    return models
  }, [calculateCurrentHashrate])

  // =================================================================
  // PROFIT PROJECTIONS
  // =================================================================

  const generateProfitProjections = useCallback((hashrate: GSHashrateMetrics): GSProfitProjection[] => {
    const projections: GSProfitProjection[] = []
    const timeframes: GSProfitProjection['timeframe'][] = ['24h', '7d', '30d', '90d', '365d']
    
    timeframes.forEach(timeframe => {
      let multiplier = 1
      let riskLevel: GSProfitProjection['risk_level'] = 'low'
      
      switch (timeframe) {
        case '24h': multiplier = 1; riskLevel = 'low'; break
        case '7d': multiplier = 7; riskLevel = 'low'; break
        case '30d': multiplier = 30; riskLevel = 'medium'; break
        case '90d': multiplier = 90; riskLevel = 'medium'; break
        case '365d': multiplier = 365; riskLevel = 'high'; break
      }
      
      const baseEarnings = hashrate.gs_per_day * multiplier
      const platformFees = baseEarnings * 0.1 // 10% platform fee
      const operationalCosts = baseEarnings * 0.05 // 5% operational costs
      const netEarnings = baseEarnings - platformFees - operationalCosts
      
      // Market scenarios
      const conservative = netEarnings * 0.8 // 20% below expected
      const realistic = netEarnings
      const optimistic = netEarnings * 1.3 // 30% above expected
      const bullMarket = netEarnings * 2.0 // 100% above expected
      
      // Risk assessment
      const volatilityImpact = timeframe === '24h' ? 5 : timeframe === '7d' ? 15 : timeframe === '30d' ? 25 : timeframe === '90d' ? 40 : 60
      const marketDependency = timeframe === '24h' ? 10 : timeframe === '7d' ? 25 : timeframe === '30d' ? 50 : timeframe === '90d' ? 70 : 85
      const confidenceScore = 100 - (volatilityImpact + marketDependency) / 2
      
      projections.push({
        timeframe,
        gross_earnings_gs: baseEarnings,
        net_earnings_gs: netEarnings,
        platform_fees_gs: platformFees,
        operational_costs_gs: operationalCosts,
        conservative_projection: conservative,
        realistic_projection: realistic,
        optimistic_projection: optimistic,
        bull_market_projection: bullMarket,
        risk_level: riskLevel,
        volatility_impact: volatilityImpact,
        market_dependency: marketDependency,
        confidence_score: confidenceScore
      })
    })
    
    return projections
  }, [])

  // =================================================================
  // OPTIMIZATION RECOMMENDATIONS
  // =================================================================

  const generateOptimizationRecommendations = useCallback((
    currentHashrate: GSHashrateMetrics,
    availableModels: GSMiningModel[],
    userLevel: number,
    gsBalance: number
  ): GSOptimizationRecommendation[] => {
    const recommendations: GSOptimizationRecommendation[] = []
    
    // Upgrade recommendations
    const affordableUpgrades = availableModels.filter(model => 
      model.initial_investment_gs <= gsBalance && 
      model.user_level_required <= userLevel
    )
    
    affordableUpgrades.forEach(model => {
      if (model.base_hashrate.gs_per_day > currentHashrate.gs_per_day) {
        const dailyIncrease = model.base_hashrate.gs_per_day - currentHashrate.gs_per_day
        const paybackDays = model.initial_investment_gs / (dailyIncrease * 0.025)
        
        recommendations.push({
          type: 'upgrade',
          priority: paybackDays < 30 ? 'high' : paybackDays < 90 ? 'medium' : 'low',
          title: `Upgrade to ${model.model_name}`,
          description: `Increase your G's earning rate by ${((dailyIncrease / currentHashrate.gs_per_day) * 100).toFixed(1)}%`,
          estimated_impact: `+${dailyIncrease.toFixed(1)} G's/day`,
          cost_gs: model.initial_investment_gs,
          expected_roi: model.roi_percentage_365d,
          payback_period_days: paybackDays,
          annual_profit_increase: dailyIncrease * 365 * 0.025,
          difficulty: model.setup_time_hours < 2 ? 'easy' : model.setup_time_hours < 8 ? 'medium' : 'hard',
          time_to_implement: `${model.setup_time_hours} hours`,
          prerequisites: [`User Level ${model.user_level_required}`, `${model.initial_investment_gs} G's`],
          action_items: [
            `Purchase ${model.model_name} for ${model.initial_investment_gs} G's`,
            `Complete setup (${model.setup_time_hours} hours)`,
            `Configure optimizations`,
            `Monitor performance for 7 days`
          ]
        })
      }
    })
    
    // Strategy recommendations
    if (currentHashrate.uptime_percentage < 98) {
      recommendations.push({
        type: 'strategy',
        priority: 'medium',
        title: 'Improve System Uptime',
        description: 'Optimize your connection stability to increase earning consistency',
        estimated_impact: `+${((98 - currentHashrate.uptime_percentage) / 100 * currentHashrate.gs_per_day).toFixed(1)} G's/day`,
        cost_gs: 0,
        expected_roi: 0,
        payback_period_days: 0,
        annual_profit_increase: ((98 - currentHashrate.uptime_percentage) / 100 * currentHashrate.gs_per_day) * 365 * 0.025,
        difficulty: 'easy',
        time_to_implement: '1-2 hours',
        prerequisites: ['Basic networking knowledge'],
        action_items: [
          'Check network connection stability',
          'Update bandwidth sharing software',
          'Configure automatic reconnection',
          'Set up monitoring alerts'
        ]
      })
    }
    
    // Timing recommendations
    if (gsBalance > 1000) {
      recommendations.push({
        type: 'timing',
        priority: 'high',
        title: 'Optimize G\'s Investment Timing',
        description: 'Your G\'s balance is high - consider strategic reinvestment during market dips',
        estimated_impact: 'Variable based on market timing',
        cost_gs: 0,
        expected_roi: 15,
        payback_period_days: 0,
        annual_profit_increase: gsBalance * 0.15 * 0.025,
        difficulty: 'medium',
        time_to_implement: 'Ongoing monitoring',
        prerequisites: ['Market analysis knowledge'],
        action_items: [
          'Set up price alerts for G\'s purchasing opportunities',
          'Monitor daily trading patterns',
          'Consider dollar-cost averaging strategy',
          'Track ROI on timed investments'
        ]
      })
    }
    
    // Diversification recommendations
    if (currentHashrate.network_efficiency > 10) {
      recommendations.push({
        type: 'diversification',
        priority: 'medium',
        title: 'Diversify Earning Streams',
        description: 'Explore additional revenue sources like communities and marketplace activities',
        estimated_impact: '+20-40% additional earnings',
        cost_gs: 200,
        expected_roi: 50,
        payback_period_days: 60,
        annual_profit_increase: currentHashrate.gs_per_day * 0.3 * 365 * 0.025,
        difficulty: 'medium',
        time_to_implement: '1-2 weeks',
        prerequisites: ['Community creation access', 'Active user base'],
        action_items: [
          'Create or join profitable communities',
          'Participate in opportunity marketplace',
          'Offer specialized services',
          'Build reputation for premium rates'
        ]
      })
    }
    
    return recommendations.sort((a, b) => {
      const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    })
  }, [])

  // =================================================================
  // PERFORMANCE COMPARISON
  // =================================================================

  const generatePerformanceComparison = useCallback((
    models: GSMiningModel[],
    currentModel: string = "Basic Bandwidth Miner"
  ): GSPerformanceComparison => {
    const rankings = models.map(model => {
      // Calculate scores (0-100 scale)
      const hashrateScore = Math.min(100, (model.base_hashrate.gs_per_day / 50) * 100)
      const efficiencyScore = Math.min(100, model.base_hashrate.cost_efficiency * 10)
      const roiScore = Math.min(100, Math.max(0, model.roi_percentage_365d))
      const costScore = Math.min(100, 100 - (model.initial_investment_gs / 10000) * 100)
      
      const overallScore = (hashrateScore * 0.3 + efficiencyScore * 0.25 + roiScore * 0.25 + costScore * 0.2)
      
      return {
        model_name: model.model_name,
        overall_score: overallScore,
        hashrate_score: hashrateScore,
        efficiency_score: efficiencyScore,
        roi_score: roiScore,
        cost_score: costScore
      }
    }).sort((a, b) => b.overall_score - a.overall_score)
    
    // Generate upgrade paths
    const currentModelIndex = models.findIndex(m => m.model_name === currentModel)
    const upgradePaths = models
      .filter((model, index) => index > currentModelIndex)
      .map(model => {
        const currentModelData = models[currentModelIndex]
        const investmentRequired = model.initial_investment_gs - (currentModelData?.initial_investment_gs || 0)
        const performanceImprovement = ((model.base_hashrate.gs_per_day / (currentModelData?.base_hashrate.gs_per_day || 1)) - 1) * 100
        
        return {
          from: currentModel,
          to: model.model_name,
          investment_required: investmentRequired,
          expected_improvement: `+${performanceImprovement.toFixed(1)}% daily earnings`,
          recommended_timing: model.break_even_days < 30 ? 'Immediate' : model.break_even_days < 90 ? 'Within 1 month' : 'Long-term goal'
        }
      })
    
    return {
      models,
      current_model: currentModel,
      performance_rankings: rankings,
      best_upgrade_path: upgradePaths
    }
  }, [])

  // =================================================================
  // MAIN ANALYSIS FUNCTION
  // =================================================================

  const runProfitAnalysis = useCallback(async (
    userLevel: number = 2,
    gsBalance: number = 136,
    equipmentLevel: number = 1,
    currentModelName: string = "Basic Bandwidth Miner"
  ) => {
    setIsAnalyzing(true)
    
    try {
      // Calculate current hashrate
      const hashrate = calculateCurrentHashrate(userLevel, gsBalance, equipmentLevel)
      setCurrentHashrate(hashrate)
      
      // Generate available models
      const models = generateMiningModels()
      setAvailableModels(models)
      
      // Generate profit projections
      const projections = generateProfitProjections(hashrate)
      setProfitProjections(projections)
      
      // Generate optimization recommendations
      const recommendations = generateOptimizationRecommendations(hashrate, models, userLevel, gsBalance)
      setOptimizationRecs(recommendations)
      
      // Generate performance comparison
      const comparison = generatePerformanceComparison(models, currentModelName)
      setPerformanceComparison(comparison)
      
      // Simulate analysis delay
      await new Promise(resolve => setTimeout(resolve, 2000))
      
    } finally {
      setIsAnalyzing(false)
    }
  }, [calculateCurrentHashrate, generateMiningModels, generateProfitProjections, generateOptimizationRecommendations, generatePerformanceComparison])

  // =================================================================
  // UTILITY FUNCTIONS
  // =================================================================

  const formatGsPerSecond = useCallback((gs: number) => {
    if (gs < 0.001) return `${(gs * 1000).toFixed(2)} mG/s`
    if (gs < 1) return `${gs.toFixed(3)} G/s`
    return `${gs.toFixed(2)} G/s`
  }, [])

  const formatHashrate = useCallback((rate: number) => {
    if (rate < 1) return `${rate.toFixed(3)} GH/s`
    if (rate < 1000) return `${rate.toFixed(1)} GH/s`
    return `${(rate / 1000).toFixed(2)} TH/s`
  }, [])

  const formatROI = useCallback((roi: number) => {
    return `${roi > 0 ? '+' : ''}${roi.toFixed(1)}%`
  }, [])

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount)
  }, [])

  return {
    // Data
    currentHashrate,
    availableModels,
    profitProjections,
    optimizationRecs,
    performanceComparison,
    
    // Status
    isAnalyzing,
    
    // Actions
    runProfitAnalysis,
    
    // Formatters
    formatGsPerSecond,
    formatHashrate,
    formatROI,
    formatCurrency
  }
}

export type { 
  GSHashrateMetrics, 
  GSMiningModel, 
  GSProfitProjection, 
  GSOptimizationRecommendation, 
  GSPerformanceComparison 
}