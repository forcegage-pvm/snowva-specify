import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 15 automatically supports src directory
  // No additional configuration needed
  eslint: {
    // Allow production builds to complete despite ESLint errors/warnings
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Allow production builds to complete despite TypeScript errors
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
