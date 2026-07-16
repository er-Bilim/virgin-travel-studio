import LatestNewsSection from '@/components/public/home/LatestNewsSection';
import CustomTourCard from '@/components/public/home/tourCustomCard/CustomTourCard';
import Advantages from '@/components/public/advantages/advantages';
import ReviewsSection from '@/components/public/home/ReviewsSection';
import PopularToursSection from '@/components/public/home/PopularToursSection';
import HeroSection from '@/components/public/home/HeroSection';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { fetchHomepageSettings } from '@/services/homepageSettings';
import { getPopularTours } from '@/services/tours';
import { queryConfig } from '@/lib/constants';
import { getPublicFeaturedReviews } from '@/services/reviews';
import { latestNewsQueryOptions } from '@/lib/hooks/newsHooks';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata(
    'Virgin Travel Studio — путешествия и туры',
    'Подберите готовый тур или создайте индивидуальное путешествие вместе с Virgin Travel Studio.',
    '/',
);

const Home = async () => {
  const limit: number = 4;
  const qc = new QueryClient(queryConfig);

  await Promise.all([
    qc.prefetchQuery({
      queryKey: ['homepageSettings'],
      queryFn: () => fetchHomepageSettings(),
    }),
    qc.prefetchQuery({
      queryKey: ['tours', 'popular', limit],
      queryFn: () => getPopularTours(limit),
    }),
    qc.prefetchQuery({
      queryKey: ['reviews', 'featured'],
      queryFn: () => getPublicFeaturedReviews(),
    }),
    qc.prefetchQuery(latestNewsQueryOptions),
  ]);

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <section className="w-full">
        <HeroSection />
        <ReviewsSection />
        <PopularToursSection />
        <Advantages />
        <LatestNewsSection />
        <div className="mt-10 mb-15 flex flex-col items-center">
          <CustomTourCard />
        </div>
      </section>
    </HydrationBoundary>
  );
};

export default Home;