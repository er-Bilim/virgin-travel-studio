import {useQuery} from "@tanstack/react-query";
import {getContactsSettings} from "@/services/contactsSettings";
import type {GetNewsParams} from "@/types/news";
import {getNews} from "@/services/news";

export const useGetContactsSettings = () => {
  return useQuery({
    queryKey: ["contactSettings"],
    queryFn: getContactsSettings
  })
}

export const useNews = ({page, limit, searchText, isPublished, authorId, tags}: GetNewsParams) => {
  return useQuery({
    queryKey: ['news', page, limit, searchText, isPublished, authorId, tags],
    queryFn: () => getNews({page, limit, searchText, isPublished, authorId, tags}),
  });
};