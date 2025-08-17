// Service Worker for Friends Network offline capabilities
const CACHE_NAME = 'friends-network-v1'
const OFFLINE_CACHE = 'friends-offline-v1'
const FRIENDS_DB_NAME = 'FriendsNetwork'
const FRIENDS_DB_VERSION = 1

// Core files to cache for offline functionality
const CORE_CACHE_FILES = [
  '/',
  '/friends-network',
  '/messages',
  '/offline',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
]

// Friends Network P2P message queue
let messageQueue = []
let peerConnections = new Map()

// IndexedDB setup for offline data
function openFriendsDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(FRIENDS_DB_NAME, FRIENDS_DB_VERSION)
    
    request.onerror = () => reject(request.error)
    request.onsuccess = () => resolve(request.result)
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result
      
      // Messages store
      if (!db.objectStoreNames.contains('messages')) {
        const messagesStore = db.createObjectStore('messages', { keyPath: 'id' })
        messagesStore.createIndex('timestamp', 'timestamp')
        messagesStore.createIndex('senderId', 'senderId')
        messagesStore.createIndex('status', 'status')
      }
      
      // Peers store
      if (!db.objectStoreNames.contains('peers')) {
        const peersStore = db.createObjectStore('peers', { keyPath: 'id' })
        peersStore.createIndex('lastSeen', 'lastSeen')
        peersStore.createIndex('status', 'status')
      }
      
      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id' })
        syncStore.createIndex('priority', 'priority')
        syncStore.createIndex('timestamp', 'timestamp')
      }
    }
  })
}

// Install event - cache core files
self.addEventListener('install', (event) => {
  console.log('[Friends SW] Installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(CORE_CACHE_FILES)
      }),
      openFriendsDB(),
      self.skipWaiting()
    ])
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', (event) => {
  console.log('[Friends SW] Activating...')
  
  event.waitUntil(
    Promise.all([
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && cacheName !== OFFLINE_CACHE) {
              return caches.delete(cacheName)
            }
          })
        )
      }),
      self.clients.claim()
    ])
  )
})

// Fetch event - offline-first strategy
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Handle Friends Network API calls
  if (url.pathname.startsWith('/api/friends/')) {
    event.respondWith(handleFriendsAPI(request))
    return
  }
  
  // Handle static assets and pages
  if (request.method === 'GET') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse
        }
        
        return fetch(request).then((response) => {
          // Cache successful responses
          if (response.status === 200) {
            const responseClone = response.clone()
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseClone)
            })
          }
          return response
        }).catch(() => {
          // Return offline fallback
          if (url.pathname.startsWith('/friends-network')) {
            return caches.match('/offline')
          }
          return new Response('Offline', { status: 503 })
        })
      })
    )
  }
})

// Handle Friends Network API requests
async function handleFriendsAPI(request) {
  const url = new URL(request.url)
  
  try {
    // Try network first
    const response = await fetch(request)
    
    if (response.ok) {
      // Cache successful API responses
      const responseClone = response.clone()
      const cache = await caches.open(OFFLINE_CACHE)
      cache.put(request, responseClone)
    }
    
    return response
  } catch (error) {
    console.log('[Friends SW] Network failed, trying cache...', error)
    
    // Fallback to cache
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Handle specific offline scenarios
    if (url.pathname.includes('/messages')) {
      return handleOfflineMessages(request)
    }
    
    if (url.pathname.includes('/peers')) {
      return handleOfflinePeers(request)
    }
    
    return new Response(JSON.stringify({ error: 'Offline', offline: true }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' }
    })
  }
}

