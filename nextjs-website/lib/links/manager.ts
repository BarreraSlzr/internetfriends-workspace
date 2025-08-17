// Link management system for go.rich domain
// Real link storage and redirection service

export interface ShortLink {
  id: string;
  shortCode: string;
  destination: string;
  domain: string; // go.rich or internetfriends.xyz
  title?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  isActive: boolean;
  clickCount: number;
  lastClickAt?: string;
  createdBy: string;
  tags: string[];
  customMetadata?: Record<string, any>;
}

export interface LinkAnalytics {
  linkId: string;
  totalClicks: number;
  uniqueClicks: number;
  clicksByDay: Array<{ date: string; clicks: number }>;
  topCountries: Array<{ country: string; clicks: number; percentage: number }>;
  topReferrers: Array<{ referrer: string; clicks: number; percentage: number }>;
  deviceTypes: Array<{ device: 'mobile' | 'desktop' | 'tablet'; clicks: number; percentage: number }>;
  lastUpdated: string;
}

// In-memory storage for development (replace with database in production)
const linkStorage = new Map<string, ShortLink>();
const analyticsStorage = new Map<string, LinkAnalytics>();

// Initialize with some demo links for go.rich
const initializeDemoLinks = () => {
  const demoLinks: ShortLink[] = [
    {
      id: 'demo-1',
      shortCode: 'ig',
      destination: 'https://instagram.com/internetfriends',
      domain: 'go.rich',
      title: 'InternetFriends Instagram',
      description: 'Follow us on Instagram',
      createdAt: '2025-08-16T00:00:00Z',
      updatedAt: '2025-08-16T00:00:00Z',
      isActive: true,
      clickCount: 47,
      lastClickAt: '2025-08-16T20:30:00Z',
      createdBy: 'admin',
      tags: ['social', 'instagram'],
    },
    {
      id: 'demo-2',
      shortCode: 'github',
      destination: 'https://github.com/internetfriends',
      domain: 'go.rich',
      title: 'GitHub Repository',
      description: 'Our open source projects',
      createdAt: '2025-08-16T00:00:00Z',
      updatedAt: '2025-08-16T00:00:00Z',
      isActive: true,
      clickCount: 23,
      lastClickAt: '2025-08-16T18:45:00Z',
      createdBy: 'admin',
      tags: ['development', 'github'],
    },
    {
      id: 'demo-3',
      shortCode: 'domain',
      destination: 'http://localhost:3000/domain',
      domain: 'go.rich',
      title: 'Domain Marketplace',
      description: 'Buy domains with G\'s tokens',
      createdAt: '2025-08-16T00:00:00Z',
      updatedAt: '2025-08-16T00:00:00Z',
      isActive: true,
      clickCount: 89,
      lastClickAt: '2025-08-16T22:15:00Z',
      createdBy: 'admin',
      tags: ['marketplace', 'domains'],
    },
  ];

  demoLinks.forEach(link => {
    linkStorage.set(link.shortCode, link);
    
    // Generate mock analytics
    analyticsStorage.set(link.id, {
      linkId: link.id,
      totalClicks: link.clickCount,
      uniqueClicks: Math.floor(link.clickCount * 0.8),
      clicksByDay: Array.from({ length: 7 }, (_, i) => ({
        date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        clicks: Math.floor(Math.random() * 20) + 5,
      })),
      topCountries: [
        { country: 'US', clicks: Math.floor(link.clickCount * 0.4), percentage: 40 },
        { country: 'UK', clicks: Math.floor(link.clickCount * 0.25), percentage: 25 },
        { country: 'CA', clicks: Math.floor(link.clickCount * 0.2), percentage: 20 },
        { country: 'DE', clicks: Math.floor(link.clickCount * 0.15), percentage: 15 },
      ],
      topReferrers: [
        { referrer: 'direct', clicks: Math.floor(link.clickCount * 0.6), percentage: 60 },
        { referrer: 'twitter.com', clicks: Math.floor(link.clickCount * 0.25), percentage: 25 },
        { referrer: 'google.com', clicks: Math.floor(link.clickCount * 0.15), percentage: 15 },
      ],
      deviceTypes: [
        { device: 'mobile', clicks: Math.floor(link.clickCount * 0.65), percentage: 65 },
        { device: 'desktop', clicks: Math.floor(link.clickCount * 0.25), percentage: 25 },
        { device: 'tablet', clicks: Math.floor(link.clickCount * 0.1), percentage: 10 },
      ],
      lastUpdated: new Date().toISOString(),
    });
  });
};

