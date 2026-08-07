import React from 'react';
import { Navigate } from 'react-router-dom';
import { ThinkingOrb } from 'thinking-orbs';
import { useAuthStore } from '../../store/useAuthStore';

export const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const loading = useAuthStore((s) => s.loading);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-zinc-50 dark:bg-zinc-950 space-y-4">
        <ThinkingOrb state="connecting" size={64} />
        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400 tracking-wide animate-pulse">
          Iniciando ExtraTime...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
