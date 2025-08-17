import { useCallback, useEffect, useRef, useState } from 'react'
import { useFriendsCore } from './use_friends_core'

export interface OfflineEvent {
  type: 'went_offline' | 'came_online' | 'connection_unstable'
  timestamp: Date
  duration?: number
  reason?: 'network_failure' | 'user_action' | 'service_unavailable'
  recoveryTime?: number
}

export interface OfflineCapability {
  caching: boolean
  localStorage: boolean
  serviceWorker: boolean
  webRTC: boolean
  bluetooth: boolean
  indexedDB: boolean
}

export interface FriendsNetworkRecommendation {
  shouldShow: boolean
  reason: 'frequent_offline' | 'long_offline_duration' | 'poor_connection' | 'first_offline'
  benefits: string[]
  estimatedImprovement: {
    offlineAccess: number
    connectivityResilience: number
    dataSync: number
  }
}

export interface OfflineAnalytics {
  totalOfflineTime: number
  offlineEvents: number
  averageOfflineDuration: number
  longestOfflineSession: number
  offlineFrequency: 'rare' | 'occasional' | 'frequent' | 'constant'
  networkReliability: number
}

export const useFriendsOfflineDetection = () => {
  const { emit, subscribe } = useFriendsCore('FriendsOfflineDetection')
  
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [offlineAnalytics, setOfflineAnalytics] = useState<OfflineAnalytics>({
    totalOfflineTime: 0,
    offlineEvents: 0,
    averageOfflineDuration: 0,
    longestOfflineSession: 0,
    offlineFrequency: 'rare',
    networkReliability: 100
  })
  
  const offlineStartTime = useRef<Date | null>(null)
  const offlineEvents = useRef<OfflineEvent[]>([])
  const connectionChecks = useRef<{ timestamp: Date; success: boolean }[]>([])

  const detectOfflineCapabilities = useCallback((): OfflineCapability => {
    return {
      caching: 'caches' in window,
      localStorage: 'localStorage' in window,
      serviceWorker: 'serviceWorker' in navigator,
      webRTC: 'RTCPeerConnection' in window,
      bluetooth: 'bluetooth' in navigator,
      indexedDB: 'indexedDB' in window
    }
  }, [])

  const checkConnectionQuality = useCallback(async () => {
    const startTime = performance.now()
    
    try {
      await fetch('/api/ping', { 
        method: 'HEAD',
        cache: 'no-cache',
        signal: AbortSignal.timeout(5000)
      })
      
      const latency = performance.now() - startTime
      const success = latency < 3000
      
      connectionChecks.current.push({
        timestamp: new Date(),
        success
      })

      if (connectionChecks.current.length > 20) {
        connectionChecks.current = connectionChecks.current.slice(-20)
      }

      const reliability = connectionChecks.current.filter(c => c.success).length / connectionChecks.current.length * 100

      emit('connection:quality:checked', { latency, success, reliability })
      
      return { latency, success, reliability }
    } catch (error) {
      connectionChecks.current.push({
        timestamp: new Date(),
        success: false
      })

      emit('connection:quality:error', { error: error.message })
      return { latency: -1, success: false, reliability: 0 }
    }
  }, [emit])

  const calculateOfflineFrequency = useCallback(() => {
    const last24Hours = offlineEvents.current.filter(
      event => Date.now() - event.timestamp.getTime() < 24 * 60 * 60 * 1000
    )

    if (last24Hours.length === 0) return 'rare'
    if (last24Hours.length >= 10) return 'constant'
    if (last24Hours.length >= 5) return 'frequent'
    if (last24Hours.length >= 2) return 'occasional'
    return 'rare'
  }, [])

  const handleOffline = useCallback(() => {
    setIsOnline(false)
    offlineStartTime.current = new Date()
    
    const event: OfflineEvent = {
      type: 'went_offline',
      timestamp: new Date(),
      reason: 'network_failure'
    }
    
    offlineEvents.current.push(event)
    emit('network:went_offline', event)

    const newAnalytics = {
      ...offlineAnalytics,
      offlineEvents: offlineAnalytics.offlineEvents + 1,
      offlineFrequency: calculateOfflineFrequency()
    }
    
    setOfflineAnalytics(newAnalytics)
  }, [emit, offlineAnalytics, calculateOfflineFrequency])

  const handleOnline = useCallback(() => {
    setIsOnline(true)
    
    if (offlineStartTime.current) {
      const duration = Date.now() - offlineStartTime.current.getTime()
      const recoveryTime = performance.now()
      
      const event: OfflineEvent = {
        type: 'came_online',
        timestamp: new Date(),
        duration,
        recoveryTime
      }
      
      offlineEvents.current.push(event)
      emit('network:came_online', event)

      const newAnalytics: OfflineAnalytics = {
        ...offlineAnalytics,
        totalOfflineTime: offlineAnalytics.totalOfflineTime + duration,
        averageOfflineDuration: (offlineAnalytics.totalOfflineTime + duration) / offlineAnalytics.offlineEvents,
        longestOfflineSession: Math.max(offlineAnalytics.longestOfflineSession, duration),
        offlineFrequency: calculateOfflineFrequency()
      }
      
      setOfflineAnalytics(newAnalytics)
      offlineStartTime.current = null
    }
  }, [emit, offlineAnalytics, calculateOfflineFrequency])

  useEffect(() => {
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    const qualityInterval = setInterval(checkConnectionQuality, 30000)
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(qualityInterval)
    }
  }, [handleOnline, handleOffline, checkConnectionQuality])

  return {
    isOnline,
    offlineAnalytics,
    offlineCapabilities: detectOfflineCapabilities(),
    checkConnectionQuality,
    offlineEvents: offlineEvents.current
  }
}

