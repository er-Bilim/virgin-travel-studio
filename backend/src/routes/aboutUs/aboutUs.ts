import express from 'express';
import mongoose from 'mongoose';
import AboutUs from '@/model/aboutUs/AboutUs.js';
import type {AboutUsFields, AboutUsFieldsMutation} from '@/types/aboutUs.types.js';
import auth from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';

const aboutUsRouter = express.Router();

aboutUsRouter.get('/', async (req, res, next) => {
    try {
        const content = await AboutUs.findOne();

        if (!content) {
            return res.status(404).send({ error: 'Контент не найден' });
        }

        res.send(content);
    } catch (e) {
        next(e);
    }
});

aboutUsRouter.put('/', auth, permit('ADMIN'), async (req, res, next) => {
    try {
        const {
            pageTitle, description,
            contentBlocks, missionTitle,
            missionBody, ideaLabel,
            ideaTitle, ideaDescription,
            ideaBlocks, heroCardTitle,
            heroCardBody, steps,
        } = req.body as AboutUsFields;

        const content = await AboutUs.findOneAndUpdate(
            {},
            {
                pageTitle, description, contentBlocks,
                missionTitle, missionBody, ideaLabel,
                ideaTitle, ideaDescription, ideaBlocks,
                heroCardTitle, heroCardBody, steps,
            }, { new: true, upsert: true, runValidators: true },
        );

        return res.send({ message: 'Контент обновлён', content });
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

aboutUsRouter.post('/', auth, permit('ADMIN'), async (req, res, next) => {
  try {
    const {
      pageTitle,
      description,
      contentBlocks,
      missionTitle,
      missionBody,
      ideaLabel,
      ideaTitle,
      ideaDescription,
      ideaBlocks,
      heroCardTitle,
      heroCardBody,
      steps,
    } = req.body as AboutUsFieldsMutation;

    const content = new AboutUs(
      {
        pageTitle,
        description,
        contentBlocks,
        missionTitle,
        missionBody,
        ideaLabel,
        ideaTitle,
        ideaDescription,
        ideaBlocks,
        heroCardTitle,
        heroCardBody,
        steps,
      }
    );
    await content.save()
    return res.status(201).send({ message: 'Контент добавлен', content });
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

export default aboutUsRouter;