import {
  approveReview,
  createReview,
  deleteReview,
  featureReview,
  getAdminReviews,
  getPublicFeaturedReviews,
  getPublicReviews,
  updateReview,
} from '@/services/reviews';
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import type { IReview, IReviewMutation } from '@/types/review';

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

export const useApproveReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      isModerated,
    }: {
      id: string;
      isModerated: 'pending' | 'approved' | 'rejected';
    }) => approveReview(id, isModerated),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useFeatureReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string)  => featureReview(id),
    onMutate: async (id: string) => {
      const listKey = ['reviews', 'admin'];

      await queryClient.cancelQueries({ queryKey: listKey });

      const prev = queryClient.getQueriesData({ queryKey: listKey });

      queryClient.setQueriesData({ queryKey: listKey }, (old: {reviews: IReview[]}) => {
        if (!old) return old;

        return {
          ...old,
          reviews: old.reviews.map((review: IReview) => review._id === id ? {...review, featuredOnHomepage: !review.featuredOnHomepage} : review),
        }
      })

      return { prev }

    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews', 'featured']})
    } 
  })
}

export const useDeleteReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};


export const useAdminReviews = (
  params: {
    tourId?: string;
    page?: number;
    limit?: number;
    isModerated?: string;
  } = {},
) => {
  return useQuery({
    queryKey: [
      'reviews',
      'admin',
      params.tourId,
      params.page,
      params.limit,
      params.isModerated,
    ],
    queryFn: () => getAdminReviews(params),
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

export const useGetFeaturedReviews = () => {
  return useQuery({
    queryKey: ['reviews', 'featured'],
    queryFn: getPublicFeaturedReviews,
  })
}
