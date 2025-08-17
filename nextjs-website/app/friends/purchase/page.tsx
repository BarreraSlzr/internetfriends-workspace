'use client'

import React, { useState } from 'react'
import { useMultiPaymentGsPurchase } from '@/hooks/perf/use_multi_payment_gs_purchase'
import { useFriendsProfile } from '@/hooks/perf/use_friends_profile'
import styles from './page.module.scss'

const GS_PURCHASE_TIERS = [
  {
    id: 'starter',
    name: 'Starter Pack',
    gs_amount: 100,
    price_usd: 2.99,
    bonus_gs: 0,
    total_gs: 100,
    popular: false,
    description: 'Perfect to get started'
  },
  {
    id: 'booster',
    name: 'Booster Pack',
    gs_amount: 300,
    price_usd: 7.99,
    bonus_gs: 50,
    total_gs: 350,
    popular: true,
    description: 'Most popular choice'
  },
  {
    id: 'power',
    name: 'Power Pack',
    gs_amount: 750,
    price_usd: 19.99,
    bonus_gs: 200,
    total_gs: 950,
    popular: false,
    description: 'Best value for heavy users'
  },
  {
    id: 'legend',
    name: 'Legend Pack',
    gs_amount: 1800,
    price_usd: 39.99,
    bonus_gs: 700,
    total_gs: 2500,
    popular: false,
    description: 'Ultimate G\'s package'
  }
]

