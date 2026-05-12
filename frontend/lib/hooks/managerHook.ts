import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createManager, deleteManager, getManagers } from '@/services/manager';
import type { UseFormSetError } from 'react-hook-form';
import type { IUser, ManagerMutation } from '@/types/user';
import type { AxiosError } from 'axios';
import { toast } from 'sonner';
import type { GlobalError } from '@/types/error';

export const useManagers = () => {
  return useQuery({
    queryKey: ['managers'],
    queryFn: getManagers,
  });
};

export const useCreateManager = (
  setError: UseFormSetError<ManagerMutation>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createManager,
    onSuccess: async (newManager) => {
      toast.success('Менеджер успешно создался!');
      queryClient.setQueryData<IUser[]>(['managers'], (old = []) => {
        return [newManager, ...old];
      });
    },
    onError: (err: AxiosError<GlobalError>) => {
      const data = err.response?.data;

      if (!data) {
        return toast.error(
          'Не удалось создать менеджера. Проверьте соединение и попробуйте снова.',
        );
      }

      if ('details' in data && data.details) {
        Object.entries(data.details).forEach(([field, value]) => {
          setError(field as keyof ManagerMutation, {
            type: 'server',
            message: value.message,
          });
        });
        return;
      }

      toast.error(data.error || 'Не удалось создать менеджера. Попробуйте снова.');
    },
  });
};

export const useDeleteManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
  });
};