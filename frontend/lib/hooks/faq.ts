import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchPublicFaqs,
  fetchAdminFaqs,
  createFaq,
  reorderFaqs,
  togglePublishFaq,
  editFaq,
  deleteFaq,
} from '@/services/faq';

export const usePublicFaqs = () => {
  return useQuery({
    queryKey: ['faqs', 'public'],
    queryFn: fetchPublicFaqs,
    staleTime: 60 * 60 * 3,
  });
};

export const useAdminFaqs = () => {
  return useQuery({
    queryKey: ['faqs', 'admin'],
    queryFn: fetchAdminFaqs,
  });
};

export const useMutateCreateFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useMutateReorderFaqs = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reorderFaqs,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useMutateTogglePublishFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: togglePublishFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useMutateEditFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};

export const useMutateDeleteFaq = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteFaq,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['faqs'] });
    },
  });
};
