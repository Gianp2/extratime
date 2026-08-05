import React, { useState } from 'react';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { FortnightComparisonChart } from '../components/charts/FortnightComparisonChart';
import { getMonthNamesSpanish } from '../utils/dateUtils';
import { Layers, TrendingUp, TrendingDown, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const QuincenasPage: React.FC = () => {
  const records = useExtraHoursStore((s) => s.records);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const months = getMonthNamesSpanish();

  // Fortnight breakdown per month of the selected year
  const fortnightData = React.useMemo(() => {
    return months.map((mName, idx) => {
      const monthStr = String(idx + 1).padStart(2, '0');
      const prefix = `${selectedYear}-${monthStr}`;

      const q1Hours = records
        .filter((r) => r.date.startsWith(prefix) && parseInt(r.date.split('-')[2], 10) <= 15)
        .reduce((acc, r) => acc + (r.hours || 0), 0);

      const q2Hours = records
        .filter((r) => r.date.startsWith(prefix) && parseInt(r.date.split('-')[2], 10) > 15)
        .reduce((acc, r) => acc + (r.hours || 0), 0);

      return {
        month: mName.substring(0, 3),
        fullMonthName: mName,
        q1: q1Hours,
        q2: q2Hours,
        total: q1Hours + q2Hours,
        diff: q2Hours - q1Hours,
      };
    });
  }, [records, selectedYear, months]);

  // Current month quincenas summary
  const currentMonthIdx = new Date().getMonth();
  const currentFortnightInfo = fortnightData[currentMonthIdx];

  const avgQ1 = Math.round((fortnightData.reduce((acc, f) => acc + f.q1, 0) / 12) * 10) / 10;
  const avgQ2 = Math.round((fortnightData.reduce((acc, f) => acc + f.q2, 0) / 12) * 10) / 10;

  return (
    <div className="space-y-6">
      {/* Year Selector Header */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Control Quincenal - Año {selectedYear}
            </h3>
            <p className="text-xs text-zinc-500">
              División automática: Q1 (Días 1-15) vs Q2 (Días 16-Fin)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setSelectedYear(selectedYear - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-sm font-bold px-2">{selectedYear}</span>
          <Button variant="outline" size="sm" onClick={() => setSelectedYear(selectedYear + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Summary Cards for Current Month Quincenas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
            1ª Quincena (1-15 {currentFortnightInfo?.fullMonthName})
          </span>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            {currentFortnightInfo?.q1 || 0} hrs
          </p>
          <p className="text-xs text-zinc-500 mt-1">Promedio anual Q1: {avgQ1} hrs</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
            2ª Quincena (16-Fin {currentFortnightInfo?.fullMonthName})
          </span>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {currentFortnightInfo?.q2 || 0} hrs
          </p>
          <p className="text-xs text-zinc-500 mt-1">Promedio anual Q2: {avgQ2} hrs</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase">
            Comparativa {currentFortnightInfo?.fullMonthName}
          </span>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
              {Math.abs(currentFortnightInfo?.diff || 0)} hrs
            </span>
            {(currentFortnightInfo?.diff || 0) >= 0 ? (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-4 h-4" /> Q2 superior
              </span>
            ) : (
              <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-0.5">
                <TrendingDown className="w-4 h-4" /> Q1 superior
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Total mes: {currentFortnightInfo?.total || 0} hrs</p>
        </Card>
      </div>

      {/* Fortnight Comparison Chart */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Comparativa Quincenal por Mes</CardTitle>
            <CardDescription>Gráfico comparativo entre la 1ª y 2ª quincena</CardDescription>
          </div>
        </CardHeader>
        <FortnightComparisonChart data={fortnightData} />
      </Card>

      {/* Table breakdown per month */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose Mes a Mes</CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                <th className="py-3 px-4 font-semibold">Mes</th>
                <th className="py-3 px-4 font-semibold">1ª Quincena (1-15)</th>
                <th className="py-3 px-4 font-semibold">2ª Quincena (16-Fin)</th>
                <th className="py-3 px-4 font-semibold">Total Mes</th>
                <th className="py-3 px-4 font-semibold">Diferencia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {fortnightData.map((f) => (
                <tr key={f.month} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-zinc-900 dark:text-zinc-100">{f.fullMonthName}</td>
                  <td className="py-3 px-4 text-blue-600 dark:text-blue-400 font-medium">{f.q1} hrs</td>
                  <td className="py-3 px-4 text-emerald-600 dark:text-emerald-400 font-medium">{f.q2} hrs</td>
                  <td className="py-3 px-4 font-bold text-zinc-900 dark:text-zinc-100">{f.total} hrs</td>
                  <td className="py-3 px-4 text-xs">
                    {f.diff > 0 ? (
                      <span className="text-emerald-600 font-medium">+ {f.diff} hrs en Q2</span>
                    ) : f.diff < 0 ? (
                      <span className="text-blue-600 font-medium">+ {Math.abs(f.diff)} hrs en Q1</span>
                    ) : (
                      <span className="text-zinc-400">Iguales</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
