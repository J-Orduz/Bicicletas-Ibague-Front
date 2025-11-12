import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
// components
import { MainLayout } from '@layouts/MainLayout';
import { Home } from '@pages/home/Home';
import { Reserves } from '@pages/reserves/Reserves';
import { Trips } from '@pages/trips/trips';
import { Register } from '@pages/auth/Register';
import { Login } from '@pages/auth/Login';
import { NotFound } from '../pages/notFound/NotFound';
import { Profile } from '@pages/profile/Profile';

export const AppRouter = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Home />} />
          <Route path="/reserves" element={<Reserves />} />
          <Route path="/trips" element={<Trips />} />
          <Route path="/profile" element={<Profile />} />
        </Route>

        {/* Rutas de autenticación */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};
