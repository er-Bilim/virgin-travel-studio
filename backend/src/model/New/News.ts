import mongoose, {Schema} from "mongoose";
import User from "@/model/user/User.js";

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
      validate: {
        validator: async function (userId: string) {
          const user = await User.exists({_id: userId});

          return !!user;
        },
        message: "Указанный автор не существует в базе данных"
      }
    },
  },
  {
    timestamps: true,
  }
);

const News = mongoose.model("News", NewsSchema);

export default News;