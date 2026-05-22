import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
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
