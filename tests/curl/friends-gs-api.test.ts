#!/usr/bin/env bun
/**
 * cURL API Tests for Friends G's System
 * Tests API endpoints for profiles, G balance, communities, and opportunities
 */

import { describe, expect, test, beforeAll, afterAll } from 'bun:test'

interface APITestResult {
  status: number
  data: any
  headers: Record<string, string>
  responseTime: number
}

class FriendsAPITester {
  private baseUrl: string
  private authToken: string | null = null

  constructor(baseUrl = 'http://localhost:3000') {
    this.baseUrl = baseUrl
  }

  async request(method: string, endpoint: string, body?: any, headers: Record<string, string> = {}): Promise<APITestResult> {
    const startTime = Date.now()
    
    const curlArgs = [
      'curl',
      '-s', // silent
      '-w', '%{http_code}', // write status code
      '-X', method,
      '-H', 'Content-Type: application/json',
      '-H', 'Accept: application/json'
    ]

    if (this.authToken) {
      curlArgs.push('-H', `Authorization: Bearer ${this.authToken}`)
    }

    Object.entries(headers).forEach(([key, value]) => {
      curlArgs.push('-H', `${key}: ${value}`)
    })

    if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
      curlArgs.push('-d', JSON.stringify(body))
    }

    curlArgs.push(`${this.baseUrl}${endpoint}`)

    try {
      const proc = Bun.spawn(curlArgs)
      const response = await new Response(proc.stdout).text()
      const responseTime = Date.now() - startTime

      // Extract status code (last 3 characters)
      const statusMatch = response.match(/(\d{3})$/)
      const status = statusMatch ? parseInt(statusMatch[1]) : 0
      
      // Remove status code from response body
      const body = response.replace(/\d{3}$/, '').trim()
      
      let data
      try {
        data = body ? JSON.parse(body) : null
      } catch {
        data = body
      }

      return {
        status,
        data,
        headers: {},
        responseTime
      }
    } catch (error) {
      throw new Error(`cURL request failed: ${error.message}`)
    }
  }

  async get(endpoint: string, headers?: Record<string, string>) {
    return this.request('GET', endpoint, undefined, headers)
  }

  async post(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request('POST', endpoint, body, headers)
  }

  async put(endpoint: string, body?: any, headers?: Record<string, string>) {
    return this.request('PUT', endpoint, body, headers)
  }

  async delete(endpoint: string, headers?: Record<string, string>) {
    return this.request('DELETE', endpoint, undefined, headers)
  }

  setAuthToken(token: string) {
    this.authToken = token
  }
}

