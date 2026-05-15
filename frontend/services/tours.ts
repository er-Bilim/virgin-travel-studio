import type { TourMutation, ToursGetResponse, TourType } from '@/types/tour';
import axiosApi from '@/lib/axiosApi';

export const getTours = async (
  page = 1,
  limit = 10,
  categoryId?: string,
): Promise<ToursGetResponse> => {
  const params = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });

  if (categoryId) params.append('category', categoryId);

  const res = await axiosApi.get<ToursGetResponse>(
    `/tours?${params.toString()}`,
  );
  return res.data;
};

export const createTour = async (data: TourMutation): Promise<TourType> => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('category', data.category);

  data.baseAdvantages.forEach((advantage) => {
    formData.append('baseAdvantages', advantage);
  });

  data.images.forEach((file) => {
    formData.append('images', file);
  });

  const res = await axiosApi.post<TourType>('/tours', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const deleteTour = async (id: string): Promise<void> => {
  await axiosApi.delete(`/tours/${id}`);
};

export const togglePublish = async (
  id: string,
  isPublished: boolean,
): Promise<TourType> => {
  const res = await axiosApi.patch<TourType>(`/tours/${id}`, { isPublished });
  return res.data;
};
