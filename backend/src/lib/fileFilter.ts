import type { Request } from 'express';
import type multer from 'multer';
import {
  ALLOWED_VIDEO_TYPES,
  ALLOWED_IMAGE_TYPES,
} from '../constants/constants.js';

const fileFilterImage = ({
  req,
  file,
  callback,
}: {
  req?: Request;
  file: Express.Multer.File;
  callback: multer.FileFilterCallback;
}) => {
  if (file.fieldname === 'video') {
    const allowedVideoTypes = ALLOWED_VIDEO_TYPES;
    if (allowedVideoTypes.includes(file.mimetype)) {
      return callback(null, true);
    }
    return callback(
      new Error(
        `Недопустимый формат видео. Разрешены только ${ALLOWED_VIDEO_TYPES.join(', ')}`,
      ),
    );
  }

  if (
    file.fieldname === 'image' ||
    file.fieldname.startsWith('advantages') ||
    file.fieldname === 'images'
  ) {
    const allowedImageTypes = ALLOWED_IMAGE_TYPES;
    if (allowedImageTypes.includes(file.mimetype)) {
      return callback(null, true);
    }
    return callback(
      new Error(
        `Недопустимый формат изображения. Разрешены ${ALLOWED_IMAGE_TYPES.join(', ')} `,
      ),
    );
  }

  callback(
    new Error(`Неизвестное поле для загрузки файлов: ${file.fieldname}`),
  );
};

export default fileFilterImage;
