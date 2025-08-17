// Mock data for domain marketplace when Porkbun API is unavailable
// Perfect for testing and development

export interface MockDomainData {
  domain: string;
  available: boolean;
  price: number;
  currency: string;
  brandabilityScore: number;
  seoScore: number;
  shortUrlOptimal: boolean;
  category: 'premium' | 'standard' | 'budget';
  registrar: string;
  expiry?: string;
  features: string[];
}

// Your actual owned domains
export const ownedDomains: MockDomainData[] = [
  {
    domain: 'go.rich',
    available: false, // You own this
    price: 0, // Already owned
    currency: 'USD',
    brandabilityScore: 92,
    seoScore: 88,
    shortUrlOptimal: true,
    category: 'premium',
    registrar: 'porkbun',
    expiry: '2026-08-16',
    features: ['owned', 'premium', 'brandable', '2-letter', 'wealth-focused']
  },
  {
    domain: 'internetfriends.xyz',
    available: false, // You own this
    price: 0, // Already owned
    currency: 'USD',
    brandabilityScore: 85,
    seoScore: 82,
    shortUrlOptimal: false,
    category: 'standard',
    registrar: 'porkbun',
    expiry: '2026-08-16',
    features: ['owned', 'brandable', 'community', 'tech-tld', 'descriptive']
  }
];

export const mockDomainResults: MockDomainData[] = [
  // Your owned domains first
  ...ownedDomains,
  
  // Premium short URL domains available for purchase
  {
    domain: 'go.to',
    available: true,
    price: 2500,
    currency: 'USD',
    brandabilityScore: 95,
    seoScore: 90,
    shortUrlOptimal: true,
    category: 'premium',
    registrar: 'porkbun',
    features: ['2-letter', 'brandable', 'memorable', 'global-tld']
  },
  {
    domain: 'lnk.app',
    available: true,
    price: 1200,
    currency: 'USD',
    brandabilityScore: 88,
    seoScore: 85,
    shortUrlOptimal: true,
    category: 'premium',
    registrar: 'porkbun',
    features: ['modern-tld', 'tech-focused', 'app-ready']
  },
  {
    domain: 'link.pro',
    available: true,
    price: 850,
    currency: 'USD',
    brandabilityScore: 82,
    seoScore: 80,
    shortUrlOptimal: true,
    category: 'premium',
    registrar: 'porkbun',
    features: ['professional', 'descriptive', 'industry-standard']
  },
  {
    domain: 'rd.it',
    available: false,
    price: 0,
    currency: 'USD',
    brandabilityScore: 75,
    seoScore: 70,
    shortUrlOptimal: true,
    category: 'premium',
    registrar: 'porkbun',
    expiry: '2025-12-15',
    features: ['2-letter', 'tech-tld', 'redirect-optimized']
  },
  {
    domain: 'short.ly',
    available: true,
    price: 450,
    currency: 'USD',
    brandabilityScore: 90,
    seoScore: 88,
    shortUrlOptimal: true,
    category: 'standard',
    registrar: 'porkbun',
    features: ['descriptive', 'memorable', 'url-shortener']
  },
  
  // Standard domains
  {
    domain: 'quicklink.io',
    available: true,
    price: 320,
    currency: 'USD',
    brandabilityScore: 75,
    seoScore: 78,
    shortUrlOptimal: true,
    category: 'standard',
    registrar: 'porkbun',
    features: ['tech-tld', 'descriptive', 'startup-friendly']
  },
  {
    domain: 'fastred.com',
    available: true,
    price: 280,
    currency: 'USD',
    brandabilityScore: 70,
    seoScore: 75,
    shortUrlOptimal: true,
    category: 'standard',
    registrar: 'porkbun',
    features: ['dot-com', 'brandable', 'speed-focused']
  },
  {
    domain: 'urlhub.net',
    available: true,
    price: 180,
    currency: 'USD',
    brandabilityScore: 68,
    seoScore: 72,
    shortUrlOptimal: true,
    category: 'standard',
    registrar: 'porkbun',
    features: ['descriptive', 'hub-concept', 'network-tld']
  },
  
  // Budget options
  {
    domain: 'mylinks.site',
    available: true,
    price: 45,
    currency: 'USD',
    brandabilityScore: 60,
    seoScore: 65,
    shortUrlOptimal: false,
    category: 'budget',
    registrar: 'porkbun',
    features: ['personal-use', 'affordable', 'modern-tld']
  },
  {
    domain: 'redirector.xyz',
    available: true,
    price: 35,
    currency: 'USD',
    brandabilityScore: 55,
    seoScore: 60,
    shortUrlOptimal: false,
    category: 'budget',
    registrar: 'porkbun',
    features: ['descriptive', 'tech-tld', 'functional']
  }
];

