import React, { useState } from 'react';
import { Menu, Search, Bell, Plus, X, DollarSign, HelpCircle } from 'lucide-react';
import { useExtraHoursStore } from '../../store/useExtraHoursStore';
import { Button } from '../ui/Button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenMobileMenu: () => void;
  pageTitle?: string;
  onStartTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu, pageTitle = 'Dashboard', onStartTour }) => {
  const openDayModal = useExtraHoursStore((s) => s.openDayModal);
  const openRateModal = useExtraHoursStore((s) => s.openRateModal);
  const settings = useExtraHoursStore((s) => s.settings);
  const searchQuery = useExtraHoursStore((s) => s.searchQuery);
  const setSearchQuery = useExtraHoursStore((s) => s.setSearchQuery);
  const records = useExtraHoursStore((s) => s.records);
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);

  // Generate smart alerts based on records
  const notifications = React.useMemo(() => {
    const list = [];
    const today = new Date().toISOString().split('T')[0];
    const hasToday = records.some((r) => r.date === today);

    if (!hasToday) {
      list.push({
        id: 'no-log-today',
        title: 'Recordatorio diario',
        message: 'Aún no has registrado horas extras para el día de hoy.',
        time: 'Hoy',
        type: 'reminder',
      });
    }

    const thisMonthHours = records
      .filter((r) => r.date.startsWith(today.slice(0, 7)))
      .reduce((a, b) => a + b.hours, 0);

    if (thisMonthHours >= 20) {
      list.push({
        id: 'goal-reached',
        title: '¡Excelente rendimiento!',
        message: `Llevas acumuladas ${thisMonthHours} hrs este mes.`,
        time: 'Reciente',
        type: 'success',
      });
    }

    return list;
  }, [records]);

  const handleQuickAdd = () => {
    const todayStr = new Date().toISOString().split('T')[0];
    openDayModal(todayStr);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    if (e.target.value.trim() && window.location.pathname !== '/historial') {
      navigate('/historial');
    }
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#09090b]/90 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-800 px-3 sm:px-8 flex items-center justify-between gap-2 sm:gap-4 transition-colors">
      {/* Left side: Mobile menu toggle & page title */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden p-1.5 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
          aria-label="Abrir menú"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-sm sm:text-lg font-bold text-zinc-900 dark:text-white tracking-tight truncate max-w-[180px] sm:max-w-none">
          {pageTitle}
        </h2>
      </div>

      {/* Center: Search Input */}
      <div className="hidden md:flex items-center flex-1 max-w-xs relative">
        <Search className="w-4 h-4 text-zinc-400 dark:text-zinc-500 absolute left-3 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={handleSearchChange}
          placeholder="Buscar fecha, horas o nota..."
          className="w-full pl-9 pr-3 py-1.5 text-xs bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:border-indigo-500/50 text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-500 rounded-xl focus:outline-none transition-all"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-2.5 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Right side: Quick Add CTA & Notifications */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        <div id="tour-rate" className="hidden md:inline-flex">
          <Button
            variant="outline"
            size="sm"
            className="border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-200 text-xs font-medium rounded-lg px-3 py-2"
            leftIcon={<DollarSign className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />}
            onClick={openRateModal}
            title="Configurar Precio de la Hora"
          >
            {settings.rateNormal > 0 ? `${settings.currency || '$'}${settings.rateNormal}/h` : 'Precio / Hora'}
          </Button>
        </div>

        <div id="tour-add-btn" className="hidden sm:inline-flex">
          <Button
            variant="primary"
            size="sm"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg px-2.5 sm:px-4 py-1.5"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleQuickAdd}
          >
            <span>Registrar Horas</span>
          </Button>
        </div>

        {/* Tutorial Button */}
        {onStartTour && (
          <button
            onClick={onStartTour}
            className="p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Ver Tutorial Interactivo"
          >
            <HelpCircle className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
          </button>
        )}

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            title="Notificaciones"
          >
            <Bell className="w-5 h-5" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-zinc-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-xl p-4 z-50">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800 mb-3">
                <h4 className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                  Notificaciones & Recordatorios
                </h4>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xs"
                >
                  Cerrar
                </button>
              </div>

              {notifications.length === 0 ? (
                <p className="text-xs text-zinc-500 text-center py-4">No tienes notificaciones pendientes.</p>
              ) : (
                <div className="space-y-2">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-zinc-900 dark:text-zinc-100">{n.title}</span>
                        <span className="text-[10px] text-zinc-400">{n.time}</span>
                      </div>
                      <p className="text-zinc-600 dark:text-zinc-400 leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
