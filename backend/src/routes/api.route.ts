import {Router} from 'express';
import usersRouter from './users/users.js';
import categoriesRouter from './categories/categories.js';
import managersRouter from '@/routes/users/managers.js';
import newsRouter from '@/routes/news/news.js';
import toursRouter from '@/routes/tours/tours.js';
import tourSetsRouter from '@/routes/tourSets/tourSets.js';
import ordersRouter from '@/routes/orders/orders.js';
import reviewsRouter from './reviews/reviews.js';
import reportsRouter from "@/routes/reports/reports.js";
import contactSettingsRouter from '@/routes/contactSettings/contactSettings.js';
import homepageSettingsRouter from '@/routes/homepageSettings/homepageSettings.js';
import faqRouter from '@/routes/faq/faq.js';

const apiRouter = Router();

apiRouter.use('/users', usersRouter);
apiRouter.use('/categories', categoriesRouter);
apiRouter.use('/managers', managersRouter);
apiRouter.use('/news', newsRouter);
apiRouter.use('/tours', toursRouter);
apiRouter.use('/tour-sets', tourSetsRouter);
apiRouter.use('/reviews', reviewsRouter)
apiRouter.use('/orders', ordersRouter);
apiRouter.use('/reports', reportsRouter);
apiRouter.use('/contact-settings', contactSettingsRouter);
apiRouter.use('/homepage-settings', homepageSettingsRouter);
apiRouter.use('/faq', faqRouter);


export default apiRouter;
