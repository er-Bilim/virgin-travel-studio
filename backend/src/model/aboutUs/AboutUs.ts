import mongoose, {Document, Schema} from 'mongoose';
import type {AboutUsFields} from '@/types/aboutUs.types.js';

export interface AboutUsDocument extends AboutUsFields, Document {}

const ContentBlockSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    body: {
        type: String,
        required: true,
        trim: true,
    }
}, { _id: false });

const AboutUsSchema = new Schema({
    // Главная секция
    pageTitle:   { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },

    // Карточки "Надёжность / Забота / Выбор"
    contentBlocks: { type: [ContentBlockSchema], default: [] },

    // Левая карточка
    missionTitle: { type: String, trim: true },
    missionBody:  { type: String, trim: true },

    // Правая карточка "Наша идея"
    ideaLabel:       { type: String, trim: true },
    ideaTitle:       { type: String, trim: true },
    ideaDescription: { type: String, trim: true },

    // Мини-карточки Ориентир / Прозрачность
    ideaBlocks: { type: [ContentBlockSchema], default: [] },

    // Шаги
    heroCardTitle: { type: String, trim: true },
    heroCardBody: { type: String, trim: true },
    steps: { type: [String], default: [] },

}, { timestamps: true });

const AboutUs = mongoose.model<AboutUsDocument>('AboutUs', AboutUsSchema);
export default AboutUs;