describe('Friends G\'s API Tests', () => {
  let api: FriendsAPITester
  let testUserId: string
  let testCommunityId: string

  beforeAll(async () => {
    api = new FriendsAPITester()
    testUserId = `test_user_${Date.now()}`
    
    // Verify API is running
    const healthCheck = await api.get('/api/health')
    if (healthCheck.status !== 200) {
      throw new Error('API server is not running. Start with: bun run dev')
    }
    
    console.log('🟢 API server is running')
  })

  describe('Profile Management API', () => {
    test('Create new user profile', async () => {
      const profileData = {
        username: `test_user_${Date.now()}`,
        displayName: 'Test User',
        bio: 'Integration test user for G\'s system'
      }

      const response = await api.post('/api/friends/profile', profileData)
      
      expect(response.status).toBe(201)
      expect(response.data).toMatchObject({
        success: true,
        profile: expect.objectContaining({
          username: profileData.username,
          displayName: profileData.displayName,
          gLevel: expect.objectContaining({
            level: 1,
            name: 'Newbie'
          }),
          stats: expect.objectContaining({
            gBalance: 0,
            totalGsEarned: 0
          })
        })
      })

      testUserId = response.data.profile.id
      console.log(`✅ Created profile for user: ${testUserId}`)
    })

    test('Get user profile by ID', async () => {
      const response = await api.get(`/api/friends/profile/${testUserId}`)
      
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        success: true,
        profile: expect.objectContaining({
          id: testUserId,
          gLevel: expect.any(Object),
          stats: expect.any(Object)
        })
      })

      console.log(`✅ Retrieved profile: ${response.data.profile.displayName}`)
    })

    test('Update G balance via bandwidth earning', async () => {
      const earningData = {
        dataTransferred: 100, // MB
        pricePerMB: 0.1,
        qualityBonus: 0.1, // 10% bonus
        sessionDuration: 1800 // 30 minutes
      }

      const response = await api.post(`/api/friends/profile/${testUserId}/earn-gs`, earningData)
      
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        success: true,
        earnings: expect.objectContaining({
          netEarnings: expect.any(Number),
          platformFee: expect.any(Number)
        }),
        newBalance: expect.any(Number)
      })

      expect(response.data.newBalance).toBeGreaterThan(0)
      console.log(`✅ Earned G's: ${response.data.earnings.netEarnings} (new balance: ${response.data.newBalance})`)
    })

    test('Check for level progression', async () => {
      // Add more G's to trigger level up
      const bigEarning = {
        dataTransferred: 500, // 500 MB
        pricePerMB: 0.15,
        qualityBonus: 0.2
      }

      const response = await api.post(`/api/friends/profile/${testUserId}/earn-gs`, bigEarning)
      
      // Check if level changed
      const profileResponse = await api.get(`/api/friends/profile/${testUserId}`)
      const profile = profileResponse.data.profile

      if (profile.stats.gBalance >= 100) {
        expect(profile.gLevel.level).toBeGreaterThanOrEqual(2)
        expect(profile.gLevel.name).toBe('Friend')
        console.log(`🎉 Level up detected! User is now level ${profile.gLevel.level} (${profile.gLevel.name})`)
      }
    })
  })

  describe('G Balance API', () => {
    test('Get current G balance', async () => {
      const response = await api.get(`/api/friends/balance/${testUserId}`)
      
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        success: true,
        balance: expect.objectContaining({
          balance: expect.any(Number),
          earned: expect.any(Number),
          spent: expect.any(Number),
          pending: expect.any(Number)
        })
      })

      console.log(`✅ Current G balance: ${response.data.balance.balance} G's`)
    })

    test('Get G earning history', async () => {
      const response = await api.get(`/api/friends/balance/${testUserId}/history`)
      
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        success: true,
        transactions: expect.any(Array)
      })

      if (response.data.transactions.length > 0) {
        expect(response.data.transactions[0]).toMatchObject({
          type: expect.stringMatching(/^(earn|spend)$/),
          amount: expect.any(Number),
          source: expect.any(String),
          timestamp: expect.any(String)
        })
      }

      console.log(`✅ Transaction history: ${response.data.transactions.length} records`)
    })
  })

  describe('Communities API', () => {
    test('Create new community (requires Friend level)', async () => {
      const communityData = {
        name: 'Test G\'s Community',
        description: 'A test community for G\'s system integration',
        category: 'general',
        minGLevel: 1,
        gRequirement: 10,
        isPrivate: false
      }

      const response = await api.post(`/api/friends/communities`, {
        ...communityData,
        creatorId: testUserId
      })
      
      // Should succeed if user is Friend level or higher
      if (response.status === 201) {
        expect(response.data).toMatchObject({
          success: true,
          community: expect.objectContaining({
            name: communityData.name,
            category: communityData.category,
            creatorId: testUserId,
            minGLevel: communityData.minGLevel
          })
        })

        testCommunityId = response.data.community.id
        console.log(`✅ Created community: ${response.data.community.name}`)
      } else if (response.status === 403) {
        console.log('⚠️  Cannot create community: user level too low')
        expect(response.data.error).toContain('level')
      }
    })

    test('List available communities', async () => {
      const response = await api.get('/api/friends/communities')
      
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        success: true,
        communities: expect.any(Array)
      })

      console.log(`✅ Found ${response.data.communities.length} communities`)
    })

    test('Join community with G requirements', async () => {
      if (!testCommunityId) {
        console.log('⏭️  Skipping community join test - no community created')
        return
      }

      const response = await api.post(`/api/friends/communities/${testCommunityId}/join`, {
        userId: testUserId,
        message: 'Testing G\'s system integration'
      })
      
      expect([200, 400, 403]).toContain(response.status)
      
      if (response.status === 200) {
        expect(response.data).toMatchObject({
          success: true,
          membership: expect.any(Object)
        })
        console.log('✅ Successfully joined community')
      } else {
        console.log(`⚠️  Cannot join community: ${response.data.error}`)
      }
    })
  })

  describe('Opportunities Marketplace API', () => {
    test('List available opportunities', async () => {
      const response = await api.get('/api/friends/opportunities')
      
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        success: true,
        opportunities: expect.any(Array)
      })

      console.log(`✅ Found ${response.data.opportunities.length} opportunities`)
    })

    test('Create new opportunity', async () => {
      const opportunityData = {
        type: 'bandwidth_share',
        title: 'Test Bandwidth Sharing',
        description: 'Help test user with bandwidth for streaming',
        category: 'quick_help',
        requirements: {
          minGLevel: 1,
          timeCommitment: '1 hour'
        },
        rewards: {
          gAmount: 20,
          reputationBoost: 3
        },
        maxParticipants: 2
      }

      const response = await api.post('/api/friends/opportunities', {
        ...opportunityData,
        creatorId: testUserId
      })
      
      expect([201, 403]).toContain(response.status)
      
      if (response.status === 201) {
        expect(response.data).toMatchObject({
          success: true,
          opportunity: expect.objectContaining({
            title: opportunityData.title,
            rewards: expect.objectContaining({
              gAmount: opportunityData.rewards.gAmount
            })
          })
        })
        console.log(`✅ Created opportunity: ${response.data.opportunity.title}`)
      } else {
        console.log('⚠️  Cannot create opportunity: insufficient level or balance')
      }
    })

    test('Filter opportunities by G level', async () => {
      const response = await api.get(`/api/friends/opportunities?maxGLevel=3&minReward=10`)
      
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        success: true,
        opportunities: expect.any(Array),
        filters: expect.objectContaining({
          maxGLevel: 3,
          minReward: 10
        })
      })

      // All opportunities should meet filter criteria
      response.data.opportunities.forEach((opp: any) => {
        expect(opp.requirements.minGLevel).toBeLessThanOrEqual(3)
        expect(opp.rewards.gAmount).toBeGreaterThanOrEqual(10)
      })

      console.log(`✅ Filtered opportunities: ${response.data.opportunities.length} results`)
    })
  })

  describe('Perks Marketplace API', () => {
    test('List available perks', async () => {
      const response = await api.get('/api/friends/perks')
      
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        success: true,
        perks: expect.any(Array)
      })

      console.log(`✅ Found ${response.data.perks.length} perks`)
    })

    test('Get affordable perks for user', async () => {
      const response = await api.get(`/api/friends/perks/affordable/${testUserId}`)
      
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        success: true,
        perks: expect.any(Array),
        userLevel: expect.any(Number),
        userBalance: expect.any(Number)
      })

      // All perks should be affordable for the user
      response.data.perks.forEach((perk: any) => {
        expect(perk.requiredLevel).toBeLessThanOrEqual(response.data.userLevel)
        expect(perk.gCost).toBeLessThanOrEqual(response.data.userBalance)
      })

      console.log(`✅ Affordable perks: ${response.data.perks.length} options`)
    })

    test('Purchase a perk', async () => {
      // First get affordable perks
      const perksResponse = await api.get(`/api/friends/perks/affordable/${testUserId}`)
      
      if (perksResponse.data.perks.length === 0) {
        console.log('⏭️  Skipping perk purchase - no affordable perks')
        return
      }

      const cheapestPerk = perksResponse.data.perks.sort((a: any, b: any) => a.gCost - b.gCost)[0]
      
      const response = await api.post(`/api/friends/perks/purchase`, {
        userId: testUserId,
        perkId: cheapestPerk.id
      })
      
      expect([200, 400]).toContain(response.status)
      
      if (response.status === 200) {
        expect(response.data).toMatchObject({
          success: true,
          purchase: expect.objectContaining({
            perkId: cheapestPerk.id,
            userId: testUserId,
            gSpent: cheapestPerk.gCost
          })
        })
        console.log(`✅ Purchased perk: ${cheapestPerk.name} for ${cheapestPerk.gCost} G's`)
      } else {
        console.log(`⚠️  Purchase failed: ${response.data.error}`)
      }
    })
  })

  describe('Analytics and Leaderboards API', () => {
    test('Get G\'s system statistics', async () => {
      const response = await api.get('/api/friends/stats')
      
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        success: true,
        stats: expect.objectContaining({
          totalUsers: expect.any(Number),
          totalGsCirculating: expect.any(Number),
          totalBandwidthShared: expect.any(Number),
          totalCommunities: expect.any(Number),
          averageGLevel: expect.any(Number)
        })
      })

      console.log(`✅ System stats:`)
      console.log(`   👥 Total Users: ${response.data.stats.totalUsers}`)
      console.log(`   💰 G's Circulating: ${response.data.stats.totalGsCirculating}`)
      console.log(`   📡 Bandwidth Shared: ${response.data.stats.totalBandwidthShared} MB`)
      console.log(`   🏘️  Communities: ${response.data.stats.totalCommunities}`)
    })

    test('Get leaderboard by G balance', async () => {
      const response = await api.get('/api/friends/leaderboard?category=gs&limit=10')
      
      expect(response.status).toBe(200)
      expect(response.data).toMatchObject({
        success: true,
        leaderboard: expect.any(Array),
        category: 'gs'
      })

      // Verify leaderboard is sorted by G balance
      const leaderboard = response.data.leaderboard
      for (let i = 1; i < leaderboard.length; i++) {
        expect(leaderboard[i].stats.gBalance).toBeLessThanOrEqual(leaderboard[i-1].stats.gBalance)
      }

      console.log(`✅ G's Leaderboard (top ${leaderboard.length}):`)
      leaderboard.slice(0, 3).forEach((user: any, index: number) => {
        console.log(`   ${index + 1}. ${user.displayName}: ${user.stats.gBalance} G's (Level ${user.gLevel.level})`)
      })
    })
  })

  describe('Performance and Load Testing', () => {
    test('API response times are acceptable', async () => {
      const endpoints = [
        '/api/friends/communities',
        '/api/friends/opportunities',
        '/api/friends/perks',
        '/api/friends/stats'
      ]

      for (const endpoint of endpoints) {
        const response = await api.get(endpoint)
        expect(response.status).toBe(200)
        expect(response.responseTime).toBeLessThan(1000) // Under 1 second
        
        console.log(`⚡ ${endpoint}: ${response.responseTime}ms`)
      }
    })

    test('Concurrent G earning requests', async () => {
      const concurrentRequests = 5
      const earningData = {
        dataTransferred: 10,
        pricePerMB: 0.1,
        qualityBonus: 0
      }

      const startTime = Date.now()
      const promises = Array.from({ length: concurrentRequests }, () =>
        api.post(`/api/friends/profile/${testUserId}/earn-gs`, earningData)
      )

      const responses = await Promise.all(promises)
      const endTime = Date.now()

      responses.forEach(response => {
        expect(response.status).toBe(200)
      })

      console.log(`✅ ${concurrentRequests} concurrent requests completed in ${endTime - startTime}ms`)
    })
  })

  afterAll(async () => {
    // Cleanup test data
    if (testUserId) {
      await api.delete(`/api/friends/profile/${testUserId}`)
      console.log('🧹 Cleaned up test profile')
    }
    
    if (testCommunityId) {
      await api.delete(`/api/friends/communities/${testCommunityId}`)
      console.log('🧹 Cleaned up test community')
    }
  })
})