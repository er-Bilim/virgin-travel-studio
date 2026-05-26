import express from 'express';
import mongoose, { type UpdateQuery } from 'mongoose';
import auth, { authOrNot, type RequestWithUser } from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import TourSet from '@/model/tourSet/TourSet.js';
import type { TourSetFields, TourSetStatus } from '@/types/tourSets.types.js';
import validateObjectId from '@/middlewares/validateObjectId.js';
import Tour from '@/model/tour/Tour.js';

const tourSetsRouter = express.Router();

tourSetsRouter.get('/', authOrNot, async (req, res, next) => {
  try {
    const { tourId, title, categoryId, maxPrice, startDate, endDate } =
      req.query;
    const { user } = req as RequestWithUser;
    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const query: {
      status?: TourSetStatus | { $ne: TourSetStatus };
      tourId?:
        | mongoose.Types.ObjectId
        | string
        | { $in: mongoose.Types.ObjectId[] };
      price?: { $lte: number };
      startDate?: { $gte: Date } | { $gte: Date; $lte: Date };
    } = {};

    if (!isAdminOrManager) {
      query.status = { $ne: 'FINISHED' };
    }

    if (typeof tourId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        return res.status(400).send({ error: 'Неверный ID тура' });
      }
      query.tourId = tourId;
    }

    if (typeof title === 'string' || typeof categoryId === 'string') {
      const tourConditions: {
        title?: { $regex: string; $options: string };
        category?: string;
      } = {};

      if (typeof title === 'string' && title.trim() !== '') {
        tourConditions.title = { $regex: title.trim(), $options: 'i' };
      }

      if (typeof categoryId === 'string' && categoryId !== 'all') {
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
          return res.status(400).send({ error: 'Неверный ID категории' });
        }
        tourConditions.category = categoryId;
      }

      const matchingTours = await Tour.find(tourConditions)
        .select('_id')
        .lean();
      const tourIds = matchingTours.map(
        (t) => t._id as mongoose.Types.ObjectId,
      );

      if (query.tourId) {
        const singleTourIdStr = (query.tourId as string).toString();
        const hasMatch = tourIds.some(
          (id) => id.toString() === singleTourIdStr,
        );
        query.tourId = hasMatch
          ? { $in: [new mongoose.Types.ObjectId(singleTourIdStr)] }
          : { $in: [] };
      } else {
        query.tourId = { $in: tourIds };
      }
    }

    if (typeof maxPrice === 'string' && maxPrice.trim() !== '') {
      const parsedMaxPrice = Number(maxPrice);
      if (!Number.isNaN(parsedMaxPrice)) {
        query.price = { $lte: parsedMaxPrice };
      }
    }

    if (typeof startDate === 'string' && startDate.trim() !== '') {
      const parsedStart = new Date(startDate);

      if (!Number.isNaN(parsedStart.getTime())) {
        const dateFilter: { $gte: Date; $lte?: Date } = { $gte: parsedStart };

        if (typeof endDate === 'string' && endDate.trim() !== '') {
          const parsedEnd = new Date(endDate);

          if (!Number.isNaN(parsedEnd.getTime())) {
            dateFilter.$lte = parsedEnd;
          }
        }

        query.startDate = dateFilter;
      }
    }

    const rawPage = Number.parseInt(req.query.page as string, 10);
    const rawLimit = Number.parseInt(req.query.limit as string, 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 10;
    const skip = (page - 1) * limit;

    const totalTourSets = await TourSet.countDocuments(query);

    const tourSets = await TourSet.find(query)
      .sort({ startDate: 1 })
      .skip(skip)
      .limit(limit)
      .populate({
        path: 'tourId',
        select: 'title description images category baseAdvantages',
        populate: {
          path: 'category',
          select: 'title',
        },
      });

    res.send({
      tourSets,
      meta: {
        total: totalTourSets,
        page,
        limit,
        totalPages: Math.ceil(totalTourSets / limit),
      },
    });
  } catch (e) {
    next(e);
  }
});