export default function GsPurchasePage() {
  const { 
    availableProviders,
    preferredProvider,
    setPreferredProvider,
    calculateProviderCosts,
    initializePayment
  } = useMultiPaymentGsPurchase()
  
  const { profile } = useFriendsProfile()
  
  const [selectedTier, setSelectedTier] = useState(GS_PURCHASE_TIERS[1]) // Default to Booster
  const [isProcessing, setIsProcessing] = useState(false)
  const [userCountry, setUserCountry] = useState('MX') // Demo: Mexican user

  // Calculate costs for each provider
  const providerCosts = calculateProviderCosts(selectedTier.total_gs, selectedTier.price_usd)

  const handlePurchase = async (provider: any) => {
    try {
      setIsProcessing(true)
      
      // Guard against null profile
      if (!profile) {
        console.error('Profile not loaded yet')
        return
      }
      
      const tierWithMetadata = {
        ...selectedTier,
        metadata: {
          gs_tier: selectedTier.name,
          user_level: profile?.gLevel?.level || 1,
          user_country: userCountry
        }
      }

      switch (provider) {
        case 'paypal':
          const paypalResult = await fetch('/api/payments/paypal/create-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tier_id: selectedTier.id,
              amount: selectedTier.price_usd,
              gs_amount: selectedTier.total_gs,
               user_id: profile?.id || 'guest',
              return_url: `${window.location.origin}/friends/purchase/success`,
              cancel_url: `${window.location.origin}/friends/purchase/cancel`,
              metadata: tierWithMetadata.metadata
            })
          })
          
          const paypalData = await paypalResult.json()
          window.location.href = paypalData.approval_url
          break

        case 'stripe':
          const stripeResult = await fetch('/api/payments/stripe/create-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tier_id: selectedTier.id,
              amount: selectedTier.price_usd,
              gs_amount: selectedTier.total_gs,
               user_id: profile?.id || 'guest',
              success_url: `${window.location.origin}/friends/purchase/success`,
              cancel_url: `${window.location.origin}/friends/purchase/cancel`,
              customer_country: userCountry,
              payment_method_types: userCountry === 'MX' ? ['card', 'oxxo'] : ['card'],
              metadata: tierWithMetadata.metadata
            })
          })
          
          const stripeData = await stripeResult.json()
          window.location.href = stripeData.checkout_url
          break

        case 'mercado_pago':
          const mpResult = await fetch('/api/payments/mercado-pago/create-preference', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              tier_id: selectedTier.id,
              amount: selectedTier.price_usd,
              gs_amount: selectedTier.total_gs,
               user_id: profile?.id || 'guest',
              success_url: `${window.location.origin}/friends/purchase/success`,
              failure_url: `${window.location.origin}/friends/purchase/cancel`,
              metadata: tierWithMetadata.metadata
            })
          })
          
          const mpData = await mpResult.json()
          window.location.href = mpData.checkout_url
          break

        default:
          alert(`${provider} integration coming soon!`)
      }
      
    } catch (error) {
      console.error('Purchase failed:', error)
      alert('Purchase failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Purchase G's</h1>
        <p className={styles.subtitle}>
          Buy G's to access premium features, create communities, and boost your earning potential
        </p>
        <div className={styles.balance}>
          Current Balance: <strong>{profile?.stats.gBalance?.toLocaleString() || '0'} G's</strong>
        </div>
      </div>

      {/* Demo User Controls */}
      <div className={styles.demoControls}>
        <h3>Demo Settings</h3>
        <div className={styles.controlGroup}>
          <label>User Country:</label>
          <select value={userCountry} onChange={(e) => setUserCountry(e.target.value)}>
            <option value="MX">🇲🇽 Mexico</option>
            <option value="US">🇺🇸 United States</option>
            <option value="BR">🇧🇷 Brazil</option>
            <option value="AR">🇦🇷 Argentina</option>
          </select>
        </div>
      </div>

      {/* Tier Selection */}
      <div className={styles.tierSelection}>
        <h3>Choose Your G's Package</h3>
        <div className={styles.tiers}>
          {GS_PURCHASE_TIERS.map((tier) => (
            <div 
              key={tier.id}
              className={`
                ${styles.tier}
                ${selectedTier.id === tier.id ? styles.selected : ''}
                ${tier.popular ? styles.popular : ''}
              `}
              onClick={() => setSelectedTier(tier)}
            >
              {tier.popular && <div className={styles.badge}>Most Popular</div>}
              
              <div className={styles.tierHeader}>
                <h4>{tier.name}</h4>
                <div className={styles.price}>${tier.price_usd}</div>
              </div>
              
              <div className={styles.tierContent}>
                <div className={styles.gsAmount}>
                  <span className={styles.base}>{tier.gs_amount.toLocaleString()} G's</span>
                  {tier.bonus_gs > 0 && (
                    <span className={styles.bonus}>+ {tier.bonus_gs} bonus</span>
                  )}
                </div>
                
                <div className={styles.total}>
                  Total: <strong>{tier.total_gs.toLocaleString()} G's</strong>
                </div>
                
                <div className={styles.description}>{tier.description}</div>
                
                <div className={styles.value}>
                  {(tier.total_gs / tier.price_usd).toFixed(1)} G's per $1
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method Selection */}
      <div className={styles.paymentMethods}>
        <h3>Choose Payment Method</h3>
        <p className={styles.subtitle}>
          Select your preferred payment method. We'll show you the total cost including fees.
        </p>
        
        <div className={styles.providers}>
          {providerCosts.map((cost) => (
            <div key={cost.provider} className={styles.provider}>
              <div className={styles.providerHeader}>
                <div className={styles.providerName}>
                  {cost.provider === 'paypal' && '💳 PayPal'}
                  {cost.provider === 'stripe' && '💳 Credit Card'}
                  {cost.provider === 'mercado_pago' && '🇲🇽 Mercado Pago'}
                  {cost.provider === 'apple_pay' && '📱 Apple Pay'}
                  {cost.provider === 'google_pay' && '📱 Google Pay'}
                  {cost.provider === 'oxxo' && '🏪 OXXO'}
                </div>
                
                <div className={styles.friction}>
                  {cost.config.user_friction === 'ultra_low' && '⚡ Instant'}
                  {cost.config.user_friction === 'low' && '🚀 Fast'}
                  {cost.config.user_friction === 'medium' && '⏱️ Quick'}
                </div>
              </div>
              
              <div className={styles.costBreakdown}>
                <div className={styles.baseCost}>
                  G's: ${cost.base_cost.toFixed(2)}
                </div>
                <div className={styles.fee}>
                  Fee: ${cost.fee_amount.toFixed(2)}
                </div>
                <div className={styles.total}>
                  Total: <strong>${cost.total_cost.toFixed(2)}</strong>
                </div>
              </div>
              
              <div className={styles.features}>
                {cost.config.supports_instant && <span className={styles.feature}>✓ Instant</span>}
                {cost.config.supports_cash && <span className={styles.feature}>✓ Cash</span>}
                {cost.config.mexican_tax_support === 'native' && <span className={styles.feature}>✓ Tax Compliant</span>}
              </div>
              
              <button
                className={styles.purchaseButton}
                onClick={() => handlePurchase(cost.provider)}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : `Pay ${cost.total_cost.toFixed(2)} USD`}
              </button>
              
              {userCountry === 'MX' && cost.provider === 'mercado_pago' && (
                <div className={styles.mexicanInfo}>
                  🇲🇽 Includes OXXO, 7-Eleven & cash options
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Benefits */}
      <div className={styles.benefits}>
        <h3>What You Get with G's</h3>
        <div className={styles.benefitsList}>
          <div className={styles.benefit}>
            <div className={styles.benefitIcon}>🚀</div>
            <div className={styles.benefitText}>
              <h4>Boost Earnings</h4>
              <p>Higher level users earn up to 75% more G's from bandwidth sharing</p>
            </div>
          </div>
          
          <div className={styles.benefit}>
            <div className={styles.benefitIcon}>🏘️</div>
            <div className={styles.benefitText}>
              <h4>Create Communities</h4>
              <p>Start your own communities and invite friends to join</p>
            </div>
          </div>
          
          <div className={styles.benefit}>
            <div className={styles.benefitIcon}>🛍️</div>
            <div className={styles.benefitText}>
              <h4>Access Marketplace</h4>
              <p>Buy perks, opportunities, and exclusive content</p>
            </div>
          </div>
          
          <div className={styles.benefit}>
            <div className={styles.benefitIcon}>⭐</div>
            <div className={styles.benefitText}>
              <h4>Level Up Faster</h4>
              <p>G's help you reach higher levels and unlock more features</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}