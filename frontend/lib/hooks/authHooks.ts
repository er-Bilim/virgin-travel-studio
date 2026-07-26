import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getMe, login, logout } from '@/services/auth';

export const useUser = () => {
  return useQuery({
    queryKey: ['me'],
    queryFn: getMe,
    retry: false,
  });
};

export const useLogin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      queryClient.setQueryData(['me'], data.user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: logout,
    onSettled: () => {
      queryClient.clear();
    },
  });
};
