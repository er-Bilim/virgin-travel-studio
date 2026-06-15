import mongoose, { type Model, Document } from 'mongoose';

export interface FaqDocument extends Document {
  question: string;
  answer: string;
  isPublished: boolean;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const faqSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Вопрос обязателен для заполнения'],
      trim: true,
    },
    answer: {
      type: String,
      required: [true, 'Ответ обязателен для заполнения'],
      trim: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    order: {
      type: Number,
    },
  },
  {
    timestamps: true,
  },
);

faqSchema.index({ order: 1, createdAt: -1 });

faqSchema.pre<FaqDocument>('save', async function () {
  if (!this.isNew || this.order !== undefined) {
    return;
  }

  const lastFaq = await (this.constructor as Model<FaqDocument>)
    .findOne()
    .sort({ order: -1 });

  if (lastFaq && typeof lastFaq.order === 'number') {
    this.order = lastFaq.order + 1;
  } else {
    this.order = 1;
  }
});

const Faq = mongoose.model('Faq', faqSchema);
export default Faq;
