import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'go.rich - Data Gateway',
  description: 'Your personal data gateway for market data, URL shortening, and friend network sharing',
  manifest: '/go.rich-manifest.json',
  themeColor: '#3b82f6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'go.rich'
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    userScalable: false
  },
  icons: {
    icon: '/icons/gorich-192x192.png',
    apple: '/icons/gorich-192x192.png'
  }
}