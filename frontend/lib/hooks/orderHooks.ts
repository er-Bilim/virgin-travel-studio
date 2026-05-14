import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  postOrder
} from '@/services/orders';

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['oders'] });
    },
  });
};


