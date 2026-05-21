import mongoose, { Schema } from 'mongoose';

const TourSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Название тура обязательно для заполнения'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Описание тура обязательно для заполнения'],
    },
    images: {
      type: [String],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Тур должен быть привязан к категории'],
    },
    baseAdvantages: {
      type: [String],
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Review',
      },
    ],
    rating: {
      type: Number,
      default: 0
    },
    ratingCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true,
  },
);

const Tour = mongoose.model('Tour', TourSchema);

export default Tour;
