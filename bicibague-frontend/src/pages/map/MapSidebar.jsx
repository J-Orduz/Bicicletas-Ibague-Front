import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// icons
import { FaBicycle, FaRegClock, FaLocationDot, FaBolt } from 'react-icons/fa6';
import { PiSneakerFill } from 'react-icons/pi';
import { BsPersonCircle } from 'react-icons/bs';
// context / hooks
import { useAuth } from '@contexts/AuthContext';
import { useCurrency } from '@hooks/useCurrency';
// api
import { useGetAllBikes } from '@api/bikes';
import { useGetReservationStats } from '@api/reserves';
import { useGetCurrentBalance } from '@api/payments';
// styles
import './MapSidebar.scss';

export const MapSidebar = ({ currentReservation, bikeStations }) => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const getCurrentBalance = useGetCurrentBalance();
  const [balance, setBalance] = useState(null);
  const [stats, setStats] = useState({ totalReserves: 0, totalTrips: 0 });
  const [currentTrip, setCurrentTrip] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [remainingTime, setRemainingTime] = useState('00:00:00');

  const getReservationStats = useGetReservationStats();

  // Obtener estadísticas de reservas
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await getReservationStats.get();

        const tripHistory = localStorage.getItem('tripHistory');
        const trips = tripHistory ? JSON.parse(tripHistory) : [];

        if (response.data) {
          setStats({
            totalReserves: response.data.total_reservas || 0,
            totalTrips: trips.length || 0,
          });
        }
      } catch (error) {
        // Fallback a historial local
        const tripHistory = localStorage.getItem('tripHistory');
        const trips = tripHistory ? JSON.parse(tripHistory) : [];
        setStats({
          totalReserves: 0,
          totalTrips: trips.length,
        });
      }
    };

    fetchStats();
  }, []);

  // Obtener saldo actual para mostrar en el sidebar
  useEffect(() => {
    const fetchBalance = async () => {
      try {
        const balanceData = await getCurrentBalance.get();
        setBalance(balanceData?.usuario?.saldo ?? null);
      } catch (error) {
        // no bloquear la UI si falla
        setBalance(null);
      }
    };

    fetchBalance();
  }, []);

  // Obtener viaje actual desde localStorage
  useEffect(() => {
    const savedTrip = localStorage.getItem('currentTrip');
    if (savedTrip) {
      setCurrentTrip(JSON.parse(savedTrip));
    }
  }, []);

  // Contador de tiempo transcurrido del viaje
  useEffect(() => {
    if (!currentTrip) return;

    const updateElapsedTime = () => {
      const start = new Date(currentTrip.startTime);
      const now = new Date();
      const diff = now - start;

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setElapsedTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
          2,
          '0'
        )}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateElapsedTime();
    const interval = setInterval(updateElapsedTime, 1000);

    return () => clearInterval(interval);
  }, [currentTrip]);

  // Contador de tiempo restante de la reserva
  useEffect(() => {
    if (!currentReservation || !currentReservation.timestamp_expiracion) return;

    const updateRemainingTime = () => {
      const expiration = new Date(currentReservation.timestamp_expiracion);
      const now = new Date();
      const diff = expiration - now;

      if (diff <= 0) {
        setRemainingTime('Expirada');
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemainingTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
          2,
          '0'
        )}:${String(seconds).padStart(2, '0')}`
      );
    };

    updateRemainingTime();
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [currentReservation]);

  // Calcular totales de estaciones
  const totalStations = bikeStations?.length || 0;

  // obtener total de bicicletas disponibles
  const [totalAvailableBikes, setTotalAvailableBikes] = useState(0);
  const getAllBikes = useGetAllBikes();

  useEffect(() => {
    const fetchAllBikes = async () => {
      try {
        const bikesData = await getAllBikes.get();
        
        // total bicicletas disponibles
        const availableBikes = bikesData.filter(
          (bike) => bike.estado === 'Disponible'
        );
        setTotalAvailableBikes(availableBikes.length);
      } catch (error) {
        console.error(error)
      }
    };

    fetchAllBikes();
  }, []);

  const getBikeTypeIcon = (type) => {
    return type === 'Electrica' || type === 'electric' ? (
      <FaBolt className="bike-type-icon" />
    ) : (
      <PiSneakerFill className="bike-type-icon" />
    );
  };

  return (
    <aside className="map-sidebar">
      {/* User header */}
      <div className="sidebar-card user-card">
        <div className="user-center">
          <div className="user-icon-name">
            <BsPersonCircle className="user-icon" />
            <div className="user-info">
              <span className="user-name">
                {user?.nombre || user?.userName || 'Usuario'}
              </span>
              <span className="user-balance">
                {balance !== null ? formatCurrency(balance) : '-'}
              </span>
            </div>
          </div>
          <div className="user-actions">
            <Link to="/profile" className="btn-quick-recharge">
              Recargar
            </Link>
            {/* 'Ver perfil' eliminado según petición */}
          </div>
        </div>
      </div>
      {/* Reserva Actual - Siempre visible */}
      <div className="sidebar-card reservation-card">
        <h3>Reserva Activa</h3>
        {currentReservation ? (
          <div className="reservation-info">
            <div className="info-row">
              <FaBicycle className="icon" />
              <div className="info-content">
                <span className="info-label">Bicicleta:</span>
                <span className="info-value">
                  {currentReservation.Bicicleta?.id || 'N/A'}
                  {currentReservation.Bicicleta?.tipo &&
                    getBikeTypeIcon(currentReservation.Bicicleta.tipo)}
                </span>
              </div>
            </div>
            <div className="info-row">
              <FaRegClock className="icon" />
              <div className="info-content">
                <span className="info-label">Expira en:</span>
                <span className="info-value">{remainingTime}</span>
              </div>
            </div>
            <div className="info-row">
              <FaLocationDot className="icon" />
              <div className="info-content">
                <span className="info-label">Estación:</span>
                <span className="info-value">
                  {currentReservation.Bicicleta?.Estacion?.nombre || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>No tienes ninguna reserva activa</p>
          </div>
        )}
      </div>

      {/* Viaje Actual - Siempre visible */}
      <div className="sidebar-card trip-card">
        <h3>Viaje Actual</h3>
        {currentTrip ? (
          <div className="trip-info">
            <div className="trip-timer">
              <FaRegClock className="timer-icon" />
              <span className="timer-value">{elapsedTime}</span>
            </div>
            <div className="info-row-small">
              <FaBicycle className="icon-small" />
              <span>{currentTrip.bikeId}</span>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>No tienes ningún viaje activo</p>
          </div>
        )}
      </div>

      {/* Estadísticas de Estaciones */}
      <div className="sidebar-card stations-card">
        <h3>Estaciones</h3>
        <div className="stations-summary">
          <div className="summary-item">
            {/* <FaLocationDot className="summary-icon" /> */}
            <div className="summary-content">
              <span className="summary-value">{totalStations}</span>
              <span className="summary-label">Estaciones</span>
            </div>
          </div>
          <div className="summary-item">
            {/* <FaBicycle className="summary-icon" /> */}
            <div className="summary-content">
              <span className="summary-value">{totalAvailableBikes}</span>
              <span className="summary-label">Bicicletas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tu Actividad */}
      <div className="sidebar-card stats-card">
        <h3>Tu Actividad</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.totalReserves}</span>
            <span className="stat-label">Reservas</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.totalTrips}</span>
            <span className="stat-label">Viajes</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
