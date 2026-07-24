import fs from 'fs/promises';
import path from 'path';
import { ObjectId } from 'mongodb';
import config from '@/config.js';
import { getGridFSBucket } from '@/index.js';

const deleteFile = async (
  filePath: string | undefined | null,
): Promise<void> => {
  if (!filePath) return;
  const absolutePath = path.isAbsolute(filePath)
    ? filePath
    : path.join(config.publicPath, filePath);
  try {
    await fs.unlink(absolutePath);
  } catch (error) {

    const nodeError = error as NodeJS.ErrnoException;

    if (nodeError.code === 'ENOENT') {
      console.warn(`Файл не найден для удаления: ${filePath}`);
      return;
    }
      console.error(error);
      throw nodeError;
    }
};

export const deleteGridFSFile = async (
  id: string | undefined | null,
): Promise<void> => {
  if (!id) return;
  try {
    const bucket = getGridFSBucket();
    await bucket.delete(new ObjectId(id));
  } catch (error) {
    console.warn(`GridFS файл не найден или не удалён: ${id}`, error);
  }
};

export default deleteFile;
