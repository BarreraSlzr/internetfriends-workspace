import { useCallback, useEffect, useRef, useState } from 'react'

export interface DependencyMetrics {
  name: string
  type: 'api' | 'service' | 'library' | 'external'
  status: 'healthy' | 'degraded' | 'failed'
  latency: number
  errorRate: number
  cacheHitRate: number
  lastChecked: Date
  usageCount: number
}

export interface DependencyTrackingOptions {
  trackPerformance?: boolean
  trackErrors?: boolean
  trackCacheHits?: boolean
  reportInterval?: number
}

export interface DependencyCall {
  name: string
  type: 'api' | 'service' | 'library' | 'external'
  startTime: number
  endTime?: number
  success?: boolean
  cached?: boolean
  errorMessage?: string
}

const dependencyMetrics = new Map<string, DependencyMetrics>()
const dependencyCalls: DependencyCall[] = []

export const useFriendsDependencyTracker = (
  hookName: string,
  dependencies: string[],
  options: DependencyTrackingOptions = {}
) => {
  const {
    trackPerformance = true,
    trackErrors = true,
    trackCacheHits = true,
    reportInterval = 60000
  } = options

  const [metrics, setMetrics] = useState<Map<string, DependencyMetrics>>(new Map())
  const reportIntervalRef = useRef<NodeJS.Timeout>()

  const initializeDependency = useCallback((name: string, type: DependencyMetrics['type']) => {
    if (!dependencyMetrics.has(name)) {
      dependencyMetrics.set(name, {
        name,
        type,
        status: 'healthy',
        latency: 0,
        errorRate: 0,
        cacheHitRate: 0,
        lastChecked: new Date(),
        usageCount: 0
      })
    }
  }, [])

  const trackDependencyCall = useCallback((
    dependencyName: string,
    type: DependencyMetrics['type'],
    operation: () => Promise<any>,
    cached = false
  ) => {
    const startTime = performance.now()
    const call: DependencyCall = {
      name: dependencyName,
      type,
      startTime,
      cached
    }

    dependencyCalls.push(call)

    return operation()
      .then((result) => {
        call.endTime = performance.now()
        call.success = true
        updateMetrics(dependencyName, call)
        return result
      })
      .catch((error) => {
        call.endTime = performance.now()
        call.success = false
        call.errorMessage = error.message
        updateMetrics(dependencyName, call)
        throw error
      })
  }, [])

  const updateMetrics = useCallback((dependencyName: string, call: DependencyCall) => {
    const metric = dependencyMetrics.get(dependencyName)
    if (!metric) return

    metric.usageCount++
    metric.lastChecked = new Date()

    if (call.endTime && trackPerformance) {
      const latency = call.endTime - call.startTime
      metric.latency = (metric.latency + latency) / 2
    }

    if (trackErrors) {
      const recentCalls = dependencyCalls
        .filter(c => c.name === dependencyName && c.endTime && c.endTime > Date.now() - 300000)
        .slice(-10)
      
      const failedCalls = recentCalls.filter(c => !c.success).length
      metric.errorRate = failedCalls / recentCalls.length || 0
    }

    if (trackCacheHits) {
      const recentCalls = dependencyCalls
        .filter(c => c.name === dependencyName && c.endTime && c.endTime > Date.now() - 300000)
        .slice(-10)
      
      const cachedCalls = recentCalls.filter(c => c.cached).length
      metric.cacheHitRate = cachedCalls / recentCalls.length || 0
    }

    metric.status = metric.errorRate > 0.1 ? 'failed' : 
                   metric.errorRate > 0.05 ? 'degraded' : 'healthy'

    dependencyMetrics.set(dependencyName, metric)
  }, [trackPerformance, trackErrors, trackCacheHits])

  const getDependencyHealth = useCallback((dependencyName: string) => {
    return dependencyMetrics.get(dependencyName)
  }, [])

  const getAllMetrics = useCallback(() => {
    return new Map(dependencyMetrics)
  }, [])

  const generateReport = useCallback(() => {
    const report = {
      hookName,
      timestamp: new Date(),
      dependencies: Array.from(dependencyMetrics.values()),
      summary: {
        totalDependencies: dependencyMetrics.size,
        healthyCount: Array.from(dependencyMetrics.values()).filter(m => m.status === 'healthy').length,
        degradedCount: Array.from(dependencyMetrics.values()).filter(m => m.status === 'degraded').length,
        failedCount: Array.from(dependencyMetrics.values()).filter(m => m.status === 'failed').length,
        averageLatency: Array.from(dependencyMetrics.values()).reduce((sum, m) => sum + m.latency, 0) / dependencyMetrics.size || 0,
        averageErrorRate: Array.from(dependencyMetrics.values()).reduce((sum, m) => sum + m.errorRate, 0) / dependencyMetrics.size || 0
      }
    }

    console.log(`[${hookName}] Dependency Report:`, report)
    return report
  }, [hookName])

  useEffect(() => {
    dependencies.forEach(dep => {
      initializeDependency(dep, 'service')
    })

    if (reportInterval > 0) {
      reportIntervalRef.current = setInterval(generateReport, reportInterval)
    }

    return () => {
      if (reportIntervalRef.current) {
        clearInterval(reportIntervalRef.current)
      }
    }
  }, [dependencies, initializeDependency, generateReport, reportInterval])

  useEffect(() => {
    setMetrics(new Map(dependencyMetrics))
  }, [])

  return {
    trackDependencyCall,
    getDependencyHealth,
    getAllMetrics,
    generateReport,
    metrics: Array.from(metrics.values())
  }
}

export const useFriendsDependencyAnalytics = () => {
  const [analytics, setAnalytics] = useState({
    totalCalls: 0,
    averageLatency: 0,
    errorRate: 0,
    cacheHitRate: 0,
    topDependencies: [] as { name: string; usage: number }[]
  })

  const generateAnalytics = useCallback(() => {
    const recentCalls = dependencyCalls.filter(call => 
      call.endTime && call.endTime > Date.now() - 3600000
    )

    const totalCalls = recentCalls.length
    const avgLatency = recentCalls.reduce((sum, call) => 
      sum + (call.endTime! - call.startTime), 0) / totalCalls || 0
    
    const failedCalls = recentCalls.filter(call => !call.success).length
    const errorRate = failedCalls / totalCalls || 0
    
    const cachedCalls = recentCalls.filter(call => call.cached).length
    const cacheHitRate = cachedCalls / totalCalls || 0

    const dependencyUsage = new Map<string, number>()
    recentCalls.forEach(call => {
      dependencyUsage.set(call.name, (dependencyUsage.get(call.name) || 0) + 1)
    })

    const topDependencies = Array.from(dependencyUsage.entries())
      .map(([name, usage]) => ({ name, usage }))
      .sort((a, b) => b.usage - a.usage)
      .slice(0, 10)

    setAnalytics({
      totalCalls,
      averageLatency: avgLatency,
      errorRate,
      cacheHitRate,
      topDependencies
    })

    return {
      totalCalls,
      averageLatency: avgLatency,
      errorRate,
      cacheHitRate,
      topDependencies,
      dependencyMetrics: Array.from(dependencyMetrics.values())
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(generateAnalytics, 30000)
    generateAnalytics()
    
    return () => clearInterval(interval)
  }, [generateAnalytics])

  return {
    analytics,
    generateAnalytics
  }
}