import React, { useEffect } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ExtraHourRecord, HourType } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';

const extraHourSchema = z.object({
  date: z.string().min(1, 'La fecha es obligatoria'),
  hours: z.number().min(0.5, 'El mínimo es 0.5 horas').max(24, 'El máximo es 24 horas'),
  entryTime: z.string().optional(),
  exitTime: z.string().optional(),
  hourType: z.enum(['normal', '50%', '100%', 'nocturna', 'feriado']),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
});

type ExtraHourFormData = z.infer<typeof extraHourSchema>;

interface ExtraHourFormProps {
  initialValues?: Partial<ExtraHourRecord>;
  defaultDate?: string;
  onSubmit: (data: ExtraHourFormData) => Promise<void>;
  onCancel?: () => void;
  onDelete?: () => Promise<void>;
  isSubmitting?: boolean;
}

export const ExtraHourForm: React.FC<ExtraHourFormProps> = ({
  initialValues,
  defaultDate,
  onSubmit,
  onCancel,
  onDelete,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<ExtraHourFormData>({
    resolver: zodResolver(extraHourSchema),
    defaultValues: {
      date: initialValues?.date || defaultDate || new Date().toISOString().split('T')[0],
      hours: initialValues?.hours ?? 2,
      entryTime: initialValues?.entryTime || '',
      exitTime: initialValues?.exitTime || '',
      hourType: initialValues?.hourType || '50%',
      notes: initialValues?.notes || '',
    },
  });

  const entryTimeWatch = useWatch({ control, name: 'entryTime' });
  const exitTimeWatch = useWatch({ control, name: 'exitTime' });

  // Auto calculate hours if entry and exit time are present
  useEffect(() => {
    if (entryTimeWatch && exitTimeWatch) {
      const [h1, m1] = entryTimeWatch.split(':').map(Number);
      const [h2, m2] = exitTimeWatch.split(':').map(Number);
      if (!isNaN(h1) && !isNaN(m1) && !isNaN(h2) && !isNaN(m2)) {
        let startMinutes = h1 * 60 + m1;
        let endMinutes = h2 * 60 + m2;
        if (endMinutes < startMinutes) {
          endMinutes += 24 * 60; // Nocturna / turno pasando medianoche
        }
        const diffMinutes = endMinutes - startMinutes;
        if (diffMinutes > 0) {
          const calcHours = Math.round((diffMinutes / 60) * 10) / 10;
          if (calcHours >= 0.5 && calcHours <= 24) {
            setValue('hours', calcHours, { shouldValidate: true });
          }
        }
      }
    }
  }, [entryTimeWatch, exitTimeWatch, setValue]);

  const hourTypeOptions: { value: HourType; label: string }[] = [
    { value: 'normal', label: 'Hora Normal' },
    { value: '50%', label: 'Hora Extra 50%' },
    { value: '100%', label: 'Hora Extra 100%' },
    { value: 'nocturna', label: 'Hora Nocturna' },
    { value: 'feriado', label: 'Hora Feriado / Festivo' },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Fecha *"
          type="date"
          error={errors.date?.message}
          {...register('date')}
        />
        <Input
          label="Horas extras *"
          type="number"
          step="0.5"
          min="0.5"
          max="24"
          placeholder="Ej. 2.5"
          error={errors.hours?.message}
          {...register('hours', { valueAsNumber: true })}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Hora de ingreso (Opcional)"
          type="time"
          error={errors.entryTime?.message}
          {...register('entryTime')}
        />
        <Input
          label="Hora de salida (Opcional)"
          type="time"
          error={errors.exitTime?.message}
          {...register('exitTime')}
        />
      </div>

      <Select
        label="Tipo de Hora *"
        options={hourTypeOptions}
        error={errors.hourType?.message}
        {...register('hourType')}
      />

      <div className="space-y-1.5">
        <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300">
          Observaciones / Notas
        </label>
        <textarea
          rows={3}
          placeholder="Comentario sobre las tareas realizadas..."
          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 dark:placeholder-zinc-600 rounded-xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 p-3"
          {...register('notes')}
        />
        {errors.notes && <p className="text-xs text-rose-500 font-medium">{errors.notes.message}</p>}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
        <div>
          {onDelete && (
            <Button type="button" variant="danger" size="sm" onClick={onDelete} disabled={isSubmitting}>
              Eliminar
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <Button type="button" variant="outline" size="sm" onClick={onCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
          )}
          <Button type="submit" variant="primary" size="sm" isLoading={isSubmitting}>
            {initialValues?.id ? 'Guardar Cambios' : 'Registrar Horas'}
          </Button>
        </div>
      </div>
    </form>
  );
};
