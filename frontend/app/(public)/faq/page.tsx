import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { Faq } from '@/components/public/faq/Faq';
import { fetchPublicFaqs } from '@/services/faq';
import { buildMetadata } from '@/lib/seo';


export const metadata = buildMetadata(
    'Частые вопросы | Virgin Travel Studio',
    'Ответы на популярные вопросы о турах, бронировании, оплате и организации путешествий.',
    '/faq',
);

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
