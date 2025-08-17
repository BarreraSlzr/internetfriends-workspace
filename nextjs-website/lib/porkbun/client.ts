import {
  type PorkbunAuth,
  type DomainPricingResponse,
  type DomainCheckResponse,
  type DomainListResponse,
  type DNSRecordsResponse,
  type CreateDNSRecord,
  type URLForwardsResponse,
  type NameServerResponse,
  type DomainMarketplaceItem,
  type DomainSearchResult,
  type DomainSearchFilters,
  type GSTokenPricing,
  PorkbunAPIError,
  RateLimitError,
  DomainPricingResponseSchema,
  DomainCheckResponseSchema,
  DomainListResponseSchema,
  DNSRecordsResponseSchema,
  URLForwardsResponseSchema,
  NameServerResponseSchema
} from './types'
import { PorkbunRateLimiter, PorkbunCache } from './rate-limiter'

// =================================================================
// PORKBUN API CLIENT
// =================================================================

export class PorkbunClient {
  private auth: PorkbunAuth
  private rateLimiter: PorkbunRateLimiter
  private cache: PorkbunCache
  private baseURL = 'https://api.porkbun.com/api/json/v3'

  constructor(apiKey: string, secretApiKey: string) {
    this.auth = {
      apikey: apiKey,
      secretapikey: secretApiKey
    }
    
    this.cache = new PorkbunCache()
    this.rateLimiter = new PorkbunRateLimiter(this)
  }

  // =================================================================
  // DOMAIN PRICING & AVAILABILITY
  // =================================================================

  async getDomainPricing(): Promise<DomainPricingResponse> {
    const cacheKey = 'domain-pricing-all'
    const cached = this.cache.get<DomainPricingResponse>(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const response = await fetch(`${this.baseURL}/pricing/get`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'InternetFriends-TokenMarketplace/1.0'
        }
      })

      if (!response.ok) {
        throw new PorkbunAPIError(`HTTP ${response.status}: ${response.statusText}`, response.status)
      }

      const data = await response.json()
      const validated = DomainPricingResponseSchema.parse(data)
      
