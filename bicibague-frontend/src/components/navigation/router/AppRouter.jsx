import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// components
import { Header } from '@components/navigation/Header';
import { Home } from '@components/home/Home';
import { Reserves } from '@components/reserves/Reserves';
import { Trips } from '@components/trips/trips';

export const AppRouter = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/reserves" element={<Reserves />} />
        <Route path="/trips" element={<Trips />} />
      </Routes>
    </Router>
  );
};
