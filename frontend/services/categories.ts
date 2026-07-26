import axiosApi from '@/lib/axiosApi';
import type {CategoryTypeResponse, TourCategoryType} from '@/types/tour';

export const getCategories = async ({page, limit}: {
  page?: number,
  limit?: number
} = {}) => {
  const params: Record<string, string | undefined | number> = {};
  if (page !== undefined) {
    params.page = Number(page);
  }
  if (limit !== undefined) {
    params.limit = Number(limit);
  }
  const res = await axiosApi.get<CategoryTypeResponse>('/categories', {params});
  return res.data;
};

export const createCategory = async (data: { title: string }) => {
  const res = await axiosApi.post<TourCategoryType>('/categories', data);
  return res.data;
};

export const deleteCategory = async (id: string) => {
  const res = await axiosApi.delete<{ message: string }>(`/categories/${id}`);
  return res.data;
};
