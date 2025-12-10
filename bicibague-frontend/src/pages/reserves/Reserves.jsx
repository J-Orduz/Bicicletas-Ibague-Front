import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
// components
import { UnlockBike } from './UnlockBike';
import { SubHeader } from '@layouts/SubHeader';
// api
import {
  useGetCurrentReservation,
  useGetReservationHistory,
  useGetReservationStats,
  useCancelReservationMutation,
} from '@api/reserves';
// icons
import {
  FaRegClock,
  FaPlus,
  FaRegCalendar,
  FaBicycle,
  FaLocationDot,
} from 'react-icons/fa6';
import { TbClockOff } from 'react-icons/tb';
import { MdOutlinePlayCircleOutline } from 'react-icons/md';
import { BsXLg } from 'react-icons/bs';
// styles
import './Reserves.scss';

export const Reserves = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  // Estados de la reserva actual y el historial
  const [currentReservation, setCurrentReservation] = useState(null);
  const [reservationHistory, setReservationHistory] = useState([]);
  const [stats, setStats] = useState(null);
  // API hooks
  const getCurrentReservation = useGetCurrentReservation();
  const getReservationHistory = useGetReservationHistory();
  const getReservationStats = useGetReservationStats();
  const cancelReservationMutation = useCancelReservationMutation();
  // Estados para el contador regresivo
  const [remainingTime, setRemainingTime] = useState('00:00:00');
  const [isExpiringSoon, setIsExpiringSoon] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isExpired, setIsExpired] = useState(false);

  // Obtener reserva actual desde la API
  useEffect(() => {
    const fetchCurrentReservation = async () => {
      try {
        const reservation = await getCurrentReservation.get();

        if (reservation.data === null) {
          setCurrentReservation(null);
          return;
        }

        const reservationData = {
          id: reservation.data.id,
          // reserveDate: reservation.data.timestamp_reserva,
          reserveDate:
            reservation.data.estado_reserva === 'programada'
              ? reservation.data.timestamp_programada
              : reservation.data.timestamp_reserva,
          reserveExpiry: reservation.data.timestamp_expiracion,
          bikeId: reservation.data.Bicicleta.id,
          bikeType: reservation.data.Bicicleta.tipo,
          estation: reservation.data.Bicicleta.Estacion.nombre,
          status: reservation.data.estado_reserva,
        };
        setCurrentReservation(reservationData);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCurrentReservation();
  }, []);

  // Obtener historial de reservas desde la API
  useEffect(() => {
    const fetchReservationHistory = async () => {
      try {
        const history = await getReservationHistory.get();

        if (!history.data || history.data.length === 0) {
          setReservationHistory([]);
          return;
        }

        const formattedHistory = history.data.map((reservation) => ({
          id: reservation.id,
          bikeId: reservation.bicicleta_id,
          bikeType: reservation.Bicicleta.tipo,
          reserveDate:
            reservation.estado_reserva === 'programada'
              ? reservation.timestamp_programada
              : reservation.timestamp_reserva,
          status: reservation.estado_reserva,
        }));

        setReservationHistory(formattedHistory);
      } catch (error) {
        console.error(error);
      }
    };

    fetchReservationHistory();
  }, []);

  // Obtener estadísticas de reservas desde la API
  useEffect(() => {
    const fetchReservationStats = async () => {
      try {
        const statsData = await getReservationStats.get();
        if (statsData.data) {
          setStats(statsData.data);
        }
      } catch (error) {
        console.error(error.errorFetchMsg || error);
      }
    };

    fetchReservationStats();
  }, []);

  // Efecto para calcular el tiempo restante de la reserva
  useEffect(() => {
    if (!currentReservation) return;

    const updateRemainingTime = () => {
      const now = new Date();
      const reserveStart = new Date(currentReservation.reserveDate);
      const reserveExpiry = new Date(currentReservation.reserveExpiry);

      // Verificar si la reserva ya ha comenzado
      if (now < reserveStart) {
        setHasStarted(false);
        return;
      }

      setHasStarted(true);

      // Calcular tiempo restante hasta la expiración
      const diff = reserveExpiry - now;

      if (diff <= 0) {
        setRemainingTime('00:00:00');
        setIsExpiringSoon(false);
        setIsExpired(true);
        return;
      }

      setIsExpired(false);

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setRemainingTime(
        `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
          2,
          '0'
        )}:${String(seconds).padStart(2, '0')}`
      );

      // Activar efecto de advertencia si queda menos de 1 minuto
      setIsExpiringSoon(diff < 60000);
    };

    // Actualizar inmediatamente
    updateRemainingTime();

    // Actualizar cada segundo
    const interval = setInterval(updateRemainingTime, 1000);

    return () => clearInterval(interval);
  }, [currentReservation]);

  const handleCancelReservation = () => {
    const confirmCancel = window.confirm(
      '¿Estás seguro de que deseas cancelar esta reserva?'
    );
    if (confirmCancel) {
      cancelReservationMutation.post({ bikeId: currentReservation.bikeId });
      setCurrentReservation(null);
    }
  };

  const handleStartTrip = () => {
    setShowUnlockModal(true);
  };

  const handleReserveNow = () => {
    navigate('/');
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completada':
        return 'status-completed';
      case 'cancelada':
        return 'status-cancelled';
      case 'activa':
        return 'status-active';
      case 'expirada':
        return 'status-lost';
      case 'programada':
        return 'status-scheduled';
      default:
        return '';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completada':
        return t('reserves.completed');
      case 'cancelada':
        return t('reserves.cancelled');
      case 'activa':
        return t('reserves.active');
      case 'expirada':
        return t('reserves.expired');
      case 'programada':
        return t('reserves.notStarted');
      default:
        return status;
    }
  };

  return (
    <>
      <div className="reserves-container">
        <SubHeader pageTitle={t('reserves.title')} />

        {/* Sección de Reserva Actual */}
        <div className="current-reservation-section">
          <h2 className="section-title">{t('reserves.currentReservation')}</h2>

          {currentReservation ? (
            <div className="current-reservation-card">
              <div className="reservation-header">
                <div className="bike-info">
                  <div className="bike-id-container">
                    <FaBicycle className="bike-icon" />
                    <h3 className="bike-id">{currentReservation.bikeId}</h3>
                  </div>
                </div>
                <span
                  className={`status-badge ${getStatusClass(
                    currentReservation.status
                  )}`}
                >
                  {getStatusText(currentReservation.status)}
                </span>
              </div>

              {/* Contador regresivo o mensajes de tiempo agotado */}
              {hasStarted && (
                <>
                  {isExpired ? (
                    <div className="reservation-expired">
                      <TbClockOff className="expired-icon" />
                      <div className="expired-content">
                        <h3 className="expired-title">¡{t('reserves.expired')}!</h3>
                        <p className="expired-subtitle">{t('reserves.expired')}</p>
                        <p className="expired-message">
                          {t('reserves.waitingStart')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`reservation-timer ${
                        isExpiringSoon ? 'expiring-soon' : ''
                      }`}
                    >
                      <FaRegClock className="timer-icon" />
                      <div className="timer-content">
                        <span className="timer-label">
                          {isExpiringSoon
                            ? t('reserves.expiringSoon')
                            : t('reserves.timeRemaining')}
                        </span>
                        <div className="timer-display">{remainingTime}</div>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div className="reservation-details">
                <div className="detail-item">
                  <FaRegCalendar className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">{t('reserves.reservationDate')}</span>
                    <span className="detail-value">
                      {formatDate(currentReservation.reserveDate)}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaRegClock className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">{t('reserves.reservationDate')}</span>
                    <span className="detail-value">
                      {formatTime(currentReservation.reserveDate)} -{' '}
                      {formatTime(currentReservation.reserveExpiry)}
                    </span>
                  </div>
                </div>
                <div className="detail-item">
                  <FaLocationDot className="detail-icon" />
                  <div className="detail-content">
                    <span className="detail-label">{t('reserves.station')}</span>
                    <span className="detail-value">
                      {currentReservation.estation}
                    </span>
                  </div>
                </div>
              </div>

              <div className="reservation-actions">
                <button
                  className="btn btn-start"
                  onClick={handleStartTrip}
                  disabled={isExpired}
                >
                  <MdOutlinePlayCircleOutline className="btn-icon" />
                  {t('reserves.startTrip')}
                </button>
                <button
                  className="btn-cancel"
                  onClick={handleCancelReservation}
                  disabled={isExpired}
                >
                  <BsXLg className="btn-icon" />
                  {t('reserves.cancel')}
                </button>
              </div>
            </div>
          ) : (
            <div className="no-reservation">
              <FaRegClock className="no-reservation-icon" />
              <p className="no-reservation-text">
                {t('reserves.noReserves')}
              </p>
              <button className="btn-reserve-now" onClick={handleReserveNow}>
                <FaPlus className="btn-icon" />
                {t('reserves.reserveNow')}
              </button>
            </div>
          )}
        </div>

        {/* Sección de Historial */}
        <div className="history-section">
          <h2 className="section-title">{t('reserves.history')}</h2>

          {/* Estadísticas */}
          {stats && (
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon total">
                  <FaBicycle />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stats.total_reservas}</span>
                  <span className="stat-label">{t('reserves.totalReservations')}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon active">
                  <MdOutlinePlayCircleOutline />
                </div>
                <div className="stat-content">
                  <span className="stat-value">
                    {stats.reservas_activas || 0}
                  </span>
                  <span className="stat-label">{t('reserves.active')}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon completed">
                  <FaRegCalendar />
                </div>
                <div className="stat-content">
                  <span className="stat-value">
                    {stats.reservas_completadas || 0}
                  </span>
                  <span className="stat-label">{t('reserves.completedReservations')}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon scheduled">
                  <FaRegClock />
                </div>
                <div className="stat-content">
                  <span className="stat-value">
                    {stats.reservas_programadas || 0}
                  </span>
                  <span className="stat-label">{t('reserves.notStarted')}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon cancelled">
                  <BsXLg />
                </div>
                <div className="stat-content">
                  <span className="stat-value">
                    {stats.reservas_canceladas || 0}
                  </span>
                  <span className="stat-label">{t('reserves.cancelledReservations')}</span>
                </div>
              </div>

              <div className="stat-card">
                <div className="stat-icon expired">
                  <TbClockOff />
                </div>
                <div className="stat-content">
                  <span className="stat-value">
                    {stats.reservas_expiradas || 0}
                  </span>
                  <span className="stat-label">{t('reserves.expired')}</span>
                </div>
              </div>
            </div>
          )}

          {reservationHistory.length > 0 ? (
            <div className="history-list">
              {reservationHistory.map((reservation) => (
                <div key={reservation.id} className="history-card">
                  <div className="history-card-header">
                    <div className="bike-info-small">
                      <FaBicycle className="bike-icon-small" />
                      <h3 className="bike-id-small">{reservation.bikeId}</h3>
                    </div>
                    <span
                      className={`status-badge ${getStatusClass(
                        reservation.status
                      )}`}
                    >
                      {getStatusText(reservation.status)}
                    </span>
                  </div>
                  <div className="history-card-body">
                    <div className="history-detail">
                      <FaRegCalendar className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">{t('trips.date')}:</span>
                        <span className="history-value">
                          {formatDate(reservation.reserveDate)}
                        </span>
                      </div>
                    </div>
                    <div className="history-detail">
                      <FaRegClock className="history-icon" />
                      <div className="history-content">
                        <span className="history-label">{t('reserves.timeRemaining')}:</span>
                        <span className="history-value">
                          {formatTime(reservation.reserveDate)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-history">
              <p>{t('reserves.noReserves')}</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de desbloqueo */}
      {showUnlockModal && currentReservation && (
        <UnlockBike
          reservation={currentReservation}
          onClose={() => setShowUnlockModal(false)}
        />
      )}
    </>
  );
};
