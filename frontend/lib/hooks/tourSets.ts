// будут кастомные хуки// будут кастомные хуки

import { useQuery } from '@tanstack/react-query';
import { getTourSets, getTourSetById } from '@/services/tourSets';

export const useTourSets = (page: number, limit: number) => {
  return useQuery({
    queryKey: ['tourSets', page, limit], // При изменении page запрос перезапустится
    queryFn: () => getTourSets(page, limit), // Ваша функция запроса должна принимать page
    placeholderData: (previousData) => previousData, // Чтобы интерфейс не "мигал" при смене страниц
  });
};

export const useOneTourSet = (tourSetId: string) => {
  return useQuery({
    queryKey: ['tourSet', tourSetId],
    queryFn: () => getTourSetById(tourSetId),
    staleTime: 1000 * 60 * 5,
  });
};
