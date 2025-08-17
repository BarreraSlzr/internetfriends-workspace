import { NextRequest } from 'next/server'
import { goRichGateway } from '@/lib/steady/data-gateway'

// Server-Sent Events for real-time data streaming
// Perfect for PWA notifications, ticker updates, friend network events

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const feed = searchParams.get('feed') || 'all'
  
  // Create SSE response
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      controller.enqueue(`data: ${JSON.stringify({
        type: 'connected',
        feed,
        timestamp: new Date().toISOString()
      })}\n\n`)

      // Subscribe to gateway events
      const unsubscribe = goRichGateway.subscribe((data) => {
        try {
          // Filter events based on feed type
          if (feed === 'all' || shouldIncludeEvent(data, feed)) {
            controller.enqueue(`data: ${JSON.stringify(data)}\n\n`)
          }
        } catch (error) {
          console.error('SSE streaming error:', error)
        }
      })

      // Send heartbeat every 30 seconds
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(`data: ${JSON.stringify({
            type: 'heartbeat',
            timestamp: new Date().toISOString()
          })}\n\n`)
        } catch (error) {
          console.error('SSE heartbeat error:', error)
          clearInterval(heartbeat)
        }
      }, 30000)

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat)
        unsubscribe()
        controller.close()
      })
    }
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control',
    },
  })
}

function shouldIncludeEvent(data: any, feed: string): boolean {
  switch (feed) {
    case 'tickers':
      return data.type === 'ticker_update'
    case 'analytics':
      return data.type === 'analytics_event'
    case 'friends':
      return data.type === 'friend_sync'
    case 'notifications':
      return data.type === 'notification'
    default:
      return true
  }
}