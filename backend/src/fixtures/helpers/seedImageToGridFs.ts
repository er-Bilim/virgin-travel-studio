import path from 'path';
import fs from 'fs/promises';
import config from '@/config.js';
import type { GridFSBucket } from 'mongodb';

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

const seedImageToGridFs = async (
  bucket: GridFSBucket,
  imageField: string,
): Promise<string> => {
  const cleanName = imageField.replace(/^images\//, '');
  const filePath = path.join(config.publicPath, 'images', cleanName);
  const buffer = await fs.readFile(filePath);
  const ext = path.extname(cleanName).toLowerCase();

  return new Promise((resolve, reject) => {
    const stream = bucket.openUploadStream(cleanName, {
       metadata: { contentType: CONTENT_TYPES[ext] || 'application/octet-stream' },
     });
    
    stream.on('error', reject);
    stream.on('finish', () => resolve(stream.id.toString()));
    stream.end(buffer);
  });
};

export default seedImageToGridFs;