import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  Layers,
  CalendarRange,
  CalendarDays,
  BarChart3,
  History,
  FileSpreadsheet,
  Settings,
  LogOut,
  Moon,
  Sun,
  Plus,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { useExtraHoursStore } from '../../store/useExtraHoursStore';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { Button } from '../ui/Button';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const user = useAuthStore((s) => s.user);
  const { effectiveTheme, toggleTheme } = useThemeStore();
  const openDayModal = useExtraHoursStore((s) => s.openDayModal);
  const navigate = useNavigate();

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Calendario', path: '/calendar', icon: Calendar },
    { label: 'Quincenas', path: '/quincenas', icon: Layers },
    { label: 'Semanas', path: '/semanas', icon: CalendarRange },
    { label: 'Vista Mensual', path: '/mensual', icon: CalendarDays },
    { label: 'Vista Anual', path: '/anual', icon: Sparkles },
    { label: 'Estadísticas', path: '/estadisticas', icon: BarChart3 },
    { label: 'Historial', path: '/historial', icon: History },
    { label: 'Reportes', path: '/reportes', icon: FileSpreadsheet },
    { label: 'Configuración', path: '/configuracion', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error(err);
    }
  };

  const handleQuickAdd = () => {
    const today = new Date().toISOString().split('T')[0];
    openDayModal(today);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <aside className="w-64 h-full bg-white dark:bg-[#0c0c0e] border-r border-zinc-200 dark:border-zinc-800 flex flex-col justify-between p-4 select-none transition-colors">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2 pt-1">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              ET
            </div>
            <div>
              <h1 className="font-bold text-xl text-zinc-900 dark:text-white tracking-tight leading-none italic">
                ExtraTime
              </h1>
              <span className="text-[10px] text-zinc-500 font-mono tracking-wider">
                PRO CONTROL
              </span>
            </div>
          </div>
        </div>

        {/* Quick Action Button */}
        <Button
          variant="primary"
          className="w-full justify-center shadow-sm py-2.5 text-xs font-bold rounded-lg"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={handleQuickAdd}
        >
          Registrar Horas
        </Button>

        {/* Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-900 text-white dark:bg-zinc-800 dark:text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
                  }`
                }
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer / User Profile & Theme Toggle */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-3">
        <div className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-indigo-500/20 border border-indigo-500/50 flex items-center justify-center text-xs font-bold text-indigo-600 dark:text-indigo-400 shrink-0">
              {user?.displayName?.[0]?.toUpperCase() || 'ET'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                {user?.displayName || 'Usuario'}
              </p>
              <p className="text-[10px] text-zinc-500 truncate">{user?.email || 'cuenta@extratime.com'}</p>
            </div>
          </div>

          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-lg text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
            title="Cambiar tema"
          >
            {effectiveTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-500 dark:text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
};
