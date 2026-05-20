import type {DailyManagerRow, GetParams} from "@/types/reports.types.js";
import {Types} from "mongoose";
import Order from "@/model/order/Order.js";

export const getDailyManagerReportData = async ({
                                                    from,
                                                    to,
                                                    managerId,
                                                }: GetParams): Promise<DailyManagerRow[]> => {

    const match: Record<string, unknown> = {};

    if (from || to) {
        match.createdAt = {};

        if (from) {
            (match.createdAt as Record<string, Date>).$gte = new Date(from);
        }

        if (to) {
            const toDate = new Date(to);
            toDate.setHours(23, 59, 59, 999);
            (match.createdAt as Record<string, Date>).$lte = toDate;
        }
    }

    if (managerId) {
        match.managerId = new Types.ObjectId(managerId);
    }

    const result = await Order.aggregate([
        { $match: match },

        {
            $lookup: {
                from: 'users',
                localField: 'managerId',
                foreignField: '_id',
                as: 'manager',
            },
        },
        { $unwind: '$manager' },

        {
            $lookup: {
                from: 'toursets',
                localField: 'tourSetId',
                foreignField: '_id',
                as: 'tourSet',
            },
        },
        { $unwind: '$tourSet' },

        {
            $group: {
                _id: '$manager._id',

                manager: { $first: '$manager.fullName' },

                newOrders: {
                    $sum: { $cond: [{ $eq: ['$status', 'NEW'] }, 1, 0] },
                },

                inProgress: {
                    $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] },
                },

                completed: {
                    $sum: { $cond: [{ $eq: ['$status', 'COMPLETED'] }, 1, 0] },
                },

                rejected: {
                    $sum: { $cond: [{ $eq: ['$status', 'REJECTED'] }, 1, 0] },
                },

                revenue: {
                    $sum: {
                        $cond: [
                            { $eq: ['$status', 'COMPLETED'] },
                            '$tourSet.price',
                            0,
                        ],
                    },
                },
            },
        },

        {
            $project: {
                _id: 0,
                manager: 1,
                newOrders: 1,
                inProgress: 1,
                completed: 1,
                rejected: 1,
                revenue: 1,
            },
        },
    ]);
    return result as DailyManagerRow[];
};