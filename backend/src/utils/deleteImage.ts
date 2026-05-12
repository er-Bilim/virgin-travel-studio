import fs from 'fs/promises';
import path from 'path';
import config from '@/config.js';

const deleteImage = async (
  filePath: string | undefined | null,
): Promise<void> => {
  if (!filePath) return;
  try {
    await fs.unlink(path.join(config.publicPath, filePath));
  } catch (error) {
    console.error(error);
  }
};

export default deleteImage;
