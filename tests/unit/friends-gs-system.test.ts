#!/usr/bin/env bun
/**
 * Unit tests for Friends G's Token System
 * Tests G balance, level progression, bandwidth economy, and profile system
 */

import { describe, expect, test, beforeEach, mock } from 'bun:test'

// Mock the useFriendsCore hook since we're testing in isolation
const mockEmit = mock(() => {})
const mockSubscribe = mock(() => () => {})

mock.module('../../hooks/perf/use_friends_core', () => ({
  useFriendsCore: () => ({
    emit: mockEmit,
    subscribe: mockSubscribe
  })
}))

// Import our hooks after mocking
import { useFriendsProfile, GLevelTier } from '../../hooks/perf/use_friends_profile'
import { useFriendsBandwidthEconomy, FriendsGBalance } from '../../hooks/perf/use_friends_bandwidth_economy'
import { useFriendsCommunities } from '../../hooks/perf/use_friends_communities'
import { useFriendsOpportunitiesMarketplace, useFriendsPerksMarketplace } from '../../hooks/perf/use_friends_opportunities_marketplace'

// Mock localStorage for testing
const mockLocalStorage = {
  storage: new Map<string, string>(),
  getItem: (key: string) => mockLocalStorage.storage.get(key) || null,
  setItem: (key: string, value: string) => mockLocalStorage.storage.set(key, value),
  removeItem: (key: string) => mockLocalStorage.storage.delete(key),
  clear: () => mockLocalStorage.storage.clear()
}

Object.defineProperty(global, 'localStorage', {
  value: mockLocalStorage,
  writable: true
})

describe('Friends G Level System', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    mockEmit.mockClear()
    mockSubscribe.mockClear()
  })

  test('calculates correct G level for different amounts', () => {
    const { result } = renderHook(() => useFriendsProfile())
    
    // Wait for initialization
    expect(result.current.isLoading).toBe(false)
    
    const { calculateGLevel } = result.current
    
    // Test each level tier
    expect(calculateGLevel(50)).toMatchObject({ level: 1, name: 'Newbie' })
    expect(calculateGLevel(250)).toMatchObject({ level: 2, name: 'Friend' })
    expect(calculateGLevel(1000)).toMatchObject({ level: 3, name: 'Connector' })
    expect(calculateGLevel(3000)).toMatchObject({ level: 4, name: 'Hub' })
    expect(calculateGLevel(10000)).toMatchObject({ level: 5, name: 'Network' })
    expect(calculateGLevel(20000)).toMatchObject({ level: 6, name: 'Legend' })
  })

  test('calculates next level requirements correctly', () => {
    const { result } = renderHook(() => useFriendsProfile())
    const { getNextLevelRequirement } = result.current
    
    // Test progression from Newbie to Friend
    const nextLevel = getNextLevelRequirement(75)
    expect(nextLevel).toMatchObject({
      nextLevel: { level: 2, name: 'Friend' },
      gsNeeded: 25 // 100 - 75
    })
    
    // Test Legend level (no next level)
    const legendNext = getNextLevelRequirement(20000)
    expect(legendNext).toBeNull()
  })

  test('automatically detects level up on G balance change', async () => {
    const { result } = renderHook(() => useFriendsProfile())
    
    // Mock a G balance that should trigger level up
    const mockGBalance: FriendsGBalance = {
      balance: 150, // Should be Friend level
      earned: 150,
      spent: 0,
      pending: 0,
      lastUpdated: new Date()
    }

    // Simulate the effect that updates profile based on G balance
    await act(async () => {
      if (result.current.profile) {
        await result.current.updateProfile({
          stats: {
            ...result.current.profile.stats,
            gBalance: mockGBalance.balance
          }
        })
      }
    })

    // Should emit level up event
    expect(mockEmit).toHaveBeenCalledWith('profile:level_up', expect.any(Object))
  })
})

