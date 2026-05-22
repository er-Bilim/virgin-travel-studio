import ExcelJS from 'exceljs';

export const applyExcelStyles = (worksheet: ExcelJS.Worksheet, options?: {
    freezeHeader?: boolean;
    currencyColumns?: string[];
}) => {
    worksheet.eachRow((row) => {
        row.alignment = { vertical: 'middle' };
    });

    if (options?.freezeHeader) {
        worksheet.views = [{ state: 'frozen', ySplit: 1 }];
    }

    if (options?.currencyColumns?.length) {
        options.currencyColumns.forEach((key) => {
            const col = worksheet.getColumn(key);
            col.numFmt = '#,##0';
        });
    }

    const headerRow = worksheet.getRow(1);

    headerRow.font = { bold: true };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFEEEEEE' },
    };
};