import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  createManager,
  deleteManager,
  getManagers,
  updateManager
} from '@/services/manager';
import type {UseFormSetError} from 'react-hook-form';
import type {IUser, ManagerMutation, ManagerUpdateMutation} from '@/types/user';
import type {AxiosError} from 'axios';
import {toast} from 'sonner';
import type {GlobalError} from '@/types/error';

export const useManagers = (filters: {
  fullName?: string;
  status?: string;
} = {}) => {
  return useQuery({
    queryKey: ['managers', filters],
    queryFn:() => getManagers(filters),
  });
};

export const useOneManager = (id: string) => {
  return useQuery({
    queryKey: ['managers'],
    queryFn: getManagers,
    select: (data) => data.find((manager) => manager._id === id),
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

export const useUpdateManager = (setError: UseFormSetError<ManagerUpdateMutation>) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ManagerUpdateMutation }) =>
      updateManager(id, data),
    onSuccess: async (updatedManager) => {
      toast.success('Менеджер успешно обновлен!');
      queryClient.setQueryData<IUser[]>(['managers'], (old = []) =>
        old.map((manager) =>
          manager._id === updatedManager._id ? updatedManager : manager,
        ),
      );
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
          setError(field as keyof ManagerUpdateMutation, {
            type: 'server',
            message: value.message,
          });
        });
        return;
      }

      toast.error(
        data.error || 'Не удалось создать менеджера. Попробуйте снова.',
      );
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