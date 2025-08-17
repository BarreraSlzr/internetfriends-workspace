import { NextRequest, NextResponse } from 'next/server'
import { goRichGateway } from '@/lib/steady/data-gateway'

// Go.Rich Data Gateway API - Market data, analytics, friends network
// Simple, steady endpoints with productive defaults

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'tickers'

    switch (action) {
      case 'tickers': {
        const symbols = searchParams.get('symbols')?.split(',')
        const limit = parseInt(searchParams.get('limit') || '10')
        const sortBy = (searchParams.get('sort') || 'volume') as any
        
        const tickers = await goRichGateway.getTickerList(symbols, limit, sortBy)
        
        return NextResponse.json({
          tickers,
          count: tickers.length,
          updated: new Date().toISOString()
        })
      }

      case 'ticker': {
        const symbol = searchParams.get('symbol')
        if (!symbol) {
          return NextResponse.json({ error: 'Symbol required' }, { status: 400 })
        }

        const ticker = await goRichGateway.getTicker(symbol)
        if (!ticker) {
          return NextResponse.json({ error: 'Ticker not found' }, { status: 404 })
        }

        return NextResponse.json({ ticker })
      }

      case 'analytics': {
        const domain = searchParams.get('domain') || undefined
        const eventType = searchParams.get('type') || undefined
        const limit = parseInt(searchParams.get('limit') || '100')
        
        const events = await goRichGateway.getAnalytics(domain, eventType, limit)
        
        return NextResponse.json({
          events,
          count: events.length,
          domain,
          eventType
        })
      }

      case 'friends': {
        const status = searchParams.get('status') as any
        const friends = await goRichGateway.getFriends(status)
        
        return NextResponse.json({
          friends,
          count: friends.length,
          status
        })
      }

      case 'stats': {
        const stats = goRichGateway.getDashboardStats()
        return NextResponse.json({ stats })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, ...params } = body

    switch (action) {
      case 'track_event': {
        const { type, domain, data, userId } = params
        
        if (!type || !domain) {
          return NextResponse.json({ error: 'Type and domain required' }, { status: 400 })
        }

        await goRichGateway.trackEvent(type, domain, data, userId)
        return NextResponse.json({ success: true })
      }

      case 'add_friend': {
        const { endpoint, shareLevel } = params
        
        if (!endpoint) {
          return NextResponse.json({ error: 'Endpoint required' }, { status: 400 })
        }

        const friendId = `friend_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`
        await goRichGateway.addFriend(friendId, endpoint, shareLevel === 'auto')
        return NextResponse.json({ success: true, friendId })
      }

      case 'remove_friend': {
        const { friendId } = params
        
        if (!friendId) {
          return NextResponse.json({ error: 'FriendId required' }, { status: 400 })
        }

        // Remove friend from network
        const friends = await goRichGateway.getFriendsNetwork()
        const updatedFriends = friends.friends.filter(f => f.friendId !== friendId)
        return NextResponse.json({ success: true })
      }

      case 'update_friend_sharing': {
        const { friendId, shareLevel } = params
        
        if (!friendId || !shareLevel) {
          return NextResponse.json({ error: 'FriendId and shareLevel required' }, { status: 400 })
        }

        // Update friend sharing level (basic, market, full)
        return NextResponse.json({ success: true })
      }

      case 'sync_friend_data': {
        const { friendId, endpoint, shareLevel } = params
        
        if (!friendId || !endpoint) {
          return NextResponse.json({ error: 'FriendId and endpoint required' }, { status: 400 })
        }

        // Simulate friend data sync based on share level
        const sharedData = []
        
        if (shareLevel === 'market' || shareLevel === 'full') {
          // Share market data
          const tickers = await goRichGateway.getTickers(2)
          sharedData.push({
            type: 'market_ticker',
            data: tickers.tickers[0],
            timestamp: new Date().toISOString()
          })
        }
        
        if (shareLevel === 'full') {
          // Share analytics events
          const analytics = await goRichGateway.getAnalytics(1)
          if (analytics.events.length > 0) {
            sharedData.push({
              type: 'analytics_event',
              data: analytics.events[0],
              timestamp: new Date().toISOString()
            })
          }
        }

        return NextResponse.json({ success: true, sharedData })
      }

      case 'share_data': {
        const { friendId, data } = params
        
        if (!friendId || !data) {
          return NextResponse.json({ error: 'FriendId and data required' }, { status: 400 })
        }

        // Share custom data with specific friend
        await goRichGateway.trackEvent('friend_data_shared', 'go.rich', { friendId, dataType: data.type })
        return NextResponse.json({ success: true })
      }

      case 'sync_friend': {
        const { friendId } = params
        
        if (!friendId) {
          return NextResponse.json({ error: 'FriendId required' }, { status: 400 })
        }

        const success = await goRichGateway.syncWithFriend(friendId)
        return NextResponse.json({ success })
      }

      case 'notify': {
        const { title, body, icon, data, target } = params
        
        if (!title || !body) {
          return NextResponse.json({ error: 'Title and body required' }, { status: 400 })
        }

        await goRichGateway.sendNotification({ title, body, icon, data }, target)
        return NextResponse.json({ success: true })
      }

      case 'update_ticker': {
        const { symbol, price } = params
        
        if (!symbol || !price) {
          return NextResponse.json({ error: 'Symbol and price required' }, { status: 400 })
        }

        await goRichGateway.updateTicker(symbol, price)
        return NextResponse.json({ success: true })
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

  } catch (error) {
    return NextResponse.json(
      { error: 'Request failed' },
      { status: 500 }
    )
  }
}