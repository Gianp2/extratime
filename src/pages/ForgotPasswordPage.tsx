import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebase/config';
import { Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useToast } from '../components/ui/Toast';
import { Clock, Mail, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';

const forgotSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
  });

  const onSubmit = async (data: ForgotFormData) => {
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, data.email);
      setSent(true);
      toast('success', 'Correo de recuperación enviado');
    } catch (error: any) {
      toast('error', 'No se pudo enviar el correo de recuperación');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center items-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-zinc-100 mx-auto flex items-center justify-center text-white dark:text-zinc-900 shadow-xl">
            <Clock className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
            ExtraTime
          </h1>
        </div>

        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Recuperar Contraseña</h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Te enviaremos un enlace para restablecer tu clave
            </p>
          </div>

          {sent ? (
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-200 space-y-2">
              <p className="font-semibold">¡Enlace enviado!</p>
              <p>Revisa tu casilla de correo electrónico y sigue las instrucciones para cambiar tu contraseña.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="tu@email.com"
                leftIcon={<Mail className="w-4 h-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Button
                type="submit"
                variant="primary"
                className="w-full py-3 shadow-md font-semibold mt-2"
                isLoading={isSubmitting}
              >
                Enviar Enlace de Recuperación
              </Button>
            </form>
          )}

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Volver a iniciar sesión</span>
            </Link>
          </div>
        </div>

        <p className="text-center text-xs text-zinc-400 dark:text-zinc-500 font-medium pt-1">
          Desarrollado por <span className="font-semibold text-zinc-600 dark:text-zinc-300">Gianluca Pasquinelli</span>
        </p>
      </motion.div>
    </div>
  );
};
