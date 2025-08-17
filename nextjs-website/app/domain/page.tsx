'use client'

import { useState, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import type { DomainSearchResult, DomainMarketplaceItem } from '@/lib/porkbun/types'

// =================================================================
// DOMAIN & USERNAME MARKETPLACE PAGE
// =================================================================

interface UsernameSearchResult {
  username: {
    username: string
    fullHandle: string
    tier: 'basic' | 'premium' | 'verified'
    monthly_cost: number
    status: string
    features: string[]
    verification_badge: boolean
  }
  available: boolean
  pricing: {
    monthly_gs: number
    monthly_usd: number
    annual_gs: number
    annual_usd: number
  }
  alternatives: string[]
}

export default function DomainMarketplacePage() {
  const [activeTab, setActiveTab] = useState<'domains' | 'usernames'>('domains')
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<DomainSearchResult | null>(null)
  const [usernameResults, setUsernameResults] = useState<UsernameSearchResult | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [selectedFilters, setSelectedFilters] = useState({
    tlds: ['com', 'net', 'org', 'io', 'app'],
    maxPrice: '',
    includeUnavailable: false,
    sortBy: 'price' as const
  })

  // Real-time search suggestions
  const [suggestions, setSuggestions] = useState<DomainMarketplaceItem[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  // Search functionality for domains
  const performDomainSearch = useCallback(async (query: string, isQuickSearch = false) => {
    if (!query.trim()) return

    setIsSearching(true)
    
    try {
      const searchParams = {
        query: query.trim(),
        tlds: selectedFilters.tlds,
        max_price_usd: selectedFilters.maxPrice ? parseFloat(selectedFilters.maxPrice) : undefined,
        require_available: !selectedFilters.includeUnavailable,
        sort_by: selectedFilters.sortBy,
        sort_order: 'asc' as const
      }

      const endpoint = isQuickSearch ? 
        `/api/domain/search?q=${encodeURIComponent(query)}` :
        '/api/domain/search'
      
      const response = await fetch(endpoint, {
        method: isQuickSearch ? 'GET' : 'POST',
        headers: isQuickSearch ? {} : {
          'Content-Type': 'application/json'
        },
        body: isQuickSearch ? undefined : JSON.stringify(searchParams)
      })

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`)
      }

      const result = await response.json()
      setSearchResults(result)
      setShowSuggestions(false)

    } catch (error) {
      console.error('Domain search error:', error)
      setSearchResults({
        success: false,
        error: error instanceof Error ? error.message : 'Search failed',
        domains: [],
        search_metadata: {
          query: query.trim(),
          total_results: 0,
          search_time_ms: 0,
          filters_applied: selectedFilters
        }
      })
    } finally {
      setIsSearching(false)
    }
  }, [selectedFilters])

  // Search functionality for usernames
  const performUsernameSearch = useCallback(async (query: string) => {
    if (!query.trim()) return

    setIsSearching(true)
    
    try {
      const response = await fetch(`/api/username/search?username=${encodeURIComponent(query.trim())}`)

      if (!response.ok) {
        throw new Error(`Username search failed: ${response.statusText}`)
      }

      const result = await response.json()
      setUsernameResults(result)

    } catch (error) {
      console.error('Username search error:', error)
      setUsernameResults({
        username: {
          username: query.trim(),
          fullHandle: `${query.trim()}.grutiks.com`,
          tier: 'basic',
          monthly_cost: 200,
          status: 'error',
          features: [],
          verification_badge: false
        },
        available: false,
        pricing: { monthly_gs: 200, monthly_usd: 5, annual_gs: 2000, annual_usd: 50 },
        alternatives: []
      })
    } finally {
      setIsSearching(false)
    }
  }, [])

  // Search functionality
  const performSearch = useCallback(async (query: string, isQuickSearch = false) => {
    if (activeTab === 'domains') {
      await performDomainSearch(query, isQuickSearch)
    } else {
      await performUsernameSearch(query)
    }
  }, [activeTab, performDomainSearch, performUsernameSearch])

  // Handle form submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    performSearch(searchQuery)
  }

  // Quick search for suggestions
  useEffect(() => {
    if (searchQuery.length >= 2) {
      const timer = setTimeout(() => {
        performSearch(searchQuery, true)
      }, 300)
      
      return () => clearTimeout(timer)
    } else {
      setSuggestions([])
      setShowSuggestions(false)
    }
  }, [searchQuery, performSearch])



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🌐 Digital Identity Marketplace
          </h1>
          <p className="text-xl text-gray-600 mb-2">
            Find domains & usernames • Pay with G&apos;s tokens
          </p>
          <p className="text-sm text-blue-600">
            ✨ Powered by Porkbun API • 💰 G&apos;s Token Integration • 🚀 Instant Search
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => {
                setActiveTab('domains')
                setSearchResults(null)
                setUsernameResults(null)
              }}
              className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
                activeTab === 'domains'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🌐 Traditional Domains
              <div className="text-xs mt-1 opacity-75">
                .com, .net, .org, .io
              </div>
            </button>
            <button
              onClick={() => {
                setActiveTab('usernames')
                setSearchResults(null)
                setUsernameResults(null)
              }}
              className={`flex-1 py-3 px-6 rounded-md font-medium transition-colors ${
                activeTab === 'usernames'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              👤 Username Subscriptions
              <div className="text-xs mt-1 opacity-75">
                @yourname.grutiks.com
              </div>
            </button>
          </div>
        </div>

        {/* Search Section */}
        <Card className="max-w-4xl mx-auto p-8 mb-8 bg-white/80 backdrop-blur-sm border border-blue-100">
          <form onSubmit={handleSearch} className="space-y-6">
            
            {/* Main Search Input */}
            <div className="relative">
              <Input
                type="text"
                placeholder={activeTab === 'domains' 
                  ? "Enter domain name (e.g., myawesome)" 
                  : "Enter username (e.g., crypto_trader)"
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="text-lg py-4 pr-32"
                disabled={isSearching}
              />
              <Button 
                type="submit" 
                disabled={isSearching || !searchQuery.trim()}
                className="absolute right-2 top-2 bg-blue-600 hover:bg-blue-700"
              >
                {isSearching ? '🔍 Searching...' : '🔍 Search'}
              </Button>
              
              {/* Quick Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                  {suggestions.map((suggestion) => (
                    <div
                      key={suggestion.domain}
                      className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      onClick={() => {
                        setSearchQuery(suggestion.domain.split('.')[0])
                        setShowSuggestions(false)
                        performSearch(suggestion.domain.split('.')[0], false)
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{suggestion.domain}</span>
                          {suggestion.availability === 'available' && (
                            <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              Available
                            </span>
                          )}
                        </div>
                        <div className="text-right text-sm">
                          <div className="font-medium">{suggestion.pricing.gs_tokens} G's</div>
                          <div className="text-gray-500">${suggestion.pricing.usd}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Search Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* TLD Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TLD Extensions
                </label>
                <div className="flex flex-wrap gap-2">
                  {['com', 'net', 'org', 'io', 'app', 'dev', 'tech', 'ai'].map((tld) => (
                    <button
                      key={tld}
                      type="button"
                      onClick={() => {
                        setSelectedFilters(prev => ({
                          ...prev,
                          tlds: prev.tlds.includes(tld)
                            ? prev.tlds.filter(t => t !== tld)
                            : [...prev.tlds, tld]
                        }))
                      }}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        selectedFilters.tlds.includes(tld)
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      .{tld}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Max Price (USD)
                </label>
                <Input
                  type="number"
                  placeholder="e.g., 50"
                  value={selectedFilters.maxPrice}
                  onChange={(e) => setSelectedFilters(prev => ({
                    ...prev,
                    maxPrice: e.target.value
                  }))}
                  className="w-full"
                />
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sort By
                </label>
                <select
                  value={selectedFilters.sortBy}
                  onChange={(e) => setSelectedFilters(prev => ({
                    ...prev,
                    sortBy: e.target.value as any
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="price">Price (Low to High)</option>
                  <option value="length">Domain Length</option>
                  <option value="popularity">TLD Popularity</option>
                  <option value="brandability">Brandability Score</option>
                </select>
              </div>
            </div>

            {/* Additional Options */}
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedFilters.includeUnavailable}
                  onChange={(e) => setSelectedFilters(prev => ({
                    ...prev,
                    includeUnavailable: e.target.checked
                  }))}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">Include unavailable domains</span>
              </label>
            </div>
          </form>
        </Card>

        {/* Search Results */}
        {activeTab === 'domains' && searchResults && (
          <SearchResults 
            results={searchResults} 
            onDomainSelect={(domain) => {
              console.log('Selected domain:', domain)
              // This will integrate with purchase flow
            }}
          />
        )}

        {/* Username Results */}
        {activeTab === 'usernames' && usernameResults && (
          <UsernameResults 
            results={usernameResults} 
            onUsernameSelect={(username) => {
              console.log('Selected username:', username)
              // This will integrate with subscription flow
            }}
            onSearchAlternative={performUsernameSearch}
          />
        )}

        {/* Loading State */}
        {isSearching && !searchResults && !usernameResults && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-600">
              {activeTab === 'domains' ? 'Searching domains...' : 'Searching usernames...'}
            </p>
          </div>
        )}

        {/* Empty State */}
        {!isSearching && !searchResults && !usernameResults && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">{activeTab === 'domains' ? '🔍' : '👤'}</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              {activeTab === 'domains' ? 'Start Your Domain Search' : 'Find Your Perfect Username'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'domains' 
                ? 'Enter a domain name above to find available domains with G\'s token pricing'
                : 'Enter a username above to check availability and pricing for your @handle.grutiks.com'
              }
            </p>
            
            {/* Feature Comparison */}
            <div className="mt-8 max-w-2xl mx-auto">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className={`p-4 rounded-lg border-2 ${activeTab === 'domains' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                  <h4 className="font-medium mb-2">🌐 Traditional Domains</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• One-time purchase</li>
                    <li>• Annual renewals</li>
                    <li>• Full DNS control</li>
                    <li>• All major TLDs</li>
                  </ul>
                </div>
                <div className={`p-4 rounded-lg border-2 ${activeTab === 'usernames' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
                  <h4 className="font-medium mb-2">👤 Username Subscriptions</h4>
                  <ul className="text-gray-600 space-y-1">
                    <li>• Monthly/annual billing</li>
                    <li>• Instant setup</li>
                    <li>• Profile pages</li>
                    <li>• Verification badges</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// =================================================================
// SEARCH RESULTS COMPONENT
// =================================================================

interface SearchResultsProps {
  results: DomainSearchResult
  onDomainSelect: (domain: DomainMarketplaceItem) => void
}

function SearchResults({ results, onDomainSelect }: SearchResultsProps) {
  if (!results.suggestions.length) {
    return (
      <Card className="max-w-4xl mx-auto p-8 text-center">
        <div className="text-4xl mb-4">😔</div>
        <h3 className="text-xl font-medium text-gray-900 mb-2">No domains found</h3>
        <p className="text-gray-600">
          Try adjusting your search filters or searching for a different term
        </p>
      </Card>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      
      {/* Results Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Search Results for "{results.query}"
        </h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Found {results.total_found} domains</span>
          <span>Search took {results.search_time_ms}ms</span>
          <span>G's rate: {results.gs_conversion_rate} per USD</span>
        </div>
      </div>

      {/* Domain Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {results.suggestions.map((domain) => (
          <DomainCard 
            key={domain.domain} 
            domain={domain} 
            onSelect={() => onDomainSelect(domain)}
          />
        ))}
      </div>
    </div>
  )
}

// =================================================================
// DOMAIN CARD COMPONENT
// =================================================================

interface DomainCardProps {
  domain: DomainMarketplaceItem
  onSelect: () => void
}

function DomainCard({ domain, onSelect }: DomainCardProps) {
  const isAvailable = domain.availability === 'available'
  
  return (
    <Card className={`p-6 transition-all duration-200 hover:shadow-lg ${
      isAvailable 
        ? 'border-green-200 hover:border-green-300 bg-white' 
        : 'border-gray-200 bg-gray-50 opacity-75'
    }`}>
      
      {/* Domain Name & Status */}
      <div className="mb-4">
        <h3 className="text-lg font-bold text-gray-900 break-words">
          {domain.domain}
        </h3>
        <div className="flex items-center gap-2 mt-2">
          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
            isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isAvailable ? '✅ Available' : '❌ Taken'}
          </span>
          {domain.pricing.is_premium && (
            <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 font-medium">
              👑 Premium
            </span>
          )}
        </div>
      </div>

      {/* Pricing */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-2xl font-bold text-blue-600">
            {domain.pricing.gs_tokens} G's
          </span>
          <span className="text-gray-500">${domain.pricing.usd}</span>
        </div>
        {domain.pricing.first_year_promo && (
          <p className="text-xs text-orange-600 font-medium">🎉 First year promotion!</p>
        )}
      </div>

      {/* Features */}
      <div className="mb-4">
        <div className="grid grid-cols-2 gap-2 text-xs">
          {domain.features.whois_privacy && (
            <span className="text-green-600">🔒 WHOIS Privacy</span>
          )}
          {domain.features.ssl_included && (
            <span className="text-green-600">🛡️ Free SSL</span>
          )}
          {domain.features.dns_management && (
            <span className="text-green-600">⚙️ DNS Mgmt</span>
          )}
          {domain.features.email_forwarding && (
            <span className="text-green-600">📧 Email Fwd</span>
          )}
        </div>
      </div>

      {/* Metadata */}
      <div className="mb-4 text-xs text-gray-500">
        <div className="flex justify-between">
          <span>Length: {domain.metadata.length}</span>
          <span>Brand: {domain.metadata.brandability_score}/100</span>
        </div>
      </div>

      {/* Action Button */}
      <Button 
        onClick={onSelect}
        disabled={!isAvailable}
        className={`w-full ${
          isAvailable 
            ? 'bg-blue-600 hover:bg-blue-700 text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isAvailable ? '🛒 Purchase with G&apos;s' : '❌ Not Available'}
      </Button>
    </Card>
  )
}

// =================================================================
// USERNAME RESULTS COMPONENT
// =================================================================

interface UsernameResultsProps {
  results: UsernameSearchResult
  onUsernameSelect: (username: any) => void
  onSearchAlternative: (username: string) => void
}

function UsernameResults({ results, onUsernameSelect, onSearchAlternative }: UsernameResultsProps) {
  const { username, available, pricing } = results

  return (
    <div className="max-w-4xl mx-auto">
      
      {/* Results Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Username: @{username.username}
        </h2>
        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
          <span>Handle: {username.fullHandle}</span>
          <span>G&apos;s rate: 40 per USD</span>
        </div>
      </div>

      {/* Username Card */}
      <Card className={`p-8 transition-all duration-200 ${
        available 
          ? 'border-green-200 bg-green-50/30' 
          : 'border-orange-200 bg-orange-50/30'
      }`}>
        
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              @{username.username}
            </h3>
            <p className="text-gray-600 mb-2">
              {username.fullHandle}
            </p>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                available 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-orange-100 text-orange-800'
              }`}>
                {available ? '✅ Available' : '👤 In Use'}
              </span>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${
                username.tier === 'verified' ? 'bg-blue-100 text-blue-800' :
                username.tier === 'premium' ? 'bg-purple-100 text-purple-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {username.tier === 'verified' && '🔵 '}
                {username.tier === 'premium' && '👑 '}
                {username.tier.charAt(0).toUpperCase() + username.tier.slice(1)}
              </span>
            </div>
          </div>
          
          {/* Pricing */}
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {pricing.monthly_gs} G&apos;s
            </div>
            <div className="text-sm text-gray-500 mb-1">
              ${pricing.monthly_usd}/month
            </div>
            <div className="text-xs text-green-600 font-medium">
              Save ${((pricing.monthly_usd * 12) - pricing.annual_usd).toFixed(0)}/year
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Included Features</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
            {username.features.map((feature, index) => (
              <span key={index} className="text-green-600">
                ✅ {feature.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
            ))}
          </div>
        </div>

        {/* Tier Comparison */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Subscription Tiers</h4>
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className={`p-3 rounded-lg border ${username.tier === 'basic' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
              <div className="font-medium">Basic</div>
              <div className="text-gray-600">200 G&apos;s/month</div>
            </div>
            <div className={`p-3 rounded-lg border ${username.tier === 'premium' ? 'border-purple-200 bg-purple-50' : 'border-gray-200'}`}>
              <div className="font-medium">👑 Premium</div>
              <div className="text-gray-600">400 G&apos;s/month</div>
            </div>
            <div className={`p-3 rounded-lg border ${username.tier === 'verified' ? 'border-blue-200 bg-blue-50' : 'border-gray-200'}`}>
              <div className="font-medium">🔵 Verified</div>
              <div className="text-gray-600">800 G&apos;s/month</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button 
            onClick={() => onUsernameSelect({ ...username, billing: 'monthly' })}
            disabled={!available}
            className={`${
              available 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {available ? `💳 Subscribe (${pricing.monthly_gs} G's/mo)` : '❌ Not Available'}
          </Button>
          
          <Button 
            onClick={() => onUsernameSelect({ ...username, billing: 'annual' })}
            disabled={!available}
            variant="outline"
            className={`${
              available 
                ? 'border-blue-600 text-blue-600 hover:bg-blue-50' 
                : 'border-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {available ? `🎉 Annual (${pricing.annual_gs} G's)` : '❌ Not Available'}
          </Button>
        </div>

        {/* Alternatives */}
        {!available && results.alternatives && results.alternatives.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-medium text-gray-900 mb-3">Alternative Suggestions</h4>
            <div className="flex flex-wrap gap-2">
              {results.alternatives.slice(0, 6).map((alt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Update search query with alternative
                    onSearchAlternative(alt)
                  }}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                >
                  @{alt}
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  )
}