import type { ToursGetResponse } from "@/types/tour";
import axiosApi from "@/lib/axiosApi";

export const getTours = async (page: number, limit: number) => {
  const res = await axiosApi.get<ToursGetResponse>(`/tours/?page=${page}&limit=${limit}`);
  return res.data;
};
