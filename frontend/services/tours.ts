import axiosApi from '@/lib/axiosApi';

import type {
  GetToursParams,
  ISingleTour,
  TourCategory,
  TourMutation,
  ToursGetResponse,
  TourType,
} from '@/types/tour';

export const getTours = async ({
  page = 1,
  limit = 10,
  categoryId,
  search,
  isPublished,
  sort
}: GetToursParams): Promise<ToursGetResponse> => {
  const params: Record<string, string | undefined | number> = {};

  if (categoryId) params.category = categoryId;
  if (sort) params.sort = sort;
  if (search) params.search = search;
  if (isPublished) params.isPublished = String(isPublished);

  params.page = Number(page);
  params.limit = Number(limit);

  const res = await axiosApi.get<ToursGetResponse>(`/tours`, { params });

  return res.data;
};

export const getTourById = async (id: string): Promise<ISingleTour> => {
  const res = await axiosApi.get<ISingleTour>(`/tours/${id}`);
  return res.data;
};

export const getTourCategories = async (): Promise<TourCategory[]> => {
  const { data } = await axiosApi.get<TourCategory[]>('/tours/categories');
  return data;
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
  const res = await axiosApi.patch<{ message: string; tour: TourType }>(
    `/tours/${id}`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' },
    },
  );
  return res.data.tour;
};

export const deleteTour = async (id: string) => {
  const res = await axiosApi.delete<{ message: string }>(`/tours/${id}`);
  return res.data;
};

export const togglePublish = async (
  id: string,
  isPublished: boolean,
): Promise<TourType> => {
  const res = await axiosApi.patch<TourType>(`/tours/${id}`, { isPublished });
  return res.data;
};
