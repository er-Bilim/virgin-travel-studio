import axiosApi from '@/lib/axiosApi';
import type { TourCategoryType } from '@/types/tour';

export const getCategories = async () => {
  const res = await axiosApi.get<TourCategoryType[]>('/categories');
  return res.data;
};
