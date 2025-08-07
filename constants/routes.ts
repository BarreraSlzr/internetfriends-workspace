// InternetFriends Route Constants
// Centralized route definitions for navigation and linking

// Main application routes
export const ROUTES = {
  // Public routes
  home: '/',
  about: '/about',
  contact: '/contact',
  pricing: '/pricing',

  // Portfolio/work routes
  portfolio: '/portfolio',
  projects: '/projects',
  samples: '/samples',
  curriculum: '/curriculum',

  // Blog/content routes
  blog: '/blog',
  articles: '/articles',
  tutorials: '/tutorials',

  // Authentication routes (if needed)
  login: '/login',
  register: '/register',
  profile: '/profile',

  // Legal/info routes
  privacy: '/privacy',
  terms: '/terms',
  cookies: '/cookies',

  // API routes
  api: {
    contact: '/api/contact',
    newsletter: '/api/newsletter',
    analytics: '/api/analytics',
    health: '/api/health',
  },

  // External routes
  external: {
    github: 'https://github.com/internetfriends',
    twitter: 'https://twitter.com/internetfriends',
    linkedin: 'https://linkedin.com/company/internetfriends',
    discord: 'https://discord.gg/internetfriends',
  },
} as const;

// Route metadata for navigation and SEO
export const ROUTE_METADATA = {
  [ROUTES.home]: {
    title: 'InternetFriends - Building Digital Connections',
    description: 'Expert web development and digital solutions for modern businesses.',
    keywords: ['web development', 'digital solutions', 'nextjs', 'react'],
    canonical: ROUTES.home,
  },
  [ROUTES.about]: {
    title: 'About - InternetFriends',
    description: 'Learn about our mission to build meaningful digital connections.',
    keywords: ['about', 'team', 'mission', 'values'],
    canonical: ROUTES.about,
  },
  [ROUTES.contact]: {
    title: 'Contact - InternetFriends',
    description: 'Get in touch with our team for your next project.',
    keywords: ['contact', 'hire', 'consultation', 'project'],
    canonical: ROUTES.contact,
  },
  [ROUTES.pricing]: {
    title: 'Pricing - InternetFriends',
    description: 'Transparent pricing for web development and digital services.',
    keywords: ['pricing', 'cost', 'rates', 'packages'],
    canonical: ROUTES.pricing,
  },
  [ROUTES.portfolio]: {
    title: 'Portfolio - InternetFriends',
    description: 'Explore our latest projects and case studies.',
    keywords: ['portfolio', 'projects', 'work', 'case studies'],
    canonical: ROUTES.portfolio,
  },
  [ROUTES.samples]: {
    title: 'Code Samples - InternetFriends',
    description: 'Browse our open-source contributions and code examples.',
    keywords: ['code samples', 'open source', 'github', 'examples'],
    canonical: ROUTES.samples,
  },
} as const;

// Navigation structure for menus
export const NAVIGATION = {
  // Main navigation menu
  main: [
    {
      label: 'Home',
      href: ROUTES.home,
      icon: 'home',
    },
    {
      label: 'About',
      href: ROUTES.about,
      icon: 'user',
    },
    {
      label: 'Portfolio',
      href: ROUTES.portfolio,
      icon: 'briefcase',
      children: [
        {
          label: 'Projects',
          href: ROUTES.projects,
          icon: 'folder',
        },
        {
          label: 'Samples',
          href: ROUTES.samples,
          icon: 'code',
        },
        {
          label: 'Curriculum',
          href: ROUTES.curriculum,
          icon: 'book',
        },
      ],
    },
    {
      label: 'Pricing',
      href: ROUTES.pricing,
      icon: 'dollar-sign',
    },
    {
      label: 'Contact',
      href: ROUTES.contact,
      icon: 'mail',
    },
  ],

  // Footer navigation
  footer: [
    {
      title: 'Company',
      links: [
        { label: 'About', href: ROUTES.about },
        { label: 'Contact', href: ROUTES.contact },
        { label: 'Pricing', href: ROUTES.pricing },
      ],
    },
    {
      title: 'Work',
      links: [
        { label: 'Portfolio', href: ROUTES.portfolio },
        { label: 'Projects', href: ROUTES.projects },
        { label: 'Samples', href: ROUTES.samples },
      ],
    },
    {
      title: 'Legal',
      links: [
        { label: 'Privacy', href: ROUTES.privacy },
        { label: 'Terms', href: ROUTES.terms },
        { label: 'Cookies', href: ROUTES.cookies },
      ],
    },
    {
      title: 'Connect',
      links: [
        { label: 'GitHub', href: ROUTES.external.github, external: true },
        { label: 'Twitter', href: ROUTES.external.twitter, external: true },
        { label: 'LinkedIn', href: ROUTES.external.linkedin, external: true },
      ],
    },
  ],

  // Breadcrumb navigation patterns
  breadcrumbs: {
    [ROUTES.portfolio]: [
      { label: 'Home', href: ROUTES.home },
      { label: 'Portfolio', href: ROUTES.portfolio },
    ],
    [ROUTES.projects]: [
      { label: 'Home', href: ROUTES.home },
      { label: 'Portfolio', href: ROUTES.portfolio },
      { label: 'Projects', href: ROUTES.projects },
    ],
    [ROUTES.contact]: [
      { label: 'Home', href: ROUTES.home },
      { label: 'Contact', href: ROUTES.contact },
    ],
  },
} as const;

