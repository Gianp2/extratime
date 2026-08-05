import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ExtraHourRecord } from '../../types';
import { formatDateSpanish } from '../../utils/dateUtils';
import { ExtraHourForm } from '../forms/ExtraHourForm';
import { saveExtraHour, deleteExtraHour } from '../../services/extraHoursService';
import { useAuthStore } from '../../store/useAuthStore';
import { useToast } from '../ui/Toast';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Clock, Plus, Edit2, Trash2, AlertTriangle } from 'lucide-react';

interface DayDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string | null;
  dayRecords: ExtraHourRecord[];
}

export const DayDetailsModal: React.FC<DayDetailsModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  dayRecords,
}) => {
  const user = useAuthStore((s) => s.user);
  const { toast } = useToast();

  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ExtraHourRecord | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!dateStr) return null;

  const formattedTitle = formatDateSpanish(dateStr, "EEEE d 'de' MMMM, yyyy");

  const handleFormSubmit = async (formData: any) => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await saveExtraHour(
        user.uid,
        {
          date: formData.date,
          hours: formData.hours,
          entryTime: formData.entryTime,
          exitTime: formData.exitTime,
          hourType: formData.hourType,
          notes: formData.notes,
        },
        editingRecord?.id
      );
      toast('success', editingRecord ? 'Registro actualizado' : 'Registro creado con éxito');
      setIsCreatingNew(false);
      setEditingRecord(null);
      onClose();
    } catch (err) {
      toast('error', 'Error al guardar el registro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async (id: string) => {
    setIsSubmitting(true);
    try {
      await deleteExtraHour(id);
      toast('success', 'Registro eliminado');
      setIsDeletingId(null);
      if (dayRecords.length <= 1) {
        onClose();
      }
    } catch (err) {
      toast('error', 'Error al eliminar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalHoursDay = dayRecords.reduce((acc, r) => acc + r.hours, 0);

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsCreatingNew(false);
        setEditingRecord(null);
        setIsDeletingId(null);
        onClose();
      }}
      title={formattedTitle}
      description={`Visualiza o gestiona las horas extras correspondientes al día ${dateStr}`}
      maxWidth="md"
    >
      {/* If editing or creating new */}
      {isCreatingNew || editingRecord ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800">
            <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              {editingRecord ? 'Editar registro' : 'Nuevo registro de horas'}
            </h4>
            <button
              onClick={() => {
                setIsCreatingNew(false);
                setEditingRecord(null);
              }}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
            >
              Volver a la lista
            </button>
          </div>
          <ExtraHourForm
            initialValues={editingRecord || undefined}
            defaultDate={dateStr}
            onSubmit={handleFormSubmit}
            onCancel={() => {
              setIsCreatingNew(false);
              setEditingRecord(null);
            }}
            onDelete={
              editingRecord
                ? () => handleDeleteConfirm(editingRecord.id)
                : undefined
            }
            isSubmitting={isSubmitting}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Day summary */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80">
            <div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">Total en este día:</span>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{totalHoursDay} hrs</p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreatingNew(true)}
            >
              Añadir Horas
            </Button>
          </div>

          {/* List of records for this day */}
          {dayRecords.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 dark:text-zinc-400 space-y-2">
              <Clock className="w-10 h-10 mx-auto opacity-30" />
              <p className="text-sm">No hay registros cargados para este día.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => setIsCreatingNew(true)}
              >
                Registrar horas ahora
              </Button>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {dayRecords.map((r) => (
                <div
                  key={r.id}
                  className="p-3 rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between gap-3 shadow-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                        {r.hours} hrs
                      </span>
                      <Badge variant="info">{r.hourType}</Badge>
                      {r.entryTime && r.exitTime && (
                        <span className="text-xs text-zinc-500 font-mono">
                          {r.entryTime} - {r.exitTime}
                        </span>
                      )}
                    </div>
                    {r.notes && (
                      <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2">
                        {r.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => setEditingRecord(r)}
                      className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    {isDeletingId === r.id ? (
                      <div className="flex items-center gap-1">
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteConfirm(r.id)}
                          isLoading={isSubmitting}
                        >
                          Confirmar
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setIsDeletingId(null)}
                        >
                          Cancelar
                        </Button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsDeletingId(r.id)}
                        className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
};
