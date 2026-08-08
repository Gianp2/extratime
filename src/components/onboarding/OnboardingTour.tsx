import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, DollarSign, Plus, BarChart3, Navigation, CheckCircle2, ChevronRight, ChevronLeft, X, HelpCircle, ArrowUp, ArrowDown } from 'lucide-react';
import { useExtraHoursStore } from '../../store/useExtraHoursStore';
import { useNavigate, useLocation } from 'react-router-dom';

const TOUR_STORAGE_KEY = 'extratime_onboarding_completed_v1';

export interface TourStep {
  title: string;
  subtitle?: string;
  description: string;
  targetSelector?: string;
  mobileTargetSelector?: string;
  route?: string;
  icon: React.ReactNode;
  actionButton?: {
    label: string;
    onClick: () => void;
  };
}

interface OnboardingTourProps {
  forceOpen?: boolean;
  onClose?: () => void;
}

export const OnboardingTour: React.FC<OnboardingTourProps> = ({ forceOpen = false, onClose }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const openRateModal = useExtraHoursStore((s) => s.openRateModal);
  const openDayModal = useExtraHoursStore((s) => s.openDayModal);

  const [isOpen, setIsOpen] = useState(() => {
    if (forceOpen) return true;
    const completed = localStorage.getItem(TOUR_STORAGE_KEY);
    return !completed;
  });

  const [currentStep, setCurrentStep] = useState(0);
  const [targetRect, setTargetRect] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    if (forceOpen) {
      setIsOpen(true);
      setCurrentStep(0);
    }
  }, [forceOpen]);

  const steps: TourStep[] = [
    {
      title: '¡Bienvenido a ExtraTime! ⏱️',
      subtitle: 'Control total de tus Horas Extras',
      description: 'Te mostraremos en pocos segundos cómo configurar tu precio por hora, registrar horas extras y consultar tus ganancias.',
      icon: <Sparkles className="w-6 h-6 text-indigo-500" />,
      route: '/dashboard',
    },
    {
      title: 'Configura tu Valor de Hora 💵',
      subtitle: 'Paso 1: Tarifa Laboral',
      description: 'Define el precio de tu hora normal. La app calculará automáticamente tus horas al 50% (x1.5), al 100% (x2) y tus totales.',
      targetSelector: '#tour-rate',
      mobileTargetSelector: '#tour-rate-mobile',
      route: '/dashboard',
      icon: <DollarSign className="w-6 h-6 text-emerald-500" />,
      actionButton: {
        label: 'Configurar Tarifa Ahora',
        onClick: () => {
          openRateModal();
        },
      },
    },
    {
      title: 'Registra tus Horas Extras ➕',
      subtitle: 'Paso 2: Carga Rápida',
      description: 'Haz clic en el botón "+" para cargar las horas extras trabajadas hoy o seleccionar cualquier fecha en el calendario.',
      targetSelector: '#tour-add-btn',
      mobileTargetSelector: '#tour-fab',
      route: '/dashboard',
      icon: <Plus className="w-6 h-6 text-indigo-500" />,
      actionButton: {
        label: 'Probar Registro Rápido',
        onClick: () => {
          openDayModal(new Date().toISOString().split('T')[0]);
        },
      },
    },
    {
      title: 'Resumen Inteligente & Ganancias 📊',
      subtitle: 'Paso 3: Tarjetas de Control',
      description: 'Visualiza tus horas totales del mes, el dinero ganado acumulado y el desglose por quincena para controlar tu liquidación.',
      targetSelector: '#tour-summary',
      route: '/dashboard',
      icon: <BarChart3 className="w-6 h-6 text-amber-500" />,
    },
    {
      title: 'Navegación & Módulos 🧭',
      subtitle: 'Paso 4: Menú de Vistas',
      description: 'Explora el Calendario interactivo, Control Quincenal, Historial de Registros con exportación a Excel y Estadísticas.',
      targetSelector: '#tour-sidebar',
      mobileTargetSelector: '#tour-nav',
      icon: <Navigation className="w-6 h-6 text-cyan-500" />,
    },
    {
      title: '¡Todo Listo para Empezar! 🎉',
      subtitle: 'Recorrido Finalizado',
      description: 'Ya puedes llevar el control exacto de tus ingresos adicionales. Puedes repetir este tutorial siempre que quieras desde Configuración.',
      icon: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
    },
  ];

  // Navigate & scroll to target element when step changes
  useEffect(() => {
    if (!isOpen) return;

    const step = steps[currentStep];

    // Auto navigate to required route if not already there
    if (step.route && location.pathname !== step.route) {
      navigate(step.route);
    }

    const updateTargetRect = () => {
      if (!step.targetSelector && !step.mobileTargetSelector) {
        setTargetRect(null);
        return;
      }

      let el: Element | null = null;
      if (window.innerWidth < 768 && step.mobileTargetSelector) {
        el = document.querySelector(step.mobileTargetSelector);
      }
      if (!el && step.targetSelector) {
        el = document.querySelector(step.targetSelector);
      }
      if (!el && step.mobileTargetSelector) {
        el = document.querySelector(step.mobileTargetSelector);
      }

      if (el) {
        // Scroll target element smoothly into view
        el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });

        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0) {
          setTargetRect({
            top: rect.top,
            left: rect.left,
            width: rect.width,
            height: rect.height,
          });
          return;
        }
      }
      setTargetRect(null);
    };

    updateTargetRect();
    const timer1 = setTimeout(updateTargetRect, 100);
    const timer2 = setTimeout(updateTargetRect, 350);

    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect);
    };
  }, [isOpen, currentStep, location.pathname]);

  const handleFinish = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
    setIsOpen(false);
    if (onClose) onClose();
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!isOpen) return null;

  const activeStep = steps[currentStep];

  // Calculate modal positioning relative to targetRect so it doesn't cover the highlighted element
  const getCardStyle = (): React.CSSProperties => {
    if (!targetRect) {
      return {}; // centered default
    }

    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    // Mobile specific placement (Top or Bottom)
    if (windowWidth < 768) {
      if (targetRect.top > windowHeight / 2) {
        // Target is in lower half -> position card at top
        return {
          position: 'fixed',
          top: '20px',
          left: '16px',
          right: '16px',
          margin: '0 auto',
        };
      } else {
        // Target is in upper half -> position card at bottom
        return {
          position: 'fixed',
          bottom: '80px',
          left: '16px',
          right: '16px',
          margin: '0 auto',
        };
      }
    }

    // Desktop positioning
    // If target is in top half, place modal below target
    if (targetRect.top < windowHeight / 2) {
      return {
        position: 'fixed',
        top: `${Math.min(targetRect.top + targetRect.height + 20, windowHeight - 340)}px`,
        left: `${Math.max(20, Math.min(targetRect.left, windowWidth - 440))}px`,
      };
    } else {
      // Target is in bottom half, place modal above target
      return {
        position: 'fixed',
        bottom: `${Math.min(windowHeight - targetRect.top + 20, windowHeight - 340)}px`,
        left: `${Math.max(20, Math.min(targetRect.left, windowWidth - 440))}px`,
      };
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden select-none pointer-events-auto">
        {/* Dark overlay: Full screen when no targetRect, or handled by spotlight box-shadow when targetRect exists */}
        {!targetRect ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-zinc-950/75 transition-opacity duration-300"
            onClick={handleFinish}
          />
        ) : (
          <div
            className="absolute inset-0 transition-opacity duration-300"
            onClick={handleFinish}
          />
        )}

        {/* Crisp Spotlight Hole around target element - 100% clear interior, dark exterior */}
        {targetRect && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: 1,
              scale: 1,
              top: targetRect.top - 8,
              left: targetRect.left - 8,
              width: targetRect.width + 16,
              height: targetRect.height + 16,
            }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="absolute rounded-2xl pointer-events-none z-50 ring-4 ring-indigo-500 dark:ring-indigo-400 shadow-[0_0_0_9999px_rgba(9,9,11,0.75)] bg-transparent"
          >
            {/* Glowing inner border frame */}
            <div className="w-full h-full rounded-xl border-2 border-indigo-400/90 animate-pulse bg-transparent" />
          </motion.div>
        )}

        {/* Card Content Tooltip Modal */}
        <div className={`absolute inset-0 z-50 pointer-events-none ${!targetRect ? 'flex items-center justify-center p-4' : ''}`}>
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, y: 15, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15, scale: 0.96 }}
            transition={{ duration: 0.2 }}
            style={getCardStyle()}
            className="pointer-events-auto w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4"
          >
            {/* Pointer direction indicator if targetRect exists */}
            {targetRect && (
              <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2.5 py-1 rounded-lg w-fit border border-indigo-200 dark:border-indigo-900">
                {targetRect.top < window.innerHeight / 2 ? (
                  <>
                    <ArrowUp className="w-3.5 h-3.5 animate-bounce" />
                    <span>Elemento señalado arriba</span>
                  </>
                ) : (
                  <>
                    <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                    <span>Elemento señalado abajo</span>
                  </>
                )}
              </div>
            )}

            {/* Header / Top */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/50 shrink-0">
                  {activeStep.icon}
                </div>
                <div>
                  {activeStep.subtitle && (
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 block">
                      {activeStep.subtitle}
                    </span>
                  )}
                  <h3 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100 leading-snug">
                    {activeStep.title}
                  </h3>
                </div>
              </div>

              <button
                onClick={handleFinish}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shrink-0"
                title="Omitir tutorial"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed">
              {activeStep.description}
            </p>

            {/* Optional Action Button inside step */}
            {activeStep.actionButton && (
              <div className="pt-1">
                <button
                  onClick={() => {
                    activeStep.actionButton?.onClick();
                  }}
                  className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{activeStep.actionButton.label}</span>
                </button>
              </div>
            )}

            {/* Footer with Step Dots and Navigation Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-zinc-100 dark:border-zinc-800">
              {/* Step Dots */}
              <div className="flex items-center gap-1.5">
                {steps.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentStep(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStep
                        ? 'w-6 bg-indigo-600 dark:bg-indigo-400'
                        : 'w-2 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300'
                    }`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {currentStep > 0 && (
                  <button
                    onClick={handlePrev}
                    className="p-2 text-xs font-semibold text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Atrás</span>
                  </button>
                )}

                <button
                  onClick={handleNext}
                  className="py-2 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-1.5"
                >
                  <span>{currentStep === steps.length - 1 ? '¡Empezar!' : 'Siguiente'}</span>
                  {currentStep < steps.length - 1 && <ChevronRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};

export const ResetTourButton: React.FC = () => {
  const triggerTour = () => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
    window.location.reload();
  };

  return (
    <button
      onClick={triggerTour}
      className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200/80 dark:border-indigo-800/80 px-3 py-2 rounded-xl transition-colors cursor-pointer"
    >
      <HelpCircle className="w-4 h-4" />
      <span>Ver Tutorial Interactivo</span>
    </button>
  );
};

