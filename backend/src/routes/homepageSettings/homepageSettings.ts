import express from 'express';
import { ObjectId } from 'mongodb';
import auth from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import mongoose from 'mongoose';
import { deleteGridFSFile } from '@/utils/deleteFile.js';
import { homepageUpload } from '@/middlewares/multer.js';
import { uploadImageToGridFS, uploadVideoToGridFS } from '@/lib/gridfs.js';
import { getGridFSBucket } from '@/index.js';
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

homepageSettingsRouter.get('/video/:id', async (req, res, next) => {
  try {
    const bucket = getGridFSBucket();
    const _id = new ObjectId(req.params.id);

    const files = await bucket.find({ _id }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).send({ error: 'Видео не найдено' });
    }

    const file = files[0]!;
    const contentType =
      file?.metadata?.contentType || 'application/octet-stream';
    const totalSize = file.length;

    const rangeHeader = req.headers.range;
    if (rangeHeader) {
      const parts = rangeHeader.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0] ?? '0', 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${totalSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': contentType,
      });

      bucket
        .openDownloadStream(_id, { start, end: end + 1 })
        .on('error', next)
        .pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': totalSize,
        'Content-Type': contentType,
        'Accept-Ranges': 'bytes',
      });

      bucket.openDownloadStream(_id).on('error', next).pipe(res);
    }
  } catch (error) {
    next(error);
  }
});

homepageSettingsRouter.get('/image/:id', async (req, res, next) => {
  try {
    const bucket = getGridFSBucket();
    const _id = new ObjectId(req.params.id);

    const files = await bucket.find({ _id }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).send({ error: 'Изображение не найдено' });
    }

    const file = files[0]!;
    res.set(
      'Content-Type',
      file?.metadata?.contentType || 'application/octet-stream',
    );

    bucket.openDownloadStream(_id).on('error', next).pipe(res);
  } catch (error) {
    next(error);
  }
});

homepageSettingsRouter.post(
  '/',
  auth,
  permit('ADMIN'),
  homepageUpload.any(),
  async (req, res, next) => {
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    let uploadedVideoId: string | null = null;
    const uploadedImageIds: string[] = [];

    try {
      const existingSettings = await HomepageSettings.findOne();
      if (existingSettings) {
        return res.status(400).send({
          error: 'Ошибка конфигурации',
          details:
            'Запись настроек главной страницы уже существует. Используйте метод PUT для обновлений.',
        });
      }

      const currentVideo = uploadedFiles.find(
        (file) => file.fieldname === 'video',
      );

      const {
        hero,
        mainPopularTours,
        mainLatestNews,
        toursPage,
        newsPage,
        reviewsPage,
      } = req.body;

      if (currentVideo) {
        uploadedVideoId = await uploadVideoToGridFS(currentVideo);
      }

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
            const imageId = await uploadImageToGridFS(attachedFile);
            uploadedImageIds.push(imageId);
            image = imageId;
          }

          parsedAdvantages.push({
            title: advData.title || '',
            body: advData.body || '',
            image: image,
          });
        }
      }

      const settings = new HomepageSettings({
        hero: hero
          ? {
              videoUrl: uploadedVideoId,
              title: hero.title,
              subtitle: hero.subtitle,
            }
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
      if (uploadedVideoId) await deleteGridFSFile(uploadedVideoId);
      for (const imgId of uploadedImageIds) {
        await deleteGridFSFile(imgId);
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

homepageSettingsRouter.put(
  '/',
  auth,
  permit('ADMIN'),
  homepageUpload.any(),
  async (req, res, next) => {
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    let uploadedVideoId: string | null = null;
    const uploadedImageIds: string[] = [];
    const oldFilesToDelete: string[] = [];

    try {
      const settings = await HomepageSettings.findOne();

      if (!settings) {
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

      const currentVideo = uploadedFiles.find(
        (file) => file.fieldname === 'video',
      );

      let advantagesData = req.body.advantages;
      if (typeof advantagesData === 'string') {
        try {
          advantagesData = JSON.parse(advantagesData);
        } catch {
          advantagesData = undefined;
        }
      }

      if (!advantagesData || Object.keys(advantagesData).length === 0) {
        for (const existing of settings.advantages) {
          if (existing.image) oldFilesToDelete.push(existing.image);
        }

        settings.set('advantages', []);
        settings.markModified('advantages');
      }

      if (
        advantagesData &&
        typeof advantagesData === 'object' &&
        Object.keys(advantagesData).length > 0
      ) {
        const keys = Object.keys(advantagesData);

        const incomingIds = new Set(
          keys
            .map((k) => advantagesData[k]._id as string | undefined)
            .filter(Boolean),
        );

        for (const existing of settings.advantages) {
          const id = (
            existing._id as unknown as { toString(): string }
          ).toString();
          if (!incomingIds.has(id)) {
            if (existing.image) oldFilesToDelete.push(existing.image);
          }
        }

        const parsedAdvantages = [];

        for (const key of keys) {
          const index = Number(key);
          const advData = advantagesData[key];

          const attachedFile = uploadedFiles.find(
            (file) => file.fieldname === `advantages[${index}][file]`,
          );

          let currentImageId: string | null = null;
          if (advData._id) {
            const dbAdvantage = settings.advantages.id(advData._id);
            if (dbAdvantage) {
              currentImageId = dbAdvantage.image || null;
            }
          }

          if (attachedFile) {
            if (currentImageId) oldFilesToDelete.push(currentImageId);
            const newImageId = await uploadImageToGridFS(attachedFile);
            uploadedImageIds.push(newImageId);
            currentImageId = newImageId;
          } else if (advData.imageString === '') {
            if (currentImageId) oldFilesToDelete.push(currentImageId);
            currentImageId = null;
          } else if (
            typeof advData.imageString === 'string' &&
            advData.imageString
          ) {
            currentImageId = advData.imageString;
          }

          parsedAdvantages.push({
            ...(advData._id && { _id: advData._id }),
            title: advData.title || '',
            body: advData.body || '',
            image: currentImageId,
          });
        }

        settings.advantages =
          parsedAdvantages as unknown as typeof settings.advantages;
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

      if (currentVideo) {
        if (settings.hero?.videoUrl)
          oldFilesToDelete.push(settings.hero.videoUrl);
        uploadedVideoId = await uploadVideoToGridFS(currentVideo);
        settings.hero.videoUrl = uploadedVideoId;
      } else if (deleteVideo === true || deleteVideo === 'true') {
        if (settings.hero?.videoUrl)
          oldFilesToDelete.push(settings.hero.videoUrl);
        settings.hero.videoUrl = '';
      }

      settings.markModified('hero');
      settings.markModified('advantages');

      if (reviewsPage !== undefined && reviewsPage !== null) {
        if (reviewsPage.title !== undefined)
          settings.reviewsPage.title = reviewsPage.title;
        if (reviewsPage.subtitle !== undefined)
          settings.reviewsPage.subtitle = reviewsPage.subtitle;
      }

      await settings.save();

      for (const oldId of oldFilesToDelete) {
        await deleteGridFSFile(oldId);
      }

      return res.send({
        message: 'Настройки страниц успешно обновлены',
        settings,
      });
    } catch (e) {
      if (uploadedVideoId) await deleteGridFSFile(uploadedVideoId);
      for (const imgId of uploadedImageIds) {
        await deleteGridFSFile(imgId);
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
