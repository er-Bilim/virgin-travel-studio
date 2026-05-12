import type { TourType } from "@/types/tour";
import axiosApi from "@/lib/axiosApi";

export const getTours = async () => {
  const res = await axiosApi.get<TourType[]>("/tours/");
  if (res.data) return res.data;
  return [];
};
