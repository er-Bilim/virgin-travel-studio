import {type ClassValue, clsx} from 'clsx';
import {twMerge} from 'tailwind-merge';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import countries from './countries';
import type {DateRange} from 'react-day-picker';
import type {AllowedImageMimeType, ImageValidationResult} from '@/types/multiImage';
import {IMAGE_UPLOAD} from '@/lib/constants';
import imageCompression from 'browser-image-compression';

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

export const formatDayAndMonthWords = (date: string, isSlice?: boolean): {
  day: string,
  month: string,
  year: string
} => {
  const formatDate = dayjs(date).locale('ru');

  const fullDate = formatDate.format('D MMMM');
  const year = formatDate.format('YYYY');
  const [day, month] = fullDate.split(' ');

  if (isSlice) {
    const sliceMonth: string = month.slice(0, 3);
    return {
      day,
      month: sliceMonth,
      year,
    }
  }

  return {day, month, year}
}

export const formatToReadablePrice = (
  priceParam: number,
): { price: string; currency: string } => {
  const formattedPrice = new Intl.NumberFormat('ru-KG', {
    style: 'currency',
    currency: 'KGS',
    minimumFractionDigits: 0,
  }).format(priceParam);

  const price: string = formattedPrice.slice(0, -3);
  const currency: string = formattedPrice.slice(-3);

  return {
    price,
    currency,
  };
};

export const isJsonBlob = (blob: Blob): boolean => {
  return blob.type.includes('application/json');
};

export const parseBlobError = async (
  blob: Blob,
): Promise<{ message?: string; error?: string }> => {
  const text = await blob.text();
  return JSON.parse(text) as { message?: string; error?: string };
};

export const downloadBlobFile = (params: {
  blob: Blob;
  filename?: string;
  disposition?: string;
  defaultName?: string;
}) => {
  const url = window.URL.createObjectURL(params.blob);

  const link = document.createElement('a');
  link.href = url;

  const extracted = params.disposition?.match(/filename="?(.+?)"?$/)?.[1];

  link.download =
    extracted ?? params.filename ?? params.defaultName ?? 'download';

  document.body.appendChild(link);
  link.click();
  link.remove();

  window.URL.revokeObjectURL(url);
};

export const truncateText = (text: string, maxLength: number) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const pluralize = (
  number: number,
  one: string,
  few: string,
  many: string,
): string => {
  const absoluteNum: number = Math.abs(number) % 100;
  const lastAbsoluteNum: number = absoluteNum % 10;

  if (absoluteNum > 10 && absoluteNum < 20) return `${many}`;
  if (lastAbsoluteNum === 1) return `${one}`;
  if (lastAbsoluteNum >= 2 && lastAbsoluteNum <= 4) return `${few}`;

  return `${many}`;
};

export const formatDate = (date: string): string => {
  return dayjs(date).locale('ru').format('D MMMM YYYY');
};

 export const isValidReportDate = (date?: DateRange): string | null => {
    if (!date?.from || !date?.to) {
      return 'Выберите дату';
    }

    const maxRangeMs = 1000 * 60 * 60 * 24 * 31 * 3;
    const diff = date?.to.getTime() - date?.from.getTime();

    if (diff > maxRangeMs) {
      return 'Диапазон дат слишком большой (максимум 3 месяца)';
    }

    return null;
  };

export const getCountryOptions = (): { code: string, name: string }[] => {
  const countryOptions = Object.entries(countries.getNames('ru', {select: 'official'})).map(([code, name]) => ({
    code: countries.alpha2ToAlpha3(code) ?? code,
    name
  })).sort((a, b) => a.name.localeCompare(b.name));


  return countryOptions;
}

export const validateImageFile = (file: File): ImageValidationResult => {
  if (!IMAGE_UPLOAD.ALLOWED_MIME_TYPES.includes(file.type as AllowedImageMimeType)) {
    return { valid: false, error: 'Допустимые форматы: JPEG, PNG, WEBP' };
  }

  if (file.size > IMAGE_UPLOAD.MAX_FILE_SIZE_BYTES) {
    const maxMb = IMAGE_UPLOAD.MAX_FILE_SIZE_BYTES / (1024 * 1024);
    return { valid: false, error: `Файл больше ${maxMb} МБ` };
  }

  return { valid: true };
}

export const compressImage = async (file: File): Promise<File> => {
  try {
    const compressed = await imageCompression(file, {
      maxSizeMB: IMAGE_UPLOAD.COMPRESSION.MAX_SIZE_MB,
      maxWidthOrHeight: IMAGE_UPLOAD.COMPRESSION.MAX_WIDTH_OR_HEIGHT,
      useWebWorker: true,
      fileType: 'image/jpeg',
    });

    if (compressed.size >= file.size) return file;

    return compressed;
  } catch {
    throw new Error('Не удалось обработать файл — возможно, он повреждён');
  }
};

export const getFileKey = (item: File | string): string =>
  typeof item === 'string' ? item : `${item.name}-${item.size}-${item.lastModified}`;