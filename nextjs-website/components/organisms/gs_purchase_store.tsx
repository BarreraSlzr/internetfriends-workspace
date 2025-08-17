import React from 'react'
import { useFriendsGsPurchase, type GsPurchaseTier } from '@/hooks/perf/use_friends_gs_purchase'
import { useFriendsProfile } from '@/hooks/perf/use_friends_profile'
import styles from './gs_purchase_store.module.scss'

interface GsPurchaseStoreProps {
  onPurchaseComplete?: (transaction: any) => void
  showRecommendedOnly?: boolean
  className?: string
}

export const GsPurchaseStore: React.FC<GsPurchaseStoreProps> = ({
  onPurchaseComplete,
  showRecommendedOnly = false,
  className = ''
}) => {
  const { 
    availableTiers,
    recommendedTiers,
    bestValueTier,
    initializeSlashPayment,
    isProcessing,
    spendingAnalytics
  } = useFriendsGsPurchase()
  
  const { profile } = useFriendsProfile()

  const displayTiers = showRecommendedOnly ? recommendedTiers : availableTiers
  
  const handlePurchase = async (tier: GsPurchaseTier) => {
    try {
      const { checkout_url, transaction } = await initializeSlashPayment(tier)
      
      // Redirect to Slash.com checkout
      window.location.href = checkout_url
      
      onPurchaseComplete?.(transaction)
    } catch (error) {
      console.error('Purchase failed:', error)
      // Handle error (show toast, etc.)
    }
  }

  return (
    <div className={`${styles.store} ${className}`}>
      <div className={styles.header}>
        <h2 className={styles.title}>Purchase G's</h2>
        <div className={styles.balance}>
          <span className={styles.balanceLabel}>Current Balance:</span>
          <span className={styles.balanceValue}>{(profile?.stats?.gBalance || 0).toLocaleString()} G's</span>
        </div>
      </div>

      {spendingAnalytics.gs_per_dollar_lifetime > 0 && (
        <div className={styles.analytics}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Lifetime Value:</span>
            <span className={styles.statValue}>
              {spendingAnalytics.gs_per_dollar_lifetime.toFixed(1)} G's/$
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Total Purchased:</span>
            <span className={styles.statValue}>
              {spendingAnalytics.total_value_received.toLocaleString()} G's
            </span>
          </div>
        </div>
      )}

      <div className={styles.tiers}>
        {displayTiers.map((tier) => (
          <div 
            key={tier.id}
            className={`
              ${styles.tier}
              ${tier.popular ? styles.popular : ''}
              ${tier.id === bestValueTier.id ? styles.bestValue : ''}
              ${tier.limited_time ? styles.limitedTime : ''}
            `}
          >
            {tier.popular && (
              <div className={styles.badge}>Most Popular</div>
            )}
            {tier.id === bestValueTier.id && !tier.popular && (
              <div className={styles.badge}>Best Value</div>
            )}
            {tier.limited_time && (
              <div className={styles.badge}>Limited Time</div>
            )}

            <div className={styles.tierHeader}>
              <h3 className={styles.tierName}>{tier.name}</h3>
              <div className={styles.tierPrice}>
                <span className={styles.price}>${tier.price_usd}</span>
                {tier.discount_percentage && (
                  <span className={styles.discount}>
                    {tier.discount_percentage}% OFF
                  </span>
                )}
              </div>
            </div>

            <div className={styles.tierContent}>
              <div className={styles.gsAmount}>
                <span className={styles.baseGs}>{tier.gs_amount.toLocaleString()} G's</span>
                {tier.bonus_gs > 0 && (
                  <span className={styles.bonus}>+ {tier.bonus_gs} bonus</span>
                )}
                {tier.level_bonus && tier.level_bonus > 0 && (
                  <span className={styles.levelBonus}>
                    + {tier.level_bonus} level bonus
                  </span>
                )}
              </div>

              <div className={styles.totalGs}>
                <strong>{tier.total_gs.toLocaleString()} Total G's</strong>
              </div>

              <div className={styles.value}>
                <span className={styles.valueLabel}>Value:</span>
                <span className={styles.valueAmount}>
                  {tier.value_per_dollar.toFixed(1)} G's per $1
                </span>
              </div>

              {profile?.gLevel?.level && profile.gLevel.level >= 3 && tier.level_bonus && (
                <div className={styles.levelBenefitNote}>
                  🎉 Level {profile.gLevel.level} bonus included!
                </div>
              )}
            </div>

            <button
              className={styles.purchaseButton}
              onClick={() => handlePurchase(tier)}
              disabled={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Purchase with Slash'}
            </button>
          </div>
        ))}
      </div>

      <div className={styles.footer}>
        <div className={styles.paymentInfo}>
          <span>💳 Secure payment powered by Slash.com</span>
          <span>🔒 SSL encrypted | 30-day money-back guarantee</span>
        </div>
        
        <div className={styles.earnInfo}>
          <span>💡 Tip: You can also earn G's by sharing bandwidth!</span>
          <span>Current rate: 0.1 G per MB shared</span>
        </div>
      </div>
    </div>
  )
}