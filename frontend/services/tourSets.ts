import type { TourSetsGetType, TourSetType } from '@/types/tourSets';
import axiosApi from '@/lib/axiosApi';

export const getTourSets = async (page: number, limit: number) => {
  const res = await axiosApi.get<TourSetsGetType>(
    `/tour-sets/?page=${page}&limit=${limit}`,
  );
  return res.data;
};

export const getTourSetById = async (tourSetId: string) => {
  const res = await axiosApi.get<TourSetType>(`/tour-sets/${tourSetId}`);
  return res.data;
};