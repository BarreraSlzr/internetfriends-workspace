import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

const CaptureOrderSchema = z.object({
  order_id: z.string(),
  user_id: z.string()
})

// PayPal API configuration
const PAYPAL_API_BASE = process.env.NODE_ENV === 'production' 
  ? 'https://api-m.paypal.com'
  : 'https://api-m.sandbox.paypal.com'

async function getPayPalAccessToken() {
  const auth = Buffer.from(
    `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
  ).toString('base64')

  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token')
  }

  const data = await response.json()
  return data.access_token
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = CaptureOrderSchema.parse(body)
    
    const accessToken = await getPayPalAccessToken()

    // Capture the PayPal order
    const captureResponse = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${validatedData.order_id}/capture`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': `capture_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    })

    if (!captureResponse.ok) {
      const error = await captureResponse.text()
      throw new Error(`PayPal capture error: ${error}`)
    }

    const captureData = await captureResponse.json()
    
    // Extract payment details
    const captureDetails = captureData.purchase_units?.[0]?.payments?.captures?.[0]
    
    if (!captureDetails || captureDetails.status !== 'COMPLETED') {
      throw new Error('Payment capture failed or incomplete')
    }

    return NextResponse.json({
      capture_id: captureDetails.id,
      status: captureDetails.status,
      amount: {
        currency: captureDetails.amount.currency_code,
        value: parseFloat(captureDetails.amount.value)
      },
      payer: {
        email: captureData.payer?.email_address,
        name: captureData.payer?.name,
        payer_id: captureData.payer?.payer_id
      },
      transaction_fee: captureDetails.seller_receivable_breakdown?.paypal_fee || null,
      created_time: captureDetails.create_time,
      update_time: captureDetails.update_time
    })

  } catch (error) {
    console.error('PayPal capture order error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to capture PayPal payment' },
      { status: 500 }
    )
  }
}