'use client'

import React, { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import styles from './page.module.scss'

function PurchaseCancelContent() {
  const searchParams = useSearchParams()
  const reason = searchParams.get('reason') || 'cancelled'
  
  const getReasonText = () => {
    switch (reason) {
      case 'cancelled':
        return 'You cancelled the payment process'
      case 'failed':
        return 'The payment failed to process'
      case 'expired':
        return 'The payment session expired'
      case 'declined':
        return 'Your payment was declined'
      default:
        return 'The payment was not completed'
    }
  }

  const getReasonIcon = () => {
    switch (reason) {
      case 'cancelled':
        return '🚫'
      case 'failed':
        return '❌'
      case 'expired':
        return '⏰'
      case 'declined':
        return '💳'
      default:
        return '❌'
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.cancel}>
        <div className={styles.icon}>{getReasonIcon()}</div>
        
        <h1 className={styles.title}>Payment Not Completed</h1>
        <p className={styles.subtitle}>
          {getReasonText()}
        </p>

        <div className={styles.explanation}>
          <h3>What happened?</h3>
          <div className={styles.reasons}>
            {reason === 'cancelled' && (
              <div className={styles.reasonItem}>
                <p>✓ You chose to cancel the payment</p>
                <p>✓ No charges were made to your account</p>
                <p>✓ You can try again anytime</p>
              </div>
            )}
            
            {reason === 'failed' && (
              <div className={styles.reasonItem}>
                <p>• Payment processing failed</p>
                <p>• This could be due to insufficient funds or technical issues</p>
                <p>• No charges were made to your account</p>
              </div>
            )}
            
            {reason === 'expired' && (
              <div className={styles.reasonItem}>
                <p>• The payment session timed out</p>
                <p>• Payment sessions expire after 30 minutes</p>
                <p>• No charges were made to your account</p>
              </div>
            )}
            
            {reason === 'declined' && (
              <div className={styles.reasonItem}>
                <p>• Your payment method was declined</p>
                <p>• Please check your card details or try a different payment method</p>
                <p>• No charges were made to your account</p>
              </div>
            )}
          </div>
        </div>

        <div className={styles.suggestions}>
          <h3>What can you do?</h3>
          <div className={styles.suggestionsList}>
            <div className={styles.suggestion}>
              <div className={styles.suggestionIcon}>💳</div>
              <div className={styles.suggestionText}>
                <h4>Try a Different Payment Method</h4>
                <p>We support PayPal, credit cards, Mercado Pago, and OXXO cash payments</p>
              </div>
            </div>
            
            <div className={styles.suggestion}>
              <div className={styles.suggestionIcon}>🔍</div>
              <div className={styles.suggestionText}>
                <h4>Check Your Payment Details</h4>
                <p>Verify your card information, billing address, and available balance</p>
              </div>
            </div>
            
            <div className={styles.suggestion}>
              <div className={styles.suggestionIcon}>🎯</div>
              <div className={styles.suggestionText}>
                <h4>Try a Smaller Amount</h4>
                <p>Start with our Starter Pack ($2.99) to test your payment method</p>
              </div>
            </div>
            
            <div className={styles.suggestion}>
              <div className={styles.suggestionIcon}>📞</div>
              <div className={styles.suggestionText}>
                <h4>Contact Support</h4>
                <p>Our team is here to help if you continue having issues</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.alternatives}>
          <h3>Alternative Ways to Get G's</h3>
          <div className={styles.alternativesList}>
            <div className={styles.alternative}>
              <div className={styles.altIcon}>📡</div>
              <div className={styles.altText}>
                <h4>Share Bandwidth</h4>
                <p>Earn 0.1 G per MB by sharing your internet connection</p>
              </div>
            </div>
            
            <div className={styles.alternative}>
              <div className={styles.altIcon}>🏆</div>
              <div className={styles.altText}>
                <h4>Complete Achievements</h4>
                <p>Unlock achievements to earn 5-500 G's as rewards</p>
              </div>
            </div>
            
            <div className={styles.alternative}>
              <div className={styles.altIcon}>👥</div>
              <div className={styles.altText}>
                <h4>Refer Friends</h4>
                <p>Invite friends and earn G's when they join communities</p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button 
            className={styles.primaryButton}
            onClick={() => window.location.href = '/friends/purchase'}
          >
            Try Again
          </button>
          
          <button 
            className={styles.secondaryButton}
            onClick={() => window.location.href = '/friends/bandwidth'}
          >
            Earn G's Instead
          </button>
          
          <button 
            className={styles.secondaryButton}
            onClick={() => window.location.href = '/support'}
          >
            Contact Support
          </button>
        </div>

        <div className={styles.footer}>
          <p>💡 <strong>Tip:</strong> PayPal typically has the highest success rate for international payments</p>
          <p>🔒 All payment methods are secure and encrypted</p>
        </div>
      </div>
    </div>
  )
}

export default function PurchaseCancelPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.cancel}>
          <div className={styles.icon}>⏳</div>
          <h1 className={styles.title}>Loading...</h1>
        </div>
      </div>
    }>
      <PurchaseCancelContent />
    </Suspense>
  )
}