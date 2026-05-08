import { Router } from 'express';
import usersRouter from './users/users.js';
import categoriesRouter from './categories/categories.js';


const apiRouter = Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/categories', categoriesRouter);

export default apiRouter;