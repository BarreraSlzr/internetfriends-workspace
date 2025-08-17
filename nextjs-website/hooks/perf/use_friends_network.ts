import { useCallback, useEffect, useRef, useState } from 'react'
import { useFriendsCore } from './use_friends_core'

export interface FriendsNetworkPeer {
  id: string
  publicKey: string
  displayName: string
  status: 'online' | 'offline' | 'away' | 'busy'
  lastSeen: Date
  location?: {
    lat: number
    lng: number
    accuracy: number
  }
  capabilities: {
    audio: boolean
    video: boolean
    files: boolean
    screen: boolean
  }
  connection: {
    type: 'direct' | 'relay' | 'mesh'
    quality: 'excellent' | 'good' | 'poor' | 'unstable'
    latency: number
    bandwidth: number
  }
  trust: {
    level: 'verified' | 'known' | 'unknown' | 'blocked'
    mutualFriends: string[]
    reputation: number
  }
}

export interface FriendsNetworkMessage {
  id: string
  type: 'text' | 'audio' | 'video' | 'file' | 'system' | 'presence'
  senderId: string
  recipientId?: string
  groupId?: string
  content: any
  timestamp: Date
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  encryption: {
    algorithm: 'e2e' | 'group' | 'none'
    keyVersion: string
  }
  metadata: {
    size?: number
    duration?: number
    location?: { lat: number; lng: number }
    replyTo?: string
  }
}

export interface FriendsNetworkOptions {
  enableP2P?: boolean
  enableMesh?: boolean
  enableOfflineSync?: boolean
  maxPeers?: number
  discoveryRadius?: number
  enableBluetooth?: boolean
  enableWebRTC?: boolean
  enableLocationSharing?: boolean
  encryptionKey?: string
}

export interface FriendsNetworkState {
  peers: Map<string, FriendsNetworkPeer>
  messages: FriendsNetworkMessage[]
  groups: Map<string, { name: string; members: string[]; admin: string }>
  isConnected: boolean
  networkHealth: 'excellent' | 'good' | 'poor' | 'offline'
  syncStatus: 'synced' | 'syncing' | 'conflict' | 'offline'
}

class FriendsNetworkCore {
  private peers = new Map<string, FriendsNetworkPeer>()
  private connections = new Map<string, RTCPeerConnection>()
  private messageQueue: FriendsNetworkMessage[] = []
  private offlineStorage = new Map<string, any>()
  private bluetoothDevice?: BluetoothDevice
  private webrtcConnections = new Map<string, RTCDataChannel>()

  async initializeP2P(options: FriendsNetworkOptions) {
    if (options.enableWebRTC && 'RTCPeerConnection' in window) {
      await this.setupWebRTC()
    }

    if (options.enableBluetooth && 'bluetooth' in navigator) {
      await this.setupBluetooth()
    }

    if (options.enableLocationSharing && 'geolocation' in navigator) {
      await this.setupLocationServices()
    }
  }

