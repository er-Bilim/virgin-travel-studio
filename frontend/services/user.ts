import axiosApi from "@/lib/axiosApi";
import type {IUser} from "@/types/user";

export const getUsers = async () => {
  const res = await axiosApi.get<IUser[]>('/users');
  return res.data;
};