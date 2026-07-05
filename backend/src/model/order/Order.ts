import mongoose, { Schema, Types } from 'mongoose';
import type { IOrder } from '@/types/orders.types.js';

const OrderSchema = new Schema(
  {
    type: {
      type: String,
      enum: ['STANDARD', 'CUSTOM'],
      default: 'STANDARD',
      required: true,
    },

    tourSetId: {
      type: Types.ObjectId,
      ref: 'TourSet',
      required: function (this: IOrder) {
        return this.type === 'STANDARD';
      },
    },
    visibleId: {
      type: String,
      unique: true,
      required: true,
    },
    clientName: {
      type: String,
      required: [true, 'Имя клиента обязательно'],
      trim: true,
    },
    clientPhone: {
      type: String,
      required: [true, 'Номер телефона обязателен'],
      trim: true,
      match: [
        /^\+?[0-9]{7,15}$/,
        'Пожалуйста, введите корректный номер телефона',
      ],
    },
    status: {
      type: String,
      required: true,
      enum: {
        values: [
          'NEW',
          'IN_PROGRESS',
          'CONTRACT_PENDING',
          'COMPLETED',
          'REJECTED',
        ],
        message: 'Недопустимый статус',
      },
      default: 'NEW',
    },
    rejectionReason: {
      type: String,
      trim: true,
      minLength: [3, 'Причина отказа должна быть не менее 3 символов'],
      validate: {
        validator: function (this: IOrder, value: string | null) {
          if (this.status === 'REJECTED') {
            return value !== null && value.trim().length > 0;
          }
          return true;
        },
        message: 'Причина отказа обязательна, если установлен статус REJECTED',
      },
    },
    managerId: {
      type: Types.ObjectId,
      ref: 'User',
    },
    paymentMethod: {
      type: String,
      enum: {
        values: [
          'CASH',
          'CARD',
          'QR',
          'BANK',
        ],
        message: 'Недопустимый способ оплаты',
      },
      validate: {
        validator: function (this: IOrder, v: string | undefined) {
          if (v && (this.paymentAmount === undefined || this.paymentAmount <= 0)) {
            return false;
          }
          if (!v && (this.paymentAmount !== undefined && this.paymentAmount !== null)) {
            return false;
          }
          return true;
        },
        message: 'Сумма оплаты обязательна и должна быть больше 0, если указан способ оплаты. Способ оплаты не может быть указан без суммы.',
      },
    },
    paymentAmount: {
      type: Number,
      min: [0, 'Сумма оплаты не может быть отрицательной'],
      validate: {
        validator: function (this: IOrder, v: number | undefined) {
          if ((v !== undefined && v !== null) && !this.paymentMethod) {
            return false;
          }
          return true;
        },
        message: 'Способ оплаты обязателен, если указана сумма оплаты.',
      },
    },

    customTour: {
      type: {
        countryCode: {
          type: String,
          uppercase: true,
          trim: true,
          match: [/^[A-Z]{2}$/, 'Код страны в формате ISO (например KG, AE)'],
        },
        startDate: Date,
        endDate: Date,
        hotel: { type: String, trim: true },
        description: { type: String, trim: true },
      },
      required: function (this: IOrder) {
        return this.type === 'CUSTOM';
      },
      validate: {
        validator: function (this: IOrder, value: unknown) {
          if (this.type === 'STANDARD') return value == null;
          return true;
        },
        message: 'Обычная заявка не должна содержать customTour',
      },
    },
  },
  {
    timestamps: true,
  },
);

const Order = mongoose.model<IOrder>('Order', OrderSchema);
export default Order;
