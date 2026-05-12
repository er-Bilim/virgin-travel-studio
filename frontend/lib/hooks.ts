// будут кастомные хуки

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getMe, login, logout } from '@/services/auth';
import { createManager, deleteManager, getManagers } from '@/services/manager';

import type {AxiosError} from "axios";
import type {GlobalError} from "@/types/error";
import type {UseFormSetError} from "react-hook-form";
import type {IUser, ManagerMutation} from "@/types/user";
import {toast} from "sonner";


export const useUser = () => {
    return useQuery({
        queryKey: ['me'],
        queryFn: getMe,
        retry: false,
    });
};

export const useManagers = () => {
    return useQuery({
        queryKey: ['managers'],
        queryFn: getManagers,
    });
};

export const useCreateManager = (setError: UseFormSetError<ManagerMutation>) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createManager,
        onSuccess: async (newManager) => {
            toast.success('Менеджер успешно создался!')
            queryClient.setQueryData<IUser[]>(['managers'], (old = []) => {
                return [newManager, ...old];
            });
        },
        onError: (err: AxiosError<GlobalError>) => {
            const data = err.response?.data;

            if (!data) return;

            if ("details" in data && data.details) {
                Object.entries(data.details).forEach(([field, value]) => {
                    setError(field as keyof ManagerMutation, {
                        type: "server",
                        message: value.message,
                    });
                });
                return;
            }

            toast.error(data.error);
        }
    });
};

export const useDeleteManager = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['managers'] });
        },
    });
};

export const useLogin = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: login,
        onSuccess: (data) => {
            queryClient.setQueryData(['me'], data.user);
        },
    });
};

export const useLogout = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: logout,
        onSettled: () => {
            queryClient.clear();
        },
    });
};