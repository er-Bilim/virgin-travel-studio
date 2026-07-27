import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {
  changeManagerPassword,
  createManager,
  setStatusManager,
  getManagers,
  getOneManager,
  updateManager,
} from '@/services/manager';
import type {UseFormSetError} from 'react-hook-form';
import type {IUser, ManagerMutation, ManagerPasswordMutation, ManagerUpdateMutation} from '@/types/user';
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
    queryFn:() => getOneManager(id),
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

export const useChangeManagerPassword = (
  setError: UseFormSetError<ManagerPasswordMutation>,
) => {
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      changeManagerPassword(id, { password }),
    onSuccess: () => {
      toast.success('Пароль менеджера успешно изменён!');
    },
    onError: (err: AxiosError<GlobalError>) => {
      const data = err.response?.data;

      if (!data) {
        return toast.error(
          'Не удалось изменить пароль. Проверьте соединение и попробуйте снова.',
        );
      }

      if ('details' in data && data.details) {
        Object.entries(data.details).forEach(([field, value]) => {
          if (field === 'password') {
            setError('password', { type: 'server', message: value.message });
          }
        });
        return;
      }

      toast.error(data.error || 'Не удалось изменить пароль. Попробуйте снова.');
    },
  });
};

export const useSetStatusManager = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setStatusManager,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['managers'] });
    },
  });
};