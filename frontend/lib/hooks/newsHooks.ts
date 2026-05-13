import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {
  createNews,
  deleteNews,
  editNews,
  getNews,
  publicateNews
} from "@/services/news";

export const useCreateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  })
}

export const useNews = () => {
  return useQuery({
    queryKey: ['news'],
    queryFn: getNews,
  });
};

export const useDeleteNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });
};

export const useEditNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: editNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    }
  })
}

export const usePublicateNews = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: publicateNews,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    }
  })
}