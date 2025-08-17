import { useCallback, useEffect, useState } from 'react'
import { useFriendsCore } from './use_friends_core'
import { useFriendsProfile } from './use_friends_profile'

export type PaymentProvider = 'paypal' | 'apple_pay' | 'google_pay' | 'stripe' | 'mercado_pago' | 'oxxo' | 'gumroad'

export interface PaymentConfig {
  provider: PaymentProvider
  enabled: boolean
  priority: number // Lower = higher priority (user preference)
  user_friction: 'ultra_low' | 'low' | 'medium' | 'high'
  setup_required: boolean
  mobile_optimized: boolean
  regional_preference: string[] // Country codes where this is preferred
  fee_percentage: number
  fee_fixed: number // in cents
  supports_instant: boolean // Instant checkout without forms
  supports_cash: boolean // Cash payments (OXXO, etc.)
  mexican_tax_support: 'native' | 'webhook' | 'manual'
  user_demographic: 'all' | 'mobile' | 'desktop' | 'gaming' | 'professional'
}

export interface MultiPaymentProvider {
  stripe?: {
    public_key: string
    webhook_secret: string
  }
  paypal?: {
    client_id: string
    webhook_id: string
  }
  revenuecat?: {
    public_key: string
    webhook_secret: string
  }
  polar?: {
    api_key: string
    webhook_secret: string
  }
  lemonsqueezy?: {
    api_key: string
    webhook_secret: string
  }
  gumroad?: {
    api_key: string
    webhook_secret: string
  }
  slash?: {
    merchant_id: string
    api_key: string
    webhook_secret: string
  }
}

export interface ResicoTaxData {
  customer_rfc?: string // Mexican tax ID
  customer_name: string
  customer_email: string
  amount: number
  currency: 'MXN' | 'USD'
  concept: string
  payment_method: string
  timestamp: Date
  invoice_required: boolean
}

// User-Experience First Payment Providers
const PAYMENT_PROVIDERS: Record<PaymentProvider, PaymentConfig> = {
  paypal: {
    provider: 'paypal',
    enabled: true,
    priority: 1, // #1 - Lowest friction for most users
    user_friction: 'ultra_low',
    setup_required: false,
    mobile_optimized: true,
    regional_preference: ['MX', 'US', 'CA', 'BR', 'AR'],
    fee_percentage: 3.5,
    fee_fixed: 49,
    supports_instant: true,
    supports_cash: false,
    mexican_tax_support: 'manual',
    user_demographic: 'all'
  },
  apple_pay: {
    provider: 'apple_pay',
    enabled: true,
    priority: 2, // #2 - Instant for iOS users
    user_friction: 'ultra_low',
    setup_required: false,
    mobile_optimized: true,
    regional_preference: ['US', 'CA', 'MX', 'EU'],
    fee_percentage: 2.9,
    fee_fixed: 30,
    supports_instant: true,
    supports_cash: false,
    mexican_tax_support: 'webhook',
    user_demographic: 'mobile'
  },
  google_pay: {
    provider: 'google_pay',
    enabled: true,
    priority: 3, // #3 - Instant for Android users
    user_friction: 'ultra_low',
    setup_required: false,
    mobile_optimized: true,
    regional_preference: ['MX', 'US', 'IN', 'BR'],
    fee_percentage: 2.9,
    fee_fixed: 30,
    supports_instant: true,
    supports_cash: false,
    mexican_tax_support: 'webhook',
    user_demographic: 'mobile'
  },
  mercado_pago: {
    provider: 'mercado_pago',
    enabled: true,
    priority: 4, // #4 - Mexican market leader
    user_friction: 'low',
    setup_required: false,
    mobile_optimized: true,
    regional_preference: ['MX', 'AR', 'BR', 'CO'],
    fee_percentage: 4.5,
    fee_fixed: 0,
    supports_instant: true,
    supports_cash: true, // OXXO, 7-Eleven, etc.
    mexican_tax_support: 'native',
    user_demographic: 'all'
  },
  oxxo: {
    provider: 'oxxo',
    enabled: true,
    priority: 5, // #5 - Cash option for Mexican users
    user_friction: 'medium',
    setup_required: false,
    mobile_optimized: true,
    regional_preference: ['MX'],
    fee_percentage: 3.0,
    fee_fixed: 15,
    supports_instant: false, // Requires confirmation
    supports_cash: true,
    mexican_tax_support: 'native',
    user_demographic: 'all'
  },
  stripe: {
    provider: 'stripe',
    enabled: true,
    priority: 6, // #6 - Credit card fallback
    user_friction: 'medium',
    setup_required: true, // Need to enter card details
    mobile_optimized: true,
    regional_preference: ['US', 'EU', 'CA'],
    fee_percentage: 2.9,
    fee_fixed: 30,
    supports_instant: false,
    supports_cash: false,
    mexican_tax_support: 'native',
    user_demographic: 'professional'
  },
  gumroad: {
    provider: 'gumroad',
    enabled: true,
    priority: 7, // #7 - Creator-friendly backup
    user_friction: 'low',
    setup_required: false,
    mobile_optimized: true,
    regional_preference: ['US', 'EU'],
    fee_percentage: 3.5,
    fee_fixed: 30,
    supports_instant: false,
    supports_cash: false,
    mexican_tax_support: 'manual',
    user_demographic: 'gaming'
  }
}

