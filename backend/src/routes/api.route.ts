import {Router} from 'express';
import usersRouter from './users/users.js';
import categoriesRouter from './categories/categories.js';
import managersRouter from '@/routes/users/managers.js';
import newsRouter from "@/routes/news/news.js";
import toursRouter from '@/routes/tours/tours.js';

const apiRouter = Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/managers', managersRouter);
apiRouter.use('/news', newsRouter);
apiRouter.use('/tours', toursRouter);

export default apiRouter;