import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreateSessionSchema = z.object({
  tier_id: z.string(),
  amount: z.number().positive(),
  gs_amount: z.number().positive(),
  user_id: z.string(),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
  payment_method_types: z.array(z.string()).optional(),
  customer_country: z.string().optional(),
  metadata: z.object({
    gs_tier: z.string(),
    user_level: z.number(),
    bonus_applied: z.boolean()
  })
})

// Mock Stripe integration for demo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateSessionSchema.parse(body)

    // Simulate Stripe session creation delay
    await new Promise(resolve => setTimeout(resolve, 700))

    // Configure payment methods based on user country
    let paymentMethodTypes = ['card']
    
    if (validatedData.customer_country === 'MX') {
      paymentMethodTypes = ['card', 'oxxo']
    }
    
    if (validatedData.payment_method_types) {
      paymentMethodTypes = validatedData.payment_method_types
    }

    // Mock successful Stripe response
    const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const mockCheckoutUrl = `https://checkout.stripe.com/pay/${mockSessionId}`

    return NextResponse.json({
      session_id: mockSessionId,
      checkout_url: mockCheckoutUrl,
      expires_at: Math.floor(Date.now() / 1000) + (30 * 60), // 30 minutes
      payment_methods: paymentMethodTypes,
      // Demo data
      _demo: true,
      _demo_instructions: 'This is a demo Stripe session. In production, this would redirect to actual Stripe checkout.',
      _tier_info: {
        tier_id: validatedData.tier_id,
        gs_amount: validatedData.gs_amount,
        amount: validatedData.amount,
        payment_methods: paymentMethodTypes,
        supports_oxxo: validatedData.customer_country === 'MX'
      }
    })

  } catch (error) {
    console.error('Stripe mock session error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create Stripe session (DEMO MODE)' },
      { status: 500 }
    )
  }
}