import type { NextConfig } from 'next';

const imageUrl = process.env.NEXT_IMAGE_URL ?? 'http://localhost:8000';
const parsedImageUrl = new URL(imageUrl);

const imageHost = {
  protocol: parsedImageUrl.protocol.replace(':', '') as 'http' | 'https',
  hostname: parsedImageUrl.hostname,
  port: parsedImageUrl.port,
};

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      { ...imageHost, pathname: '/images/**' },
      { ...imageHost, pathname: '/api/news/image/**' },
      { ...imageHost, pathname: '/api/tours/image/**' },
      { ...imageHost, pathname: '/api/reviews/image/**' },
      { ...imageHost, pathname: '/api/homepage-settings/image/**' },
    ],
  },
};

export default nextConfig;
