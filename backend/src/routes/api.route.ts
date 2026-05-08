import {Router} from 'express';
import usersRouter from './users/users.js';
import categoriesRouter from './categories/categories.js';
import managersRouter from '@/routes/users/managers.js';


const apiRouter = Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/managers', managersRouter);

export default apiRouter;