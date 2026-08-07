import React, { useState, useEffect } from 'react';
import { Bell, Smartphone, Send, X, CheckCircle2 } from 'lucide-react';
import {
  getNotificationPermission,
  requestNotificationPermission,
  testDeviceNotification,
} from '../../services/notificationService';
import { useToast } from '../ui/Toast';

export const NotificationBanner: React.FC = () => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('granted');
  const [dismissed, setDismissed] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    const perm = getNotificationPermission();
    setPermission(perm);
    const hidden = localStorage.getItem('extratime_banner_dismissed');
    if (hidden === 'true') {
      setDismissed(true);
    }
  }, []);

  const handleRequest = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      toast('success', '¡Notificaciones activadas en tu celular!');
    }
  };

  const handleTest = async () => {
    setIsTesting(true);
    try {
      await testDeviceNotification();
      toast('success', '¡Notificación enviada a tu pantalla!');
    } finally {
      setIsTesting(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('extratime_banner_dismissed', 'true');
  };

  if (dismissed || permission === 'unsupported') return null;

  return (
    <div className="mb-6 rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-950 to-zinc-900 border border-indigo-500/30 text-white p-4 shadow-lg relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 relative z-10">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 shrink-0 mt-0.5 sm:mt-0">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              Recordatorios Reales en tu Celular
              {permission === 'granted' && (
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-semibold inline-flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Activo
                </span>
              )}
            </h4>
            <p className="text-xs text-indigo-200/90 mt-0.5">
              {permission === 'granted'
                ? 'ExtraTime enviará alertas a tu celular a la hora configurada.'
                : 'Activa los avisos para que la app te recuerde anotar tus horas extras antes de terminar el día.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          {permission === 'granted' ? (
            <button
              onClick={handleTest}
              disabled={isTesting}
              className="px-3 py-1.5 rounded-xl bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-indigo-200 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Send className="w-3.5 h-3.5 text-indigo-300" />
              Probar en mi celular
            </button>
          ) : (
            <button
              onClick={handleRequest}
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-sm flex items-center gap-1.5 transition-colors"
            >
              <Bell className="w-3.5 h-3.5" />
              Activar Notificaciones
            </button>
          )}

          <button
            onClick={handleDismiss}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Ocultar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
