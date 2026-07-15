import express from 'express';
import mongoose from 'mongoose';
import News from '@/model/New/News.js';
import auth, { authOrNot, type RequestWithUser } from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import { imageMemoryUpload, imagesUpload } from '@/middlewares/multer.js';
import type { NewsFields } from '@/types/news.types.js';
import validateObjectId from '@/middlewares/validateObjectId.js';
import { getGridFSBucket } from '@/index.js';
import { uploadImageToGridFS } from '@/lib/gridfs.js';
import { ObjectId } from 'mongodb';

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
        createdAt?: {
          $gte?: Date;
          $lte?: Date;
        };
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

      const startDate = req.query.startDate;
      const endDate = req.query.endDate;

      const hasStart = typeof startDate === 'string' && startDate.trim();
      const hasEnd = typeof endDate === 'string' && endDate.trim();

      if (hasStart || hasEnd) {
        const createdAt: {
          $gte?: Date;
          $lte?: Date;
        } = {};

        if (hasStart) {
          const from = new Date(startDate);

          if (!Number.isNaN(from.getTime())) {
            from.setHours(0, 0, 0, 0);
            createdAt.$gte = from;
          }
        }

        if (hasEnd) {
          const to = new Date(endDate);

          if (!Number.isNaN(to.getTime())) {
            to.setHours(23, 59, 59, 999);
            createdAt.$lte = to;
          }
        }

        if (Object.keys(createdAt).length > 0) {
          query.createdAt = createdAt;
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
    const tagsArray: { tag: string }[] = tags.map((tag) => {
      return {
        tag,
      };
    });
    return res.json(tagsArray);
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
  permit('ADMIN'),
  imageMemoryUpload.single('image'),
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

      let imageId: string | null = null;
      if (req.file) {
        imageId = await uploadImageToGridFS(req.file);
      }

      const news = new News({
        title,
        content,
        image: imageId,
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

newsRouter.get('/image/:id', async (req, res, next) => {
  try {
    const bucket = getGridFSBucket();
    const _id = new ObjectId(req.params.id);
    const files = await bucket.find({ _id }).toArray();

    if (!files || files.length === 0) {
      return res.status(404).send({
        error: 'Изображение не найдено',
      });
    }

    const file = files[0];
    res.set(
      'Content-Type',
      file?.metadata?.contentType || 'application/octet-stream',
    );

    bucket.openDownloadStream(_id).pipe(res);
  } catch (error) {
    next(error);
  }
});

newsRouter.delete(
  '/:id',
  auth,
  permit('ADMIN'),
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const bucket = getGridFSBucket();
      const news = await News.findById(id);
      const { deletedCount } = await News.deleteOne({ _id: id });
      if (!deletedCount) {
        return res.status(404).send({
          error: 'Новость не найдена',
        });
      }

      if (news && news.image) {
        try {
          await bucket.delete(new ObjectId(news.image));
        } catch (error) {
          console.error(error);
        }
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
  permit('ADMIN'),
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
  permit('ADMIN'),
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
        const imageId = await uploadImageToGridFS(req.file);

        if (news.image) {
          try {
            await getGridFSBucket().delete(new ObjectId(news.image));
          } catch (e) {
            console.error(e);
          }
        }

        updateData.image = imageId;
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
