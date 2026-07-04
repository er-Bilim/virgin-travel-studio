import axiosApi from '@/lib/axiosApi';
import type { AboutUsFields, AboutUsFieldsMutation } from '@/types/aboutUs';

export const getAboutUsData = async (): Promise<AboutUsFields> => {
  const result = await axiosApi.get('aboutUs/');
  return result.data;
};

export const postAboutUsData = async (
  data: AboutUsFieldsMutation,
): Promise<AboutUsFields> => {
  const result = await axiosApi.post('aboutUs/', data);
  return result.data;
};

export const putAboutUsData = async (
  data: AboutUsFieldsMutation,
): Promise<AboutUsFields> => {
  const result = await axiosApi.put('aboutUs/', data);
  return result.data;
};