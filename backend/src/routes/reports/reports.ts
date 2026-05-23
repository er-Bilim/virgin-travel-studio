import { Router } from 'express';
import {getDailyManagerReport, getTourRosterReport} from "@/routes/reports/reports.controller.js";
import validateObjectId from "@/middlewares/validateObjectId.js";


const reportsRouter = Router();

reportsRouter.get('/daily-manager', getDailyManagerReport);

reportsRouter.get('/tour-roster/:tourSetId', validateObjectId('tourSetId'), getTourRosterReport);

export default reportsRouter;