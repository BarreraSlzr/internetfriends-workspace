import content from '@/app/(internetfriends)/content.json';
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/private/',
        '/api/',
        '/admin/',
        '/*.php$',
        '/wp-admin/',
      ],
    },
    sitemap: `${content.siteConfig.url}/sitemap.xml`,
    host: content.siteConfig.url,
  }
}