// Initialize demo data
initializeDemoLinks();

export class LinkManager {
  static createLink(data: Omit<ShortLink, 'id' | 'createdAt' | 'updatedAt' | 'clickCount' | 'isActive'>): ShortLink {
    const link: ShortLink = {
      ...data,
      id: `link_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      clickCount: 0,
      isActive: true,
    };

    linkStorage.set(link.shortCode, link);
    
    // Initialize analytics
    analyticsStorage.set(link.id, {
      linkId: link.id,
      totalClicks: 0,
      uniqueClicks: 0,
      clicksByDay: [],
      topCountries: [],
      topReferrers: [],
      deviceTypes: [],
      lastUpdated: new Date().toISOString(),
    });

    return link;
  }

  static getLink(shortCode: string): ShortLink | null {
    return linkStorage.get(shortCode) || null;
  }

  static getAllLinks(domain?: string): ShortLink[] {
    const links = Array.from(linkStorage.values());
    return domain ? links.filter(link => link.domain === domain) : links;
  }

  static updateLink(shortCode: string, updates: Partial<ShortLink>): ShortLink | null {
    const link = linkStorage.get(shortCode);
    if (!link) return null;

    const updatedLink = {
      ...link,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    linkStorage.set(shortCode, updatedLink);
    return updatedLink;
  }

  static deleteLink(shortCode: string): boolean {
    const link = linkStorage.get(shortCode);
    if (!link) return false;

    linkStorage.delete(shortCode);
    analyticsStorage.delete(link.id);
    return true;
  }

  static recordClick(shortCode: string, metadata?: Record<string, any>): boolean {
    const link = linkStorage.get(shortCode);
    if (!link || !link.isActive) return false;

    // Update click count
    link.clickCount += 1;
    link.lastClickAt = new Date().toISOString();
    link.updatedAt = new Date().toISOString();
    linkStorage.set(shortCode, link);

    // Update analytics
    const analytics = analyticsStorage.get(link.id);
    if (analytics) {
      analytics.totalClicks += 1;
      analytics.lastUpdated = new Date().toISOString();
      
      // Update daily clicks
      const today = new Date().toISOString().split('T')[0];
      const todayData = analytics.clicksByDay.find(d => d.date === today);
      if (todayData) {
        todayData.clicks += 1;
      } else {
        analytics.clicksByDay.push({ date: today, clicks: 1 });
      }

      analyticsStorage.set(link.id, analytics);
    }

    return true;
  }

  static getAnalytics(linkId: string): LinkAnalytics | null {
    return analyticsStorage.get(linkId) || null;
  }

  static searchLinks(query: string, domain?: string): ShortLink[] {
    const links = this.getAllLinks(domain);
    const lowerQuery = query.toLowerCase();
    
    return links.filter(link => 
      link.shortCode.toLowerCase().includes(lowerQuery) ||
      link.destination.toLowerCase().includes(lowerQuery) ||
      (link.title && link.title.toLowerCase().includes(lowerQuery)) ||
      (link.description && link.description.toLowerCase().includes(lowerQuery)) ||
      link.tags.some(tag => tag.toLowerCase().includes(lowerQuery))
    );
  }

  static getDashboardStats(domain?: string): {
    totalLinks: number;
    totalClicks: number;
    activeLinks: number;
    topLinks: Array<{ shortCode: string; clicks: number; destination: string }>;
  } {
    const links = this.getAllLinks(domain);
    const activeLinks = links.filter(link => link.isActive);
    const totalClicks = links.reduce((sum, link) => sum + link.clickCount, 0);
    
    const topLinks = links
      .sort((a, b) => b.clickCount - a.clickCount)
      .slice(0, 5)
      .map(link => ({
        shortCode: link.shortCode,
        clicks: link.clickCount,
        destination: link.destination,
      }));

    return {
      totalLinks: links.length,
      totalClicks,
      activeLinks: activeLinks.length,
      topLinks,
    };
  }
}

// Utility functions
export const generateShortCode = (length: number = 6): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

export const isShortCodeAvailable = (shortCode: string): boolean => {
  return !linkStorage.has(shortCode);
};