import express from 'express';
import auth from '@/middlewares/auth.js';
import permit from '@/middlewares/permit.js';
import mongoose from 'mongoose';
import ContactSettings from '@/model/contactSettings/ContactSettings.js';
import { imagesUpload } from '@/middlewares/multer.js';

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
    imagesUpload.single('logo'),
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

      const logo = req.file ? `images/${req.file.filename}` : undefined;
      const parsedWorkingHours =
          typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;

      const settings = new ContactSettings({
        phone,
        email,
        address,
        whatsapp,
        telegram,
        instagram,
        facebook,
        mapEmbedUrl,
        logo,
        workingHours: parsedWorkingHours,
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
    imagesUpload.single('logo'),
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

      const parsedWorkingHours =
          typeof workingHours === 'string' ? JSON.parse(workingHours) : workingHours;

      if (phone !== undefined) settings.phone = phone;
      if (email !== undefined) settings.email = email;
      if (address !== undefined) settings.address = address;
      if (whatsapp !== undefined) settings.whatsapp = whatsapp;
      if (telegram !== undefined) settings.telegram = telegram;
      if (instagram !== undefined) settings.instagram = instagram;
      if (facebook !== undefined) settings.facebook = facebook;
      if (mapEmbedUrl !== undefined) settings.mapEmbedUrl = mapEmbedUrl;
      if (req.file) {
        settings.logo = `images/${req.file.filename}`;
      }

      if (parsedWorkingHours !== undefined) {
        if (!settings.workingHours) {
          settings.workingHours = {
            weekdays: { from: '09:00', to: '18:00' },
            saturday: { isClosed: false, from: '09:00', to: '18:00' },
            sunday: { isClosed: true, from: '', to: '' },
          };
        }

        const currentWorkingHours = settings.workingHours!;

        if (parsedWorkingHours.weekdays !== undefined) {
          currentWorkingHours.weekdays = {
            ...currentWorkingHours.weekdays,
            ...parsedWorkingHours.weekdays,
          };
        }

        if (parsedWorkingHours.saturday !== undefined) {
          currentWorkingHours.saturday = {
            ...currentWorkingHours.saturday,
            ...parsedWorkingHours.saturday,
          };
        }

        if (parsedWorkingHours.sunday !== undefined) {
          currentWorkingHours.sunday = {
            ...currentWorkingHours.sunday,
            ...parsedWorkingHours.sunday,
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