export const useFriendsNetworkRecommendation = () => {
  const { emit } = useFriendsCore('FriendsNetworkRecommendation')
  const { isOnline, offlineAnalytics, offlineCapabilities } = useFriendsOfflineDetection()
  
  const [userPreferences, setUserPreferences] = useState({
    hasSeenRecommendation: false,
    enabledFriendsNetwork: false,
    dismissedCount: 0,
    lastDismissed: null as Date | null
  })

  const [recommendation, setRecommendation] = useState<FriendsNetworkRecommendation | null>(null)

  const loadUserPreferences = useCallback(() => {
    try {
      const saved = localStorage.getItem('friends-network-preferences')
      if (saved) {
        const parsed = JSON.parse(saved)
        setUserPreferences({
          ...parsed,
          lastDismissed: parsed.lastDismissed ? new Date(parsed.lastDismissed) : null
        })
      }
    } catch (error) {
      console.warn('Failed to load Friends Network preferences:', error)
    }
  }, [])

  const saveUserPreferences = useCallback((prefs: typeof userPreferences) => {
    try {
      localStorage.setItem('friends-network-preferences', JSON.stringify(prefs))
      setUserPreferences(prefs)
    } catch (error) {
      console.warn('Failed to save Friends Network preferences:', error)
    }
  }, [])

  const shouldShowRecommendation = useCallback((): FriendsNetworkRecommendation | null => {
    if (userPreferences.enabledFriendsNetwork) return null
    if (userPreferences.dismissedCount >= 3) return null
    
    const now = new Date()
    if (userPreferences.lastDismissed && 
        now.getTime() - userPreferences.lastDismissed.getTime() < 24 * 60 * 60 * 1000) {
      return null
    }

    const benefits = []
    const estimatedImprovement = {
      offlineAccess: 0,
      connectivityResilience: 0,
      dataSync: 0
    }

    // Frequent offline sessions
    if (offlineAnalytics.offlineFrequency === 'frequent' || offlineAnalytics.offlineFrequency === 'constant') {
      benefits.push('Stay connected with friends even when your internet is unreliable')
      benefits.push('Access cached messages and content offline')
      estimatedImprovement.offlineAccess = 85
      estimatedImprovement.connectivityResilience = 70
      estimatedImprovement.dataSync = 60

      return {
        shouldShow: true,
        reason: 'frequent_offline',
        benefits,
        estimatedImprovement
      }
    }

    // Long offline sessions
    if (offlineAnalytics.longestOfflineSession > 10 * 60 * 1000) { // 10 minutes
      benefits.push('Mesh networking to reach friends through nearby devices')
      benefits.push('Automatic sync when connection returns')
      estimatedImprovement.offlineAccess = 60
      estimatedImprovement.connectivityResilience = 50
      estimatedImprovement.dataSync = 80

      return {
        shouldShow: true,
        reason: 'long_offline_duration',
        benefits,
        estimatedImprovement
      }
    }

    // Currently offline and first time
    if (!isOnline && !userPreferences.hasSeenRecommendation) {
      benefits.push('P2P messaging that works without internet')
      benefits.push('Connect through Bluetooth and local networks')
      benefits.push('Your messages sync automatically when back online')
      estimatedImprovement.offlineAccess = 90
      estimatedImprovement.connectivityResilience = 80
      estimatedImprovement.dataSync = 70

      return {
        shouldShow: true,
        reason: 'first_offline',
        benefits,
        estimatedImprovement
      }
    }

    return null
  }, [isOnline, offlineAnalytics, userPreferences])

  const enableFriendsNetwork = useCallback(async () => {
    try {
      emit('friends-network:enable:started', {})
      
      const newPrefs = {
        ...userPreferences,
        enabledFriendsNetwork: true,
        hasSeenRecommendation: true
      }
      saveUserPreferences(newPrefs)
      
      setRecommendation(null)
      emit('friends-network:enable:success', {})
      
      return true
    } catch (error) {
      emit('friends-network:enable:error', { error: error.message })
      return false
    }
  }, [emit, userPreferences, saveUserPreferences])

  const dismissRecommendation = useCallback(() => {
    const newPrefs = {
      ...userPreferences,
      hasSeenRecommendation: true,
      dismissedCount: userPreferences.dismissedCount + 1,
      lastDismissed: new Date()
    }
    saveUserPreferences(newPrefs)
    setRecommendation(null)
    emit('friends-network:recommendation:dismissed', { dismissedCount: newPrefs.dismissedCount })
  }, [userPreferences, saveUserPreferences, emit])

  useEffect(() => {
    loadUserPreferences()
  }, [loadUserPreferences])

  useEffect(() => {
    if (!isOnline || offlineAnalytics.offlineEvents > 0) {
      const rec = shouldShowRecommendation()
      if (rec) {
        setRecommendation(rec)
        emit('friends-network:recommendation:shown', rec)
      }
    }
  }, [isOnline, offlineAnalytics, shouldShowRecommendation, emit])

  return {
    recommendation,
    enableFriendsNetwork,
    dismissRecommendation,
    userPreferences,
    offlineCapabilities
  }
}

