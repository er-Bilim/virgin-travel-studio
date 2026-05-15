import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createTour,
  deleteTour,
  getTours,
  togglePublish,
} from '@/services/tours';
import { toast } from 'sonner';

export const useTours = (page: number, limit: number, categoryId?: string) => {
  return useQuery({
    queryKey: ['tours', page, limit, categoryId],
    queryFn: () => getTours(page, limit, categoryId),
    placeholderData: (previousData) => previousData,
  });
};

export const useCreateTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Тур успешно создан');
    },
    onError: (error: any) => {
      const message = error.response?.data?.error || 'Ошибка при создании тура';
      toast.error(message);
    },
  });
};

export const useDeleteTour = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Тур успешно удален');
    },
    onError: () => {
      toast.error('Не удалось удалить тур');
    },
  });
};

export const useTogglePublish = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      togglePublish(id, isPublished),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Статус обновлен');
    },
  });
};
