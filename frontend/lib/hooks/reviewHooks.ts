import { createReview, getReviews } from '@/services/reviews';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

export const useCreateReview = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
    },
  });
};

export const useGetReviews = (tourId?: string) => {
  return useQuery({
    queryKey: ['reviews', tourId],
    queryFn: () => getReviews(tourId!),
    enabled: !!tourId
  });
};
