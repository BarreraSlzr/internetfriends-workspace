import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "@/app/(internetfriends)/globals.css";
import { ThemeProvider } from "@/hooks/use-theme";
import { AccentInitializer } from "@/components/theme/accent-initializer";
import { I18nProvider } from "@/i18n/provider";
import { InternetFriendsPermissionsProvider } from "@/lib/permissions/provider";
import { GlassProvider } from "@/lib/background-canvas/react/GlassProvider";

// Import default translations to avoid loading states during SSR
import defaultTranslations from "@/i18n/locales/en/common.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "InternetFriends",
  description: "InternetFriends Portfolio",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3b82f6" },
    { media: "(prefers-color-scheme: dark)", color: "#1d4ed8" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeProvider>
          <I18nProvider
            defaultLocale="en"
            initialTranslations={defaultTranslations}
          >
            <InternetFriendsPermissionsProvider>
              <GlassProvider preferredMode="auto">
                <AccentInitializer />
                {children}
              </GlassProvider>
            </InternetFriendsPermissionsProvider>
          </I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
