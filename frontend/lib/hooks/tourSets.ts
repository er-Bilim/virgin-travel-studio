import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTourSets,
  getTourSetById,
  createTourSet,
  updateTourSet,
} from '@/services/tourSets';
import type { TourSetMutation } from '@/types/tourSets';

export const useTourSets = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['tourSets', 'list', page, limit],
    queryFn: () => getTourSets(page, limit),
    placeholderData: (previousData) => previousData,
  });
};

export const useOneTourSet = (tourSetId: string) => {
  return useQuery({
    queryKey: ['tourSets', 'single', tourSetId],
    queryFn: () => getTourSetById(tourSetId),
    staleTime: 1000 * 60 * 5,
    enabled: !!tourSetId,
  });
};

export const useCreateTourSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: TourSetMutation) => createTourSet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tourSets', 'list'] });
    },
  });
};

export const useUpdateTourSet = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Partial<TourSetMutation>;
    }) => updateTourSet(id, data),
    onSuccess: (updatedData) => {
      queryClient.invalidateQueries({ queryKey: ['tourSets', 'list'] });
      queryClient.invalidateQueries({
        queryKey: ['tourSets', 'single', updatedData._id],
      });
    },
  });
};
