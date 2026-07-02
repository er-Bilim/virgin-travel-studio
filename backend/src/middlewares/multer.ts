import multer from 'multer';
import { promises as fs } from 'fs';
import path from 'path';
import { randomUUID } from 'crypto';
import config from '@/config.js';

const imageStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const destDir = path.join(config.publicPath, 'images');
    await fs.mkdir(destDir, { recursive: true });
    cb(null, destDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, randomUUID() + extension);
  },
});

export const videoStorage = multer.diskStorage({
  destination: async (_req, _file, cb) => {
    const destDir = path.join(config.publicPath, 'videos');
    await fs.mkdir(destDir, { recursive: true });
    cb(null, destDir);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    cb(null, randomUUID() + extension);
  },
});

export const videosUpload = multer({
  storage: videoStorage,
  limits: {
    fileSize: 15 * 1024 * 1024,
  },
  fileFilter: (_req, file, callback) => {
    const allowedMimeTypes = ['video/mp4', 'video/webm'];

    if (allowedMimeTypes.includes(file.mimetype)) {
      callback(null, true);
    } else {
      callback(
        new Error(
          'Недопустимый формат. Пожалуйста, загрузите видео в формате MP4 или WebM.',
        ),
      );
    }
  },
});

export const imagesUpload = multer({ storage: imageStorage });

export const combinedUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      if (file.fieldname === 'video') {
        cb(null, 'public/videos');
      } else {
        cb(null, 'public/images'); 
      }
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = file.originalname.split('.').pop();
      cb(
        null,
        `${file.fieldname.replace(/\[|\]/g, '-')}-${uniqueSuffix}.${ext}`,
      );
    },
  }),

  limits: {
    fileSize: 15 * 1024 * 1024,
  },

  fileFilter: (_req, file, callback) => {
    if (file.fieldname === 'video') {
      const allowedVideoTypes = ['video/mp4', 'video/webm'];
      if (allowedVideoTypes.includes(file.mimetype)) {
        return callback(null, true);
      }
      return callback(
        new Error('Недопустимый формат видео. Разрешены только MP4 и WebM.'),
      );
    }

    if (file.fieldname === 'image' || file.fieldname.startsWith('advantages')) {
      const allowedImageTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (allowedImageTypes.includes(file.mimetype)) {
        return callback(null, true);
      }
      return callback(
        new Error(
          'Недопустимый формат изображения. Разрешены JPEG, PNG и WebP.',
        ),
      );
    }

    callback(
      new Error(`Неизвестное поле для загрузки файлов: ${file.fieldname}`),
    );
  },
});