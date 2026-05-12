import type { IUser, ManagerMutation } from '@/types/user';
import axiosApi from '@/lib/axiosApi';

export const getManagers = async () => {
  const res = await axiosApi.get<IUser[]>('/managers');
  return res.data;
};

export const createManager = async (data: ManagerMutation): Promise<IUser> => {
  const res = await axiosApi.post<{ message: string; user: IUser }>(
    '/managers',
    data,
  );
  return res.data.user;
};

export const deleteManager = async (id: string) => {
  const res = await axiosApi.delete(`/managers/${id}`);
  return res.data;
};