export const useMultiPaymentGsPurchase = () => {
  const { emit, subscribe } = useFriendsCore('MultiPaymentGsPurchase')
  const { profile, updateGsBalance } = useFriendsProfile()
  
  const [availableProviders, setAvailableProviders] = useState<PaymentProvider[]>([])
  const [preferredProvider, setPreferredProvider] = useState<PaymentProvider>('stripe')
  const [resicoTaxData, setResicoTaxData] = useState<ResicoTaxData[]>([])

  // Get available payment providers based on user location and preferences
  const getAvailableProviders = useCallback((userCountry?: string, currency?: string) => {
    return Object.values(PAYMENT_PROVIDERS)
      .filter(config => config.enabled)
      .filter(config => !currency || config.supported_currencies.includes(currency))
      .sort((a, b) => a.priority - b.priority)
      .map(config => config.provider)
  }, [])

  // Calculate total cost including fees for each provider
  const calculateProviderCosts = useCallback((gsAmount: number, usdAmount: number) => {
    return availableProviders.map(provider => {
      const config = PAYMENT_PROVIDERS[provider]
      const feeAmount = (usdAmount * config.fee_percentage / 100) + (config.fee_fixed / 100)
      const totalCost = usdAmount + feeAmount
      
      return {
        provider,
        base_cost: usdAmount,
        fee_amount: feeAmount,
        total_cost: totalCost,
        gs_amount: gsAmount,
        cost_per_g: totalCost / gsAmount,
        config
      }
    }).sort((a, b) => a.total_cost - b.total_cost)
  }, [availableProviders])

  // Stripe Integration
  const initializeStripePayment = useCallback(async (tier: any) => {
    const response = await fetch('/api/payments/stripe/create-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier_id: tier.id,
        amount: tier.price_usd,
        gs_amount: tier.total_gs,
        user_id: profile.id,
        success_url: `${window.location.origin}/friends/purchase/success`,
        cancel_url: `${window.location.origin}/friends/purchase/cancel`,
        metadata: {
          provider: 'stripe',
          mexican_tax_required: profile.country === 'MX'
        }
      })
    })
    
    const data = await response.json()
    return { checkout_url: data.checkout_url, session_id: data.session_id }
  }, [profile])

  // PayPal Integration
  const initializePayPalPayment = useCallback(async (tier: any) => {
    const response = await fetch('/api/payments/paypal/create-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        tier_id: tier.id,
        amount: tier.price_usd,
        gs_amount: tier.total_gs,
        user_id: profile.id,
        return_url: `${window.location.origin}/friends/purchase/success`,
        cancel_url: `${window.location.origin}/friends/purchase/cancel`
      })
    })
    
    const data = await response.json()
    return { approval_url: data.approval_url, order_id: data.order_id }
  }, [profile])

  // RevenueCat Integration
  const initializeRevenueCatPayment = useCallback(async (tier: any) => {
    const response = await fetch('/api/payments/revenuecat/purchase', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: `gs_${tier.id}`,
        user_id: profile.id,
        amount: tier.price_usd,
        gs_amount: tier.total_gs
      })
    })
    
    const data = await response.json()
    return { transaction_id: data.transaction_id, receipt: data.receipt }
  }, [profile])

  // Unified payment initialization
  const initializePayment = useCallback(async (tier: any, provider: PaymentProvider) => {
    try {
      emit('payment:initiated', { tier, provider, user_id: profile.id })

      switch (provider) {
        case 'stripe':
          return await initializeStripePayment(tier)
        case 'paypal':
          return await initializePayPalPayment(tier)
        case 'revenuecat':
          return await initializeRevenueCatPayment(tier)
        case 'polar':
          // TODO: Implement Polar integration
          throw new Error('Polar integration not yet implemented')
        case 'lemonsqueezy':
          // TODO: Implement Lemonsqueezy integration
          throw new Error('Lemonsqueezy integration not yet implemented')
        case 'slash':
          // Already implemented in previous hook
          throw new Error('Use useFriendsGsPurchase for Slash integration')
        default:
          throw new Error(`Unsupported payment provider: ${provider}`)
      }
    } catch (error) {
      emit('payment:error', { error: error.message, provider, tier })
      throw error
    }
  }, [profile, emit, initializeStripePayment, initializePayPalPayment, initializeRevenueCatPayment])

  // Resico tax data submission
  const submitResicoTaxData = useCallback(async (taxData: ResicoTaxData) => {
    try {
      const response = await fetch('/api/taxes/resico/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taxData)
      })

      if (!response.ok) {
        throw new Error('Failed to submit tax data to Resico')
      }

      const result = await response.json()
      setResicoTaxData(prev => [...prev, { ...taxData, ...result }])
      
      emit('resico:tax_submitted', { taxData, result })
      return result
    } catch (error) {
      emit('resico:tax_error', { error: error.message, taxData })
      throw error
    }
  }, [emit])

  // Process payment completion with tax handling
  const completePaymentWithTax = useCallback(async (
    transactionId: string,
    provider: PaymentProvider,
    providerTransactionId: string,
    amount: number,
    gsAmount: number
  ) => {
    try {
      // Add G's to user balance
      await updateGsBalance(gsAmount)

      // Submit tax data to Resico if Mexican user
      if (profile.country === 'MX') {
        const taxData: ResicoTaxData = {
          customer_rfc: profile.tax_id,
          customer_name: profile.display_name,
          customer_email: profile.email,
          amount,
          currency: 'USD', // Convert to MXN based on current rate
          concept: `Compra de ${gsAmount} G's - InternetFriends`,
          payment_method: provider,
          timestamp: new Date(),
          invoice_required: amount >= 2000 // MXN threshold for invoicing
        }

        await submitResicoTaxData(taxData)
      }

      emit('payment:completed_with_tax', {
        transaction_id: transactionId,
        provider,
        amount,
        gs_amount: gsAmount,
        tax_submitted: profile.country === 'MX'
      })

    } catch (error) {
      emit('payment:completion_error', { error: error.message, transactionId })
      throw error
    }
  }, [profile, updateGsBalance, submitResicoTaxData, emit])

  // Initialize available providers on mount
  useEffect(() => {
    const providers = getAvailableProviders(profile.country, 'USD')
    setAvailableProviders(providers)
    
    if (providers.length > 0) {
      setPreferredProvider(providers[0])
    }
  }, [profile.country, getAvailableProviders])

  return {
    // Providers
    availableProviders,
    preferredProvider,
    setPreferredProvider,
    providerConfigs: PAYMENT_PROVIDERS,
    
    // Cost calculation
    calculateProviderCosts,
    
    // Payment flow
    initializePayment,
    completePaymentWithTax,
    
    // Tax compliance
    submitResicoTaxData,
    resicoTaxData,
    
    // Utilities
    getAvailableProviders
  }
}