// Steady Domain Service - Following steadiest addressability patterns
// ≤8 core parameters, productive defaults, unified interface

export interface SteadyDomain {
  domain: string
  price: number      // G's tokens (productive default currency)
  available: boolean
  category: 'premium' | 'standard' | 'budget'
  score: number     // Combined brandability + SEO (0-100)
  owned?: boolean   // For go.rich, internetfriends.xyz
}

export interface SteadyLink {
  code: string      // Short code
  url: string       // Destination
  clicks: number    // Click count
  active: boolean   // Status
}

// Core service with productive defaults
class SteadyDomainService {
  private domains: Map<string, SteadyDomain> = new Map()
  private links: Map<string, SteadyLink> = new Map()

  constructor() {
    this.initializeData()
  }

  // ===== DOMAIN OPERATIONS (≤4 parameters) =====
  
  async searchDomains(
    query: string, 
    budget = 1000,           // G's tokens budget
    category: 'all' | 'premium' | 'standard' | 'budget' = 'all',
    availableOnly = true
  ): Promise<SteadyDomain[]> {
    const results = Array.from(this.domains.values())
      .filter(domain => {
        if (!domain.domain.includes(query.toLowerCase())) return false
        if (availableOnly && !domain.available) return false
        if (category !== 'all' && domain.category !== category) return false
        if (domain.price > budget) return false
        return true
      })
      .sort((a, b) => b.score - a.score) // Best first
      .slice(0, 10) // Productive limit

    return results
  }

  async checkDomain(domain: string): Promise<SteadyDomain | null> {
    return this.domains.get(domain) || null
  }

  async purchaseDomain(
    domain: string,
    tokens: number,
    userId = 'anonymous'
  ): Promise<{ success: boolean; escrowId?: string }> {
    const domainData = this.domains.get(domain)
    if (!domainData?.available || domainData.price > tokens) {
      return { success: false }
    }

    // Simple escrow simulation
    const escrowId = `escrow_${Date.now()}`
    domainData.available = false
    domainData.owned = true
    
    return { success: true, escrowId }
  }

  // ===== LINK OPERATIONS (≤4 parameters) =====

  async createLink(
    url: string,
    code?: string,
    domain = 'go.rich',
    userId = 'anonymous'
  ): Promise<SteadyLink> {
    // Auto-generate code if not provided
    if (!code) {
      code = this.generateCode()
    }

    const link: SteadyLink = {
      code,
      url,
      clicks: 0,
      active: true
    }

    this.links.set(code, link)
    return link
  }

  async getLink(code: string): Promise<SteadyLink | null> {
    return this.links.get(code) || null
  }

  async clickLink(code: string): Promise<string | null> {
    const link = this.links.get(code)
    if (!link?.active) return null

    link.clicks++
    return link.url
  }

  async listLinks(domain = 'go.rich'): Promise<SteadyLink[]> {
    return Array.from(this.links.values())
  }

  // ===== PRIVATE HELPERS =====

  private initializeData() {
    // Owned domains
    this.domains.set('go.rich', {
      domain: 'go.rich',
      price: 0,
      available: false,
      category: 'premium',
      score: 92,
      owned: true
    })

    this.domains.set('internetfriends.xyz', {
      domain: 'internetfriends.xyz', 
      price: 0,
      available: false,
      category: 'standard',
      score: 85,
      owned: true
    })

    // Available domains
    this.domains.set('go.to', {
      domain: 'go.to',
      price: 1000, // 1000 G's tokens = $2500
      available: true,
      category: 'premium',
      score: 95
    })

    this.domains.set('lnk.app', {
      domain: 'lnk.app',
      price: 480, // 480 G's tokens = $1200
      available: true, 
      category: 'premium',
      score: 88
    })

    this.domains.set('short.ly', {
      domain: 'short.ly',
      price: 180, // 180 G's tokens = $450
      available: true,
      category: 'standard', 
      score: 90
    })

    // Demo links
    this.links.set('ig', {
      code: 'ig',
      url: 'https://instagram.com/internetfriends',
      clicks: 47,
      active: true
    })

    this.links.set('gh', {
      code: 'gh', 
      url: 'https://github.com/internetfriends',
      clicks: 23,
      active: true
    })

    this.links.set('domain', {
      code: 'domain',
      url: 'http://localhost:3000/domain',
      clicks: 89,
      active: true
    })
  }

  private generateCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
    let code = ''
    do {
      code = Array.from({ length: 6 }, () => 
        chars[Math.floor(Math.random() * chars.length)]
      ).join('')
    } while (this.links.has(code))
    return code
  }
}

// Singleton instance following steady patterns
export const steadyDomainService = new SteadyDomainService()

// Simple stats helper
export const getDashboardStats = () => {
  const allLinks = Array.from(steadyDomainService['links'].values())
  return {
    totalLinks: allLinks.length,
    totalClicks: allLinks.reduce((sum, link) => sum + link.clicks, 0),
    activeLinks: allLinks.filter(link => link.active).length,
    topDomains: [
      { domain: 'go.rich', score: 92, owned: true },
      { domain: 'internetfriends.xyz', score: 85, owned: true }
    ]
  }
}