import {NextFunction, Request, Response} from 'express';

import {buildDailyManagerExcel} from "@/services/builders/dailyManager.builder.js";
import {buildTourRosterExcel} from "@/services/builders/tourRoster.builder.js";
import {getTourRosterData} from "@/services/reports/tourRoster.service.js";
import {getDailyManagerReportData} from "@/services/reports/dailyManager.service.js";

export const getTourRosterReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { tourSetId } = req.params;


        const data = await getTourRosterData(tourSetId as string);

        const file = await buildTourRosterExcel(data);

        return res
            .writeHead(200, {
                'Content-Type':
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="tour-roster.xlsx"',
            })
            .end(file);
    } catch (e) {
        next(e);
    }
};

export const getDailyManagerReport = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { from, to, managerId } = req.query;

        const params: {
            from?: string;
            to?: string;
            managerId?: string;
        } = {};

        if (typeof from === 'string') params.from = from;
        if (typeof to === 'string') params.to = to;
        if (typeof managerId === 'string') params.managerId = managerId;

        const data = await getDailyManagerReportData(params);

        const file = await buildDailyManagerExcel(data);

        return res
            .writeHead(200, {
                'Content-Type':
                    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': 'attachment; filename="daily.xlsx"',
            })
            .end(file);

    } catch (e) {
        next(e);
    }
};