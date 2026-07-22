import type {IUser, ManagerMutation, ManagerPasswordMutation, ManagerUpdateMutation} from '@/types/user';
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

export const setStatusManager = async (id: string) => {
  const res = await axiosApi.patch(`/managers/${id}`);
  return res.data;
};

export const changeManagerPassword = async (
  id: string,
  data: Pick<ManagerPasswordMutation, 'password'>,
): Promise<{ message: string }> => {
  const res = await axiosApi.patch<{ message: string }>(
    `/managers/${id}/password`,
    data,
  );
  return res.data;
};