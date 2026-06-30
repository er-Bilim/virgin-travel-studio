import {Router, type Request, type Response, type NextFunction} from 'express';
import mongoose, {Types} from 'mongoose';
import ExcelJS from 'exceljs';

import Order from '@/model/order/Order.js';
import validateObjectId from '@/middlewares/validateObjectId.js';
import type {PopulatedOrder} from "@/types/reports.types.js";
import {parseDate} from "@/utils/excel/parseDate.js";
import {applyExcelStyles} from "@/utils/excel/applyExcelStyles.js";
import auth, {type RequestWithUser} from "@/middlewares/auth.js";
import permit from "@/middlewares/permit.js";


async function getDailyManagerReport(req: Request, res: Response, next: NextFunction) {
    try {
        const reqUser  = (req as RequestWithUser).user;
        const { from, to, managerId } = req.query;

        if (managerId && typeof managerId !== 'string') {
            return res.status(400).json({ error: 'managerId должен быть строкой' });
        }

        if (from && typeof from !== 'string') {
            return res.status(400).json({ error: '"from" должен быть строкой' });
        }

        if (to && typeof to !== 'string') {
            return res.status(400).json({ error: '"to" должен быть строкой' });
        }

        const fromDate = parseDate(from);
        const toDate = parseDate(to);

        if (from && !fromDate) {
            return res.status(400).json({ error: 'Неправильная "from" дата' });
        }

        if (to && !toDate) {
            return res.status(400).json({ error: 'Неправильная "to" дата' });
        }

        let managerObjectId: Types.ObjectId | undefined;

        if (reqUser.role === 'MANAGER' && managerId) {
            return res.status(403).json({
                error: 'Менеджер не может запрашивать отчеты других менеджеров',
            });
        }

        if (reqUser.role === 'MANAGER') {
            managerObjectId = reqUser._id;
        } else if (reqUser.role === 'ADMIN') {
            if (typeof managerId === 'string') {
                if (!mongoose.Types.ObjectId.isValid(managerId)) {
                    return res.status(400).json({ error: 'Неверный managerId' });
                }
                managerObjectId = new Types.ObjectId(managerId);
            }
        }

        if (fromDate && toDate && fromDate > toDate) {
            return res.status(400).json({
                error: '"from" не должен быть больше "to"',
            });
        }

        const diffDays =
            fromDate && toDate
                ? Math.ceil((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24))
                : 0;

        if (diffDays > 31) {
            return res.status(400).json({
                error: 'Диапазон дат слишком большой (максимум 31 день)',
            });
        }

        const endOfDay =
            toDate ? new Date(toDate.setHours(23, 59, 59, 999)) : null;

        const data = await mongoose.connection
            .collection('users')
            .aggregate([
                {
                    $match: {
                      createdAt: {
                        ...(fromDate && {$gte: fromDate}),
                        ...(endOfDay && {$lte: endOfDay}),
                      },
                    },
                  },
                ]
                : []),

              {
                $lookup: {
                  from: 'toursets',
                  localField: 'tourSetId',
                  foreignField: '_id',
                  as: 'tourSet',
                },
              },
              {
                $unwind: {
                  path: '$tourSet',
                  preserveNullAndEmptyArrays: true,
                },
              },
            ],
            as: 'orders',
          },
        },

        {
          $addFields: {
            newOrders: {
              $size: {
                $filter: {
                  input: '$orders',
                  as: 'o',
                  cond: {$eq: ['$$o.status', 'NEW']},
                },
              },
            },

            inProgress: {
              $size: {
                $filter: {
                  input: '$orders',
                  as: 'o',
                  cond: {$eq: ['$$o.status', 'IN_PROGRESS']},
                },
              },
            },

            completed: {
              $size: {
                $filter: {
                  input: '$orders',
                  as: 'o',
                  cond: {$eq: ['$$o.status', 'COMPLETED']},
                },
              },
            },

            rejected: {
              $size: {
                $filter: {
                  input: '$orders',
                  as: 'o',
                  cond: {$eq: ['$$o.status', 'REJECTED']},
                },
              },
            },

            pending: {
              $size: {
                $filter: {
                  input: '$orders',
                  as: 'o',
                  cond: {$eq: ['$$o.status', 'CONTRACT_PENDING']},
                }
              }
            },

            revenueCash: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$orders',
                      as: 'o',
                      cond: {
                        $and: [
                          {$in: ['$$o.status', ['COMPLETED', 'CONTRACT_PENDING']]},
                          {$eq: ['$$o.paymentMethod', 'CASH']}
                        ]
                      },
                    },
                  },
                  as: 'o',
                  in: {
                    $ifNull: ['$$o.paymentAmount', 0],
                  },
                },
              },
            },
            revenueCard: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$orders',
                      as: 'o',
                      cond: {
                        $and: [
                          {$in: ['$$o.status', ['COMPLETED', 'CONTRACT_PENDING']]},
                          {$eq: ['$$o.paymentMethod', 'CARD']}
                        ]
                      },
                    },
                  },
                  as: 'o',
                  in: {
                    $ifNull: ['$$o.paymentAmount', 0],
                  },
                },
              },
            },
            revenueQR: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$orders',
                      as: 'o',
                      cond: {
                        $and: [
                          {$in: ['$$o.status', ['COMPLETED', 'CONTRACT_PENDING']]},
                          {$eq: ['$$o.paymentMethod', 'QR']}
                        ]
                      },
                    },
                  },
                  as: 'o',
                  in: {
                    $ifNull: ['$$o.paymentAmount', 0],
                  },
                },
              },
            },
            revenueBank: {
              $sum: {
                $map: {
                  input: {
                    $filter: {
                      input: '$orders',
                      as: 'o',
                      cond: {
                        $and: [
                          {$in: ['$$o.status', ['COMPLETED', 'CONTRACT_PENDING']]},
                          {$eq: ['$$o.paymentMethod', 'BANK']}
                        ]
                      },
                    },
                  },
                  as: 'o',
                  in: {
                    $ifNull: ['$$o.paymentAmount', 0],
                  },
                },
              },
            },
          },
        },

        {
          $project: {
            _id: 0,
            manager: '$fullName',
            newOrders: 1,
            inProgress: 1,
            completed: 1,
            rejected: 1,
            pending: 1,
            revenueCash: 1,
            revenueCard: 1,
            revenueQR: 1,
            revenueBank: 1,
          },
        },
      ])
      .toArray();

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Daily Manager Report');

    sheet.columns = [
      {header: 'Менеджер', key: 'manager', width: 25},
      {header: 'Новые', key: 'newOrders', width: 15},
      {header: 'В работе', key: 'inProgress', width: 15},
      {header: 'Завершено', key: 'completed', width: 15},
      {header: 'Отклонено', key: 'rejected', width: 15},
      {header: 'В ожидании договора', key: 'pending', width: 25},
      {header: 'Доход по наличным', key: 'revenueCash', width: 20},
      {header: 'Доход по оплате картой', key: 'revenueCard', width: 20},
      {header: 'Доход через qr код', key: 'revenueQR', width: 20},
      {header: 'Доход через банковский перевод', key: 'revenueBank', width: 20},
    ];

    data.forEach((row) => sheet.addRow(row));

    applyExcelStyles(sheet, {
      freezeHeader: true,
      currencyColumns: ['revenueCash', 'revenueCard', 'revenueQR', 'revenueBank'],
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Disposition'
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="daily.xlsx"'
    );

    return res.end(buffer);

  } catch (e) {
    next(e);
  }
}

