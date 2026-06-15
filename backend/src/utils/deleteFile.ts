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
    const err = error as NodeJS.ErrnoException;

    if (err.code !== 'ENOENT') {
      console.error(`Ошибка при удалении файла ${absolutePath}:`, err);
    }
  }
};
export default deleteFile;
