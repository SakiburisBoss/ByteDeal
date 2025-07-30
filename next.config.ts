import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

// Type for the withBundleAnalyzer configuration
interface WithBundleAnalyzerConfig {
  enabled: boolean;
  openAnalyzer?: boolean;
}

// Bundle analyzer configuration
const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: false,
} as WithBundleAnalyzerConfig);

const nextConfig: NextConfig = {
  // Enable React Strict Mode for better development practices
  reactStrictMode: true,
  
  // Configure images for Next.js Image component
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        port: '',
        pathname: '/**',
      },
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Turbopack configuration (moved from experimental.turbo)
  turbopack: {
    // Add any Turbopack-specific configuration here
  },
  
  // Environment variables that should be exposed to the browser
  env: {
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SANITY_API_VERSION: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2024-01-01',
  },
  
  // Configure page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  // Production optimizations
  productionBrowserSourceMaps: false, // Enable for debugging production builds if needed
  compress: true, // Gzip compression is enabled by default in production
  
  // Configure headers
  async headers() {
    return [
      {
        // Apply these headers to all routes in your application
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Configure redirects
  async redirects() {
    return [
      // Add your redirects here
      // Example:
      // {
      //   source: '/old-path',
      //   destination: '/new-path',
      //   permanent: true,
      // },
    ];
  },
  
  // Configure rewrites
  async rewrites() {
    return [
      // Add your rewrites here
    ];
  },
};

// Conditionally apply bundle analyzer
export default process.env.ANALYZE === 'true' 
  ? bundleAnalyzer(nextConfig) 
  : nextConfig;
