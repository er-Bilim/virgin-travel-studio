import {
  createReview,
  deleteReview,
  getAdminReviews,
  getPublicReviews,
  updateReview,
} from '@/services/reviews';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { IReviewMutation } from '@/types/review';

const PAGE_SIZE = 10;

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useUpdateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
                   id,
                   data,
                 }: {
      id: string;
      data: Partial<IReviewMutation>;
    }) => updateReview(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useAdminReviews = (tourId?: string) => {
  return useQuery({
    queryKey: ['reviews', 'admin', tourId],
    queryFn: () => getAdminReviews({ tourId }),
    enabled: !!tourId,
  });
};

export const useInfiniteReviews = (tourId?: string) => {
  return useInfiniteQuery({
    queryKey: ['reviews', 'public', 'infinite', tourId],
    queryFn: ({ pageParam }) => {
      return getPublicReviews({
        tourId,
        page: pageParam,
        limit: PAGE_SIZE,
      });
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      if (lastPage.page >= lastPage.totalPage) return undefined;
      return lastPage.page + 1;
    },
    enabled: !!tourId,
  });
};