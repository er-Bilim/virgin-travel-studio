import mongoose, {Schema} from "mongoose";

const NewsSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Заголовок обязателен"],
      trim: true,
    },

    content: {
      type: String,
      required: [true, "Текст новости обязателен"],
    },

    image: {
      type: String,
      default: null,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    isPublished: {
      type: Boolean,
      default: false,
    },

    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const News = mongoose.model("News", NewsSchema);

export default News;