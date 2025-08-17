#!/usr/bin/env bun
/**
 * Simplified Unit tests for Friends G's Token System
 * Tests core logic without React hooks dependencies
 */

import { describe, expect, test } from 'bun:test'

// G Level calculation logic (extracted from hooks)
interface GLevelTier {
  level: number
  name: string
  minGs: number
  maxGs: number
  communityCreateLimit: number
  bandwidthMultiplier: number
}

const G_LEVEL_TIERS: GLevelTier[] = [
  {
    level: 1,
    name: 'Newbie',
    minGs: 0,
    maxGs: 99,
    communityCreateLimit: 0,
    bandwidthMultiplier: 1.0
  },
  {
    level: 2,
    name: 'Friend',
    minGs: 100,
    maxGs: 499,
    communityCreateLimit: 1,
    bandwidthMultiplier: 1.1
  },
  {
    level: 3,
    name: 'Connector',
    minGs: 500,
    maxGs: 1499,
    communityCreateLimit: 3,
    bandwidthMultiplier: 1.2
  },
  {
    level: 4,
    name: 'Hub',
    minGs: 1500,
    maxGs: 4999,
    communityCreateLimit: 5,
    bandwidthMultiplier: 1.35
  },
  {
    level: 5,
    name: 'Network',
    minGs: 5000,
    maxGs: 14999,
    communityCreateLimit: 10,
    bandwidthMultiplier: 1.5
  },
  {
    level: 6,
    name: 'Legend',
    minGs: 15000,
    maxGs: Infinity,
    communityCreateLimit: Infinity,
    bandwidthMultiplier: 1.75
  }
]

// Core functions
function calculateGLevel(gAmount: number): GLevelTier {
  return G_LEVEL_TIERS.find(tier => 
    gAmount >= tier.minGs && gAmount <= tier.maxGs
  ) || G_LEVEL_TIERS[0]
}

function calculateEarnings(dataTransferred: number, pricePerMB: number, qualityBonus = 0) {
  const baseEarnings = dataTransferred * pricePerMB
  const bonusEarnings = baseEarnings * qualityBonus
  const totalEarnings = baseEarnings + bonusEarnings
  const platformFee = totalEarnings * 0.1 // 10% platform fee
  const netEarnings = totalEarnings - platformFee

  return {
    baseEarnings,
    bonusEarnings,
    totalEarnings,
    platformFee,
    netEarnings
  }
}

function canCreateCommunity(gLevel: GLevelTier, currentCommunities: number): boolean {
  return currentCommunities < gLevel.communityCreateLimit
}

function canJoinCommunity(userGLevel: number, userBalance: number, communityMinLevel: number, communityGRequirement: number): boolean {
  return userGLevel >= communityMinLevel && userBalance >= communityGRequirement
}

describe('Friends G Level System', () => {
  test('calculates correct G level for different amounts', () => {
    expect(calculateGLevel(50)).toMatchObject({ level: 1, name: 'Newbie' })
    expect(calculateGLevel(250)).toMatchObject({ level: 2, name: 'Friend' })
    expect(calculateGLevel(1000)).toMatchObject({ level: 3, name: 'Connector' })
    expect(calculateGLevel(3000)).toMatchObject({ level: 4, name: 'Hub' })
    expect(calculateGLevel(10000)).toMatchObject({ level: 5, name: 'Network' })
    expect(calculateGLevel(20000)).toMatchObject({ level: 6, name: 'Legend' })
  })

  test('handles edge cases in G level calculation', () => {
    // Exact boundaries
    expect(calculateGLevel(99)).toMatchObject({ level: 1, name: 'Newbie' })
    expect(calculateGLevel(100)).toMatchObject({ level: 2, name: 'Friend' })
    expect(calculateGLevel(499)).toMatchObject({ level: 2, name: 'Friend' })
    expect(calculateGLevel(500)).toMatchObject({ level: 3, name: 'Connector' })
    
    // Negative values default to Newbie
    expect(calculateGLevel(-100)).toMatchObject({ level: 1, name: 'Newbie' })
    
    // Very large values go to Legend
    expect(calculateGLevel(999999)).toMatchObject({ level: 6, name: 'Legend' })
  })

  test('calculates earning multipliers correctly by level', () => {
    const levels = G_LEVEL_TIERS
    
    // Ensure multipliers increase with level
    for (let i = 1; i < levels.length; i++) {
      expect(levels[i].bandwidthMultiplier).toBeGreaterThan(levels[i-1].bandwidthMultiplier)
    }
    
    // Test specific multipliers
    expect(levels[0].bandwidthMultiplier).toBe(1.0)   // Newbie: no bonus
    expect(levels[1].bandwidthMultiplier).toBe(1.1)   // Friend: 10% bonus
    expect(levels[2].bandwidthMultiplier).toBe(1.2)   // Connector: 20% bonus
    expect(levels[5].bandwidthMultiplier).toBe(1.75)  // Legend: 75% bonus
  })
})

