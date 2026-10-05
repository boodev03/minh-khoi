import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  experimental: {
    serverActions: {
      // Browser preview proxies via this origin
      allowedOrigins: ["127.0.0.1:58095", "127.0.0.1:49979"],
    },
  },
};

export default nextConfig;
