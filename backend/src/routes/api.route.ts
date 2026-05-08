import { Router } from 'express';
import usersRouter from "@/routes/users.js";
import categoriesRouter from './categories.js';

const apiRouter = Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/categories', categoriesRouter);

export default apiRouter;