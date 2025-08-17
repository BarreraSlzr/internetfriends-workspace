// Bundle Optimization Configuration
// Code splitting and performance optimization for InternetFriends

import type { NextConfig } from "next";

const bundleOptimizations: Partial<NextConfig> = {
  // Enable experimental features for better performance
  experimental: {
    // Enable React Concurrent Features
    ppr: true,
    // Optimize CSS loading
    optimizeCss: true,
    // Enable server components optimization
    serverComponentsExternalPackages: ["@xyflow/react"],
  },
  
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Production optimizations
    if (!dev && !isServer) {
      // Split vendor chunks more aggressively
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          ...config.optimization?.splitChunks,
          cacheGroups: {
            default: false,
            vendors: false,
            // Framework chunk (React, Next.js)
            framework: {
              chunks: "all",
              name: "framework",
              test: /(?<!node_modules.*)[\\/]node_modules[\\/](react|react-dom|scheduler|prop-types|use-subscription)[\\/]/,
              priority: 40,
              enforce: true,
            },
            // Large libraries
            lib: {
              test: /[\\/]node_modules[\\/]/,
              name(module: any) {
                const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)?.[1];
                return `lib.${packageName?.replace("@", "")}`;
              },
              chunks: "all",
              priority: 30,
              minSize: 100000,
            },
            // Common shared code
            commons: {
              name: "commons",
              chunks: "all",
              priority: 20,
              minChunks: 2,
              enforce: true,
            },
          },
        },
      };
    }

    // Gloo and WebGL optimizations
    config.resolve.alias = {
      ...config.resolve.alias,
      // Alias for better tree shaking
      "@gloo": "./components/gloo",
    };

    return config;
  },
  
  // Image optimization
  images: {
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Compression and caching
  compress: true,
  poweredByHeader: false,
  
  // Performance budgets
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
};

export default bundleOptimizations;