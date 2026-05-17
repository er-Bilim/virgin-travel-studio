import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createNews,
  deleteNews,
  editNews,
  getNews,
  publicateNews,
} from '@/services/news';
import { toast } from 'sonner';
import type { AxiosError } from 'axios';
import type { GlobalError } from '@/types/error';
import type { UseFormSetError } from 'react-hook-form';
import type { NewsMutation } from '@/types/news';

const useCreateNews = (setError: UseFormSetError<NewsMutation>) => {
  const queryClient = useQueryClient();
  const formFields = new Set<keyof NewsMutation>([
    'title',
    'content',
    'image',
    'tags',
  ]);

  return useMutation({
    mutationFn: createNews,
    onSuccess: async (data) => {
      toast.success(data.message || 'Новость успешно создана!');
      await queryClient.invalidateQueries({ queryKey: ['news'] });
    },
    onError: async (err: AxiosError<GlobalError>) => {
      const data = err.response?.data;

      if (!data) {
        return toast.error(
          'Не удалось создать новость. Проверьте соединение и попробуйте снова.',
        );
      }

      if ('details' in data && data.details) {
        Object.entries(data.details).forEach(([key, value]) => {
          if (formFields.has(key as keyof NewsMutation)) {
            setError(key as keyof NewsMutation, {
              type: 'server',
              message: value.message,
            });
            return;
          }

          toast.error(value.message);
        });
        return;
      }

      toast.error(
        data.error || 'Не удалось создать новость. Попробуйте снова.',
      );
    },
  });
};
export default useCreateNews;

export const useNews = () => {
  return useQuery({
    queryKey: ['news'],
    queryFn: getNews,
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNews,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};

export const useEditNews = (setError: UseFormSetError<NewsMutation>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editNews,
    onSuccess: async (data) => {
      toast.success(data.message || 'Новость успешно обновлена!');
      await queryClient.invalidateQueries({ queryKey: ['news'] });
    },
    onError: async (err: AxiosError<GlobalError>) => {
      const data = err.response?.data;
      if (!data) {
        return toast.error(
          'Не удалось обновить новость. Проверьте соединение и попробуйте снова.',
        );
      }

      if ('details' in data && data.details) {
        Object.entries(data.details).forEach(([key, value]) => {
          setError(key as keyof NewsMutation, {
            type: 'server',
            message: value.message,
          });
        });
        return;
      }

      toast.error(data.error);
    },
  });
};

export const usePublicateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publicateNews,
    onSuccess: () => {
      toast.success('Успешно обновленно состояние опубликованности');
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};