      this.cache.set(cacheKey, validated, 24 * 60 * 60 * 1000) // 24 hours
      return validated

    } catch (error) {
      if (error instanceof PorkbunAPIError) {
        throw error
      }
      throw new PorkbunAPIError(`Failed to fetch pricing: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  async checkDomainAvailability(domain: string): Promise<DomainCheckResponse> {
    const cacheKey = `domain-check-${domain.toLowerCase()}`
    const cached = this.cache.get<DomainCheckResponse>(cacheKey)
    
    if (cached) {
      return cached
    }

    const data = await this.rateLimiter.enqueue<DomainCheckResponse>(
      `/domain/checkDomain/${encodeURIComponent(domain)}`,
      this.auth,
      { priority: 1 } // High priority for domain checks
    )

    const validated = DomainCheckResponseSchema.parse(data)
    this.cache.set(cacheKey, validated, 60 * 1000) // 1 minute cache
    
    return validated
  }

  async searchDomains(
    query: string, 
    filters: Partial<DomainSearchFilters> = {}
  ): Promise<DomainSearchResult> {
    const startTime = Date.now()
    
    // Default filters
    const searchFilters: DomainSearchFilters = {
      tlds: filters.tlds || ['com', 'net', 'org', 'io', 'app', 'dev'],
      max_price_usd: filters.max_price_usd,
      max_price_gs: filters.max_price_gs,
      max_length: filters.max_length || 50,
      include_premium: filters.include_premium ?? false,
      require_available: filters.require_available ?? true,
      sort_by: filters.sort_by || 'price',
      sort_order: filters.sort_order || 'asc'
    }

    // Get pricing data
    const pricingData = await this.getDomainPricing()
    
    // Generate domain suggestions
    const suggestions: DomainMarketplaceItem[] = []
    
    for (const tld of searchFilters.tlds) {
      const domainName = `${query}.${tld}`
      
      try {
        // Check availability
        const availability = await this.checkDomainAvailability(domainName)
        
        if (searchFilters.require_available && availability.response.avail === 'no') {
          continue
        }

        // Get pricing for this TLD
        const tldPricing = pricingData.pricing[tld]
        if (!tldPricing) continue

        const usdPrice = parseFloat(availability.response.price)
        const gsTokenPrice = await this.convertUSDToGSTokens(usdPrice)

        // Apply filters
        if (searchFilters.max_price_usd && usdPrice > searchFilters.max_price_usd) continue
        if (searchFilters.max_price_gs && gsTokenPrice > searchFilters.max_price_gs) continue
        if (domainName.length > (searchFilters.max_length || 50)) continue
        if (!searchFilters.include_premium && availability.response.premium === 'yes') continue

        const marketplaceItem: DomainMarketplaceItem = {
          domain: domainName,
          tld: tld,
          availability: availability.response.avail === 'yes' ? 'available' : 'taken',
          pricing: {
            usd: usdPrice,
            gs_tokens: gsTokenPrice,
            years: 1,
            is_premium: availability.response.premium === 'yes',
            first_year_promo: availability.response.firstYearPromo === 'yes'
          },
          features: {
            whois_privacy: true, // Porkbun includes free WHOIS privacy
            ssl_included: true,  // Free SSL certificates
            dns_management: true,
            email_forwarding: true
          },
          metadata: {
            length: domainName.length,
            contains_numbers: /\d/.test(query),
            contains_hyphens: /-/.test(query),
            readability_score: this.calculateReadabilityScore(query),
            brandability_score: this.calculateBrandabilityScore(query)
          }
        }

        suggestions.push(marketplaceItem)

      } catch (error) {
        console.warn(`Failed to check ${domainName}:`, error)
        continue
      }
    }

    // Sort results
    this.sortDomainSuggestions(suggestions, searchFilters.sort_by, searchFilters.sort_order)

    const searchTime = Date.now() - startTime
    const gsConversionRate = await this.getGSTokenConversionRate()

    return {
      query,
      filters: searchFilters,
      suggestions,
      total_found: suggestions.length,
      search_time_ms: searchTime,
      rate_limit: {
        remaining: 10, // This would come from actual API response
        resetTime: Date.now() + 60000,
        limit: 10
      },
      gs_conversion_rate: gsConversionRate
    }
  }

  // =================================================================
  // DOMAIN MANAGEMENT
  // =================================================================

  async listDomains(start = 0, includeLabels = false): Promise<DomainListResponse> {
    const cacheKey = `domain-list-${start}-${includeLabels}`
    const cached = this.cache.get<DomainListResponse>(cacheKey)
    
    if (cached) {
      return cached
    }

    const requestData = {
      ...this.auth,
      start: start.toString(),
      includeLabels: includeLabels ? 'yes' : 'no'
    }

    const data = await this.rateLimiter.enqueue<DomainListResponse>(
      '/domain/listAll',
      requestData
    )

    const validated = DomainListResponseSchema.parse(data)
    this.cache.set(cacheKey, validated, 5 * 60 * 1000) // 5 minutes
    
    return validated
  }

  async getDNSRecords(domain: string): Promise<DNSRecordsResponse> {
    const cacheKey = `dns-records-${domain}`
    const cached = this.cache.get<DNSRecordsResponse>(cacheKey)
    
    if (cached) {
      return cached
    }

    const data: any = await this.rateLimiter.enqueue<any>(
      `/dns/retrieve/${encodeURIComponent(domain)}`,
      this.auth
    )

    const validated = DNSRecordsResponseSchema.parse(data)
    this.cache.set(cacheKey, validated, 2 * 60 * 1000) // 2 minutes
    
    return validated
  }

  async createDNSRecord(domain: string, record: CreateDNSRecord): Promise<{ id: string }> {
    const requestData = {
      ...this.auth,
      ...record
    }

    const data = await this.rateLimiter.enqueue(
      `/dns/create/${encodeURIComponent(domain)}`,
      requestData
    )

    // Clear cache for this domain
    this.cache.delete(`dns-records-${domain}`)

    return { id: data.id }
  }

  async getURLForwards(domain: string): Promise<URLForwardsResponse> {
    const data = await this.rateLimiter.enqueue<URLForwardsResponse>(
      `/domain/getUrlForwarding/${encodeURIComponent(domain)}`,
      this.auth
    )

    return URLForwardsResponseSchema.parse(data)
  }

  async getNameServers(domain: string): Promise<NameServerResponse> {
    const data: any = await this.rateLimiter.enqueue<any>(
      `/domain/getNs/${encodeURIComponent(domain)}`,
      this.auth
    )

    return NameServerResponseSchema.parse(data)
  }

  // =================================================================
  // G'S TOKEN INTEGRATION
  // =================================================================

  async convertUSDToGSTokens(usdAmount: number): Promise<number> {
    // This would integrate with the existing economics system
    // For now, using a simulated conversion rate
    const conversionRate = await this.getGSTokenConversionRate()
    return Math.ceil(usdAmount * conversionRate)
  }

  async getGSTokenConversionRate(): Promise<number> {
    // This should integrate with the existing G's economics monitor
    // Using simulated rate for now
    return 40 // 40 G's per USD (from existing economics data)
  }

  async calculateGSTokenPricing(usdPrice: number, years: number = 1): Promise<GSTokenPricing> {
    const conversionRate = await this.getGSTokenConversionRate()
    const markupPercentage = 0.10 // 10% marketplace fee
    const totalUSD = usdPrice * years
    const baseGSTokens = totalUSD * conversionRate
    const markupGSTokens = baseGSTokens * markupPercentage
    const totalGSTokens = baseGSTokens + markupGSTokens

    return {
      usd_price: totalUSD,
      gs_token_price: Math.ceil(totalGSTokens),
      conversion_rate: conversionRate,
      markup_percentage: markupPercentage * 100,
      platform_fee_gs: Math.ceil(markupGSTokens)
    }
  }

  // =================================================================
  // UTILITY METHODS
  // =================================================================

  private calculateReadabilityScore(domain: string): number {
    // Simple readability scoring algorithm
    let score = 100
    
    // Penalize for length
    if (domain.length > 10) score -= (domain.length - 10) * 2
    
    // Penalize for numbers and hyphens
    if (/\d/.test(domain)) score -= 10
    if (/-/.test(domain)) score -= 5
    
    // Penalize for difficult letter combinations
    if (/[qxz]/.test(domain.toLowerCase())) score -= 5
    
    return Math.max(0, Math.min(100, score))
  }

  private calculateBrandabilityScore(domain: string): number {
    // Simple brandability scoring
    let score = 50
    
    // Favor shorter domains
    if (domain.length <= 6) score += 20
    else if (domain.length <= 8) score += 10
    
    // Favor pronounceable combinations
    const vowels = domain.match(/[aeiou]/gi)?.length || 0
    const consonants = domain.length - vowels
    const vowelRatio = vowels / domain.length
    
    if (vowelRatio >= 0.3 && vowelRatio <= 0.6) score += 15
    
    // Penalize numbers and hyphens for brandability
    if (/\d/.test(domain)) score -= 20
    if (/-/.test(domain)) score -= 15
    
    return Math.max(0, Math.min(100, score))
  }

  private sortDomainSuggestions(
    suggestions: DomainMarketplaceItem[],
    sortBy: DomainSearchFilters['sort_by'],
    sortOrder: DomainSearchFilters['sort_order']
  ): void {
    suggestions.sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'price':
          comparison = a.pricing.gs_tokens - b.pricing.gs_tokens
          break
        case 'length':
          comparison = a.domain.length - b.domain.length
          break
        case 'brandability':
          comparison = a.metadata.brandability_score - b.metadata.brandability_score
          break
        case 'popularity':
          // Simplified popularity based on TLD
          const popularTLDs = ['com', 'org', 'net', 'io', 'app']
          const aPopularity = popularTLDs.indexOf(a.tld)
          const bPopularity = popularTLDs.indexOf(b.tld)
          comparison = (aPopularity === -1 ? 999 : aPopularity) - (bPopularity === -1 ? 999 : bPopularity)
          break
      }
      
      return sortOrder === 'desc' ? -comparison : comparison
    })
  }

  // =================================================================
  // CLIENT STATUS & MONITORING
  // =================================================================

  async ping(): Promise<{ status: string; yourIp: string }> {
    const data = await this.rateLimiter.enqueue(
      '/ping',
      this.auth,
      { priority: 10 } // Highest priority for health checks
    )

    return {
      status: data.status,
      yourIp: data.yourIp
    }
  }

  getClientStatus() {
    return {
      cache_stats: this.cache.getStats(),
      queue_status: this.rateLimiter.getQueueStatus(),
      auth_configured: !!(this.auth.apikey && this.auth.secretapikey)
    }
  }

  clearCache() {
    this.cache.clear()
  }

  clearQueue() {
    this.rateLimiter.clearQueue()
  }
}

// =================================================================
// SINGLETON INSTANCE
// =================================================================

let porkbunClient: PorkbunClient | null = null

export function getPorkbunClient(): PorkbunClient {
  if (!porkbunClient) {
    const apiKey = process.env.PORKBUN_API_KEY
    const secretApiKey = process.env.PORKBUN_SECRET_API_KEY
    
    if (!apiKey || !secretApiKey) {
      throw new Error('Porkbun API credentials not configured. Set PORKBUN_API_KEY and PORKBUN_SECRET_API_KEY environment variables.')
    }
    
    porkbunClient = new PorkbunClient(apiKey, secretApiKey)
  }
  
  return porkbunClient
}