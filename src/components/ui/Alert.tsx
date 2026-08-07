import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, Info, Sparkles, X } from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger' | 'indigo';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  onClose?: () => void;
  actions?: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  icon,
  onClose,
  actions,
  className = '',
}) => {
  const styles = {
    info: {
      bg: 'bg-blue-50/80 dark:bg-blue-950/40',
      border: 'border-blue-200/80 dark:border-blue-800/60',
      text: 'text-blue-900 dark:text-blue-100',
      subtext: 'text-blue-700 dark:text-blue-300',
      defaultIcon: <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />,
    },
    success: {
      bg: 'bg-emerald-50/80 dark:bg-emerald-950/40',
      border: 'border-emerald-200/80 dark:border-emerald-800/60',
      text: 'text-emerald-900 dark:text-emerald-100',
      subtext: 'text-emerald-700 dark:text-emerald-300',
      defaultIcon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
    },
    warning: {
      bg: 'bg-amber-50/80 dark:bg-amber-950/40',
      border: 'border-amber-200/80 dark:border-amber-800/60',
      text: 'text-amber-900 dark:text-amber-100',
      subtext: 'text-amber-700 dark:text-amber-300',
      defaultIcon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
    },
    danger: {
      bg: 'bg-rose-50/80 dark:bg-rose-950/40',
      border: 'border-rose-200/80 dark:border-rose-800/60',
      text: 'text-rose-900 dark:text-rose-100',
      subtext: 'text-rose-700 dark:text-rose-300',
      defaultIcon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
    },
    indigo: {
      bg: 'bg-indigo-50/80 dark:bg-indigo-950/40',
      border: 'border-indigo-200/80 dark:border-indigo-800/60',
      text: 'text-indigo-900 dark:text-indigo-100',
      subtext: 'text-indigo-700 dark:text-indigo-300',
      defaultIcon: <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />,
    },
  };

  const currentStyle = styles[variant];

  return (
    <div
      className={`p-4 rounded-2xl border backdrop-blur-xs flex items-start gap-3 transition-all ${currentStyle.bg} ${currentStyle.border} ${className}`}
    >
      {icon || currentStyle.defaultIcon}
      <div className="flex-1 min-w-0 text-xs">
        {title && <h5 className={`font-bold text-sm mb-0.5 ${currentStyle.text}`}>{title}</h5>}
        <div className={`leading-relaxed ${currentStyle.subtext}`}>{children}</div>
        {actions && <div className="mt-2.5 flex items-center gap-2 flex-wrap">{actions}</div>}
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors shrink-0"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
