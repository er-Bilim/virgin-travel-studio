import mongoose, { Schema, Model, HydratedDocument } from 'mongoose';


const CategorySchema = new Schema(
  {
    title: {
      required: true,
      type: String,
      unique: true,
      trim: true,
      match: [
        /^[A-Za-zА-Яа-яЁё ]+$/,
        'The category name must contain only letters',
      ],
      minlength: [3, 'The category name must be at least 3 characters long.'],
    },
    isPublished: {
      default: false,
      type: Boolean,
    },
  },
  {
    timestamps: true,
  },
);

const Category = mongoose.model("Category", CategorySchema);

export default Category;