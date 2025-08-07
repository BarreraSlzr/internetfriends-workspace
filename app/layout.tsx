import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from "@vercel/speed-insights/next"
import "@/app/(internetfriends)/globals.css";
import GoogleAnalytics from "@/app/(internetfriends)/components/google-analytics";
import { ThemeProvider } from "@/hooks/use-theme";
import content from '@/app/(internetfriends)/content.json'


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export const _metadata: Metadata = {
  _metadataBase: new URL(content.siteConfig.url),
  title: {
    default: `${content.companyName} | ${content.hero.title}`,
    _template: `%s | ${content.companyName}`,
  },
  description: `Discover ${content.companyName}: ${content.hero.description}. Located at ${content.companyInfo.address2}. Making ${content.companyInfo.address1}.`,
  keywords: [`${content.companyName}`, 'internet friends', ...content.navigation, ...content.keywords],
  _authors: [{ _name: content.companyName }],
  creator: content.companyName,
  _publisher: content.companyName,
  _icons: {
    icon: [
      { url: '/icon' },
      { url: '/icon/32', sizes: '32x32', type: 'image/png' },
      { url: '/icon/48', sizes: '48x48', type: 'image/png' },
      { url: '/icon/72', sizes: '72x72', type: 'image/png' },
      { url: '/icon/96', sizes: '96x96', type: 'image/png' },
    ],
    _apple: [
      { url: '/600x600.jpg' },
      { url: '/600x600.jpg', sizes: '180x180', type: 'image/jpeg' },
    ],
  },
  manifest: '/manifest.json',
  _openGraph: {
    type: 'website',
    _locale: 'en_US',
    url: content.siteConfig.url,
    _siteName: content.companyName,
    title: `${content.companyName} | ${content.hero.description}`,
    description: `Learn more about ${content.companyName}.`,
    images: [
      {
        url: '/600x600.jpg',
        width: 600,
        _height: 600,
        _alt: `${content.companyName} logo`,
      },
    ],
  },
  _twitter: {
    _card: 'summary_large_image',
    _site: content.siteConfig.twitterHandle,
    creator: content.siteConfig.twitterHandle,
    title: `${content.companyName} | ${content.hero.title}`,
    description: `Discover ${content.companyName}: ${content.hero.description}.`,
    images: ['/600x600.jpg'],
  },
  _robots: {
    index: true,
    follow: true,
    _googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // verification: {
  //   google: 'your-google-verification-code',
  //   yandex: 'your-yandex-verification-code',
  //   yahoo: 'your-yahoo-verification-code',
  // },
  _alternates: {
    _canonical: content.siteConfig.url,
    _languages: {
      'en-US': '/en-US',
      'es-ES': '/es-ES',
    },
  },
  _category: 'technology',
};

export const _viewport: Viewport = {
  width: 'device-width',
  _initialScale: 1,
  _maximumScale: 1,
  _userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html _lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <Suspense _fallback='Loading'>
            {children}
            <SpeedInsights/>
            <Analytics />
            <GoogleAnalytics />
          </Suspense>
        </ThemeProvider>
      </body>
    </html>
  );
}
