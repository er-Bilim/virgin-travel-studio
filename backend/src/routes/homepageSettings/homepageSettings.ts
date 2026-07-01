import express from 'express';
import auth from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import mongoose from 'mongoose';
import deleteFile from '@/utils/deleteFile.js';
import { combinedUpload } from '@/middlewares/multer.js';
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
  combinedUpload.any(),
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

      const uploadedFiles = (req.files as Express.Multer.File[]) || [];

      const currentVideo = uploadedFiles.find( 
        (file) => file.fieldname === 'video',
      );

      const {
        hero,
        advantages,
        mainPopularTours,
        mainLatestNews,
        toursPage,
        newsPage,
        reviewsPage,
      } = req.body;
      const videoUrl = currentVideo ? `videos/${currentVideo.filename}` : null

      let advantagesData = req.body.advantages;
      if (typeof advantagesData === 'string') {
        try {
          advantagesData = JSON.parse(advantagesData);
        } catch {
          advantagesData = undefined;
        }
      }

      const parsedAdvantages = [];

       if (advantagesData && typeof advantagesData === 'object') {
         const keys = Object.keys(advantagesData);

         for (const key of keys) {
           const index = Number(key);
           const advData = advantagesData[key];

           const attachedFile = uploadedFiles.find(
             (file) => file.fieldname === `advantages[${index}][file]`,
           );

           let image = '';
           if (attachedFile) {
             image = `images/${attachedFile.filename}`;
           }

           parsedAdvantages.push({
            //  ...(advData._id && { _id: advData._id }),
             title: advData.title || '',
             body: advData.body || '',
             image: image,
           });
         }
       }

      const settings = new HomepageSettings({
        hero: hero
          ? { videoUrl, title: hero.title, subtitle: hero.subtitle }
          : undefined,
        advantages: parsedAdvantages,
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
        reviewsPage: reviewsPage
          ? { title: reviewsPage.title, subtitle: reviewsPage.subtitle }
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
  combinedUpload.any(),
  async (req, res, next) => {
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];   

    try {
      const settings = await HomepageSettings.findOne();

      if (!settings) {
        for (const file of uploadedFiles) {
          const folder = file.fieldname === 'video' ? 'videos' : 'images';
          await deleteFile(`${folder}/${file.filename}`);
        }
        return res.status(404).send({ error: 'Настройки страниц не найдены' });
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

  const currentVideo = uploadedFiles.find((file) => file.fieldname === 'video');

  if (currentVideo) {
    if (settings.hero?.videoUrl) await deleteFile(settings.hero.videoUrl);
    settings.hero.videoUrl = `videos/${currentVideo.filename}`;
  } else if (deleteVideo === true || deleteVideo === 'true') {
    if (settings.hero?.videoUrl) await deleteFile(settings.hero.videoUrl);
    settings.hero.videoUrl = '';
  }

  const oldAdvantageImages = settings.advantages
    .map((adv) => adv.image)
    .filter(Boolean) as string[];

  const newAdvantageImagesToKeep: string[] = [];

  let advantagesData = req.body.advantages;
  if (typeof advantagesData === 'string') {
    try {
      advantagesData = JSON.parse(advantagesData);
    } catch {
      advantagesData = undefined;
    }
  }

  if (advantagesData && typeof advantagesData === 'object') {
    const parsedAdvantages = [];
    const keys = Object.keys(advantagesData);

    for (const key of keys) {
      const index = Number(key);
      const advData = advantagesData[key];

      const attachedFile = uploadedFiles.find(
        (file) => file.fieldname === `advantages[${index}][file]`,
      );

      let currentImageForThisAdvantage: string | null = null;

      if (advData._id) {
        const dbAdvantage = settings.advantages.id(advData._id);
        if (dbAdvantage) {
          currentImageForThisAdvantage = dbAdvantage.image || null;
        }
      }

      if (attachedFile) {
        // Сценарий А: Загрузили новое фото -> удаляем старое, если оно было
        if (currentImageForThisAdvantage) {
          await deleteFile(currentImageForThisAdvantage);
        }
        currentImageForThisAdvantage = `images/${attachedFile.filename}`;
        newAdvantageImagesToKeep.push(currentImageForThisAdvantage);
      } else if (advData.imageString === '') {
        // Сценарий Б: Картинку полностью стерли на фронтенде -> удаляем с диска
        if (currentImageForThisAdvantage) {
          await deleteFile(currentImageForThisAdvantage);
        }
        currentImageForThisAdvantage = null;
      } else if (typeof advData.imageString === 'string') {
        // Сценарий В: Картинку не трогали -> сохраняем старый путь
        currentImageForThisAdvantage = advData.imageString;
        newAdvantageImagesToKeep.push(currentImageForThisAdvantage!);
      }

      parsedAdvantages.push({
        ...(advData._id && { _id: advData._id }),
        title: advData.title || '',
        body: advData.body || '',
        image: currentImageForThisAdvantage,
      });
    }

    settings.advantages =
      parsedAdvantages as unknown as typeof settings.advantages;
  }

  for (const oldImage of oldAdvantageImages) {
    if (!newAdvantageImagesToKeep.includes(oldImage)) {
      await deleteFile(oldImage);
    }
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

      // Маркируем изменения для Mongoose
      settings.markModified('hero');
      settings.markModified('advantages');
      if (reviewsPage !== undefined && reviewsPage !== null) {
        if (reviewsPage.title !== undefined)
          settings.reviewsPage.title = reviewsPage.title;
        if (reviewsPage.subtitle !== undefined)
          settings.reviewsPage.subtitle = reviewsPage.subtitle;
      }

      await settings.save();

      return res.send({
        message: 'Настройки страниц успешно обновлены',
        settings,
      });
    } catch (e) {
      for (const file of uploadedFiles) {
        const folder = file.fieldname === 'video' ? 'videos' : 'images';
        await deleteFile(`${folder}/${file.filename}`);
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
