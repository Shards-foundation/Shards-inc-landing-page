import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const config: NextConfig = {
  reactStrictMode: true,
  experimental: { cpus: 1, webpackBuildWorker: false },
  async redirects() {
    return [{
      source: '/:path*',
      has: [{type: 'host', value: 'shardsinc.co.uk'}],
      destination: 'https://www.shardsinc.co.uk/:path*',
      permanent: true,
    }];
  },
  poweredByHeader: false,
  async headers() {
    return [{
      source: '/(.*)',
      headers: [
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
        { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' }
      ]
    }];
  }
};
export default withBundleAnalyzer({ enabled: process.env.ANALYZE === 'true' })(config);
