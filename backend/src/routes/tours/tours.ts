import express from 'express';
import auth, { authOrNot, type RequestWithUser } from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import { imagesUpload } from '@/middlewares/multer.js';
import Tour from '@/model/tour/Tour.js';
import mongoose from 'mongoose';
import validateObjectId from '@/middlewares/validateObjectId.js';
import parseSort from '@/lib/sort.js';

const toursRouter = express.Router();

const escapeRegex = (value: string) => {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

toursRouter.get('/', authOrNot, async (req, res, next) => {
  const { user } = req as RequestWithUser;
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  try {
    const sort = parseSort(req.query.sort);
    const rawPage = Number.parseInt(req.query.page as string, 10);
    const rawLimit = Number.parseInt(req.query.limit as string, 10);

    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 10;

    const skip = (page - 1) * limit;

    const query: {
      isPublished?: boolean;
      category?: mongoose.Types.ObjectId;
      title?: { $regex: string; $options: string };
    } = {};

    if (!isAdminOrManager) {
      query.isPublished = true;
    }

    if (typeof req.query.category === 'string') {
      if (!mongoose.Types.ObjectId.isValid(req.query.category)) {
        return res.status(400).send({ error: 'Неверный category ID' });
      }

      query.category = new mongoose.Types.ObjectId(req.query.category);
    }

    if (
      typeof req.query.search === 'string' &&
      req.query.search.trim() !== ''
    ) {
      query.title = {
        $regex: escapeRegex(req.query.search.trim()),
        $options: 'i',
      };
    }

    if (isAdminOrManager && typeof req.query.isPublished === 'string') {
      if (req.query.isPublished === 'true') {
        query.isPublished = true;
      }

      if (req.query.isPublished === 'false') {
        query.isPublished = false;
      }
    }

    const tours = await Tour.aggregate([
      { $match: query },
      { $skip: skip },
      { $limit: limit },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $lookup: {
          from: 'toursets',
          localField: '_id',
          foreignField: 'tourId',
          as: 'tourSets',
        },
      },
      { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
      { $unwind: { path: '$tourSet', preserveNullAndEmptyArrays: true } },
      {
        $addFields: {
          isHot: {
            $anyElementTrue: {
              $map: {
                input: '$tourSets',
                as: 'tour_set',
                in: '$$tour_set.isHot',
              },
            },
          },
          minPrice: { $min: '$tourSets.price' },
          hotelLocation: { $arrayElemAt: ['$tourSets.hotelLocation', 0] },
          durationDays: {
            $cond: {
              if: { $gt: [{ $size: '$tourSets' }, 0] },
              then: {
                $ceil: {
                  $divide: [
                    {
                      $subtract: [
                        { $arrayElemAt: ['$tourSets.endDate', 0] },
                        { $arrayElemAt: ['$tourSets.startDate', 0] },
                      ],
                    },
                    1000 * 60 * 60 * 24,
                  ],
                },
              },
              else: null,
            },
          },
          nextStartDate: {
            $min: '$tourSets.startDate',
          },
        },
      },
      {
        $project: {
          title: 1,
          description: 1,
          images: 1,
          baseAdventages: 1,
          isPublished: 1,
          rating: 1,
          ratingCount: 1,
          isHot: 1,
          hotelLocation: 1,
          minPrice: 1,
          durationDays: 1,
          nextStartDate: 1,
          createdAt: 1,
          updatedAt: 1,
          'category._id': 1,
          'category.title': 1,
        },
      },
      { $sort: sort },
    ]);

    const totalTours = await Tour.countDocuments(query);

    res.send({
      tours,
      meta: {
        total: totalTours,
        page,
        limit,
        totalPages: Math.ceil(totalTours / limit),
      },
    });
  } catch (e) {
    next(e);
  }
});

toursRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories = await Tour.aggregate([
      { $match: { isPublished: true } },
      { $group: { _id: '$category' } },
      {
        $lookup: {
          from: 'categories',
          localField: '_id',
          foreignField: '_id',
          as: 'category',
        },
      },
      { $unwind: '$category' },
      { $project: { title: '$category.title' } },
    ]);

    return res.json(categories);
  } catch (error) {
    next(error);
  }
});

toursRouter.get(
  '/:id',
  authOrNot,
  validateObjectId(),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { user } = req as RequestWithUser;

      const tour = await Tour.findById(id).populate('category');

      if (!tour) {
        return res.status(404).send({ error: 'Тур не найден' });
      }

      const isAdminOrManager =
        user?.role === 'ADMIN' || user?.role === 'MANAGER';

      if (!tour.isPublished && !isAdminOrManager) {
        return res.status(404).send({ error: 'Тур не найден' });
      }

      res.send(tour);
    } catch (e) {
      next(e);
    }
  },
);

toursRouter.post(
  '/',
  auth,
  permit('ADMIN', 'MANAGER'),
  imagesUpload.array('images', 5),
  async (req, res, next) => {
    try {
      const { title, description, category, baseAdvantages } = req.body;

      const parsedAdvantages: string[] =
        typeof baseAdvantages === 'string'
          ? baseAdvantages
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean)
          : Array.isArray(baseAdvantages)
            ? baseAdvantages
            : [];

      const imagePaths = req.files
        ? (req.files as Express.Multer.File[]).map(
            (file) => 'images/' + file.filename,
          )
        : [];

      const tour = new Tour({
        title,
        description,
        category,
        images: imagePaths,
        baseAdvantages: parsedAdvantages,
        isPublished: false,
      });

      await tour.save();
      res.send(tour);
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

toursRouter.patch(
  '/:id',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  imagesUpload.array('images', 5),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const tour = await Tour.findById(id);
      if (!tour) return res.status(404).send({ error: 'Тур не найден' });

      const { title, description, category, baseAdvantages, isPublished } =
        req.body;

      if (title !== undefined) tour.title = title;
      if (description !== undefined) tour.description = description;

      if (category) {
        if (!mongoose.Types.ObjectId.isValid(String(category))) {
          return res.status(400).send({ error: 'Неверный category ID' });
        }
        tour.category = category;
      }

      if (isPublished !== undefined) {
        tour.isPublished = String(isPublished) === 'true';
      }

      if (baseAdvantages !== undefined) {
        tour.baseAdvantages =
          typeof baseAdvantages === 'string'
            ? baseAdvantages
                .split(',')
                .map((a) => a.trim())
                .filter(Boolean)
            : Array.isArray(baseAdvantages)
              ? baseAdvantages
              : tour.baseAdvantages;
      }

      if (req.files && (req.files as Express.Multer.File[]).length > 0) {
        const newImages = (req.files as Express.Multer.File[]).map(
          (file) => 'images/' + file.filename,
        );
        tour.images = [...(tour.images ?? []), ...newImages];
      }

      await tour.save();
      res.send({ message: 'Тур обновлен', tour });
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

toursRouter.delete(
  '/:id',
  auth,
  permit('ADMIN'),
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const result = await Tour.deleteOne({ _id: id });
      if (!result.deletedCount) {
        return res.status(404).send({ error: 'Тур не найден' });
      }
      res.send({ message: 'Тур успешно удален' });
    } catch (e) {
      next(e);
    }
  },
);

export default toursRouter;
