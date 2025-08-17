// Friend-to-Friend Data Sharing Dashboard
// Real-time peer sync with steady addressability patterns

'use client'

import React, { useState, useEffect } from 'react'

export interface FriendConnection {
  friendId: string
  endpoint: string
  status: 'online' | 'offline' | 'syncing'
  lastSync: string
  shareLevel: 'basic' | 'market' | 'full'
  trusted: boolean
}

export interface SharedData {
  type: 'market_ticker' | 'analytics_event' | 'link_click' | 'custom'
  data: any
  fromFriend: string
  timestamp: string
  verified: boolean
}

interface FriendNetworkDashboardProps {
  title?: string
  className?: string
  disabled?: boolean
  autoSync?: boolean
  maxFriends?: number
  onDataReceived?: (data: SharedData) => void
}

const FriendNetworkDashboard: React.FC<FriendNetworkDashboardProps> = ({
  title = 'Friends Network',
  className = '',
  disabled = false,
  autoSync = true,
  maxFriends = 10,
  onDataReceived
}) => {
  const [friends, setFriends] = useState<FriendConnection[]>([])
  const [sharedData, setSharedData] = useState<SharedData[]>([])
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'error'>('idle')
  const [newFriendEndpoint, setNewFriendEndpoint] = useState('')
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)

  useEffect(() => {
    if (disabled) return
    
    loadFriendsNetwork()
    
    if (autoSync) {
      const interval = setInterval(syncWithFriends, 10000) // Every 10 seconds
      return () => clearInterval(interval)
    }
  }, [disabled, autoSync])

  const loadFriendsNetwork = async () => {
    try {
      const response = await fetch('/api/steady/gateway?action=friends')
      if (response.ok) {
        const data = await response.json()
        setFriends(data.friends || [])
      }
    } catch (error) {
      console.error('Failed to load friends network:', error)
    }
  }

  const syncWithFriends = async () => {
    if (friends.length === 0 || syncStatus === 'syncing') return
    
    setSyncStatus('syncing')
    
    try {
      for (const friend of friends) {
        if (friend.status === 'offline') continue
        
        // Simulate friend data sync
        const syncResponse = await fetch('/api/steady/gateway', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'sync_friend_data',
            friendId: friend.friendId,
            endpoint: friend.endpoint,
            shareLevel: friend.shareLevel
          })
        })
        
        if (syncResponse.ok) {
          const syncData = await syncResponse.json()
          
          // Update friend status
          setFriends(prev => prev.map(f => 
            f.friendId === friend.friendId 
              ? { ...f, status: 'online', lastSync: new Date().toISOString() }
              : f
          ))
          
          // Add shared data
          if (syncData.sharedData?.length > 0) {
            const newData = syncData.sharedData.map((item: any) => ({
              ...item,
              fromFriend: friend.friendId,
              timestamp: new Date().toISOString(),
              verified: friend.trusted
            }))
            
            setSharedData(prev => [...newData, ...prev].slice(0, 100)) // Keep last 100
            
            // Notify parent component
            if (onDataReceived) {
              newData.forEach(onDataReceived)
            }
          }
        }
      }
      
      setSyncStatus('idle')
    } catch (error) {
      console.error('Sync failed:', error)
      setSyncStatus('error')
    }
  }

  const addFriend = async () => {
    if (!newFriendEndpoint.trim()) return
    
    try {
      const response = await fetch('/api/steady/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_friend',
          endpoint: newFriendEndpoint.trim(),
          shareLevel: 'basic'
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        const newFriend: FriendConnection = {
          friendId: result.friendId || `friend_${Date.now()}`,
          endpoint: newFriendEndpoint.trim(),
          status: 'offline',
          lastSync: new Date().toISOString(),
          shareLevel: 'basic',
          trusted: false
        }
        
        setFriends(prev => [...prev, newFriend].slice(0, maxFriends))
        setNewFriendEndpoint('')
      }
    } catch (error) {
      console.error('Failed to add friend:', error)
    }
  }

  const removeFriend = async (friendId: string) => {
    try {
      await fetch('/api/steady/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'remove_friend',
          friendId
        })
      })
      
      setFriends(prev => prev.filter(f => f.friendId !== friendId))
      setSharedData(prev => prev.filter(d => d.fromFriend !== friendId))
    } catch (error) {
      console.error('Failed to remove friend:', error)
    }
  }

  const updateShareLevel = async (friendId: string, shareLevel: 'basic' | 'market' | 'full') => {
    try {
      await fetch('/api/steady/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_friend_sharing',
          friendId,
          shareLevel
        })
      })
      
      setFriends(prev => prev.map(f => 
        f.friendId === friendId ? { ...f, shareLevel } : f
      ))
    } catch (error) {
      console.error('Failed to update share level:', error)
    }
  }

  const shareDataWithFriend = async (friendId: string, data: any) => {
    try {
      await fetch('/api/steady/gateway', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'share_data',
          friendId,
          data
        })
      })
    } catch (error) {
      console.error('Failed to share data:', error)
    }
  }

  if (disabled) {
    return <div className={`opacity-50 ${className}`}>Friends network disabled</div>
  }

  return (
    <div className={`friends-network-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <div className="flex items-center space-x-4 mt-2">
              <div className={`flex items-center space-x-2 ${
                syncStatus === 'syncing' ? 'text-yellow-600' :
                syncStatus === 'error' ? 'text-red-600' : 'text-green-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  syncStatus === 'syncing' ? 'bg-yellow-500' :
                  syncStatus === 'error' ? 'bg-red-500' : 'bg-green-500'
                }`}></div>
                <span className="text-sm">
                  {syncStatus === 'syncing' ? 'Syncing...' :
                   syncStatus === 'error' ? 'Sync Error' : 'Synced'}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                {friends.filter(f => f.status === 'online').length} of {friends.length} online
              </span>
            </div>
          </div>
          <button
            onClick={syncWithFriends}
            disabled={syncStatus === 'syncing'}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Now'}
          </button>
        </div>

        {/* Add Friend */}
        <div className="mt-4 flex space-x-3">
          <input
            type="text"
            value={newFriendEndpoint}
            onChange={(e) => setNewFriendEndpoint(e.target.value)}
            placeholder="Friend endpoint (e.g., https://friend.go.rich)"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={addFriend}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Add Friend
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Friends List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Friends Network ({friends.length})</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {friends.map((friend) => (
              <div 
                key={friend.friendId} 
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedFriend === friend.friendId ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedFriend(friend.friendId)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{friend.friendId}</div>
                    <div className="text-sm text-gray-600 truncate">{friend.endpoint}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last sync: {new Date(friend.lastSync).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      friend.status === 'online' ? 'bg-green-100 text-green-800' :
                      friend.status === 'syncing' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {friend.status}
                    </div>
                    {friend.trusted && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full" title="Trusted"></div>
                    )}
                  </div>
                </div>
                
                {/* Share Level Controls */}
                <div className="mt-3 flex items-center space-x-2">
                  <span className="text-xs text-gray-500">Share:</span>
                  {(['basic', 'market', 'full'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={(e) => {
                        e.stopPropagation()
                        updateShareLevel(friend.friendId, level)
                      }}
                      className={`text-xs px-2 py-1 rounded ${
                        friend.shareLevel === level 
                          ? 'bg-purple-100 text-purple-800' 
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      removeFriend(friend.friendId)
                    }}
                    className="text-xs text-red-600 hover:text-red-700 ml-2"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Shared Data Stream */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Shared Data Stream</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {sharedData.map((item, index) => (
              <div key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      item.type === 'market_ticker' ? 'bg-blue-100 text-blue-800' :
                      item.type === 'analytics_event' ? 'bg-green-100 text-green-800' :
                      item.type === 'link_click' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {item.type.replace('_', ' ')}
                    </span>
                    {item.verified && (
                      <div className="w-2 h-2 bg-green-500 rounded-full" title="Verified"></div>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(item.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <div className="font-medium">From: {item.fromFriend}</div>
                  <div className="text-gray-600 mt-1">
                    {JSON.stringify(item.data).slice(0, 100)}...
                  </div>
                </div>
              </div>
            ))}
            {sharedData.length === 0 && (
              <div className="p-4 text-center text-gray-500">
                No shared data yet. Add friends to start sharing!
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default FriendNetworkDashboard