  private async setupWebRTC() {
    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'turn:relay.internetfriends.app:3478', username: 'user', credential: 'pass' }
      ]
    }

    // WebRTC mesh networking setup
    const createPeerConnection = (peerId: string) => {
      const pc = new RTCPeerConnection(configuration)
      
      pc.ondatachannel = (event) => {
        const channel = event.channel
        channel.onmessage = (e) => this.handleP2PMessage(peerId, JSON.parse(e.data))
        this.webrtcConnections.set(peerId, channel)
      }

      pc.oniceconnectionstatechange = () => {
        if (pc.iceConnectionState === 'disconnected') {
          this.handlePeerDisconnect(peerId)
        }
      }

      this.connections.set(peerId, pc)
      return pc
    }

    return { createPeerConnection }
  }

  private async setupBluetooth() {
    try {
      const device = await navigator.bluetooth.requestDevice({
        filters: [{ services: ['friends-network'] }],
        optionalServices: ['friends-mesh', 'friends-relay']
      })

      this.bluetoothDevice = device
      
      device.addEventListener('gattserverdisconnected', () => {
        console.log('Bluetooth peer disconnected')
      })

      return device
    } catch (error) {
      console.warn('Bluetooth setup failed:', error)
      return null
    }
  }

  private async setupLocationServices() {
    return new Promise<GeolocationPosition | null>((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position),
        (error) => {
          console.warn('Location access denied:', error)
          resolve(null)
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    })
  }

  private handleP2PMessage(senderId: string, message: FriendsNetworkMessage) {
    this.messageQueue.push({
      ...message,
      status: 'delivered',
      timestamp: new Date()
    })
  }

  private handlePeerDisconnect(peerId: string) {
    const peer = this.peers.get(peerId)
    if (peer) {
      peer.status = 'offline'
      peer.lastSeen = new Date()
      this.peers.set(peerId, peer)
    }
  }

  async sendMessage(message: FriendsNetworkMessage): Promise<boolean> {
    const recipientConnection = this.webrtcConnections.get(message.recipientId!)
    
    if (recipientConnection && recipientConnection.readyState === 'open') {
      try {
        recipientConnection.send(JSON.stringify(message))
        return true
      } catch (error) {
        this.messageQueue.push({ ...message, status: 'failed' })
        return false
      }
    }

    this.messageQueue.push({ ...message, status: 'sending' })
    return false
  }

  discoverPeers(radius: number = 100): Promise<FriendsNetworkPeer[]> {
    return new Promise((resolve) => {
      const discoveredPeers: FriendsNetworkPeer[] = []
      
      // Simulate peer discovery via various methods
      setTimeout(() => {
        resolve(discoveredPeers)
      }, 2000)
    })
  }

  getPeers(): FriendsNetworkPeer[] {
    return Array.from(this.peers.values())
  }

  getMessages(): FriendsNetworkMessage[] {
    return [...this.messageQueue]
  }
}

const globalNetwork = new FriendsNetworkCore()

