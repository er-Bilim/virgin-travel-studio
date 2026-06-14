import axiosApi from "@/lib/axiosApi"
import type { ContactSettingsFields } from "@/types/contactSettings";

export const fetchContacts = async () => {
  const result =
  await axiosApi.get<ContactSettingsFields>('/contact-settings/');
  return result.data;
}

export const createContacts = async (data: ContactSettingsFields) => {
  const result = await axiosApi.post<ContactSettingsFields>(
    '/contact-settings/',
    data,
  );
  return result.data;
};

export const editContacts = async (data: ContactSettingsFields) => {
  const result =
    await axiosApi.put<ContactSettingsFields>('/contact-settings/', data);
  return result.data;
};