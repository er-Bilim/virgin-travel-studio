import mongoose, {Schema} from 'mongoose';
import isValidCountry from '../../utils/countryCode/countryCode.js';

const TourSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Название тура обязательно для заполнения'],
      trim: true,
    },
     countryCode: {
        type: String,
         required: [true, 'Код страны обязателен для заполнения'],
         uppercase: true,
         trim: true,
         match: [/^[A-Z]{3}$/, 'Код страны должен состоять из 3 букв'],
         validate: {
            validator: function (value: string) {
              return isValidCountry(value)
            },
            message: 'Код страны неверный, введите из списка'
        }
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
