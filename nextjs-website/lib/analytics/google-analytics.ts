// Google Analytics 4 integration for link redirection tracking
// Perfect for domain marketplace + URL shortening services

export interface AnalyticsEvent {
  event_name: string;
  parameters: {
    [key: string]: string | number | boolean;
  };
}

export interface LinkClickEvent extends AnalyticsEvent {
  event_name: 'link_click';
  parameters: {
    link_id: string;
    destination_url: string;
    source_domain: string;
    user_agent?: string;
    referrer?: string;
    country?: string;
    device_type?: 'mobile' | 'desktop' | 'tablet';
    campaign_id?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
  };
}

export interface DomainPurchaseEvent extends AnalyticsEvent {
  event_name: 'domain_purchase';
  parameters: {
    domain: string;
    price_usd: number;
    gs_tokens_used: number;
    category: 'premium' | 'standard' | 'budget';
    user_id: string;
    purchase_method: 'gs_tokens';
  };
}

class GoogleAnalytics {
  private measurementId: string;
  private apiSecret: string;
  private enabled: boolean;

  constructor() {
    this.measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';
    this.apiSecret = process.env.GA_API_SECRET || '';
    this.enabled = !!(this.measurementId && this.apiSecret);
    
    if (!this.enabled) {
      console.warn('Google Analytics not configured - using mock tracking');
    }
  }

  async trackEvent(event: AnalyticsEvent, clientId?: string): Promise<boolean> {
    if (!this.enabled) {
      // Mock tracking for development
      console.log('📊 Mock GA Event:', event);
      return true;
    }

    try {
      const response = await fetch(
        `https://www.google-analytics.com/mp/collect?measurement_id=${this.measurementId}&api_secret=${this.apiSecret}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            client_id: clientId || this.generateClientId(),
            events: [event],
          }),
        }
      );

      return response.ok;
    } catch (error) {
      console.error('GA tracking error:', error);
      return false;
    }
  }

  async trackLinkClick(
    linkId: string,
    destinationUrl: string,
    sourceDomain: string,
    metadata: Partial<LinkClickEvent['parameters']> = {}
  ): Promise<boolean> {
    const event: LinkClickEvent = {
      event_name: 'link_click',
      parameters: {
        link_id: linkId,
        destination_url: destinationUrl,
        source_domain: sourceDomain,
        timestamp: Date.now(),
        ...metadata,
      },
    };

    return this.trackEvent(event);
  }

  async trackDomainPurchase(
    domain: string,
    priceUsd: number,
    gsTokensUsed: number,
    category: 'premium' | 'standard' | 'budget',
    userId: string
  ): Promise<boolean> {
    const event: DomainPurchaseEvent = {
      event_name: 'domain_purchase',
      parameters: {
        domain,
        price_usd: priceUsd,
        gs_tokens_used: gsTokensUsed,
        category,
        user_id: userId,
        purchase_method: 'gs_tokens',
        timestamp: Date.now(),
      },
    };

    return this.trackEvent(event);
  }

  async trackPageView(url: string, title?: string, clientId?: string): Promise<boolean> {
    const event: AnalyticsEvent = {
      event_name: 'page_view',
      parameters: {
        page_location: url,
        page_title: title || document?.title || 'Unknown',
        timestamp: Date.now(),
      },
    };

    return this.trackEvent(event, clientId);
  }

  async trackDomainSearch(query: string, resultsCount: number): Promise<boolean> {
    const event: AnalyticsEvent = {
      event_name: 'domain_search',
      parameters: {
        search_term: query,
        results_count: resultsCount,
        timestamp: Date.now(),
      },
    };

    return this.trackEvent(event);
  }

  private generateClientId(): string {
    return `${Date.now()}.${Math.random().toString(36).substr(2, 9)}`;
  }

  // Real-time analytics for dashboard
  async getRealtimeMetrics(): Promise<{
    activeUsers: number;
    pageViews: number;
    linkClicks: number;
    topPages: Array<{ page: string; views: number }>;
  }> {
    if (!this.enabled) {
      // Return mock data for development
      return {
        activeUsers: Math.floor(Math.random() * 50) + 10,
        pageViews: Math.floor(Math.random() * 200) + 50,
        linkClicks: Math.floor(Math.random() * 100) + 20,
        topPages: [
          { page: '/domain', views: 45 },
          { page: '/go/example', views: 32 },
          { page: '/lnk/social', views: 28 },
        ],
      };
    }

    // In production, this would use GA4 Reporting API
    // For now, returning mock data
    return {
      activeUsers: 0,
      pageViews: 0,
      linkClicks: 0,
      topPages: [],
    };
  }
}

// Singleton instance
export const analytics = new GoogleAnalytics();

// Utility functions for common tracking scenarios
export const trackDomainMarketplaceActivity = {
  search: (query: string, resultsCount: number) => 
    analytics.trackDomainSearch(query, resultsCount),
    
  purchase: (domain: string, priceUsd: number, gsTokens: number, category: 'premium' | 'standard' | 'budget', userId: string) =>
    analytics.trackDomainPurchase(domain, priceUsd, gsTokens, category, userId),
    
  linkClick: (linkId: string, destination: string, source: string, metadata?: any) =>
    analytics.trackLinkClick(linkId, destination, source, metadata),
};

// Client-side GA4 initialization (for Next.js pages)
export const initializeGA = () => {
  if (typeof window === 'undefined') return;
  
  const measurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
  if (!measurementId) {
    console.warn('GA4 Measurement ID not found');
    return;
  }

  // Load gtag script
  const script = document.createElement('script');
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
  script.async = true;
  document.head.appendChild(script);

  // Initialize gtag
  window.dataLayer = window.dataLayer || [];
  function gtag(...args: any[]) {
    window.dataLayer.push(args);
  }
  
  gtag('js', new Date());
  gtag('config', measurementId, {
    page_title: document.title,
    page_location: window.location.href,
  });

  // Make gtag globally available
  (window as any).gtag = gtag;
};

// Custom hook for React components
export const useAnalytics = () => {
  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackLinkClick: analytics.trackLinkClick.bind(analytics),
    trackDomainSearch: analytics.trackDomainSearch.bind(analytics),
    trackDomainPurchase: analytics.trackDomainPurchase.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    getRealtimeMetrics: analytics.getRealtimeMetrics.bind(analytics),
  };
};