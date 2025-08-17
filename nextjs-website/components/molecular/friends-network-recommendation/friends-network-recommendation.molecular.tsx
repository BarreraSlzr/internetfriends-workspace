"use client"

import React, { useEffect, useState } from 'react'
import { useFriendsNetworkRecommendation, useFriendsOfflineOnboarding } from '@/hooks/perf/use_friends_offline_recommendation'

export interface FriendsNetworkRecommendationProps {
  className?: string
  showAsModal?: boolean
  onComplete?: () => void
}

export const FriendsNetworkRecommendationCard: React.FC<FriendsNetworkRecommendationProps> = ({
  className = '',
  showAsModal = false,
  onComplete
}) => {
  const { 
    recommendation, 
    enableFriendsNetwork, 
    dismissRecommendation,
    offlineCapabilities 
  } = useFriendsNetworkRecommendation()
  
  const {
    onboardingStep,
    permissions,
    requestBluetoothPermission,
    requestLocationPermission,
    requestNotificationPermission,
    completeOnboarding,
    startOnboarding,
    setOnboardingStep
  } = useFriendsOfflineOnboarding()

  const [isExpanded, setIsExpanded] = useState(false)

  const handleEnableNetwork = async () => {
    const success = await enableFriendsNetwork()
    if (success) {
      startOnboarding()
    }
  }

  const getRecommendationTitle = () => {
    switch (recommendation?.reason) {
      case 'frequent_offline':
        return '🔌 Frequent disconnections detected'
      case 'long_offline_duration':
        return '⏰ Long offline sessions detected'
      case 'poor_connection':
        return '📶 Poor connection quality detected'
      case 'first_offline':
        return '📱 You&apos;re offline - stay connected with Friends Network'
      default:
        return '🌐 Enable Friends Network'
    }
  }

  const getRecommendationDescription = () => {
    switch (recommendation?.reason) {
      case 'frequent_offline':
        return 'Your internet connection is unstable. Friends Network can keep you connected through peer-to-peer mesh networking.'
      case 'long_offline_duration':
        return 'You&apos;ve been offline for extended periods. Friends Network enables offline messaging and automatic sync.'
      case 'poor_connection':
        return 'Your connection quality is poor. P2P networking can provide better reliability through nearby devices.'
      case 'first_offline':
        return 'Stay connected with friends even without internet! Enable mesh networking for offline communication.'
      default:
        return 'Enhance your connectivity with peer-to-peer networking and offline capabilities.'
    }
  }

  const renderCapabilityCheck = (capability: keyof typeof offlineCapabilities, label: string) => (
    <div className="flex items-center gap-2 text-sm">
      <span className={offlineCapabilities[capability] ? 'text-green-500' : 'text-red-500'}>
        {offlineCapabilities[capability] ? '✅' : '❌'}
      </span>
      <span className="text-gray-600">{label}</span>
    </div>
  )

  const renderOnboardingStep = () => {
    switch (onboardingStep) {
      case 'welcome':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Welcome to Friends Network! 🎉</h3>
            <p className="text-gray-600">
              Let&apos;s set up peer-to-peer networking to keep you connected even when offline.
            </p>
            <button 
              onClick={() => setOnboardingStep('permissions')}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Get Started
            </button>
          </div>
        )

      case 'permissions':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Grant Permissions 🔐</h3>
            <p className="text-gray-600 text-sm">
              We need these permissions to enable offline networking features:
            </p>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Bluetooth</div>
                  <div className="text-sm text-gray-500">Connect to nearby devices</div>
                </div>
                <button
                  onClick={requestBluetoothPermission}
                  disabled={permissions.bluetooth}
                  className={`px-3 py-1 rounded text-sm ${
                    permissions.bluetooth 
                      ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {permissions.bluetooth ? 'Granted' : 'Grant'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Location (Optional)</div>
                  <div className="text-sm text-gray-500">Find nearby friends</div>
                </div>
                <button
                  onClick={requestLocationPermission}
                  disabled={permissions.location}
                  className={`px-3 py-1 rounded text-sm ${
                    permissions.location 
                      ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {permissions.location ? 'Granted' : 'Grant'}
                </button>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Notifications</div>
                  <div className="text-sm text-gray-500">Message alerts</div>
                </div>
                <button
                  onClick={requestNotificationPermission}
                  disabled={permissions.notifications}
                  className={`px-3 py-1 rounded text-sm ${
                    permissions.notifications 
                      ? 'bg-green-100 text-green-700 cursor-not-allowed' 
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                  }`}
                >
                  {permissions.notifications ? 'Granted' : 'Grant'}
                </button>
              </div>
            </div>

            <button 
              onClick={() => setOnboardingStep('peer_discovery')}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Continue
            </button>
          </div>
        )

      case 'peer_discovery':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Discovering Peers 🔍</h3>
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
            <p className="text-center text-gray-600">
              Looking for nearby Friends Network users...
            </p>
            <button 
              onClick={() => setOnboardingStep('encryption')}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Skip Discovery
            </button>
          </div>
        )

      case 'encryption':
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Encryption Setup 🔒</h3>
            <p className="text-gray-600 text-sm">
              Your messages are automatically encrypted end-to-end. Your encryption keys are being generated...
            </p>
            <div className="bg-gray-100 p-3 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">🔐</span>
                <span>End-to-end encryption enabled</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">🛡️</span>
                <span>Zero-knowledge architecture</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-green-500">🔄</span>
                <span>Forward secrecy protection</span>
              </div>
            </div>
            <button 
              onClick={completeOnboarding}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
            >
              Complete Setup
            </button>
          </div>
        )

      case 'complete':
        return (
          <div className="space-y-4 text-center">
            <div className="text-4xl">🎉</div>
            <h3 className="text-lg font-semibold text-green-600">Friends Network Enabled!</h3>
            <p className="text-gray-600">
              You&apos;re now connected to the mesh network. You&apos;ll stay connected even when offline!
            </p>
            <div className="flex justify-center">
              <div className="animate-pulse bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm">
                🌐 Connected to mesh network
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  useEffect(() => {
    if (onboardingStep === null && onComplete) {
      onComplete()
    }
  }, [onboardingStep, onComplete])

  if (!recommendation && !onboardingStep) return null

  const containerClasses = `
    ${showAsModal ? 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' : ''}
    ${className}
  `

  const cardClasses = `
    bg-white rounded-xl shadow-lg border border-gray-200 p-6 max-w-md w-full mx-auto
    ${showAsModal ? 'm-4' : ''}
  `

  return (
    <div className={containerClasses}>
      <div className={cardClasses}>
        {onboardingStep ? (
          renderOnboardingStep()
        ) : (
          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold">{getRecommendationTitle()}</h3>
              <button 
                onClick={dismissRecommendation}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ×
              </button>
            </div>

            <p className="text-gray-600 text-sm">
              {getRecommendationDescription()}
            </p>

            {recommendation?.estimatedImprovement && (
              <div className="bg-blue-50 p-3 rounded-lg space-y-2">
                <div className="text-sm font-medium text-blue-800">Estimated improvements:</div>
                <div className="text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Offline access:</span>
                    <span className="font-medium">+{recommendation.estimatedImprovement.offlineAccess}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Connection resilience:</span>
                    <span className="font-medium">+{recommendation.estimatedImprovement.connectivityResilience}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Data sync reliability:</span>
                    <span className="font-medium">+{recommendation.estimatedImprovement.dataSync}%</span>
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <h4 className="text-sm font-medium">Benefits:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {recommendation?.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-500 mt-0.5">•</span>
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {isExpanded ? 'Hide' : 'Show'} technical details
            </button>

            {isExpanded && (
              <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                <div className="text-sm font-medium">Device capabilities:</div>
                <div className="space-y-1">
                  {renderCapabilityCheck('webRTC', 'WebRTC P2P')}
                  {renderCapabilityCheck('bluetooth', 'Bluetooth')}
                  {renderCapabilityCheck('serviceWorker', 'Service Worker')}
                  {renderCapabilityCheck('indexedDB', 'Local Database')}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                onClick={dismissRecommendation}
                className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Not Now
              </button>
              <button
                onClick={handleEnableNetwork}
                className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
              >
                Enable Network
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}