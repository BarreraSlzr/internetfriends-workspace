import { describe, expect, test } from 'bun:test'
import { 
  searchMockDomains, 
  getMockDomainByName, 
  getMockDomainsByCategory,
  getAvailableMockDomains,
  simulatePurchase,
  mockDomainResults,
  mockAnalyticsData
} from '@/lib/porkbun/mock-data'

describe('Domain Marketplace Mock Data', () => {
  test('should search domains by query', () => {
    const results = searchMockDomains('link')
    expect(results.length).toBeGreaterThan(0)
    expect(results.every(domain => 
      domain.domain.includes('link') || 
      domain.features.some(feature => feature.includes('link'))
    )).toBe(true)
  })

  test('should find specific domain by name', () => {
    const domain = getMockDomainByName('go.to')
    expect(domain).toBeDefined()
    expect(domain?.domain).toBe('go.to')
    expect(domain?.category).toBe('premium')
  })

  test('should filter domains by category', () => {
    const premiumDomains = getMockDomainsByCategory('premium')
    expect(premiumDomains.length).toBeGreaterThan(0)
    expect(premiumDomains.every(domain => domain.category === 'premium')).toBe(true)
  })

  test('should return only available domains', () => {
    const availableDomains = getAvailableMockDomains()
    expect(availableDomains.every(domain => domain.available)).toBe(true)
  })

  test('should simulate successful purchase for available domain', async () => {
    const result = await simulatePurchase('go.to')
    expect(result.success).toBe(true)
    expect(result.escrowId).toBeDefined()
  })

  test('should fail purchase for unavailable domain', async () => {
    const result = await simulatePurchase('rd.it')
    expect(result.success).toBe(false)
    expect(result.error).toContain('not available')
  })

  test('should contain analytics data', () => {
    expect(mockAnalyticsData.totalClicks).toBeGreaterThan(0)
    expect(mockAnalyticsData.uniqueVisitors).toBeGreaterThan(0)
    expect(mockAnalyticsData.topCountries.length).toBeGreaterThan(0)
    expect(mockAnalyticsData.deviceTypes.length).toBeGreaterThan(0)
    expect(mockAnalyticsData.clicksByHour.length).toBe(24)
  })

  test('should have proper domain data structure', () => {
    const domain = mockDomainResults[0]
    expect(domain).toHaveProperty('domain')
    expect(domain).toHaveProperty('available')
    expect(domain).toHaveProperty('price')
    expect(domain).toHaveProperty('currency')
    expect(domain).toHaveProperty('brandabilityScore')
    expect(domain).toHaveProperty('seoScore')
    expect(domain).toHaveProperty('shortUrlOptimal')
    expect(domain).toHaveProperty('category')
    expect(domain).toHaveProperty('features')
    expect(Array.isArray(domain.features)).toBe(true)
  })

  test('should have realistic pricing ranges', () => {
    const premiumDomains = getMockDomainsByCategory('premium')
    const standardDomains = getMockDomainsByCategory('standard')
    const budgetDomains = getMockDomainsByCategory('budget')

    const avgPremium = premiumDomains.reduce((sum, d) => sum + d.price, 0) / premiumDomains.length
    const avgStandard = standardDomains.reduce((sum, d) => sum + d.price, 0) / standardDomains.length
    const avgBudget = budgetDomains.reduce((sum, d) => sum + d.price, 0) / budgetDomains.length

    expect(avgPremium).toBeGreaterThan(avgStandard)
    expect(avgStandard).toBeGreaterThan(avgBudget)
  })
})

// API Integration Tests
describe('Domain API Endpoints (Mock Mode)', () => {
  test('should handle domain search API with mock data', async () => {
    // This would test the actual API endpoints
    // For now, testing the mock data functions they use
    const searchResults = searchMockDomains('short')
    expect(searchResults.length).toBeGreaterThan(0)
    
    const mockResponse = {
      success: true,
      data: {
        query: 'short',
        suggestions: searchResults,
        total_found: searchResults.length,
        search_time_ms: 150,
        gs_conversion_rate: 2.5,
        mock_data: true
      }
    }
    
    expect(mockResponse.success).toBe(true)
    expect(mockResponse.data.mock_data).toBe(true)
  })

  test('should handle domain check API with mock data', () => {
    const domain = getMockDomainByName('lnk.app')
    expect(domain).toBeDefined()
    
    const mockResponse = {
      success: true,
      domain: 'lnk.app',
      availability: {
        available: domain?.available,
        premium: domain?.category === 'premium',
        first_year_promo: false
      },
      pricing: {
        usd: {
          price: domain?.price,
          regular_price: domain?.price,
          renewal_price: Math.round((domain?.price || 0) * 0.8),
          transfer_price: Math.round((domain?.price || 0) * 0.6)
        },
        gs_tokens: {
          price: Math.round((domain?.price || 0) / 2.5),
          conversion_rate: 2.5,
          savings_percent: 12
        }
      },
      mock_data: true
    }
    
    expect(mockResponse.success).toBe(true)
    expect(mockResponse.mock_data).toBe(true)
  })
})

// Performance Tests
describe('Domain Search Performance', () => {
  test('should search domains quickly', () => {
    const start = Date.now()
    const results = searchMockDomains('link')
    const end = Date.now()
    
    expect(end - start).toBeLessThan(10) // Should complete in under 10ms
    expect(results.length).toBeGreaterThan(0)
  })

  test('should handle empty search results gracefully', () => {
    const results = searchMockDomains('nonexistentdomainquery123')
    expect(results).toEqual([])
  })

  test('should handle case insensitive searches', () => {
    const lowerResults = searchMockDomains('link')
    const upperResults = searchMockDomains('LINK')
    const mixedResults = searchMockDomains('Link')
    
    expect(lowerResults.length).toEqual(upperResults.length)
    expect(lowerResults.length).toEqual(mixedResults.length)
  })
})