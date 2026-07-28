import type { NextConfig } from 'next';

const parseHost = (url: string) => {
  const parsed = new URL(url);
  return {
    protocol: parsed.protocol.replace(':', '') as 'http' | 'https',
    hostname: parsed.hostname,
    port: parsed.port,
  };
};

const imageHost = parseHost(process.env.NEXT_IMAGE_URL?.trim() || 'http://localhost:8000');

const backHost = parseHost(
  process.env.NEXT_BACK_URL?.trim() ||
  process.env.NEXT_IMAGE_URL?.trim() ||
  'http://localhost:8000',
);

const imagePatterns = [
  '/images/**',
  '/logo/**',
  '/api/news/image/**',
  '/api/tours/image/**',
  '/api/reviews/image/**',
  '/api/homepage-settings/image/**',
] as const;

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      ...(backHost.hostname !== imageHost.hostname
        ? imagePatterns.map((pathname) => ({ ...backHost, pathname }))
        : []),
    ],
  },
  async rewrites() {
    const apiBase = process.env.NEXT_API_URL?.trim() || 'http://localhost:8000/api';
    const backBase = process.env.NEXT_BACK_URL?.trim() || 'http://localhost:8000';
    return [
      {
        source: '/api/:path*',
        destination: `${apiBase}/:path*`,
      },
      {
        source: '/logo/:path*',
        destination: `${backBase}/logo/:path*`,
      },
      {
        source: '/images/:path*',
        destination: `${backBase}/images/:path*`,
      },
      {
        source: '/videos/:path*',
        destination: `${backBase}/videos/:path*`,
      },
    ];
  },
};

export default nextConfig;
