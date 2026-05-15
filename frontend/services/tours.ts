import axiosApi from '@/lib/axiosApi';
import { TourMutation, ToursGetResponse, TourType } from '@/types/tour';

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

const buildTourFormData = (data: TourMutation) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('category', data.category);

  data.baseAdvantages
    .filter((adv: string) => adv.trim() !== '')
    .forEach((adv: string) => formData.append('baseAdvantages', adv));

  if (data.images && data.images.length > 0) {
    data.images.forEach((file: File) => formData.append('images', file));
  }
  return formData;
};

export const createTour = async (data: TourMutation): Promise<TourType> => {
  const formData = buildTourFormData(data);
  const res = await axiosApi.post<TourType>('/tours', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
};

export const updateTour = async (
  id: string,
  data: TourMutation,
): Promise<TourType> => {
  const formData = buildTourFormData(data);
  const res = await axiosApi.patch<TourType>(`/tours/${id}`, formData, {
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
