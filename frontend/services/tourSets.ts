import type {
  TourSetMutation,
  TourSetsFilters,
  TourSetsGetType,
  TourSetType,
} from '@/types/tourSets';
import axiosApi from '@/lib/axiosApi';

export const getTourSets = async (
  filters: TourSetsFilters,
): Promise<TourSetsGetType> => {
  const res = await axiosApi.get<TourSetsGetType>('/tour-sets', {
    params: filters,
  });
  return res.data;
};

export const getTourSetById = async (tourSetId: string) => {
  const res = await axiosApi.get<TourSetType>(`/tour-sets/${tourSetId}`);
  return res.data;
};

export const createTourSet = async (
  mutationData: TourSetMutation,
): Promise<TourSetType> => {
  const { data } = await axiosApi.post<{
    message: string;
    tourSet: TourSetType;
  }>('/tour-sets', mutationData);
  return data.tourSet;
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

export const deleteTourSet = async (id: string) => {
  const { data } = await axiosApi.delete(`/tour-sets/${id}`);
  return data;
};