describe('G Earnings Calculation', () => {
  test('calculates basic earnings correctly', () => {
    const earnings = calculateEarnings(100, 0.1) // 100 MB at 0.1 G/MB
    
    expect(earnings.baseEarnings).toBe(10)
    expect(earnings.bonusEarnings).toBe(0)
    expect(earnings.totalEarnings).toBe(10)
    expect(earnings.platformFee).toBe(1)  // 10% of 10
    expect(earnings.netEarnings).toBe(9)  // 10 - 1
  })

  test('calculates earnings with quality bonus', () => {
    const earnings = calculateEarnings(100, 0.1, 0.2) // 20% quality bonus
    
    expect(earnings.baseEarnings).toBe(10)
    expect(earnings.bonusEarnings).toBe(2)    // 10 * 0.2
    expect(earnings.totalEarnings).toBe(12)   // 10 + 2
    expect(earnings.platformFee).toBeCloseTo(1.2, 2)    // 10% of 12 (handle floating point)
    expect(earnings.netEarnings).toBeCloseTo(10.8, 2)   // 12 - 1.2
  })

  test('handles zero and negative values', () => {
    const zeroEarnings = calculateEarnings(0, 0.1)
    expect(zeroEarnings.netEarnings).toBe(0)
    
    const negativeEarnings = calculateEarnings(-100, 0.1)
    expect(negativeEarnings.netEarnings).toBeLessThan(0)
  })

  test('platform fee is always 10%', () => {
    const testCases = [
      { mb: 50, price: 0.05 },
      { mb: 200, price: 0.15 },
      { mb: 1000, price: 0.08 }
    ]
    
    testCases.forEach(({ mb, price }) => {
      const earnings = calculateEarnings(mb, price)
      const expectedFee = earnings.totalEarnings * 0.1
      expect(earnings.platformFee).toBeCloseTo(expectedFee, 2)
    })
  })
})

describe('Community System Logic', () => {
  test('enforces community creation limits by G level', () => {
    const newbie = G_LEVEL_TIERS[0] // 0 communities allowed
    const friend = G_LEVEL_TIERS[1] // 1 community allowed
    const legend = G_LEVEL_TIERS[5] // Unlimited communities
    
    expect(canCreateCommunity(newbie, 0)).toBe(false)
    expect(canCreateCommunity(friend, 0)).toBe(true)
    expect(canCreateCommunity(friend, 1)).toBe(false)
    expect(canCreateCommunity(legend, 999)).toBe(true) // Unlimited
  })

  test('validates community join requirements', () => {
    // User: Level 2 (Friend) with 150 G's
    const userLevel = 2
    const userBalance = 150
    
    // Community 1: Level 1 required, 50 G's
    expect(canJoinCommunity(userLevel, userBalance, 1, 50)).toBe(true)
    
    // Community 2: Level 3 required, 100 G's  
    expect(canJoinCommunity(userLevel, userBalance, 3, 100)).toBe(false) // Level too low
    
    // Community 3: Level 2 required, 200 G's
    expect(canJoinCommunity(userLevel, userBalance, 2, 200)).toBe(false) // Not enough G's
    
    // Community 4: Level 2 required, 100 G's
    expect(canJoinCommunity(userLevel, userBalance, 2, 100)).toBe(true)
  })
})

