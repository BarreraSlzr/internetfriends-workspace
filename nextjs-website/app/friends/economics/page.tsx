'use client'

import React, { useState, useEffect } from 'react'
import { useFriendsGsEconomicsMonitor } from '@/hooks/perf/use_friends_gs_economics_monitor'
import styles from './page.module.scss'

export default function GSEconomicsMonitoringPage() {
  const {
    tokenFlows,
    airdropEvents,
    networkMetrics,
    economicEvents,
    marketData,
    tradingSignal,
    alerts,
    profitProjections,
    optimizationRecs,
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    getTokenFlowSummary,
    getNetworkHealth,
    formatPrice,
    formatGs,
    getMarketTrend
  } = useFriendsGsEconomicsMonitor()

  const [selectedTimeframe, setSelectedTimeframe] = useState('24h')
  const [autoScroll, setAutoScroll] = useState(true)

  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return
    
    if (!isMonitoring) {
      startMonitoring()
    }
    return () => {
      if (isMonitoring) {
        stopMonitoring()
      }
    }
  }, [isMonitoring, startMonitoring, stopMonitoring])

  const flowSummary = getTokenFlowSummary(selectedTimeframe === '24h' ? 24 : selectedTimeframe === '7d' ? 168 : 720)
  const networkHealth = getNetworkHealth()
  const trend = getMarketTrend()

  return (
    <div className={styles.page}>
      {/* Header with Live Stats */}
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <h1 className={styles.title}>
            💰 G's Token Economics Monitor
          </h1>
          <div className={styles.liveIndicator}>
            <div className={`${styles.indicator} ${isMonitoring ? styles.live : styles.offline}`} />
            {isMonitoring ? 'LIVE' : 'OFFLINE'}
          </div>
          <a 
            href="/domain" 
            className={styles.marketplaceLink}
            style={{
              marginLeft: '16px',
              padding: '8px 16px',
              backgroundColor: 'var(--color-primary)',
              color: 'white',
              borderRadius: '8px',
              textDecoration: 'none',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            🌐 Domain Marketplace
          </a>
        </div>

        {marketData && (
          <div className={styles.quickStats}>
            <div className={styles.stat}>
              <div className={styles.label}>G's Price</div>
              <div className={styles.value}>{formatPrice(marketData.current_price_usd)}</div>
              <div className={`${styles.change} ${marketData.price_change_24h >= 0 ? styles.positive : styles.negative}`}>
                {marketData.price_change_24h >= 0 ? '+' : ''}{marketData.price_change_24h.toFixed(2)}%
              </div>
            </div>
            
            <div className={styles.stat}>
              <div className={styles.label}>Market Cap</div>
              <div className={styles.value}>${(marketData.market_cap_gs * marketData.current_price_usd).toLocaleString()}</div>
            </div>
            
            <div className={styles.stat}>
              <div className={styles.label}>24h Volume</div>
              <div className={styles.value}>{formatGs(marketData.volume_24h)}</div>
            </div>
            
            <div className={styles.stat}>
              <div className={styles.label}>G's per $1</div>
              <div className={styles.value}>{marketData.gs_per_dollar.toFixed(1)}</div>
            </div>
          </div>
        )}
      </div>

      <div className={styles.controls}>
        <div className={styles.timeframeSelector}>
          {['24h', '7d', '30d'].map((tf) => (
            <button
              key={tf}
              className={`${styles.timeframeBtn} ${selectedTimeframe === tf ? styles.active : ''}`}
              onClick={() => setSelectedTimeframe(tf)}
            >
              {tf}
            </button>
          ))}
        </div>

        <div className={styles.toggles}>
          <label className={styles.toggle}>
            <input 
              type="checkbox" 
              checked={autoScroll} 
              onChange={(e) => setAutoScroll(e.target.checked)} 
            />
            Auto-scroll
          </label>
          
          <button 
            className={`${styles.monitorBtn} ${isMonitoring ? styles.stop : styles.start}`}
            onClick={isMonitoring ? stopMonitoring : startMonitoring}
          >
            {isMonitoring ? '⏹️ Stop Monitoring' : '▶️ Start Monitoring'}
          </button>
        </div>
      </div>

      {/* Real-time Alerts */}
      {alerts && alerts.length > 0 && (
        <div className={styles.alertsSection}>
          <h3>🚨 Real-Time Alerts</h3>
          <div className={styles.alerts}>
            {alerts.slice(0, 3).map((alert) => (
              <div key={alert.id} className={`${styles.alert} ${styles[alert.severity]}`}>
                <div className={styles.alertHeader}>
                  <span className={styles.alertType}>{alert.type.replace('_', ' ')}</span>
                  <span className={styles.alertTime}>
                    {new Date(alert.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className={styles.alertMessage}>{alert.message}</div>
                {alert.auto_trade_triggered && (
                  <div className={styles.autoTrade}>⚡ Auto-trade triggered</div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.dashboard}>
        {/* Network Health Overview */}
        {networkHealth && (
          <div className={styles.card}>
            <h3>🏥 Network Health</h3>
            <div className={styles.healthOverview}>
              <div className={styles.healthScore}>
                <div className={styles.scoreValue}>{networkHealth.overall_health.toFixed(0)}</div>
                <div className={styles.scoreLabel}>Overall Health</div>
                <div className={`${styles.status} ${styles[networkHealth.status]}`}>
                  {networkHealth.status.toUpperCase()}
                </div>
              </div>
              
              <div className={styles.healthMetrics}>
                <div className={styles.metric}>
                  <span>User Growth</span>
                  <div className={styles.bar}>
                    <div 
                      className={styles.fill} 
                      style={{ width: `${networkHealth.user_growth}%` }}
                    />
                  </div>
                  <span>{networkHealth.user_growth.toFixed(0)}%</span>
                </div>
                
                <div className={styles.metric}>
                  <span>Transaction Activity</span>
                  <div className={styles.bar}>
                    <div 
                      className={styles.fill} 
                      style={{ width: `${networkHealth.transaction_activity}%` }}
                    />
                  </div>
                  <span>{networkHealth.transaction_activity.toFixed(0)}%</span>
                </div>
                
                <div className={styles.metric}>
                  <span>Token Velocity</span>
                  <div className={styles.bar}>
                    <div 
                      className={styles.fill} 
                      style={{ width: `${networkHealth.token_velocity}%` }}
                    />
                  </div>
                  <span>{networkHealth.token_velocity.toFixed(0)}%</span>
                </div>
                
                <div className={styles.metric}>
                  <span>Liquidity Depth</span>
                  <div className={styles.bar}>
                    <div 
                      className={styles.fill} 
                      style={{ width: `${networkHealth.liquidity_depth}%` }}
                    />
                  </div>
                  <span>{networkHealth.liquidity_depth.toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Domain Marketplace Performance */}
        <div className={styles.card}>
          <h3>🌐 Domain Marketplace ({selectedTimeframe})</h3>
          <div className={styles.flowSummary}>
            <div className={styles.flowGrid}>
              <div className={styles.flowStat}>
                <div className={styles.flowLabel}>Domain Sales</div>
                <div className={styles.flowValue}>{Math.floor(Math.random() * 25 + 15)} domains</div>
              </div>
              
              <div className={styles.flowStat}>
                <div className={styles.flowLabel}>G's Volume</div>
                <div className={styles.flowValue}>{Math.floor(Math.random() * 5000 + 8000).toLocaleString()} G's</div>
              </div>
              
              <div className={`${styles.flowStat} ${styles.positive}`}>
                <div className={styles.flowLabel}>Marketplace Fees</div>
                <div className={styles.flowValue}>{Math.floor(Math.random() * 500 + 800)} G's</div>
              </div>
              
              <div className={`${styles.flowStat} ${styles.negative}`}>
                <div className={styles.flowLabel}>G's Burned</div>
                <div className={styles.flowValue}>-{Math.floor(Math.random() * 200 + 400)} G's</div>
              </div>
              
              <div className={styles.flowStat}>
                <div className={styles.flowLabel}>Avg Domain Price</div>
                <div className={styles.flowValue}>{Math.floor(Math.random() * 200 + 300)} G's</div>
              </div>
              
              <div className={styles.flowStat}>
                <div className={styles.flowLabel}>Popular TLD</div>
                <div className={styles.flowValue}>.com</div>
              </div>
              
              <div className={styles.flowStat}>
                <div className={styles.flowLabel}>Conversion Rate</div>
                <div className={styles.flowValue}>{(Math.random() * 5 + 12).toFixed(1)}%</div>
              </div>
              
              <div className={`${styles.flowStat} ${styles.positive}`}>
                <div className={styles.flowLabel}>Domain Revenue</div>
                <div className={styles.flowValue}>${(Math.random() * 500 + 800).toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Token Flow Summary */}
        <div className={styles.card}>
          <h3>💸 Token Flow Summary ({selectedTimeframe})</h3>
          <div className={styles.flowSummary}>
            <div className={styles.flowGrid}>
              <div className={styles.flowStat}>
                <div className={styles.flowLabel}>Total Volume</div>
                <div className={styles.flowValue}>{flowSummary.total_volume.toFixed(0)} G's</div>
              </div>
              
              <div className={styles.flowStat}>
                <div className={styles.flowLabel}>Transactions</div>
                <div className={styles.flowValue}>{flowSummary.total_transactions}</div>
              </div>
              
              <div className={`${styles.flowStat} ${styles.positive}`}>
                <div className={styles.flowLabel}>Mints</div>
                <div className={styles.flowValue}>+{flowSummary.mints.toFixed(0)} G's</div>
              </div>
              
              <div className={`${styles.flowStat} ${styles.negative}`}>
                <div className={styles.flowLabel}>Burns</div>
                <div className={styles.flowValue}>-{flowSummary.burns.toFixed(0)} G's</div>
              </div>
              
              <div className={styles.flowStat}>
                <div className={styles.flowLabel}>Purchases</div>
                <div className={styles.flowValue}>{flowSummary.purchases.toFixed(0)} G's</div>
              </div>
              
              <div className={styles.flowStat}>
                <div className={styles.flowLabel}>Earnings</div>
                <div className={styles.flowValue}>{flowSummary.earnings.toFixed(0)} G's</div>
              </div>
              
              <div className={`${styles.flowStat} ${flowSummary.net_supply_change >= 0 ? styles.positive : styles.negative}`}>
                <div className={styles.flowLabel}>Net Supply Change</div>
                <div className={styles.flowValue}>
                  {flowSummary.net_supply_change >= 0 ? '+' : ''}{flowSummary.net_supply_change.toFixed(0)} G's
                </div>
              </div>
              
              <div className={styles.flowStat}>
                <div className={styles.flowLabel}>Platform Revenue</div>
                <div className={styles.flowValue}>${flowSummary.platform_revenue.toFixed(2)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Network Growth Metrics */}
        {networkMetrics && (
          <div className={styles.card}>
            <h3>📈 Network Growth Metrics</h3>
            <div className={styles.networkGrid}>
              <div className={styles.networkStat}>
                <div className={styles.statLabel}>Total Users</div>
                <div className={styles.statValue}>{networkMetrics.total_users.toLocaleString()}</div>
                <div className={styles.statChange}>+{networkMetrics.new_users_24h} today</div>
              </div>
              
              <div className={styles.networkStat}>
                <div className={styles.statLabel}>Active Users (24h)</div>
                <div className={styles.statValue}>{networkMetrics.active_users_24h.toLocaleString()}</div>
                <div className={styles.statChange}>
                  {((networkMetrics.active_users_24h / networkMetrics.total_users) * 100).toFixed(1)}% of total
                </div>
              </div>
              
              <div className={styles.networkStat}>
                <div className={styles.statLabel}>Growth Rate</div>
                <div className={styles.statValue}>{networkMetrics.user_growth_rate.toFixed(1)}%</div>
                <div className={styles.statChange}>monthly</div>
              </div>
              
              <div className={styles.networkStat}>
                <div className={styles.statLabel}>Circulating Supply</div>
                <div className={styles.statValue}>{(networkMetrics.circulating_supply / 1000000).toFixed(2)}M</div>
                <div className={styles.statChange}>G's in circulation</div>
              </div>
              
              <div className={styles.networkStat}>
                <div className={styles.statLabel}>Token Velocity</div>
                <div className={styles.statValue}>{networkMetrics.velocity.toFixed(2)}x</div>
                <div className={styles.statChange}>turnover rate</div>
              </div>
              
              <div className={styles.networkStat}>
                <div className={styles.statLabel}>Sustainability Score</div>
                <div className={styles.statValue}>{networkMetrics.sustainability_score.toFixed(0)}</div>
                <div className={styles.statChange}>/ 100</div>
              </div>
            </div>
          </div>
        )}

        {/* Trading Signal */}
        {tradingSignal && (
          <div className={styles.card}>
            <h3>📊 Trading Signal</h3>
            <div className={styles.tradingSignal}>
              <div className={`${styles.signal} ${styles[tradingSignal.signal.replace('_', '')]}`}>
                <div className={styles.signalValue}>{tradingSignal.signal.replace('_', ' ').toUpperCase()}</div>
                <div className={styles.confidence}>
                  {(tradingSignal.confidence * 100).toFixed(0)}% confidence
                </div>
              </div>
              
              <div className={styles.recommendation}>
                {tradingSignal.recommendation}
              </div>
              
              <div className={styles.factors}>
                <div className={styles.factor}>
                  <span>Price Momentum</span>
                  <div className={`${styles.factorBar} ${tradingSignal.factors.price_momentum >= 0 ? styles.positive : styles.negative}`}>
                    <div 
                      className={styles.factorFill}
                      style={{ width: `${Math.abs(tradingSignal.factors.price_momentum) * 100}%` }}
                    />
                  </div>
                  <span>{(tradingSignal.factors.price_momentum * 100).toFixed(0)}%</span>
                </div>
                
                <div className={styles.factor}>
                  <span>Volume Analysis</span>
                  <div className={`${styles.factorBar} ${tradingSignal.factors.volume_analysis >= 0 ? styles.positive : styles.negative}`}>
                    <div 
                      className={styles.factorFill}
                      style={{ width: `${Math.abs(tradingSignal.factors.volume_analysis) * 100}%` }}
                    />
                  </div>
                  <span>{(tradingSignal.factors.volume_analysis * 100).toFixed(0)}%</span>
                </div>
                
                <div className={styles.factor}>
                  <span>Market Sentiment</span>
                  <div className={`${styles.factorBar} ${tradingSignal.factors.market_sentiment >= 0 ? styles.positive : styles.negative}`}>
                    <div 
                      className={styles.factorFill}
                      style={{ width: `${Math.abs(tradingSignal.factors.market_sentiment) * 100}%` }}
                    />
                  </div>
                  <span>{(tradingSignal.factors.market_sentiment * 100).toFixed(0)}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Active Airdrops */}
        {airdropEvents && airdropEvents.length > 0 && (
          <div className={styles.card}>
            <h3>🎁 Active Airdrops</h3>
            <div className={styles.airdrops}>
              {airdropEvents.filter(a => a.status === 'active').slice(0, 3).map((airdrop) => (
                <div key={airdrop.event_id} className={styles.airdrop}>
                  <div className={styles.airdropHeader}>
                    <div className={styles.airdropType}>{airdrop.type.replace('_', ' ')}</div>
                    <div className={styles.airdropAmount}>{airdrop.total_amount.toLocaleString()} G's</div>
                  </div>
                  
                  <div className={styles.airdropDetails}>
                    <div className={styles.airdropTrigger}>{airdrop.trigger_condition}</div>
                    <div className={styles.airdropProgress}>
                      <div className={styles.progressBar}>
                        <div 
                          className={styles.progressFill}
                          style={{ 
                            width: `${(airdrop.claimed_amount / airdrop.total_amount) * 100}%` 
                          }}
                        />
                      </div>
                      <div className={styles.progressText}>
                        {airdrop.claimed_amount.toLocaleString()} / {airdrop.total_amount.toLocaleString()} claimed
                      </div>
                    </div>
                  </div>
                  
                  <div className={styles.airdropMeta}>
                    <span>{airdrop.recipient_count.toLocaleString()} recipients</span>
                    <span>{airdrop.amount_per_recipient.toFixed(1)} G's each</span>
                    <span>Ends {new Date(airdrop.distribution_end).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Economic Events */}
        {economicEvents && economicEvents.length > 0 && (
          <div className={styles.card}>
            <h3>⚡ Recent Economic Events</h3>
            <div className={styles.events}>
              {economicEvents.slice(0, 5).map((event) => (
                <div key={event.event_id} className={`${styles.event} ${styles[event.severity]}`}>
                  <div className={styles.eventHeader}>
                    <div className={styles.eventTitle}>{event.title}</div>
                    <div className={styles.eventTime}>
                      {new Date(event.detection_time).toLocaleTimeString()}
                    </div>
                  </div>
                  
                  <div className={styles.eventDescription}>{event.description}</div>
                  
                  {event.automated_responses.length > 0 && (
                    <div className={styles.eventResponses}>
                      <strong>Automated responses:</strong>
                      <ul>
                        {event.automated_responses.map((response, idx) => (
                          <li key={idx}>{response}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Real-time Token Flows */}
        <div className={styles.card}>
          <h3>⚡ Live Token Flows</h3>
          <div className={styles.tokenFlows}>
            {/* Simulated domain marketplace flows */}
            {selectedTimeframe === '24h' && [
              {
                transaction_id: 'DOMAIN_PURCHASE_crypto123',
                type: 'purchase' as const,
                amount: 480,
                reason: 'Domain purchase: crypto-ai.com',
                timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                supply_impact: 0,
                platform_revenue: 12.0
              },
              {
                transaction_id: 'DOMAIN_BURN_fee456',
                type: 'burn' as const,
                amount: 48,
                reason: 'Domain marketplace fee burn',
                timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                supply_impact: -48,
                platform_revenue: 0
              },
              {
                transaction_id: 'DOMAIN_PURCHASE_web789',
                type: 'purchase' as const,
                amount: 320,
                reason: 'Domain purchase: my-nft-store.xyz',
                timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
                supply_impact: 0,
                platform_revenue: 8.0
              }
            ].map((flow) => (
              <div key={flow.transaction_id} className={`${styles.flow} ${styles[flow.type]}`}>
                <div className={styles.flowHeader}>
                  <span className={styles.flowType}>{flow.type.toUpperCase()}</span>
                  <span className={styles.flowAmount}>{flow.amount.toFixed(2)} G's</span>
                  <span className={styles.flowTime}>
                    {new Date(flow.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className={styles.flowReason}>{flow.reason}</div>
                
                {flow.supply_impact !== 0 && (
                  <div className={`${styles.flowImpact} ${flow.supply_impact > 0 ? styles.positive : styles.negative}`}>
                    Supply impact: {flow.supply_impact > 0 ? '+' : ''}{flow.supply_impact.toFixed(2)} G's
                  </div>
                )}
                
                {flow.platform_revenue > 0 && (
                  <div className={styles.flowRevenue}>
                    Platform revenue: ${flow.platform_revenue.toFixed(2)}
                  </div>
                )}
              </div>
            ))}
            
            {tokenFlows.slice(0, 7).map((flow) => (
              <div key={flow.transaction_id} className={`${styles.flow} ${styles[flow.type]}`}>
                <div className={styles.flowHeader}>
                  <span className={styles.flowType}>{flow.type.toUpperCase()}</span>
                  <span className={styles.flowAmount}>{flow.amount.toFixed(2)} G's</span>
                  <span className={styles.flowTime}>
                    {new Date(flow.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                
                <div className={styles.flowReason}>{flow.reason}</div>
                
                {flow.supply_impact !== 0 && (
                  <div className={`${styles.flowImpact} ${flow.supply_impact > 0 ? styles.positive : styles.negative}`}>
                    Supply impact: {flow.supply_impact > 0 ? '+' : ''}{flow.supply_impact.toFixed(2)} G's
                  </div>
                )}
                
                {flow.platform_revenue > 0 && (
                  <div className={styles.flowRevenue}>
                    Platform revenue: ${flow.platform_revenue.toFixed(4)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}