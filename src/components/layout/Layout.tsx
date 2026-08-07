import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { DayDetailsModal } from '../calendar/DayDetailsModal';
import { QuickRateModal } from '../modals/QuickRateModal';
import { useExtraHoursStore } from '../../store/useExtraHoursStore';
import { startNotificationScheduler } from '../../services/notificationService';

const titleMap: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/calendar': 'Calendario',
  '/quincenas': 'Resumen por Quincenas',
  '/semanas': 'Resumen por Semanas',
  '/mensual': 'Vista Mensual',
  '/anual': 'Vista Anual',
  '/estadisticas': 'Estadísticas & Analíticas',
  '/historial': 'Historial de Registros',
  '/reportes': 'Exportación & Reportes',
  '/configuracion': 'Configuración',
};

export const Layout: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isDayModalOpen = useExtraHoursStore((s) => s.isDayModalOpen);
  const selectedDate = useExtraHoursStore((s) => s.selectedDate);
  const closeDayModal = useExtraHoursStore((s) => s.closeDayModal);
  const openDayModal = useExtraHoursStore((s) => s.openDayModal);
  const records = useExtraHoursStore((s) => s.records);

  const pageTitle = titleMap[location.pathname] || 'ExtraTime';

  // Filter records for selected day
  const dayRecords = React.useMemo(() => {
    if (!selectedDate) return [];
    return records.filter((r) => r.date === selectedDate);
  }, [records, selectedDate]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  // Start PWA Notification Scheduler
  useEffect(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const hasRegisteredToday = records.some((r) => r.date === todayStr);
    startNotificationScheduler(hasRegisteredToday);
  }, [records]);

  // Keyboard Shortcuts: 'n' (new entry), 'd' (dashboard), 'c' (calendar), 's' (settings)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        openDayModal(new Date().toISOString().split('T')[0]);
      } else if (e.key === 'd' || e.key === 'D') {
        e.preventDefault();
        navigate('/dashboard');
      } else if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        navigate('/calendar');
      } else if (e.key === 'h' || e.key === 'H') {
        e.preventDefault();
        navigate('/historial');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [openDayModal, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 flex font-sans antialiased transition-colors duration-200">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-64 h-full">
            <Sidebar onCloseMobile={() => setMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-16 lg:pb-0">
        <Header pageTitle={pageTitle} onOpenMobileMenu={() => setMobileMenuOpen(true)} />

        <main className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* Mobile Bottom Bar */}
      <MobileNav />

      {/* Global Day Modal */}
      <DayDetailsModal
        isOpen={isDayModalOpen}
        onClose={closeDayModal}
        dateStr={selectedDate}
        dayRecords={dayRecords}
      />

      {/* Global Quick Rate Modal */}
      <QuickRateModal />
    </div>
  );
};
