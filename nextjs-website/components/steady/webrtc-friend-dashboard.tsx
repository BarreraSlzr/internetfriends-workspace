// WebRTC Friend Connection Dashboard
// Real-time peer-to-peer data sharing interface

'use client'

import React, { useState, useEffect } from 'react'
import { useWebRTCFriends, type WebRTCConnection, type P2PDataMessage } from '@/lib/steady/webrtc-friend-service'
import { useAuth, usePermissions } from '@/lib/auth/go-rich-auth'

interface WebRTCFriendDashboardProps {
  title?: string
  className?: string
  disabled?: boolean
  maxConnections?: number
  onDataReceived?: (data: P2PDataMessage) => void
}

const WebRTCFriendDashboard: React.FC<WebRTCFriendDashboardProps> = ({
  title = 'P2P Friend Connections',
  className = '',
  disabled = false,
  maxConnections = 10,
  onDataReceived
}) => {
  const { user } = useAuth()
  const permissions = usePermissions()
  const { 
    service, 
    connections, 
    lastMessage, 
    connectToFriend, 
    sendToFriend, 
    broadcastToFriends, 
    disconnectFriend,
    connectedCount 
  } = useWebRTCFriends()
  
  const [newFriendId, setNewFriendId] = useState('')
  const [newFriendName, setNewFriendName] = useState('')
  const [isConnecting, setIsConnecting] = useState(false)
  const [broadcastMessage, setBroadcastMessage] = useState('')
  const [messageHistory, setMessageHistory] = useState<P2PDataMessage[]>([])
  const [selectedFriend, setSelectedFriend] = useState<string | null>(null)

  // Handle incoming messages
  useEffect(() => {
    if (lastMessage) {
      setMessageHistory(prev => [lastMessage, ...prev.slice(0, 49)]) // Keep last 50
      onDataReceived?.(lastMessage)
    }
  }, [lastMessage, onDataReceived])

  // Check permissions
  if (!permissions.canShareData) {
    return (
      <div className={`${className} bg-white rounded-lg shadow p-6`}>
        <div className="text-center py-8">
          <div className="text-4xl mb-4">🔒</div>
          <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
          <p className="text-gray-600">Upgrade to Premium to enable peer-to-peer friend connections</p>
        </div>
      </div>
    )
  }

  const handleConnectFriend = async () => {
    if (!newFriendId.trim() || !newFriendName.trim() || isConnecting) return
    
    setIsConnecting(true)
    
    try {
      const success = await connectToFriend(newFriendId.trim(), newFriendName.trim())
      
      if (success) {
        setNewFriendId('')
        setNewFriendName('')
      }
    } catch (error) {
      console.error('Failed to connect to friend:', error)
    } finally {
      setIsConnecting(false)
    }
  }

  const handleSendMessage = (friendId: string, message: string) => {
    if (!message.trim()) return
    
    sendToFriend(friendId, {
      type: 'custom',
      data: { message: message.trim(), user: user?.name }
    })
  }

  const handleBroadcast = () => {
    if (!broadcastMessage.trim()) return
    
    const sent = broadcastToFriends({
      type: 'custom',
      data: { 
        message: broadcastMessage.trim(), 
        user: user?.name,
        broadcast: true
      }
    })
    
    console.log(`📡 Broadcast sent to ${sent} friends`)
    setBroadcastMessage('')
  }

  const shareMarketData = () => {
    // Demo: Share current BTC price
    broadcastToFriends({
      type: 'market_ticker',
      data: {
        symbol: 'BTC',
        price: 52000 + Math.random() * 1000,
        change: (Math.random() - 0.5) * 10,
        source: user?.name
      }
    })
  }

  if (disabled) {
    return <div className={`opacity-50 ${className}`}>WebRTC connections disabled</div>
  }

  return (
    <div className={`webrtc-friend-dashboard ${className}`}>
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <div className="flex items-center space-x-4 mt-2">
              <div className={`flex items-center space-x-2 ${
                connectedCount > 0 ? 'text-green-600' : 'text-gray-600'
              }`}>
                <div className={`w-2 h-2 rounded-full ${
                  connectedCount > 0 ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm">
                  {connectedCount} of {connections.length} friends connected
                </span>
              </div>
              <span className="text-sm text-gray-600">
                P2P Data Sharing
              </span>
            </div>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={shareMarketData}
              disabled={connectedCount === 0}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Share Market Data
            </button>
          </div>
        </div>

        {/* Add Friend */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            value={newFriendId}
            onChange={(e) => setNewFriendId(e.target.value)}
            placeholder="Friend ID (e.g., friend123)"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <input
            type="text"
            value={newFriendName}
            onChange={(e) => setNewFriendName(e.target.value)}
            placeholder="Friend Name"
            className="px-3 py-2 border border-gray-300 rounded-lg"
          />
          <button
            onClick={handleConnectFriend}
            disabled={isConnecting || !newFriendId.trim() || !newFriendName.trim()}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {isConnecting ? 'Connecting...' : 'Connect Friend'}
          </button>
        </div>

        {/* Broadcast Message */}
        <div className="mt-4 flex space-x-3">
          <input
            type="text"
            value={broadcastMessage}
            onChange={(e) => setBroadcastMessage(e.target.value)}
            placeholder="Broadcast message to all friends..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
            onKeyPress={(e) => e.key === 'Enter' && handleBroadcast()}
          />
          <button
            onClick={handleBroadcast}
            disabled={!broadcastMessage.trim() || connectedCount === 0}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            Broadcast
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Connections */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Active Connections ({connections.length})</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {connections.map((connection) => (
              <div 
                key={connection.friendId} 
                className={`p-4 cursor-pointer hover:bg-gray-50 ${
                  selectedFriend === connection.friendId ? 'bg-blue-50' : ''
                }`}
                onClick={() => setSelectedFriend(connection.friendId)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{connection.friendName}</div>
                    <div className="text-sm text-gray-600">{connection.friendId}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Last contact: {new Date(connection.lastContact).toLocaleTimeString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      connection.connectionState === 'connected' ? 'bg-green-100 text-green-800' :
                      connection.connectionState === 'connecting' ? 'bg-yellow-100 text-yellow-800' :
                      connection.connectionState === 'failed' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {connection.connectionState}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        disconnectFriend(connection.friendId)
                      }}
                      className="text-xs text-red-600 hover:text-red-700"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
                
                {/* Quick Actions */}
                {connection.connectionState === 'connected' && (
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleSendMessage(connection.friendId, '👋 Hello from go.rich!')
                      }}
                      className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
                    >
                      Send Ping
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        sendToFriend(connection.friendId, {
                          type: 'user_status',
                          data: { status: 'active', activity: 'trading', user: user?.name }
                        })
                      }}
                      className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded hover:bg-green-200"
                    >
                      Share Status
                    </button>
                  </div>
                )}
              </div>
            ))}
            
            {connections.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No friend connections yet. Add a friend to start P2P sharing!
              </div>
            )}
          </div>
        </div>

        {/* Message History */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="text-lg font-semibold">Message History</h3>
          </div>
          <div className="divide-y max-h-96 overflow-y-auto">
            {messageHistory.map((message, index) => (
              <div key={index} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded text-xs ${
                      message.type === 'market_ticker' ? 'bg-blue-100 text-blue-800' :
                      message.type === 'user_status' ? 'bg-green-100 text-green-800' :
                      message.type === 'custom' ? 'bg-purple-100 text-purple-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {message.type.replace('_', ' ')}
                    </span>
                    {message.data?.broadcast && (
                      <span className="text-xs text-orange-600">📡 Broadcast</span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(message.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="mt-2 text-sm">
                  <div className="font-medium">From: {message.fromUser}</div>
                  <div className="text-gray-600 mt-1">
                    {message.type === 'market_ticker' ? (
                      <span>{message.data.symbol}: ${message.data.price?.toFixed(2)} ({message.data.change > 0 ? '+' : ''}{message.data.change?.toFixed(2)}%)</span>
                    ) : message.type === 'user_status' ? (
                      <span>Status: {message.data.status} - {message.data.activity}</span>
                    ) : (
                      <span>{message.data.message || JSON.stringify(message.data).slice(0, 100)}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            
            {messageHistory.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No messages yet. Connect with friends to start sharing data!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stats Footer */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">{connectedCount}</div>
            <div className="text-sm text-gray-600">Connected</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">{messageHistory.length}</div>
            <div className="text-sm text-gray-600">Messages</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {messageHistory.filter(m => m.data?.broadcast).length}
            </div>
            <div className="text-sm text-gray-600">Broadcasts</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WebRTCFriendDashboard