import type {
  TourSetMutation,
  TourSetsGetType,
  TourSetType,
} from '@/types/tourSets';
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

export const createTourSet = async (
  mutationData: TourSetMutation,
): Promise<TourSetType> => {
  const { data } = await axiosApi.post<TourSetType>('/tour-sets', mutationData);
  return data;
};

export const updateTourSet = async (
  id: string,
  mutationData: Partial<TourSetMutation>,
): Promise<TourSetType> => {
  const { data } = await axiosApi.patch<{ tourSet: TourSetType }>(
    `/tour-sets/${id}`,
    mutationData,
  );
  return data.tourSet;
};
