import type {DailyManagerRow} from "@/types/reports.types.js";
import ExcelJS from "exceljs";
import {applyExcelStyles} from "@/utils/excel/applyExcelStyles.js";


export const buildDailyManagerExcel = (data: DailyManagerRow[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Отчет по менеджерам');

    worksheet.columns = [
        { header: 'Менеджер', key: 'manager', width: 25 },
        { header: 'Новые заявки', key: 'newOrders', width: 20 },
        { header: 'В проверке', key: 'inProgress', width: 20 },
        { header: 'Одобрены', key: 'completed', width: 20 },
        { header: 'Отклонены', key: 'rejected', width: 30 },
        { header: 'Доход', key: 'revenue', width: 30 },
    ];

    data.forEach((item) => {
        worksheet.addRow(item);
    });

    applyExcelStyles(worksheet, {
        freezeHeader: true,
        currencyColumns: ['revenue'],
    });
    return workbook.xlsx.writeBuffer();
}