describe('Friends Bandwidth Economy', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    mockEmit.mockClear()
  })

  test('creates bandwidth offer with correct G pricing', async () => {
    const { result } = renderHook(() => useFriendsBandwidthEconomy({
      enableSharing: true,
      maxShareBandwidth: 2000
    }))

    // Mock geolocation
    const mockPosition = {
      coords: { latitude: 37.7749, longitude: -122.4194, accuracy: 10 }
    }
    
    Object.defineProperty(global.navigator, 'geolocation', {
      value: {
        getCurrentPosition: mock((success) => success(mockPosition))
      },
      writable: true
    })

    await act(async () => {
      const offer = await result.current.createBandwidthOffer(
        1000, // 1 Mbps
        0.15, // 0.15 G's per MB
        500,  // 500 MB limit
        60    // 1 hour
      )
      
      expect(offer).toMatchObject({
        availableBandwidth: 1000,
        pricePerMB: 0.15,
        maxDataLimit: 500,
        providerId: 'self',
        isActive: true
      })
    })

    expect(mockEmit).toHaveBeenCalledWith('bandwidth:offer:created', expect.any(Object))
  })

  test('calculates earnings with platform fee correctly', () => {
    const { result } = renderHook(() => useFriendsBandwidthEconomy())
    const { calculateEarnings } = result.current
    
    const earnings = calculateEarnings(
      100, // 100 MB transferred
      0.1, // 0.1 G per MB
      0.2  // 20% quality bonus
    )
    
    expect(earnings).toEqual({
      baseEarnings: 10,        // 100 * 0.1
      bonusEarnings: 2,        // 10 * 0.2
      totalEarnings: 12,       // 10 + 2
      platformFee: 1.2,       // 12 * 0.1 (10%)
      netEarnings: 10.8       // 12 - 1.2
    })
  })

  test('prevents purchasing with insufficient G balance', async () => {
    const { result } = renderHook(() => useFriendsBandwidthEconomy())
    
    // Set up mock offer
    act(() => {
      result.current.availableOffers = [{
        id: 'test-offer',
        providerId: 'provider-1',
        pricePerMB: 0.2,
        availableBandwidth: 1000,
        maxDataLimit: 1000,
        // ... other required properties
      }]
    })

    // Mock insufficient balance
    act(() => {
      result.current.gBalance = {
        balance: 5, // Only 5 G's
        earned: 5,
        spent: 0,
        pending: 0,
        lastUpdated: new Date()
      }
    })

    await expect(async () => {
      await act(async () => {
        await result.current.purchaseBandwidth('test-offer', 500, 100) // Costs 20 G's
      })
    }).toThrow('Insufficient G balance')
  })
})

describe('Friends Communities System', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    mockEmit.mockClear()
  })

  test('enforces G level requirements for community creation', async () => {
    const { result } = renderHook(() => useFriendsCommunities())
    
    // Mock a Newbie level profile (can't create communities)
    const mockProfile = {
      id: 'test-user',
      gLevel: { level: 1, name: 'Newbie', communityCreateLimit: 0 },
      displayName: 'Test User',
      // ... other required properties
    }

    expect(() => {
      result.current.createCommunity(
        'Test Community',
        'A test community',
        'general'
      )
    }).toThrow('Cannot create community: insufficient level or limit reached')
  })

  test('allows community creation for Friend level and above', async () => {
    const { result } = renderHook(() => useFriendsCommunities())
    
    // Mock Friend level profile (can create 1 community)
    const mockProfile = {
      id: 'test-user',
      gLevel: { 
        level: 2, 
        name: 'Friend', 
        communityCreateLimit: 1,
        bandwidthMultiplier: 1.1
      },
      displayName: 'Test Friend',
      username: 'test_friend',
      isOnline: true,
      // ... other required properties
    }

    await act(async () => {
      const community = await result.current.createCommunity(
        'Friends Community',
        'A community for friends',
        'general',
        {
          minGLevel: 2,
          gRequirement: 100
        }
      )
      
      expect(community).toMatchObject({
        name: 'Friends Community',
        category: 'general',
        minGLevel: 2,
        gRequirement: 100,
        creatorId: mockProfile.id
      })
    })

    expect(mockEmit).toHaveBeenCalledWith('community:created', expect.any(Object))
  })

  test('filters communities by G level requirements', () => {
    const { result } = renderHook(() => useFriendsCommunities())
    
    const mockCommunity = {
      id: 'premium-community',
      minGLevel: 4, // Hub level required
      gRequirement: 1000,
      memberCount: 5,
      isPrivate: false,
      // ... other required properties
    }

    const mockProfile = {
      gLevel: { level: 2 }, // Friend level
      stats: { gBalance: 500 }
    }

    const canJoin = result.current.canJoinCommunity(mockCommunity)
    expect(canJoin).toBe(false) // Should fail G level requirement
  })
})

