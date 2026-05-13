// будут кастомные хуки

import {useMutation, useQueryClient} from '@tanstack/react-query';
import {createManager, deleteManager} from '@/services/manager';

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


