import express from 'express';
import mongoose from 'mongoose';
import auth from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import validateObjectId from '@/middlewares/validateObjectId.js';
import Faq from '@/model/faq/Faq.js';

const faqRouter = express.Router();

faqRouter.get('/', async (_req, res, next) => {
  try {
    const faqs = await Faq.find({ isPublished: true }).sort({
      order: 1,
      createdAt: -1,
    });
    res.send(faqs);
  } catch (e) {
    next(e);
  }
});

faqRouter.get('/admin', auth, permit('ADMIN'), async (_req, res, next) => {
  try {
    const faqs = await Faq.find().sort({ order: 1, createdAt: -1 });
    res.send(faqs);
  } catch (e) {
    next(e);
  }
});

faqRouter.post('/', auth, permit('ADMIN'), async (req, res, next) => {
  try {
    const { question, answer, isPublished } = req.body;

    const faq = new Faq({
      question,
      answer,
      isPublished: isPublished === true || isPublished === 'true',
    });

    const savedFaq = await faq.save();

    res.send({
      message: 'Вопрос добавлен',
      faq: savedFaq,
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

faqRouter.put('/reorder', auth, permit('ADMIN'), async (req, res, next) => {
  try {
    const { ids } = req.body as { ids: string[] };

    if (!Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .send({ error: 'Передан неверный формат или пустой массив ID' });
    }

    const bulkOps = ids.map((id, index) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { order: index + 1 } },
      },
    }));

    await Faq.bulkWrite(bulkOps);

    res.send({ message: 'Порядок вопросов успешно изменен' });
  } catch (e) {
    next(e);
  }
});

faqRouter.patch(
  '/:id/isPublished',
  auth,
  permit('ADMIN'),
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const faq = await Faq.findById(id);
      if (!faq) {
        return res.status(404).send({ error: 'Вопрос не найден' });
      }

      faq.isPublished = !faq.isPublished;
      await faq.save();

      return res.send(faq);
    } catch (e) {
      next(e);
    }
  },
);

faqRouter.patch(
  '/:id/edit',
  auth,
  permit('ADMIN'),
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const faq = await Faq.findById(id);
      if (!faq) {
        return res.status(404).send({ error: 'Вопрос не найден' });
      }

      const { question, answer } = req.body;
      const updateData: Partial<{ question: string; answer: string }> = {};

      if (question) updateData.question = question;
      if (answer) updateData.answer = answer;

      const updated = await Faq.findByIdAndUpdate(id, updateData, {
        returnDocument: 'after',
        runValidators: true,
      });

      res.send({
        message: 'Вопрос обновлен',
        faq: updated,
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
  },
);

faqRouter.delete(
  '/:id',
  auth,
  permit('ADMIN'),
  validateObjectId(),
  async (req, res, next) => {
    const { id } = req.params;

    try {
      const { deletedCount } = await Faq.deleteOne({ _id: id });
      if (!deletedCount) {
        return res.status(404).send({ error: 'Вопрос не найден' });
      }

      return res.send({ message: 'Вопрос удален' });
    } catch (e) {
      next(e);
    }
  },
);

export default faqRouter;
