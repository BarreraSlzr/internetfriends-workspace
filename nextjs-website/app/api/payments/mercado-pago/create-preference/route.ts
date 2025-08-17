import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreatePreferenceSchema = z.object({
  tier_id: z.string(),
  amount: z.number().positive(),
  gs_amount: z.number().positive(),
  user_id: z.string(),
  success_url: z.string().url(),
  failure_url: z.string().url(),
  pending_url: z.string().url().optional(),
  payment_methods: z.array(z.string()).optional(),
  customer_email: z.string().email().optional(),
  metadata: z.object({
    gs_tier: z.string(),
    user_level: z.number(),
    user_country: z.string().optional()
  })
})

// Mock Mercado Pago integration for demo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreatePreferenceSchema.parse(body)

    // Simulate Mercado Pago preference creation delay
    await new Promise(resolve => setTimeout(resolve, 600))

    // Configure payment methods for Mexican market
    const paymentMethods = validatedData.payment_methods || [
      'oxxo', 'paycash', 'account_money', 'debit_card', 'credit_card'
    ]

    // Mock successful Mercado Pago response
    const mockPreferenceId = `MP_PREF_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const mockCheckoutUrl = `https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=${mockPreferenceId}`

    return NextResponse.json({
      preference_id: mockPreferenceId,
      checkout_url: mockCheckoutUrl,
      sandbox_checkout_url: `https://sandbox.mercadopago.com.mx/checkout/v1/redirect?pref_id=${mockPreferenceId}`,
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      payment_methods: paymentMethods,
      qr_code: `https://api.mercadopago.com/qr/${mockPreferenceId}`,
      // Cash payment instructions
      cash_payment_info: {
        oxxo_instructions: 'Paga en cualquier OXXO con el código de barras',
        seven_eleven_instructions: 'Paga en 7-Eleven, Circle K o Walmart',
        payment_deadline: '3 días para completar el pago'
      },
      // Demo data
      _demo: true,
      _demo_instructions: 'This is a demo Mercado Pago preference. In production, this would redirect to actual Mercado Pago checkout.',
      _tier_info: {
        tier_id: validatedData.tier_id,
        gs_amount: validatedData.gs_amount,
        amount: validatedData.amount,
        supports_cash: true,
        supports_oxxo: true
      }
    })

  } catch (error) {
    console.error('Mercado Pago mock preference error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create Mercado Pago preference (DEMO MODE)' },
      { status: 500 }
    )
  }
}