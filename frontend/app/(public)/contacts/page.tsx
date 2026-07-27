import { queryConfig } from '@/lib/constants';
import { fetchContacts } from '@/services/contactSettings';
import { fetchPublicFaqs } from '@/services/faq';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import ContactsPage from '@/components/public/contacts/ContactsPage';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata(
    'Контакты | Virgin Travel Studio',
    'Свяжитесь с Virgin Travel Studio: телефон, электронная почта, социальные сети и адрес офиса.',
    '/contacts',
);

const Contacts = async () => {
  const qc = new QueryClient(queryConfig);

  await Promise.all([
    qc.prefetchQuery({
      queryKey: ['contacts'],
      queryFn: () => fetchContacts(),
    }),
    qc.prefetchQuery({
      queryKey: ['faqs', 'public'],
      queryFn: () => fetchPublicFaqs(),
    }),
  ]);

  const dehydrated = dehydrate(qc);

  return (
    <HydrationBoundary state={dehydrated}>
      <ContactsPage />
    </HydrationBoundary>
  );
};

export default Contacts;