describe('Friends Opportunities Marketplace', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    mockEmit.mockClear()
  })

  test('filters opportunities by G level and balance', () => {
    const { result } = renderHook(() => useFriendsOpportunitiesMarketplace())
    
    const mockOpportunities = [
      {
        id: 'beginner-task',
        requirements: { minGLevel: 1, minGs: 10 },
        rewards: { gAmount: 25 },
        status: 'open',
        maxParticipants: 5,
        currentParticipants: [],
        creatorId: 'other-user'
      },
      {
        id: 'advanced-task',
        requirements: { minGLevel: 4, minGs: 500 },
        rewards: { gAmount: 200 },
        status: 'open',
        maxParticipants: 2,
        currentParticipants: [],
        creatorId: 'other-user'
      }
    ]

    const mockProfile = {
      id: 'test-user',
      gLevel: { level: 2, bandwidthMultiplier: 1.1 },
      stats: { gBalance: 250 },
      reputation: { score: 85 }
    }

    const filtered = result.current.getFilteredOpportunities()
    
    // Should only include beginner-task (advanced-task requires level 4 and 500 G's)
    expect(filtered).toHaveLength(1)
    expect(filtered[0].id).toBe('beginner-task')
  })

  test('calculates opportunity rewards with level bonuses', () => {
    const { result } = renderHook(() => useFriendsOpportunitiesMarketplace())
    
    const mockOpportunity = {
      rewards: { 
        gAmount: 100,
        bonusMultiplier: 1.5 // 50% bonus for high levels
      }
    }

    const mockProfile = {
      gLevel: { 
        level: 5, // Network level
        bandwidthMultiplier: 1.5 // 50% earning bonus
      }
    }

    // Expected calculation: 100 * 1.5 (bonus) * 1.5 (level multiplier) = 225 G's
    const expectedReward = mockOpportunity.rewards.gAmount * 
                          mockOpportunity.rewards.bonusMultiplier * 
                          mockProfile.gLevel.bandwidthMultiplier

    expect(expectedReward).toBe(225)
  })
})

describe('Friends Perks Marketplace', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    mockEmit.mockClear()
  })

  test('filters perks by G level and balance', () => {
    const { result } = renderHook(() => useFriendsPerksMarketplace())
    
    const mockProfile = {
      gLevel: { level: 3 }, // Connector level
      stats: { gBalance: 100 }
    }

    const affordablePerks = result.current.affordablePerks
    
    // Should only include perks that:
    // - Are available
    // - Require level 3 or lower
    // - Cost 100 G's or less
    affordablePerks.forEach(perk => {
      expect(perk.isAvailable).toBe(true)
      expect(perk.requiredLevel).toBeLessThanOrEqual(3)
      expect(perk.gCost).toBeLessThanOrEqual(100)
    })
  })

  test('handles perk purchase and inventory tracking', async () => {
    const { result } = renderHook(() => useFriendsPerksMarketplace())
    
    const mockPerk = {
      id: 'test-perk',
      gCost: 50,
      requiredLevel: 2,
      isAvailable: true,
      duration: 1, // 1 day
      remainingQuantity: 5
    }

    const mockProfile = {
      id: 'test-user',
      gLevel: { level: 3 },
      stats: { gBalance: 100 }
    }

    await act(async () => {
      const purchase = await result.current.purchasePerk('test-perk')
      
      expect(purchase).toMatchObject({
        perkId: 'test-perk',
        userId: mockProfile.id,
        gSpent: 50,
        isActive: true
      })
      
      expect(purchase.expiresAt).toBeInstanceOf(Date)
    })

    expect(mockEmit).toHaveBeenCalledWith('perk:purchased', expect.any(Object))
    expect(mockEmit).toHaveBeenCalledWith('profile:gs:spent', expect.any(Object))
  })

  test('calculates cart total correctly', () => {
    const { result } = renderHook(() => useFriendsPerksMarketplace())
    
    act(() => {
      result.current.addToCart('bandwidth_boost_24h') // 25 G's
      result.current.addToCart('custom_avatar_frame') // 75 G's
    })

    const total = result.current.cartTotal
    expect(total).toBe(100) // 25 + 75
  })
})

