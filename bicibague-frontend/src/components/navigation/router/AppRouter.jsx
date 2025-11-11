import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
// components
import { Header } from '@components/navigation/Header';
import { Home } from '@components/home/Home';
import { Reserves } from '@components/history/Reserves';

export const AppRouter = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/home" element={<Home />} />
        <Route path="/history/reserves" element={<Reserves />} />
      </Routes>
    </Router>
  );
};
