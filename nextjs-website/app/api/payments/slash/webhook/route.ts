import { NextRequest, NextResponse } from 'next/server'
import { createSlashWebhookHandler } from '@/hooks/perf/use_friends_gs_purchase'

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('slash-signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    const webhookHandler = createSlashWebhookHandler()
    
    // Verify webhook signature
    const isValid = webhookHandler.verifySignature(
      body,
      signature,
      process.env.SLASH_WEBHOOK_SECRET!
    )

    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const webhookData = JSON.parse(body)
    
    // Handle different webhook events
    switch (webhookData.type) {
      case 'payment.completed':
        const completedData = webhookHandler.handlePaymentCompleted(webhookData.data)
        
        // Emit event to be handled by the frontend
        // In a real app, you'd use a message queue or websocket
        console.log('Payment completed:', completedData)
        
        // You could also directly update the database here
        // await updateUserGsBalance(completedData.transaction_id, completedData.amount)
        
        break

      case 'payment.failed':
        const failedData = webhookHandler.handlePaymentFailed(webhookData.data)
        console.log('Payment failed:', failedData)
        break

      case 'refund.completed':
        console.log('Refund completed:', webhookData.data)
        break

      default:
        console.log('Unhandled webhook event:', webhookData.type)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}