import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const rootPath = path.dirname(__filename);

const config = {
  rootPath,
  publicPath: path.join(rootPath, '../public'),
  port: process.env.PORT ?? 8000,
  db: 'mongodb://localhost/virgin-travel',
  refreshJWTSecret: process.env.REFRESH_SECRET_JWT ?? 'refresh_secret',
  accessJWTSecret: process.env.ACCESS_SECRET_JWT ?? 'access_secret',
};

export default config;
