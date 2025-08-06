import content from '@/app/(internetfriends)/content.json';

import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = content.siteConfig.url
  
  // Main routes
  const routes = [
    '',
    '/contact',
    '/pricing',
    '/samples',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  // Blog posts
  const blogPosts = [
    // '/blog/content-marketing-strategy',
    // '/blog/enterprise-solutions',
    // '/blog/team-building',
  ].map((post) => ({
    url: `${baseUrl}${post}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }))

  return [...routes, ...blogPosts]
}

