import { NextRequest, NextResponse } from 'next/server'

// Stripe webhook handler
import Stripe from 'stripe'

// Only initialize Stripe if we have the required environment variables
let stripe: Stripe | null = null;

if (process.env.STRIPE_SECRET_KEY) {
  try {
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-12-18.acacia'
    })
  } catch (error) {
    console.warn('Failed to initialize Stripe:', error)
  }
}

export async function POST(request: NextRequest) {
  // Check if Stripe is configured
  if (!stripe) {
    console.warn('Stripe not configured - webhook ignored')
    return NextResponse.json(
      { error: 'Stripe not configured' },
      { status: 503 }
    )
  }

  if (!process.env.STRIPE_WEBHOOK_SECRET) {
    console.warn('Stripe webhook secret not configured')
    return NextResponse.json(
      { error: 'Webhook secret not configured' },
      { status: 503 }
    )
  }

  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET
      )
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object
        
        // Extract G's purchase data
        const gsAmount = parseInt(session.metadata.gs_amount)
        const userId = session.metadata.user_id
        const tierId = session.metadata.tier_id
        
        console.log('Stripe payment completed:', {
          session_id: session.id,
          user_id: userId,
          gs_amount: gsAmount,
          amount_total: session.amount_total / 100, // Convert from cents
          customer_email: session.customer_details?.email,
          payment_status: session.payment_status
        })

        // Here you would:
        // 1. Update user's G's balance in database
        // 2. Send confirmation email
        // 3. Submit tax data to Resico if Mexican user
        // 4. Log transaction for analytics
        
        break

      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object
        
        if (paymentIntent.metadata.payment_type === 'gs_purchase') {
          console.log('G\'s payment intent succeeded:', {
            payment_intent_id: paymentIntent.id,
            user_id: paymentIntent.metadata.user_id,
            gs_amount: paymentIntent.metadata.gs_amount,
            amount: paymentIntent.amount / 100
          })
        }
        
        break

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object
        
        console.log('G\'s payment failed:', {
          payment_intent_id: failedPayment.id,
          user_id: failedPayment.metadata.user_id,
          failure_code: failedPayment.last_payment_error?.code,
          failure_message: failedPayment.last_payment_error?.message
        })
        
        break

      case 'invoice.payment_succeeded':
        // Handle subscription payments (if we add recurring G's purchases)
        const invoice = event.data.object
        console.log('Subscription payment succeeded:', invoice.id)
        break

      default:
        console.log(`Unhandled Stripe event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })

  } catch (error) {
    console.error('Stripe webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}