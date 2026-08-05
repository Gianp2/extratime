import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  History,
  Plus,
} from 'lucide-react';
import { useExtraHoursStore } from '../../store/useExtraHoursStore';

export const MobileNav: React.FC = () => {
  const openDayModal = useExtraHoursStore((s) => s.openDayModal);

  const handlePlus = () => {
    const today = new Date().toISOString().split('T')[0];
    openDayModal(today);
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-md border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 flex items-center justify-around shadow-lg">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-400 dark:text-zinc-500'
          }`
        }
      >
        <LayoutDashboard className="w-5 h-5" />
        <span>Inicio</span>
      </NavLink>

      <NavLink
        to="/calendar"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-400 dark:text-zinc-500'
          }`
        }
      >
        <Calendar className="w-5 h-5" />
        <span>Calendario</span>
      </NavLink>

      {/* Floating Center Action */}
      <button
        onClick={handlePlus}
        className="w-12 h-12 rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 flex items-center justify-center shadow-lg -translate-y-4 hover:scale-105 transition-transform"
        aria-label="Registrar"
      >
        <Plus className="w-6 h-6" />
      </button>

      <NavLink
        to="/quincenas"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-400 dark:text-zinc-500'
          }`
        }
      >
        <Layers className="w-5 h-5" />
        <span>Quincenas</span>
      </NavLink>

      <NavLink
        to="/historial"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 text-[10px] font-medium transition-colors ${
            isActive ? 'text-zinc-900 dark:text-zinc-100 font-bold' : 'text-zinc-400 dark:text-zinc-500'
          }`
        }
      >
        <History className="w-5 h-5" />
        <span>Historial</span>
      </NavLink>
    </div>
  );
};
