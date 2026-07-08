import mongoose from 'mongoose';
import express from 'express';
import type { ReviewFields } from '@/types/reviews.types.js';
import Review from '@/model/review/Review.js';
import { imagesUpload, imageMemoryUpload } from '@/middlewares/multer.js';
import auth from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import deleteFile from '@/utils/deleteFile.js';
import validateObjectId from '@/middlewares/validateObjectId.js';
import toggleBooleanFieldHelper from '@/helpers/toggleBooleanFieldHelper.js';
import { uploadImageToGridFS } from '@/lib/gridfs.js';
import { getGridFSBucket } from '@/index.js';
import { ObjectId } from 'mongodb';


const reviewsRouter = express.Router();

reviewsRouter.post(
  '/',
  imageMemoryUpload.single('image'),
  async (req, res, next) => {

    try {
      const { clientName, tourId, rating, comment } = req.body;

      if (!clientName || !tourId || rating === undefined || !comment) {
        return res
          .status(400)
          .send({ error: 'Заполните все обязательные поля' });
      }

      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        return res.status(400).send({ error: 'Неверный ID тура' });
      }

      let imageId: string | null = null;
      if (req.file) {
        imageId = await uploadImageToGridFS(req.file);
      }

      const tour = await mongoose.model('Tour').findById(tourId);

      if (!tour) {
        return res.status(404).send({ error: 'Тур не найден' });
      }

      const reviewData: Partial<ReviewFields> = {
        clientName,
        tourId: new mongoose.Types.ObjectId(tourId),
        rating: Number(rating),
        comment,
        image: imageId,
        isModerated: 'pending',
      };

      const review = new Review(reviewData);
      await review.save();

      res.send({
        message: 'Отзыв отправлен на модерацию',
        review,
      });
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        return res
          .status(400)
          .send({ error: 'Ошибка валидации', details: e.errors });
      }
      next(e);
    }
  },
);

reviewsRouter.get('/public', async (req, res, next) => {
  try {
    const { tourId, limit = '10', page = '1' } = req.query;

    const pageNum = Math.max(parseInt(page as string, 10) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit as string) || 10, 1), 50);
    const skipNum = (pageNum - 1) * limitNum;

    const query: {
      isModerated: 'approved';
      tourId?: string;
    } = {
      isModerated: 'approved',
    };

    if (typeof tourId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        return res.status(400).send({ error: 'Неверный ID тура' });
      }
      query.tourId = tourId;
    }

    const [reviews, totalReviews] = await Promise.all([
      Review.find(query)
        .sort({ createdAt: -1 })
        .skip(skipNum)
        .limit(limitNum)
        .populate('tourId', 'title'),
      Review.countDocuments(query),
    ]);

    res.send({
      reviews,
      totalReviews,
      page: pageNum,
      totalPage: Math.ceil(totalReviews / limitNum),
    });
  } catch (e) {
    next(e);
  }
});

reviewsRouter.get('/public/featured', async (_req, res, next) => {
  try {
    const reviews = await Review.aggregate([
      {
        $match: { featuredOnHomepage: true },
      },
      {
        $lookup: {
          from: 'tours',
          localField: 'tourId',
          foreignField: '_id',
          as: 'tourData',
          pipeline: [
            {
              $project: {
                title: 1,
              },
            },
          ],
        },
      },
      {
        $unwind: { path: '$tourData', preserveNullAndEmptyArrays: true },
      },
      {
        $addFields: {
          tourId: '$tourData',
        },
      },
      {
        $sort: {
          createdAt: -1,
          rating: -1,
        },
      },
      {
        $project: {
          tourData: 0,
        },
      },
    ]);

    return res.json(reviews);
  } catch (error) {
    next(error);
  }
});

