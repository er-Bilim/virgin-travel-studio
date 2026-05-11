// будут кастомные хуки

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {getMe, login} from "@/api/auth";
import {createManager, deleteManager, getManagers} from "@/api/manager";


export const useUser = () => {
    return useQuery({
        queryKey: ["me"],
        queryFn: getMe,
        retry: false,
    });
};

export const useManagers = () => {
    return useQuery({
        queryKey: ["managers"],
        queryFn: getManagers,
    });
};

export const useCreateManager = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["managers"] });
        },
    });
};

export const useDeleteManager = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteManager,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["managers"] });
        },
    });
};

export const useLogin = () => {
    return useMutation({
        mutationFn: login,
    });
};