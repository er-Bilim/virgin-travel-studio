import About from "@/components/public/about/about";
import { queryConfig } from "@/lib/constants";
import { getAboutUsData } from "@/services/aboutUs";
import { dehydrate, HydrationBoundary, QueryClient } from "@tanstack/react-query";
import { buildMetadata } from '@/lib/seo';


export const metadata = buildMetadata(
    'О нас | Virgin Travel Studio',
    'Узнайте больше о Virgin Travel Studio, нашей команде, ценностях и подходе к организации путешествий.',
    '/about',
);

const AboutPage = async () => {
  const qc = new QueryClient(queryConfig);

  await qc.prefetchQuery({
    queryKey: ['aboutUs'],
    queryFn: () => getAboutUsData()
  })


  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <About/>
    </HydrationBoundary>
  );
};

export default AboutPage;