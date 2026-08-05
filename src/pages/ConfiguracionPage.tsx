import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { saveUserSettings } from '../services/settingsService';
import { Card, CardHeader, CardTitle, CardDescription } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { Settings, Save, RefreshCw, DollarSign, Target, ShieldCheck } from 'lucide-react';
import { UserSettings } from '../types';

const settingsSchema = z.object({
  rateNormal: z.number().min(0, 'El valor no puede ser negativo'),
  rate50: z.number().min(0, 'El valor no puede ser negativo'),
  rate100: z.number().min(0, 'El valor no puede ser negativo'),
  rateNocturna: z.number().min(0, 'El valor no puede ser negativo'),
  rateFeriado: z.number().min(0, 'El valor no puede ser negativo'),
  monthlyGoalHours: z.number().min(1, 'La meta debe ser mayor a 0'),
  currency: z.string().min(1, 'Selecciona una moneda'),
});

type SettingsFormData = z.infer<typeof settingsSchema>;

export const ConfiguracionPage: React.FC = () => {
  const settings = useExtraHoursStore((s) => s.settings);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      rateNormal: settings.rateNormal || 0,
      rate50: settings.rate50 || 0,
      rate100: settings.rate100 || 0,
      rateNocturna: settings.rateNocturna || 0,
      rateFeriado: settings.rateFeriado || 0,
      monthlyGoalHours: settings.monthlyGoalHours || 20,
      currency: settings.currency || '$',
    },
  });

  const rateNormalVal = watch('rateNormal');

  useEffect(() => {
    setValue('rateNormal', settings.rateNormal || 0);
    setValue('rate50', settings.rate50 || 0);
    setValue('rate100', settings.rate100 || 0);
    setValue('rateNocturna', settings.rateNocturna || 0);
    setValue('rateFeriado', settings.rateFeriado || 0);
    setValue('monthlyGoalHours', settings.monthlyGoalHours || 20);
    setValue('currency', settings.currency || '$');
  }, [settings, setValue]);

  // Auto-calculate rates based on standard multipliers
  const handleAutoCalculateRates = () => {
    const base = Number(rateNormalVal) || 0;
    if (base <= 0) {
      toast('warning', 'Ingresa primero el valor de la hora normal');
      return;
    }
    setValue('rate50', Math.round(base * 1.5 * 100) / 100);
    setValue('rate100', Math.round(base * 2.0 * 100) / 100);
    setValue('rateNocturna', Math.round(base * 1.35 * 100) / 100);
    setValue('rateFeriado', Math.round(base * 2.0 * 100) / 100);
    toast('success', 'Tarifas calculadas automáticamente');
  };

  const onSubmit = async (data: SettingsFormData) => {
    setIsSaving(true);
    try {
      await saveUserSettings(data);
      toast('success', 'Configuración guardada en Firestore');
    } catch (err) {
      toast('error', 'Error al guardar la configuración');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner */}
      <div className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 p-4 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
              Configuración de Parámetros
            </h3>
            <p className="text-xs text-zinc-500">
              Ajusta tus tarifas de hora, moneda y metas de rendimiento
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Tariff Rates Card */}
        <Card className="space-y-4">
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 w-full">
              <div>
                <CardTitle>Tarifas de Valor por Hora</CardTitle>
                <CardDescription>
                  Define cuánto vale cada tipo de hora extra para el cálculo de sueldo
                </CardDescription>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={handleAutoCalculateRates}
              >
                Auto-Calcular Recargos
              </Button>
            </div>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Valor Hora Normal Base"
              type="number"
              step="0.01"
              leftIcon={<DollarSign className="w-4 h-4" />}
              error={errors.rateNormal?.message}
              {...register('rateNormal', { valueAsNumber: true })}
            />

            <Input
              label="Valor Hora Extra 50%"
              type="number"
              step="0.01"
              leftIcon={<DollarSign className="w-4 h-4 text-teal-500" />}
              error={errors.rate50?.message}
              {...register('rate50', { valueAsNumber: true })}
            />

            <Input
              label="Valor Hora Extra 100%"
              type="number"
              step="0.01"
              leftIcon={<DollarSign className="w-4 h-4 text-indigo-500" />}
              error={errors.rate100?.message}
              {...register('rate100', { valueAsNumber: true })}
            />

            <Input
              label="Valor Hora Nocturna"
              type="number"
              step="0.01"
              leftIcon={<DollarSign className="w-4 h-4 text-purple-500" />}
              error={errors.rateNocturna?.message}
              {...register('rateNocturna', { valueAsNumber: true })}
            />

            <Input
              label="Valor Hora Feriado"
              type="number"
              step="0.01"
              leftIcon={<DollarSign className="w-4 h-4 text-rose-500" />}
              error={errors.rateFeriado?.message}
              {...register('rateFeriado', { valueAsNumber: true })}
            />
          </div>
        </Card>

        {/* Currency & Monthly Goal Card */}
        <Card className="space-y-4">
          <CardHeader>
            <CardTitle>Preferencias de Moneda & Meta Mensual</CardTitle>
            <CardDescription>Configuración general de visualización</CardDescription>
          </CardHeader>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Símbolo de Moneda"
              options={[
                { value: '$', label: '$ (Dólar / Peso)' },
                { value: '€', label: '€ (Euro)' },
                { value: 'S/', label: 'S/ (Sol Peruano)' },
                { value: 'Bs.', label: 'Bs. (Boliviano)' },
                { value: '₡', label: '₡ (Colón)' },
                { value: 'Q', label: 'Q (Quetzal)' },
                { value: 'L', label: 'L (Lempira)' },
              ]}
              error={errors.currency?.message}
              {...register('currency')}
            />

            <Input
              label="Meta de Horas Extras al Mes (hrs)"
              type="number"
              leftIcon={<Target className="w-4 h-4 text-amber-500" />}
              error={errors.monthlyGoalHours?.message}
              {...register('monthlyGoalHours', { valueAsNumber: true })}
            />
          </div>
        </Card>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <Button
            type="submit"
            variant="primary"
            className="px-6 py-2.5 shadow-md"
            isLoading={isSaving}
            leftIcon={<Save className="w-4 h-4" />}
          >
            Guardar Cambios
          </Button>
        </div>
      </form>
    </div>
  );
};
