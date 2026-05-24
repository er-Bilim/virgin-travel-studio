import { createReview, getReviews } from '@/services/reviews';
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const PAGE_SIZE = 10;
const INITIAL_PAGE_SIZE = 3;

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useInfiniteReviews = (tourId?: string) => {
  return useInfiniteQuery({
    queryKey: ['reviews', 'public', tourId],
    queryFn: ({ pageParam }) => {
      const isFirst = pageParam === 0;
      return getReviews({
        tourId: tourId,
        skip: pageParam,
        limit: isFirst ? INITIAL_PAGE_SIZE : PAGE_SIZE,
      })
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      if (!lastPage.hasMore) return undefined;

      const loaded = allPages.reduce((acc, page) => acc + page.reviews.length, 0);
      return loaded;
    },
    enabled: !!tourId,
  })
};
