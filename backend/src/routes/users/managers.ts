import {Router} from 'express';
import permit from '@/middlewares/permit.js';
import auth, {type RequestWithUser} from '@/middlewares/auth.js';
import User from '@/model/user/User.js';
import mongoose from 'mongoose';
import validateObjectId from '@/middlewares/validateObjectId.js';
import Order from '@/model/order/Order.js';

const managersRouter = Router();

managersRouter.get(
  '/',
  auth,
  permit('ADMIN', 'MANAGER'),
  async (req, res, next) => {
    try {
      const query: {
          role: 'MANAGER';
          fullName?: { $regex: string; $options: string };
          status?: 'active' | 'banned';
      } = { role: 'MANAGER' };

      if (typeof req.query.fullName === 'string' && req.query.fullName.trim()) {
          query.fullName = { $regex: req.query.fullName.trim(), $options: 'i' };
      }

      if (req.query.status === 'active' || req.query.status === 'banned') {
          query.status = req.query.status
      }

      const managers = await User.find(query).sort({ createdAt: -1 });
      res.send(managers);
    } catch (e) {
      next(e);
    }
  },
);

managersRouter.get('/:id',
    auth,
    permit('ADMIN', 'MANAGER'),
    validateObjectId(),
    async (req, res, next) => {
    try {
        const { id } = req.params;

        const manager = await User.findById(id);

        if (!manager) {
            return res.status(404).send({ error: 'Пользователь не найден' });
        }

        if (manager.role !== 'MANAGER') {
            return res.status(403).send({ error: 'Пользователь не является менеджером' });
        }

        res.send(manager);
    } catch (e) {
        next(e);
    }
});

managersRouter.post('/', auth, permit('ADMIN'), async (req, res, next) => {
    try {
        const { phone } = req.body;

        const existingUser = await User.findOne({ phone });

        if (existingUser) {
            return res.status(409).send({
                error: 'Пользователь уже существует',
            });
        }

        const manager = new User({
            fullName: req.body.fullName,
            phone: req.body.phone,
            password: req.body.password,
            role: 'MANAGER',
        });

        await manager.save();

        res.send({
            message: 'Менеджер успешно создан',
            user: manager,
        });

    } catch (e) {
        if (e instanceof mongoose.Error.ValidationError) {
            return res.status(400).send({
                error: 'Ошибка валидации',
                details: e.errors,
            });
        }
        next(e);
    }
});

managersRouter.put('/:id', auth, permit('ADMIN'), validateObjectId(), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { phone } = req.body;

    const existingPhone = await User.findOne({ phone });

    if (existingPhone && String(existingPhone._id) !== id) {
      return res.status(409).send({
        error: 'Пользователь с таким номером уже существует',
      });
    }

    const existingUser = await User.findById(id);

    if (!existingUser) {
      return res.status(409).send({
        error: 'Пользователь не найден',
      });
    }

    const data = {
      fullName: req.body.fullName,
      phone: phone,
      status: req.body.status,
    };

   const updatedManager = await existingUser.updateOne(data);

    res.send({
      message: 'Менеджер успешно обновлён',
      user: updatedManager,
    });
  } catch (e) {
    if (e instanceof mongoose.Error.ValidationError) {
      return res.status(400).send({
        error: 'Ошибка валидации',
        details: e.errors,
      });
    }
    next(e);
  }
});

managersRouter.patch(
    '/:id',
    auth,
    permit('ADMIN'),
    validateObjectId(),
    async (req, res, next) => {
    const id = req.params.id as string;
    const { user: admin } = req as RequestWithUser;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ error: 'Пользователь не найден' });
        }

        if (user.role !== 'MANAGER') {
            return res.status(400).send({ error: 'Пользователь не является менеджером' });
        }

        if (user.status === 'active') {
          user.status = 'banned'

          await Order.updateMany(
            {
                managerId: user._id,
                status: 'IN_PROGRESS'
            },
            {
                $set: { managerId: admin._id },
            },
          );

        } else user.status = 'active'

        await user.save()

        const text = user.status === 'active' ? 'Разбанен' : 'Забанен'
        res.send({ message: `Менеджер успешно ${text}` });
    } catch (e) {
        next(e);
    }
});

export default managersRouter;