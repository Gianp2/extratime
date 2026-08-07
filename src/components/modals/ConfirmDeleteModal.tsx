import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, Clock, Calendar } from 'lucide-react';
import { ExtraHourRecord } from '../../types';
import { formatDateSpanish } from '../../utils/dateUtils';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  record: ExtraHourRecord | null;
  isLoading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  record,
  isLoading = false,
}) => {
  if (!record) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="¿Eliminar registro?"
      description="Esta acción no se puede deshacer."
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 flex items-start gap-3">
          <div className="p-2 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-300 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs space-y-1 text-rose-900 dark:text-rose-200">
            <p className="font-bold text-sm">¿Confirmas la eliminación?</p>
            <p className="text-rose-700 dark:text-rose-300">
              Se eliminará de forma permanente el registro seleccionado.
            </p>
          </div>
        </div>

        {/* Record info box */}
        <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs space-y-2">
          <div className="flex items-center justify-between text-zinc-900 dark:text-white font-bold">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500" />
              {formatDateSpanish(record.date, "dd 'de' MMMM, yyyy")}
            </span>
            <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-extrabold">
              <Clock className="w-3.5 h-3.5" />
              {record.hours} hrs ({record.hourType})
            </span>
          </div>
          {record.notes && (
            <p className="text-zinc-500 dark:text-zinc-400 italic text-[11px] border-t border-zinc-200 dark:border-zinc-800 pt-2">
              "{record.notes}"
            </p>
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
            leftIcon={<AlertTriangle className="w-4 h-4" />}
          >
            Eliminar Registro
          </Button>
        </div>
      </div>
    </Modal>
  );
};
