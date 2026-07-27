import { randomUUID } from 'crypto';
import { getGridFSBucket } from '@/index.js';

export const uploadImageToGridFS = async (
  file: Express.Multer.File,
): Promise<string> => {
  const bucket = getGridFSBucket();
  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(randomUUID(), {
      metadata: { contentType: file.mimetype },
    });
    stream.on('error', reject);
    stream.on('finish', () => resolve(stream.id.toString()));
    stream.end(file.buffer);
  });
};

export const uploadVideoToGridFS = async (
  file: Express.Multer.File,
): Promise<string> => {
  const bucket = getGridFSBucket();
  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(randomUUID(), {
      metadata: { contentType: file.mimetype },
    });
    stream.on('error', reject);
    stream.on('finish', () => resolve(stream.id.toString()));
    stream.end(file.buffer);
  });
};
