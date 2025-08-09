import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],
  // Enforce strict TypeScript build (previously ignored build errors)
  typescript: {},
  // Enforce ESLint during builds (previously ignored)
  eslint: {},
};

export default nextConfig;
