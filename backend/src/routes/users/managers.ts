import {Router} from 'express';
import permit from '@/middlewares/permit.js';
import auth from '@/middlewares/auth.js';
import User from '@/model/user/User.js';
import mongoose from 'mongoose';
import validateObjectId from "@/middlewares/validateObjectId.js";

const managersRouter = Router();

managersRouter.get('/', auth, permit('ADMIN'), async (req, res, next) => {
    try {
        const managers = await User.find({ role: 'MANAGER' })
            .sort({ createdAt: -1 });
        res.send(managers);
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

managersRouter.delete(
    '/:id',
    auth,
    permit('ADMIN'),
    validateObjectId(),
    async (req, res, next) => {
    const id = req.params.id as string;

    try {
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ error: 'Пользователь не найден' });
        }

        if (user.role !== 'MANAGER') {
            return res.status(400).send({ error: 'Пользователь не является менеджером' });
        }

        await User.findByIdAndDelete(id);

        res.send({ message: 'Менеджер успешно удалён' });
    } catch (e) {
        next(e);
    }
});

export default managersRouter;