import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  deleteOrder,
  getOneOrder,
  getOrders,
  postOrder,
  updateOrder
} from '@/services/orders';
import type {OrderMutationType} from '@/types/order';
import {toast} from 'sonner';
import type {AxiosError} from 'axios';
import type {GlobalError} from '@/types/error';


export const useOrders = (
    filters: {
      managerId?: string,
      status?: string,
      page?: number,
      limit?: number,
    } = {}) => {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: () => getOrders(filters),
    refetchInterval: 10000,
  });
};

export const useOneOrder = (id: string) => {
  return useQuery({
    queryKey: ['order', id], 
    queryFn: () => getOneOrder(id), 
    staleTime: 5 * 60 * 1000,
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: postOrder,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
};

export const useUpdateOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: OrderMutationType }) =>
      updateOrder(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', variables.id] });
      queryClient.invalidateQueries({
        queryKey: ['tour'],
        refetchType: 'active',
      });

      toast.success('Заявка обновлена');
    },
    onError: (err: AxiosError<GlobalError>) => {
      const data = err.response?.data;
      if (!data) {
        return toast.error(
          'Вы не можете взять заявку, так как вы Забанены!',
        );
      }

      toast.error(
        data.error || 'Вы не можете взять заявку, так как вы Забанены!',
        { position: 'top-center' },
      );
    }
  });
};


export const useDeleteOrder = () => {
    const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteOrder(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', id] });
      toast.success('Заявка удалена');
    },
  });
}

