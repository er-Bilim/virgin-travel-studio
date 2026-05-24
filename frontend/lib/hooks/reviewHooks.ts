import { createReview, getReviews } from '@/services/reviews';
import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

const PAGE_SIZE = 10;
const ADMIN_PAGE_SIZE = 20;

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
    queryKey: ['reviews', 'public', 'infinite',tourId],
    queryFn: ({ pageParam }) => {
      return getReviews({
        tourId,
        page: pageParam,
        limit: PAGE_SIZE,
      })
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= lastPage.totalPage) return undefined;
      return lastPage.page + 1;
    },
    enabled: !!tourId,
  })
};

export const useAdminReviewsPage = (tourId: string | undefined, page: number) => {
  return useQuery({
    queryKey: ['reviews', 'admin', tourId, page],
    queryFn: () => getReviews({ tourId, page, limit: ADMIN_PAGE_SIZE }),
    placeholderData: keepPreviousData,
  });
};