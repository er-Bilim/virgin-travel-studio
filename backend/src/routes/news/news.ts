import express from 'express';
import mongoose from 'mongoose';
import News from '@/model/New/News.js';
import auth, { authOrNot, type RequestWithUser } from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import { imagesUpload } from '@/middlewares/multer.js';
import type { NewsFields } from '@/types/news.types.js';
import validateObjectId from '@/middlewares/validateObjectId.js';

const newsRouter = express.Router();

newsRouter.get(
  '/',
  validateObjectId('authorId', true),
  authOrNot,
  async (req, res, next) => {
    const { user } = req as RequestWithUser;

    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    try {
      const query: {
        isPublished?: boolean;
        tags?: { $in: string[] };
        title?: { $regex: string; $options: 'i' };
        author?: string;
      } = {};

      const rawPage = Number.parseInt(req.query.page as string, 10);
      const rawLimit = Number.parseInt(req.query.limit as string, 10);
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const limit =
        Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(50, rawLimit) : 10;
      const skip = (page - 1) * limit;

      const filterIsPublished = req.query.isPublished;
      if (
        typeof filterIsPublished === 'string' &&
        filterIsPublished.trim().length > 0
      ) {
        query.isPublished = filterIsPublished === 'true';
      }

      if (!isAdminOrManager) {
        query.isPublished = true;
      }

      const tags = req.query.tags;

      if (typeof tags === 'string' && tags.length > 0) {
        const parsedTags = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);

        if (parsedTags.length > 0) {
          query.tags = { $in: parsedTags };
        }
      }

      const searchTitleWord = req.query.searchTitle;

      if (typeof searchTitleWord === 'string') {
        const trimmedSearch = searchTitleWord.trim();
        if (trimmedSearch.length > 0) {
          const safeSearch = trimmedSearch.replace(
            /[.*+?^${}()|[\]\\]/g,
            '\\$&',
          );
          query.title = { $regex: safeSearch, $options: 'i' };
        }
      }

      const authorId = req.query.authorId;
      if (typeof authorId === 'string') {
        if (authorId.trim().length > 0) {
          query.author = authorId;
        }
      }

      const [news, newsCount] = await Promise.all([
        News.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('author', 'fullName'),
        News.countDocuments(query),
      ]);

      res.send({
        allNews: news,
        metadata: {
          total: newsCount,
          limit: limit,
          page: page,
          totalPages: Math.ceil(newsCount / limit),
        },
      });
    } catch (e) {
      next(e);
    }
  },
);

newsRouter.get('/tags', async (_req, res, next) => {
  try {
    const tags = await News.distinct('tags', { isPublished: true });
    return res.json(tags);
  } catch (error) {
    next(error);
  }
});

newsRouter.get(
  '/:id',
  authOrNot,
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    const { user } = req as RequestWithUser;
    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    try {
      const filter = isAdminOrManager
        ? { _id: id }
        : { _id: id, isPublished: true };

      const infoNew = await News.findOne(filter).populate('author', 'fullName');

      if (!infoNew) {
        return res.status(404).send({
          error: 'Новость не найдена',
        });
      }

      res.send(infoNew);
    } catch (error) {
      next(error);
    }
  },
);

newsRouter.post(
  '/',
  auth,
  permit('ADMIN', 'MANAGER'),
  imagesUpload.single('image'),
  async (req, res, next) => {
    try {
      const { title, content, tags } = req.body;

      const { user } = req as RequestWithUser;

      const parsedTags =
        typeof tags === 'string'
          ? tags
              .split(',')
              .map((t) => t.trim())
              .filter(Boolean)
          : [];

      const news = new News({
        title,
        content,
        image: req.file ? 'images/' + req.file.filename : null,
        tags: parsedTags,
        author: user._id,
      });

      const savedNews = await news.save();

      res.send({
        message: 'НОВОСТЬ СОЗДАНА',
        news: savedNews,
      });
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({
          error: 'Ошибка валидации',
          details: e.errors,
        });
      }
      next(e);
    }
  },
);

newsRouter.delete(
  '/:id',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const { deletedCount } = await News.deleteOne({ _id: id });
      if (!deletedCount) {
        return res.status(404).send({
          error: 'Новость не найдена',
        });
      }

      return res.send({
        message: 'Новость удалена',
      });
    } catch (e) {
      next(e);
    }
  },
);

newsRouter.patch(
  '/:id/isPublished',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const news = await News.findById(id);
      if (!news) {
        return res.status(404).send({
          error: 'Новость не найдена',
        });
      }

      news.isPublished = !news.isPublished;
      await news.save();
      return res.send(news);
    } catch (e) {
      next(e);
    }
  },
);

newsRouter.patch(
  '/:id/edit',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  imagesUpload.single('image'),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const news = await News.findById(id);

      if (!news) {
        return res.status(404).send({
          error: 'Новость не найдена',
        });
      }

      const { title, content, tags } = req.body;

      const updateData: Partial<NewsFields> = {};

      if (title) updateData.title = title;
      if (content) updateData.content = content;

      if (typeof tags === 'string') {
        updateData.tags = tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean);
      }

      if (req.file) {
        updateData.image = 'images/' + req.file.filename;
      }

      const updated = await News.findByIdAndUpdate(id, updateData, {
        returnDocument: 'after',
        runValidators: true,
      });

      res.send({
        message: 'НОВОСТЬ ОБНОВЛЕНА',
        news: updated,
      });
    } catch (e) {
      next(e);
    }
  },
);

export default newsRouter;
