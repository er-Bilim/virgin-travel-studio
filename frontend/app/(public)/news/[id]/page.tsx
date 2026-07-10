import NewsDetailView from '@/components/public/news/NewsDetailView';
import { getNewsById } from '@/services/news';
import {
  dehydrate,
  HydrationBoundary,
  QueryClient,
} from '@tanstack/react-query';
import { notFound } from 'next/navigation';
import axios from 'axios';

interface Props {
  params: Promise<{ id: string }>;
}

const NewsDetailPage = async ({ params }: Props) => {
  const { id } = await params;
  const qc = new QueryClient();

  try {
    const news = await getNewsById(id);
    qc.setQueryData(['news', 'single', id], news);
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
      <NewsDetailView id={id} />
    </HydrationBoundary>
  );
};

export default NewsDetailPage;
