import type { MetadataRoute } from 'next';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

const robots = (): MetadataRoute.Robots => {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/manager', '/login', '/twa'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
};

export default robots;
