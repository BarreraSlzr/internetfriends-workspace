import { useCallback, useEffect, useState } from 'react'
import { useFriendsCore } from './use_friends_core'
import { useFriendsProfile } from './use_friends_profile'

export interface GsPurchaseTier {
  id: string
  name: string
  gs_amount: number
  price_usd: number
  bonus_gs: number
  total_gs: number
  value_per_dollar: number
  popular?: boolean
  limited_time?: boolean
  discount_percentage?: number
}

export interface GsPurchaseTransaction {
  id: string
  user_id: string
  tier_id: string
  gs_amount: number
  price_paid: number
  payment_method: 'slash' | 'stripe' | 'paypal'
  slash_transaction_id?: string
  status: 'pending' | 'completed' | 'failed' | 'refunded'
  created_at: Date
  completed_at?: Date
  metadata: {
    payment_provider: string
    session_id?: string
    receipt_url?: string
    level_at_purchase: number
    level_bonus_applied?: boolean
  }
}

export interface SlashPaymentConfig {
  merchant_id: string
  api_key: string
  environment: 'sandbox' | 'production'
  webhook_secret: string
  success_url: string
  cancel_url: string
}

export interface PurchaseHistory {
  total_spent: number
  total_gs_purchased: number
  transaction_count: number
  favorite_tier: string
  last_purchase: Date
  lifetime_value: number
}

// G's Purchase Tiers - Optimized for Slash.com
const GS_PURCHASE_TIERS: GsPurchaseTier[] = [
  {
    id: 'starter',
    name: 'Starter Pack',
    gs_amount: 100,
    price_usd: 2.99,
    bonus_gs: 0,
    total_gs: 100,
    value_per_dollar: 33.4
  },
  {
    id: 'booster',
    name: 'Booster Pack',
    gs_amount: 300,
    price_usd: 7.99,
    bonus_gs: 50,
    total_gs: 350,
    value_per_dollar: 43.8,
    popular: true
  },
  {
    id: 'power',
    name: 'Power Pack',
    gs_amount: 750,
    price_usd: 19.99,
    bonus_gs: 200,
    total_gs: 950,
    value_per_dollar: 47.5
  },
  {
    id: 'legend',
    name: 'Legend Pack',
    gs_amount: 1800,
    price_usd: 39.99,
    bonus_gs: 700,
    total_gs: 2500,
    value_per_dollar: 62.5
  },
  {
    id: 'mega',
    name: 'Mega Pack',
    gs_amount: 4000,
    price_usd: 79.99,
    bonus_gs: 2000,
    total_gs: 6000,
    value_per_dollar: 75.0,
    limited_time: true,
    discount_percentage: 25
  }
]

// Slash.com Integration Constants
const SLASH_CONFIG: SlashPaymentConfig = {
  merchant_id: process.env.NEXT_PUBLIC_SLASH_MERCHANT_ID || 'internetfriends_dev',
  api_key: process.env.SLASH_API_KEY || '',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
  webhook_secret: process.env.SLASH_WEBHOOK_SECRET || '',
  success_url: '/friends/purchase/success',
  cancel_url: '/friends/purchase/cancel'
}

