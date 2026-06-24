import { model, Schema } from 'mongoose';
import type { ContactSettingsFields } from '@/types/contactSettings.types.js';

const TimeRangeSchema = new Schema(
  {
    from: {
      type: String,
      default: '09:00',
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
    to: {
      type: String,
      default: '18:00',
      match: /^([01]\d|2[0-3]):([0-5]\d)$/,
    },
  },
  { _id: false },
);

const WeekendSchema = new Schema(
  {
    isClosed: { type: Boolean, default: false },
    from: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
    to: { type: String, match: /^([01]\d|2[0-3]):([0-5]\d)$/ },
  },
  { _id: false },
);

const ContactSettingsSchema = new Schema<ContactSettingsFields>(
  {
    phone: {
      type: String,
      required: [true, 'Введите номер телефона'],
      unique: true,
      trim: true,
      match: [/^\+?[0-9]{7,15}$/, 'Некорректный номер телефона'],
    },
    email: {
      type: String,
      required: [true, 'Адрес электронной почты обязателен'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\s*[\w\-\.]+@([\w\-]+\.)+[\w\-]{2,4}\s*$/,
        'Некорректный адрес электронной почты',
      ],
    },
    address: {
      type: String,
      required: [true, 'Адрес компании обязателен'],
      trim: true,
    },
    whatsapp: { type: String, trim: true },
    telegram: { type: String, trim: true },
    instagram: { type: String, trim: true },
    facebook: { type: String, trim: true },
    mapEmbedUrl: { type: String, trim: true },
    workingHours: {
      weekdays: { type: TimeRangeSchema, default: () => ({}) },
      saturday: {
        type: WeekendSchema,
        default: () => ({ isClosed: false, from: '09:00', to: '18:00' }),
      },
      sunday: {
        type: WeekendSchema,
        default: () => ({ isClosed: true, from: '', to: '' }),
      },
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const ContactSettings = model('ContactSettings', ContactSettingsSchema);
export default ContactSettings;
