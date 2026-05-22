import axiosApi from '@/lib/axiosApi';
import type { TourCategoryType } from '@/types/tour';

export const getCategories = async () => {
  const res = await axiosApi.get<TourCategoryType[]>('/categories');
  return res.data;
};

export const createCategory = async (data: { title: string }) => {
  const res = await axiosApi.post<TourCategoryType>('/categories', data);
  return res.data;
};

export const toggleCategoryPublish = async (id: string) => {
  const res = await axiosApi.patch<TourCategoryType>(`/categories/${id}`);
  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await axiosApi.delete<{ message: string }>(`/categories/${id}`);
  return res.data;
};
