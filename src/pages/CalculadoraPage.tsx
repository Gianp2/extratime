import React, { useState } from 'react';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { calculateSalaryBreakdown } from '../utils/calculations';
import { formatCurrency, formatNumber } from '../utils/formatters';
import { getTodayString, getWeekInterval, getFortnightInterval, getMonthInterval, getYearInterval } from '../utils/dateUtils';
import { Calculator, DollarSign, Wallet, ArrowRight, Settings as SettingsIcon } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const CalculadoraPage: React.FC = () => {
  const records = useExtraHoursStore((s) => s.records);
  const settings = useExtraHoursStore((s) => s.settings);
  const openRateModal = useExtraHoursStore((s) => s.openRateModal);
  const navigate = useNavigate();

  const currencySymbol = settings.currency || '$';

  // Intervals records
  const todayStr = getTodayString();
  const todayRecords = records.filter((r) => r.date === todayStr);

  const weekInterval = getWeekInterval();
  const weekRecords = records.filter((r) => {
    const d = new Date(r.date + 'T00:00:00');
    return d >= weekInterval.start && d <= weekInterval.end;
  });

  const fortnightInterval = getFortnightInterval();
  const currentQInterval = fortnightInterval.isCurrentQ1 ? fortnightInterval.q1 : fortnightInterval.q2;
  const fortnightRecords = records.filter((r) => {
    const d = new Date(r.date + 'T00:00:00');
    return d >= currentQInterval.start && d <= currentQInterval.end;
  });

  const monthInterval = getMonthInterval();
  const monthRecords = records.filter((r) => {
    const d = new Date(r.date + 'T00:00:00');
    return d >= monthInterval.start && d <= monthInterval.end;
  });

  const yearInterval = getYearInterval();
  const yearRecords = records.filter((r) => {
    const d = new Date(r.date + 'T00:00:00');
    return d >= yearInterval.start && d <= yearInterval.end;
  });

  // Calculate earnings for each interval
  const todaySalary = calculateSalaryBreakdown(todayRecords, settings);
  const weekSalary = calculateSalaryBreakdown(weekRecords, settings);
  const fortnightSalary = calculateSalaryBreakdown(fortnightRecords, settings);
  const monthSalary = calculateSalaryBreakdown(monthRecords, settings);
  const yearSalary = calculateSalaryBreakdown(yearRecords, settings);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Calculadora de Sueldo & Estimaciones
            </h3>
            <p className="text-xs text-zinc-500">
              Cálculo de ingresos correspondientes según los valores de hora configurados
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          leftIcon={<DollarSign className="w-4 h-4" />}
          onClick={openRateModal}
        >
          {settings.rateNormal > 0 ? 'Editar Precio de Hora' : 'Establecer Precio por Hora'}
        </Button>
      </div>

      {/* Summary Cards for Periods Earnings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Cobro Hoy</span>
          <p className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 mt-2">
            {formatCurrency(todaySalary.totalEarnings, currencySymbol)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">{todaySalary.hoursNormal + todaySalary.hours50 + todaySalary.hours100 + todaySalary.hoursNocturna + todaySalary.hoursFeriado} hrs hoy</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Cobro Esta Semana</span>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-2">
            {formatCurrency(weekSalary.totalEarnings, currencySymbol)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Semana en curso</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Cobro Quincenal</span>
          <p className="text-2xl font-extrabold text-teal-600 dark:text-teal-400 mt-2">
            {formatCurrency(fortnightSalary.totalEarnings, currencySymbol)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Quincena en curso</p>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-900 to-zinc-900 text-white border-none shadow-md">
          <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
            Total a Cobrar Este Mes
          </span>
          <p className="text-2xl font-extrabold text-white mt-2">
            {formatCurrency(monthSalary.totalEarnings, currencySymbol)}
          </p>
          <p className="text-xs text-emerald-200 mt-1">Acumulado mes actual</p>
        </Card>

        <Card>
          <span className="text-xs font-semibold text-zinc-500 uppercase">Cobro Anual</span>
          <p className="text-2xl font-extrabold text-purple-600 dark:text-purple-400 mt-2">
            {formatCurrency(yearSalary.totalEarnings, currencySymbol)}
          </p>
          <p className="text-xs text-zinc-500 mt-1">Acumulado año</p>
        </Card>
      </div>

      {/* Monthly Breakdown Table & Configured Rates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 space-y-4">
          <CardHeader>
            <div>
              <CardTitle>Desglose por Categoría de Hora (Este Mes)</CardTitle>
              <CardDescription>Cálculo multiplicador basado en horas normales y recargos</CardDescription>
            </div>
          </CardHeader>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400">
                  <th className="py-2.5 px-3 font-semibold">Categoría</th>
                  <th className="py-2.5 px-3 font-semibold">Horas</th>
                  <th className="py-2.5 px-3 font-semibold">Valor Unitario</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                <tr>
                  <td className="py-3 px-3 font-semibold text-zinc-900 dark:text-zinc-100">Horas Normales</td>
                  <td className="py-3 px-3 font-medium">{monthSalary.hoursNormal} hrs</td>
                  <td className="py-3 px-3 text-zinc-500">{formatCurrency(monthSalary.valNormal, currencySymbol)}</td>
                  <td className="py-3 px-3 font-bold text-right text-zinc-900 dark:text-zinc-100">
                    {formatCurrency(monthSalary.totalNormal, currencySymbol)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-teal-600 dark:text-teal-400">Horas Extra 50%</td>
                  <td className="py-3 px-3 font-medium">{monthSalary.hours50} hrs</td>
                  <td className="py-3 px-3 text-zinc-500">{formatCurrency(monthSalary.val50, currencySymbol)}</td>
                  <td className="py-3 px-3 font-bold text-right text-teal-600 dark:text-teal-400">
                    {formatCurrency(monthSalary.total50, currencySymbol)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-indigo-600 dark:text-indigo-400">Horas Extra 100%</td>
                  <td className="py-3 px-3 font-medium">{monthSalary.hours100} hrs</td>
                  <td className="py-3 px-3 text-zinc-500">{formatCurrency(monthSalary.val100, currencySymbol)}</td>
                  <td className="py-3 px-3 font-bold text-right text-indigo-600 dark:text-indigo-400">
                    {formatCurrency(monthSalary.total100, currencySymbol)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-purple-600 dark:text-purple-400">Horas Nocturnas</td>
                  <td className="py-3 px-3 font-medium">{monthSalary.hoursNocturna} hrs</td>
                  <td className="py-3 px-3 text-zinc-500">{formatCurrency(monthSalary.valNocturna, currencySymbol)}</td>
                  <td className="py-3 px-3 font-bold text-right text-purple-600 dark:text-purple-400">
                    {formatCurrency(monthSalary.totalNocturna, currencySymbol)}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-3 font-semibold text-rose-600 dark:text-rose-400">Horas Feriado</td>
                  <td className="py-3 px-3 font-medium">{monthSalary.hoursFeriado} hrs</td>
                  <td className="py-3 px-3 text-zinc-500">{formatCurrency(monthSalary.valFeriado, currencySymbol)}</td>
                  <td className="py-3 px-3 font-bold text-right text-rose-600 dark:text-rose-400">
                    {formatCurrency(monthSalary.totalFeriado, currencySymbol)}
                  </td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-zinc-900 dark:border-zinc-100 font-extrabold text-base">
                  <td className="py-3 px-3" colSpan={3}>
                    TOTAL ESTIMADO DEL MES
                  </td>
                  <td className="py-3 px-3 text-right text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(monthSalary.totalEarnings, currencySymbol)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>

        {/* Tarifas Vigentes Card */}
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Tarifas Vigentes</CardTitle>
            <CardDescription>Valores por hora configurados en tu perfil</CardDescription>
          </CardHeader>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Hora Normal:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(settings.rateNormal || 0, currencySymbol)}/h
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <span className="font-semibold text-teal-600 dark:text-teal-400">Hora 50%:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(settings.rate50 || 0, currencySymbol)}/h
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <span className="font-semibold text-indigo-600 dark:text-indigo-400">Hora 100%:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(settings.rate100 || 0, currencySymbol)}/h
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <span className="font-semibold text-purple-600 dark:text-purple-400">Nocturna:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(settings.rateNocturna || 0, currencySymbol)}/h
              </span>
            </div>
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800">
              <span className="font-semibold text-rose-600 dark:text-rose-400">Feriado:</span>
              <span className="font-bold text-zinc-900 dark:text-zinc-100">
                {formatCurrency(settings.rateFeriado || 0, currencySymbol)}/h
              </span>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full text-xs py-2 mt-2"
            onClick={openRateModal}
          >
            Modificar Precio / Tarifas de Hora
          </Button>
        </Card>
      </div>
    </div>
  );
};
