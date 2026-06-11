import type {IUser, ManagerMutation, ManagerUpdateMutation} from '@/types/user';
import axiosApi from '@/lib/axiosApi';

export const getManagers = async (filters: {
  fullName?: string;
  status?: string;
} = {}) => {
  const res = await axiosApi.get<IUser[]>('/managers', {
    params: filters,
  });
  return res.data;
};

export const getOneManager = async (managerId: string) => {
  const res = await axiosApi.get<IUser>(`/managers/${managerId}`);
  return res.data;
};

export const createManager = async (data: ManagerMutation): Promise<IUser> => {
  const res = await axiosApi.post<{ message: string; user: IUser }>(
    '/managers',
    data,
  );
  return res.data.user;
};

export const updateManager = async (id: string, data: ManagerUpdateMutation): Promise<IUser> => {
  const res = await axiosApi.put<{ message: string; user: IUser }>(
    `/managers/${id}`,
    data,
  );
  return res.data.user;
};

export const deleteManager = async (id: string) => {
  const res = await axiosApi.delete(`/managers/${id}`);
  return res.data;
};
