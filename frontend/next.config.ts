import type { NextConfig } from "next";
const imageUrl = process.env.NEXT_IMAGE_URL ?? 'http://localhost:8000';
const parsedImageUrl = new URL(imageUrl);

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: parsedImageUrl.protocol.replace(':', '') as 'http' | 'https',
        hostname: parsedImageUrl.hostname,
        port: parsedImageUrl.port,
        pathname: '/images/**',
      },
    ],
  },
};

export default nextConfig;
