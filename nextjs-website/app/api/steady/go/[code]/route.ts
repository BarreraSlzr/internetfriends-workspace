import { NextRequest, NextResponse } from 'next/server'
import { steadyDomainService } from '@/lib/steady/domain-service'

// Steady link redirection - Simple, fast, reliable
export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  try {
    const { code } = await params
    
    // Get destination and record click
    const destination = await steadyDomainService.clickLink(code)
    
    if (!destination) {
      // Simple fallback - no complex error pages
      return NextResponse.redirect('https://go.rich')
    }

    return NextResponse.redirect(destination, { status: 302 })
    
  } catch (error) {
    return NextResponse.redirect('https://go.rich')
  }
}