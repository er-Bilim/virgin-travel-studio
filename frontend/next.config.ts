import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8000', // укажите порт вашего бэкенда
        pathname: '/images/**', // путь к папке с картинками
      },
    ],
  },
};

export default nextConfig;