tourSetsRouter.get(
  '/:id',
  authOrNot,
  validateObjectId(),
  async (req, res, next) => {
    const { user } = req as RequestWithUser;
    const { id } = req.params;
    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).send({ error: 'Неверный ID потока' });
    }

    try {
      const tourSet = await TourSet.findById(id).populate({
        path: 'tourId',
        select:
          'title description images category baseAdvantages reviews rating ratingCount',
        populate: {
          path: 'category',
          select: 'title',
        },
      });

      if (!tourSet) return res.status(404).send({ error: 'Поток не найден' });

      if (!isAdminOrManager && tourSet.status === 'FINISHED') {
        return res.status(404).send({ error: 'Поток не найден' });
      }

      res.send(tourSet);
    } catch (e) {
      next(e);
    }
  },
);

tourSetsRouter.post(
  '/',
  auth,
  permit('ADMIN', 'MANAGER'),
  async (req, res, next) => {
    try {
      const {
        tourId,
        startDate,
        endDate,
        price,
        hotelName,
        hotelLocation,
        airline,
        flightDetails,
        totalSeats,
        isHot,
        saleDeadline,
        discountPrice,
        status,
      } = req.body;

      if (
        !tourId ||
        !startDate ||
        !endDate ||
        price === undefined ||
        price === null ||
        hotelName === undefined ||
        hotelLocation === undefined
      ) {
        return res.status(400).send({ error: 'Отсутствуют обязательные поля' });
      }

      if (new Date(startDate) > new Date(endDate)) {
        return res
          .status(400)
          .send({ error: 'Дата начала не может быть позже даты окончания' });
      }

      const tourSetData = {
        tourId,
        startDate,
        endDate,
        price: Number(price),
        hotelName,
        hotelLocation,
        airline,
        flightDetails,
        totalSeats: totalSeats !== undefined ? Number(totalSeats) : 20,
        isHot:
          isHot === true || isHot === 'true' || isHot === 1 || isHot === '1',
        saleDeadline,
        discountPrice:
          discountPrice !== undefined ? Number(discountPrice) : undefined,
        status: status || 'OPEN',
        bookedSeats: 0,
      };

      const tourSet = new TourSet(tourSetData);
      await tourSet.save();

      res.send({
        message: 'Поток тура успешно создан',
        tourSet,
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

tourSetsRouter.patch(
  '/:id',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const currentSet = await TourSet.findById(id);
      if (!currentSet) {
        return res.status(404).send({ error: 'Поток не найден' });
      }

      const updateData: UpdateQuery<TourSetFields> = {};
      const allowedFields: (keyof TourSetFields)[] = [
        'startDate',
        'endDate',
        'price',
        'hotelName',
        'hotelLocation',
        'airline',
        'flightDetails',
        'totalSeats',
        'isHot',
        'saleDeadline',
        'discountPrice',
        'status',
      ];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          updateData[field] = req.body[field];
        }
      });

      if (Object.keys(updateData).length === 0) {
        return res.status(400).send({ error: 'Нет данных для обновления' });
      }

      const nextStart = updateData.startDate ?? currentSet.startDate;
      const nextEnd = updateData.endDate ?? currentSet.endDate;

      if (new Date(nextStart as Date) > new Date(nextEnd as Date)) {
        return res.status(400).send({
          error: 'Дата начала не может быть позже даты окончания',
        });
      }

      const updatedTourSet = await TourSet.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      res.send({ message: 'Данные потока обновлены', tourSet: updatedTourSet });
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

tourSetsRouter.delete(
  '/:id',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const deletedTourSet = await TourSet.findByIdAndDelete(id);

      if (!deletedTourSet) {
        return res.status(404).send({ error: 'Поток не найден' });
      }

      res.send({ message: 'Поток тура успешно удален', id });
    } catch (e) {
      next(e);
    }
  },
);

export default tourSetsRouter;
