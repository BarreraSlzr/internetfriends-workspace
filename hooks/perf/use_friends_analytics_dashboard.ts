import { useFriendsCore, useFriendsPerformance } from './use_friends_core'
import { useFriendsDependencyAnalytics } from './use_friends_dependency_analytics'

export interface PerformanceDashboardData {
  hookUsage: {
    name: string
    usageCount: number
    averageLatency: number
    errorRate: number
    status: 'healthy' | 'degraded' | 'failed'
  }[]
  dependencies: {
    name: string
    type: string
    usageCount: number
    latency: number
    cacheHitRate: number
    errorRate: number
    status: 'healthy' | 'degraded' | 'failed'
  }[]
  systemMetrics: {
    totalEvents: number
    eventsPerSecond: number
    averageProcessingTime: number
    errorRate: number
    activeListeners: number
  }
  trends: {
    timeRange: string
    dataPoints: {
      timestamp: string
      value: number
      metric: string
    }[]
  }
  alerts: {
    id: string
    severity: 'info' | 'warning' | 'error'
    message: string
    timestamp: string
    source: string
  }[]
}

export const useFriendsAnalyticsDashboard = () => {
  const { metrics: friendsMetrics, getInsights, subscribe } = useFriendsCore('FriendsAnalyticsDashboard')
  const { analytics: dependencyAnalytics, generateAnalytics } = useFriendsDependencyAnalytics()
  const { performanceMetrics } = useFriendsPerformance('FriendsAnalyticsDashboard')

  const generateDashboardData = (): PerformanceDashboardData => {
    const insights = getInsights()
    const depAnalytics = generateAnalytics()

    const alerts: PerformanceDashboardData['alerts'] = []
    
    depAnalytics.dependencyMetrics.forEach(dep => {
      if (dep.status === 'failed') {
        alerts.push({
          id: `dep-${dep.name}-${Date.now()}`,
          severity: 'error',
          message: `Dependency ${dep.name} has failed with ${(dep.errorRate * 100).toFixed(1)}% error rate`,
          timestamp: new Date().toISOString(),
          source: dep.name
        })
      } else if (dep.status === 'degraded') {
        alerts.push({
          id: `dep-${dep.name}-${Date.now()}`,
          severity: 'warning',
          message: `Dependency ${dep.name} is degraded with ${(dep.errorRate * 100).toFixed(1)}% error rate`,
          timestamp: new Date().toISOString(),
          source: dep.name
        })
      }
    })

    if (friendsMetrics.errorRate > 0.05) {
      alerts.push({
        id: `system-error-${Date.now()}`,
        severity: 'warning',
        message: `System error rate is elevated: ${(friendsMetrics.errorRate * 100).toFixed(1)}%`,
        timestamp: new Date().toISOString(),
        source: 'Friends Event System'
      })
    }

    return {
      hookUsage: insights.sources.map(source => ({
        name: source.source,
        usageCount: source.count,
        averageLatency: performanceMetrics.renderTime,
        errorRate: friendsMetrics.errorRate,
        status: friendsMetrics.errorRate > 0.1 ? 'failed' : 
                friendsMetrics.errorRate > 0.05 ? 'degraded' : 'healthy'
      })),
      dependencies: depAnalytics.dependencyMetrics.map(dep => ({
        name: dep.name,
        type: dep.type,
        usageCount: dep.usageCount,
        latency: dep.latency,
        cacheHitRate: dep.cacheHitRate,
        errorRate: dep.errorRate,
        status: dep.status
      })),
      systemMetrics: {
        totalEvents: friendsMetrics.totalEvents,
        eventsPerSecond: friendsMetrics.eventsPerSecond,
        averageProcessingTime: friendsMetrics.averageProcessingTime,
        errorRate: friendsMetrics.errorRate,
        activeListeners: friendsMetrics.activeListeners
      },
      trends: {
        timeRange: 'last-hour',
        dataPoints: [
          {
            timestamp: new Date().toISOString(),
            value: friendsMetrics.totalEvents,
            metric: 'totalEvents'
          },
          {
            timestamp: new Date().toISOString(),
            value: friendsMetrics.averageProcessingTime,
            metric: 'processingTime'
          },
          {
            timestamp: new Date().toISOString(),
            value: friendsMetrics.errorRate * 100,
            metric: 'errorRate'
          }
        ]
      },
      alerts
    }
  }

  const getHealthScore = (): number => {
    const depAnalytics = generateAnalytics()
    const healthyDeps = depAnalytics.dependencyMetrics.filter(d => d.status === 'healthy').length
    const totalDeps = depAnalytics.dependencyMetrics.length
    
    const dependencyHealth = totalDeps > 0 ? (healthyDeps / totalDeps) : 1
    const systemHealth = 1 - Math.min(friendsMetrics.errorRate * 10, 1)
    const performanceHealth = friendsMetrics.averageProcessingTime < 100 ? 1 : 
                            Math.max(0, 1 - (friendsMetrics.averageProcessingTime - 100) / 1000)
    
    return Math.round((dependencyHealth + systemHealth + performanceHealth) / 3 * 100)
  }

  const exportTelemetryData = () => {
    const data = generateDashboardData()
    const exportData = {
      ...data,
      exportTimestamp: new Date().toISOString(),
      healthScore: getHealthScore(),
      version: '1.0.0'
    }
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { 
      type: 'application/json' 
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `friends-telemetry-${new Date().toISOString().slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  return {
    generateDashboardData,
    getHealthScore,
    exportTelemetryData,
    realTimeMetrics: {
      friends: friendsMetrics,
      dependencies: dependencyAnalytics,
      performance: performanceMetrics
    }
  }
}

export const useFriendsHookAnalyzer = (hookName: string) => {
  const { emit, subscribe, metrics } = useFriendsCore(hookName, [], {
    enableTelemetry: true,
    bufferSize: 50,
    flushInterval: 15000
  })

  const trackHookEvent = (eventType: string, data: any = {}) => {
    emit(`hook:${eventType}`, {
      ...data,
      hookName,
      timestamp: Date.now()
    })
  }

  const trackRender = () => {
    trackHookEvent('render', { renderCount: metrics.totalEvents })
  }

  const trackError = (error: Error, context?: string) => {
    trackHookEvent('error', {
      message: error.message,
      stack: error.stack,
      context,
      errorType: error.name
    })
  }

  const trackStateChange = (stateName: string, newValue: any, oldValue?: any) => {
    trackHookEvent('state_change', {
      stateName,
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : newValue,
      oldValue: typeof oldValue === 'object' ? JSON.stringify(oldValue) : oldValue,
      changeType: oldValue === undefined ? 'initialize' : 'update'
    })
  }

  const trackDependencyCall = (dependencyName: string, success: boolean, latency: number) => {
    trackHookEvent('dependency_call', {
      dependencyName,
      success,
      latency,
      status: success ? 'success' : 'failure'
    })
  }

  return {
    trackHookEvent,
    trackRender,
    trackError,
    trackStateChange,
    trackDependencyCall,
    metrics
  }
}