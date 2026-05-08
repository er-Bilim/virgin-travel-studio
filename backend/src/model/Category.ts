import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';


const CategorySchema = new Schema(
  {
    title: {
      required: true,
      type: String,
      unique: true,
    },
    isPublished: {
        default: false,
        type: Boolean
    }
  },
  {
    timestamps: true,
  },
);

const Category = mongoose.model("Category", CategorySchema);

export default Category;