import axiosApi from "@/lib/axiosApi";
import type {NewsFields, NewsMutation} from "@/types/news";

export const createNews = async (data: NewsMutation) => {
  const formData = new FormData();
  const keys = Object.keys(data) as (keyof NewsMutation)[];

  keys.forEach((key) => {
    const value = data[key];

    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      formData.append(key, value.join(","));
    } else {
      formData.append(key, value);
    }
  })

  const response = await axiosApi.post("/news", formData);
  return response.data;
}

export const getNews = async () => {
  const response = await axiosApi.get<NewsFields[]>("/news");
  return response.data;
}

export const deleteNews = async (id: string) => {
  const response = await axiosApi.delete(`/news/${id}`);
  return response.data;
};

export const editNews = async ({id, data}: {
  id: string,
  data: NewsMutation
}) => {
  const formData = new FormData();
  const keys = Object.keys(data) as (keyof NewsMutation)[];

  keys.forEach((key) => {
    const value = data[key];

    if (value === null || value === undefined) {
      return;
    }

    if (Array.isArray(value)) {
      formData.append(key, value.join(","));
    } else {
      formData.append(key, value);
    }
  })

  const response = await axiosApi.patch(`/news/${id}/edit`, formData);
  return response.data;
};

export const publicateNews = async (id: string) => {
  const response = await axiosApi.patch(`/news/${id}/isPublished`);
  return response.data;
}

