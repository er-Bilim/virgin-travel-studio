import TourDetailView from '@/components/public/tours/TourDetailView';
import { getTourById } from '@/services/tours';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import axios from 'axios';

interface Props {
  params: Promise<{ slug: string }>;
}

const Tour = async ({ params }: Props) => {
  const headersList = await headers();
  const userIp =
    headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? '';

  const { slug } = await params;
  const qc = new QueryClient();

  try {
    const tour = await getTourById(slug, userIp);
    qc.setQueryData(['tour', slug], tour);
  } catch (error) {
    const status = axios.isAxiosError(error)
      ? error.response?.status
      : undefined;

    if (status === 404 || status === 400) {
      notFound();
    }
  }

  const dehydrateQC = dehydrate(qc);

  return (
    <HydrationBoundary state={dehydrateQC}>
      <TourDetailView id={slug} />
    </HydrationBoundary>
  );
};

export default Tour;
