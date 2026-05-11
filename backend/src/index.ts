import express, { type Express, type Request, type Response } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
import cookieParser from 'cookie-parser';
import config from './config.js';
import apiRouter from './routes/api.route.js';

const app: Express = express();

app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  }),
);
app.use(cookieParser());
app.use(express.static('public'));
app.use(express.json());
app.use('/api', apiRouter);

app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    error: 'Not Found',
  });
});

const run = async () => {
  await mongoose.connect(config.db);

  app.listen(config.port, () => {
    console.log(`http://localhost:${config.port}/api`);
  });

  process.on('exit', () => {
    mongoose.disconnect();
  });
};

run().catch((error) => console.error(error));
