import { z } from 'zod'

// =================================================================
// PORKBUN API TYPES & VALIDATION SCHEMAS
// =================================================================

// Base API Response Schema
export const PorkbunResponseSchema = z.object({
  status: z.enum(['SUCCESS', 'ERROR']),
  message: z.string().optional()
})

// Domain Pricing Schema
export const TLDPricingSchema = z.record(z.object({
  registration: z.string(),
  renewal: z.string(), 
  transfer: z.string()
}))

export const DomainPricingResponseSchema = PorkbunResponseSchema.extend({
  pricing: TLDPricingSchema
})

// Domain Availability Schema
export const DomainAvailabilitySchema = z.object({
  avail: z.enum(['yes', 'no']),
  type: z.string(),
  price: z.string(),
  firstYearPromo: z.enum(['yes', 'no']).optional(),
  regularPrice: z.string(),
  premium: z.enum(['yes', 'no']),
  additional: z.object({
    renewal: z.object({
      type: z.string(),
      price: z.string(),
      regularPrice: z.string()
    }),
    transfer: z.object({
      type: z.string(), 
      price: z.string(),
      regularPrice: z.string()
    })
  })
})

export const DomainCheckResponseSchema = PorkbunResponseSchema.extend({
  response: DomainAvailabilitySchema,
  limits: z.object({
    TTL: z.string(),
    limit: z.string(),
    used: z.number(),
    naturalLanguage: z.string()
  }).optional()
})

// Domain List Schema
export const DomainInfoSchema = z.object({
  domain: z.string(),
  status: z.string(),
  tld: z.string(),
  createDate: z.string(),
  expireDate: z.string(),
  securityLock: z.string(),
  whoisPrivacy: z.string(),
  autoRenew: z.number(),
  notLocal: z.number(),
  labels: z.array(z.object({
    id: z.string(),
    title: z.string(),
    color: z.string()
  })).optional()
})

export const DomainListResponseSchema = PorkbunResponseSchema.extend({
  domains: z.array(DomainInfoSchema)
})

// DNS Record Schema
export const DNSRecordSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.string(),
  content: z.string(),
  ttl: z.string(),
  prio: z.string(),
  notes: z.string().optional()
})

export const DNSRecordsResponseSchema = PorkbunResponseSchema.extend({
  records: z.array(DNSRecordSchema)
})

// Create DNS Record Request
export const CreateDNSRecordSchema = z.object({
  name: z.string().optional(),
  type: z.enum(['A', 'MX', 'CNAME', 'ALIAS', 'TXT', 'NS', 'AAAA', 'SRV', 'TLSA', 'CAA', 'HTTPS', 'SVCB']),
  content: z.string(),
  ttl: z.string().optional(),
  prio: z.string().optional(),
  notes: z.string().optional()
})

// URL Forward Schema
export const URLForwardSchema = z.object({
  id: z.string(),
  subdomain: z.string(),
  location: z.string(),
  type: z.enum(['temporary', 'permanent']),
  includePath: z.enum(['yes', 'no']),
  wildcard: z.enum(['yes', 'no'])
})

export const URLForwardsResponseSchema = PorkbunResponseSchema.extend({
  forwards: z.array(URLForwardSchema)
})

// Name Server Schema
export const NameServerResponseSchema = PorkbunResponseSchema.extend({
  ns: z.array(z.string())
})

// Authentication Schema
export const PorkbunAuthSchema = z.object({
  secretapikey: z.string(),
  apikey: z.string()
})

// Rate Limiting Schema
export const RateLimitSchema = z.object({
  remaining: z.number(),
  resetTime: z.number(),
  limit: z.number()
})

// G's Token Integration Schemas
export const GSTokenPricingSchema = z.object({
  usd_price: z.number(),
  gs_token_price: z.number(),
  conversion_rate: z.number(),
  markup_percentage: z.number(),
  platform_fee_gs: z.number()
})

export const DomainPurchaseRequestSchema = z.object({
  domain: z.string(),
  years: z.number().min(1).max(10),
  payment_method: z.enum(['gs_tokens', 'usd']),
  gs_token_amount: z.number().optional(),
  user_id: z.string(),
  success_url: z.string().url(),
  cancel_url: z.string().url(),
  metadata: z.object({
    user_level: z.number(),
    referral_code: z.string().optional(),
    marketplace_source: z.string()
  }).optional()
})

// =================================================================
// TYPESCRIPT TYPES (INFERRED FROM SCHEMAS)
// =================================================================

export type PorkbunResponse = z.infer<typeof PorkbunResponseSchema>
export type TLDPricing = z.infer<typeof TLDPricingSchema>
export type DomainPricingResponse = z.infer<typeof DomainPricingResponseSchema>
export type DomainAvailability = z.infer<typeof DomainAvailabilitySchema>
export type DomainCheckResponse = z.infer<typeof DomainCheckResponseSchema>
export type DomainInfo = z.infer<typeof DomainInfoSchema>
export type DomainListResponse = z.infer<typeof DomainListResponseSchema>
export type DNSRecord = z.infer<typeof DNSRecordSchema>
export type DNSRecordsResponse = z.infer<typeof DNSRecordsResponseSchema>
export type CreateDNSRecord = z.infer<typeof CreateDNSRecordSchema>
export type URLForward = z.infer<typeof URLForwardSchema>
export type URLForwardsResponse = z.infer<typeof URLForwardsResponseSchema>
export type NameServerResponse = z.infer<typeof NameServerResponseSchema>
export type PorkbunAuth = z.infer<typeof PorkbunAuthSchema>
export type RateLimit = z.infer<typeof RateLimitSchema>
export type GSTokenPricing = z.infer<typeof GSTokenPricingSchema>
export type DomainPurchaseRequest = z.infer<typeof DomainPurchaseRequestSchema>

// =================================================================
// ERROR TYPES
// =================================================================

export class PorkbunAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'PorkbunAPIError'
  }
}

export class RateLimitError extends PorkbunAPIError {
  constructor(
    message: string,
    public resetTime: number,
    public limit: number
  ) {
    super(message, 429)
    this.name = 'RateLimitError'
  }
}

// =================================================================
// MARKETPLACE ENHANCEMENTS
// =================================================================

export interface DomainMarketplaceItem {
  domain: string
  tld: string
  availability: 'available' | 'taken' | 'premium' | 'checking'
  pricing: {
    usd: number
    gs_tokens: number
    years: number
    is_premium: boolean
    first_year_promo: boolean
  }
  features: {
    whois_privacy: boolean
    ssl_included: boolean
    dns_management: boolean
    email_forwarding: boolean
  }
  metadata: {
    length: number
    contains_numbers: boolean
    contains_hyphens: boolean
    readability_score: number
    brandability_score: number
  }
}

export interface DomainSearchFilters {
  tlds: string[]
  max_price_usd?: number
  max_price_gs?: number
  max_length?: number
  include_premium?: boolean
  require_available?: boolean
  sort_by: 'price' | 'length' | 'brandability' | 'popularity'
  sort_order: 'asc' | 'desc'
}

export interface DomainSearchResult {
  query: string
  filters: DomainSearchFilters
  suggestions: DomainMarketplaceItem[]
  total_found: number
  search_time_ms: number
  rate_limit: RateLimit
  gs_conversion_rate: number
}