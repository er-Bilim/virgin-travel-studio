// будут кастомные хуки

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getMe, login, logout } from '@/services/auth';
import { createManager, deleteManager, getManagers } from '@/services/manager';

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

export const useCreateManager = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['managers'] });
        },
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