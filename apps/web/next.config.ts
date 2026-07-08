import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@myclass/shared', '@myclass/validation'],
};

export default nextConfig;
