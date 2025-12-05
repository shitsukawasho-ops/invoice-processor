import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack for dev mode
  experimental: {
    turbo: undefined,
  },
};

export default nextConfig;
