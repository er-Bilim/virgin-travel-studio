import fs from 'fs/promises';
import path from 'path';
import config from '@/config.js';

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

export default deleteFile;
