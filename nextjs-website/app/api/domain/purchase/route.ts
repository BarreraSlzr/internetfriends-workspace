import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getPorkbunClient } from '@/lib/porkbun/client'
import { PorkbunAPIError } from '@/lib/porkbun/types'
import { simulatePurchase, getMockDomainByName, mockPurchaseFlow } from '@/lib/porkbun/mock-data'

// =================================================================
// DOMAIN PURCHASE WITH G'S TOKENS
// =================================================================

const DomainPurchaseRequestSchema = z.object({
  domain: z.string().min(1),
  years: z.number().min(1).max(10),
  user_id: z.string(),
  gs_token_amount: z.number().positive(),
  payment_method: z.enum(['gs_tokens']),
  success_url: z.string().url().optional(),
  cancel_url: z.string().url().optional(),
  metadata: z.object({
    user_level: z.number().optional(),
    referral_code: z.string().optional(),
    marketplace_source: z.string().optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const purchaseData = DomainPurchaseRequestSchema.parse(body)
    
    // Check if Porkbun API is available
    const useMockData = !process.env.PORKBUN_API_KEY || !process.env.PORKBUN_SECRET_API_KEY
    
    if (useMockData) {
      // Use mock purchase flow when API keys unavailable
      const mockDomain = getMockDomainByName(purchaseData.domain)
      
      if (!mockDomain) {
        return NextResponse.json(
          { 
            error: 'Domain not found in mock data',
            domain: purchaseData.domain,
            success: false 
          },
          { status: 404 }
        )
      }
      
      if (!mockDomain.available) {
        return NextResponse.json(
          { 
            error: 'Domain is not available for registration',
            domain: purchaseData.domain,
            success: false 
          },
          { status: 400 }
        )
      }

      const totalPrice = mockDomain.price * purchaseData.years
      const gsTokensRequired = Math.round(totalPrice / 2.5) // $2.50 per G's token
      
      // Verify user has sufficient G's tokens
      if (purchaseData.gs_token_amount < gsTokensRequired) {
        return NextResponse.json(
          { 
            error: 'Insufficient G\'s tokens',
            required: gsTokensRequired,
            provided: purchaseData.gs_token_amount,
            success: false 
          },
          { status: 400 }
        )
      }

      const purchaseSession = {
        session_id: `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        domain: purchaseData.domain,
        years: purchaseData.years,
        user_id: purchaseData.user_id,
        pricing: {
          usd_price: totalPrice,
          gs_token_price: gsTokensRequired,
          conversion_rate: 2.5,
          platform_fee_gs: Math.round(gsTokensRequired * 0.05),
          savings_percent: 12
        },
        escrow_id: `mock_escrow_${Date.now()}`,
        status: 'pending',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        next_step: 'confirm_purchase',
        mock_data: true
      }

      return NextResponse.json({
        success: true,
        session: purchaseSession,
        checkout_url: `/domain/purchase/${purchaseSession.session_id}`,
        pricing_breakdown: {
          domain_price_usd: totalPrice,
          gs_tokens_required: gsTokensRequired,
          platform_fee_gs: Math.round(gsTokensRequired * 0.05),
          conversion_rate: 2.5,
          total_savings_vs_usd: 12
        },
        purchase_flow: mockPurchaseFlow,
        features_included: {
          whois_privacy: true,
          ssl_certificate: true,
          dns_management: true,
          email_forwarding: true,
          analytics_tracking: true
        },
        mock_data: true,
        timestamp: new Date().toISOString()
      })
    }
    
    // Get Porkbun client
    const client = getPorkbunClient()
    
    // Step 1: Verify domain availability
    const availabilityCheck = await client.checkDomainAvailability(purchaseData.domain)
    
    if (availabilityCheck.response.avail !== 'yes') {
      return NextResponse.json(
        { 
          error: 'Domain is not available for registration',
          domain: purchaseData.domain,
          success: false 
        },
        { status: 400 }
      )
    }

    // Step 2: Calculate exact pricing
    const usdPrice = parseFloat(availabilityCheck.response.price) * purchaseData.years
    const gsTokenPricing = await client.calculateGSTokenPricing(usdPrice, purchaseData.years)
    
    // Step 3: Verify user has sufficient G's tokens
    if (purchaseData.gs_token_amount < gsTokenPricing.gs_token_price) {
      return NextResponse.json(
        { 
          error: 'Insufficient G\'s tokens',
          required: gsTokenPricing.gs_token_price,
          provided: purchaseData.gs_token_amount,
          success: false 
        },
        { status: 400 }
      )
    }

    // Step 4: Create escrow transaction for G's tokens
    const escrowResult = await createGSTokenEscrow({
      user_id: purchaseData.user_id,
      amount: gsTokenPricing.gs_token_price,
      domain: purchaseData.domain,
      transaction_type: 'domain_purchase'
    })

    if (!escrowResult.success) {
      return NextResponse.json(
        { 
          error: 'Failed to escrow G\'s tokens',
          details: escrowResult.error,
          success: false 
        },
        { status: 500 }
      )
    }

    // Step 5: Create purchase session (similar to Stripe pattern)
    const purchaseSession = {
      session_id: `domain_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      domain: purchaseData.domain,
      years: purchaseData.years,
      user_id: purchaseData.user_id,
      pricing: gsTokenPricing,
      escrow_id: escrowResult.escrow_id,
      status: 'pending',
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      next_step: 'confirm_purchase'
    }

    // Store session (in production, this would go to a database)
    await storePurchaseSession(purchaseSession)

    // Step 6: Generate economics tracking event
    await recordGSTokenFlow({
      type: 'escrow',
      amount: gsTokenPricing.gs_token_price,
      reason: `Domain purchase escrow: ${purchaseData.domain}`,
      user_id: purchaseData.user_id,
      domain: purchaseData.domain,
      marketplace_fee: gsTokenPricing.platform_fee_gs
    })

    return NextResponse.json({
      success: true,
      session: purchaseSession,
      checkout_url: `/domain/purchase/${purchaseSession.session_id}`,
      pricing_breakdown: {
        domain_price_usd: usdPrice,
        gs_tokens_required: gsTokenPricing.gs_token_price,
        platform_fee_gs: gsTokenPricing.platform_fee_gs,
        conversion_rate: gsTokenPricing.conversion_rate,
        total_savings_vs_usd: calculateSavings(usdPrice, gsTokenPricing.gs_token_price, gsTokenPricing.conversion_rate)
      },
      features_included: {
        whois_privacy: true,
        ssl_certificate: true,
        dns_management: true,
        email_forwarding: true
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Domain purchase error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          error: 'Invalid purchase request', 
          details: (error as any).errors,
          success: false 
        },
        { status: 400 }
      )
    }

    if (error instanceof PorkbunAPIError) {
      return NextResponse.json(
        { 
          error: error.message,
          success: false 
        },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json(
      { 
        error: 'Purchase initiation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    )
  }
}

// =================================================================
// PURCHASE CONFIRMATION ENDPOINT
// =================================================================

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { session_id, action } = body

    if (!session_id || !action) {
      return NextResponse.json(
        { error: 'session_id and action are required', success: false },
        { status: 400 }
      )
    }

    // Retrieve purchase session
    const session = await getPurchaseSession(session_id)
    
    if (!session) {
      return NextResponse.json(
        { error: 'Purchase session not found', success: false },
        { status: 404 }
      )
    }

    if (session.status !== 'pending') {
      return NextResponse.json(
        { error: 'Purchase session is not in pending state', success: false },
        { status: 400 }
      )
    }

    // Check if session has expired
    if (new Date() > new Date(session.expires_at)) {
      await cancelPurchaseSession(session_id)
      return NextResponse.json(
        { error: 'Purchase session has expired', success: false },
        { status: 400 }
      )
    }

    if (action === 'confirm') {
      // Step 1: Execute the actual domain registration with Porkbun
      // Note: This would require domain registration API (not just availability checking)
      // For now, we'll simulate the process
      
      const registrationResult = await simulateDomainRegistration(session)
      
      if (registrationResult.success) {
        // Step 2: Complete the G's token transaction
        await completeGSTokenEscrow(session.escrow_id)
        
        // Step 3: Record successful purchase in economics system
        await recordGSTokenFlow({
          type: 'purchase',
          amount: session.pricing.gs_token_price,
          reason: `Domain purchase completed: ${session.domain}`,
          user_id: session.user_id,
          domain: session.domain,
          marketplace_fee: session.pricing.platform_fee_gs
        })

        // Step 4: Update session status
        await updatePurchaseSession(session_id, {
          status: 'completed',
          porkbun_transaction_id: registrationResult.transaction_id,
          completed_at: new Date().toISOString()
        })

        return NextResponse.json({
          success: true,
          message: 'Domain purchase completed successfully',
          domain: session.domain,
          transaction_id: registrationResult.transaction_id,
          next_steps: [
            'Domain will be active within 24 hours',
            'DNS management available immediately',
            'SSL certificate will be issued automatically'
          ]
        })

      } else {
        // Registration failed - refund G's tokens
        await refundGSTokenEscrow(session.escrow_id)
        await updatePurchaseSession(session_id, { status: 'failed' })

        return NextResponse.json(
          { 
            error: 'Domain registration failed',
            details: registrationResult.error,
            refund_status: 'G\'s tokens have been refunded',
            success: false 
          },
          { status: 500 }
        )
      }

    } else if (action === 'cancel') {
      // Cancel purchase and refund G's tokens
      await refundGSTokenEscrow(session.escrow_id)
      await updatePurchaseSession(session_id, { status: 'cancelled' })

      return NextResponse.json({
        success: true,
        message: 'Purchase cancelled successfully',
        refund_status: 'G\'s tokens have been refunded'
      })

    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use "confirm" or "cancel"', success: false },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Purchase confirmation error:', error)
    
    return NextResponse.json(
      { 
        error: 'Purchase confirmation failed',
        message: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      },
      { status: 500 }
    )
  }
}

// =================================================================
// G'S TOKEN ESCROW FUNCTIONS
// =================================================================

async function createGSTokenEscrow(params: {
  user_id: string
  amount: number
  domain: string
  transaction_type: string
}) {
  // This would integrate with the existing G's token economics system
  // For now, simulating the escrow process
  
  try {
    // In production, this would:
    // 1. Check user's G's token balance
    // 2. Lock the tokens in escrow
    // 3. Return escrow ID for tracking
    
    const escrowId = `escrow_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    // Simulate escrow creation delay
    await new Promise(resolve => setTimeout(resolve, 100))
    
    return {
      success: true,
      escrow_id: escrowId,
      amount: params.amount,
      status: 'locked'
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Escrow creation failed'
    }
  }
}

async function completeGSTokenEscrow(escrowId: string) {
  // Complete the escrow transaction - transfer tokens to platform
  console.log(`Completing escrow: ${escrowId}`)
  // Integration with existing economics system would go here
}

async function refundGSTokenEscrow(escrowId: string) {
  // Refund tokens to user
  console.log(`Refunding escrow: ${escrowId}`)
  // Integration with existing economics system would go here
}

// =================================================================
// PURCHASE SESSION MANAGEMENT
// =================================================================

async function storePurchaseSession(session: any) {
  // In production, store in database
  // For now, using in-memory storage
  console.log('Storing purchase session:', session.session_id)
}

async function getPurchaseSession(sessionId: string) {
  // In production, retrieve from database
  // For now, returning a mock session
  console.log('Getting purchase session:', sessionId)
  return null // Would return actual session data
}

async function updatePurchaseSession(sessionId: string, updates: any) {
  // In production, update in database
  console.log('Updating purchase session:', sessionId, updates)
}

async function cancelPurchaseSession(sessionId: string) {
  // Cancel and clean up session
  console.log('Cancelling purchase session:', sessionId)
}

// =================================================================
// DOMAIN REGISTRATION SIMULATION
// =================================================================

async function simulateDomainRegistration(session: any) {
  // In production, this would call Porkbun's domain registration API
  // For now, simulating successful registration
  
  try {
    // Simulate registration delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    return {
      success: true,
      transaction_id: `porkbun_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      domain: session.domain,
      expires_at: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year
    }
    
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Registration failed'
    }
  }
}

// =================================================================
// ECONOMICS INTEGRATION
// =================================================================

async function recordGSTokenFlow(params: {
  type: string
  amount: number
  reason: string
  user_id: string
  domain: string
  marketplace_fee: number
}) {
  // This would integrate with the existing GSTokenFlow system
  // in use_friends_gs_economics_monitor.ts
  
  console.log('Recording G\'s token flow:', params)
  
  // In production, this would:
  // 1. Create a new GSTokenFlow record
  // 2. Update network metrics
  // 3. Trigger AI analysis if needed
  // 4. Update user balances
}

// =================================================================
// UTILITY FUNCTIONS
// =================================================================

function calculateSavings(usdPrice: number, gsTokenPrice: number, conversionRate: number): number {
  const equivalentUSD = gsTokenPrice / conversionRate
  const savingsPercent = ((usdPrice - equivalentUSD) / usdPrice) * 100
  return Math.max(0, savingsPercent)
}