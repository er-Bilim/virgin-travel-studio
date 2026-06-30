import NewsList from "@/components/public/news/NewsList";
import { getNews } from "@/services/news";
import { dehydrate, HydrationBoundary, QueryClient} from "@tanstack/react-query";

const NewsPage = async () => {

  const qc = new QueryClient();

  await qc.prefetchQuery({
    queryKey: ["news", 1, 7],
    queryFn: () => getNews({page:1, limit: 7})
  })



  return (
    <HydrationBoundary state={dehydrate(qc)}>
      <NewsList/>
    </HydrationBoundary>
  );
};

export const dynamic = 'force-dynamic';

export default NewsPage;