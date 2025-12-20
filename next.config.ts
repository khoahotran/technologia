import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // output: 'standalone',
  distDir: '.next',
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  poweredByHeader: false,
  compress: true,
  images: {
    unoptimized: false,
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96],
  },
  compiler: {
    // styledComponents: true,
  },
  experimental: {
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  webpack(config, { isServer }) {
    if (!isServer) {
      config.resolve.fallback = { fs: false, path: false, os: false };
    }
    return config;
  },
  // async redirects() {
  //   return [
  //     { source: '/old-path', destination: '/', permanent: true },
  //   ];
  // },
  // async rewrites() {
  //   return [
  //     { source: '/api/:path*', destination: 'https://backend.example.com/:path*' },
  //   ];
  // },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
};

export default nextConfig;
// export default million.next(nextConfig, { auto: { rsc: true } }) as any;
