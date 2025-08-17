import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const RefundSchema = z.object({
  slash_transaction_id: z.string(),
  amount: z.number().positive(),
  reason: z.string().optional()
})

// Slash.com API configuration
const SLASH_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api.slash.com/v1'
  : 'https://api.sandbox.slash.com/v1'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = RefundSchema.parse(body)

    // Process refund through Slash.com
    const slashResponse = await fetch(`${SLASH_API_BASE}/refunds`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.SLASH_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payment_intent: validatedData.slash_transaction_id,
        amount: Math.round(validatedData.amount * 100), // Convert to cents
        reason: validatedData.reason || 'requested_by_customer',
        metadata: {
          refund_type: 'gs_purchase',
          processed_at: new Date().toISOString()
        }
      })
    })

    if (!slashResponse.ok) {
      const error = await slashResponse.text()
      throw new Error(`Slash.com refund error: ${error}`)
    }

    const refundData = await slashResponse.json()

    return NextResponse.json({
      refund_id: refundData.id,
      status: refundData.status,
      amount_refunded: refundData.amount / 100, // Convert back to dollars
      expected_availability: refundData.expected_availability
    })

  } catch (error) {
    console.error('Refund error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid refund data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to process refund' },
      { status: 500 }
    )
  }
}