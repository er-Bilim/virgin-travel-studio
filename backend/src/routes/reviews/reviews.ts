import mongoose from 'mongoose';
import express from 'express';
import type { ReviewFields } from '@/types/reviews.types.js';
import Review from '@/model/review/Review.js';
import { imagesUpload } from '@/middlewares/multer.js';
import auth from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import deleteImage from '@/utils/deleteImage.js';
import validateObjectId from '@/middlewares/validateObjectId.js';

const reviewsRouter = express.Router();

reviewsRouter.post(
    '/',
    imagesUpload.single('image'),
    async (req, res, next) => {
      const currentFilePath = req.file?.path;

      try {
        const { clientName, tourId, rating, comment } = req.body;

        if (!clientName || !tourId || rating === undefined || !comment) {
          await deleteImage(currentFilePath);
          return res
              .status(400)
              .send({ error: 'Заполните все обязательные поля' });
        }

        if (!mongoose.Types.ObjectId.isValid(tourId)) {
          await deleteImage(currentFilePath);
          return res.status(400).send({ error: 'Неверный ID тура' });
        }

        const tour = await mongoose.model('Tour').findById(tourId);

        if (!tour) {
          await deleteImage(currentFilePath);
          return res.status(404).send({ error: 'Тур не найден' });
        }

        const reviewData: Partial<ReviewFields> = {
          clientName,
          tourId: new mongoose.Types.ObjectId(tourId),
          rating: Number(rating),
          comment,
          image: req.file ? 'images/' + req.file.filename : null,
          isModerated: false,
        };

        const review = new Review(reviewData);
        await review.save();

        res.send({
          message: 'Отзыв отправлен на модерацию',
          review,
        });
      } catch (e) {
        if (e instanceof mongoose.Error.ValidationError) {
          await deleteImage(currentFilePath);
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
      isModerated: boolean;
      tourId?: string;
    } = {
      isModerated: true,
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

reviewsRouter.get(
    '/admin',
    auth,
    permit('ADMIN', 'MANAGER'),
    async (req, res, next) => {
      try {
        const { tourId } = req.query;

        const query: {
          tourId?: string;
        } = {};

        if (typeof tourId === 'string') {
          if (!mongoose.Types.ObjectId.isValid(tourId)) {
            return res.status(400).send({ error: 'Неверный ID тура' });
          }
          query.tourId = tourId;
        }

        const reviews = await Review.find(query)
            .sort({ createdAt: -1 })
            .populate('tourId', 'title');

        res.send(reviews);
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

        const approvedReview = await Review.findByIdAndUpdate(
            id,
            { isModerated: true },
            { new: true, runValidators: true },
        );

        if (!approvedReview) {
          return res.status(404).send({ error: 'Отзыв не найден' });
        }

        res.send({
          message: 'Отзыв одобрен и опубликован',
          review: approvedReview,
        });
      } catch (e) {
        next(e);
      }
    },
);

reviewsRouter.patch(
    '/:id',
    auth,
    permit('ADMIN', 'MANAGER'),
    validateObjectId(),
    imagesUpload.single('image'),
    async (req, res, next) => {
      const currentFilePath = req.file?.path;

      try {
        const { id } = req.params;
        const { rating, comment, companyReply } = req.body;

        const review = await Review.findById(id);

        if (!review) {
          await deleteImage(currentFilePath);
          return res.status(404).send({ error: 'Отзыв не найден' });
        }

        const updateData: Partial<ReviewFields> = {};

        if (rating !== undefined) {
          const numericRating = Number(rating);

          if (
              Number.isNaN(numericRating) ||
              numericRating < 1 ||
              numericRating > 5
          ) {
            await deleteImage(currentFilePath);

            return res
                .status(400)
                .send({ error: 'Рейтинг должен быть от 1 до 5' });
          }

          updateData.rating = numericRating;
        }

        if (comment !== undefined) {
          if (typeof comment !== 'string' || comment.trim() === '') {
            await deleteImage(currentFilePath);

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

        if (req.file) {
          updateData.image = 'images/' + req.file.filename;
        }

        const updatedReview = await Review.findByIdAndUpdate(id, updateData, {
          new: true,
          runValidators: true,
        });

        if (req.file && previousImage && previousImage !== updateData.image) {
          await deleteImage(previousImage);
        }

        res.send({
          message: 'Отзыв успешно обновлен',
          review: updatedReview,
        });
      } catch (e) {
        await deleteImage(currentFilePath);

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

        await deleteImage(deletedReview.image);
        res.send({ message: 'Отзыв успешно удален' });
      } catch (e) {
        next(e);
      }
    },
);

export default reviewsRouter;