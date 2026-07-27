import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchHomepageSettings,
  createHomepageSettings,
  editHomepageSettings,
} from '@/services/homepageSettings';

export const useHomepageSettings = (isAdmin = false) => {
  return useQuery({
    queryKey: ['homepageSettings'],
    queryFn: fetchHomepageSettings,
    staleTime: isAdmin ? 0 : 1000 * 60 * 60 * 4,
    refetchOnWindowFocus: isAdmin,
  });
};

export const useMutateHomepageSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editHomepageSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSettings'] });
    },
  });
};

export const useMutateCreateHomepageSettings = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHomepageSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['homepageSettings'] });
    },
  });
};
