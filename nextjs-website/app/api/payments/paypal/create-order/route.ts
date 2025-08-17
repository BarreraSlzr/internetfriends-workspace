import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CreateOrderSchema = z.object({
  tier_id: z.string(),
  amount: z.number().positive(),
  gs_amount: z.number().positive(),
  user_id: z.string(),
  return_url: z.string().url(),
  cancel_url: z.string().url(),
  metadata: z.object({
    gs_tier: z.string().optional(),
    user_level: z.number().optional(),
    country: z.string().optional()
  }).optional()
})

// Mock PayPal integration for demo
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CreateOrderSchema.parse(body)
    
    // Simulate PayPal order creation delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Mock successful PayPal response
    const mockOrderId = `PAYPAL_ORDER_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    const mockApprovalUrl = `https://www.sandbox.paypal.com/checkoutnow?token=${mockOrderId}`

    return NextResponse.json({
      order_id: mockOrderId,
      approval_url: mockApprovalUrl,
      status: 'CREATED',
      // Demo data
      _demo: true,
      _demo_instructions: 'This is a demo PayPal order. In production, this would redirect to actual PayPal checkout.',
      _tier_info: {
        tier_id: validatedData.tier_id,
        gs_amount: validatedData.gs_amount,
        amount: validatedData.amount
      }
    })

  } catch (error) {
    console.error('PayPal mock order error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create PayPal order (DEMO MODE)' },
      { status: 500 }
    )
  }
}