import mongoose, { Schema } from 'mongoose';

const CategorySchema = new Schema(
    {
        title: {
            required: [true, "Название категории обязательно"],
            type: String,
            unique: true,
            trim: true,
            match: [/\p{L}|\s/u, "Название категории должно содержать только буквы"],
            minlength: [3, "Название категории должно быть минимум 3 символа"],
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

const Category = mongoose.model('Category', CategorySchema);

export default Category;
