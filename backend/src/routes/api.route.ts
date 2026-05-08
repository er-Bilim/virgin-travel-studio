import { Router } from 'express';
import usersRouter from './users/users.js';
import categoriesRouter from './categories/categories.js';
import newsRouter from "@/routes/news/news.js";


const apiRouter = Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/news', newsRouter);

export default apiRouter;