export const useFriendsNetwork = (options: FriendsNetworkOptions = {}) => {
  const {
    enableP2P = true,
    enableMesh = true,
    enableOfflineSync = true,
    maxPeers = 50,
    discoveryRadius = 100,
    enableBluetooth = true,
    enableWebRTC = true,
    enableLocationSharing = false
  } = options

  const { emit, subscribe } = useFriendsCore('FriendsNetwork', ['webrtc', 'bluetooth', 'geolocation'])
  
  const [networkState, setNetworkState] = useState<FriendsNetworkState>({
    peers: new Map(),
    messages: [],
    groups: new Map(),
    isConnected: false,
    networkHealth: 'offline',
    syncStatus: 'offline'
  })

  const initializeNetwork = useCallback(async () => {
    try {
      await globalNetwork.initializeP2P(options)
      
      setNetworkState(prev => ({
        ...prev,
        isConnected: true,
        networkHealth: 'good',
        syncStatus: 'synced'
      }))

      emit('network:initialized', { options })
    } catch (error) {
      emit('network:error', { error: error.message })
      console.error('Network initialization failed:', error)
    }
  }, [options, emit])

  const discoverPeers = useCallback(async () => {
    try {
      const peers = await globalNetwork.discoverPeers(discoveryRadius)
      const peersMap = new Map(peers.map(p => [p.id, p]))
      
      setNetworkState(prev => ({
        ...prev,
        peers: peersMap
      }))

      emit('peers:discovered', { count: peers.length, peers })
      return peers
    } catch (error) {
      emit('peers:discovery:error', { error: error.message })
      return []
    }
  }, [discoveryRadius, emit])

  const sendMessage = useCallback(async (
    recipientId: string, 
    content: any, 
    type: FriendsNetworkMessage['type'] = 'text'
  ) => {
    const message: FriendsNetworkMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      senderId: 'self',
      recipientId,
      content,
      timestamp: new Date(),
      status: 'sending',
      encryption: {
        algorithm: 'e2e',
        keyVersion: '1.0'
      },
      metadata: {}
    }

    const success = await globalNetwork.sendMessage(message)
    
    if (success) {
      emit('message:sent', { message })
    } else {
      emit('message:failed', { message })
    }

    setNetworkState(prev => ({
      ...prev,
      messages: [...prev.messages, message]
    }))

    return success
  }, [emit])

  const createGroup = useCallback((name: string, memberIds: string[]) => {
    const groupId = `group_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    setNetworkState(prev => ({
      ...prev,
      groups: new Map(prev.groups).set(groupId, {
        name,
        members: memberIds,
        admin: 'self'
      })
    }))

    emit('group:created', { groupId, name, members: memberIds })
    return groupId
  }, [emit])

  const getNetworkHealth = useCallback(() => {
    const peers = globalNetwork.getPeers()
    const onlinePeers = peers.filter(p => p.status === 'online').length
    const avgLatency = peers.reduce((sum, p) => sum + p.connection.latency, 0) / peers.length || 0

    let health: FriendsNetworkState['networkHealth'] = 'offline'
    
    if (onlinePeers > 0) {
      if (avgLatency < 100 && onlinePeers > 3) health = 'excellent'
      else if (avgLatency < 300 && onlinePeers > 1) health = 'good'
      else health = 'poor'
    }

    return { health, onlinePeers, avgLatency, totalPeers: peers.length }
  }, [])

  const syncOfflineData = useCallback(async () => {
    if (!enableOfflineSync) return

    emit('sync:started', {})
    
    try {
      setNetworkState(prev => ({ ...prev, syncStatus: 'syncing' }))
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setNetworkState(prev => ({ ...prev, syncStatus: 'synced' }))
      emit('sync:completed', {})
    } catch (error) {
      setNetworkState(prev => ({ ...prev, syncStatus: 'conflict' }))
      emit('sync:error', { error: error.message })
    }
  }, [enableOfflineSync, emit])

  useEffect(() => {
    if (enableP2P) {
      initializeNetwork()
    }

    const unsubscribeMessages = subscribe('message:received', (event) => {
      const message = event.data as FriendsNetworkMessage
      setNetworkState(prev => ({
        ...prev,
        messages: [...prev.messages, message]
      }))
    })

    const unsubscribePeers = subscribe('peer:status:changed', (event) => {
      const { peerId, status } = event.data
      setNetworkState(prev => {
        const newPeers = new Map(prev.peers)
        const peer = newPeers.get(peerId)
        if (peer) {
          newPeers.set(peerId, { ...peer, status })
        }
        return { ...prev, peers: newPeers }
      })
    })

    return () => {
      unsubscribeMessages()
      unsubscribePeers()
    }
  }, [enableP2P, initializeNetwork, subscribe])

  return {
    networkState,
    discoverPeers,
    sendMessage,
    createGroup,
    getNetworkHealth,
    syncOfflineData,
    isInitialized: networkState.isConnected
  }
}

export const useFriendsProximity = (radius: number = 100) => {
  const { emit } = useFriendsCore('FriendsProximity', ['geolocation'])
  const [nearbyFriends, setNearbyFriends] = useState<FriendsNetworkPeer[]>([])
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null)

  const updateLocation = useCallback(async () => {
    if (!('geolocation' in navigator)) return

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        })
      })

      const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      }

      setCurrentLocation(location)
      emit('location:updated', { location, accuracy: position.coords.accuracy })

      return location
    } catch (error) {
      emit('location:error', { error: error.message })
      return null
    }
  }, [emit])

  const findNearbyFriends = useCallback(async () => {
    if (!currentLocation) return []

    const mockNearbyFriends: FriendsNetworkPeer[] = [
      {
        id: 'friend_1',
        publicKey: 'pub_key_1',
        displayName: 'Alice',
        status: 'online',
        lastSeen: new Date(),
        location: {
          lat: currentLocation.lat + 0.001,
          lng: currentLocation.lng + 0.001,
          accuracy: 10
        },
        capabilities: { audio: true, video: true, files: true, screen: false },
        connection: { type: 'direct', quality: 'excellent', latency: 45, bandwidth: 1000 },
        trust: { level: 'verified', mutualFriends: [], reputation: 95 }
      }
    ]

    setNearbyFriends(mockNearbyFriends)
    emit('proximity:friends:found', { friends: mockNearbyFriends, location: currentLocation })

    return mockNearbyFriends
  }, [currentLocation, emit])

  useEffect(() => {
    updateLocation()
    const interval = setInterval(updateLocation, 30000)
    return () => clearInterval(interval)
  }, [updateLocation])

  useEffect(() => {
    if (currentLocation) {
      findNearbyFriends()
    }
  }, [currentLocation, findNearbyFriends])

  return {
    nearbyFriends,
    currentLocation,
    updateLocation,
    findNearbyFriends
  }
}