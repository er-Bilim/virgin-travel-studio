import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {
  getCategories,
  createCategory,
  deleteCategory,
} from '@/services/categories';
import type {AxiosError} from 'axios';
import type {GlobalError} from '@/types/error';
import type {TourCategoryType} from "@/types/tour";

export const useCategories = ({page, limit}: {
  page?: number,
  limit?: number
} = {}) => {
  return useQuery({
    queryKey: ['categories', page, limit],
    queryFn: () => getCategories({page, limit}),
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<TourCategoryType | { message: string },
    AxiosError<GlobalError>,
    { title: string }>({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['categories']});
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation<{ message: string }, AxiosError<GlobalError>, string>({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ['categories']});
    },
  });
};