// Handle offline messages
async function handleOfflineMessages(request) {
  const db = await openFriendsDB()
  const transaction = db.transaction(['messages'], 'readonly')
  const store = transaction.objectStore('messages')
  
  return new Promise((resolve) => {
    const getAllRequest = store.getAll()
    
    getAllRequest.onsuccess = () => {
      const messages = getAllRequest.result
      resolve(new Response(JSON.stringify({ messages, offline: true }), {
        headers: { 'Content-Type': 'application/json' }
      }))
    }
    
    getAllRequest.onerror = () => {
      resolve(new Response(JSON.stringify({ error: 'Database error', offline: true }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }))
    }
  })
}

// Handle offline peers
async function handleOfflinePeers(request) {
  const db = await openFriendsDB()
  const transaction = db.transaction(['peers'], 'readonly')
  const store = transaction.objectStore('peers')
  
  return new Promise((resolve) => {
    const getAllRequest = store.getAll()
    
    getAllRequest.onsuccess = () => {
      const peers = getAllRequest.result
      resolve(new Response(JSON.stringify({ peers, offline: true }), {
        headers: { 'Content-Type': 'application/json' }
      }))
    }
    
    getAllRequest.onerror = () => {
      resolve(new Response(JSON.stringify({ error: 'Database error', offline: true }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }))
    }
  })
}

// Background sync for message queue
self.addEventListener('sync', (event) => {
  console.log('[Friends SW] Background sync triggered:', event.tag)
  
  if (event.tag === 'friends-message-sync') {
    event.waitUntil(syncMessages())
  }
  
  if (event.tag === 'friends-peer-sync') {
    event.waitUntil(syncPeers())
  }
})

// Sync queued messages when back online
async function syncMessages() {
  try {
    const db = await openFriendsDB()
    const transaction = db.transaction(['syncQueue'], 'readonly')
    const store = transaction.objectStore('syncQueue')
    
    const queuedItems = await new Promise((resolve) => {
      const request = store.getAll()
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => resolve([])
    })
    
    for (const item of queuedItems) {
      if (item.type === 'message') {
        await syncMessage(item.data)
      }
    }
    
    // Clear successful sync items
    const writeTransaction = db.transaction(['syncQueue'], 'readwrite')
    const writeStore = writeTransaction.objectStore('syncQueue')
    
    for (const item of queuedItems) {
      writeStore.delete(item.id)
    }
    
    console.log('[Friends SW] Message sync completed')
  } catch (error) {
    console.error('[Friends SW] Message sync failed:', error)
  }
}

// Sync individual message
async function syncMessage(messageData) {
  try {
    const response = await fetch('/api/friends/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(messageData)
    })
    
    if (response.ok) {
      // Update message status in local DB
      const db = await openFriendsDB()
      const transaction = db.transaction(['messages'], 'readwrite')
      const store = transaction.objectStore('messages')
      
      const updatedMessage = { ...messageData, status: 'sent', syncedAt: new Date() }
      store.put(updatedMessage)
      
      // Notify clients
      self.clients.matchAll().then(clients => {
        clients.forEach(client => {
          client.postMessage({
            type: 'MESSAGE_SYNCED',
            data: updatedMessage
          })
        })
      })
    }
  } catch (error) {
    console.error('[Friends SW] Failed to sync message:', error)
  }
}

// Periodic background sync for keeping peer connections alive
self.addEventListener('periodicsync', (event) => {
  console.log('[Friends SW] Periodic sync triggered:', event.tag)
  
  if (event.tag === 'friends-peer-keepalive') {
    event.waitUntil(maintainPeerConnections())
  }
})

// Maintain P2P connections in background
async function maintainPeerConnections() {
  try {
    // Send keepalive messages to active peers
    const clients = await self.clients.matchAll()
    
    clients.forEach(client => {
      client.postMessage({
        type: 'MAINTAIN_PEER_CONNECTIONS',
        timestamp: Date.now()
      })
    })
    
    console.log('[Friends SW] Peer connection maintenance completed')
  } catch (error) {
    console.error('[Friends SW] Peer maintenance failed:', error)
  }
}

