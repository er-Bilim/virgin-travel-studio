import type { CustomTourMutation } from '@/types/order';
import type { RegisterOptions } from 'react-hook-form';
import { isValidPhoneNumber } from 'libphonenumber-js';

const normalizePhone = (value: string) => {
  const cleaned = value.replace(/[\s()-]/g, '');
  if (!cleaned) return cleaned;
  return cleaned.startsWith('+') ? cleaned : `+996${cleaned.replace(/^0/, '')}`;
};

export const countryCodeRule = {
  required: 'Выберите направление',
} satisfies RegisterOptions<CustomTourMutation, 'countryCode'>;

export const startDateRule = {
  required: 'Выберите дату начала',
} satisfies RegisterOptions<CustomTourMutation, 'startDate'>;

export const endDateRule = {
  required: 'Выберите дату конца',
} satisfies RegisterOptions<CustomTourMutation, 'endDate'>;

export const clientNameRule = {
  required: 'Пожалуйста, введите ваше имя',
  pattern: {
    value: /^\p{L}+(?:[ '\-]\p{L}+)*$/u,
    message: 'Имя может содержать только буквы и пробелы между словами',
  },
} satisfies RegisterOptions<CustomTourMutation, 'clientName'>;

export const clientPhoneRule = {
  required: 'Пожалуйста, введите корректный номер',
  setValueAs: normalizePhone,
  validate: (value) => {
    return (
      isValidPhoneNumber(value) ||
      'Введите корректный номер телефона, например +996 123 456 789'
    );
  },
} satisfies RegisterOptions<CustomTourMutation, 'clientPhone'>;