describe('Opportunity Filtering Logic', () => {
  const mockOpportunities = [
    {
      id: 'beginner',
      requirements: { minGLevel: 1, minGs: 10 },
      rewards: { gAmount: 25 },
      maxParticipants: 5,
      currentParticipants: 2
    },
    {
      id: 'advanced',
      requirements: { minGLevel: 4, minGs: 500 },
      rewards: { gAmount: 200 },
      maxParticipants: 2,
      currentParticipants: 1
    },
    {
      id: 'full',
      requirements: { minGLevel: 1, minGs: 0 },
      rewards: { gAmount: 15 },
      maxParticipants: 3,
      currentParticipants: 3
    }
  ]

  function filterOpportunities(opportunities: any[], userLevel: number, userBalance: number) {
    return opportunities.filter(opp => 
      opp.requirements.minGLevel <= userLevel &&
      opp.requirements.minGs <= userBalance &&
      opp.currentParticipants < opp.maxParticipants
    )
  }

  test('filters opportunities by user qualifications', () => {
    // Friend level user with 250 G's
    const filtered = filterOpportunities(mockOpportunities, 2, 250)
    
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('beginner')
    // Should exclude 'advanced' (level too low) and 'full' (no space)
  })

  test('high level user sees more opportunities', () => {
    // Hub level user with 1000 G's
    const filtered = filterOpportunities(mockOpportunities, 4, 1000)
    
    expect(filtered).toHaveLength(2)
    expect(filtered.map(o => o.id)).toContain('beginner')
    expect(filtered.map(o => o.id)).toContain('advanced')
    // Should exclude only 'full' (no space)
  })

  test('insufficient G balance limits opportunities', () => {
    // High level but low balance
    const filtered = filterOpportunities(mockOpportunities, 5, 5)
    
    expect(filtered).toHaveLength(0)
    // Should exclude 'beginner' (needs 10 G's) and 'advanced' (needs 500 G's)
    // 'full' is also excluded (no space)
  })
})

describe('Perk Affordability Logic', () => {
  const mockPerks = [
    { id: 'boost', gCost: 25, requiredLevel: 2, isAvailable: true },
    { id: 'avatar', gCost: 75, requiredLevel: 3, isAvailable: true },
    { id: 'support', gCost: 150, requiredLevel: 3, isAvailable: true },
    { id: 'beta', gCost: 200, requiredLevel: 4, isAvailable: true },
    { id: 'legend', gCost: 1000, requiredLevel: 6, isAvailable: true },
    { id: 'soldout', gCost: 10, requiredLevel: 1, isAvailable: false }
  ]

  function getAffordablePerks(perks: any[], userLevel: number, userBalance: number) {
    return perks.filter(perk => 
      perk.isAvailable &&
      perk.requiredLevel <= userLevel &&
      perk.gCost <= userBalance
    )
  }

  test('filters perks by level and balance', () => {
    // Connector level with 100 G's
    const affordable = getAffordablePerks(mockPerks, 3, 100)
    
    expect(affordable).toHaveLength(2)
    expect(affordable.map(p => p.id)).toContain('boost')  // 25 G's, level 2
    expect(affordable.map(p => p.id)).toContain('avatar') // 75 G's, level 3
    // Should exclude expensive and high-level perks
  })

  test('excludes unavailable perks', () => {
    // High level and balance
    const affordable = getAffordablePerks(mockPerks, 6, 2000)
    
    expect(affordable.map(p => p.id)).not.toContain('soldout')
    expect(affordable.every(p => p.isAvailable)).toBe(true)
  })

  test('progression unlocks more perks', () => {
    const balance = 200
    
    const newbiePerks = getAffordablePerks(mockPerks, 1, balance)
    const friendPerks = getAffordablePerks(mockPerks, 2, balance)
    const connectorPerks = getAffordablePerks(mockPerks, 3, balance)
    
    expect(friendPerks.length).toBeGreaterThanOrEqual(newbiePerks.length)
    expect(connectorPerks.length).toBeGreaterThanOrEqual(friendPerks.length)
  })
})

