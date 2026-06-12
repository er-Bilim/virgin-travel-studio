import axiosApi from "@/lib/axiosApi";
import type {IContactSettings} from "@/types/contactSettings";

export const getContactsSettings = async () => {
  const {data: contactsSettings} = await axiosApi<IContactSettings>(`/contact-settings`);

  return contactsSettings;
}