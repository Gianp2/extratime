import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/Toast';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/layout/Layout';

import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';

import { DashboardPage } from './pages/DashboardPage';
import { CalendarPage } from './pages/CalendarPage';
import { QuincenasPage } from './pages/QuincenasPage';
import { SemanasPage } from './pages/SemanasPage';
import { MensualPage } from './pages/MensualPage';
import { AnualPage } from './pages/AnualPage';
import { EstadisticasPage } from './pages/EstadisticasPage';
import { HistorialPage } from './pages/HistorialPage';
import { CalculadoraPage } from './pages/CalculadoraPage';
import { ReportesPage } from './pages/ReportesPage';
import { ConfiguracionPage } from './pages/ConfiguracionPage';

export function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected App Shell */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="quincenas" element={<QuincenasPage />} />
              <Route path="semanas" element={<SemanasPage />} />
              <Route path="mensual" element={<MensualPage />} />
              <Route path="anual" element={<AnualPage />} />
              <Route path="estadisticas" element={<EstadisticasPage />} />
              <Route path="historial" element={<HistorialPage />} />
              <Route path="calculadora" element={<CalculadoraPage />} />
              <Route path="reportes" element={<ReportesPage />} />
              <Route path="configuracion" element={<ConfiguracionPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
