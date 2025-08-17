import { useCallback, useEffect, useRef, useState } from 'react'
import { useFriendsDependencyTracker } from './use_friends_dependency_analytics'

export interface FriendsEvent {
  type: string
  source: string
  data: any
  timestamp: number
  id: string
}

export interface FriendsEventListener {
  (event: FriendsEvent): void
}

export interface UseFriendsOptions {
  enableTelemetry?: boolean
  bufferSize?: number
  flushInterval?: number
  orpcEndpoint?: string
}

export interface FriendsMetrics {
  totalEvents: number
  eventsPerSecond: number
  averageProcessingTime: number
  errorRate: number
  activeListeners: number
}

class FriendsEventBus {
  private listeners = new Map<string, Set<FriendsEventListener>>()
  private globalListeners = new Set<FriendsEventListener>()
  private eventBuffer: FriendsEvent[] = []
  private metrics: FriendsMetrics = {
    totalEvents: 0,
    eventsPerSecond: 0,
    averageProcessingTime: 0,
    errorRate: 0,
    activeListeners: 0
  }

  emit(type: string, source: string, data: any) {
    const event: FriendsEvent = {
      type,
      source,
      data,
      timestamp: performance.now(),
      id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }

    this.eventBuffer.push(event)
    this.metrics.totalEvents++

    const startTime = performance.now()
    let errors = 0

    try {
      this.listeners.get(type)?.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          errors++
          console.warn(`Friends event listener error:`, error)
        }
      })

      this.globalListeners.forEach(listener => {
        try {
          listener(event)
        } catch (error) {
          errors++
          console.warn(`Friends global listener error:`, error)
        }
      })
    } finally {
      const processingTime = performance.now() - startTime
      this.updateMetrics(processingTime, errors)
    }
  }

  subscribe(type: string, listener: FriendsEventListener) {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set())
    }
    this.listeners.get(type)!.add(listener)
    this.updateActiveListeners()

    return () => {
      this.listeners.get(type)?.delete(listener)
      if (this.listeners.get(type)?.size === 0) {
        this.listeners.delete(type)
      }
      this.updateActiveListeners()
    }
  }

  subscribeGlobal(listener: FriendsEventListener) {
    this.globalListeners.add(listener)
    this.updateActiveListeners()

    return () => {
      this.globalListeners.delete(listener)
      this.updateActiveListeners()
    }
  }

  getMetrics(): FriendsMetrics {
    return { ...this.metrics }
  }

  getEventBuffer(): FriendsEvent[] {
    return [...this.eventBuffer]
  }

  clearBuffer() {
    this.eventBuffer = []
  }

  private updateMetrics(processingTime: number, errors: number) {
    const totalTime = (this.metrics.averageProcessingTime * (this.metrics.totalEvents - 1) + processingTime) / this.metrics.totalEvents
    this.metrics.averageProcessingTime = totalTime
    
    if (errors > 0) {
      this.metrics.errorRate = (this.metrics.errorRate + (errors / this.metrics.totalEvents)) / 2
    }
  }

  private updateActiveListeners() {
    this.metrics.activeListeners = Array.from(this.listeners.values())
      .reduce((sum, listeners) => sum + listeners.size, 0) + this.globalListeners.size
  }
}

const globalEventBus = new FriendsEventBus()

