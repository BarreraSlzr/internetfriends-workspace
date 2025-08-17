// WebRTC Friend Connection Service
// Direct peer-to-peer data sharing with steady patterns

'use client'

export interface WebRTCConnection {
  friendId: string
  friendName: string
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'failed'
  dataChannel: RTCDataChannel | null
  peerConnection: RTCPeerConnection | null
  lastContact: string
}

export interface P2PDataMessage {
  type: 'market_ticker' | 'analytics_event' | 'ping' | 'user_status' | 'custom'
  data: any
  timestamp: string
  fromUser: string
  messageId: string
}

interface WebRTCConfig {
  iceServers: RTCIceServer[]
  maxConnections: number
  heartbeatInterval: number
  reconnectAttempts: number
}

class WebRTCFriendService {
  private connections = new Map<string, WebRTCConnection>()
  private config: WebRTCConfig
  private heartbeatTimer: NodeJS.Timeout | null = null
  private messageHandlers = new Map<string, (message: P2PDataMessage) => void>()
  private statusHandlers = new Set<(status: { friendId: string; state: string }) => void>()

  constructor(config?: Partial<WebRTCConfig>) {
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        // Add TURN servers for production
      ],
      maxConnections: 10,
      heartbeatInterval: 30000, // 30 seconds
      reconnectAttempts: 3,
      ...config
    }
    
    this.startHeartbeat()
  }

  // Create outgoing connection to a friend
  async connectToFriend(friendId: string, friendName: string, signalServer?: string): Promise<boolean> {
    if (this.connections.has(friendId)) {
      console.log('Already connected to', friendId)
      return true
    }

    if (this.connections.size >= this.config.maxConnections) {
      console.warn('Maximum connections reached')
      return false
    }

    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers
      })

      // Create data channel
      const dataChannel = peerConnection.createDataChannel('gorich-data', {
        ordered: true
      })

      const connection: WebRTCConnection = {
        friendId,
        friendName,
        connectionState: 'connecting',
        dataChannel,
        peerConnection,
        lastContact: new Date().toISOString()
      }

      this.setupPeerConnectionHandlers(connection)
      this.setupDataChannelHandlers(connection)

      // Store connection
      this.connections.set(friendId, connection)

      // Create and send offer
      const offer = await peerConnection.createOffer()
      await peerConnection.setLocalDescription(offer)

      // In a real implementation, you'd send this offer through a signaling server
      // For demo purposes, we'll simulate successful connection
      await this.simulateSignaling(connection, offer)

      return true

    } catch (error) {
      console.error('Failed to connect to friend:', error)
      this.removeConnection(friendId)
      return false
    }
  }

  // Accept incoming connection from a friend
  async acceptFriendConnection(friendId: string, friendName: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: this.config.iceServers
      })

      const connection: WebRTCConnection = {
        friendId,
        friendName,
        connectionState: 'connecting',
        dataChannel: null, // Will be set when data channel is received
        peerConnection,
        lastContact: new Date().toISOString()
      }

      this.setupPeerConnectionHandlers(connection)

      // Handle incoming data channel
      peerConnection.ondatachannel = (event) => {
        connection.dataChannel = event.channel
        this.setupDataChannelHandlers(connection)
      }

      // Set remote description and create answer
      await peerConnection.setRemoteDescription(offer)
      const answer = await peerConnection.createAnswer()
      await peerConnection.setLocalDescription(answer)

      this.connections.set(friendId, connection)

      return answer

    } catch (error) {
      console.error('Failed to accept friend connection:', error)
      return null
    }
  }

  // Send data to a specific friend
  sendToFriend(friendId: string, data: Omit<P2PDataMessage, 'timestamp' | 'fromUser' | 'messageId'>): boolean {
    const connection = this.connections.get(friendId)
    
    if (!connection || connection.connectionState !== 'connected' || !connection.dataChannel) {
      console.warn('Cannot send to friend - not connected:', friendId)
      return false
    }

    const message: P2PDataMessage = {
      ...data,
      timestamp: new Date().toISOString(),
      fromUser: 'current-user', // Would come from auth context
      messageId: crypto.randomUUID()
    }

    try {
      connection.dataChannel.send(JSON.stringify(message))
      connection.lastContact = new Date().toISOString()
      return true
    } catch (error) {
      console.error('Failed to send message to friend:', error)
      return false
    }
  }

  // Broadcast data to all connected friends
  broadcastToFriends(data: Omit<P2PDataMessage, 'timestamp' | 'fromUser' | 'messageId'>): number {
    let sentCount = 0
    
    for (const [friendId] of this.connections) {
      if (this.sendToFriend(friendId, data)) {
        sentCount++
      }
    }
    
    return sentCount
  }

  // Subscribe to incoming messages by type
  onMessage(type: string, handler: (message: P2PDataMessage) => void): void {
    this.messageHandlers.set(type, handler)
  }

  // Subscribe to connection status changes
  onStatusChange(handler: (status: { friendId: string; state: string }) => void): void {
    this.statusHandlers.add(handler)
  }

  // Get current connections
  getConnections(): WebRTCConnection[] {
    return Array.from(this.connections.values())
  }

  // Disconnect from a friend
  disconnectFriend(friendId: string): void {
    const connection = this.connections.get(friendId)
    if (!connection) return

    connection.dataChannel?.close()
    connection.peerConnection?.close()
    
    this.removeConnection(friendId)
  }

  // Disconnect from all friends
  disconnectAll(): void {
    for (const [friendId] of this.connections) {
      this.disconnectFriend(friendId)
    }
  }

  // Private methods
  private setupPeerConnectionHandlers(connection: WebRTCConnection): void {
    const { peerConnection, friendId } = connection

    peerConnection.onconnectionstatechange = () => {
      const state = peerConnection.connectionState
      connection.connectionState = state as any
      
      console.log(`Friend ${friendId} connection state:`, state)
      
      this.notifyStatusChange(friendId, state)
      
      if (state === 'failed' || state === 'closed') {
        this.removeConnection(friendId)
      }
    }

    peerConnection.oniceconnectionstatechange = () => {
      console.log(`Friend ${friendId} ICE state:`, peerConnection.iceConnectionState)
    }
  }

  private setupDataChannelHandlers(connection: WebRTCConnection): void {
    const { dataChannel, friendId } = connection
    
    if (!dataChannel) return

    dataChannel.onopen = () => {
      console.log(`Data channel opened with friend: ${friendId}`)
      connection.connectionState = 'connected'
      this.notifyStatusChange(friendId, 'connected')
      
      // Send initial ping
      this.sendToFriend(friendId, {
        type: 'ping',
        data: { message: 'Connected to go.rich gateway' }
      })
    }

    dataChannel.onmessage = (event) => {
      try {
        const message: P2PDataMessage = JSON.parse(event.data)
        connection.lastContact = new Date().toISOString()
        
        // Handle message by type
        const handler = this.messageHandlers.get(message.type)
        if (handler) {
          handler(message)
        }
        
        // Handle ping responses
        if (message.type === 'ping') {
          this.sendToFriend(friendId, {
            type: 'ping',
            data: { message: 'pong', originalMessageId: message.messageId }
          })
        }

      } catch (error) {
        console.error('Failed to parse friend message:', error)
      }
    }

    dataChannel.onerror = (error) => {
      console.error('Data channel error:', error)
    }

    dataChannel.onclose = () => {
      console.log(`Data channel closed with friend: ${friendId}`)
      connection.connectionState = 'disconnected'
      this.notifyStatusChange(friendId, 'disconnected')
    }
  }

  private async simulateSignaling(connection: WebRTCConnection, offer: RTCSessionDescriptionInit): Promise<void> {
    // In a real app, this would go through a signaling server
    // For demo, we'll simulate a successful connection after a delay
    
    setTimeout(async () => {
      try {
        // Simulate receiving an answer
        const answer: RTCSessionDescriptionInit = {
          type: 'answer',
          sdp: 'v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\na=group:BUNDLE 0\r\nm=application 9 UDP/DTLS/SCTP webrtc-datachannel\r\nc=IN IP4 0.0.0.0\r\na=ice-ufrag:demo\r\na=ice-pwd:demo123\r\na=fingerprint:sha-256 00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00:00\r\na=setup:active\r\na=mid:0\r\na=sctp-port:5000\r\na=max-message-size:262144\r\n'
        }
        
        await connection.peerConnection?.setRemoteDescription(answer)
        
        // Simulate successful connection
        setTimeout(() => {
          if (connection.dataChannel) {
            // Trigger connection events manually for demo
            connection.connectionState = 'connected'
            this.notifyStatusChange(connection.friendId, 'connected')
            
            console.log(`✅ Demo connection established with ${connection.friendName}`)
          }
        }, 1000)
        
      } catch (error) {
        console.error('Simulated signaling failed:', error)
        connection.connectionState = 'failed'
        this.notifyStatusChange(connection.friendId, 'failed')
      }
    }, 2000) // 2 second delay to simulate network
  }

  private startHeartbeat(): void {
    this.heartbeatTimer = setInterval(() => {
      // Send ping to all connected friends
      for (const [friendId] of this.connections) {
        this.sendToFriend(friendId, {
          type: 'ping',
          data: { heartbeat: true }
        })
      }
      
      // Check for stale connections
      const now = new Date().getTime()
      for (const [friendId, connection] of this.connections) {
        const lastContact = new Date(connection.lastContact).getTime()
        if (now - lastContact > this.config.heartbeatInterval * 3) {
          console.warn('Stale connection detected:', friendId)
          this.disconnectFriend(friendId)
        }
      }
    }, this.config.heartbeatInterval)
  }

  private notifyStatusChange(friendId: string, state: string): void {
    for (const handler of this.statusHandlers) {
      handler({ friendId, state })
    }
  }

  private removeConnection(friendId: string): void {
    this.connections.delete(friendId)
    this.notifyStatusChange(friendId, 'disconnected')
  }

  // Cleanup
  destroy(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
    }
    this.disconnectAll()
  }
}

// React hook for WebRTC friend connections
export function useWebRTCFriends() {
  const [service] = useState(() => new WebRTCFriendService())
  const [connections, setConnections] = useState<WebRTCConnection[]>([])
  const [lastMessage, setLastMessage] = useState<P2PDataMessage | null>(null)

  useState(() => {
    // Subscribe to status changes
    service.onStatusChange(({ friendId, state }) => {
      setConnections(service.getConnections())
    })

    // Subscribe to all message types
    service.onMessage('market_ticker', setLastMessage)
    service.onMessage('analytics_event', setLastMessage)
    service.onMessage('user_status', setLastMessage)
    service.onMessage('custom', setLastMessage)

    return () => service.destroy()
  })

  return {
    service,
    connections,
    lastMessage,
    connectToFriend: (friendId: string, friendName: string) => 
      service.connectToFriend(friendId, friendName),
    sendToFriend: (friendId: string, data: any) => 
      service.sendToFriend(friendId, data),
    broadcastToFriends: (data: any) => 
      service.broadcastToFriends(data),
    disconnectFriend: (friendId: string) => 
      service.disconnectFriend(friendId),
    connectedCount: connections.filter(c => c.connectionState === 'connected').length
  }
}

export default WebRTCFriendService