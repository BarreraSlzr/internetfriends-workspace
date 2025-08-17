import { NextRequest, NextResponse } from 'next/server'
import { steadyDomainService } from '@/lib/steady/domain-service'

// Steady Domain API - Following steadiest addressability patterns
// Simple, productive defaults, ≤4 parameters per endpoint

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action') || 'search'

    switch (action) {
      case 'search': {
        const query = searchParams.get('q') || ''
        const budget = parseInt(searchParams.get('budget') || '1000')
        const category = (searchParams.get('category') || 'all') as any
        
        const domains = await steadyDomainService.searchDomains(query, budget, category)
        
        return NextResponse.json({
          domains,
          query,
          budget,
          count: domains.length
        })
      }

      case 'check': {
        const domain = searchParams.get('domain')
        if (!domain) {
          return NextResponse.json({ error: 'Domain required' }, { status: 400 })
        }

        const result = await steadyDomainService.checkDomain(domain)
        if (!result) {
          return NextResponse.json({ error: 'Domain not found' }, { status: 404 })
        }

        return NextResponse.json({ domain: result })
      }

      case 'stats': {
        const stats = {
          ownedDomains: ['go.rich', 'internetfriends.xyz'],
          totalLinks: 3,
          totalClicks: 159
        }
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
      case 'purchase': {
        const { domain, tokens, userId } = params
        
        if (!domain || !tokens) {
          return NextResponse.json({ error: 'Domain and tokens required' }, { status: 400 })
        }

        const result = await steadyDomainService.purchaseDomain(domain, tokens, userId)
        return NextResponse.json({ result })
      }

      case 'create_link': {
        const { url, code, domain, userId } = params
        
        if (!url) {
          return NextResponse.json({ error: 'URL required' }, { status: 400 })
        }

        const link = await steadyDomainService.createLink(url, code, domain, userId)
        return NextResponse.json({ 
          link,
          shortUrl: `https://go.rich/${link.code}`
        })
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