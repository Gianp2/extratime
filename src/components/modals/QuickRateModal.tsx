import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import { useExtraHoursStore } from '../../store/useExtraHoursStore';
import { saveUserSettings } from '../../services/settingsService';
import { useToast } from '../ui/Toast';
import { DollarSign, Sparkles, RefreshCw, Calculator, TrendingUp } from 'lucide-react';
import { calculateSalaryBreakdown } from '../../utils/calculations';
import { formatCurrency } from '../../utils/formatters';

export const QuickRateModal: React.FC = () => {
  const isOpen = useExtraHoursStore((s) => s.isRateModalOpen);
  const onClose = useExtraHoursStore((s) => s.closeRateModal);
  const settings = useExtraHoursStore((s) => s.settings);
  const records = useExtraHoursStore((s) => s.records);
  const { toast } = useToast();

  const [rateNormal, setRateNormal] = useState<number>(settings.rateNormal || 0);
  const [rate50, setRate50] = useState<number>(settings.rate50 || 0);
  const [rate100, setRate100] = useState<number>(settings.rate100 || 0);
  const [rateNocturna, setRateNocturna] = useState<number>(settings.rateNocturna || 0);
  const [rateFeriado, setRateFeriado] = useState<number>(settings.rateFeriado || 0);
  const [currency, setCurrency] = useState<string>(settings.currency || '$');
  const [isSaving, setIsSaving] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setRateNormal(settings.rateNormal || 0);
      setRate50(settings.rate50 || (settings.rateNormal ? settings.rateNormal * 1.5 : 0));
      setRate100(settings.rate100 || (settings.rateNormal ? settings.rateNormal * 2.0 : 0));
      setRateNocturna(settings.rateNocturna || (settings.rateNormal ? settings.rateNormal * 1.35 : 0));
      setRateFeriado(settings.rateFeriado || (settings.rateNormal ? settings.rateNormal * 2.5 : 0));
      setCurrency(settings.currency || '$');
    }
  }, [isOpen, settings]);

  const handleBaseChange = (val: number) => {
    setRateNormal(val);
    // Auto-update multipliers
    setRate50(Math.round(val * 1.5 * 100) / 100);
    setRate100(Math.round(val * 2.0 * 100) / 100);
    setRateNocturna(Math.round(val * 1.35 * 100) / 100);
    setRateFeriado(Math.round(val * 2.5 * 100) / 100);
  };

  const handleAutoCalculate = () => {
    if (rateNormal <= 0) {
      toast('warning', 'Ingresa primero el precio por hora normal');
      return;
    }
    handleBaseChange(rateNormal);
    toast('success', 'Recargos calculados automáticamente');
  };

  // Live earnings preview for current month
  const tempSettings = {
    ...settings,
    rateNormal,
    rate50,
    rate100,
    rateNocturna,
    rateFeriado,
    currency,
  };
  const salaryBreakdown = calculateSalaryBreakdown(records, tempSettings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rateNormal < 0) {
      toast('error', 'El precio por hora debe ser mayor o igual a 0');
      return;
    }

    setIsSaving(true);
    try {
      await saveUserSettings({
        rateNormal,
        rate50,
        rate100,
        rateNocturna,
        rateFeriado,
        currency,
      });
      toast('success', 'Precio de la hora guardado correctamente');
      onClose();
    } catch (err) {
      toast('error', 'Error al guardar la tarifa en Firestore');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configurar Precio por Hora"
      subtitle="Establece tu tarifa base para calcular automáticamente cuánto vas a ganar"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Main Base Rate Field */}
        <div className="bg-indigo-950/30 border border-indigo-800/50 p-4 rounded-xl space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-bold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-indigo-400" />
              Precio por Hora Normal Base
            </label>
            <span className="text-xs text-indigo-300 font-mono">Tarifa principal</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <Input
                type="number"
                step="0.01"
                min="0"
                placeholder="Ej: 1500"
                value={rateNormal || ''}
                onChange={(e) => handleBaseChange(parseFloat(e.target.value) || 0)}
                className="text-lg font-bold text-white bg-zinc-900 border-indigo-500/50 focus:border-indigo-500"
              />
            </div>
            <div>
              <Select
                options={[
                  { value: '$', label: '$ (Peso/Dólar)' },
                  { value: '€', label: '€ (Euro)' },
                  { value: 'S/', label: 'S/ (Sol)' },
                  { value: 'Bs.', label: 'Bs. (Boliviano)' },
                  { value: '₡', label: '₡ (Colón)' },
                ]}
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="bg-zinc-900 border-zinc-700"
              />
            </div>
          </div>
          <p className="text-[11px] text-zinc-400">
            Los recargos del 50%, 100%, nocturna y feriados se actualizarán automáticamente según la legislación común.
          </p>
        </div>

        {/* Live Earnings Preview */}
        <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-zinc-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              Ganancia Estimada Acumulada
            </span>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">
              {formatCurrency(salaryBreakdown.totalEarnings, currency)}
            </p>
          </div>
          <div className="text-right text-xs text-zinc-400">
            <p className="font-semibold text-white">{records.reduce((a, b) => a + (b.hours || 0), 0)} hrs registradas</p>
            <p className="text-[10px] text-zinc-500">Cálculo en tiempo real</p>
          </div>
        </div>

        {/* Toggle Advanced Recargos */}
        <div className="border-t border-zinc-800 pt-3">
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
          >
            {showAdvanced ? 'Ocultar tarifas de recargo específicas' : 'Ver / Personalizar recargos (50%, 100%, Feriado...)'}
          </button>

          {showAdvanced && (
            <div className="mt-3 grid grid-cols-2 gap-3 bg-zinc-900/50 p-3 rounded-xl border border-zinc-800">
              <Input
                label="Hora 50% (1.5x)"
                type="number"
                step="0.01"
                value={rate50 || ''}
                onChange={(e) => setRate50(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Hora 100% (2.0x)"
                type="number"
                step="0.01"
                value={rate100 || ''}
                onChange={(e) => setRate100(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Hora Nocturna (1.35x)"
                type="number"
                step="0.01"
                value={rateNocturna || ''}
                onChange={(e) => setRateNocturna(parseFloat(e.target.value) || 0)}
              />
              <Input
                label="Hora Feriado (2.5x)"
                type="number"
                step="0.01"
                value={rateFeriado || ''}
                onChange={(e) => setRateFeriado(parseFloat(e.target.value) || 0)}
              />
              <div className="col-span-2 flex justify-end">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  leftIcon={<RefreshCw className="w-3 h-3" />}
                  onClick={handleAutoCalculate}
                >
                  Recalcular con Multiplicadores Standard
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex justify-end gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isSaving}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            leftIcon={<Calculator className="w-4 h-4" />}
          >
            Guardar y Recalcular
          </Button>
        </div>
      </form>
    </Modal>
  );
};