async function getTourRosterReport(req: Request, res: Response, next: NextFunction) {
  try {
    const {tourSetId} = req.params as { tourSetId: string };

    const orders = await Order.find({
      tourSetId: new mongoose.Types.ObjectId(tourSetId),
      status: 'COMPLETED',
    })
      .populate({
        path: 'tourSetId',
        populate: {path: 'tourId'},
      })
      .populate('managerId')
      .lean() as unknown as PopulatedOrder[];

    if (!orders.length) return res.status(404).send({error: 'Заявки не найдены'});

    const formatDate = (date: Date | string) => {
      const d = new Date(date);
      if (isNaN(d.getTime())) return '';

      return `${String(d.getDate()).padStart(2, '0')}.${String(
        d.getMonth() + 1,
      ).padStart(2, '0')}.${d.getFullYear()}`;
    };

    const data = orders.map((o) => ({
      clientName: o.clientName,
      clientPhone: o.clientPhone,
      status: o.status,
      tour: o.tourSetId?.tourId?.title ?? '',
      dates:
        o.tourSetId?.startDate && o.tourSetId?.endDate
          ? `${formatDate(o.tourSetId.startDate)} - ${formatDate(
            o.tourSetId.endDate,
          )}`
          : '',
      hotel: o.tourSetId?.hotelName ?? '',
      manager: o.managerId?.fullName ?? '',
      sum: o.tourSetId?.price ?? 0,
    }));

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Tour Roster');

    sheet.columns = [
      {header: 'ФИО', key: 'clientName', width: 25},
      {header: 'Телефон', key: 'clientPhone', width: 20},
      {header: 'Статус', key: 'status', width: 15},
      {header: 'Тур', key: 'tour', width: 30},
      {header: 'Даты', key: 'dates', width: 25},
      {header: 'Отель', key: 'hotel', width: 25},
      {header: 'Менеджер', key: 'manager', width: 20},
      {header: 'Сумма', key: 'sum', width: 15},
    ];

    data.forEach((row) => sheet.addRow(row));

    applyExcelStyles(sheet, {
      freezeHeader: true,
      currencyColumns: ['sum'],
    });

    const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      'Access-Control-Expose-Headers',
      'Content-Disposition'
    );

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    res.setHeader(
      'Content-Disposition',
      'attachment; filename="tour-roster.xlsx"'
    );

    return res.end(buffer);
  } catch (e) {
    next(e);
  }
}

const reportsRouter = Router();

reportsRouter.get('/daily-manager', auth, permit('ADMIN', 'MANAGER'), getDailyManagerReport);
reportsRouter.get('/tour-roster/:tourSetId',auth, permit('ADMIN', 'MANAGER'), validateObjectId('tourSetId'), getTourRosterReport,);

export default reportsRouter;