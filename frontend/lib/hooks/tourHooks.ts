import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getTours,
  createTour,
  updateTour,
  deleteTour,
  togglePublish,
  getTourById,
} from '@/services/tours';
import { toast } from 'sonner';
import type { TourMutation } from '@/types/tour';

export const useTours = (page: number, limit: number, categoryId?: string) => {
  return useQuery({
    queryKey: ['tours', page, limit, categoryId],
    queryFn: () => getTours(page, limit, categoryId),
  });
};

export const useCreateTour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: TourMutation) => createTour(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Тур создан');
    },
  });
};

export const useUpdateTour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: TourMutation }) =>
      updateTour(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', variables.id] });
      toast.success('Тур обновлен');
    },
  });
};

export const useTogglePublish = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isPublished }: { id: string; isPublished: boolean }) =>
      togglePublish(id, isPublished),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      queryClient.invalidateQueries({ queryKey: ['tour', variables.id] });
    },
  });
};

export const useDeleteTour = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTour,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tours'] });
      toast.success('Тур удален');
    },
  });
};

export const useTourById = (id: string) => {
  return useQuery({
    queryKey: ['tour', id],
    queryFn: () => getTourById(id),
    enabled: Boolean(id),
  });
};
