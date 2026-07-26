import type { MetadataRoute } from 'next';
import { getTours } from '@/services/tours';
import { getNews } from '@/services/news';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';
const PAGE_SIZE = 100;

export const revalidate = 86400;

const sitemap = async (): Promise<MetadataRoute.Sitemap> => {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE_URL}/tours`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/news`, changeFrequency: 'weekly', priority: 0.7 },
    { url: `${SITE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/faq`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${SITE_URL}/contacts`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  const [tourRoutes, newsRoutes] = await Promise.all([
    getTourRoutes(),
    getNewsRoutes(),
  ]);

  return [...staticRoutes, ...tourRoutes, ...newsRoutes];
};

async function getTourRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const routes: MetadataRoute.Sitemap = [];
    let page = 1;
    let totalPages = 1;

    do {
      const { tours, meta } = await getTours({
        page,
        limit: PAGE_SIZE,
        isPublished: true,
      });
      totalPages = meta.totalPages;

      for (const tour of tours) {
        routes.push({
          url: `${SITE_URL}/tours/${tour._id}`,
          lastModified: tour.createdAt,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
      page += 1;
    } while (page <= totalPages);

    return routes;
  } catch {
    return [];
  }
}

async function getNewsRoutes(): Promise<MetadataRoute.Sitemap> {
  try {
    const routes: MetadataRoute.Sitemap = [];
    let page = 1;
    let totalPages = 1;

    do {
      const { allNews, metadata } = await getNews({
        page,
        limit: PAGE_SIZE,
        isPublished: 'true',
      });
      totalPages = metadata.totalPages;

      for (const article of allNews) {
        routes.push({
          url: `${SITE_URL}/news/${article._id}`,
          lastModified: article.updatedAt,
          changeFrequency: 'weekly',
          priority: 0.6,
        });
      }
      page += 1;
    } while (page <= totalPages);

    return routes;
  } catch {
    return [];
  }
}

export default sitemap;
