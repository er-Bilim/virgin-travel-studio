import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import axios from 'axios';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';

import TourDetailView from '@/components/public/tours/TourDetailView';
import {
  buildMetadata,
  DEFAULT_SITE_DESCRIPTION,
} from '@/lib/seo';
import { getTourById } from '@/services/tours';

interface Props {
  params: Promise<{ slug: string }>;
}

export const generateMetadata = async ({
                                         params,
                                       }: Props): Promise<Metadata> => {
  const { slug } = await params;

  try {
    const tour = await getTourById(slug);

    return buildMetadata(
        `${tour.title} | Virgin Travel Studio`,
        tour.description || DEFAULT_SITE_DESCRIPTION,
        `/tours/${slug}`,
    );
  } catch {
    return buildMetadata(
        'Тур | Virgin Travel Studio',
        DEFAULT_SITE_DESCRIPTION,
        `/tours/${slug}`,
    );
  }
};

const Tour = async ({ params }: Props) => {
  const headersList = await headers();

  const userIp =
      headersList.get('x-forwarded-for') ??
      headersList.get('x-real-ip') ??
      '';

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

  return (
      <HydrationBoundary state={dehydrate(qc)}>
        <TourDetailView id={slug} />
      </HydrationBoundary>
  );
};

export default Tour;