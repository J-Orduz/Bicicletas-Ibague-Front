import { lazy, Suspense } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
// components
import { MainLayout } from '@layouts/MainLayout';
import { ProtectedRoute } from '../router/ProtectedRoute';
// hooks
import { useAuth } from '@contexts/AuthContext';

// Lazy loading de páginas
const Home = lazy(() => import('@pages/home/Home').then(module => ({ default: module.Home })));
const Reserves = lazy(() => import('@pages/reserves/Reserves').then(module => ({ default: module.Reserves })));
const Trips = lazy(() => import('@pages/trips/trips').then(module => ({ default: module.Trips })));
const Register = lazy(() => import('@pages/auth/Register').then(module => ({ default: module.Register })));
const Login = lazy(() => import('@pages/auth/Login').then(module => ({ default: module.Login })));
const Profile = lazy(() => import('@pages/profile/Profile').then(module => ({ default: module.Profile })));
const Reports = lazy(() => import('@pages/reports/Reports').then(module => ({ default: module.Reports })));
const NotFound = lazy(() => import('@pages/notFound/NotFound').then(module => ({ default: module.NotFound })));
const Landing = lazy(() => import('@pages/landing/Landing'));

// Componente de loading
const LoadingFallback = () => (
  <div style={{
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    fontSize: '1.2rem',
    color: 'var(--text-color)',
  }}>
    Cargando...
  </div>
);

export const AppRouter = () => {
  const { user } = useAuth();
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Home />} />
            <Route path="/reserves" element={<Reserves />} />
            <Route path="/trips" element={<Trips />} />
            <Route path="/profile" element={<Profile />} />
            {user?.rol === 'admin' && (
              <Route path="/reports" element={<Reports />} />
            )}
          </Route>

          {/* Rutas de autenticación */}
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />

          {/* Landing page demo */}
          <Route path="/landing" element={<Landing />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </Router>
  );
};