export const useFriendsCore = (
  hookName: string,
  dependencies: string[] = [],
  options: UseFriendsOptions = {}
) => {
  const {
    enableTelemetry = true,
    bufferSize = 100,
    flushInterval = 30000,
    orpcEndpoint = '/api/friends/telemetry'
  } = options

  const { trackDependencyCall } = useFriendsDependencyTracker(
    hookName,
    [...dependencies, 'friends-event-bus', 'orpc-protocol'],
    { 
      trackPerformance: true,
      trackErrors: true,
      reportInterval: flushInterval 
    }
  )

  const [metrics, setMetrics] = useState<FriendsMetrics>(globalEventBus.getMetrics())
  const flushTimerRef = useRef<NodeJS.Timeout>()

  const emit = useCallback((type: string, data: any) => {
    return trackDependencyCall('friends-event-bus', 'service', async () => {
      globalEventBus.emit(type, hookName, data)
    })
  }, [hookName, trackDependencyCall])

  const subscribe = useCallback((type: string, listener: FriendsEventListener) => {
    return globalEventBus.subscribe(type, listener)
  }, [])

  const subscribeGlobal = useCallback((listener: FriendsEventListener) => {
    return globalEventBus.subscribeGlobal(listener)
  }, [])

  const flushTelemetry = useCallback(async () => {
    if (!enableTelemetry) return

    const buffer = globalEventBus.getEventBuffer()
    if (buffer.length === 0) return

    const telemetryData = {
      hookName,
      metrics: globalEventBus.getMetrics(),
      events: buffer.slice(-bufferSize),
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : ''
    }

    return trackDependencyCall('orpc-protocol', 'api', async () => {
      try {
        const response = await fetch(orpcEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Friends-Protocol': '1.0'
          },
          body: JSON.stringify(telemetryData)
        })

        if (!response.ok) {
          throw new Error(`Telemetry upload failed: ${response.status}`)
        }

        globalEventBus.clearBuffer()
        return response.json()
      } catch (error) {
        console.warn('Friends telemetry upload failed:', error)
        throw error
      }
    })
  }, [enableTelemetry, hookName, bufferSize, orpcEndpoint, trackDependencyCall])

  const getInsights = useCallback(() => {
    const buffer = globalEventBus.getEventBuffer()
    const eventTypes = new Map<string, number>()
    const sources = new Map<string, number>()
    
    buffer.forEach(event => {
      eventTypes.set(event.type, (eventTypes.get(event.type) || 0) + 1)
      sources.set(event.source, (sources.get(event.source) || 0) + 1)
    })

    return {
      totalEvents: buffer.length,
      eventTypes: Array.from(eventTypes.entries()).map(([type, count]) => ({ type, count })),
      sources: Array.from(sources.entries()).map(([source, count]) => ({ source, count })),
      metrics: globalEventBus.getMetrics()
    }
  }, [])

  useEffect(() => {
    if (enableTelemetry && flushInterval > 0) {
      flushTimerRef.current = setInterval(flushTelemetry, flushInterval)
    }

    const metricsInterval = setInterval(() => {
      setMetrics(globalEventBus.getMetrics())
    }, 1000)

    return () => {
      if (flushTimerRef.current) {
        clearInterval(flushTimerRef.current)
      }
      clearInterval(metricsInterval)
    }
  }, [enableTelemetry, flushInterval, flushTelemetry])

  useEffect(() => {
    emit('hook:mounted', { dependencies, options })
    
    return () => {
      emit('hook:unmounted', { hookName })
      if (enableTelemetry) {
        flushTelemetry()
      }
    }
  }, [emit, hookName, dependencies, options, enableTelemetry, flushTelemetry])

  return {
    emit,
    subscribe,
    subscribeGlobal,
    flushTelemetry,
    getInsights,
    metrics,
    eventBus: globalEventBus
  }
}

export const useFriendsPerformance = (hookName: string) => {
  const { emit, subscribe, metrics } = useFriendsCore(hookName, ['performance-observer'])
  const [performanceMetrics, setPerformanceMetrics] = useState({
    renderTime: 0,
    updateCount: 0,
    memoryUsage: 0
  })

  const startMeasure = useCallback((measureName: string) => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${hookName}-${measureName}-start`)
      emit('performance:measure:start', { hookName, measureName })
    }
  }, [hookName, emit])

  const endMeasure = useCallback((measureName: string) => {
    if (typeof performance !== 'undefined') {
      const startMark = `${hookName}-${measureName}-start`
      const endMark = `${hookName}-${measureName}-end`
      performance.mark(endMark)
      
      try {
        performance.measure(`${hookName}-${measureName}`, startMark, endMark)
        const measure = performance.getEntriesByName(`${hookName}-${measureName}`)[0]
        
        emit('performance:measure:end', { 
          hookName, 
          measureName, 
          duration: measure.duration,
          timestamp: measure.startTime
        })

        setPerformanceMetrics(prev => ({
          ...prev,
          renderTime: measure.duration,
          updateCount: prev.updateCount + 1
        }))

        if ('memory' in performance) {
          const memInfo = (performance as any).memory
          setPerformanceMetrics(prev => ({
            ...prev,
            memoryUsage: memInfo.usedJSHeapSize
          }))
        }

        return measure.duration
      } catch (error) {
        console.warn('Performance measurement failed:', error)
        return 0
      }
    }
    return 0
  }, [hookName, emit])

  useEffect(() => {
    const unsubscribe = subscribe('performance:threshold:exceeded', (event) => {
      console.warn(`Performance threshold exceeded in ${event.source}:`, event.data)
    })

    return unsubscribe
  }, [subscribe])

  return {
    startMeasure,
    endMeasure,
    performanceMetrics,
    friendsMetrics: metrics
  }
}

export { globalEventBus as friendsEventBus }