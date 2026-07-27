import express from 'express';
import auth, {authOrNot, type RequestWithUser} from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import {imageMemoryUpload} from '@/middlewares/multer.js';
import Tour from '@/model/tour/Tour.js';
import mongoose, {type PipelineStage} from 'mongoose';
import validateObjectId from '@/middlewares/validateObjectId.js';
import parseSort from '@/lib/sort.js';
import TourSet from '@/model/tourSet/TourSet.js';
import type {AggregatedTour, AggregatedTours, ITour} from '@/types/tour.types.js';
import type {ICategory} from '@/types/category.types.js';
import telegramMessage, {
  aggregate_tour,
  type TourDocumentType,
} from '@/utils/bot/telegram.js';
import TourView from '@/model/tour/TourView.js';
import {buildTourPipeline} from '@/aggregations/tours.pipeline.js';
import { uploadImageToGridFS } from '@/lib/gridfs.js';
import { getGridFSBucket } from '@/index.js';
import { ObjectId } from 'mongodb';

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
      countryCode?: string;
      isPublished?: boolean;
      category?: mongoose.Types.ObjectId;
      title?: { $regex: string; $options: string };
    } = {};

    if (!isAdminOrManager) {
      query.isPublished = true;
    }

    if (
      typeof req.query.countryCode === 'string' &&
      req.query.countryCode.trim()
    ) {
      const code = req.query.countryCode.trim().toUpperCase();

      if (code.length === 3) {
        query.countryCode = code;
      }
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

    const postMatchStages: PipelineStage[] = [];

    if (req.query.isHot === 'true') {
      postMatchStages.push({ $match: { isHot: true } });
    }

    if (req.query.hasDiscount === 'true') {
      postMatchStages.push({ $match: { hasDiscount: true } });
    }

    const tours: AggregatedTours[] = await Tour.aggregate([
      {$match: query},
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
      {
        $addFields: {
          tourSets: {
            $filter: {
              input: '$tourSets',
              as: 'set',
              cond: { $eq: ['$$set.status', 'OPEN'] }
            }
          }
        }
      },
      {$unwind: {path: '$category', preserveNullAndEmptyArrays: true}},
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
          hasDiscount: {
            $anyElementTrue: {
              $map: {
                input: '$tourSets',
                as: 'tour_set',
                in: {
                  $and: [
                      { $ne: ['$$tour_set.discountPrice', null] },
                    { $gt: ['$$tour_set.discountPrice', 0] },
                  ]
                },
              },
            },
          },
          minPrice: {$min: '$tourSets.price'},
          hotelLocation: {$arrayElemAt: ['$tourSets.hotelLocation', 0]},
          durationDays: {
            $cond: {
              if: {$gt: [{$size: '$tourSets'}, 0]},
              then: {
                $ceil: {
                  $divide: [
                    {
                      $subtract: [
                        {$arrayElemAt: ['$tourSets.endDate', 0]},
                        {$arrayElemAt: ['$tourSets.startDate', 0]},
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
          saleDeadline: {
            $min: {
              $map: {
                input: {
                  $filter: {
                    input: '$tourSets',
                    as: 'set',
                    cond: { $eq: ['$$set.isHot', true]}
                  },
                },
                as: 'hotSet',
                in: '$$hotSet.saleDeadline'
              }
            }
          }
        },
      },
        ...postMatchStages,
      {$sort: sort},
      {$skip: skip},
      {$limit: limit},
      {
        $project: {
          title: 1,
          description: 1,
          images: 1,
          baseAdvantages: 1,
          isPublished: 1,
          rating: 1,
          ratingCount: 1,
          isHot: 1,
          hasDiscount: 1,
          saleDeadline: 1,
          hotelLocation: 1,
          minPrice: 1,
          durationDays: 1,
          nextStartDate: 1,
          createdAt: 1,
          updatedAt: 1,
          countryCode: 1,
          'category._id': 1,
          'category.title': 1,
        },
      },
    ]);

    const countResult = await Tour.aggregate([
        { $match: query },
      {
        $lookup: {
          from: 'toursets',
          localField: '_id',
          foreignField: 'tourId',
          as: 'tourSets',
        },
      },
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
          hasDiscount: {
            $anyElementTrue: {
              $map: {
                input: '$tourSets',
                as: 'tour_set',
                in: {
                  $and: [
                      { $ne: ['$$tour_set.discountPrice', null] },
                    { $gt: ['$$tour_set.discountPrice', 0] },
                  ],
                },
              },
            },
          },
        },
      },
      ...postMatchStages,
      { $count: 'total' },
    ]);

    const totalTours = countResult[0]?.total ?? 0;

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

toursRouter.get('/countries', async (_req, res, next) => {
  try {
    const countries = await Tour.distinct('countryCode');

    res.send(countries.filter(Boolean).sort());
  } catch (e) {
    next(e);
  }
});

toursRouter.get('/categories', async (_req, res, next) => {
  try {
    const categories: ICategory[] = await Tour.aggregate([
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

toursRouter.get('/popular', async (req, res, next) => {
  try {
    const limit = Math.min(Number(req.query.limit) || 6, 12);

    const tours = await Tour.aggregate(buildTourPipeline({ match: {isPublished: true}, sort: { viewsCount: -1, createdAt: -1 }, limit}))
      
    return res.json(tours);
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
      const tourId = new mongoose.Types.ObjectId(id as string);

      const tours: AggregatedTour[] = await Tour.aggregate([
        { $match: { _id: tourId } },
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'category',
          },
        },
        {
          $unwind: {
            path: '$category',
            preserveNullAndEmptyArrays: true,
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
      ]);

      const tour: AggregatedTour | undefined = tours[0];

      if (!tour) {
        return res.status(404).send({ error: 'Тур не найден' });
      }

      const isAdminOrManager =
        user?.role === 'ADMIN' || user?.role === 'MANAGER';

      if (!tour.isPublished && !isAdminOrManager) {
        return res.status(404).send({ error: 'Тур не найден' });
      }

      if (tour.isPublished) {
        const viewer = req.ip;

        if (viewer) {
          const existing = await TourView.findOne({ tourId, viewer });

          if (!existing) {
            await TourView.create({ tourId, viewer });

            Tour.updateOne({ _id: tourId }, { $inc: { viewsCount: 1 } }).catch(
              (error) => console.error(error),
            );
          }
        }
      }

      res.send(tour);
    } catch (e) {
      next(e);
    }
  },
);

toursRouter.get('/image/:id', async (req, res, next) => {
    try {
    const bucket = getGridFSBucket();
    const _id = new ObjectId(req.params.id);
    const files = await bucket.find({ _id }).toArray();

    if (files.length === 0) {
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
})

toursRouter.post(
  '/',
  auth,
  permit('ADMIN'),
  imageMemoryUpload.array('images', 5),
  async (req, res, next) => {
    try {
      const { title, description, countryCode, category, baseAdvantages } =
        req.body;

      const parsedAdvantages: string[] =
        typeof baseAdvantages === 'string'
          ? baseAdvantages
              .split(',')
              .map((a) => a.trim())
              .filter(Boolean)
          : Array.isArray(baseAdvantages)
            ? baseAdvantages
            : [];

      const uploadPromises = req.files
        ? (req.files as Express.Multer.File[]).map((file) =>
            uploadImageToGridFS(file),
          )
        : [];

      const imageIds = await Promise.all(uploadPromises);

      const tour = new Tour({
        title,
        description,
        countryCode: countryCode?.trim().toUpperCase(),
        category,
        images: imageIds,
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
  permit('ADMIN'),
  validateObjectId(),
  imageMemoryUpload.array('images', 5),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const tour = await Tour.findById(id);
      if (!tour) return res.status(404).send({ error: 'Тур не найден' });

      const {
        title,
        description,
        countryCode,
        category,
        baseAdvantages,
        isPublished,
      } = req.body;

      if (title !== undefined) tour.title = title;
      if (description !== undefined) tour.description = description;
      if (countryCode !== undefined)
        tour.countryCode = countryCode.trim().toUpperCase();

      if (category) {
        if (!mongoose.Types.ObjectId.isValid(String(category))) {
          return res.status(400).send({ error: 'Неверный category ID' });
        }
        tour.category = category;
      }

      if (isPublished !== undefined) {
        tour.isPublished = String(isPublished) === 'true';
        if (tour.isPublished) {
          const tourAggregate = await aggregate_tour(
            tour.toObject() as unknown as TourDocumentType,
          );
          if (tourAggregate.hotelLocation) {
            telegramMessage(tourAggregate).catch((e) =>
              console.error('Не удалось запостить тур в Telegram:', e),
            );
          }
        }
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

      if (req.body.imagesOrder !== undefined) {
        let orderMap = req.body.imagesOrder;

        if (!Array.isArray(orderMap)) {
          orderMap = [orderMap];
        }

        const finalImages: ObjectId[] = [];
        let newFileIndex = 0;
        const uploadedFiles = (req.files as Express.Multer.File[]) || [];

        for (const item of orderMap) {
          const currentFile = uploadedFiles[newFileIndex];

          if (item === 'NEW_FILE' && currentFile) {
            finalImages.push(new mongoose.Types.ObjectId(await uploadImageToGridFS(currentFile)));
            newFileIndex++;
          } else if (item !== 'NEW_FILE' && item !== 'EMPTY') {
            finalImages.push(new mongoose.Types.ObjectId(item));
          }
        }

        const finalImageIds = finalImages.map((id) => id.toString());

        const imagesToDelete =
          tour.images?.filter(
            (oldImg) => !finalImageIds.includes(oldImg.toString()),
          ) || [];
        
        const bucket = getGridFSBucket();
        for (const imgId of imagesToDelete) {
          try {
            await bucket.delete(imgId);
          } catch (err) {
            console.error(`Не удалось удалить файл ${imgId}:`, err);
          }
        }

        tour.images = finalImages;
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
      const hasLinks = await TourSet.exists({
        tourId: new mongoose.Types.ObjectId(id as string),
      });

      if (hasLinks) {
        return res.status(400).send({
          error:
            'Невозможно удалить тур, так как к нему привязаны активные потоки туров.',
        });
      }

      const tour = await Tour.findById(id as string);

      if (tour && tour.images.length > 0) {
        const bucket = getGridFSBucket();
        try {
          const deletePromises = tour.images.map((id) =>
            bucket.delete(id),
          );

          await Promise.all(deletePromises);
        } catch (error) {
          console.error(error);
        }
      }

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
