// будут кастомные хуки// будут кастомные хуки

import { useQuery } from "@tanstack/react-query";

import { getTours } from "@/services/tours";

export const useTours = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['tours', page, limit], // При изменении page запрос перезапустится
    queryFn: () => getTours(page, limit), // Ваша функция запроса должна принимать page
    placeholderData: (previousData) => previousData, // Чтобы интерфейс не "мигал" при смене страниц
  });
};
