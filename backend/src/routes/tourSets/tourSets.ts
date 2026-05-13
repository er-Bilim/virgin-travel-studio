import express from 'express';
import mongoose, { UpdateQuery } from 'mongoose';
import auth, { authOrNot, RequestWithUser } from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import TourSet from '@/model/tourSet/TourSet.js';
import { TourSetFields, TourSetStatus } from '@/types/tourSets.types.js';

const tourSetsRouter = express.Router();

tourSetsRouter.get('/', authOrNot, async (req, res, next) => {
  try {
    const { tourId } = req.query;
    const { user } = req as RequestWithUser;
    const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

    const query: {
      tourId?: string;
      status?: TourSetStatus | { $ne: TourSetStatus };
    } = {};

    if (!isAdminOrManager) {
      query.status = { $ne: 'FINISHED' };
    }

    const rawPage = Number.parseInt(req.query.page as string, 10);
    const rawLimit = Number.parseInt(req.query.limit as string, 10);
    const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    const limit =
      Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 10;

    const skip = (page - 1) * limit;

    if (typeof tourId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        return res.status(400).send({ error: 'Неверный ID тура' });
      }

      query.tourId = tourId;
    }
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

tourSetsRouter.get('/:id', authOrNot, async (req, res, next) => {
  const { user } = req as RequestWithUser;
  const { id } = req.params;
  const isAdminOrManager = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  if (!mongoose.Types.ObjectId.isValid(id as string)) {
    return res.status(400).send({ error: 'Неверный ID потока' });
  }

  try {
    const tourSet = await TourSet.findById(id).populate({
      path: 'tourId',
      select: 'title description images category baseAdvantages',
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
});

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
  async (req, res, next) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id as string)) {
      return res.status(400).send({ error: 'Неверный ID' });
    }

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

export default tourSetsRouter;
