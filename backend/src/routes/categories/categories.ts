import express from 'express';
import mongoose from 'mongoose';
import Category from '@/model/category/Category.js';
import Tour from '@/model/tour/Tour.js';
import auth from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import validateObjectId from '@/middlewares/validateObjectId.js';

const categoriesRouter = express.Router();

categoriesRouter.post(
  '/',
  auth,
  permit('ADMIN', 'MANAGER'),
  async (req, res, next) => {
    const { title } = req.body;
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).send({ error: 'Название обязательно' });
    }

    try {
      const newCategory = new Category({ title: title.trim() });
      await newCategory.save();
      return res.send(newCategory);
    } catch (e) {
      if (e instanceof mongoose.Error.ValidationError) {
        return res.status(400).send({
          error: 'Ошибка валидации',
          details: e.errors,
        });
      }

      if (e instanceof mongoose.mongo.MongoServerError && e.code === 11000) {
        return res.status(409).send({
          error: 'Категория с таким названием уже существует',
        });
      }
      next(e);
    }
  },
);

categoriesRouter.get('/', async (req, res) => {
  const result = await Category.find();
  return res.send(result);
});

categoriesRouter.patch(
  '/:id',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).send({ error: 'Категория не найдена' });
      }

      category.isPublished = !category.isPublished;
      await category.save();
      return res.send(category);
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
);

categoriesRouter.delete(
  '/:id',
  auth,
  permit('ADMIN', 'MANAGER'),
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const tourWithCategory = await Tour.findOne({
        category: new mongoose.Types.ObjectId(id as string),
      });

      if (tourWithCategory) {
        return res.status(400).send({
          error:
            'Нельзя удалить категорию, так как к ней привязаны туры. Сначала удалите или перенесите эти туры',
        });
      }

      const { deletedCount } = await Category.deleteOne({ _id: id });
      if (!deletedCount) {
        return res.status(404).send({ error: 'Категория не найдена' });
      }
      return res.send({ message: 'Категория успешно удалена' });
    } catch (e) {
      console.log(e);
      next(e);
    }
  },
);

export default categoriesRouter;