export const useFriendsGsPurchase = () => {
  const { emit, subscribe } = useFriendsCore('FriendsGsPurchase')
  const { profile, updateGsBalance } = useFriendsProfile()
  
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory>({
    total_spent: 0,
    total_gs_purchased: 0,
    transaction_count: 0,
    favorite_tier: 'booster',
    last_purchase: new Date(),
    lifetime_value: 0
  })
  
  const [activeTransactions, setActiveTransactions] = useState<GsPurchaseTransaction[]>([])
  const [isProcessing, setIsProcessing] = useState(false)

  // Get available purchase tiers with level bonuses
  const getAvailableTiers = useCallback(() => {
    return GS_PURCHASE_TIERS.map(tier => {
      const levelBonus = profile.level >= 3 ? Math.floor(tier.gs_amount * 0.1) : 0
      const totalWithBonus = tier.total_gs + levelBonus
      
      return {
        ...tier,
        level_bonus: levelBonus,
        total_gs: totalWithBonus,
        value_per_dollar: totalWithBonus / tier.price_usd
      }
    })
  }, [profile.level])

  // Initialize Slash.com payment session
  const initializeSlashPayment = useCallback(async (tier: GsPurchaseTier) => {
    try {
      const response = await fetch('/api/payments/slash/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tier_id: tier.id,
          amount: tier.price_usd,
          gs_amount: tier.total_gs,
          user_id: profile.id,
          success_url: `${window.location.origin}${SLASH_CONFIG.success_url}`,
          cancel_url: `${window.location.origin}${SLASH_CONFIG.cancel_url}`,
          metadata: {
            gs_tier: tier.name,
            user_level: profile.level,
            bonus_applied: profile.level >= 3
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to create payment session')
      }

      const { session_id, checkout_url } = await response.json()
      
      // Create pending transaction
      const transaction: GsPurchaseTransaction = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user_id: profile.id,
        tier_id: tier.id,
        gs_amount: tier.total_gs,
        price_paid: tier.price_usd,
        payment_method: 'slash',
        status: 'pending',
        created_at: new Date(),
        metadata: {
          payment_provider: 'slash.com',
          session_id,
          level_at_purchase: profile.level,
          level_bonus_applied: profile.level >= 3
        }
      }

      setActiveTransactions(prev => [...prev, transaction])
      emit('gs:purchase:initiated', { transaction, tier })

      return { checkout_url, transaction }
    } catch (error) {
      emit('gs:purchase:error', { error: error.message, tier })
      throw error
    }
  }, [profile, emit])

  // Process completed purchase
  const completePurchase = useCallback(async (
    transactionId: string,
    slashTransactionId: string,
    receiptUrl?: string
  ) => {
    try {
      setIsProcessing(true)

      const transaction = activeTransactions.find(tx => tx.id === transactionId)
      if (!transaction) {
        throw new Error('Transaction not found')
      }

      // Update transaction status
      const completedTransaction: GsPurchaseTransaction = {
        ...transaction,
        status: 'completed',
        completed_at: new Date(),
        slash_transaction_id: slashTransactionId,
        metadata: {
          ...transaction.metadata,
          receipt_url: receiptUrl
        }
      }

      // Add G's to user balance
      await updateGsBalance(transaction.gs_amount)

      // Update purchase history
      setPurchaseHistory(prev => ({
        total_spent: prev.total_spent + transaction.price_paid,
        total_gs_purchased: prev.total_gs_purchased + transaction.gs_amount,
        transaction_count: prev.transaction_count + 1,
        favorite_tier: prev.favorite_tier, // Keep existing favorite
        last_purchase: new Date(),
        lifetime_value: prev.lifetime_value + transaction.price_paid
      }))

      // Update active transactions
      setActiveTransactions(prev => 
        prev.map(tx => tx.id === transactionId ? completedTransaction : tx)
      )

      emit('gs:purchase:completed', {
        transaction: completedTransaction,
        new_balance: profile.gs_balance + transaction.gs_amount
      })

      return completedTransaction
    } catch (error) {
      emit('gs:purchase:completion_error', { error: error.message, transactionId })
      throw error
    } finally {
      setIsProcessing(false)
    }
  }, [activeTransactions, updateGsBalance, profile.gs_balance, emit])

  // Handle failed purchase
  const handleFailedPurchase = useCallback(async (
    transactionId: string,
    reason: string
  ) => {
    setActiveTransactions(prev => 
      prev.map(tx => 
        tx.id === transactionId 
          ? { ...tx, status: 'failed' as const }
          : tx
      )
    )

    emit('gs:purchase:failed', { transactionId, reason })
  }, [emit])

  // Process refund
  const processRefund = useCallback(async (transactionId: string) => {
    try {
      const transaction = activeTransactions.find(tx => tx.id === transactionId)
      if (!transaction || transaction.status !== 'completed') {
        throw new Error('Transaction not eligible for refund')
      }

      // Call Slash.com refund API
      const response = await fetch('/api/payments/slash/refund', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slash_transaction_id: transaction.slash_transaction_id,
          amount: transaction.price_paid,
          reason: 'user_requested'
        })
      })

      if (!response.ok) {
        throw new Error('Refund request failed')
      }

      // Deduct G's from balance
      await updateGsBalance(-transaction.gs_amount)

      // Update transaction status
      setActiveTransactions(prev => 
        prev.map(tx => 
          tx.id === transactionId 
            ? { ...tx, status: 'refunded' as const }
            : tx
        )
      )

      emit('gs:purchase:refunded', { transaction })
    } catch (error) {
      emit('gs:purchase:refund_error', { error: error.message, transactionId })
      throw error
    }
  }, [activeTransactions, updateGsBalance, emit])

  // Get purchase recommendations based on user behavior
  const getRecommendedTiers = useCallback(() => {
    const availableTiers = getAvailableTiers()
    
    // Algorithm based on current level and spending patterns
    if (profile.level <= 1) {
      return availableTiers.filter(tier => tier.id === 'starter' || tier.id === 'booster')
    }
    
    if (profile.level <= 3) {
      return availableTiers.filter(tier => tier.id === 'booster' || tier.id === 'power')
    }
    
    // High-level users get access to all tiers
    return availableTiers
  }, [getAvailableTiers, profile.level])

  // Calculate best value tier
  const getBestValueTier = useCallback(() => {
    const tiers = getAvailableTiers()
    return tiers.reduce((best, current) => 
      current.value_per_dollar > best.value_per_dollar ? current : best
    )
  }, [getAvailableTiers])

  // Get spending analytics
  const getSpendingAnalytics = useCallback(() => {
    const averageTransactionValue = purchaseHistory.transaction_count > 0
      ? purchaseHistory.total_spent / purchaseHistory.transaction_count
      : 0

    const gsPerDollar = purchaseHistory.total_spent > 0
      ? purchaseHistory.total_gs_purchased / purchaseHistory.total_spent
      : 0

    return {
      average_transaction_value: averageTransactionValue,
      gs_per_dollar_lifetime: gsPerDollar,
      total_value_received: purchaseHistory.total_gs_purchased * 0.1, // Assume 1 G = $0.10 value
      savings_vs_earning: purchaseHistory.total_gs_purchased * 10, // Hours saved vs earning through sharing
      purchase_frequency: purchaseHistory.transaction_count > 1 
        ? Math.floor((Date.now() - purchaseHistory.last_purchase.getTime()) / (1000 * 60 * 60 * 24))
        : null
    }
  }, [purchaseHistory])

  useEffect(() => {
    // Subscribe to payment events from Slash.com webhooks
    const unsubscribePaymentCompleted = subscribe('slash:payment:completed', (event) => {
      const { transaction_id, slash_transaction_id, receipt_url } = event.data
      completePurchase(transaction_id, slash_transaction_id, receipt_url)
    })

    const unsubscribePaymentFailed = subscribe('slash:payment:failed', (event) => {
      const { transaction_id, reason } = event.data
      handleFailedPurchase(transaction_id, reason)
    })

    return () => {
      unsubscribePaymentCompleted()
      unsubscribePaymentFailed()
    }
  }, [subscribe, completePurchase, handleFailedPurchase])

  return {
    // Purchase Options
    availableTiers: getAvailableTiers(),
    recommendedTiers: getRecommendedTiers(),
    bestValueTier: getBestValueTier(),
    
    // Purchase Flow
    initializeSlashPayment,
    completePurchase,
    processRefund,
    
    // Transaction Management
    activeTransactions,
    isProcessing,
    
    // Analytics & History
    purchaseHistory,
    spendingAnalytics: getSpendingAnalytics(),
    
    // Configuration
    slashConfig: SLASH_CONFIG
  }
}

// Slash.com webhook handler utilities
export const createSlashWebhookHandler = () => {
  return {
    verifySignature: (payload: string, signature: string, secret: string) => {
      // Implement Slash.com signature verification
      // This would use their specific algorithm
      return true // Placeholder
    },
    
    handlePaymentCompleted: (webhookData: any) => {
      // Extract transaction details from Slash.com webhook
      return {
        transaction_id: webhookData.metadata.transaction_id,
        slash_transaction_id: webhookData.id,
        receipt_url: webhookData.receipt_url,
        amount: webhookData.amount,
        status: webhookData.status
      }
    },
    
    handlePaymentFailed: (webhookData: any) => {
      return {
        transaction_id: webhookData.metadata.transaction_id,
        reason: webhookData.failure_reason,
        error_code: webhookData.error_code
      }
    }
  }
}