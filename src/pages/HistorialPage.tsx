import React, { useState, useMemo } from 'react';
import { useExtraHoursStore } from '../store/useExtraHoursStore';
import { Card, CardHeader, CardTitle } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { formatDateSpanish, getDayNameSpanish } from '../utils/dateUtils';
import { getHourTypeBadgeProps } from '../utils/formatters';
import { deleteExtraHour } from '../services/extraHoursService';
import { useToast } from '../components/ui/Toast';
import { ExtraHourRecord, HourType } from '../types';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit2,
  Trash2,
  Download,
  Plus,
  Clock,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { exportToCSV, exportToExcel } from '../services/exportService';
import { ConfirmDeleteModal } from '../components/modals/ConfirmDeleteModal';

export const HistorialPage: React.FC = () => {
  const records = useExtraHoursStore((s) => s.records);
  const openDayModal = useExtraHoursStore((s) => s.openDayModal);
  const searchQuery = useExtraHoursStore((s) => s.searchQuery);
  const setSearchQuery = useExtraHoursStore((s) => s.setSearchQuery);
  const { toast } = useToast();

  const [periodFilter, setPeriodFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<'date' | 'hours'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [deletingRecord, setDeletingRecord] = useState<ExtraHourRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Filter & Search logic
  const filteredRecords = useMemo(() => {
    let list = [...records];
    const todayStr = new Date().toISOString().split('T')[0];

    // Search query filter (date, hours, notes)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (r) =>
          r.date.includes(q) ||
          String(r.hours).includes(q) ||
          r.hourType.toLowerCase().includes(q) ||
          (r.notes || '').toLowerCase().includes(q)
      );
    }

    // Period filter
    if (periodFilter === 'today') {
      list = list.filter((r) => r.date === todayStr);
    } else if (periodFilter === 'month') {
      const monthPrefix = todayStr.slice(0, 7);
      list = list.filter((r) => r.date.startsWith(monthPrefix));
    } else if (periodFilter === 'year') {
      const yearPrefix = todayStr.slice(0, 4);
      list = list.filter((r) => r.date.startsWith(yearPrefix));
    }

    // Type filter
    if (typeFilter !== 'all') {
      list = list.filter((r) => r.hourType === typeFilter);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortField === 'date') {
        return sortOrder === 'desc' ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date);
      } else {
        return sortOrder === 'desc' ? b.hours - a.hours : a.hours - b.hours;
      }
    });

    return list;
  }, [records, searchQuery, periodFilter, typeFilter, sortField, sortOrder]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredRecords.length / pageSize) || 1;
  const paginatedRecords = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredRecords.slice(start, start + pageSize);
  }, [filteredRecords, currentPage]);

  const handleDeleteConfirm = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);
    try {
      await deleteExtraHour(deletingRecord.id);
      toast('success', 'Registro eliminado correctamente');
      setDeletingRecord(null);
    } catch (err) {
      toast('error', 'Error al eliminar el registro');
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleSort = (field: 'date' | 'hours') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Filter & Action Bar */}
      <Card>
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Instant Search input */}
          <div className="w-full md:w-72 relative">
            <Input
              placeholder="Buscar por fecha, notas o horas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            <Select
              className="text-xs py-2 flex-1 sm:flex-initial sm:w-36"
              value={periodFilter}
              onChange={(e) => {
                setPeriodFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'Todos los períodos' },
                { value: 'today', label: 'Solo Hoy' },
                { value: 'month', label: 'Este Mes' },
                { value: 'year', label: 'Este Año' },
              ]}
            />

            <Select
              className="text-xs py-2 flex-1 sm:flex-initial sm:w-36"
              value={typeFilter}
              onChange={(e) => {
                setTypeFilter(e.target.value);
                setCurrentPage(1);
              }}
              options={[
                { value: 'all', label: 'Todos los tipos' },
                { value: 'normal', label: 'Normal' },
                { value: '50%', label: '50%' },
                { value: '100%', label: '100%' },
                { value: 'nocturna', label: 'Nocturna' },
                { value: 'feriado', label: 'Feriado' },
              ]}
            />

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToCSV(filteredRecords)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => exportToExcel(filteredRecords)}
                leftIcon={<Download className="w-3.5 h-3.5" />}
              >
                Excel
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Main Table Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between w-full">
            <CardTitle className="text-sm sm:text-base">
              Historial de Registros ({filteredRecords.length})
            </CardTitle>
            <div className="hidden sm:inline-flex">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={() => openDayModal(new Date().toISOString().split('T')[0])}
              >
                Nuevo Registro
              </Button>
            </div>
          </div>
        </CardHeader>

        {filteredRecords.length === 0 ? (
          <div className="text-center py-12 text-zinc-500 space-y-2">
            <Clock className="w-10 h-10 mx-auto opacity-30" />
            <p className="text-sm">No se encontraron registros de horas extras con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 select-none">
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100"
                    onClick={() => toggleSort('date')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Fecha</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold">Día</th>
                  <th
                    className="py-3 px-4 font-semibold cursor-pointer hover:text-zinc-900 dark:hover:text-zinc-100"
                    onClick={() => toggleSort('hours')}
                  >
                    <div className="flex items-center gap-1">
                      <span>Horas</span>
                      <ArrowUpDown className="w-3.5 h-3.5" />
                    </div>
                  </th>
                  <th className="py-3 px-4 font-semibold">Tipo de Hora</th>
                  <th className="py-3 px-4 font-semibold">Observaciones</th>
                  <th className="py-3 px-4 font-semibold text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
                {paginatedRecords.map((r) => {
                  const badgeProps = getHourTypeBadgeProps(r.hourType);
                  const dayName = getDayNameSpanish(r.date);
                  return (
                    <tr key={r.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        {r.date}
                      </td>
                      <td className="py-3.5 px-4 text-xs capitalize text-zinc-500 dark:text-zinc-400">
                        {dayName}
                      </td>
                      <td className="py-3.5 px-4 font-extrabold text-zinc-900 dark:text-zinc-100 whitespace-nowrap">
                        {r.hours} hrs
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${badgeProps.bgClass} ${badgeProps.textClass}`}
                        >
                          {badgeProps.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-zinc-600 dark:text-zinc-400 max-w-xs truncate">
                        {r.notes || '-'}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => openDayModal(r.date, r)}
                            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                            title="Editar"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingRecord(r)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-4 mt-4 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-500">
            <span>
              Página {currentPage} de {totalPages}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Delete confirmation modal */}
      <ConfirmDeleteModal
        isOpen={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        onConfirm={handleDeleteConfirm}
        record={deletingRecord}
        isLoading={isDeleting}
      />
    </div>
  );
};
