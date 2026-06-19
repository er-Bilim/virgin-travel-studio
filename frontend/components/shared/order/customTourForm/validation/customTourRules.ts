import type { CustomTourMutation } from '@/types/order';
import type { RegisterOptions } from 'react-hook-form';

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
  setValueAs: (value: string) => value.replace(/[\s()-]/g, ''),
  pattern: {
    value: /^\+?[0-9]{10,15}$/,
    message: 'Неверный формат номер телефона',
  },
} satisfies RegisterOptions<CustomTourMutation, 'clientPhone'>;
