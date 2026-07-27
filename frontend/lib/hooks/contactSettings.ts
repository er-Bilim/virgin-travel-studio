import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchContacts,
  editContacts,
  createContacts,
} from '@/services/contactSettings';

export const useContacts = () => {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: fetchContacts,
    staleTime: 60 * 60 * 3,
  });
};

export const useMutateContacts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editContacts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
      
    },
  });
};

export const useMutateCreateContacts = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createContacts,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
  });
};