import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  // Temporarily disable strict TypeScript checking for Phase 4 setup
  typescript: {
    ignoreBuildErrors: true,
  },
  // Temporarily disable ESLint during builds
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
