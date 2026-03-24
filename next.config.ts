import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ['res.cloudinary.com', 'img.clerk.com', 'placehold.co'],
  },
  reactStrictMode: false, // turn off strict mode (optional)
  typescript: {
    ignoreBuildErrors: true, // ignore all TS errors
  },
  eslint: {
    ignoreDuringBuilds: true, // ignore all ESLint errors
  }
};

export default nextConfig;