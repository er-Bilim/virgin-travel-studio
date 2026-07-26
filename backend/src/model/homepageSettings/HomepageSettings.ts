import { Schema, model } from 'mongoose';
import type { HomepageSettingsFields } from '@/types/homepageSettings.types.js';


const AdvantageSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    body: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
      type: String,
      default: null,
    }
});


const HomepageSettingsSchema = new Schema<HomepageSettingsFields>(
  {
    hero: {
      videoUrl: {
        type: String,
      },
      title: {
        type: String,
        required: [true, 'Главный заголовок на видео обязателен'],
      },
      subtitle: {
        type: String,
      },
    },

    advantages: {
      type: [AdvantageSchema],
      default: []
    },

    mainPopularTours: {
      title: {
        type: String,
        required: [true, 'Заголовок секции популярных туров обязателен'],
      },
      subtitle: {
        type: String,
      },
    },

    mainLatestNews: {
      title: {
        type: String,
        required: [true, 'Заголовок секции новостей обязателен'],
      },
      subtitle: {
        type: String,
      },
    },

    toursPage: {
      badge: {
        type: String,
        required: [true, 'Малый заголовок (бейдж) страницы туров обязателен'],
      },
      title: {
        type: String,
        required: [true, 'Главный заголовок страницы туров обязателен'],
      },
      subtitle: {
        type: String,
      },
    },

    newsPage: {
      badge: {
        type: String,
        required: [
          true,
          'Малый заголовок (бейдж) страницы новостей обязателен',
        ],
      },
      title: {
        type: String,
        required: [true, 'Главный заголовок страницы новостей обязателен'],
      },
      subtitle: {
        type: String,
      },
    },

    reviewsPage: {
      title: {
        type: String,
        required: [true, 'Главный заголовок страницы рейтинга обязателен']
      },
      subtitle: {
        type: String
      }
    }
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

const HomepageSettings = model<HomepageSettingsFields>(
  'HomepageSettings',
  HomepageSettingsSchema,
);

export default HomepageSettings;
