import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAboutUsData,
  putAboutUsData,
  postAboutUsData,
} from '@/services/aboutUs';

export const useAboutUsData = () => {
  return useQuery({
    queryKey: ['aboutUs'],
    queryFn: getAboutUsData,
  });
};

export const useEditAboutUsData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['aboutUs'],
    mutationFn: putAboutUsData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aboutUs'] });
    },
  });
};

export const useCreateAboutUsData = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationKey: ['aboutUs'],
    mutationFn: postAboutUsData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aboutUs'] });
    },
  });
};