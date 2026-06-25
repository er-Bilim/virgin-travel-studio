import express from 'express';
import auth from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import mongoose from 'mongoose';
import  ContactSettings  from '@/model/contactSettings/ContactSettings.js';

const contactSettingsRouter = express.Router();

contactSettingsRouter.get('/', async (_req, res, next) => {
  try {
    const settings = await ContactSettings.findOne();

    res.send(settings);
  } catch (e) {
    next(e);
  }
});

contactSettingsRouter.post(
  '/',
  auth,
  permit('ADMIN'),
  async (req, res, next) => {
    try {
      const existingSettings = await ContactSettings.findOne();
      if (existingSettings) {
        return res.status(400).send({
          error: 'Ошибка конфигурации',
          details:
            'Запись настроек контактов уже существует. Используйте метод PUT для обновлений.',
        });
      }

      const {
        phone,
        email,
        address,
        whatsapp,
        telegram,
        instagram,
        facebook,
        mapEmbedUrl,
        workingHours,
      } = req.body;

      const settings = new ContactSettings({
        phone,
        email,
        address,
        whatsapp,
        telegram,
        instagram,
        facebook,
        mapEmbedUrl,
        workingHours,
      });

      await settings.save();
      res.status(201).send(settings);
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

contactSettingsRouter.put(
  '/',
  auth,
  permit('ADMIN'),
  async (req, res, next) => {
    try {
      let settings = await ContactSettings.findOne();

      if (!settings) {
        return res
          .status(404)
          .send({ error: 'Настройки контактов не найдены для обновления' });
      }

      const {
        phone,
        email,
        address,
        whatsapp,
        telegram,
        instagram,
        facebook,
        mapEmbedUrl,
        workingHours,
      } = req.body;

      if (phone !== undefined) settings.phone = phone;
      if (email !== undefined) settings.email = email;
      if (address !== undefined) settings.address = address;
      if (whatsapp !== undefined) settings.whatsapp = whatsapp;
      if (telegram !== undefined) settings.telegram = telegram;
      if (instagram !== undefined) settings.instagram = instagram;
      if (facebook !== undefined) settings.facebook = facebook;
      if (mapEmbedUrl !== undefined) settings.mapEmbedUrl = mapEmbedUrl;

      if (workingHours !== undefined) {
        if (!settings.workingHours) {
          settings.workingHours = {
            weekdays: { from: '09:00', to: '18:00' },
            saturday: { isClosed: false, from: '09:00', to: '18:00' },
            sunday: { isClosed: true, from: '', to: '' },
          };
        }

        const currentWorkingHours = settings.workingHours!;

        if (workingHours.weekdays !== undefined) {
          currentWorkingHours.weekdays = {
            ...currentWorkingHours.weekdays,
            ...workingHours.weekdays,
          };
        }

        if (workingHours.saturday !== undefined) {
          currentWorkingHours.saturday = {
            ...currentWorkingHours.saturday,
            ...workingHours.saturday,
          };
        }

        if (workingHours.sunday !== undefined) {
          currentWorkingHours.sunday = {
            ...currentWorkingHours.sunday,
            ...workingHours.sunday,
          };
        }

        settings.workingHours = currentWorkingHours;
      }

      await settings.save();
      res.send({ message: 'Настройки контактов успешно обновлены', settings });
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

export default contactSettingsRouter;
