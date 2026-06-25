import express from 'express';
import auth from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import mongoose from 'mongoose';
import deleteFile from '@/utils/deleteFile.js';
import { imagesUpload, videosUpload } from '@/middlewares/multer.js';
import HomepageSettings from '@/model/homepageSettings/HomepageSettings.js';

const homepageSettingsRouter = express.Router();

homepageSettingsRouter.get('/', async (_req, res, next) => {
  try {
    const settings = await HomepageSettings.findOne();

    res.send(settings);
  } catch (e) {
    next(e);
  }
});

homepageSettingsRouter.post(
  '/',
  auth,
  permit('ADMIN'),
  videosUpload.single('video'),
  async (req, res, next) => {
    try {
      const existingSettings = await HomepageSettings.findOne();
      if (existingSettings) {
        if (req.file) await deleteFile(`videos/${req.file.filename}`);
        return res.status(400).send({
          error: 'Ошибка конфигурации',
          details:
            'Запись настроек главной страницы уже существует. Используйте метод PUT для обновлений.',
        });
      }

      const { hero, advantages, mainPopularTours, mainLatestNews, toursPage, newsPage } =
        req.body;
      const videoUrl = req.file
        ? `videos/${req.file.filename}`
        : hero?.videoUrl || '';

      const settings = new HomepageSettings({
        hero: hero
          ? { videoUrl, title: hero.title, subtitle: hero.subtitle }
          : undefined,
        advantages,
        mainPopularTours: mainPopularTours
          ? {
              title: mainPopularTours.title,
              subtitle: mainPopularTours.subtitle,
            }
          : undefined,
        mainLatestNews: mainLatestNews
          ? { title: mainLatestNews.title, subtitle: mainLatestNews.subtitle }
          : undefined,
        toursPage: toursPage
          ? {
              badge: toursPage.badge,
              title: toursPage.title,
              subtitle: toursPage.subtitle,
            }
          : undefined,
        newsPage: newsPage
          ? {
              badge: newsPage.badge,
              title: newsPage.title,
              subtitle: newsPage.subtitle,
            }
          : undefined,
      });

      await settings.save();
      res.send(settings);
    } catch (e) {
      if (req.file) await deleteFile(`videos/${req.file.filename}`);
      if (e instanceof mongoose.Error.ValidationError) {
        return res
          .status(400)
          .send({ error: 'Ошибка валидации', details: e.errors });
      }
      next(e);
    }
  },
);

homepageSettingsRouter.put(
  '/',
  auth,
  permit('ADMIN'),
  imagesUpload.fields([
    { name: 'image', maxCount: 10 }, // до 10 картинок для преимуществ
    { name: 'video', maxCount: 1 }   // 1 видео для блока hero
  ]), 
  async (req, res, next) => {
    try {
      const settings = await HomepageSettings.findOne();
      if (!settings) {
        if (req.file) await deleteFile(`videos/${req.file.filename}`);
        if (req.files && Array.isArray(req.files)) {
          for (const file of req.files) {
            await deleteFile(`images/${file.filename}`);
          }
        }
        return res
          .status(404)
          .send({ error: 'Настройки страниц не найдены для обновления' });
      }
      const filesObject = req.files as { [fieldname: string]: Express.Multer.File[] } | undefined;
      
      const advantageFiles = filesObject?.['image'] || []; 
      const videoFiles = filesObject?.['video'] || [];     

      const {
        hero,
        mainPopularTours,
        mainLatestNews,
        toursPage,
        newsPage,
        deleteVideo,
      } = req.body;

      const uploadedVideo = videoFiles[0]; // Берем первое (и единственное) видео
      if (uploadedVideo) {
        if (settings.hero?.videoUrl) await deleteFile(settings.hero.videoUrl);
        settings.hero.videoUrl = `videos/${uploadedVideo.filename}`;
      } else if (deleteVideo === true || deleteVideo === 'true') {
        if (settings.hero?.videoUrl) await deleteFile(settings.hero.videoUrl);
        settings.hero.videoUrl = '';
      }

      if (req.body.advantages && typeof req.body.advantages === 'object') {
        const parsedAdvantages = [];
        const keys = Object.keys(req.body.advantages).sort(
          (a, b) => Number(a) - Number(b),
        );

        // Счётчик, чтобы забирать файлы картинок строго по очереди
        let fileIndex = 0;

        for (const key of keys) {
          const index = Number(key);
          const advData = req.body.advantages[key];

          // Проверяем, отправлял ли фронтенд файл для этого элемента.
          // Если в объекте преимуществ с фронта была картинка, берем следующий файл из массива
          let attachedFile = null;

          // Важно: на фронтенде картинку мы шлем только если её выбрали.
          // Если у нас в данных с фронта для этого индекса есть признак наличия файла,
          // сопоставляем его с файлом из массива advantageFiles по порядку:
          if (advantageFiles[fileIndex]) {
            attachedFile = advantageFiles[fileIndex];
            fileIndex++;
          }

          let currentImage = settings.advantages[index]?.image || null;

          if (attachedFile) {
            if (currentImage) await deleteFile(currentImage);
            currentImage = `images/${attachedFile.filename}`;
          }

          parsedAdvantages.push({
            title: advData.title || '',
            body: advData.body || '',
            image: currentImage,
          });
        }

        settings.advantages = parsedAdvantages;
      }

      if (hero !== undefined && hero !== null) {
        if (hero.title !== undefined) settings.hero.title = hero.title;
        if (hero.subtitle !== undefined) settings.hero.subtitle = hero.subtitle;
      }

      if (mainPopularTours !== undefined && mainPopularTours !== null) {
        if (mainPopularTours.title !== undefined)
          settings.mainPopularTours.title = mainPopularTours.title;
        if (mainPopularTours.subtitle !== undefined)
          settings.mainPopularTours.subtitle = mainPopularTours.subtitle;
      }
      if (mainLatestNews !== undefined && mainLatestNews !== null) {
        if (mainLatestNews.title !== undefined)
          settings.mainLatestNews.title = mainLatestNews.title;
        if (mainLatestNews.subtitle !== undefined)
          settings.mainLatestNews.subtitle = mainLatestNews.subtitle;
      }
      if (toursPage !== undefined && toursPage !== null) {
        if (toursPage.badge !== undefined)
          settings.toursPage.badge = toursPage.badge;
        if (toursPage.title !== undefined)
          settings.toursPage.title = toursPage.title;
        if (toursPage.subtitle !== undefined)
          settings.toursPage.subtitle = toursPage.subtitle;
      }
      if (newsPage !== undefined && newsPage !== null) {
        if (newsPage.badge !== undefined)
          settings.newsPage.badge = newsPage.badge;
        if (newsPage.title !== undefined)
          settings.newsPage.title = newsPage.title;
        if (newsPage.subtitle !== undefined)
          settings.newsPage.subtitle = newsPage.subtitle;
      }

      await settings.save();
      res.send({ message: 'Настройки страниц успешно обновлены', settings });
    } catch (e) {
      if (req.file) await deleteFile(`videos/${req.file.filename}`);
      if (req.files && Array.isArray(req.files)) {
        for (const file of req.files) {
          await deleteFile(`images/${file.filename}`);
        }
      }
      if (e instanceof mongoose.Error.ValidationError) {
        return res
          .status(400)
          .send({ error: 'Ошибка валидации', details: e.errors });
      }
      next(e);
    }
  },
);

export default homepageSettingsRouter;
