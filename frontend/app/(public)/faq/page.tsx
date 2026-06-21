import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { Faq } from '@/components/public/faq/Faq';
import { fetchPublicFaqs } from '@/services/faq';

export default async function FaqPage() {
  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ['public-faqs'],
    queryFn: fetchPublicFaqs,
  });

  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <Faq />
    </HydrationBoundary>
  );
}
