import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { getPeriodMovements } from './movementService.js';

export async function periodExcel(periodId, res) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Movimientos');
  sheet.columns = [
    { header: 'Fecha', key: 'created_at', width: 24 }, { header: 'Tipo', key: 'type', width: 12 },
    { header: 'Responsable', key: 'responsible', width: 24 }, { header: 'Sobres', key: 'envelopes', width: 10 },
    { header: 'Monto', key: 'amount', width: 12 }, { header: 'Efectivo', key: 'cash_delta', width: 12 },
    { header: 'Faltante', key: 'missing_delta', width: 12 }, { header: 'Nota', key: 'note', width: 35 }
  ];
  getPeriodMovements(periodId).forEach((row) => sheet.addRow(row));
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename=periodo-${periodId}.xlsx`);
  await workbook.xlsx.write(res);
  res.end();
}

export function periodPdf(periodId, res) {
  const doc = new PDFDocument({ margin: 36 });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=periodo-${periodId}.pdf`);
  doc.pipe(res);
  doc.fontSize(18).text(`Historial período ${periodId}`, { underline: true });
  doc.moveDown();
  getPeriodMovements(periodId).forEach((m) => {
    doc.fontSize(10).text(`${m.created_at} | ${m.type.toUpperCase()} | ${m.responsible} | $${m.amount} | sobres ${m.envelopes} | ${m.note || ''}`);
  });
  doc.end();
}
