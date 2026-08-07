import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle2, AlertCircle, Smartphone, Send, Clock, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useToast } from '../ui/Toast';
import {
  getNotificationPermission,
  requestNotificationPermission,
  testDeviceNotification,
  getReminderConfig,
  saveReminderConfig,
  isNotificationSupported,
  ReminderConfig,
} from '../../services/notificationService';

export const NotificationSettingsCard: React.FC = () => {
  const { toast } = useToast();
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [config, setConfig] = useState<ReminderConfig>(getReminderConfig());
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setPermission(getNotificationPermission());
  }, []);

  const handleRequestPermission = async () => {
    const res = await requestNotificationPermission();
    setPermission(res);
    if (res === 'granted') {
      toast('success', '¡Notificaciones activadas correctamente en este dispositivo!');
    } else if (res === 'denied') {
      toast('error', 'Permiso denegado. Habilita las notificaciones en la configuración de tu navegador.');
    }
  };

  const handleTestNotification = async () => {
    setIsTesting(true);
    try {
      const success = await testDeviceNotification();
      if (success) {
        toast('success', '¡Notificación enviada a tu dispositivo!');
      } else {
        toast('warning', 'Asegúrate de permitir notificaciones en tu navegador.');
      }
    } catch {
      toast('error', 'Error al enviar notificación de prueba');
    } finally {
      setIsTesting(false);
    }
  };

  const handleUpdateConfig = (updates: Partial<ReminderConfig>) => {
    const updated = saveReminderConfig(updates);
    setConfig(updated);
    toast('info', 'Preferencia de recordatorio actualizada');
  };

  return (
    <Card className="space-y-5 border-indigo-100 dark:border-zinc-800">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <CardTitle>Notificaciones & Recordatorios en Celular</CardTitle>
              <CardDescription>Recibe avisos automáticos para no olvidar anotar tus horas extras</CardDescription>
            </div>
          </div>

          {/* Status Badge */}
          {permission === 'granted' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Activas en Celular
            </span>
          )}
          {permission === 'denied' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 text-xs font-semibold">
              <BellOff className="w-3.5 h-3.5" />
              Bloqueadas
            </span>
          )}
          {permission === 'default' && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 text-xs font-semibold">
              <AlertCircle className="w-3.5 h-3.5" />
              Sin Configurar
            </span>
          )}
        </div>
      </CardHeader>

      {!isNotificationSupported() ? (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300">
          Este navegador no soporta la API de notificaciones directa. Para mejor soporte en celular, instala ExtraTime en tu pantalla de inicio como App (PWA).
        </div>
      ) : (
        <div className="space-y-4">
          {/* Permission Activation Banner */}
          {permission !== 'granted' ? (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border border-indigo-200 dark:border-indigo-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  Activa los avisos reales en tu celular
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Permite que ExtraTime envíe avisos emergentes directo a tu barra de notificaciones del celular.
                </p>
              </div>
              <Button
                type="button"
                variant="primary"
                onClick={handleRequestPermission}
                className="shrink-0 text-xs px-4 py-2"
                leftIcon={<Bell className="w-4 h-4" />}
              >
                Permitir Notificaciones
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/50">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div className="text-xs">
                  <p className="font-bold text-zinc-900 dark:text-white">Permisos concedidos en tu dispositivo</p>
                  <p className="text-zinc-500 dark:text-zinc-400">Tu celular puede recibir alertas de ExtraTime.</p>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestNotification}
                isLoading={isTesting}
                leftIcon={<Send className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                className="text-xs"
              >
                Probar en mi celular
              </Button>
            </div>
          )}

          {/* Reminder Schedule Form */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-900 dark:text-white flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={config.enabled}
                  onChange={(e) => handleUpdateConfig({ enabled: e.target.checked })}
                  className="w-4 h-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                />
                Activar Recordatorio Diario Automático
              </label>

              <span className="text-[11px] text-zinc-500 font-mono">
                {config.enabled ? 'Aviso diario habilitado' : 'Aviso desactivado'}
              </span>
            </div>

            {config.enabled && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Hora del Recordatorio
                  </label>
                  <div className="relative">
                    <Input
                      type="time"
                      value={config.time}
                      onChange={(e) => handleUpdateConfig({ time: e.target.value })}
                      leftIcon={<Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
                      className="bg-white dark:bg-zinc-900"
                    />
                  </div>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    Recibirás el aviso todos los días a esta hora.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                    Mensaje de la Notificación
                  </label>
                  <Input
                    type="text"
                    value={config.message}
                    onChange={(e) => handleUpdateConfig({ message: e.target.value })}
                    placeholder="Ej: Anota tus horas extras de hoy"
                    className="bg-white dark:bg-zinc-900"
                  />
                  <div className="mt-2 flex items-center gap-1.5">
                    <input
                      type="checkbox"
                      id="onlyIfNoRecords"
                      checked={config.onlyIfNoRecords}
                      onChange={(e) => handleUpdateConfig({ onlyIfNoRecords: e.target.checked })}
                      className="w-3.5 h-3.5 rounded border-zinc-300 text-indigo-600"
                    />
                    <label htmlFor="onlyIfNoRecords" className="text-[11px] text-zinc-600 dark:text-zinc-400 cursor-pointer select-none">
                      Avisar solo si aún no registré horas hoy
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};
