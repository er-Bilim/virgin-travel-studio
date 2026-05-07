import { Router } from 'express';
import usersRouter from "@/routes/users.js";

const apiRouter = Router();

apiRouter.use('/users', usersRouter);

export default apiRouter;