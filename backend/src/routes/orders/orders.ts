import express from 'express';
import auth, { type RequestWithUser} from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import Order from '@/model/order/Order.js';
import type {OrderStatus} from '@/types/orders.types.js';
import mongoose from 'mongoose';
import { populate } from 'dotenv';
import validateObjectId from '@/middlewares/validateObjectId.js';

const ordersRouter = express.Router();

ordersRouter.get(
  '/',
  auth,
  permit('ADMIN', 'MANAGER'),
  async (req, res, next) => {
    try {
      const { user } = req as RequestWithUser;
      const { view, status, managerId } = req.query;

      const query: {
        status?: OrderStatus | { $ne: OrderStatus };
        managerId?: mongoose.Types.ObjectId | null;
      } = {};

      // if (user.role === 'MANAGER') {
      //   if (view === 'my') {
      //     query.managerId = user._id;
      //   } else {
      //     query.status = 'NEW';
      //     query.managerId = null;
      //   }
      // }
      const allowed: OrderStatus[] = [
        'NEW',
        'IN_PROGRESS',
        'CONTRACT_PENDING',
        'COMPLETED',
        'REJECTED',
      ];

      if (typeof status === 'string') {
        if (!allowed.includes(status as OrderStatus)) {
          return res.status(400).send({ error: 'Недопустимый статус' });
        }
        query.status = status as OrderStatus;
      }

      if (user.role === 'ADMIN') {
        if (typeof managerId === 'string') {
          if (!mongoose.Types.ObjectId.isValid(managerId)) {
            return res.status(400).send({ error: 'Неверный ID менеджера' });
          }
          query.managerId = new mongoose.Types.ObjectId(managerId);
        }
      }

      const orders = await Order.find(query)
        .populate('managerId', 'fullName phone')
        .populate({
          path: 'tourSetId',
          select: 'startDate endDate price hotelName',
          populate: {
            path: 'tourId',
            select: 'title',
          },
        })
        .sort({ createdAt: -1 })
        .lean();

      res.send(orders);
    } catch (e) {
      next(e);
    }
  },
);

ordersRouter.get(
  '/:id',
  auth,
  permit('ADMIN', 'MANAGER'),
  async (req, res, next) => {
    try {
      const { id } = req.params;

      const order = await Order.findById(id)
        .populate('managerId', 'fullName phone')
        .populate({
          path: 'tourSetId',
          select: 'startDate endDate price hotelName',
          populate: {
            path: 'tourId',
            select: 'title category',
            populate: {
              path: 'category',
              select: 'title',
            },
          },
        })
        .sort({ createdAt: -1 })
        .lean();

      if (!order) return res.status(404).send({error: 'Заявка не найдена'});
      res.send(order);
    } catch (e) {
      next(e);
    }
  },
);

ordersRouter.post('/', async (req, res, next) => {
  try {
    const { tourSetId, clientName, clientPhone } = req.body;

    if (!tourSetId || !clientName || !clientPhone) {
      return res.status(400).send({ error: 'Отсутствуют обязательные поля' });
    }

    const newOrder = new Order({
      tourSetId,
      clientName,
      clientPhone,
    });

    await newOrder.save();
    res.send({
      message:
        'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время',
      order: newOrder,
    });
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res
        .status(400)
        .send({ error: 'Ошибка валидации', details: e.errors });
    }
    next(e);
  }
});

ordersRouter.patch(
  '/:id',
  auth,
  permit('ADMIN', 'MANAGER'),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { clientName, clientPhone, status, rejectionReason } = req.body;
      const { user } = req as RequestWithUser;

      if (!mongoose.Types.ObjectId.isValid(id as string)) {
        return res.status(400).send({ error: 'Неверный ID' });
      }

      const allowedStatuses: OrderStatus[] = [
        'NEW',
        'IN_PROGRESS',
        'CONTRACT_PENDING',
        'COMPLETED',
        'REJECTED',
      ];

      if (!allowedStatuses.includes(status as OrderStatus)) {
        return res.status(400).send({
          error: 'Недопустимый статус',
        });
      }

      const order = await Order.findById(id);

      if (!order) return res.status(404).send({ error: 'Заявка не найдена' });
      
      // if (
      //   order.managerId &&
      //   !order.managerId.equals(user._id)
      // ) {
      //   return res
      //     .status(403)
      //     .send({ error: 'Вы не можете редактировать чужой заказ' });
      // }

      order.managerId = user._id;
      if (clientName) order.clientName = clientName;
      if (clientPhone) order.clientPhone = clientPhone;
      if (order.status === "NEW") order.status = 'IN_PROGRESS';
      if (status) order.status = status as OrderStatus;
      if (rejectionReason) order.rejectionReason = rejectionReason;

      await order.save();

      const updatedOrder = await Order.findById(order._id)
        .populate('managerId', 'fullName phone')
        .populate({
          path: 'tourSetId',
          populate: { path: 'tourId', select: 'title' },
        });

      res.send({ message: 'Статус успешно обновлен', order: updatedOrder });
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

ordersRouter.delete(
  '/:id', 
  auth,
  permit('ADMIN', 'MANAGER'), 
  validateObjectId(),
  async (req, res, next) => {
  const {id} = req.params;
    try {
      const { deletedCount } = await Order.deleteOne({ _id: id as string });
      if (!deletedCount) {
        return res.status(404).send({
          error: 'Заявка не найдена',
        });
      }

      return res.send({
        message: 'Заявка удалена',
      });
    } catch (e) {
      next(e);
    }
});

export default ordersRouter;
