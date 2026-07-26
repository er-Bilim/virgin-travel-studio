import axiosApi from '@/lib/axiosApi';
import type { IContactSettings } from '@/types/contactSettings';

export const fetchContacts = async () => {
  const result = await axiosApi.get<IContactSettings>('/contact-settings/');
  return result.data;
};

export const createContacts = async (data: FormData) => {
  const result = await axiosApi.post<IContactSettings>(
      '/contact-settings/',
      data,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
  );

  return result.data;
};

export const editContacts = async (data: FormData) => {
  const result = await axiosApi.put<IContactSettings>(
      '/contact-settings/',
      data,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
      },
  );

  return result.data;
};