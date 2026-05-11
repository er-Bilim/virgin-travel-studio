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

    if (typeof tourId === 'string') {
      if (!mongoose.Types.ObjectId.isValid(tourId)) {
        return res.status(400).send({ error: 'Неверный ID тура' });
      }

      query.tourId = tourId;
    }

    const tourSets = await TourSet.find(query).sort({ startDate: 1 });
    res.send(tourSets);
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
    const tourSet = await TourSet.findById(id).populate('tourId', 'title');

    if (!tourSet) return res.status(404).send({ error: 'Поток не найден' });

    if (!isAdminOrManager && tourSet.status === 'FINISHED') {
      return res
        .status(403)
        .send({ error: 'Доступ к завершенному потоку закрыт' });
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
        !price ||
        !hotelName ||
        !hotelLocation
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
        isHot: Boolean(isHot),
        saleDeadline,
        discountPrice: discountPrice ? Number(discountPrice) : undefined,
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

      const updatedTourSet = await TourSet.findByIdAndUpdate(
        id,
        { $set: updateData },
        { new: true, runValidators: true },
      );

      if (!updatedTourSet)
        return res.status(404).send({ error: 'Поток не найден' });

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
