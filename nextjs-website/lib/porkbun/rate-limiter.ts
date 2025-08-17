import { PorkbunAPIError, RateLimitError } from './types'

// =================================================================
// RATE LIMITER WITH QUEUE MANAGEMENT
// =================================================================

interface QueuedRequest {
  id: string
  endpoint: string
  data: any
  resolve: (value: any) => void
  reject: (error: any) => void
  timestamp: number
  retries: number
}

interface RateLimitState {
  remaining: number
  resetTime: number
  limit: number
  lastUpdate: number
}

export class PorkbunRateLimiter {
  private queue: QueuedRequest[] = []
  private processing = false
  private rateLimits: Map<string, RateLimitState> = new Map()
  
  // Rate limiting configuration
  private readonly DEFAULT_LIMIT = 10 // requests per window
  private readonly WINDOW_SIZE = 60 * 1000 // 1 minute
  private readonly MAX_RETRIES = 3
  private readonly RETRY_DELAY = 2000 // 2 seconds

  constructor(private client: PorkbunClient) {}

  async enqueue<T>(
    endpoint: string,
    data: any,
    options: { priority?: number } = {}
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const request: QueuedRequest = {
        id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        endpoint,
        data,
        resolve,
        reject,
        timestamp: Date.now(),
        retries: 0
      }

      // Insert based on priority (higher priority = lower index)
      if (options.priority && options.priority > 0) {
        this.queue.unshift(request)
      } else {
        this.queue.push(request)
      }

      this.processQueue()
    })
  }

  private async processQueue() {
    if (this.processing || this.queue.length === 0) {
      return
    }

    this.processing = true

    while (this.queue.length > 0) {
      const request = this.queue.shift()!
      
      try {
        // Check rate limits
        if (this.isRateLimited(request.endpoint)) {
          const rateLimit = this.rateLimits.get(request.endpoint)!
          const waitTime = rateLimit.resetTime - Date.now()
          
          if (waitTime > 0) {
            // Put request back at front of queue and wait
            this.queue.unshift(request)
            await this.sleep(Math.min(waitTime, 5000)) // Max 5 second wait
            continue
          }
        }

        // Execute request
        const result = await this.executeRequest(request)
        request.resolve(result)

      } catch (error) {
        if (error instanceof RateLimitError && request.retries < this.MAX_RETRIES) {
          // Retry with exponential backoff
          request.retries++
          await this.sleep(this.RETRY_DELAY * Math.pow(2, request.retries - 1))
          this.queue.unshift(request) // Put back at front
          continue
        }

        request.reject(error)
      }
    }

    this.processing = false
  }

  private async executeRequest(request: QueuedRequest): Promise<any> {
    try {
      const response = await fetch(`https://api.porkbun.com/api/json/v3${request.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'InternetFriends-TokenMarketplace/1.0'
        },
        body: JSON.stringify(request.data)
      })

      // Update rate limiting info from headers
      this.updateRateLimit(request.endpoint, response.headers)

      if (!response.ok) {
        if (response.status === 429) {
          const resetTime = parseInt(response.headers.get('X-RateLimit-Reset') || '0') * 1000
          throw new RateLimitError(
            'Rate limit exceeded',
            resetTime,
            parseInt(response.headers.get('X-RateLimit-Limit') || '0')
          )
        }

        throw new PorkbunAPIError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        )
      }

      const data = await response.json()

      // Check for API-level errors
      if (data.status === 'ERROR') {
        throw new PorkbunAPIError(data.message || 'API Error')
      }

      return data

    } catch (error) {
      if (error instanceof PorkbunAPIError || error instanceof RateLimitError) {
        throw error
      }

      // Network or parsing errors
      throw new PorkbunAPIError(
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      )
    }
  }

  private updateRateLimit(endpoint: string, headers: Headers) {
    const remaining = parseInt(headers.get('X-RateLimit-Remaining') || '0')
    const limit = parseInt(headers.get('X-RateLimit-Limit') || '0')
    const resetTime = parseInt(headers.get('X-RateLimit-Reset') || '0') * 1000

    this.rateLimits.set(endpoint, {
      remaining: remaining || this.DEFAULT_LIMIT,
      limit: limit || this.DEFAULT_LIMIT,
      resetTime: resetTime || (Date.now() + this.WINDOW_SIZE),
      lastUpdate: Date.now()
    })
  }

  private isRateLimited(endpoint: string): boolean {
    const rateLimit = this.rateLimits.get(endpoint)
    
    if (!rateLimit) {
      return false
    }

    // Reset if window has passed
    if (Date.now() > rateLimit.resetTime) {
      this.rateLimits.delete(endpoint)
      return false
    }

    return rateLimit.remaining <= 0
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  // Public methods for monitoring
  getQueueStatus() {
    return {
      queue_length: this.queue.length,
      processing: this.processing,
      rate_limits: Object.fromEntries(this.rateLimits)
    }
  }

  clearQueue() {
    this.queue.forEach(request => {
      request.reject(new Error('Queue cleared'))
    })
    this.queue = []
  }
}

// =================================================================
// CACHE MANAGER
// =================================================================

interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number
}

export class PorkbunCache {
  private cache: Map<string, CacheEntry<any>> = new Map()
  private readonly DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes
  private readonly PRICING_TTL = 24 * 60 * 60 * 1000 // 24 hours
  private readonly DOMAIN_CHECK_TTL = 60 * 1000 // 1 minute

  set<T>(key: string, data: T, ttl?: number): void {
    const actualTTL = ttl ?? this.getTTLForKey(key)
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: actualTTL
    })

    // Clean up expired entries periodically
    if (this.cache.size % 100 === 0) {
      this.cleanup()
    }
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    return entry.data as T
  }

  has(key: string): boolean {
    return this.get(key) !== null
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  private getTTLForKey(key: string): number {
    if (key.includes('pricing')) {
      return this.PRICING_TTL
    }
    
    if (key.includes('domain-check')) {
      return this.DOMAIN_CHECK_TTL
    }

    return this.DEFAULT_TTL
  }

  private cleanup(): void {
    const now = Date.now()
    
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > entry.ttl) {
        this.cache.delete(key)
      }
    }
  }

  getStats() {
    const now = Date.now()
    let expired = 0
    let active = 0

    for (const entry of this.cache.values()) {
      if (now - entry.timestamp > entry.ttl) {
        expired++
      } else {
        active++
      }
    }

    return {
      total_entries: this.cache.size,
      active_entries: active,
      expired_entries: expired,
      cache_hit_potential: active / (active + expired) || 0
    }
  }
}

// =================================================================
// FORWARD DECLARATION
// =================================================================

export interface PorkbunClient {
  // This interface will be defined in client.ts
  // Needed here to avoid circular dependencies
}