export const useFriendsOfflineOnboarding = () => {
  const { emit } = useFriendsCore('FriendsOfflineOnboarding')
  
  const [onboardingStep, setOnboardingStep] = useState<
    'welcome' | 'permissions' | 'peer_discovery' | 'encryption' | 'complete' | null
  >(null)
  
  const [permissions, setPermissions] = useState({
    bluetooth: false,
    location: false,
    notifications: false,
    storage: false
  })

  const requestBluetoothPermission = useCallback(async () => {
    try {
      if ('bluetooth' in navigator) {
        await navigator.bluetooth.requestDevice({
          acceptAllDevices: true,
          optionalServices: ['friends-network']
        })
        setPermissions(prev => ({ ...prev, bluetooth: true }))
        emit('onboarding:bluetooth:granted', {})
        return true
      }
    } catch (error) {
      emit('onboarding:bluetooth:denied', { error: error.message })
      return false
    }
  }, [emit])

  const requestLocationPermission = useCallback(async () => {
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject)
      })
      setPermissions(prev => ({ ...prev, location: true }))
      emit('onboarding:location:granted', { accuracy: position.coords.accuracy })
      return true
    } catch (error) {
      emit('onboarding:location:denied', { error: error.message })
      return false
    }
  }, [emit])

  const requestNotificationPermission = useCallback(async () => {
    try {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        setPermissions(prev => ({ ...prev, notifications: true }))
        emit('onboarding:notifications:granted', {})
        return true
      }
      emit('onboarding:notifications:denied', {})
      return false
    } catch (error) {
      emit('onboarding:notifications:error', { error: error.message })
      return false
    }
  }, [emit])

  const completeOnboarding = useCallback(() => {
    setOnboardingStep('complete')
    emit('onboarding:completed', { permissions })
    
    setTimeout(() => {
      setOnboardingStep(null)
    }, 3000)
  }, [permissions, emit])

  const startOnboarding = useCallback(() => {
    setOnboardingStep('welcome')
    emit('onboarding:started', {})
  }, [emit])

  return {
    onboardingStep,
    permissions,
    requestBluetoothPermission,
    requestLocationPermission,
    requestNotificationPermission,
    completeOnboarding,
    startOnboarding,
    setOnboardingStep
  }
}