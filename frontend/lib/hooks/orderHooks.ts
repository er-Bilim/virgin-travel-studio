import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  postOrder
} from '@/services/orders';
import { getNewsById } from '@/services/news';

export const useGetSingleNews = (newsId: string) => {
  return useQuery({
    queryKey: ['news', 'single', newsId],
    queryFn: () => getNewsById(newsId),
    enabled: !!newsId
  })
}

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};