// Route patterns for dynamic routes
export const _ROUTE_PATTERNS = {
  // Blog post: /blog/[slug]
  blogPost: (slug: string) => `/blog/${slug}`,

  // Project detail: /projects/[id]
  projectDetail: (id: string) => `/projects/${id}`,

  // User profile: /users/[username]
  userProfile: (username: string) => `/users/${username}`,

  // Category pages: /category/[category]
  category: (category: string) => `/category/${category}`,

  // Search results: /search?q=query
  search: (query: string) => `/search?q=${encodeURIComponent(query)}`,
} as const;

// Route validation helpers
export const ROUTE_VALIDATORS = {
  // Check if route is external
  isExternal: (href: string): boolean => {
    return href.startsWith('http') || href.startsWith('mailto:') || href.startsWith('tel:');
  },

  // Check if route is internal
  isInternal: (href: string): boolean => {
    return href.startsWith('/') && !ROUTE_VALIDATORS.isExternal(href);
  },

  // Check if route is current (for active states)
  isCurrent: (href: string, pathname: string): boolean => {
    if (href === ROUTES.home) {
      return pathname === ROUTES.home;
    }
    return pathname.startsWith(href);
  },

  // Get route section for highlighting parent nav items
  getSection: (pathname: string): string => {
    if (pathname.startsWith('/portfolio') || pathname.startsWith('/projects') || pathname.startsWith('/samples')) {
      return 'portfolio';
    }
    if (pathname.startsWith('/blog') || pathname.startsWith('/articles')) {
      return 'blog';
    }
    return pathname.split('/')[1] || 'home';
  },
} as const;

// Route permissions (for future auth implementation)
export const _ROUTE_PERMISSIONS = {
  public: [
    ROUTES.home,
    ROUTES.about,
    ROUTES.contact,
    ROUTES.pricing,
    ROUTES.portfolio,
    ROUTES.projects,
    ROUTES.samples,
    ROUTES.privacy,
    ROUTES.terms,
  ],

  protected: [
    ROUTES.profile,
  ],

  admin: [
    '/admin',
    '/admin/dashboard',
    '/admin/users',
  ],
} as const;

// Sitemap generation helpers
export const _SITEMAP_CONFIG = {
  // Static routes for sitemap
  staticRoutes: [
    {
      url: ROUTES.home,
      priority: 1.0,
      changeFreq: 'weekly' as const,
    },
    {
      url: ROUTES.about,
      priority: 0.8,
      changeFreq: 'monthly' as const,
    },
    {
      url: ROUTES.contact,
      priority: 0.9,
      changeFreq: 'monthly' as const,
    },
    {
      url: ROUTES.pricing,
      priority: 0.7,
      changeFreq: 'monthly' as const,
    },
    {
      url: ROUTES.portfolio,
      priority: 0.9,
      changeFreq: 'weekly' as const,
    },
  ],

  // Dynamic route generators
  dynamicRoutes: {
    blogPosts: async () => {
      // This would fetch blog posts from CMS/database
      // Return array of { url, priority, changeFreq, lastMod }
      return [];
    },
    projects: async () => {
      // This would fetch projects from database
      return [];
    },
  },
} as const;

// Type definitions
export type Route = typeof ROUTES[keyof typeof ROUTES];
export type ExternalRoute = typeof ROUTES.external[keyof typeof ROUTES.external];
export type NavigationItem = typeof NAVIGATION.main[number];
export type RouteMetadata = typeof ROUTE_METADATA[keyof typeof ROUTE_METADATA];
export type RouteSection = 'home' | 'about' | 'portfolio' | 'blog' | 'contact' | 'pricing';

// Utility functions
export const _getRouteMetadata = (pathname: string): RouteMetadata | null => {
  return ROUTE_METADATA[pathname as keyof typeof ROUTE_METADATA] || null;
};

export const _buildUrl = (base: string, params?: Record<string, string>): string => {
  if (!params) return base;

  const url = new URL(base, 'https://example.com');
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  return url.pathname + url.search;
};

export const _parseRoute = (pathname: string) => {
  const segments = pathname.split('/').filter(Boolean);
  const section = segments[0] || 'home';
  const subsection = segments[1];
  const id = segments[2];

  return { section, subsection, id, segments };
};