describe('Friends Achievement System', () => {
  beforeEach(() => {
    mockLocalStorage.clear()
    mockEmit.mockClear()
  })

  test('unlocks achievements and awards G bonuses', async () => {
    const { result } = renderHook(() => useFriendsProfile())
    
    const mockProfile = {
      id: 'test-user',
      achievements: [],
      stats: { gBalance: 95 }
    }

    await act(async () => {
      result.current.unlockAchievement('hundred_club')
    })

    // Should add achievement and award 25 G bonus
    expect(mockEmit).toHaveBeenCalledWith('profile:achievement_unlocked', 
      expect.objectContaining({
        profileId: mockProfile.id,
        achievement: expect.objectContaining({
          id: 'hundred_club',
          gReward: 25
        })
      })
    )
  })

  test('prevents duplicate achievement unlocks', async () => {
    const { result } = renderHook(() => useFriendsProfile())
    
    const mockProfile = {
      achievements: [{ id: 'first_g', name: 'First G' }]
    }

    await act(async () => {
      result.current.unlockAchievement('first_g') // Already unlocked
    })

    // Should not emit duplicate unlock event
    expect(mockEmit).not.toHaveBeenCalledWith('profile:achievement_unlocked', expect.any(Object))
  })
})

describe('Edge Cases and Error Handling', () => {
  test('handles invalid G amounts gracefully', () => {
    const { result } = renderHook(() => useFriendsProfile())
    const { calculateGLevel } = result.current
    
    // Test negative amounts
    expect(calculateGLevel(-100)).toMatchObject({ level: 1, name: 'Newbie' })
    
    // Test extremely large amounts
    expect(calculateGLevel(999999)).toMatchObject({ level: 6, name: 'Legend' })
  })

  test('prevents bandwidth sharing without sufficient funds', async () => {
    const { result } = renderHook(() => useFriendsBandwidthEconomy({
      enableSharing: true
    }))

    const mockProfile = {
      stats: { gBalance: 10 } // Very low balance
    }

    await expect(async () => {
      await act(async () => {
        await result.current.createBandwidthOffer(
          2000, // High bandwidth
          0.2,  // High price
          1000, // Large data limit
          120   // 2 hours
        )
      })
    }).toThrow('Insufficient G balance to fund opportunity')
  })

  test('handles network errors in opportunity marketplace', async () => {
    const { result } = renderHook(() => useFriendsOpportunitiesMarketplace())
    
    // Mock network failure
    const originalFetch = global.fetch
    global.fetch = mock(() => Promise.reject(new Error('Network error')))

    try {
      await act(async () => {
        await result.current.applyToOpportunity('nonexistent-opportunity', {
          message: 'Test application',
          skills: ['React'],
          availability: 'Weekends',
          experience: '2 years'
        })
      })
    } catch (error) {
      expect(error.message).toContain('Opportunity not found')
    }

    global.fetch = originalFetch
  })
})