import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createFormData = (data: object): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item));
    } else if (value instanceof File) {
      formData.append(key, value);
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
};

export const formatDateToWords = (date: string): string => {
  dayjs.locale('ru');
  const formatDate = dayjs(date);

  const monthName = formatDate.format('MMMM');
  return monthName;
};

export const getDayMonth = (date: string) => {
  const formatDate = dayjs(date);

  const day = formatDate.format('D');
  return day;
};

export const getYearFullNumber = (date: string) => {
  const formatDate = dayjs(date);

  const year = formatDate.format('YYYY');
  return year;
};

export const formatToReadablePrice = (price: number): string => {
  const formattedPrice = new Intl.NumberFormat('ru-KG', {
    style: 'currency',
    currency: 'KGS',
    minimumFractionDigits: 0,
  }).format(price);
  return formattedPrice;
};

export const isJsonBlob = (blob: Blob): boolean => {
  return blob.type.includes("application/json");
}

export const parseBlobError = async (blob: Blob): Promise<{ message?: string; error?: string }> => {
  const text = await blob.text();
  return JSON.parse(text) as { message?: string; error?: string };
}

export const downloadBlobFile = (params: {
  blob: Blob;
  filename?: string;
  disposition?: string;
  defaultName?: string;
}) => {
  const url = window.URL.createObjectURL(params.blob);

  const link = document.createElement("a");
  link.href = url;

  const extracted =
      params.disposition?.match(/filename="?(.+?)"?$/)?.[1];

  link.download =
      extracted ??
      params.filename ??
      params.defaultName ??
      "download";

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
}
