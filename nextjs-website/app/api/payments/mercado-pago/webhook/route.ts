import { NextRequest, NextResponse } from 'next/server'

// Mercado Pago webhook handler
export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const webhookData = JSON.parse(body)
    
    // Verify webhook authenticity (optional but recommended)
    const signature = request.headers.get('x-signature')
    const requestId = request.headers.get('x-request-id')
    
    console.log('Mercado Pago webhook received:', {
      type: webhookData.type,
      action: webhookData.action,
      data_id: webhookData.data?.id,
      request_id: requestId
    })

    // Handle different webhook events
    switch (webhookData.type) {
      case 'payment':
        if (webhookData.action === 'payment.created' || webhookData.action === 'payment.updated') {
          // Get payment details
          const paymentId = webhookData.data.id
          
          // Fetch full payment data from Mercado Pago API
          const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
            headers: {
              'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
            }
          })

          if (paymentResponse.ok) {
            const paymentData = await paymentResponse.json()
            
            console.log('Mercado Pago payment details:', {
              id: paymentData.id,
              status: paymentData.status,
              status_detail: paymentData.status_detail,
              external_reference: paymentData.external_reference,
              metadata: paymentData.metadata,
              payment_method: paymentData.payment_method_id,
              payment_type: paymentData.payment_type_id,
              transaction_amount: paymentData.transaction_amount,
              payer_email: paymentData.payer?.email
            })

            // Process based on payment status
            switch (paymentData.status) {
              case 'approved':
                // Payment successful - add G's to user account
                const gsAmount = parseInt(paymentData.metadata.gs_amount)
                const userId = paymentData.metadata.user_id
                
                console.log('G\'s purchase approved:', {
                  user_id: userId,
                  gs_amount: gsAmount,
                  payment_id: paymentData.id,
                  amount: paymentData.transaction_amount
                })

                // Here you would:
                // 1. Add G's to user balance
                // 2. Send confirmation email
                // 3. Submit to Resico for Mexican tax compliance
                // 4. Log transaction
                
                break

              case 'pending':
                // Payment pending (common for cash payments)
                console.log('G\'s payment pending:', {
                  payment_id: paymentData.id,
                  payment_method: paymentData.payment_method_id,
                  status_detail: paymentData.status_detail
                })

                // For OXXO payments, status_detail might be 'pending_waiting_payment'
                if (paymentData.payment_method_id === 'oxxo') {
                  console.log('OXXO payment created - waiting for cash payment')
                  // Send OXXO voucher to user
                }
                
                break

              case 'rejected':
                // Payment failed
                console.log('G\'s payment rejected:', {
                  payment_id: paymentData.id,
                  status_detail: paymentData.status_detail
                })
                
                break

              case 'cancelled':
                // Payment cancelled by user
                console.log('G\'s payment cancelled:', paymentData.id)
                break
            }
          }
        }
        break

      case 'merchant_order':
        // Handle merchant order updates
        const orderId = webhookData.data.id
        
        const orderResponse = await fetch(`https://api.mercadopago.com/merchant_orders/${orderId}`, {
          headers: {
            'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`
          }
        })

        if (orderResponse.ok) {
          const orderData = await orderResponse.json()
          console.log('Merchant order update:', {
            id: orderData.id,
            status: orderData.status,
            external_reference: orderData.external_reference
          })
        }
        break

      default:
        console.log(`Unhandled Mercado Pago webhook type: ${webhookData.type}`)
    }

    return NextResponse.json({ status: 'ok' })

  } catch (error) {
    console.error('Mercado Pago webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}