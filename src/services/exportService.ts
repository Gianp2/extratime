import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { ExtraHourRecord, UserSettings } from '../types';
import { formatDateSpanish } from '../utils/dateUtils';
import { formatCurrency, formatNumber } from '../utils/formatters';

export function exportToCSV(records: ExtraHourRecord[], fileName: string = 'ExtraTime_Reporte.csv') {
  const headers = ['Fecha', 'Horas', 'Tipo', 'Hora Ingreso', 'Hora Salida', 'Observaciones'];
  const rows = records.map((r) => [
    r.date,
    r.hours,
    r.hourType,
    r.entryTime || '-',
    r.exitTime || '-',
    `"${(r.notes || '').replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function exportToExcel(records: ExtraHourRecord[], fileName: string = 'ExtraTime_Reporte.xlsx') {
  const data = records.map((r) => ({
    Fecha: r.date,
    Horas: r.hours,
    Tipo: r.hourType,
    'Entrada (opcional)': r.entryTime || '-',
    'Salida (opcional)': r.exitTime || '-',
    Observaciones: r.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Horas Extras');
  XLSX.writeFile(workbook, fileName);
}

export function exportToPDF(
  records: ExtraHourRecord[],
  settings: Partial<UserSettings>,
  title: string = 'Reporte de Horas Extras - ExtraTime',
  fileName: string = 'ExtraTime_Reporte.pdf'
) {
  const doc = new jsPDF();

  // Header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('ExtraTime', 14, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(title, 14, 25);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-AR')}`, 150, 25);

  let totalHours = 0;
  records.forEach((r) => (totalHours += r.hours || 0));

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(`Total Registros: ${records.length}`, 14, 40);
  doc.text(`Total Horas: ${formatNumber(totalHours, 1)} hrs`, 80, 40);

  const tableData = records.map((r) => [
    formatDateSpanish(r.date, 'dd/MM/yyyy'),
    `${r.hours} hrs`,
    r.hourType.toUpperCase(),
    r.entryTime && r.exitTime ? `${r.entryTime} - ${r.exitTime}` : '-',
    r.notes || '-',
  ]);

  autoTable(doc, {
    startY: 46,
    head: [['Fecha', 'Horas', 'Tipo', 'Horario', 'Observaciones']],
    body: tableData,
    headStyles: {
      fillColor: [30, 41, 59],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
  });

  doc.save(fileName);
}

export function printRecords(records: ExtraHourRecord[], title: string = 'Reporte de Horas Extras') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalHours = records.reduce((acc, r) => acc + (r.hours || 0), 0);

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${title}</title>
        <style>
          body { font-family: system-ui, -apple-system, sans-serif; padding: 24px; color: #1e293b; }
          h1 { margin-bottom: 4px; color: #0f172a; }
          p { color: #64748b; margin-top: 0; }
          .summary { background: #f8fafc; border: 1px solid #e2e8f0; padding: 12px 16px; border-radius: 8px; margin: 16px 0; display: flex; gap: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 16px; }
          th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 14px; }
          th { background: #f1f5f9; font-weight: 600; }
          tr:nth-child(even) { background: #f8fafc; }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <h1>ExtraTime - ${title}</h1>
        <p>Fecha de emisión: ${new Date().toLocaleDateString('es-AR')}</p>
        <div class="summary">
          <div><strong>Registros:</strong> ${records.length}</div>
          <div><strong>Total Horas:</strong> ${totalHours} hrs</div>
        </div>
        <table>
          <thead>
            <tr>
              <th>Fecha</th>
              <th>Horas</th>
              <th>Tipo</th>
              <th>Horario</th>
              <th>Observaciones</th>
            </tr>
          </thead>
          <tbody>
            ${records
              .map(
                (r) => `
              <tr>
                <td>${r.date}</td>
                <td><strong>${r.hours} hrs</strong></td>
                <td>${r.hourType}</td>
                <td>${r.entryTime && r.exitTime ? `${r.entryTime} - ${r.exitTime}` : '-'}</td>
                <td>${r.notes || '-'}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>
        <script>
          window.onload = function() { window.print(); window.close(); };
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
