import axiosApi from '@/lib/axiosApi';
import type { IUser, LoginMutation, LoginResponse } from '@/types/user';

export const getMe = async () => {
    const res = await axiosApi.get<IUser>('/users/me');

    return res.data;
};

export const login = async (data: LoginMutation): Promise<LoginResponse> => {
    const res = await axiosApi.post<LoginResponse>('/users/sessions', data);

    return res.data;
};

export const logout = async () => {
    const res = await axiosApi.delete('/users/sessions');

    return res.data;
};