describe('Real-world Scenario Tests', () => {
  test('new user journey to Friend level', () => {
    let userG = 0
    let userLevel = calculateGLevel(userG)
    
    // Start as Newbie
    expect(userLevel.name).toBe('Newbie')
    expect(canCreateCommunity(userLevel, 0)).toBe(false)
    
    // Earn G's through bandwidth sharing - more sessions to reach 100
    const sessions = [
      { mb: 100, price: 0.12 }, // 12 G gross, 10.8 net
      { mb: 150, price: 0.1 },  // 15 G gross, 13.5 net
      { mb: 200, price: 0.1 },  // 20 G gross, 18 net
      { mb: 250, price: 0.08 }, // 20 G gross, 18 net
      { mb: 100, price: 0.15 }  // 15 G gross, 13.5 net
    ]
    
    sessions.forEach(session => {
      const earnings = calculateEarnings(session.mb, session.price)
      userG += earnings.netEarnings
    })
    
    // Add achievement bonuses
    userG += 5  // First G achievement
    userG += 25 // Hundred Club achievement (when reaching 100)
    
    console.log(`Total G's after journey: ${userG.toFixed(2)}`)
    
    userLevel = calculateGLevel(userG)
    
    // Should now be Friend level (need 100+ G's)
    expect(userLevel.name).toBe('Friend')
    expect(canCreateCommunity(userLevel, 0)).toBe(true)
    expect(userLevel.bandwidthMultiplier).toBe(1.1)
  })

  test('community creation and membership flow', () => {
    // Creator: Hub level with 2000 G's
    const creatorLevel = calculateGLevel(2000)
    expect(creatorLevel.name).toBe('Hub')
    expect(canCreateCommunity(creatorLevel, 0)).toBe(true)
    
    // Create premium community
    const community = {
      minGLevel: 3,      // Connector required
      gRequirement: 200  // 200 G's to join
    }
    
    // Test different users
    const users = [
      { level: 2, balance: 300 }, // Friend with 300 G's - level too low
      { level: 3, balance: 100 }, // Connector with 100 G's - not enough G's
      { level: 3, balance: 250 }, // Connector with 250 G's - can join
      { level: 5, balance: 500 }  // Network with 500 G's - can join
    ]
    
    const eligibleUsers = users.filter(user => 
      canJoinCommunity(user.level, user.balance, community.minGLevel, community.gRequirement)
    )
    
    expect(eligibleUsers).toHaveLength(2) // Last two users can join
  })

  test('earning optimization with level progression', () => {
    const baseData = { mb: 100, price: 0.1 } // 100 MB at 0.1 G/MB
    
    G_LEVEL_TIERS.forEach(tier => {
      const baseEarnings = calculateEarnings(baseData.mb, baseData.price)
      const levelAdjustedEarnings = baseEarnings.netEarnings * tier.bandwidthMultiplier
      
      console.log(`${tier.name} (Level ${tier.level}): ${levelAdjustedEarnings.toFixed(2)} G's (${tier.bandwidthMultiplier}x)`)
      
      // Higher levels should earn more
      if (tier.level > 1) {
        const previousTier = G_LEVEL_TIERS[tier.level - 2]
        const previousEarnings = baseEarnings.netEarnings * previousTier.bandwidthMultiplier
        expect(levelAdjustedEarnings).toBeGreaterThan(previousEarnings)
      }
    })
  })
})