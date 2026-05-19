import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const createFormData = (data: object): FormData => {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === null || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item))
    } else if (value instanceof File) {
      formData.append(key, value)
    } else {
      formData.append(key, String(value))
    }
  });

  return formData
};