reviewsRouter.get('/image/:id', validateObjectId(), async (req, res, next) => {
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

reviewsRouter.get(
  '/admin',
  auth,
  permit('ADMIN', 'MANAGER'),
  async (req, res, next) => {
    try {
      const rawPage = Number.parseInt(req.query.page as string, 10);
      const rawLimit = Number.parseInt(req.query.limit as string, 10);
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const limit =
        Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(50, rawLimit) : 10;
      const skip = (page - 1) * limit;

      const { tourId, isModerated } = req.query;
      const query: {
        tourId?: string;
        isModerated?: 'pending' | 'approved' | 'rejected';
        featuredOnHomepage?: boolean;
      } = {};

      if (typeof tourId === 'string') {
        if (!mongoose.Types.ObjectId.isValid(tourId)) {
          return res.status(400).send({ error: 'Неверный ID тура' });
        }
        query.tourId = tourId;
      }

      const validStatuses = ['pending', 'approved', 'rejected', 'featured'];

      if (
        typeof isModerated === 'string' &&
        validStatuses.includes(isModerated)
      ) {
        query.isModerated = isModerated as 'pending' | 'approved' | 'rejected';
      }

      if (isModerated === 'featured') {
        query.isModerated = "approved";
        query.featuredOnHomepage = Boolean(isModerated === 'featured');
      }

      const [reviews, totalReviews] = await Promise.all([
        await Review.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .populate('tourId'),
        Review.countDocuments(query),
      ]);

      res.send({
        reviews: reviews,
        totalReviews,
        page: page,
        totalPage: Math.ceil(totalReviews / limit),
      });
    } catch (e) {
      next(e);
    }
  },
);

reviewsRouter.patch(
  '/:id/approve',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { isModerated } = req.body;
      let message = '';

      if (!isModerated && typeof isModerated === 'string') {
        return res.status(401).send({ error: 'Статус модерации обязателен' });
      }

      const approvedReview = await Review.findByIdAndUpdate(
        id,
        { isModerated: isModerated },
        { new: true, runValidators: true },
      );

      if (!approvedReview) {
        return res.status(404).send({ error: 'Отзыв не найден' });
      }

      if (isModerated === 'approved') {
        message = 'Отзыв успешно одобрен и опубликован';
      } else {
        message = 'Отзыв успешно отклонен';
      }

      const result = await Review.aggregate([
        { $match: { tourId: approvedReview.tourId, isModerated: 'approved' } },
        {
          $group: {
            _id: null,
            avgRating: { $avg: '$rating' },
            count: { $sum: 1 },
          },
        },
      ]);

      const ratingCount = result[0]?.count ?? 0;

      const rating = result[0]?.avgRating ?? 0;

      await mongoose.model('Tour').findByIdAndUpdate(approvedReview.tourId, {
        ratingCount,
        rating,
      });

      res.send({
        message: message,
        review: approvedReview,
      });
    } catch (e) {
      next(e);
    }
  },
);

reviewsRouter.patch(
  '/:id/feature',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const updatedReview = await toggleBooleanFieldHelper(
        Review,
        'featuredOnHomepage',
        id as string,
      );

      if (!updatedReview) {
        return res.status(404).json({
          error: 'Отзыв не найден',
        });
      }

      return res.json(updatedReview);
    } catch (error) {
      next(error);
    }
  },
);

reviewsRouter.patch(
  '/:id',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  imageMemoryUpload.single('image'),
  async (req, res, next) => {

    try {
      const { id } = req.params;
      const { rating, comment, companyReply, clientName } = req.body;

      const review = await Review.findById(id);

      if (!review) {
        return res.status(404).send({ error: 'Отзыв не найден' });
      }

      const updateData: Partial<ReviewFields> = {};

      if (clientName !== undefined) {
        if (typeof clientName !== 'string' || clientName.trim() === '') {
          return res.status(400).send({ error: 'Имя клиента обязательно' });
        }

        updateData.clientName = clientName.trim();
      }

      if (rating !== undefined) {
        const numericRating = Number(rating);

        if (
          Number.isNaN(numericRating) ||
          numericRating < 1 ||
          numericRating > 5
        ) {

          return res
            .status(400)
            .send({ error: 'Рейтинг должен быть от 1 до 5' });
        }

        updateData.rating = numericRating;
      }

      if (comment !== undefined) {
        if (typeof comment !== 'string' || comment.trim() === '') {

          return res.status(400).send({ error: 'Комментарий обязателен' });
        }

        updateData.comment = comment.trim();
      }

      if (companyReply !== undefined) {
        updateData.companyReply =
          typeof companyReply === 'string' && companyReply.trim() !== ''
            ? companyReply.trim()
            : null;
      }

      const previousImage = review.image;

      let imageId: string | null = null;
      if (req.file) {
        imageId = await uploadImageToGridFS(req.file);
      }

      if (req.file) {
        updateData.image = imageId;
      }

      const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
        new: true,
        runValidators: true,
      });

      if (req.file && previousImage && previousImage !== updateData.image) {
        await deleteFile(previousImage);
      }

      res.send({
        message: 'Отзыв успешно обновлен',
        review: updatedReview,
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

reviewsRouter.delete(
  '/:id',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const deletedReview = await Review.findByIdAndDelete(id);

      if (!deletedReview) {
        return res.status(404).send({ error: 'Отзыв не найден' });
      }

      res.send({ message: 'Отзыв успешно удален' });
    } catch (e) {
      next(e);
    }
  },
);

export default reviewsRouter;
