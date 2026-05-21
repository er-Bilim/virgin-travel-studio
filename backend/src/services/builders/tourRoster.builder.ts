import ExcelJS from 'exceljs';
import type {TourRosterItem} from "@/types/reports.types.js";
import {applyExcelStyles} from "@/utils/excel/applyExcelStyles.js";

export const buildTourRosterExcel = async (data: TourRosterItem[]) => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Отчет по 1 турсету');

    worksheet.columns = [
        { header: 'ФИО', key: 'clientName', width: 30 },
        { header: 'Телефон', key: 'clientPhone', width: 20 },
        { header: 'Тур', key: 'tour', width: 40 },
        { header: 'Статус', key: 'status', width: 20 },
        { header: 'Даты', key: 'dates', width: 30 },
        { header: 'Отель', key: 'hotel', width: 30 },
        { header: 'Менеджер', key: 'manager', width: 25 },
        { header: 'Сумма', key: 'sum', width: 15 },
    ];

    data.forEach((item) => {
        worksheet.addRow(item);
    });

    applyExcelStyles(worksheet, {
        freezeHeader: true,
        currencyColumns: ['sum'],
    });

    return workbook.xlsx.writeBuffer();
};