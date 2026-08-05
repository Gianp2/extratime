import React, { useState, useMemo } from 'react';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { exportToPDF, exportToCSV, exportToExcel } from '../services/exportService';
import { formatDateSpanish } from '../utils/dateUtils';
import { calculateSalaryBreakdown } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';
import { FileSpreadsheet, Download, FileText, Calendar, Printer } from 'lucide-react';
import { useToast } from '../components/ui/Toast';

export const ReportesPage: React.FC = () => {
  const records = useExtraHoursStore((s) => s.records);
  const settings = useExtraHoursStore((s) => s.settings);
  const { toast } = useToast();

  const todayStr = new Date().toISOString().split('T')[0];
  const firstDayStr = `${todayStr.slice(0, 7)}-01`;

  const [startDate, setStartDate] = useState(firstDayStr);
  const [endDate, setEndDate] = useState(todayStr);
  const [selectedRangePreset, setSelectedRangePreset] = useState<string>('month');

  // Quick preset handler
  const handlePresetChange = (preset: string) => {
    setSelectedRangePreset(preset);
    const now = new Date();
    if (preset === 'month') {
      setStartDate(`${todayStr.slice(0, 7)}-01`);
      setEndDate(todayStr);
    } else if (preset === 'year') {
      setStartDate(`${now.getFullYear()}-01-01`);
      setEndDate(todayStr);
    } else if (preset === 'q1') {
      setStartDate(`${todayStr.slice(0, 7)}-01`);
      setEndDate(`${todayStr.slice(0, 7)}-15`);
    } else if (preset === 'q2') {
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      setStartDate(`${todayStr.slice(0, 7)}-16`);
      setEndDate(`${todayStr.slice(0, 7)}-${lastDay}`);
    }
  };

  // Filtered records for report
  const reportRecords = useMemo(() => {
    return records.filter((r) => r.date >= startDate && r.date <= endDate);
  }, [records, startDate, endDate]);

  const totalHours = reportRecords.reduce((acc, r) => acc + (r.hours || 0), 0);
  const salaryBreakdown = calculateSalaryBreakdown(reportRecords, settings);

  const handleExportPDF = () => {
    if (reportRecords.length === 0) {
      toast('warning', 'No hay registros en el rango seleccionado');
      return;
    }
    const title = `Reporte de Horas Extras (${startDate} a ${endDate})`;
    const fileName = `ExtraTime_Reporte_${startDate}_a_${endDate}.pdf`;
    exportToPDF(reportRecords, settings, title, fileName);
    toast('success', 'Documento PDF generado correctamente');
  };

  const handleExportCSV = () => {
    if (reportRecords.length === 0) {
      toast('warning', 'No hay registros en el rango seleccionado');
      return;
    }
    exportToCSV(reportRecords);
    toast('success', 'Archivo CSV descargado');
  };

  const handleExportExcel = () => {
    if (reportRecords.length === 0) {
      toast('warning', 'No hay registros en el rango seleccionado');
      return;
    }
    exportToExcel(reportRecords);
    toast('success', 'Archivo Excel descargado');
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Centro de Reportes & Exportación
            </h3>
            <p className="text-xs text-zinc-500">
              Generación de informes formales para RRHH o archivo personal
            </p>
          </div>
        </div>
      </div>

      {/* Report Parameters Card */}
      <Card className="space-y-4">
        <CardHeader>
          <CardTitle>1. Configurar Rango del Informe</CardTitle>
          <CardDescription>Selecciona las fechas para filtrar los registros a exportar</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Preajuste Rápido"
            value={selectedRangePreset}
            onChange={(e) => handlePresetChange(e.target.value)}
            options={[
              { value: 'month', label: 'Este Mes' },
              { value: 'q1', label: 'Primera Quincena (1-15)' },
              { value: 'q2', label: 'Segunda Quincena (16-Fin)' },
              { value: 'year', label: 'Este Año Completo' },
              { value: 'custom', label: 'Personalizado' },
            ]}
          />

          <Input
            label="Fecha Inicio"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setSelectedRangePreset('custom');
            }}
          />

          <Input
            label="Fecha Fin"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setSelectedRangePreset('custom');
            }}
          />
        </div>
      </Card>

      {/* Preview Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Registros Incluidos</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            {reportRecords.length} registros
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            Desde {startDate} hasta {endDate}
          </p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Total Horas</span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {totalHours} hrs
          </p>
          <p className="text-xs text-zinc-500 mt-1">Horas extras acumuladas en el informe</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Valor Estimado</span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {formatCurrency(salaryBreakdown.totalEarnings, settings.currency || '$')}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Total a cobrar en este rango</p>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="space-y-4">
        <CardHeader>
          <CardTitle>2. Exportar Documento</CardTitle>
          <CardDescription>Descarga el informe en el formato de tu preferencia</CardDescription>
        </CardHeader>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            variant="primary"
            className="py-4 justify-center shadow-sm"
            leftIcon={<FileText className="w-5 h-5" />}
            onClick={handleExportPDF}
          >
            Descargar PDF Oficial
          </Button>

          <Button
            variant="outline"
            className="py-4 justify-center"
            leftIcon={<Download className="w-5 h-5 text-emerald-600" />}
            onClick={handleExportExcel}
          >
            Exportar a Excel (.xlsx)
          </Button>

          <Button
            variant="outline"
            className="py-4 justify-center"
            leftIcon={<Download className="w-5 h-5 text-blue-600" />}
            onClick={handleExportCSV}
          >
            Exportar a CSV (.csv)
          </Button>
        </div>
      </Card>
    </div>
  );
};
