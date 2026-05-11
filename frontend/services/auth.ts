import type {IUser, LoginMutation, LoginResponse} from "@/types/user";
import axiosApi from "@/lib/axiosApi";


export const getMe = async () => {
    const res = await axiosApi.get<IUser>("/users/me");

    return res.data;
};

export const login = async (data:  LoginMutation ): Promise<LoginResponse> => {
    const res = await axiosApi.post("/users/sessions", data);
    return res.data;
};