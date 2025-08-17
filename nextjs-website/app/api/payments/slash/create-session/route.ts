import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Slash.com API configuration
const SLASH_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.slash.com/v1'
  : 'https://api.sandbox.slash.com/v1'

const CreateSessionSchema = z.object({
  tier_id: z.string(),
  amount: z.number().positive(),
  gs_amount: z.number().positive(),
  user_id: z.string(),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
  metadata: z.object({
    gs_tier: z.string(),
    user_level: z.number(),
    bonus_applied: z.boolean()
  })
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateSessionSchema.parse(body)

    // Create Slash.com payment session
    const slashResponse = await fetch(`${SLASH_API_BASE}/sessions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SLASH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: Math.round(validatedData.amount * 100), // Convert to cents
        currency: 'USD',
        success_url: validatedData.success_url,
        cancel_url: validatedData.cancel_url,
        metadata: {
          ...validatedData.metadata,
          tier_id: validatedData.tier_id,
          gs_amount: validatedData.gs_amount,
          user_id: validatedData.user_id,
          transaction_id: `gs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        },
        line_items: [{
          name: `G's ${validatedData.metadata.gs_tier}`,
          description: `${validatedData.gs_amount} G's for InternetFriends`,
          amount: Math.round(validatedData.amount * 100),
          quantity: 1
        }],
        payment_methods: ['card', 'apple_pay', 'google_pay'],
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      })
    })

    if (!slashResponse.ok) {
      const error = await slashResponse.text()
      throw new Error(`Slash.com API error: ${error}`)
    }

    const slashData = await slashResponse.json()

    return NextResponse.json({
      session_id: slashData.id,
      checkout_url: slashData.checkout_url,
      expires_at: slashData.expires_at
    })

  } catch (error) {
    console.error('Create session error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    )
  }
}