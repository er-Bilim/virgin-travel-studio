import express from 'express';
import auth from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import mongoose from 'mongoose';
import deleteFile from '@/utils/deleteFile.js';
import { videosUpload } from '@/middlewares/multer.js';
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

      const {
        hero,
        mainPopularTours,
        mainLatestNews,
        toursPage,
        newsPage,
        reviewsPage,
      } = req.body;
      const videoUrl = req.file
        ? `videos/${req.file.filename}`
        : hero?.videoUrl || '';

      const settings = new HomepageSettings({
        hero: hero
          ? { videoUrl, title: hero.title, subtitle: hero.subtitle }
          : undefined,
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
        reviewsPage: reviewsPage ? {title: reviewsPage.title, subtitle: reviewsPage.subtitle} : undefined,
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
  videosUpload.single('video'),
  async (req, res, next) => {
    try {
      const settings = await HomepageSettings.findOne();
      if (!settings) {
        if (req.file) await deleteFile(`videos/${req.file.filename}`);
        return res
          .status(404)
          .send({ error: 'Настройки страниц не найдены для обновления' });
      }

      const {
        hero,
        mainPopularTours,
        mainLatestNews,
        toursPage,
        newsPage,
        deleteVideo,
        reviewsPage,
      } = req.body;

      if (req.file) {
        if (settings.hero?.videoUrl) await deleteFile(settings.hero.videoUrl);
        settings.hero.videoUrl = `videos/${req.file.filename}`;
      } else if (deleteVideo === true || deleteVideo === 'true') {
        if (settings.hero?.videoUrl) await deleteFile(settings.hero.videoUrl);
        settings.hero.videoUrl = '';
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

      if (reviewsPage !== undefined && reviewsPage !== null) {
        if (reviewsPage.title !== undefined)
          settings.reviewsPage.title = reviewsPage.title;
        if (reviewsPage.subtitle !== undefined)
          settings.reviewsPage.subtitle = reviewsPage.subtitle;
      }

      await settings.save();
      res.send({ message: 'Настройки страниц успешно обновлены', settings });
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

export default homepageSettingsRouter;
