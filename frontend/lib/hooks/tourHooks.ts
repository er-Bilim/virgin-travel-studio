// будут кастомные хуки// будут кастомные хуки

import { useQuery } from "@tanstack/react-query";

import { getTours } from "@/services/tours";

export const useTours = () => {
  return useQuery({
    queryKey: ["tours"],
    queryFn: getTours,
    retry: false,
  });
};
