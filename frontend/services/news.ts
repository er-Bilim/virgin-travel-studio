import axiosApi from '@/lib/axiosApi';
import type { NewsFields, NewsMutation, NewsData, INews, INewsTags } from '@/types/news';

export const createNews = async (data: NewsMutation) => {
  const formData = new FormData();
  const keys = Object.keys(data) as (keyof NewsMutation)[];

  keys.forEach((key) => {
    const value = data[key];

    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      formData.append(key, value.join(','));
    } else {
      formData.append(key, value);
    }
  });

  const response = await axiosApi.post<{
    message: string;
    news: NewsFields;
  }>('/news', formData);
  return response.data;
};

export const getNews = async (
  page: number,
  limit: number,
  searchText?: string,
  isPublished?: string,
  authorId?: string,
): Promise<NewsData> => {
  const params: Record<string, string | undefined | number> = {};

  if (searchText) params.searchTitle = searchText;
  if (isPublished && isPublished !== 'all') params.isPublished = isPublished;
  if (authorId && authorId !== 'all') params.authorId = authorId;
  params.page = Number(page);
  params.limit = Number(limit);

  const response = await axiosApi.get<NewsData>('/news', { params });
  return response.data;
};

export const getNewsById = async (newsId: string) => {
  const { data } = await axiosApi.get<INews>(`/news/${newsId}`);
  return data;
};

export const getNewsTags = async (): Promise<INewsTags> => {
  const { data } = await axiosApi.get<INewsTags>('/news/tags')
  return data;
}

export const deleteNews = async (id: string) => {
  const response = await axiosApi.delete<{ message: string }>(`/news/${id}`);
  return response.data;
};

export const editNews = async ({
  id,
  data,
}: {
  id: string;
  data: NewsMutation;
}) => {
  const formData = new FormData();
  const keys = Object.keys(data) as (keyof NewsMutation)[];

  keys.forEach((key) => {
    const value = data[key];

    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      formData.append(key, value.join(','));
    } else {
      formData.append(key, value);
    }
  });

  const response = await axiosApi.patch<{
    message: string;
    news: NewsFields;
  }>(`/news/${id}/edit`, formData);
  return response.data;
};

export const publicateNews = async (id: string) => {
  const response = await axiosApi.patch(`/news/${id}/isPublished`);
  return response.data;
};
