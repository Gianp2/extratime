// Notification Service for ExtraTime Device & PWA Push Notifications

export interface ReminderConfig {
  enabled: boolean;
  time: string; // HH:mm format, e.g., "20:00"
  onlyIfNoRecords: boolean;
  message: string;
}

const DEFAULT_CONFIG: ReminderConfig = {
  enabled: true,
  time: '20:00',
  onlyIfNoRecords: true,
  message: '⏱️ ¡No olvides registrar tus horas extras de hoy!',
};

const STORAGE_KEY = 'extratime_reminder_config';
const LAST_NOTIFIED_KEY = 'extratime_last_notified_date';

// 1. Service Worker Registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.register('/sw.js');
      return reg;
    } catch (error) {
      console.warn('Service Worker registration failed:', error);
      return null;
    }
  }
  return null;
}

// 2. Check if notifications are supported
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

// 3. Get current permission status
export function getNotificationPermission(): NotificationPermission | 'unsupported' {
  if (!isNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

// 4. Request Permission
export async function requestNotificationPermission(): Promise<NotificationPermission | 'unsupported'> {
  if (!isNotificationSupported()) return 'unsupported';
  
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      await registerServiceWorker();
      // Send welcome test notification
      await sendDeviceNotification(
        'ExtraTime ⏱️ ¡Notificaciones Activadas!',
        {
          body: 'Perfecto. Recibirás recordatorios en tu celular para anotar tus horas extras.',
          icon: 'https://img.icons8.com/isometric/512/clock.png',
          tag: 'welcome-notification',
        }
      );
    }
    return permission;
  } catch (err) {
    console.error('Error requesting notification permission:', err);
    return Notification.permission;
  }
}

// 5. Send Real System/Device Notification
export async function sendDeviceNotification(
  title: string,
  options: NotificationOptions = {}
): Promise<boolean> {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const defaultOptions: Record<string, any> = {
    icon: 'https://img.icons8.com/isometric/512/clock.png',
    badge: 'https://img.icons8.com/isometric/512/clock.png',
    vibrate: [200, 100, 200],
    renotify: true,
    tag: 'extratime-notification',
    ...options,
  };

  try {
    // Try via Service Worker (Best for Mobile PWA)
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && 'showNotification' in reg) {
        await reg.showNotification(title, defaultOptions);
        return true;
      }
    }

    // Fallback to standard Notification API
    new Notification(title, defaultOptions);
    return true;
  } catch (error) {
    console.error('Failed to trigger notification:', error);
    return false;
  }
}

// 6. Test Instant Notification
export async function testDeviceNotification(): Promise<boolean> {
  if (Notification.permission !== 'granted') {
    const res = await requestNotificationPermission();
    if (res !== 'granted') return false;
  }

  return sendDeviceNotification('ExtraTime ⏱️ Notificación de Prueba', {
    body: '¡Excelente! Las notificaciones reales están activas y funcionando en tu celular.',
    tag: 'test-notification',
  });
}

// 7. Get & Save Reminder Configuration
export function getReminderConfig(): ReminderConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch {
    // Ignore parse errors
  }
  return DEFAULT_CONFIG;
}

export function saveReminderConfig(config: Partial<ReminderConfig>): ReminderConfig {
  const current = getReminderConfig();
  const updated = { ...current, ...config };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore storage errors
  }
  return updated;
}

// 8. Daily Scheduler Check (Runs periodically in app)
let schedulerInterval: number | null = null;

export function startNotificationScheduler(
  hasRegisteredToday: boolean = false,
  latestRecordTimeMs?: number
): void {
  if (schedulerInterval) {
    clearInterval(schedulerInterval);
  }

  // Register service worker on startup
  registerServiceWorker();

  // Check every 40 seconds
  schedulerInterval = window.setInterval(() => {
    if (!isNotificationSupported() || Notification.permission !== 'granted') return;

    const config = getReminderConfig();
    if (!config.enabled) return;

    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const currentTime = `${hours}:${minutes}`;
    
    // YYYY-MM-DD
    const todayStr = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
    const lastNotified = localStorage.getItem(LAST_NOTIFIED_KEY);

    if (currentTime === config.time && lastNotified !== todayStr) {
      if (config.onlyIfNoRecords) {
        // Si ya registró hoy o registró hace menos de 20 horas, no molestar
        if (hasRegisteredToday) return;

        if (latestRecordTimeMs && !isNaN(latestRecordTimeMs)) {
          const hoursPassed = (now.getTime() - latestRecordTimeMs) / (1000 * 60 * 60);
          if (hoursPassed < 20) {
            return;
          }
        }
      }

      sendDeviceNotification('ExtraTime ⏱️ Recordatorio de Horas', {
        body: config.message || '¡No olvides registrar tus horas extras de hoy!',
        tag: 'daily-reminder',
      });

      try {
        localStorage.setItem(LAST_NOTIFIED_KEY, todayStr);
      } catch {
        // Ignore
      }
    }
  }, 40000);
}
