import express from 'express';
import auth, { type RequestWithUser } from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import Order from '@/model/order/Order.js';
import type {
  OrderStatus,
  PassportPayload,
  PopulatedOrder,
} from '@/types/orders.types.js';
import mongoose from 'mongoose';
import validateObjectId from '@/middlewares/validateObjectId.js';
import type { ContractData } from '@/types/contracts.types.js';
import { buildContractHTML } from '@/utils/contracts/buildContractHTML.js';
import { getBrowser } from '@/lib/puppeteer.js';
import { generateId } from '@/utils/id/generateId.js';

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

      const rawPage = Number.parseInt(req.query.page as string, 10);
      const rawLimit = Number.parseInt(req.query.limit as string, 10);
      const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
      const limit =
        Number.isFinite(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 50) : 10;

      const skip = (page - 1) * limit;

      const allowed: OrderStatus[] = [
        'NEW',
        'IN_PROGRESS',
        'CONTRACT_PENDING',
        'COMPLETED',
        'REJECTED',
      ];

      if (user.role === 'MANAGER') {
        if (view === 'my') {
          query.managerId = user._id;

          if (typeof status === 'string') {
            if (!allowed.includes(status as OrderStatus)) {
              return res.status(400).send({ error: 'Недопустимый статус' });
            }
            query.status = status as OrderStatus;
          }
        }
        if (view !== 'my') {
          query.status = 'NEW';
          query.managerId = null;
        }
      }

      if (user.role === 'ADMIN') {
        if (typeof status === 'string') {
          if (!allowed.includes(status as OrderStatus)) {
            return res.status(400).send({ error: 'Недопустимый статус' });
          }
          query.status = status as OrderStatus;
        }

        if (typeof managerId === 'string') {
          if (!mongoose.Types.ObjectId.isValid(managerId)) {
            return res.status(400).send({ error: 'Неверный ID менеджера' });
          }
          query.managerId = new mongoose.Types.ObjectId(managerId);
        }
      }

      const totalOrders = await Order.countDocuments(query);

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
        .skip(skip)
        .limit(limit)
        .lean();
      const calculatedPages = Math.ceil(totalOrders / limit);
      const totalPages = calculatedPages === 0 ? 1 : calculatedPages;

      res.send({
        orders,
        meta: {
          total: totalOrders,
          page,
          limit,
          totalPages,
        },
      });
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

      if (!order) return res.status(404).send({ error: 'Заявка не найдена' });
      res.send(order);
    } catch (e) {
      next(e);
    }
  },
);

ordersRouter.post('/', async (req, res, next) => {
  try {
    const { tourSetId, clientName, clientPhone, customTour } = req.body;

    const hasTourSet = Boolean(tourSetId);
    const hasCustom = Boolean(customTour);

    if (hasTourSet && hasCustom) {
      return res
        .status(400)
        .send({ error: 'Заявка не может быть и стандартной, и кастомной' });
    }

    if (!hasTourSet && !hasCustom) {
      return res
        .status(400)
        .send({ error: 'Нужен либо tourSetId, либо customTour' });
    }

    if (!clientName || !clientPhone) {
      return res.status(400).send({ error: 'Отсутствуют обязательные поля' });
    }

    const type = hasTourSet ? 'STANDARD' : 'CUSTOM';

    let visibleId = null;
    let isUnique = false;

    while (!isUnique) {
      visibleId = `ORDER-${generateId(6, 3)}`;
      const existing = await Order.findOne({ visibleId });

      if (!existing) isUnique = true;
    }

    const newOrder = new Order({
      tourSetId,
      clientName,
      clientPhone,
      visibleId,
      type,
      customTour,
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

      if (user.status === 'banned') {
        return res.status(401).send({ error: 'Менеджер забанен' });
      }

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

      order.managerId = user._id;
      if (clientName) order.clientName = clientName;
      if (clientPhone) order.clientPhone = clientPhone;
      if (order.status === 'NEW') order.status = 'IN_PROGRESS';
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
    const { id } = req.params;
    const { user } = req as RequestWithUser;
    
    if (user.status === 'banned') {
      return res.status(401).send({ error: 'Менеджер недоступен' });
    }

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
  },
);

ordersRouter.post(
  '/:id/generate-contract',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const body = req.body as PassportPayload;

      const { passportNumber, passportIssuedBy, passportIssueDate, birthDate } =
        body;

      const requiredFields = [
        passportNumber,
        passportIssuedBy,
        passportIssueDate,
        birthDate,
      ];

      if (requiredFields.some((v) => !v || v.trim() === '')) {
        return res.status(400).send({ error: 'Не все данные указаны' });
      }

      const order = await Order.findById(id)
        .populate({
          path: 'tourSetId',
          populate: { path: 'tourId' },
        })
        .populate('managerId', 'fullName phone')
        .lean<PopulatedOrder>();

      if (!order) return res.status(404).send({ error: 'Заявка не найдена.' });

      if (order.status !== 'CONTRACT_PENDING')
        return res.status(400).send({
          error:
            'Контракт недоступен для генерации только в состоянии CONTRACT_PENDING',
        });

      const contractData: ContractData = {
        client: {
          name: order.clientName,
          phone: order.clientPhone,
          passportNumber,
          passportIssuedBy,
          passportIssueDate,
          birthDate,
        },
        tour: {
          title: order.tourSetId?.tourId?.title,
          startDate: order.tourSetId?.startDate,
          endDate: order.tourSetId?.endDate,
          price: order.tourSetId?.price,
          hotel: order.tourSetId?.hotelName,
        },
        manager: {
          name: order.managerId?.fullName,
          phone: order.managerId?.phone,
        },
      };

      const browser = await getBrowser();
      const page = await browser.newPage();

      try {
        await page.setContent(buildContractHTML(contractData), {
          waitUntil: 'load',
        });

        const pdfBuffer = await page.pdf({
          format: 'A4',
          printBackground: true,
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader(
          'Content-Disposition',
          `attachment; filename=contract.pdf`,
        );

        return res.end(pdfBuffer);
      } finally {
        await page.close();
      }
    } catch (e) {
      next(e);
    }
  },
);

export default ordersRouter;
