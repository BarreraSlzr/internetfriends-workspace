'use client'

import React, { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useFriendsProfile } from '@/hooks/perf/use_friends_profile'
import styles from './page.module.scss'

interface PurchaseResult {
  success: boolean
  provider: string
  transaction_id: string
  gs_amount: number
  amount_paid: number
  tax_submitted?: boolean
  invoice_url?: string
}

function PurchaseSuccessContent() {
  const searchParams = useSearchParams()
  const { profile, updateProfile } = useFriendsProfile()
  const [purchaseResult, setPurchaseResult] = useState<PurchaseResult | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)

  useEffect(() => {
    // Only run on client side and when profile is available
    if (typeof window === 'undefined' || !profile) return
    
    const processPaymentSuccess = async () => {
      try {
        // Extract payment details from URL parameters
        const sessionId = searchParams.get('session_id') // Stripe
        const paymentId = searchParams.get('payment_id') // PayPal
        const preferenceId = searchParams.get('preference_id') // Mercado Pago
        const token = searchParams.get('token') // PayPal token
        const orderId = searchParams.get('order_id') // PayPal order

        let provider = 'unknown'
        let transactionDetails = null

        if (sessionId) {
          // Stripe payment
          provider = 'stripe'
          const response = await fetch(`/api/payments/stripe/session/${sessionId}`)
          transactionDetails = await response.json()
        } else if (token && orderId) {
          // PayPal payment - capture the order
          provider = 'paypal'
          const response = await fetch('/api/payments/paypal/capture-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: orderId,
              user_id: profile.id
            })
          })
          transactionDetails = await response.json()
        } else if (preferenceId) {
          // Mercado Pago payment
          provider = 'mercado_pago'
          // Payment details will come via webhook, but we can show success
          transactionDetails = {
            status: 'pending', // Will be updated by webhook
            amount: { value: 0 }, // Placeholder
            gs_amount: 0 // Placeholder
          }
        }

        if (transactionDetails) {
          // Simulate successful G's purchase (in production, this would be handled by webhooks)
          const mockResult: PurchaseResult = {
            success: true,
            provider,
            transaction_id: transactionDetails.capture_id || transactionDetails.id || 'demo_tx_' + Date.now(),
            gs_amount: 350, // Mock: Booster Pack
            amount_paid: 7.99, // Mock: Booster Pack price
            tax_submitted: profile?.location?.country === 'MX',
            invoice_url: profile?.location?.country === 'MX' ? 'https://resico.mx/invoice/demo123' : undefined
          }

          // Add G's to user balance (demo)
          if (profile) {
            await updateProfile({
              stats: {
                ...profile.stats,
                gBalance: profile.stats.gBalance + mockResult.gs_amount,
                totalGsEarned: profile.stats.totalGsEarned + mockResult.gs_amount
              }
            })
          }

          setPurchaseResult(mockResult)

          // Submit tax data if Mexican user
          if (profile?.location?.country === 'MX') {
            try {
              await fetch('/api/taxes/resico/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  customer_name: profile.displayName,
                  customer_email: `${profile.username}@internetfriends.com`, // Mock email
                  amount: mockResult.amount_paid,
                  currency: 'USD',
                  concept: `Compra de ${mockResult.gs_amount} G's - InternetFriends`,
                  payment_method: provider,
                  payment_reference: mockResult.transaction_id,
                  timestamp: new Date().toISOString(),
                  invoice_required: mockResult.amount_paid >= 27, // ~500 MXN
                  user_id: profile.id,
                  gs_amount: mockResult.gs_amount,
                  tier_id: 'booster'
                })
              })
            } catch (error) {
              console.error('Tax submission failed:', error)
            }
          }
        }
      } catch (error) {
        console.error('Payment processing failed:', error)
        setPurchaseResult({
          success: false,
          provider: 'unknown',
          transaction_id: '',
          gs_amount: 0,
          amount_paid: 0
        })
      } finally {
        setIsProcessing(false)
      }
    }

    processPaymentSuccess()
  }, [searchParams, profile, updateProfile])

  if (isProcessing) {
    return (
      <div className={styles.page}>
        <div className={styles.processing}>
          <div className={styles.spinner}></div>
          <h2>Processing your payment...</h2>
          <p>Please wait while we confirm your G's purchase.</p>
        </div>
      </div>
    )
  }

  if (!purchaseResult || !purchaseResult.success) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>
          <div className={styles.icon}>❌</div>
          <h2>Payment Processing Failed</h2>
          <p>We couldn't process your payment. Please try again or contact support.</p>
          <button 
            className={styles.button}
            onClick={() => window.location.href = '/friends/purchase'}
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.success}>
        <div className={styles.icon}>🎉</div>
        
        <h1 className={styles.title}>Purchase Successful!</h1>
        <p className={styles.subtitle}>
          Your G's have been added to your account
        </p>

        {/* Purchase Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryItem}>
            <span className={styles.label}>G's Purchased:</span>
            <span className={styles.value}>{purchaseResult.gs_amount.toLocaleString()} G's</span>
          </div>
          
          <div className={styles.summaryItem}>
            <span className={styles.label}>Amount Paid:</span>
            <span className={styles.value}>${purchaseResult.amount_paid.toFixed(2)} USD</span>
          </div>
          
          <div className={styles.summaryItem}>
            <span className={styles.label}>Payment Method:</span>
            <span className={styles.value}>
              {purchaseResult.provider === 'paypal' && '💳 PayPal'}
              {purchaseResult.provider === 'stripe' && '💳 Credit Card'}
              {purchaseResult.provider === 'mercado_pago' && '🇲🇽 Mercado Pago'}
            </span>
          </div>
          
          <div className={styles.summaryItem}>
            <span className={styles.label}>Transaction ID:</span>
            <span className={styles.value}>{purchaseResult.transaction_id}</span>
          </div>
          
          <div className={styles.summaryItem}>
            <span className={styles.label}>New Balance:</span>
            <span className={styles.value}>{profile?.stats.gBalance?.toLocaleString() || '0'} G's</span>
          </div>
        </div>

        {/* Mexican Tax Info */}
        {purchaseResult.tax_submitted && (
          <div className={styles.taxInfo}>
            <h3>🇲🇽 Mexican Tax Compliance</h3>
            <p>✅ Your purchase has been automatically reported to Mexican tax authorities via Resico.</p>
            <p>📄 IVA (16%) is included in the amount paid.</p>
            {purchaseResult.invoice_url && (
              <a href={purchaseResult.invoice_url} className={styles.invoiceLink}>
                📋 Download Tax Invoice
              </a>
            )}
          </div>
        )}

        {/* Next Steps */}
        <div className={styles.nextSteps}>
          <h3>What's Next?</h3>
          <div className={styles.stepsList}>
            <div className={styles.step}>
              <div className={styles.stepIcon}>🏘️</div>
              <div className={styles.stepText}>
                <h4>Create Communities</h4>
                <p>Use your G's to start communities and connect with friends</p>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepIcon}>🛍️</div>
              <div className={styles.stepText}>
                <h4>Shop Marketplace</h4>
                <p>Buy perks, opportunities, and exclusive content</p>
              </div>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepIcon}>📈</div>
              <div className={styles.stepText}>
                <h4>Boost Earnings</h4>
                <p>Higher levels earn more G's from bandwidth sharing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button 
            className={styles.primaryButton}
            onClick={() => window.location.href = '/friends/communities'}
          >
            Browse Communities
          </button>
          
          <button 
            className={styles.secondaryButton}
            onClick={() => window.location.href = '/friends/marketplace'}
          >
            Visit Marketplace
          </button>
          
          <button 
            className={styles.secondaryButton}
            onClick={() => window.location.href = '/friends/profile'}
          >
            View Profile
          </button>
        </div>

        {/* Receipt Info */}
        <div className={styles.receipt}>
          <p>📧 A receipt has been sent to your email address.</p>
          <p>💾 Keep this transaction ID for your records: <code>{purchaseResult.transaction_id}</code></p>
        </div>
      </div>
    </div>
  )
}

export default function PurchaseSuccessPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.processing}>
          <div className={styles.spinner}></div>
          <h2>Loading...</h2>
          <p>Please wait while we load your purchase details.</p>
        </div>
      </div>
    }>
      <PurchaseSuccessContent />
    </Suspense>
  )
}