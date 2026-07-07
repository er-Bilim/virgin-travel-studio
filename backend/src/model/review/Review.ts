import {Model, model, Schema, Types} from 'mongoose';
import type {ReviewFields} from '@/types/reviews.types.js';

interface IReviewModel extends Model<ReviewFields> {
  calculateAverageRating(tourId: Types.ObjectId): Promise<void>;
}

const ReviewSchema = new Schema<ReviewFields>(
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
      type: [Schema.Types.ObjectId],
      default: [],
    },

    companyReply: {
      type: String,
      default: null,
    },

    isModerated: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    featuredOnHomepage: {
      type: Boolean,
      default: false,
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

ReviewSchema.statics.calculateAverageRating = async function (tourId) {
  const stats = await this.aggregate([
    {$match: {tourId: tourId, isModerated: "approved"}},

    {
      $group: {
        _id: '$tourId',
        countRating: {$sum: 1},
        avgRating: {$avg: '$rating'},
      },
    },
  ]);

  const update =
    stats.length > 0
      ? {
        rating: Number(stats[0].avgRating.toFixed(1)),
        ratingCount: stats[0].countRating,
      }
      : {
        rating: 0,
        ratingCount: 0,
      };

  await model('Tour').findByIdAndUpdate(tourId, update);
};

ReviewSchema.post('save', async function () {
  const Review = this.constructor as IReviewModel;

  await Review.calculateAverageRating(this.tourId);
});

ReviewSchema.post('findOneAndUpdate', async function (doc) {
  if (!doc) return;

  await (doc.constructor as IReviewModel).calculateAverageRating(doc.tourId);
});

ReviewSchema.post('findOneAndDelete', async function (doc) {
  if (!doc) return;

  await (doc.constructor as IReviewModel).calculateAverageRating(doc.tourId);
});

const Review = model<ReviewFields, IReviewModel>(
  'Review',
  ReviewSchema,
);

export default Review;