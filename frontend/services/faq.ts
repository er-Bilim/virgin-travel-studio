import axiosApi from '@/lib/axiosApi';
import type { Faq, FaqMutation, FaqResponse } from '@/types/faq';

export const fetchPublicFaqs = async () => {
  const result = await axiosApi.get<Faq[]>('/faq');
  return result.data;
};

export const fetchAdminFaqs = async () => {
  const result = await axiosApi.get<Faq[]>('/faq/admin');
  return result.data;
};

export const createFaq = async (data: FaqMutation) => {
  const result = await axiosApi.post<FaqResponse>('/faq', data);
  return result.data;
};

export const reorderFaqs = async (ids: string[]) => {
  const result = await axiosApi.put<{ message: string }>('/faq/reorder', {
    ids,
  });
  return result.data;
};

export const togglePublishFaq = async (id: string) => {
  const result = await axiosApi.patch<Faq>(`/faq/${id}/isPublished`);
  return result.data;
};

export const editFaq = async ({
  id,
  data,
}: {
  id: string;
  data: Partial<FaqMutation>;
}) => {
  const result = await axiosApi.patch<FaqResponse>(`/faq/${id}/edit`, data);
  return result.data;
};

export const deleteFaq = async (id: string) => {
  const result = await axiosApi.delete<{ message: string }>(`/faq/${id}`);
  return result.data;
};