// Handle push notifications for peer messages
self.addEventListener('push', (event) => {
  console.log('[Friends SW] Push notification received')
  
  let notificationData = { title: 'Friends Network', body: 'New message received' }
  
  if (event.data) {
    try {
      notificationData = event.data.json()
    } catch (error) {
      console.warn('[Friends SW] Failed to parse push data:', error)
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/badge-72x72.png',
      tag: 'friends-message',
      data: notificationData,
      actions: [
        {
          action: 'reply',
          title: 'Reply',
          icon: '/icons/action-reply.png'
        },
        {
          action: 'view',
          title: 'View',
          icon: '/icons/action-view.png'
        }
      ]
    })
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('[Friends SW] Notification clicked:', event.action)
  
  event.notification.close()
  
  const { action, notification } = event
  const notificationData = notification.data || {}
  
  if (action === 'reply') {
    event.waitUntil(
      clients.openWindow('/messages?reply=' + encodeURIComponent(notificationData.senderId || ''))
    )
  } else if (action === 'view' || !action) {
    event.waitUntil(
      clients.openWindow('/messages?peer=' + encodeURIComponent(notificationData.senderId || ''))
    )
  }
})

// Message handling between SW and main thread
self.addEventListener('message', async (event) => {
  const { type, data } = event.data
  
  switch (type) {
    case 'QUEUE_MESSAGE_FOR_SYNC':
      await queueMessageForSync(data)
      break
      
    case 'STORE_PEER_DATA':
      await storePeerData(data)
      break
      
    case 'GET_OFFLINE_STATUS':
      event.ports[0].postMessage({
        offline: !navigator.onLine,
        cacheSize: await getCacheSize(),
        queueSize: await getQueueSize()
      })
      break
  }
})

// Queue message for background sync
async function queueMessageForSync(messageData) {
  try {
    const db = await openFriendsDB()
    const transaction = db.transaction(['syncQueue', 'messages'], 'readwrite')
    
    // Store in sync queue
    const syncStore = transaction.objectStore('syncQueue')
    const syncItem = {
      id: `sync_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'message',
      data: messageData,
      timestamp: new Date(),
      priority: messageData.priority || 'normal'
    }
    syncStore.add(syncItem)
    
    // Store message locally
    const messageStore = transaction.objectStore('messages')
    const localMessage = {
      ...messageData,
      status: 'queued',
      queuedAt: new Date()
    }
    messageStore.add(localMessage)
    
    // Register background sync
    self.registration.sync.register('friends-message-sync')
    
    console.log('[Friends SW] Message queued for sync')
  } catch (error) {
    console.error('[Friends SW] Failed to queue message:', error)
  }
}

// Store peer data offline
async function storePeerData(peerData) {
  try {
    const db = await openFriendsDB()
    const transaction = db.transaction(['peers'], 'readwrite')
    const store = transaction.objectStore('peers')
    
    const peerRecord = {
      ...peerData,
      lastUpdated: new Date()
    }
    
    store.put(peerRecord)
    console.log('[Friends SW] Peer data stored')
  } catch (error) {
    console.error('[Friends SW] Failed to store peer data:', error)
  }
}

// Get cache size info
async function getCacheSize() {
  try {
    const cacheNames = await caches.keys()
    let totalSize = 0
    
    for (const cacheName of cacheNames) {
      const cache = await caches.open(cacheName)
      const requests = await cache.keys()
      totalSize += requests.length
    }
    
    return totalSize
  } catch (error) {
    return 0
  }
}

// Get sync queue size
async function getQueueSize() {
  try {
    const db = await openFriendsDB()
    const transaction = db.transaction(['syncQueue'], 'readonly')
    const store = transaction.objectStore('syncQueue')
    
    return new Promise((resolve) => {
      const countRequest = store.count()
      countRequest.onsuccess = () => resolve(countRequest.result)
      countRequest.onerror = () => resolve(0)
    })
  } catch (error) {
    return 0
  }
}