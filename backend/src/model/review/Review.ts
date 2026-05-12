import mongoose, { Schema } from 'mongoose';
import { ReviewDocument } from '@/types/reviews.types.js';

const ReviewSchema = new Schema<ReviewDocument>(
  {
    clientName: {
      type: String,
      required: [true, 'Пожалуйста, введите ваше имя'],
      trim: true,
    },
    tourId: {
      type: Schema.Types.ObjectId,
      ref: 'Tour',
      required: [true, 'ID тура обязателен'],
    },
    rating: {
      type: Number,
      required: [true, 'Поставьте оценку'],
      min: [1, 'Рейтинг не может быть меньше 1'],
      max: [5, 'Рейтинг не может быть больше 5'],
    },
    comment: {
      type: String,
      required: [true, 'Напишите текст отзыва'],
    },
    image: {
      type: String,
      default: null,
    },
    isModerated: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const Review = mongoose.model<ReviewDocument>('Review', ReviewSchema);
export default Review;
