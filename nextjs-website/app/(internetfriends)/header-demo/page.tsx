"use client";

import React from "react";
import { HeaderOrganism } from "@/components/organisms/header";
import { ButtonAtomic } from "@/components/atomic/button";
import {
  Search,
  User,
  Settings,
  Bell,
  ShoppingCart,
  Heart,
  Home,
  Info,
  Mail,
  Phone,
} from "lucide-react";

const HeaderDemoPage: React.FC = () => {
  // Demo navigation items
  const navigationItems = [
    {
      id: "home",
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      id: "about",
      label: "About",
      href: "/about",
      icon: Info,
    },
    {
      id: "services",
      label: "Services",
      href: "#",
      _children: [
        {
          id: "web-dev",
          label: "Web Development",
          href: "/services/web-development",
          description: "Custom web applications",
        },
        {
          id: "design",
          label: "UI/UX Design",
          href: "/services/design",
          description: "Beautiful user interfaces",
        },
        {
          id: "consulting",
          label: "Consulting",
          href: "/services/consulting",
          description: "Technical advisory services",
        },
      ],
    },
    {
      id: "contact",
      label: "Contact",
      href: "/contact",
      icon: Mail,
    },
  ];

  // Demo header actions
  const headerActions = [
    {
      id: "search-mobile",
      label: "Search",
      icon: <Search className="w-4 h-4" />,
      variant: "ghost" as const,
      _mobileOnly: true,
      onClick: () => console.log("Mobile search clicked"),
    },
    {
      id: "notifications",
      label: "Notifications",
      icon: <Bell className="w-4 h-4" />,
      variant: "ghost" as const,
      onClick: () => console.log("Notifications clicked"),
    },
    {
      id: "favorites",
      label: "Favorites",
      icon: <Heart className="w-4 h-4" />,
      variant: "ghost" as const,
      _desktopOnly: true,
      onClick: () => console.log("Favorites clicked"),
    },
    {
      id: "cart",
      label: "Cart",
      icon: <ShoppingCart className="w-4 h-4" />,
      variant: "outline" as const,
      onClick: () => console.log("Cart clicked"),
    },
    {
      id: "login",
      label: "Sign In",
      icon: <User className="w-4 h-4" />,
      variant: "primary" as const,
      href: "/login",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header Organism Demo */}
      <HeaderOrganism
        logo={{
          text: "InternetFriends",
          href: "/",
          width: 32,
          height: 32,
        }}
        navigation={{
          items: navigationItems,
          activeItem: "home",
        }}
        actions={headerActions}
        themeToggle={{
          show: true,
          showLabels: true,
          position: "right",
        }}
        languageSelector={{
          show: true,
          showFlags: true,
          showNames: false,
          position: "right",
        }}
        search={{
          show: true,
          placeholder: "Search documentation...",
          shortcut: "⌘K",
          onSearch: (query) => console.log("Search:", query),
        }}
        announcement={{
          show: true,
          content: (
            <span>
              🎉 New feature alert! Check out our latest{" "}
              <a href="#" className="underline font-medium">
                design system components
              </a>
            </span>
          ),
          variant: "info",
          dismissible: true,
        }}
        sticky={{
          enabled: true,
          hideOnScroll: false,
          transitionDuration: "300ms",
        }}
        responsive={{
          mobileBreakpoint: "lg",
          showMobileToggle: true,
          mobileMenuPosition: "right",
        }}
        variant="glass"
        size="md"
        className="border-b"
        data-testid="demo-header"
      />

      {/* Main content */}
      <main id="main-content" className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              HeaderOrganism Demo
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Comprehensive site header with theme toggle, i18n support, and
              responsive navigation
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <ButtonAtomic variant="primary" size="lg">
                Get Started
              </ButtonAtomic>
              <ButtonAtomic variant="outline" size="lg">
                Learn More
              </ButtonAtomic>
            </div>
          </div>

          {/* Feature showcase */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                <Settings className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Theme Toggle</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Built-in light/dark/system theme switching with smooth
                transitions
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Search</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Integrated search functionality with keyboard shortcuts
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Responsive Design</h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Adaptive layout that works perfectly on all screen sizes
              </p>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm">
            <h2 className="text-2xl font-bold mb-6">
              Interactive Demo Features
            </h2>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  1
                </span>
                <div>
                  <strong>Theme Toggle:</strong> Click the theme button in the
                  header to switch between light, dark, and system modes
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  2
                </span>
                <div>
                  <strong>Language _Selector:</strong> Try switching between
                  available languages using the globe icon
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  3
                </span>
                <div>
                  <strong>Mobile _Navigation:</strong> Resize the window or use
                  mobile device to see the responsive menu
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  4
                </span>
                <div>
                  <strong>Sticky Header:</strong> Scroll down to see the header
                  become sticky with glass morphism effect
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-6 h-6 bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  5
                </span>
                <div>
                  <strong>Announcement _Bar:</strong> Notice the dismissible
                  announcement at the top of the header
                </div>
              </div>
            </div>
          </div>

          {/* Spacer content for scroll demo */}
          <div className="mt-32 space-y-8">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm"
              >
                <h3 className="text-lg font-semibold mb-2">
                  Demo Content Section {i + 1}
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  This is placeholder content to demonstrate the sticky header
                  behavior. As you scroll, notice how the header transforms and
                  maintains its position at the top of the viewport with a
                  beautiful glass morphism effect.
                </p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default HeaderDemoPage;
