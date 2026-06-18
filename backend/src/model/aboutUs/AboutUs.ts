import mongoose, {Schema} from 'mongoose';

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
    ideaLabel:       { type: String, trim: true }, // "НАША ИДЕЯ"
    ideaTitle:       { type: String, trim: true },
    ideaDescription: { type: String, trim: true },

    // Мини-карточки Ориентир / Прозрачность
    ideaBlocks: { type: [ContentBlockSchema], default: [] },

    // Шаги
    heroCardTitle: { type: String, trim: true },
    heroCardBody: { type: String, trim: true },
    steps: { type: [String], default: [] },

    imageUrl: { type: String, default: null },
}, { timestamps: true });

const AboutUs = mongoose.model('AboutUs', AboutUsSchema);
export default AboutUs;