export const mockAnalyticsData = {
  totalClicks: 15847,
  uniqueVisitors: 12334,
  topCountries: [
    { country: 'United States', clicks: 4521, percentage: 28.5 },
    { country: 'United Kingdom', clicks: 2103, percentage: 13.3 },
    { country: 'Germany', clicks: 1876, percentage: 11.8 },
    { country: 'Canada', clicks: 1542, percentage: 9.7 },
    { country: 'Australia', clicks: 1234, percentage: 7.8 }
  ],
  deviceTypes: [
    { type: 'Mobile', clicks: 8934, percentage: 56.4 },
    { type: 'Desktop', clicks: 5421, percentage: 34.2 },
    { type: 'Tablet', clicks: 1492, percentage: 9.4 }
  ],
  clicksByHour: Array.from({ length: 24 }, (_, i) => ({
    hour: i,
    clicks: Math.floor(Math.random() * 500) + 100
  }))
};

export const mockPurchaseFlow = {
  steps: [
    { id: 1, name: 'Domain Selection', status: 'completed' },
    { id: 2, name: 'Pricing Confirmation', status: 'completed' },
    { id: 3, name: 'G\'s Token Escrow', status: 'current' },
    { id: 4, name: 'Domain Registration', status: 'pending' },
    { id: 5, name: 'DNS Setup', status: 'pending' },
    { id: 6, name: 'Analytics Integration', status: 'pending' }
  ],
  escrowDetails: {
    amount: 1200,
    currency: 'USD',
    gsTokens: 480, // 1 G's token = $2.50
    escrowId: 'ESC-2025-0816-001',
    releaseCondition: 'domain_transfer_complete'
  }
};

export function getMockDomainByName(domain: string): MockDomainData | undefined {
  return mockDomainResults.find(d => d.domain === domain);
}

export function searchMockDomains(query: string): MockDomainData[] {
  const lowerQuery = query.toLowerCase();
  return mockDomainResults.filter(domain => 
    domain.domain.toLowerCase().includes(lowerQuery) ||
    domain.features.some(feature => feature.toLowerCase().includes(lowerQuery))
  );
}

export function getMockDomainsByCategory(category: 'premium' | 'standard' | 'budget'): MockDomainData[] {
  return mockDomainResults.filter(domain => domain.category === category);
}

export function getOwnedDomains(): MockDomainData[] {
  return ownedDomains;
}

export function isOwnedDomain(domain: string): boolean {
  return ownedDomains.some(d => d.domain === domain);
}

export function getAvailableForPurchaseDomains(): MockDomainData[] {
  return mockDomainResults.filter(domain => domain.available);
}

export function simulatePurchase(domain: string): Promise<{ success: boolean; escrowId?: string; error?: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      const domainData = getMockDomainByName(domain);
      if (!domainData) {
        resolve({ success: false, error: 'Domain not found' });
        return;
      }
      if (!domainData.available) {
        resolve({ success: false, error: 'Domain not available' });
        return;
      }
      resolve({ 
        success: true, 
        escrowId: `ESC-${Date.now()}-${Math.random().toString(36).substr(2, 6)}` 
      });
    }, 2000); // Simulate API delay
  });
}