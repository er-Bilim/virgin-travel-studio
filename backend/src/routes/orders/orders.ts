import express from 'express';
import auth, {RequestWithUser} from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import Order from '@/model/order/Order.js';
import {OrderStatus} from '@/types/orders.types.js';
import mongoose from 'mongoose';

const ordersRouter = express.Router();

ordersRouter.get('/', auth, permit('ADMIN', 'MANAGER'), async (req, res, next) => {
    try {
        const { user } = req as RequestWithUser;
        const { view, status, managerId } = req.query;

        const query: {
            status?: OrderStatus | { $ne: OrderStatus };
            managerId?: mongoose.Types.ObjectId | null;
        } = {};

        if (user.role === 'MANAGER') {
            if (view === 'my') {
                query.managerId = user._id;
            } else {
                query.status = 'NEW';
                query.managerId = null;
            }
        }

        if (user.role === 'ADMIN') {
            const allowed: OrderStatus[] = ['NEW', 'IN_PROGRESS', 'CONTRACT_PENDING', 'COMPLETED', 'REJECTED'];

            if (typeof status === 'string') {
                if (!allowed.includes(status as OrderStatus)) {
                    return res.status(400).send({ error: 'Недопустимый статус' });
                }
                query.status = status as OrderStatus;
            }

            if (typeof managerId === 'string') {
                if (!mongoose.Types.ObjectId.isValid(managerId)) {
                    return res.status(400).send({ error: 'Неверный ID менеджера' })
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
                    select: 'title'
                }
            })
            .sort({ createdAt: -1 })
            .lean();

        res.send(orders);
    } catch (e) {
        next(e);
    }
});

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
             message: 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время',
             order: newOrder
         });
    } catch (e) {
        if (e instanceof mongoose.Error.ValidationError) {
            return res.status(400).send({ error: 'Ошибка валидации', details: e.errors });
        }
    }
});

ordersRouter.patch('/:id', auth, permit('ADMIN', 'MANAGER'), async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;
        const { user } = req as RequestWithUser;

        if (!mongoose.Types.ObjectId.isValid(id as string)) {
            return res.status(400).send({ error: 'Неверный ID' });
        }

        const allowedStatuses: OrderStatus[] = ['NEW', 'IN_PROGRESS', 'CONTRACT_PENDING', 'COMPLETED', 'REJECTED',];

        if (!allowedStatuses.includes(status as OrderStatus)) {
            return res.status(400).send({
                error: 'Недопустимый статус',
            });
        }

        const order = await Order.findById(id);

        if (!order) return res.status(404).send({ error: 'Заявка не найдена' });

        if (order.status === 'NEW' && !order.managerId && user.role === 'MANAGER') {
            order.managerId = user._id;
            order.status = 'IN_PROGRESS';
        }

        if (user.role === 'MANAGER' && order.managerId && !order.managerId.equals(user._id)) {
           return res.status(403).send({ error: 'Вы не можете редактировать чужой заказ' })
        }

        if (status) order.status = status as OrderStatus;
        if (rejectionReason) order.rejectionReason = rejectionReason;

        await order.save();

        const updatedOrder = await Order.findById(order._id)
            .populate('managerId', 'fullName phone')
            .populate({
                path: 'tourSetId',
                populate: { path: 'tourId', select: 'title' }
            });

        res.send({ message: 'Статус успешно обновлен', order: updatedOrder  });
    } catch (e) {
        if (e instanceof mongoose.Error.ValidationError) {
            return res.status(400).send({ error: 'Ошибка валидации', details: e.errors });
        }
        next(e);
    }
});

export default ordersRouter;