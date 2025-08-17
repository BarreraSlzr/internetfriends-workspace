import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { LinkManager, generateShortCode, isValidUrl, isShortCodeAvailable } from '@/lib/links/manager'
import { trackDomainMarketplaceActivity } from '@/lib/analytics/google-analytics'

// =================================================================
// LINK CREATION AND MANAGEMENT API
// =================================================================

const CreateLinkSchema = z.object({
  destination: z.string().url(),
  shortCode: z.string().min(1).max(50).optional(),
  domain: z.enum(['go.rich', 'internetfriends.xyz']).default('go.rich'),
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  expiresAt: z.string().datetime().optional(),
  tags: z.array(z.string()).default([]),
  customMetadata: z.record(z.any()).optional(),
  createdBy: z.string().default('anonymous'),
})

const UpdateLinkSchema = z.object({
  destination: z.string().url().optional(),
  title: z.string().max(200).optional(),
  description: z.string().max(500).optional(),
  expiresAt: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
})

// CREATE LINK
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const linkData = CreateLinkSchema.parse(body)
    
    // Validate destination URL
    if (!isValidUrl(linkData.destination)) {
      return NextResponse.json(
        { error: 'Invalid destination URL', success: false },
        { status: 400 }
      )
    }

    // Generate or validate short code
    let shortCode = linkData.shortCode
    if (!shortCode) {
      // Auto-generate short code
      do {
        shortCode = generateShortCode()
      } while (!isShortCodeAvailable(shortCode))
    } else {
      // Check if custom short code is available
      if (!isShortCodeAvailable(shortCode)) {
        return NextResponse.json(
          { error: 'Short code already exists', success: false },
          { status: 409 }
        )
      }
    }

    // Create the link
    const link = LinkManager.createLink({
      shortCode,
      destination: linkData.destination,
      domain: linkData.domain,
      title: linkData.title,
      description: linkData.description,
      expiresAt: linkData.expiresAt,
      tags: linkData.tags,
      customMetadata: linkData.customMetadata,
      createdBy: linkData.createdBy,
    })

    // Track creation in analytics
    await trackDomainMarketplaceActivity.linkClick(
      link.id,
      'link_created',
      linkData.domain,
      { action: 'create', shortCode }
    )

    return NextResponse.json({
      success: true,
      link: {
        ...link,
        shortUrl: `https://${link.domain}/${link.shortCode}`,
      },
      message: 'Link created successfully',
    })

  } catch (error) {
    console.error('Link creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid link data', 
          details: error.errors,
          success: false 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Link creation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    )
  }
}

// GET LINKS
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const domain = searchParams.get('domain') as 'go.rich' | 'internetfriends.xyz' | null
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let links = search 
      ? LinkManager.searchLinks(search, domain || undefined)
      : LinkManager.getAllLinks(domain || undefined)

    // Apply pagination
    const total = links.length
    links = links.slice(offset, offset + limit)

    // Add short URLs to response
    const linksWithUrls = links.map(link => ({
      ...link,
      shortUrl: `https://${link.domain}/${link.shortCode}`,
      analytics: LinkManager.getAnalytics(link.id),
    }))

    return NextResponse.json({
      success: true,
      links: linksWithUrls,
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    })

  } catch (error) {
    console.error('Get links error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch links',
        success: false 
      },
      { status: 500 }
    )
  }
}

// UPDATE LINK
export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shortCode = searchParams.get('shortCode')
    
    if (!shortCode) {
      return NextResponse.json(
        { error: 'Short code is required', success: false },
        { status: 400 }
      )
    }

    const body = await request.json()
    const updates = UpdateLinkSchema.parse(body)

    const updatedLink = LinkManager.updateLink(shortCode, updates)
    
    if (!updatedLink) {
      return NextResponse.json(
        { error: 'Link not found', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      link: {
        ...updatedLink,
        shortUrl: `https://${updatedLink.domain}/${updatedLink.shortCode}`,
      },
      message: 'Link updated successfully',
    })

  } catch (error) {
    console.error('Link update error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid update data', 
          details: error.errors,
          success: false 
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Link update failed',
        success: false 
      },
      { status: 500 }
    )
  }
}

// DELETE LINK
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const shortCode = searchParams.get('shortCode')
    
    if (!shortCode) {
      return NextResponse.json(
        { error: 'Short code is required', success: false },
        { status: 400 }
      )
    }

    const deleted = LinkManager.deleteLink(shortCode)
    
    if (!deleted) {
      return NextResponse.json(
        { error: 'Link not found', success: false },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Link deleted successfully',
    })

  } catch (error) {
    console.error('Link deletion error:', error)
    return NextResponse.json(
      { 
        error: 'Link deletion failed',
        success: false 
      },
      { status: 500 }
    )
  }
}