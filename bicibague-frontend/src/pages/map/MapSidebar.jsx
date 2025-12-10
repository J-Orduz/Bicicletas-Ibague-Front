import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// icons
import { FaBicycle, FaRegClock, FaLocationDot, FaBolt, FaBatteryHalf } from 'react-icons/fa6';
import { PiSneakerFill } from 'react-icons/pi';
import { BsPersonCircle } from 'react-icons/bs';
// context / hooks
import { useAuth } from '@contexts/AuthContext';
import { useCurrency } from '@hooks/useCurrency';
// api
import { useGetAllBikes } from '@api/bikes';
import { useGetReservationStats } from '@api/reserves';
import { useGetCurrentBalance } from '@api/payments';
import { useGetCurrentTrip, useGetTripHistory } from '@api/trips';
// styles
import './MapSidebar.scss';

export const MapSidebar = ({ currentReservation, bikeStations, bikeTelemetry }) => {
  const { user } = useAuth();
  const { formatCurrency } = useCurrency();
  const { t } = useTranslation();
  const getCurrentBalance = useGetCurrentBalance();
  const getCurrentTrip = useGetCurrentTrip();
  const getTripHistory = useGetTripHistory();
  const [balance, setBalance] = useState(null);
  const [stats, setStats] = useState({ totalReserves: 0, totalTrips: 0 });
  const [currentTrip, setCurrentTrip] = useState(null);
  const [elapsedTime, setElapsedTime] = useState('00:00:00');
  const [remainingTime, setRemainingTime] = useState('00:00:00');

  const getReservationStats = useGetReservationStats();

  // Obtener estadísticas de reservas y viajes
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [reservationResponse, tripHistoryResponse] = await Promise.all([
          getReservationStats.get(),
          getTripHistory.get()
        ]);

        setStats({
          totalReserves: reservationResponse?.data?.total_reservas || 0,
          totalTrips: tripHistoryResponse?.data?.total_viajes || 0,
        });
      } catch (error) {
        console.error('Error al obtener estadísticas:', error);
        setStats({
          totalReserves: 0,
          totalTrips: 0,
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

  // Obtener viaje actual desde la API
  useEffect(() => {
    const fetchCurrentTrip = async () => {
      try {
        const response = await getCurrentTrip.get();
        if (response?.success && response?.data) {
          setCurrentTrip(response.data);
        } else {
          setCurrentTrip(null);
        }
      } catch (error) {
        console.error('Error al obtener viaje actual:', error);
        setCurrentTrip(null);
      }
    };

    fetchCurrentTrip();
  }, []);

  // Contador de tiempo transcurrido del viaje
  useEffect(() => {
    if (!currentTrip) return;

    const updateElapsedTime = () => {
      const start = new Date(currentTrip.fecha_inicio);
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

  const getBatteryClass = (battery) => {
    if (battery >= 60) return 'battery-high';
    if (battery >= 30) return 'battery-medium';
    return 'battery-low';
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
              {t('sidebar.recharge')}
            </Link>
            {/* 'Ver perfil' eliminado según petición */}
          </div>
        </div>
      </div>
      {/* Reserva Actual - Siempre visible */}
      <div className="sidebar-card reservation-card">
        <h3>{t('sidebar.activeReservation')}</h3>
        {currentReservation ? (
          <div className="reservation-info">
            <div className="info-row">
              <FaBicycle className="icon" />
              <div className="info-content">
                <span className="info-label">{t('sidebar.bike')}:</span>
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
                <span className="info-label">{t('sidebar.expiresIn')}:</span>
                <span className="info-value">{remainingTime}</span>
              </div>
            </div>
            <div className="info-row">
              <FaLocationDot className="icon" />
              <div className="info-content">
                <span className="info-label">{t('sidebar.station')}:</span>
                <span className="info-value">
                  {currentReservation.Bicicleta?.Estacion?.nombre || 'N/A'}
                </span>
              </div>
            </div>
          </div>
        ) : (
          <div className="no-data">
            <p>{t('sidebar.noActiveReservation')}</p>
          </div>
        )}
      </div>

      {/* Viaje Actual - Siempre visible */}
      <div className="sidebar-card trip-card">
        <h3>{t('sidebar.currentTrip')}</h3>
        {currentTrip ? (
          <div className="trip-info">
            <div className="trip-timer">
              <FaRegClock className="timer-icon" />
              <span className="timer-value">{elapsedTime}</span>
            </div>
            <div className="info-row-small">
              <FaBicycle className="icon-small" />
              <span>{currentTrip.bicicleta.id}</span>
            </div>
            {bikeTelemetry && bikeTelemetry.bateria !== null && (
              <div className="battery-indicator-sidebar">
                <div className={`battery-bar ${getBatteryClass(bikeTelemetry.bateria)}`}>
                  <div
                    className="battery-fill"
                    style={{ width: `${bikeTelemetry.bateria}%` }}
                  >
                    <FaBatteryHalf className="battery-icon" />
                    <span className="battery-percentage">
                      {bikeTelemetry.bateria}%
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="no-data">
            <p>{t('sidebar.noActiveTrip')}</p>
          </div>
        )}
      </div>

      {/* Estadísticas de Estaciones */}
      <div className="sidebar-card stations-card">
        <h3>{t('sidebar.stations')}</h3>
        <div className="stations-summary">
          <div className="summary-item">
            {/* <FaLocationDot className="summary-icon" /> */}
            <div className="summary-content">
              <span className="summary-value">{totalStations}</span>
              <span className="summary-label">{t('sidebar.stationsLabel')}</span>
            </div>
          </div>
          <div className="summary-item">
            {/* <FaBicycle className="summary-icon" /> */}
            <div className="summary-content">
              <span className="summary-value">{totalAvailableBikes}</span>
              <span className="summary-label">{t('sidebar.bikes')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tu Actividad */}
      <div className="sidebar-card stats-card">
        <h3>{t('sidebar.yourActivity')}</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-value">{stats.totalReserves}</span>
            <span className="stat-label">{t('sidebar.reserves')}</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.totalTrips}</span>
            <span className="stat-label">{t('sidebar.trips')}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
