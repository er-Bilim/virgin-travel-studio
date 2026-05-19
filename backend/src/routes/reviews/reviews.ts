import mongoose from 'mongoose';
import express from 'express';
import { ReviewFields } from '@/types/reviews.types.js';
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
    const { tourId } = req.query;

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

    const reviews = await Review.find(query)
      .sort({ createdAt: -1 })
      .populate('tourId', 'title');

    res.send(reviews);
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
