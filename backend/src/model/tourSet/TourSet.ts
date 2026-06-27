import mongoose, {Document, Model, Schema} from 'mongoose';
import type {TourSetFields} from '@/types/tourSets.types.js';

interface ITourSetMethods {
  hasAvailableSeats(): boolean;
}

interface ITourSetDocument extends Document, TourSetFields, ITourSetMethods {}
interface ITourSetModel extends Model<ITourSetDocument> {}

const TourSetSchema = new Schema<ITourSetDocument, ITourSetModel>(
  {
    tourId: {
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'ID тура обязателен'],
    },
    startDate: {
      type: Date,
      required: [true, 'Дата начала тура обязательна'],
    },
    endDate: {
      type: Date,
      required: [true, 'Дата окончания тура обязательна'],
    },
    price: {
      type: Number,
      required: [true, 'Цена обязательна'],
      min: [0, 'Цена не может быть отрицательной'],
    },
    hotelName: {
      type: String,
      required: [true, 'Название отеля обязательно'],
      trim: true,
    },
    hotelLocation: {
      type: String,
      required: [true, 'Локация отеля обязательна'],
    },
    airline: String,
    flightDetails: String,
    totalSeats: {
      type: Number,
      default: 20,
      min: [1, 'Минимум 1 место'],
    },
    bookedSeats: {
      type: Number,
      default: 0,
      min: [0, 'Количество забронированных мест не может быть отрицательным'],
      validate: {
        validator: function (value: number) {
          const doc = this as unknown as TourSetFields;
          return value <= doc.totalSeats;
        },
        message:
          'Количество забронированных мест не может превышать общее количество мест',
      },
    },
    isHot: {
      type: Boolean,
      default: false,
    },
    saleDeadline: Date,
    discountPrice: {
      type: Number,
    },
    status: {
      type: String,
      enum: {
        values: ['OPEN', 'CLOSED', 'FINISHED'],
        message: 'Недопустимый статус (возможны: OPEN, CLOSED, FINISHED)',
      },
      default: 'OPEN',
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

TourSetSchema.methods.hasAvailableSeats = function () {
    return this.bookedSeats < this.totalSeats;
};

const TourSet = mongoose.model<ITourSetDocument, ITourSetModel>('TourSet', TourSetSchema);
export default TourSet;
