import axiosApi from '@/lib/axiosApi';

import type {
  GetToursParams,
  ISingleTour,
  TourCategoryType,
  TourMutation,
  ToursGetResponse,
  TourType
} from '@/types/tour';

export const getTours = async ({
  page = 1,
  limit = 10,
  categoryId,
  search,
  isPublished,
    countryCode,
  sort
}: GetToursParams): Promise<ToursGetResponse> => {
  const params: Record<string, string | undefined | number> = {};

  if (categoryId) params.category = categoryId;
  if (sort) params.sort = sort;
  if (search) params.search = search;
  if (isPublished) params.isPublished = String(isPublished);
  if (countryCode) params.countryCode = countryCode;

  params.page = Number(page);
  params.limit = Number(limit);

  const res = await axiosApi.get<ToursGetResponse>(`/tours`, { params });

  return res.data;
};

export const getTourById = async (id: string): Promise<ISingleTour> => {
  const res = await axiosApi.get<ISingleTour>(`/tours/${id}`);
  return res.data;
};

export const getTourCategories = async (): Promise<TourCategoryType[]> => {
  const { data } = await axiosApi.get<TourCategoryType[]>('/tours/categories');
  return data;
};

export const getCountries = async (): Promise<string[]> => {
  const res = await axiosApi.get<string[]>('/tours/countries');
  return res.data || [];
};

const buildTourFormData = (data: TourMutation) => {
  const formData = new FormData();
  formData.append('title', data.title);
  formData.append('description', data.description);
  formData.append('countryCode', data.countryCode);
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
